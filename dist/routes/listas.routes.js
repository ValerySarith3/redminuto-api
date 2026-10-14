"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listasRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const logCambios_1 = require("../lib/logCambios");
const prismaErrors_1 = require("../lib/prismaErrors");
exports.listasRouter = (0, express_1.Router)();
// Opciones activas de una lista, para llenar los selectores de los formularios (público).
exports.listasRouter.get("/:codigo/opciones", async (req, res) => {
    const opciones = await prisma_1.prisma.opcionListaMaestra.findMany({
        where: { activo: true, listaMaestra: { codigo: req.params.codigo } },
        select: { id: true, codigo: true, nombre: true },
        orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    });
    res.json(opciones);
});
// Todas las listas con todas sus opciones (activas e inactivas) y cuántos registros usan cada una.
exports.listasRouter.get("/", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (_req, res) => {
    const listas = await prisma_1.prisma.listaMaestra.findMany({
        orderBy: { nombre: "asc" },
        include: {
            opciones: {
                orderBy: [{ orden: "asc" }, { nombre: "asc" }],
                include: { _count: { select: { usuariosConTipoDocumento: true, solicitudesConTipoDocumento: true } } },
            },
        },
    });
    res.json(listas.map((l) => ({
        ...l,
        opciones: l.opciones.map(({ _count, ...o }) => ({
            ...o,
            enUso: _count.usuariosConTipoDocumento + _count.solicitudesConTipoDocumento,
        })),
    })));
});
function validarOpcion(body) {
    const codigo = typeof body.codigo === "string" ? body.codigo.trim().toUpperCase().replace(/\s+/g, "_") : "";
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    const orden = Number(body.orden ?? 0);
    if (!codigo || !nombre)
        return { error: "Escribe el código y el nombre de la opción" };
    if (!/^[A-Z0-9_]{1,30}$/.test(codigo)) {
        return { error: "El código admite hasta 30 letras sin tilde, números o guion bajo" };
    }
    if (nombre.length > 100)
        return { error: "El nombre admite hasta 100 caracteres" };
    if (!Number.isInteger(orden) || orden < 0)
        return { error: "El orden debe ser un número entero positivo" };
    return { codigo, nombre, orden, activo: body.activo !== false };
}
const datosOpcion = (o) => ({
    Código: o.codigo,
    Nombre: o.nombre,
    Orden: o.orden,
    Activa: o.activo,
});
function esCodigoRepetido(e) {
    return typeof e === "object" && e !== null && e.code === "P2002";
}
exports.listasRouter.post("/:id/opciones", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const datos = validarOpcion(req.body);
    if ("error" in datos)
        return res.status(400).json({ error: datos.error });
    const lista = await prisma_1.prisma.listaMaestra.findUnique({ where: { id: Number(req.params.id) } });
    if (!lista)
        return res.status(404).json({ error: "Lista no encontrada" });
    try {
        const opcion = await prisma_1.prisma.opcionListaMaestra.create({ data: { ...datos, listaMaestraId: lista.id } });
        await (0, logCambios_1.registrarCambio)(req, {
            modulo: "LISTAS",
            accion: "CREAR",
            afectado: { tipo: "Opción de lista", nombre: `${opcion.nombre} (${lista.nombre})` },
            descripcion: `Agregó la opción «${opcion.nombre}» a la lista «${lista.nombre}»`,
            nuevo: datosOpcion(opcion),
        });
        res.status(201).json({ ...opcion, enUso: 0 });
    }
    catch (e) {
        if (esCodigoRepetido(e))
            return res.status(409).json({ error: "Ya existe una opción con ese código en esta lista" });
        throw e;
    }
});
exports.listasRouter.put("/opciones/:id", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const datos = validarOpcion(req.body);
    if ("error" in datos)
        return res.status(400).json({ error: datos.error });
    const id = Number(req.params.id);
    const antes = await prisma_1.prisma.opcionListaMaestra.findUnique({ where: { id }, include: { listaMaestra: true } });
    if (!antes)
        return res.status(404).json({ error: "Opción no encontrada" });
    try {
        const opcion = await prisma_1.prisma.opcionListaMaestra.update({ where: { id }, data: datos });
        await (0, logCambios_1.registrarCambio)(req, {
            modulo: "LISTAS",
            accion: "EDITAR",
            afectado: { tipo: "Opción de lista", nombre: `${opcion.nombre} (${antes.listaMaestra.nombre})` },
            descripcion: `Editó la opción «${opcion.nombre}» de la lista «${antes.listaMaestra.nombre}»`,
            ...(0, logCambios_1.cambios)(datosOpcion(antes), datosOpcion(opcion)),
        });
        res.json(opcion);
    }
    catch (e) {
        if (esCodigoRepetido(e))
            return res.status(409).json({ error: "Ya existe una opción con ese código en esta lista" });
        throw e;
    }
});
exports.listasRouter.delete("/opciones/:id", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const id = Number(req.params.id);
    const existe = await prisma_1.prisma.opcionListaMaestra.findUnique({ where: { id }, include: { listaMaestra: true } });
    if (!existe)
        return res.status(404).json({ error: "Opción no encontrada" });
    try {
        await prisma_1.prisma.opcionListaMaestra.delete({ where: { id } });
        await (0, logCambios_1.registrarCambio)(req, {
            modulo: "LISTAS",
            accion: "ELIMINAR",
            afectado: { tipo: "Opción de lista", nombre: `${existe.nombre} (${existe.listaMaestra.nombre})` },
            descripcion: `Eliminó la opción «${existe.nombre}» de la lista «${existe.listaMaestra.nombre}»`,
            anterior: datosOpcion(existe),
        });
        res.status(204).send();
    }
    catch (e) {
        (0, prismaErrors_1.manejarErrorEliminar)(e, res, "Esta opción ya está en uso. Desactívala para que no aparezca en los formularios.");
    }
});
