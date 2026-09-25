import { Router, type Request } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { numeroComprobante } from "../lib/comprobante";

// Todo lo de este módulo es de uso administrativo: tablero general y exportación de reportes.
export const reportesRouter = Router();
reportesRouter.use(requireAuth, requireRole("ADMIN"));

// ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD (ambos opcionales, "hasta" incluye el día completo).
function rangoFechas(req: Request) {
  const { desde, hasta } = req.query;
  const filtro: { gte?: Date; lt?: Date } = {};
  if (typeof desde === "string" && desde) filtro.gte = new Date(`${desde}T00:00:00`);
  if (typeof hasta === "string" && hasta) {
    const fin = new Date(`${hasta}T00:00:00`);
    fin.setDate(fin.getDate() + 1);
    filtro.lt = fin;
  }
  return Object.keys(filtro).length ? { creadoEn: filtro } : {};
}

function contarPor<T, K extends string>(lista: T[], clave: (item: T) => K, todas: readonly K[]) {
  const conteo = Object.fromEntries(todas.map((k) => [k, 0])) as Record<K, number>;
  for (const item of lista) conteo[clave(item)] = (conteo[clave(item)] ?? 0) + 1;
  return todas.map((k) => ({ clave: k, total: conteo[k] }));
}

// Contadores livianos para las insignias del menú del panel (lo que espera acción del admin).
reportesRouter.get("/pendientes", async (_req, res) => {
  const [donaciones, inscripciones, solicitudes] = await Promise.all([
    prisma.donacion.count({ where: { estado: "PENDIENTE" } }),
    prisma.inscripcionVoluntario.count({ where: { estado: "PENDIENTE" } }),
    prisma.solicitudBeneficiario.count({ where: { estado: { in: ["PENDIENTE", "EN_REVISION"] } } }),
  ]);
  res.json({ donaciones, inscripciones, solicitudes });
});

reportesRouter.get("/resumen", async (req, res) => {
  const rango = rangoFechas(req);
  const hoy = new Date();
  hoy.setUTCHours(0, 0, 0, 0);

  const [usuarios, donaciones, inscripciones, solicitudes, campanas, actividades, recientes] = await Promise.all([
    // Participación histórica: una misma cuenta puede donar, ser voluntaria y pedir ayuda.
    Promise.all([
      prisma.usuario.count({ where: { rol: "USUARIO" } }),
      prisma.donacion.groupBy({ by: ["donanteId"], where: { donanteId: { not: null } } }),
      prisma.inscripcionVoluntario.groupBy({ by: ["voluntarioId"] }),
      prisma.solicitudBeneficiario.groupBy({ by: ["beneficiarioId"] }),
    ]),
    prisma.donacion.findMany({
      where: rango,
      select: { monto: true, estado: true, canal: true, creadoEn: true, donanteId: true },
    }),
    prisma.inscripcionVoluntario.findMany({ where: rango, select: { estado: true, voluntarioId: true } }),
    prisma.solicitudBeneficiario.findMany({ where: rango, select: { estado: true, tipoApoyo: true } }),
    prisma.campana.findMany({ include: { programa: { select: { nombre: true } } } }),
    prisma.actividad.findMany({
      where: { fecha: { gte: hoy } },
      include: { programa: { select: { nombre: true } } },
      orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
      take: 6,
    }),
    prisma.historialEstado.findMany({
      include: { usuario: { select: { nombre: true, rol: true } } },
      orderBy: { creadoEn: "desc" },
      take: 12,
    }),
  ]);

  // Recaudo histórico de cada campaña frente a su meta (no depende del rango: es el avance real).
  const recaudoPorCampana = await prisma.donacion.groupBy({
    by: ["campanaId"],
    where: { estado: "COMPLETADA" },
    _sum: { monto: true },
  });

  const inscritosPorActividad = await prisma.inscripcionVoluntario.groupBy({
    by: ["actividadId"],
    where: { actividadId: { in: actividades.map((a) => a.id) }, estado: { not: "RECHAZADA" } },
    _count: { _all: true },
  });

  const completadas = donaciones.filter((d) => d.estado === "COMPLETADA");
  const pendientes = donaciones.filter((d) => d.estado === "PENDIENTE");
  const suma = (lista: { monto: unknown }[]) => lista.reduce((t, d) => t + Number(d.monto), 0);

  // Recaudo confirmado agrupado por mes (AAAA-MM).
  const porMes = new Map<string, { total: number; cantidad: number }>();
  for (const d of completadas) {
    const mes = `${d.creadoEn.getFullYear()}-${String(d.creadoEn.getMonth() + 1).padStart(2, "0")}`;
    const actual = porMes.get(mes) ?? { total: 0, cantidad: 0 };
    porMes.set(mes, { total: actual.total + Number(d.monto), cantidad: actual.cantidad + 1 });
  }
  const [usuariosRegistrados, donantes, voluntarios, beneficiarios] = usuarios;

  const canales = ["PASARELA", "TRANSFERENCIA", "LLAVE", "EFECTIVO"] as const;

  res.json({
    kpis: {
      totalRecaudado: suma(completadas),
      donacionesConfirmadas: completadas.length,
      donantesUnicos: new Set(completadas.map((d) => d.donanteId).filter(Boolean)).size,
      pendientesPorConfirmar: { cantidad: pendientes.length, monto: suma(pendientes) },
      inscripciones: inscripciones.length,
      voluntariosUnicos: new Set(inscripciones.map((i) => i.voluntarioId)).size,
      solicitudes: solicitudes.length,
      solicitudesAbiertas: solicitudes.filter((s) => s.estado === "PENDIENTE" || s.estado === "EN_REVISION").length,
    },
    participacion: {
      usuariosRegistrados,
      donantes: donantes.length,
      voluntarios: voluntarios.length,
      beneficiarios: beneficiarios.length,
    },
    donacionesPorEstado: contarPor(donaciones, (d) => d.estado, ["COMPLETADA", "PENDIENTE", "FALLIDA"] as const),
    recaudoPorCanal: canales.map((canal) => ({
      clave: canal,
      total: suma(completadas.filter((d) => d.canal === canal)),
    })),
    recaudoPorMes: [...porMes.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([mes, v]) => ({ mes, ...v })),
    campanas: campanas.map((c) => {
      const recaudado = Number(recaudoPorCampana.find((r) => r.campanaId === c.id)?._sum.monto ?? 0);
      const meta = Number(c.metaMonto);
      return {
        id: c.id,
        titulo: c.titulo,
        programa: c.programa.nombre,
        meta,
        recaudado,
        porcentaje: meta > 0 ? Math.min(100, Number(((recaudado / meta) * 100).toFixed(1))) : 0,
      };
    }),
    inscripcionesPorEstado: contarPor(inscripciones, (i) => i.estado, ["ACEPTADA", "PENDIENTE", "RECHAZADA"] as const),
    solicitudesPorEstado: contarPor(
      solicitudes,
      (s) => s.estado,
      ["APROBADA", "EN_REVISION", "PENDIENTE", "RECHAZADA"] as const,
    ),
    solicitudesPorTipo: contarPor(
      solicitudes,
      (s) => s.tipoApoyo,
      ["ALIMENTOS", "SALUD", "EDUCACION", "VIVIENDA", "EMPLEO", "OTRO"] as const,
    ),
    proximasActividades: actividades.map((a) => {
      const inscritos = inscritosPorActividad.find((c) => c.actividadId === a.id)?._count._all ?? 0;
      return {
        id: a.id,
        titulo: a.titulo,
        programa: a.programa.nombre,
        fecha: a.fecha,
        horaInicio: a.horaInicio,
        horaFin: a.horaFin,
        lugar: a.lugar,
        cupo: a.cupo,
        inscritos,
      };
    }),
    actividadReciente: recientes.map((h) => ({
      id: h.id,
      entidad: h.entidad,
      entidadId: h.entidadId,
      estadoAnterior: h.estadoAnterior,
      estadoNuevo: h.estadoNuevo,
      nota: h.nota,
      usuario: h.usuario?.nombre ?? "Usuario eliminado",
      porAdmin: h.usuario?.rol === "ADMIN",
      creadoEn: h.creadoEn,
    })),
  });
});

