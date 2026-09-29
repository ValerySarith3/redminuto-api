import { Router } from "express";
import { prisma } from "../lib/prisma";
import { registrarCambio, cambios } from "../lib/logCambios";

const datosPrograma = (p: { nombre: string; descripcion: string }) => ({
  Nombre: p.nombre,
  Descripción: p.descripcion,
});
import { requireAuth, requireRole } from "../middleware/auth";
import { manejarErrorEliminar } from "../lib/prismaErrors";

export const programasRouter = Router();

programasRouter.get("/", async (_req, res) => {
  const programas = await prisma.programa.findMany();
  res.json(programas);
});

programasRouter.get("/:id", async (req, res) => {
  const programa = await prisma.programa.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!programa) return res.status(404).json({ error: "Programa no encontrado" });
  res.json(programa);
});

programasRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { nombre, descripcion } = req.body;
  const programa = await prisma.programa.create({
    data: { nombre, descripcion },
  });
  await registrarCambio(req, {
    modulo: "PROGRAMAS",
    accion: "CREAR",
    afectado: { tipo: "Programa", nombre: programa.nombre },
    descripcion: `Creó el programa «${programa.nombre}»`,
    nuevo: datosPrograma(programa),
  });
  res.status(201).json(programa);
});

programasRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { nombre, descripcion } = req.body;
  const antes = await prisma.programa.findUnique({ where: { id: Number(req.params.id) } });
  if (!antes) return res.status(404).json({ error: "Programa no encontrado" });
  const programa = await prisma.programa.update({
    where: { id: Number(req.params.id) },
    data: { nombre, descripcion },
  });
  await registrarCambio(req, {
    modulo: "PROGRAMAS",
    accion: "EDITAR",
    afectado: { tipo: "Programa", nombre: programa.nombre },
    descripcion: `Editó el programa «${programa.nombre}»`,
    ...cambios(datosPrograma(antes), datosPrograma(programa)),
  });
  res.json(programa);
});

programasRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const programa = await prisma.programa.delete({ where: { id: Number(req.params.id) } });
    await registrarCambio(req, {
      modulo: "PROGRAMAS",
      accion: "ELIMINAR",
      afectado: { tipo: "Programa", nombre: programa.nombre },
      descripcion: `Eliminó el programa «${programa.nombre}»`,
      anterior: datosPrograma(programa),
    });
    res.status(204).send();
  } catch (e) {
    manejarErrorEliminar(
      e,
      res,
      "No se puede eliminar: el programa tiene campañas, actividades, inscripciones o solicitudes asociadas.",
    );
  }
});
