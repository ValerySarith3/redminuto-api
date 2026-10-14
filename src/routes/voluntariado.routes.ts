import { Router } from "express";
import { prisma } from "../lib/prisma";
import { opcionResumen } from "../lib/listasMaestras";
import { certificadoDisponible, codigoCertificado, generarCertificado } from "../lib/certificado";
import { requireAuth, requireRole } from "../middleware/auth";
import { usuarioPublico } from "../lib/usuarioPublico";
import { registrarHistorial } from "../lib/historial";

export const voluntariadoRouter = Router();

const ESTADOS_INSCRIPCION = ["PENDIENTE", "ACEPTADA", "RECHAZADA"];

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

voluntariadoRouter.post("/", requireAuth, async (req, res) => {
  const { actividadId } = req.body;
  if (!actividadId) return res.status(400).json({ error: "Elige una jornada con fecha y hora para inscribirte" });

  const actividad = await prisma.actividad.findUnique({ where: { id: Number(actividadId) } });
  if (!actividad) return res.status(404).json({ error: "Jornada no encontrada" });

  const hoy = new Date();
  hoy.setUTCHours(0, 0, 0, 0);
  if (actividad.fecha < hoy) return res.status(409).json({ error: "Esta jornada ya se realizó" });

  const yaInscrito = await prisma.inscripcionVoluntario.findFirst({
    where: { voluntarioId: req.user!.id, actividadId: actividad.id },
  });
  if (yaInscrito) return res.status(409).json({ error: "Ya estás inscrito en esta jornada" });

  const datos = { programaId: actividad.programaId, actividadId: actividad.id };

  // El conteo de cupo y la inscripción van en la misma transacción, con la jornada bloqueada (FOR UPDATE):
  // si dos personas piden el último cupo a la vez, la segunda espera y ya ve el cupo lleno.
  const inscripcion = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM Actividad WHERE id = ${actividad.id} FOR UPDATE`;
    const ocupados = await tx.inscripcionVoluntario.count({
      where: { actividadId: actividad.id, estado: { not: "RECHAZADA" } },
    });
    if (ocupados >= actividad.cupo) return null;
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
  if (!inscripcion) return res.status(409).json({ error: "No hay cupo disponible para esta jornada" });
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

// Certificado en PDF: solo para inscripciones aceptadas y cuando la jornada ya terminó.
voluntariadoRouter.get("/:id/certificado", requireAuth, async (req, res) => {
  const inscripcion = await prisma.inscripcionVoluntario.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      programa: { select: { nombre: true } },
      actividad: { select: { titulo: true, fecha: true, horaInicio: true, horaFin: true, lugar: true } },
      voluntario: { select: { nombre: true, tipoDocumento: opcionResumen, numeroDocumento: true } },
    },
  });
  if (!inscripcion || (inscripcion.voluntarioId !== req.user!.id && req.user!.rol !== "ADMIN")) {
    return res.status(404).json({ error: "Inscripción no encontrada" });
  }
  if (inscripcion.estado !== "ACEPTADA") {
    return res.status(409).json({ error: "El certificado solo está disponible para inscripciones aceptadas" });
  }
  if (!inscripcion.actividad || !certificadoDisponible(inscripcion.estado, inscripcion.actividad)) {
    return res.status(409).json({ error: "El certificado se habilita cuando termine la jornada" });
  }

  const pdf = await generarCertificado({
    inscripcionId: inscripcion.id,
    voluntario: inscripcion.voluntario,
    actividad: inscripcion.actividad,
    programa: inscripcion.programa.nombre,
  });
  res
    .type("application/pdf")
    .set("Content-Disposition", `attachment; filename="certificado-voluntariado-${codigoCertificado(inscripcion.id)}.pdf"`)
    .send(pdf);
});
