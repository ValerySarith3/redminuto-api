"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donacionesRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const comprobante_1 = require("../lib/comprobante");
const usuarioPublico_1 = require("../lib/usuarioPublico");
const historial_1 = require("../lib/historial");
const pagos_routes_1 = require("./pagos.routes");
exports.donacionesRouter = (0, express_1.Router)();
const ESTADOS_DONACION = ["PENDIENTE", "COMPLETADA", "FALLIDA"];
function conComprobante(donacion) {
    return { ...donacion, numeroComprobante: (0, comprobante_1.numeroComprobante)(donacion.id) };
}
function esErrorUnico(e) {
    return typeof e === "object" && e !== null && "code" in e && e.code === "P2002";
}
exports.donacionesRouter.get("/", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (_req, res) => {
    await (0, pagos_routes_1.sincronizarPagosPendientes)();
    const donaciones = await prisma_1.prisma.donacion.findMany({
        include: { campana: { include: { programa: true } }, donante: usuarioPublico_1.usuarioPublico, pago: true },
        orderBy: { creadoEn: "desc" },
    });
    res.json(donaciones.map(conComprobante));
});
exports.donacionesRouter.get("/mias", auth_1.requireAuth, async (req, res) => {
    await (0, pagos_routes_1.sincronizarPagosPendientes)(req.user.id);
    const donaciones = await prisma_1.prisma.donacion.findMany({
        where: { donanteId: req.user.id },
        include: { campana: { include: { programa: true } } },
        orderBy: { creadoEn: "desc" },
    });
    res.json(donaciones.map(conComprobante));
});
exports.donacionesRouter.get("/:id", auth_1.requireAuth, async (req, res) => {
    const donacion = await prisma_1.prisma.donacion.findUnique({
        where: { id: Number(req.params.id) },
        include: { campana: true, donante: usuarioPublico_1.usuarioPublico, pago: true },
    });
    if (!donacion)
        return res.status(404).json({ error: "Donación no encontrada" });
    if (donacion.donanteId !== req.user.id && req.user.rol !== "ADMIN") {
        return res.status(403).json({ error: "No tienes permiso para ver esta donación" });
    }
    const historial = await (0, historial_1.historialDe)("DONACION", [donacion.id]);
    res.json({ ...conComprobante(donacion), historial });
});
exports.donacionesRouter.post("/", auth_1.requireAuth, async (req, res) => {
    const { monto, canal, campanaId, referencia } = req.body;
    if (!monto || !canal || !campanaId || !referencia) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    const buscarExistente = () => prisma_1.prisma.pago.findUnique({
        where: { referencia: String(referencia) },
        include: { donacion: { include: { campana: true } } },
    });
    if (canal === "PASARELA" && (0, pagos_routes_1.pasarelaConfigurada)()) {
        return res.status(400).json({ error: "Los pagos con tarjeta o PSE se hacen a través de PayU" });
    }
    const existente = await buscarExistente();
    if (existente)
        return res.json(conComprobante(existente.donacion));
    const aprobadaPorPasarela = canal === "PASARELA";
    const estado = aprobadaPorPasarela ? "COMPLETADA" : "PENDIENTE";
    try {
        const donacion = await prisma_1.prisma.$transaction(async (tx) => {
            const nueva = await tx.donacion.create({
                data: {
                    monto,
                    canal,
                    estado,
                    campanaId: Number(campanaId),
                    donanteId: req.user.id,
                },
                include: { campana: true },
            });
            await tx.pago.create({
                data: {
                    referencia: String(referencia),
                    metodo: canal,
                    estado: aprobadaPorPasarela ? "APROBADO" : "PENDIENTE",
                    respuestaPasarela: aprobadaPorPasarela
                        ? JSON.stringify({ sandbox: true, codigo: "APPROVED", mensaje: "Transacción aprobada (simulada)" })
                        : null,
                    donacionId: nueva.id,
                },
            });
            await (0, historial_1.registrarHistorial)(tx, {
                entidad: "DONACION",
                entidadId: nueva.id,
                estadoNuevo: estado,
                usuarioId: req.user.id,
                nota: aprobadaPorPasarela ? "Pago aprobado por la pasarela (sandbox)" : "Pendiente de confirmar el pago",
            });
            return nueva;
        });
        res.status(201).json(conComprobante(donacion));
    }
    catch (e) {
        if (esErrorUnico(e)) {
            const creada = await buscarExistente();
            if (creada)
                return res.json(conComprobante(creada.donacion));
        }
        throw e;
    }
});
exports.donacionesRouter.put("/:id/estado", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { estado, nota } = req.body;
    if (!ESTADOS_DONACION.includes(estado))
        return res.status(400).json({ error: "Estado inválido" });
    const id = Number(req.params.id);
    const actual = await prisma_1.prisma.donacion.findUnique({ where: { id } });
    if (!actual)
        return res.status(404).json({ error: "Donación no encontrada" });
    const donacion = await prisma_1.prisma.$transaction(async (tx) => {
        const actualizada = await tx.donacion.update({ where: { id }, data: { estado } });
        await tx.pago.updateMany({
            where: { donacionId: id },
            data: { estado: estado === "COMPLETADA" ? "APROBADO" : estado === "FALLIDA" ? "RECHAZADO" : "PENDIENTE" },
        });
        if (actual.estado !== estado) {
            await (0, historial_1.registrarHistorial)(tx, {
                entidad: "DONACION",
                entidadId: id,
                estadoAnterior: actual.estado,
                estadoNuevo: estado,
                usuarioId: req.user.id,
                nota,
            });
        }
        return actualizada;
    });
    res.json(conComprobante(donacion));
});