// --- Exportación CSV (se abre directo en Excel: separador ";" y BOM para las tildes) ---

const formatoFecha = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Bogota",
  dateStyle: "short",
  timeStyle: "short",
});

function celda(valor: unknown): string {
  const texto = valor instanceof Date ? formatoFecha.format(valor) : String(valor ?? "");
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function enviarCsv(res: import("express").Response, nombre: string, encabezados: string[], filas: unknown[][]) {
  const contenido = [encabezados, ...filas].map((fila) => fila.map(celda).join(";")).join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${nombre}.csv"`);
  res.send(`﻿${contenido}`);
}

reportesRouter.get("/exportar/donaciones", async (req, res) => {
  const donaciones = await prisma.donacion.findMany({
    where: rangoFechas(req),
    include: { campana: { include: { programa: true } }, donante: { select: { nombre: true, email: true } }, pago: true },
    orderBy: { creadoEn: "desc" },
  });
  enviarCsv(
    res,
    "redminuto-donaciones",
    ["Comprobante", "Fecha", "Donante", "Correo", "Programa", "Campaña", "Canal", "Monto", "Estado", "Referencia pago"],
    donaciones.map((d) => [
      numeroComprobante(d.id),
      d.creadoEn,
      d.donante?.nombre ?? "(usuario eliminado)",
      d.donante?.email ?? "",
      d.campana.programa.nombre,
      d.campana.titulo,
      d.canal,
      Number(d.monto),
      d.estado,
      d.pago?.referencia ?? "",
    ]),
  );
});

reportesRouter.get("/exportar/inscripciones", async (req, res) => {
  const inscripciones = await prisma.inscripcionVoluntario.findMany({
    where: rangoFechas(req),
    include: { voluntario: { select: { nombre: true, email: true } }, programa: true, actividad: true },
    orderBy: { creadoEn: "desc" },
  });
  enviarCsv(
    res,
    "redminuto-voluntariado",
    ["ID", "Fecha inscripción", "Voluntario", "Correo", "Programa", "Actividad", "Fecha actividad", "Estado"],
    inscripciones.map((i) => [
      i.id,
      i.creadoEn,
      i.voluntario.nombre,
      i.voluntario.email,
      i.programa.nombre,
      i.actividad?.titulo ?? "(programa general)",
      i.actividad ? i.actividad.fecha.toISOString().slice(0, 10) : "",
      i.estado,
    ]),
  );
});

reportesRouter.get("/exportar/solicitudes", async (req, res) => {
  const solicitudes = await prisma.solicitudBeneficiario.findMany({
    where: rangoFechas(req),
    include: { programa: true },
    orderBy: { creadoEn: "desc" },
  });
  enviarCsv(
    res,
    "redminuto-solicitudes",
    ["ID", "Fecha", "Nombre", "Documento", "Teléfono", "Ciudad", "Personas a cargo", "Programa", "Tipo de apoyo", "Estado"],
    solicitudes.map((s) => [
      s.id,
      s.creadoEn,
      s.nombreCompleto,
      `${s.tipoDocumento} ${s.numeroDocumento}`,
      s.telefono,
      s.ciudad,
      s.personasACargo,
      s.programa.nombre,
      s.tipoApoyo,
      s.estado,
    ]),
  );
});
