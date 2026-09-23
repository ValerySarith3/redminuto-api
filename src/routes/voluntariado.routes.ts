import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { usuarioPublico } from "../lib/usuarioPublico";

export const voluntariadoRouter = Router();

// Uso administrativo: expone datos personales de todos los voluntarios inscritos.
voluntariadoRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const inscripciones = await prisma.inscripcionVoluntario.findMany({
    include: { voluntario: usuarioPublico, programa: true },
    orderBy: { creadoEn: "desc" },
  });
  res.json(inscripciones);
});

voluntariadoRouter.get("/mias", requireAuth, async (req, res) => {
  const inscripciones = await prisma.inscripcionVoluntario.findMany({
    where: { voluntarioId: req.user!.id },
    include: { programa: true },
    orderBy: { creadoEn: "desc" },
  });
  res.json(inscripciones);
});

voluntariadoRouter.post("/", requireAuth, async (req, res) => {
  const { programaId } = req.body;
  if (!programaId) return res.status(400).json({ error: "Falta el programa" });

  const programa = await prisma.programa.findUnique({ where: { id: Number(programaId) } });
  if (!programa) return res.status(404).json({ error: "Programa no encontrado" });

  const yaInscrito = await prisma.inscripcionVoluntario.findFirst({
    where: { voluntarioId: req.user!.id, programaId: Number(programaId) },
  });
  if (yaInscrito) return res.status(409).json({ error: "Ya estás inscrito en este programa" });

  const ocupados = await prisma.inscripcionVoluntario.count({
    where: { programaId: Number(programaId), estado: { not: "RECHAZADA" } },
  });
  if (ocupados >= programa.metaCupoVoluntarios) {
    return res.status(409).json({ error: "No hay cupo disponible para este programa" });
  }

  const inscripcion = await prisma.inscripcionVoluntario.create({
    data: { voluntarioId: req.user!.id, programaId: Number(programaId) },
    include: { programa: true },
  });
  res.status(201).json(inscripcion);
});

voluntariadoRouter.put("/:id/estado", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { estado } = req.body;
  const inscripcion = await prisma.inscripcionVoluntario.update({
    where: { id: Number(req.params.id) },
    data: { estado },
  });
  res.json(inscripcion);
});
