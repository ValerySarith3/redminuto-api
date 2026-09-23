import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { numeroComprobante } from "../lib/comprobante";

export const dashboardRouter = Router();

async function avanceCampana(campanaId: number) {
  const campana = await prisma.campana.findUnique({ where: { id: campanaId } });
  if (!campana) return null;

  const agregado = await prisma.donacion.aggregate({
    where: { campanaId, estado: "COMPLETADA" },
    _sum: { monto: true },
  });

  const recaudado = Number(agregado._sum.monto ?? 0);
  const meta = Number(campana.metaMonto);
  const porcentaje = meta > 0 ? Math.min(100, (recaudado / meta) * 100) : 0;

  return {
    campanaId,
    titulo: campana.titulo,
    meta,
    recaudado,
    porcentaje: Number(porcentaje.toFixed(2)),
  };
}

async function avanceProgramaVoluntarios(programaId: number) {
  const programa = await prisma.programa.findUnique({ where: { id: programaId } });
  if (!programa) return null;

  // Cuenta pendientes + aceptados: ambos ocupan un cupo (coincide con la validación al inscribirse).
  const inscritos = await prisma.inscripcionVoluntario.count({
    where: { programaId, estado: { not: "RECHAZADA" } },
  });

  const cupo = programa.metaCupoVoluntarios;
  const porcentaje = cupo > 0 ? Math.min(100, (inscritos / cupo) * 100) : 0;

  return {
    programaId,
    nombre: programa.nombre,
    cupo,
    inscritos,
    faltan: Math.max(0, cupo - inscritos),
    porcentaje: Number(porcentaje.toFixed(2)),
  };
}

dashboardRouter.get("/campanas/:id", async (req, res) => {
  const avance = await avanceCampana(Number(req.params.id));
  if (!avance) return res.status(404).json({ error: "Campaña no encontrada" });
  res.json(avance);
});

dashboardRouter.get("/programas/:id", async (req, res) => {
  const avance = await avanceProgramaVoluntarios(Number(req.params.id));
  if (!avance) return res.status(404).json({ error: "Programa no encontrado" });
  res.json(avance);
});

// Vista de seguimiento personalizada: todo lo que el usuario logueado aportó, con el avance de cada campaña/programa.
dashboardRouter.get("/mio", requireAuth, async (req, res) => {
  const userId = req.user!.id;

  const [donaciones, inscripciones, solicitudes] = await Promise.all([
    prisma.donacion.findMany({
      where: { donanteId: userId },
      include: { campana: true },
      orderBy: { creadoEn: "desc" },
    }),
    prisma.inscripcionVoluntario.findMany({
      where: { voluntarioId: userId },
      include: { programa: true },
      orderBy: { creadoEn: "desc" },
    }),
    prisma.solicitudBeneficiario.findMany({
      where: { beneficiarioId: userId },
      include: { programa: true },
      orderBy: { creadoEn: "desc" },
    }),
  ]);

  const campanaIds = [...new Set(donaciones.map((d) => d.campanaId))];
  const programaIdsVoluntario = [...new Set(inscripciones.map((i) => i.programaId))];

  const avancesCampanas = await Promise.all(campanaIds.map(avanceCampana));
  const avancesProgramas = await Promise.all(programaIdsVoluntario.map(avanceProgramaVoluntarios));

  const donacionesConAvance = donaciones.map((d) => ({
    id: d.id,
    numeroComprobante: numeroComprobante(d.id),
    monto: Number(d.monto),
    canal: d.canal,
    estado: d.estado,
    creadoEn: d.creadoEn,
    campana: {
      id: d.campana.id,
      titulo: d.campana.titulo,
      avance: avancesCampanas.find((a) => a?.campanaId === d.campanaId) ?? null,
    },
  }));

  const inscripcionesConAvance = inscripciones.map((i) => ({
    id: i.id,
    estado: i.estado,
    creadoEn: i.creadoEn,
    programa: {
      id: i.programa.id,
      nombre: i.programa.nombre,
      avance: avancesProgramas.find((a) => a?.programaId === i.programaId) ?? null,
    },
  }));

  const solicitudesConPrograma = solicitudes.map((s) => ({
    id: s.id,
    descripcion: s.descripcion,
    tipoApoyo: s.tipoApoyo,
    estado: s.estado,
    creadoEn: s.creadoEn,
    programa: { id: s.programa.id, nombre: s.programa.nombre },
  }));

  res.json({
    donaciones: donacionesConAvance,
    inscripciones: inscripcionesConAvance,
    solicitudes: solicitudesConPrograma,
  });
});
