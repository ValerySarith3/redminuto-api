"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beneficiariosRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const usuarioPublico_1 = require("../lib/usuarioPublico");
const historial_1 = require("../lib/historial");
const consentimiento_1 = require("../lib/consentimiento");
const listasMaestras_1 = require("../lib/listasMaestras");
exports.beneficiariosRouter = (0, express_1.Router)();
const ESTADOS_SOLICITUD = ["PENDIENTE", "EN_REVISION", "APROBADA", "RECHAZADA"];
exports.beneficiariosRouter.get("/", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (_req, res) => {
    const solicitudes = await prisma_1.prisma.solicitudBeneficiario.findMany({
        include: { beneficiario: usuarioPublico_1.usuarioPublico, programa: true, tipoDocumento: listasMaestras_1.opcionResumen },
        orderBy: { creadoEn: "desc" },
    });
    res.json(solicitudes);
});
exports.beneficiariosRouter.get("/mias", auth_1.requireAuth, async (req, res) => {
    const solicitudes = await prisma_1.prisma.solicitudBeneficiario.findMany({
        where: { beneficiarioId: req.user.id },
        include: { programa: true, tipoDocumento: listasMaestras_1.opcionResumen },
        orderBy: { creadoEn: "desc" },
    });
    res.json(solicitudes);
});
exports.beneficiariosRouter.post("/", auth_1.requireAuth, async (req, res) => {
    const { descripcion, programaId, tipoApoyo, nombreCompleto, numeroDocumento, telefono, direccion, ciudad, personasACargo, aceptaTratamientoDatos, } = req.body;
    const tipoDocumentoId = (0, listasMaestras_1.idOpcion)(req.body.tipoDocumentoId);
    if (!descripcion ||
        !programaId ||
        !tipoApoyo ||
        !nombreCompleto ||
        !tipoDocumentoId ||
        !numeroDocumento ||
        !telefono ||
        !direccion ||
        !ciudad ||
        !personasACargo) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    if (tipoDocumentoId === null || !(await (0, listasMaestras_1.opcionValida)(listasMaestras_1.LISTA.TIPO_DOCUMENTO, tipoDocumentoId))) {
        return res.status(400).json({ error: "Tipo de documento inválido" });
    }
    if (!aceptaTratamientoDatos) {
        return res.status(400).json({ error: "Debes autorizar el tratamiento de tus datos personales para continuar" });
    }
    const solicitud = await prisma_1.prisma.$transaction(async (tx) => {
        const nueva = await tx.solicitudBeneficiario.create({
            data: {
                descripcion,
                tipoApoyo,
                nombreCompleto,
                tipoDocumentoId,
                numeroDocumento,
                telefono,
                direccion,
                ciudad,
                personasACargo: Number(personasACargo),
                aceptaTratamientoDatos: true,
                beneficiarioId: req.user.id,
                programaId: Number(programaId),
            },
            include: { programa: true, tipoDocumento: listasMaestras_1.opcionResumen },
        });
        await tx.consentimientoDatos.create({
            data: { usuarioId: req.user.id, finalidad: "SOLICITUD_AYUDA", versionPolitica: consentimiento_1.VERSION_POLITICA_DATOS },
        });
        await (0, historial_1.registrarHistorial)(tx, {
            entidad: "SOLICITUD",
            entidadId: nueva.id,
            estadoNuevo: nueva.estado,
            usuarioId: req.user.id,
            nota: "Solicitud recibida",
        });
        return nueva;
    });
    res.status(201).json(solicitud);
});
exports.beneficiariosRouter.put("/:id/estado", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { estado, nota } = req.body;
    if (!ESTADOS_SOLICITUD.includes(estado))
        return res.status(400).json({ error: "Estado inválido" });
    const id = Number(req.params.id);
    const actual = await prisma_1.prisma.solicitudBeneficiario.findUnique({ where: { id } });
    if (!actual)
        return res.status(404).json({ error: "Solicitud no encontrada" });
    const solicitud = await prisma_1.prisma.$transaction(async (tx) => {
        const actualizada = await tx.solicitudBeneficiario.update({ where: { id }, data: { estado } });
        if (actual.estado !== estado) {
            await (0, historial_1.registrarHistorial)(tx, {
                entidad: "SOLICITUD",
                entidadId: id,
                estadoAnterior: actual.estado,
                estadoNuevo: estado,
                usuarioId: req.user.id,
                nota,
            });
        }
        return actualizada;
    });
    res.json(solicitud);
});
