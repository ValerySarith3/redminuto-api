"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const comprobante_1 = require("../lib/comprobante");
const historial_1 = require("../lib/historial");
const certificado_1 = require("../lib/certificado");
exports.dashboardRouter = (0, express_1.Router)();
async function avanceCampana(campanaId) {
    const campana = await prisma_1.prisma.campana.findUnique({ where: { id: campanaId } });
    if (!campana)
        return null;
    const agregado = await prisma_1.prisma.donacion.aggregate({
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
async function avanceProgramaVoluntarios(programaId) {
    const programa = await prisma_1.prisma.programa.findUnique({ where: { id: programaId } });
    if (!programa)
        return null;
    // El cupo del programa es la suma de los cupos de sus jornadas próximas.
    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0);
    const jornadas = await prisma_1.prisma.actividad.findMany({
        where: { programaId, fecha: { gte: hoy } },
        select: { id: true, cupo: true },
    });
    const inscritos = await prisma_1.prisma.inscripcionVoluntario.count({
        where: { actividadId: { in: jornadas.map((j) => j.id) }, estado: { not: "RECHAZADA" } },
    });
    const cupo = jornadas.reduce((total, j) => total + j.cupo, 0);
    const porcentaje = cupo > 0 ? Math.min(100, (inscritos / cupo) * 100) : 0;
    return {
        programaId,
        nombre: programa.nombre,
        jornadas: jornadas.length,
        cupo,
        inscritos,
        faltan: Math.max(0, cupo - inscritos),
        porcentaje: Number(porcentaje.toFixed(2)),
    };
}
exports.dashboardRouter.get("/campanas/:id", async (req, res) => {
    const avance = await avanceCampana(Number(req.params.id));
    if (!avance)
        return res.status(404).json({ error: "Campaña no encontrada" });
    res.json(avance);
});
exports.dashboardRouter.get("/programas/:id", async (req, res) => {
    const avance = await avanceProgramaVoluntarios(Number(req.params.id));
    if (!avance)
        return res.status(404).json({ error: "Programa no encontrado" });
    res.json(avance);
});
exports.dashboardRouter.get("/mio", auth_1.requireAuth, async (req, res) => {
    const userId = req.user.id;
    const [donaciones, inscripciones, solicitudes] = await Promise.all([
        prisma_1.prisma.donacion.findMany({
            where: { donanteId: userId },
            include: { campana: true },
            orderBy: { creadoEn: "desc" },
        }),
        prisma_1.prisma.inscripcionVoluntario.findMany({
            where: { voluntarioId: userId },
            include: { programa: true, actividad: true },
            orderBy: { creadoEn: "desc" },
        }),
        prisma_1.prisma.solicitudBeneficiario.findMany({
            where: { beneficiarioId: userId },
            include: { programa: true },
            orderBy: { creadoEn: "desc" },
        }),
    ]);
    const campanaIds = [...new Set(donaciones.map((d) => d.campanaId))];
    const programaIdsVoluntario = [...new Set(inscripciones.map((i) => i.programaId))];
    const [avancesCampanas, novedades] = await Promise.all([
        Promise.all(campanaIds.map(avanceCampana)),
        // Novedades de impacto de las campañas a las que la persona ha donado.
        prisma_1.prisma.novedadCampana.findMany({
            where: { campanaId: { in: campanaIds } },
            include: { campana: { select: { id: true, titulo: true } } },
            orderBy: { creadoEn: "desc" },
            take: 20,
        }),
    ]);
    const avancesProgramas = await Promise.all(programaIdsVoluntario.map(avanceProgramaVoluntarios));
    const [histDonaciones, histInscripciones, histSolicitudes] = await Promise.all([
        (0, historial_1.historialDe)("DONACION", donaciones.map((d) => d.id)),
        (0, historial_1.historialDe)("INSCRIPCION", inscripciones.map((i) => i.id)),
        (0, historial_1.historialDe)("SOLICITUD", solicitudes.map((s) => s.id)),
    ]);
    const lineaDeTiempo = (lista, id) => lista
        .filter((h) => h.entidadId === id)
        .map((h) => ({
        estadoAnterior: h.estadoAnterior,
        estadoNuevo: h.estadoNuevo,
        nota: h.nota,
        creadoEn: h.creadoEn,
        porAdmin: h.usuario?.rol === "ADMIN",
    }));
    const donacionesConAvance = donaciones.map((d) => ({
        id: d.id,
        numeroComprobante: (0, comprobante_1.numeroComprobante)(d.id),
        monto: Number(d.monto),
        canal: d.canal,
        estado: d.estado,
        creadoEn: d.creadoEn,
        campana: {
            id: d.campana.id,
            titulo: d.campana.titulo,
            avance: avancesCampanas.find((a) => a?.campanaId === d.campanaId) ?? null,
        },
        historial: lineaDeTiempo(histDonaciones, d.id),
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
        actividad: i.actividad
            ? {
                id: i.actividad.id,
                titulo: i.actividad.titulo,
                fecha: i.actividad.fecha,
                horaInicio: i.actividad.horaInicio,
                horaFin: i.actividad.horaFin,
                lugar: i.actividad.lugar,
                finalizaEn: (0, certificado_1.finDeJornada)(i.actividad.fecha, i.actividad.horaFin),
            }
            : null,
        certificadoDisponible: (0, certificado_1.certificadoDisponible)(i.estado, i.actividad),
        historial: lineaDeTiempo(histInscripciones, i.id),
    }));
    const solicitudesConPrograma = solicitudes.map((s) => ({
        id: s.id,
        descripcion: s.descripcion,
        tipoApoyo: s.tipoApoyo,
        estado: s.estado,
        creadoEn: s.creadoEn,
        programa: { id: s.programa.id, nombre: s.programa.nombre },
        historial: lineaDeTiempo(histSolicitudes, s.id),
    }));
    res.json({
        donaciones: donacionesConAvance,
        inscripciones: inscripcionesConAvance,
        solicitudes: solicitudesConPrograma,
        novedades: novedades.map((n) => ({
            id: n.id,
            titulo: n.titulo,
            contenido: n.contenido,
            creadoEn: n.creadoEn,
            campana: n.campana,
        })),
    });
});
