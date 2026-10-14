"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.programasRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const logCambios_1 = require("../lib/logCambios");
const datosPrograma = (p) => ({
    Nombre: p.nombre,
    Descripción: p.descripcion,
});
const auth_1 = require("../middleware/auth");
const prismaErrors_1 = require("../lib/prismaErrors");
exports.programasRouter = (0, express_1.Router)();
exports.programasRouter.get("/", async (_req, res) => {
    const programas = await prisma_1.prisma.programa.findMany();
    res.json(programas);
});
exports.programasRouter.get("/:id", async (req, res) => {
    const programa = await prisma_1.prisma.programa.findUnique({
        where: { id: Number(req.params.id) },
    });
    if (!programa)
        return res.status(404).json({ error: "Programa no encontrado" });
    res.json(programa);
});
exports.programasRouter.post("/", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { nombre, descripcion } = req.body;
    const programa = await prisma_1.prisma.programa.create({
        data: { nombre, descripcion },
    });
    await (0, logCambios_1.registrarCambio)(req, {
        modulo: "PROGRAMAS",
        accion: "CREAR",
        afectado: { tipo: "Programa", nombre: programa.nombre },
        descripcion: `Creó el programa «${programa.nombre}»`,
        nuevo: datosPrograma(programa),
    });
    res.status(201).json(programa);
});
exports.programasRouter.put("/:id", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { nombre, descripcion } = req.body;
    const antes = await prisma_1.prisma.programa.findUnique({ where: { id: Number(req.params.id) } });
    if (!antes)
        return res.status(404).json({ error: "Programa no encontrado" });
    const programa = await prisma_1.prisma.programa.update({
        where: { id: Number(req.params.id) },
        data: { nombre, descripcion },
    });
    await (0, logCambios_1.registrarCambio)(req, {
        modulo: "PROGRAMAS",
        accion: "EDITAR",
        afectado: { tipo: "Programa", nombre: programa.nombre },
        descripcion: `Editó el programa «${programa.nombre}»`,
        ...(0, logCambios_1.cambios)(datosPrograma(antes), datosPrograma(programa)),
    });
    res.json(programa);
});
exports.programasRouter.delete("/:id", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    try {
        const programa = await prisma_1.prisma.programa.delete({ where: { id: Number(req.params.id) } });
        await (0, logCambios_1.registrarCambio)(req, {
            modulo: "PROGRAMAS",
            accion: "ELIMINAR",
            afectado: { tipo: "Programa", nombre: programa.nombre },
            descripcion: `Eliminó el programa «${programa.nombre}»`,
            anterior: datosPrograma(programa),
        });
        res.status(204).send();
    }
    catch (e) {
        (0, prismaErrors_1.manejarErrorEliminar)(e, res, "No se puede eliminar: el programa tiene campañas, actividades, inscripciones o solicitudes asociadas.");
    }
});
