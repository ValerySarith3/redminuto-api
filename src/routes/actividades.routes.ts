import { Router } from "express";
import { prisma } from "../lib/prisma";
import { registrarCambio, cambios } from "../lib/logCambios";

const conPrograma = { programa: { select: { nombre: true } } } as const;
const datosLog = (a: {
  titulo: string;
  descripcion: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  cupo: number;
  programa: { nombre: string };
}) => ({
  Título: a.titulo,
  Descripción: a.descripcion,
  Fecha: a.fecha,
  "Hora de inicio": a.horaInicio,
  "Hora de fin": a.horaFin,
  Lugar: a.lugar,
  Cupo: a.cupo,
  Programa: a.programa.nombre,
});
import { requireAuth, requireRole } from "../middleware/auth";

export const actividadesRouter = Router();

async function conCupos<T extends { id: number; cupo: number }>(actividades: T[]) {
  const conteos = await prisma.inscripcionVoluntario.groupBy({
    by: ["actividadId"],
    where: { actividadId: { in: actividades.map((a) => a.id) }, estado: { not: "RECHAZADA" } },
    _count: { _all: true },
  });
  return actividades.map((a) => {
    const inscritos = conteos.find((c) => c.actividadId === a.id)?._count._all ?? 0;
    return { ...a, inscritos, disponibles: Math.max(0, a.cupo - inscritos) };
  });
}

actividadesRouter.get("/", async (req, res) => {
  const hoy = new Date();
  hoy.setUTCHours(0, 0, 0, 0);
  const actividades = await prisma.actividad.findMany({
    where: {
      ...(req.query.programaId ? { programaId: Number(req.query.programaId) } : {}),
      ...(req.query.todas ? {} : { fecha: { gte: hoy } }),
    },
    include: { programa: { select: { id: true, nombre: true } } },
    orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
  });
  res.json(await conCupos(actividades));
});

function datosActividad(body: Record<string, unknown>) {
  const { titulo, descripcion, fecha, horaInicio, horaFin, lugar, cupo, programaId } = body;
  if (!titulo || !descripcion || !fecha || !horaInicio || !horaFin || !lugar || cupo === undefined || !programaId) {
    return null;
  }
  return {
    titulo: String(titulo),
    descripcion: String(descripcion),
    fecha: new Date(`${fecha}T00:00:00Z`),
    horaInicio: String(horaInicio),
    horaFin: String(horaFin),
    lugar: String(lugar),
    cupo: Number(cupo),
    programaId: Number(programaId),
  };
}

actividadesRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const data = datosActividad(req.body);
  if (!data) return res.status(400).json({ error: "Faltan campos obligatorios" });
  const actividad = await prisma.actividad.create({ data, include: conPrograma });
  await registrarCambio(req, {
    modulo: "ACTIVIDADES",
    accion: "CREAR",
    afectado: { tipo: "Actividad", nombre: actividad.titulo },
    descripcion: `Creó la actividad «${actividad.titulo}»`,
    nuevo: datosLog(actividad),
  });
  res.status(201).json(actividad);
});

actividadesRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const data = datosActividad(req.body);
  if (!data) return res.status(400).json({ error: "Faltan campos obligatorios" });
  const antes = await prisma.actividad.findUnique({ where: { id: Number(req.params.id) }, include: conPrograma });
  if (!antes) return res.status(404).json({ error: "Actividad no encontrada" });
  const actividad = await prisma.actividad.update({ where: { id: Number(req.params.id) }, data, include: conPrograma });
  await registrarCambio(req, {
    modulo: "ACTIVIDADES",
    accion: "EDITAR",
    afectado: { tipo: "Actividad", nombre: actividad.titulo },
    descripcion: `Editó la actividad «${actividad.titulo}»`,
    ...cambios(datosLog(antes), datosLog(actividad)),
  });
  res.json(actividad);
});

actividadesRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const inscritos = await prisma.inscripcionVoluntario.count({ where: { actividadId: id } });
  if (inscritos > 0) {
    return res.status(409).json({ error: "No se puede eliminar: la actividad ya tiene voluntarios inscritos." });
  }
  const actividad = await prisma.actividad.delete({ where: { id }, include: conPrograma });
  await registrarCambio(req, {
    modulo: "ACTIVIDADES",
    accion: "ELIMINAR",
    afectado: { tipo: "Actividad", nombre: actividad.titulo },
    descripcion: `Eliminó la actividad «${actividad.titulo}»`,
    anterior: datosLog(actividad),
  });
  res.status(204).send();
});
