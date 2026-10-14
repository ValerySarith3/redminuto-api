"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportesRouter = void 0;
const express_1 = require("express");
const exceljs_1 = __importDefault(require("exceljs"));
const prisma_1 = require("../lib/prisma");
const listasMaestras_1 = require("../lib/listasMaestras");
const auth_1 = require("../middleware/auth");
const comprobante_1 = require("../lib/comprobante");
exports.reportesRouter = (0, express_1.Router)();
exports.reportesRouter.use(auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"));
function rangoFechas(req) {
    const { desde, hasta } = req.query;
    const filtro = {};
    if (typeof desde === "string" && desde)
        filtro.gte = new Date(`${desde}T00:00:00`);
    if (typeof hasta === "string" && hasta) {
        const fin = new Date(`${hasta}T00:00:00`);
        fin.setDate(fin.getDate() + 1);
        filtro.lt = fin;
    }
    return Object.keys(filtro).length ? { creadoEn: filtro } : {};
}
function contarPor(lista, clave, todas) {
    const conteo = Object.fromEntries(todas.map((k) => [k, 0]));
    for (const item of lista)
        conteo[clave(item)] = (conteo[clave(item)] ?? 0) + 1;
    return todas.map((k) => ({ clave: k, total: conteo[k] }));
}
exports.reportesRouter.get("/pendientes", async (_req, res) => {
    const [donaciones, inscripciones, solicitudes] = await Promise.all([
        prisma_1.prisma.donacion.count({ where: { estado: "PENDIENTE" } }),
        prisma_1.prisma.inscripcionVoluntario.count({ where: { estado: "PENDIENTE" } }),
        prisma_1.prisma.solicitudBeneficiario.count({ where: { estado: { in: ["PENDIENTE", "EN_REVISION"] } } }),
    ]);
    res.json({ donaciones, inscripciones, solicitudes });
});
exports.reportesRouter.get("/resumen", async (req, res) => {
    res.json(await calcularResumen(rangoFechas(req)));
});
const ENTIDADES = ["DONACION", "INSCRIPCION", "SOLICITUD"];
function formatearHistorial(h) {
    return {
        id: h.id,
        entidad: h.entidad,
        entidadId: h.entidadId,
        estadoAnterior: h.estadoAnterior,
        estadoNuevo: h.estadoNuevo,
        nota: h.nota,
        usuario: h.usuario?.nombre ?? "Usuario eliminado",
        porAdmin: h.usuario?.rol === "ADMIN",
        creadoEn: h.creadoEn,
    };
}
async function calcularResumen(rango) {
    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0);
    const [usuarios, donaciones, inscripciones, solicitudes, campanas, actividades, recientes] = await Promise.all([
        Promise.all([
            prisma_1.prisma.usuario.count({ where: { rol: "USUARIO" } }),
            prisma_1.prisma.donacion.groupBy({ by: ["donanteId"], where: { donanteId: { not: null } } }),
            prisma_1.prisma.inscripcionVoluntario.groupBy({ by: ["voluntarioId"] }),
            prisma_1.prisma.solicitudBeneficiario.groupBy({ by: ["beneficiarioId"] }),
        ]),
        prisma_1.prisma.donacion.findMany({
            where: rango,
            select: { monto: true, estado: true, canal: true, creadoEn: true, donanteId: true },
        }),
        prisma_1.prisma.inscripcionVoluntario.findMany({ where: rango, select: { estado: true, voluntarioId: true } }),
        prisma_1.prisma.solicitudBeneficiario.findMany({ where: rango, select: { estado: true, tipoApoyo: true } }),
        prisma_1.prisma.campana.findMany({ include: { programa: { select: { nombre: true } } } }),
        prisma_1.prisma.actividad.findMany({
            where: { fecha: { gte: hoy } },
            include: { programa: { select: { nombre: true } } },
            orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
            take: 6,
        }),
        prisma_1.prisma.historialEstado.findMany({
            include: { usuario: { select: { nombre: true, rol: true } } },
            orderBy: { creadoEn: "desc" },
            take: 12,
        }),
    ]);
    const recaudoPorCampana = await prisma_1.prisma.donacion.groupBy({
        by: ["campanaId"],
        where: { estado: "COMPLETADA" },
        _sum: { monto: true },
    });
    const inscritosPorActividad = await prisma_1.prisma.inscripcionVoluntario.groupBy({
        by: ["actividadId"],
        where: { actividadId: { in: actividades.map((a) => a.id) }, estado: { not: "RECHAZADA" } },
        _count: { _all: true },
    });
    const completadas = donaciones.filter((d) => d.estado === "COMPLETADA");
    const pendientes = donaciones.filter((d) => d.estado === "PENDIENTE");
    const suma = (lista) => lista.reduce((t, d) => t + Number(d.monto), 0);
    const porMes = new Map();
    for (const d of completadas) {
        const mes = `${d.creadoEn.getFullYear()}-${String(d.creadoEn.getMonth() + 1).padStart(2, "0")}`;
        const actual = porMes.get(mes) ?? { total: 0, cantidad: 0 };
        porMes.set(mes, { total: actual.total + Number(d.monto), cantidad: actual.cantidad + 1 });
    }
    const [usuariosRegistrados, donantes, voluntarios, beneficiarios] = usuarios;
    const canales = ["PASARELA", "TRANSFERENCIA", "LLAVE", "EFECTIVO"];
    return {
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
        donacionesPorEstado: contarPor(donaciones, (d) => d.estado, ["COMPLETADA", "PENDIENTE", "FALLIDA"]),
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
        inscripcionesPorEstado: contarPor(inscripciones, (i) => i.estado, ["ACEPTADA", "PENDIENTE", "RECHAZADA"]),
        solicitudesPorEstado: contarPor(solicitudes, (s) => s.estado, ["APROBADA", "EN_REVISION", "PENDIENTE", "RECHAZADA"]),
        solicitudesPorTipo: contarPor(solicitudes, (s) => s.tipoApoyo, ["ALIMENTOS", "SALUD", "EDUCACION", "VIVIENDA", "EMPLEO", "OTRO"]),
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
        actividadReciente: recientes.map(formatearHistorial),
    };
}
const formatoFecha = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Bogota",
    dateStyle: "short",
    timeStyle: "short",
});
function celda(valor) {
    const texto = valor instanceof Date ? formatoFecha.format(valor) : String(valor ?? "");
    return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}
