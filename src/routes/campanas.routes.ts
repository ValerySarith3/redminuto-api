import { Router } from "express";
import { prisma } from "../lib/prisma";
import { registrarCambio, cambios } from "../lib/logCambios";

const conPrograma = { programa: { select: { nombre: true } } } as const;
const datosCampana = (c: { titulo: string; descripcion: string; metaMonto: unknown; programa: { nombre: string } }) => ({
  Título: c.titulo,
  Descripción: c.descripcion,
  Meta: `$${Math.round(Number(c.metaMonto)).toLocaleString("es-CO")}`,
  Programa: c.programa.nombre,
});
import { requireAuth, requireRole } from "../middleware/auth";
import { manejarErrorEliminar } from "../lib/prismaErrors";

export const campanasRouter = Router();

campanasRouter.get("/", async (_req, res) => {
  const campanas = await prisma.campana.findMany({ include: { programa: true } });
  res.json(campanas);
});

campanasRouter.get("/:id", async (req, res) => {
  const campana = await prisma.campana.findUnique({
    where: { id: Number(req.params.id) },
    include: { programa: true },
  });
  if (!campana) return res.status(404).json({ error: "Campaña no encontrada" });
  res.json(campana);
});

campanasRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { titulo, descripcion, metaMonto, programaId } = req.body;
  const campana = await prisma.campana.create({
    data: { titulo, descripcion, metaMonto, programaId: Number(programaId) },
    include: conPrograma,
  });
  await registrarCambio(req, {
    modulo: "CAMPANAS",
    accion: "CREAR",
    afectado: { tipo: "Campaña", nombre: campana.titulo },
    descripcion: `Creó la campaña «${campana.titulo}»`,
    nuevo: datosCampana(campana),
  });
  res.status(201).json(campana);
});

campanasRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { titulo, descripcion, metaMonto, programaId } = req.body;
  const antes = await prisma.campana.findUnique({ where: { id: Number(req.params.id) }, include: conPrograma });
  if (!antes) return res.status(404).json({ error: "Campaña no encontrada" });
  const campana = await prisma.campana.update({
    where: { id: Number(req.params.id) },
    data: { titulo, descripcion, metaMonto, programaId },
    include: conPrograma,
  });
  await registrarCambio(req, {
    modulo: "CAMPANAS",
    accion: "EDITAR",
    afectado: { tipo: "Campaña", nombre: campana.titulo },
    descripcion: `Editó la campaña «${campana.titulo}»`,
    ...cambios(datosCampana(antes), datosCampana(campana)),
  });
  res.json(campana);
});

campanasRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const campana = await prisma.campana.delete({ where: { id: Number(req.params.id) }, include: conPrograma });
    await registrarCambio(req, {
      modulo: "CAMPANAS",
      accion: "ELIMINAR",
      afectado: { tipo: "Campaña", nombre: campana.titulo },
      descripcion: `Eliminó la campaña «${campana.titulo}»`,
      anterior: datosCampana(campana),
    });
    res.status(204).send();
  } catch (e) {
    manejarErrorEliminar(e, res, "No se puede eliminar: la campaña tiene donaciones registradas.");
  }
});
