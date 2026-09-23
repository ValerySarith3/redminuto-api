import { Router } from "express";
import { prisma } from "../lib/prisma";
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
  });
  res.status(201).json(campana);
});

campanasRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { titulo, descripcion, metaMonto, programaId } = req.body;
  const campana = await prisma.campana.update({
    where: { id: Number(req.params.id) },
    data: { titulo, descripcion, metaMonto, programaId },
  });
  res.json(campana);
});

campanasRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    await prisma.campana.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    manejarErrorEliminar(e, res, "No se puede eliminar: la campaña tiene donaciones registradas.");
  }
});