function enviarCsv(res, nombre, encabezados, filas) {
    const contenido = [encabezados, ...filas].map((fila) => fila.map(celda).join(";")).join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${nombre}.csv"`);
    res.send(`﻿${contenido}`);
}
exports.reportesRouter.get("/exportar/donaciones", async (req, res) => {
    const donaciones = await prisma_1.prisma.donacion.findMany({
        where: rangoFechas(req),
        include: { campana: { include: { programa: true } }, donante: { select: { nombre: true, email: true } }, pago: true },
        orderBy: { creadoEn: "desc" },
    });
    enviarCsv(res, "redminuto-donaciones", ["Comprobante", "Fecha", "Donante", "Correo", "Programa", "Campaña", "Canal", "Monto", "Estado", "Referencia pago"], donaciones.map((d) => [
        (0, comprobante_1.numeroComprobante)(d.id),
        d.creadoEn,
        d.donante?.nombre ?? "(usuario eliminado)",
        d.donante?.email ?? "",
        d.campana.programa.nombre,
        d.campana.titulo,
        d.canal,
        Number(d.monto),
        d.estado,
        d.pago?.referencia ?? "",
    ]));
});
exports.reportesRouter.get("/exportar/inscripciones", async (req, res) => {
    const inscripciones = await prisma_1.prisma.inscripcionVoluntario.findMany({
        where: rangoFechas(req),
        include: { voluntario: { select: { nombre: true, email: true } }, programa: true, actividad: true },
        orderBy: { creadoEn: "desc" },
    });
    enviarCsv(res, "redminuto-voluntariado", ["ID", "Fecha inscripción", "Voluntario", "Correo", "Programa", "Actividad", "Fecha actividad", "Estado"], inscripciones.map((i) => [
        i.id,
        i.creadoEn,
        i.voluntario.nombre,
        i.voluntario.email,
        i.programa.nombre,
        i.actividad?.titulo ?? "(programa general)",
        i.actividad ? i.actividad.fecha.toISOString().slice(0, 10) : "",
        i.estado,
    ]));
});
exports.reportesRouter.get("/exportar/solicitudes", async (req, res) => {
    const solicitudes = await prisma_1.prisma.solicitudBeneficiario.findMany({
        where: rangoFechas(req),
        include: { programa: true, tipoDocumento: listasMaestras_1.opcionResumen },
        orderBy: { creadoEn: "desc" },
    });
    enviarCsv(res, "redminuto-solicitudes", ["ID", "Fecha", "Nombre", "Documento", "Teléfono", "Ciudad", "Personas a cargo", "Programa", "Tipo de apoyo", "Estado"], solicitudes.map((s) => [
        s.id,
        s.creadoEn,
        s.nombreCompleto,
        `${s.tipoDocumento.codigo} ${s.numeroDocumento}`,
        s.telefono,
        s.ciudad,
        s.personasACargo,
        s.programa.nombre,
        s.tipoApoyo,
        s.estado,
    ]));
});
const ETIQUETA = {
    PENDIENTE: "Pendiente",
    COMPLETADA: "Completada",
    FALLIDA: "Fallida",
    ACEPTADA: "Aceptada",
    RECHAZADA: "Rechazada",
    EN_REVISION: "En revisión",
    APROBADA: "Aprobada",
    PASARELA: "Pasarela",
    TRANSFERENCIA: "Transferencia",
    LLAVE: "Llave (Bre-B)",
    EFECTIVO: "Efectivo",
    ALIMENTOS: "Alimentos",
    SALUD: "Salud",
    EDUCACION: "Educación",
    VIVIENDA: "Vivienda",
    EMPLEO: "Empleo",
    OTRO: "Otro",
};
const etiqueta = (valor) => ETIQUETA[valor] ?? valor;
const FORMATO_PESOS = '"$"#,##0';
const FORMATO_FECHA = "yyyy-mm-dd hh:mm";
function agregarHoja(libro, nombre, columnas, filas) {
    const hoja = libro.addWorksheet(nombre, { views: [{ state: "frozen", ySplit: 1 }] });
    hoja.columns = columnas.map((c) => ({ header: c.titulo, width: c.ancho, style: c.formato ? { numFmt: c.formato } : {} }));
    const encabezado = hoja.getRow(1);
    encabezado.font = { bold: true, color: { argb: "FFFFFFFF" } };
    encabezado.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0158B0" } };
    encabezado.alignment = { vertical: "middle" };
    encabezado.height = 20;
    hoja.addRows(filas);
    if (filas.length > 0) {
        hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columnas.length } };
    }
    return hoja;
}
// Excel no maneja zonas horarias: se pasa la hora "de pared" de Bogotá (UTC-5) para que no se corra.
function fechaBogota(fecha) {
    return new Date(fecha.getTime() - 5 * 60 * 60 * 1000);
}
exports.reportesRouter.get("/exportar/excel", async (req, res) => {
    const rango = rangoFechas(req);
    const [resumen, donaciones, inscripciones, solicitudes] = await Promise.all([
        calcularResumen(rango),
        prisma_1.prisma.donacion.findMany({
            where: rango,
            include: {
                campana: { include: { programa: true } },
                donante: { select: { nombre: true, email: true, telefono: true } },
                pago: true,
            },
            orderBy: { creadoEn: "desc" },
        }),
        prisma_1.prisma.inscripcionVoluntario.findMany({
            where: rango,
            include: {
                voluntario: {
                    select: { nombre: true, email: true, telefono: true, tipoDocumento: listasMaestras_1.opcionResumen, numeroDocumento: true, ciudad: true },
                },
                programa: true,
                actividad: true,
            },
            orderBy: { creadoEn: "desc" },
        }),
        prisma_1.prisma.solicitudBeneficiario.findMany({
            where: rango,
            include: { programa: true, beneficiario: { select: { email: true } }, tipoDocumento: listasMaestras_1.opcionResumen },
            orderBy: { creadoEn: "desc" },
        }),
    ]);
    const libro = new exceljs_1.default.Workbook();
    libro.creator = "RedMinuto";
    libro.created = new Date();
    const { desde, hasta } = req.query;
    const periodo = `${typeof desde === "string" && desde ? desde : "inicio"} a ${typeof hasta === "string" && hasta ? hasta : "hoy"}`;
    const k = resumen.kpis;
    const filasResumen = [
        ["Periodo", periodo],
        ["Recaudo confirmado", k.totalRecaudado],
        ["Donaciones confirmadas", k.donacionesConfirmadas],
        ["Donantes distintos", k.donantesUnicos],
        ["Pagos por confirmar (cantidad)", k.pendientesPorConfirmar.cantidad],
        ["Pagos por confirmar (monto)", k.pendientesPorConfirmar.monto],
        ["Inscripciones de voluntariado", k.inscripciones],
        ["Voluntarios distintos", k.voluntariosUnicos],
        ["Solicitudes de ayuda", k.solicitudes],
        ["Solicitudes abiertas", k.solicitudesAbiertas],
        [],
        ["Recaudo por canal", ""],
        ...resumen.recaudoPorCanal.map((c) => [`   ${etiqueta(c.clave)}`, c.total]),
        [],
        ["Solicitudes por tipo de apoyo", ""],
        ...resumen.solicitudesPorTipo.map((t) => [`   ${etiqueta(t.clave)}`, t.total]),
    ];
    const hojaResumen = agregarHoja(libro, "Resumen", [
        { titulo: "Indicador", ancho: 38 },
        { titulo: "Valor", ancho: 24 },
    ], filasResumen);
    // Fila 1 = encabezado; los datos empiezan en la fila 2.
    const filaDe = (texto) => filasResumen.findIndex((f) => f[0] === texto) + 2;
    const inicioCanales = filaDe("Recaudo por canal");
    for (const fila of [filaDe("Recaudo confirmado"), filaDe("Pagos por confirmar (monto)")]) {
        hojaResumen.getCell(`B${fila}`).numFmt = FORMATO_PESOS;
    }
    resumen.recaudoPorCanal.forEach((_, i) => (hojaResumen.getCell(`B${inicioCanales + 1 + i}`).numFmt = FORMATO_PESOS));
    for (const fila of [inicioCanales, filaDe("Solicitudes por tipo de apoyo")]) {
        hojaResumen.getCell(`A${fila}`).font = { bold: true };
    }
    agregarHoja(libro, "Campañas", [
        { titulo: "Campaña", ancho: 36 },
        { titulo: "Programa", ancho: 28 },
        { titulo: "Meta", ancho: 16, formato: FORMATO_PESOS },
        { titulo: "Recaudado", ancho: 16, formato: FORMATO_PESOS },
        { titulo: "Avance %", ancho: 11 },
    ], resumen.campanas.map((c) => [c.titulo, c.programa, c.meta, c.recaudado, c.porcentaje]));
    agregarHoja(libro, "Donaciones", [
        { titulo: "Comprobante", ancho: 16 },
        { titulo: "Fecha", ancho: 18, formato: FORMATO_FECHA },
        { titulo: "Donante", ancho: 28 },
        { titulo: "Correo", ancho: 30 },
        { titulo: "Celular", ancho: 16 },
        { titulo: "Programa", ancho: 26 },
        { titulo: "Campaña", ancho: 30 },
        { titulo: "Canal", ancho: 16 },
        { titulo: "Monto", ancho: 14, formato: FORMATO_PESOS },
        { titulo: "Estado", ancho: 13 },
        { titulo: "Referencia de pago", ancho: 38 },
    ], donaciones.map((d) => [
        (0, comprobante_1.numeroComprobante)(d.id),
        fechaBogota(d.creadoEn),
        d.donante?.nombre ?? "(usuario eliminado)",
        d.donante?.email ?? "",
        d.donante?.telefono ?? "",
        d.campana.programa.nombre,
        d.campana.titulo,
        etiqueta(d.canal),
        Number(d.monto),
        etiqueta(d.estado),
        d.pago?.referencia ?? "",
    ]));
    agregarHoja(libro, "Voluntariado", [
        { titulo: "ID", ancho: 7 },
        { titulo: "Fecha inscripción", ancho: 18, formato: FORMATO_FECHA },
        { titulo: "Voluntario", ancho: 28 },
        { titulo: "Correo", ancho: 30 },
        { titulo: "Celular", ancho: 16 },
        { titulo: "Documento", ancho: 18 },
        { titulo: "Ciudad", ancho: 16 },
        { titulo: "Programa", ancho: 26 },
        { titulo: "Actividad", ancho: 30 },
        { titulo: "Fecha actividad", ancho: 15 },
        { titulo: "Horario", ancho: 13 },
        { titulo: "Estado", ancho: 12 },
    ], inscripciones.map((i) => [
        i.id,
        fechaBogota(i.creadoEn),
        i.voluntario.nombre,
        i.voluntario.email,
        i.voluntario.telefono ?? "",
        i.voluntario.numeroDocumento ? `${i.voluntario.tipoDocumento?.codigo ?? ""} ${i.voluntario.numeroDocumento}`.trim() : "",
        i.voluntario.ciudad ?? "",
        i.programa.nombre,
        i.actividad?.titulo ?? "(programa general)",
        i.actividad ? i.actividad.fecha.toISOString().slice(0, 10) : "",
        i.actividad ? `${i.actividad.horaInicio}–${i.actividad.horaFin}` : "",
        etiqueta(i.estado),
    ]));
    agregarHoja(libro, "Solicitudes", [
        { titulo: "ID", ancho: 7 },
        { titulo: "Fecha", ancho: 18, formato: FORMATO_FECHA },
        { titulo: "Nombre", ancho: 28 },
        { titulo: "Documento", ancho: 18 },
        { titulo: "Teléfono", ancho: 16 },
        { titulo: "Correo de la cuenta", ancho: 30 },
        { titulo: "Dirección", ancho: 30 },
        { titulo: "Ciudad", ancho: 16 },
        { titulo: "Personas a cargo", ancho: 10 },
        { titulo: "Programa", ancho: 26 },
        { titulo: "Tipo de apoyo", ancho: 14 },
        { titulo: "Descripción", ancho: 50 },
        { titulo: "Estado", ancho: 13 },
    ], solicitudes.map((s) => [
        s.id,
        fechaBogota(s.creadoEn),
        s.nombreCompleto,
        `${s.tipoDocumento.codigo} ${s.numeroDocumento}`,
        s.telefono,
        s.beneficiario.email,
        s.direccion,
        s.ciudad,
        s.personasACargo,
        s.programa.nombre,
        etiqueta(s.tipoApoyo),
        s.descripcion,
        etiqueta(s.estado),
    ]));
    agregarHoja(libro, "Próximas jornadas", [
        { titulo: "Actividad", ancho: 32 },
        { titulo: "Programa", ancho: 26 },
        { titulo: "Fecha", ancho: 13 },
        { titulo: "Horario", ancho: 13 },
        { titulo: "Lugar", ancho: 30 },
        { titulo: "Inscritos", ancho: 10 },
        { titulo: "Cupo", ancho: 8 },
    ], resumen.proximasActividades.map((a) => [
        a.titulo,
        a.programa,
        a.fecha.toISOString().slice(0, 10),
        `${a.horaInicio}–${a.horaFin}`,
        a.lugar,
        a.inscritos,
        a.cupo,
    ]));
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="redminuto-reporte.xlsx"');
    await libro.xlsx.write(res);
    res.end();
});
const MODULO_DE_ENTIDAD = { DONACION: "DONACIONES", INSCRIPCION: "VOLUNTARIADO", SOLICITUD: "SOLICITUDES" };
const MAX_POR_FUENTE = 3000;
function leerDatos(json) {
    if (!json)
        return null;
    try {
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
const datosEnTexto = (datos) => datos ? Object.entries(datos).map(([campo, valor]) => `${campo}: ${valor}`).join(" | ") : "";
const pesosTexto = (valor) => `$${Math.round(Number(valor)).toLocaleString("es-CO")}`;
// Une el log de cambios con el historial de estados, describiendo cada registro en palabras.
async function eventosLog(rango) {
    const conUsuario = { usuario: { select: { nombre: true, email: true, rol: true } } };
    const [log, historial] = await Promise.all([
        prisma_1.prisma.logCambio.findMany({ where: rango, include: conUsuario, orderBy: { creadoEn: "desc" }, take: MAX_POR_FUENTE }),
        prisma_1.prisma.historialEstado.findMany({ where: { ...rango, estadoAnterior: { not: null } }, include: conUsuario, orderBy: { creadoEn: "desc" }, take: MAX_POR_FUENTE }),
    ]);
    const ids = (entidad) => [...new Set(historial.filter((h) => h.entidad === entidad).map((h) => h.entidadId))];
    const [donaciones, inscripciones, solicitudes] = await Promise.all([
        prisma_1.prisma.donacion.findMany({
            where: { id: { in: ids("DONACION") } },
            select: { id: true, monto: true, canal: true, campana: { select: { titulo: true } }, donante: { select: { nombre: true } } },
        }),
        prisma_1.prisma.inscripcionVoluntario.findMany({
            where: { id: { in: ids("INSCRIPCION") } },
            select: {
                id: true,
                voluntario: { select: { nombre: true } },
                programa: { select: { nombre: true } },
                actividad: { select: { titulo: true } },
            },
        }),
        prisma_1.prisma.solicitudBeneficiario.findMany({
            where: { id: { in: ids("SOLICITUD") } },
            select: { id: true, nombreCompleto: true, tipoApoyo: true, programa: { select: { nombre: true } } },
        }),
    ]);
    const donacionPorId = new Map(donaciones.map((d) => [d.id, d]));
    const inscripcionPorId = new Map(inscripciones.map((i) => [i.id, i]));
    const solicitudPorId = new Map(solicitudes.map((s) => [s.id, s]));
    function describir(entidad, id) {
        if (entidad === "DONACION") {
            const d = donacionPorId.get(id);
            return d
                ? `Donación ${(0, comprobante_1.numeroComprobante)(id)} de ${d.donante?.nombre ?? "usuario eliminado"} por ${pesosTexto(d.monto)} a «${d.campana.titulo}» (${etiqueta(d.canal)})`
                : `Donación ${(0, comprobante_1.numeroComprobante)(id)} (eliminada)`;
        }
        if (entidad === "INSCRIPCION") {
            const i = inscripcionPorId.get(id);
            return i
                ? `Inscripción #${id} de ${i.voluntario.nombre} a «${i.actividad?.titulo ?? `${i.programa.nombre} (programa general)`}»`
                : `Inscripción #${id} (eliminada)`;
        }
        const s = solicitudPorId.get(id);
        return s
            ? `Solicitud de ayuda #${id} de ${s.nombreCompleto} · ${etiqueta(s.tipoApoyo)} en «${s.programa.nombre}»`
            : `Solicitud de ayuda #${id} (eliminada)`;
    }
    function afectadoDe(entidad, id) {
        if (entidad === "DONACION") {
            const d = donacionPorId.get(id);
            return {
                tipo: "Donación",
                nombre: d
                    ? `${(0, comprobante_1.numeroComprobante)(id)} · ${d.donante?.nombre ?? "usuario eliminado"} · ${pesosTexto(d.monto)}`
                    : `${(0, comprobante_1.numeroComprobante)(id)} (eliminada)`,
            };
        }
        if (entidad === "INSCRIPCION") {
            const i = inscripcionPorId.get(id);
            return {
                tipo: "Inscripción de voluntario",
                nombre: i ? `${i.voluntario.nombre} · ${i.actividad?.titulo ?? i.programa.nombre}` : `#${id} (eliminada)`,
            };
        }
        const s = solicitudPorId.get(id);
        return {
            tipo: "Solicitud de ayuda",
            nombre: s ? `${s.nombreCompleto} · ${etiqueta(s.tipoApoyo)}` : `#${id} (eliminada)`,
        };
    }
    const eventos = [
        ...log.map((a) => ({
            id: `A-${a.id}`,
            fecha: a.creadoEn,
            modulo: a.modulo,
            accion: a.accion,
            descripcion: a.descripcion,
            afectado: a.afectadoTipo && a.afectadoNombre ? { tipo: a.afectadoTipo, nombre: a.afectadoNombre } : null,
            informacionAnterior: leerDatos(a.datosAnteriores),
            informacionNueva: leerDatos(a.datosNuevos),
            nota: null,
            ip: a.ip,
            usuario: a.usuario,
        })),
        ...historial.map((h) => ({
            id: `H-${h.id}`,
            fecha: h.creadoEn,
            modulo: MODULO_DE_ENTIDAD[h.entidad],
            accion: "CAMBIO_ESTADO",
            descripcion: describir(h.entidad, h.entidadId),
            afectado: afectadoDe(h.entidad, h.entidadId),
            informacionAnterior: h.estadoAnterior ? { Estado: etiqueta(h.estadoAnterior) } : null,
            informacionNueva: { Estado: etiqueta(h.estadoNuevo) },
            nota: h.nota,
            ip: null,
            usuario: h.usuario,
        })),
    ];
    return eventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}
exports.reportesRouter.get("/log-cambios", async (req, res) => {
    const { modulo, accion, formato } = req.query;
    const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
    const filtrados = (await eventosLog(rangoFechas(req))).filter((e) => (!modulo || e.modulo === modulo) &&
        (!accion || e.accion === accion) &&
        (!q ||
            [
                e.descripcion,
                e.afectado?.nombre ?? "",
                e.afectado?.tipo ?? "",
                e.nota ?? "",
                e.usuario?.nombre ?? "",
                e.usuario?.email ?? "",
                e.ip ?? "",
                datosEnTexto(e.informacionAnterior),
                datosEnTexto(e.informacionNueva),
            ].some((campo) => campo.toLowerCase().includes(q))));
    if (formato === "csv") {
        return enviarCsv(res, "redminuto-log-de-cambios", ["Fecha", "Realizado por", "Correo", "Módulo", "Acción", "Tipo de registro afectado", "Registro afectado", "Detalle", "Información anterior", "Información nueva", "Nota"], filtrados.map((e) => [
            e.fecha,
            e.usuario?.nombre ?? "Sistema",
            e.usuario?.email ?? "",
            e.modulo,
            e.accion,
            e.afectado?.tipo ?? "",
            e.afectado?.nombre ?? "",
            e.descripcion,
            datosEnTexto(e.informacionAnterior),
            datosEnTexto(e.informacionNueva),
            e.nota ?? "",
        ]));
    }
    const tamano = Math.min(100, Math.max(5, Number(req.query.tamano) || 25));
    const paginas = Math.max(1, Math.ceil(filtrados.length / tamano));
    const pagina = Math.min(paginas, Math.max(1, Number(req.query.pagina) || 1));
    res.json({
        total: filtrados.length,
        pagina,
        paginas,
        registros: filtrados.slice((pagina - 1) * tamano, pagina * tamano),
    });
});
