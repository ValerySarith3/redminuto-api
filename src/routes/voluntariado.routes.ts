import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { usuarioPublico } from "../lib/usuarioPublico";
import { registrarHistorial } from "../lib/historial";

export const voluntariadoRouter = Router();

const ESTADOS_INSCRIPCION = ["PENDIENTE", "ACEPTADA", "RECHAZADA"];

// Uso administrativo: expone datos personales de todos los voluntarios inscritos.
voluntariadoRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const inscripciones = await prisma.inscripcionVoluntario.findMany({
    include: { voluntario: usuarioPublico, programa: true, actividad: true },
    orderBy: { creadoEn: "desc" },
  });
  res.json(inscripciones);
});

voluntariadoRouter.get("/mias", requireAuth, async (req, res) => {
  const inscripciones = await prisma.inscripcionVoluntario.findMany({
    where: { voluntarioId: req.user!.id },
    include: { programa: true, actividad: true },
    orderBy: { creadoEn: "desc" },
  });
  res.json(inscripciones);
});

// Inscripción a una actividad concreta: valida que no haya pasado y su cupo. Si solo llega programaId
// (programa sin actividades publicadas) se valida el cupo general del programa, como antes.
voluntariadoRouter.post("/", requireAuth, async (req, res) => {
  const { programaId, actividadId } = req.body;
  if (!programaId && !actividadId) return res.status(400).json({ error: "Falta la actividad o el programa" });

  let datos: { programaId: number; actividadId?: number };

  if (actividadId) {
    const actividad = await prisma.actividad.findUnique({ where: { id: Number(actividadId) } });
    if (!actividad) return res.status(404).json({ error: "Actividad no encontrada" });

    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0);
    if (actividad.fecha < hoy) return res.status(409).json({ error: "Esta actividad ya se realizó" });

    const yaInscrito = await prisma.inscripcionVoluntario.findFirst({
      where: { voluntarioId: req.user!.id, actividadId: actividad.id },
    });
    if (yaInscrito) return res.status(409).json({ error: "Ya estás inscrito en esta actividad" });

    const ocupados = await prisma.inscripcionVoluntario.count({
      where: { actividadId: actividad.id, estado: { not: "RECHAZADA" } },
    });
    if (ocupados >= actividad.cupo) {
      return res.status(409).json({ error: "No hay cupo disponible para esta actividad" });
    }
    datos = { programaId: actividad.programaId, actividadId: actividad.id };
  } else {
    const programa = await prisma.programa.findUnique({ where: { id: Number(programaId) } });
    if (!programa) return res.status(404).json({ error: "Programa no encontrado" });

    const yaInscrito = await prisma.inscripcionVoluntario.findFirst({
      where: { voluntarioId: req.user!.id, programaId: programa.id, actividadId: null },
    });
    if (yaInscrito) return res.status(409).json({ error: "Ya estás inscrito en este programa" });

    const ocupados = await prisma.inscripcionVoluntario.count({
      where: { programaId: programa.id, estado: { not: "RECHAZADA" } },
    });
    if (ocupados >= programa.metaCupoVoluntarios) {
      return res.status(409).json({ error: "No hay cupo disponible para este programa" });
    }
    datos = { programaId: programa.id };
  }

  const inscripcion = await prisma.$transaction(async (tx) => {
    const nueva = await tx.inscripcionVoluntario.create({
      data: { voluntarioId: req.user!.id, ...datos },
      include: { programa: true, actividad: true },
    });
    await registrarHistorial(tx, {
      entidad: "INSCRIPCION",
      entidadId: nueva.id,
      estadoNuevo: nueva.estado,
      usuarioId: req.user!.id,
      nota: "Inscripción recibida",
    });
    return nueva;
  });
  res.status(201).json(inscripcion);
});

voluntariadoRouter.put("/:id/estado", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { estado, nota } = req.body;
  if (!ESTADOS_INSCRIPCION.includes(estado)) return res.status(400).json({ error: "Estado inválido" });

  const id = Number(req.params.id);
  const actual = await prisma.inscripcionVoluntario.findUnique({ where: { id } });
  if (!actual) return res.status(404).json({ error: "Inscripción no encontrada" });

  const inscripcion = await prisma.$transaction(async (tx) => {
    const actualizada = await tx.inscripcionVoluntario.update({ where: { id }, data: { estado } });
    if (actual.estado !== estado) {
      await registrarHistorial(tx, {
        entidad: "INSCRIPCION",
        entidadId: id,
        estadoAnterior: actual.estado,
        estadoNuevo: estado,
        usuarioId: req.user!.id,
        nota,
      });
    }
    return actualizada;
  });
  res.json(inscripcion);
});
