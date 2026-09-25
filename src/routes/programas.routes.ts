import { Router } from "express";
import { prisma } from "../lib/prisma";
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
  const { nombre, descripcion, metaCupoVoluntarios } = req.body;
  const programa = await prisma.programa.create({
    data: { nombre, descripcion, metaCupoVoluntarios: metaCupoVoluntarios ?? 0 },
  });
  res.status(201).json(programa);
});

programasRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { nombre, descripcion, metaCupoVoluntarios } = req.body;
  const programa = await prisma.programa.update({
    where: { id: Number(req.params.id) },
    data: { nombre, descripcion, metaCupoVoluntarios },
  });
  res.json(programa);
});

programasRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    await prisma.programa.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) {
    manejarErrorEliminar(
      e,
      res,
      "No se puede eliminar: el programa tiene campañas, actividades, inscripciones o solicitudes asociadas.",
    );
  }
});
