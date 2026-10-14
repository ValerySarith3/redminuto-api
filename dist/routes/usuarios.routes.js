"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuariosRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const logCambios_1 = require("../lib/logCambios");
const auth_1 = require("../middleware/auth");
const listasMaestras_1 = require("../lib/listasMaestras");
const consentimiento_1 = require("../lib/consentimiento");
exports.usuariosRouter = (0, express_1.Router)();
const ROLES_VALIDOS = ["USUARIO", "ADMIN"];
const PASSWORD_MIN = 8;
const ETIQUETA_ROL = { USUARIO: "Usuario", ADMIN: "Administrador" };
const datosPerfil = {
    id: true,
    nombre: true,
    email: true,
    rol: true,
    telefono: true,
    tipoDocumentoId: true,
    tipoDocumento: listasMaestras_1.opcionResumen,
    numeroDocumento: true,
    ciudad: true,
    creadoEn: true,
};
function passwordValida(password) {
    return typeof password === "string" && password.length >= PASSWORD_MIN && /[a-zA-Z]/.test(password) && /\d/.test(password);
}
exports.usuariosRouter.get("/", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (_req, res) => {
    const usuarios = await prisma_1.prisma.usuario.findMany({
        select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            tipoDocumentoId: true,
            tipoDocumento: listasMaestras_1.opcionResumen,
            numeroDocumento: true,
            ciudad: true,
            rol: true,
            creadoEn: true,
            _count: { select: { donaciones: true, inscripciones: true, solicitudes: true } },
        },
        orderBy: { creadoEn: "desc" },
    });
    res.json(usuarios);
});
exports.usuariosRouter.post("/", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    if (!ROLES_VALIDOS.includes(rol)) {
        return res.status(400).json({ error: "Rol inválido" });
    }
    const existente = await prisma_1.prisma.usuario.findUnique({ where: { email } });
    if (existente)
        return res.status(409).json({ error: "Ese correo ya está registrado" });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const usuario = await prisma_1.prisma.usuario.create({
        data: { nombre, email, passwordHash, rol },
        select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
    });
    await (0, logCambios_1.registrarCambio)(req, {
        modulo: "USUARIOS",
        accion: "CREAR",
        afectado: { tipo: "Usuario", nombre: `${usuario.nombre} (${usuario.email})` },
        descripcion: `Creó la cuenta de ${usuario.nombre} (${usuario.email}) con rol ${ETIQUETA_ROL[usuario.rol]}`,
        nuevo: { Nombre: usuario.nombre, Correo: usuario.email, Rol: ETIQUETA_ROL[usuario.rol] },
    });
    res.status(201).json(usuario);
});
exports.usuariosRouter.put("/:id/rol", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { rol } = req.body;
    if (!ROLES_VALIDOS.includes(rol)) {
        return res.status(400).json({ error: "Rol inválido" });
    }
    if (Number(req.params.id) === req.user.id && rol !== "ADMIN") {
        return res.status(400).json({ error: "No puedes quitarte el rol de administrador a ti mismo" });
    }
    const anterior = await prisma_1.prisma.usuario.findUnique({ where: { id: Number(req.params.id) }, select: { rol: true } });
    if (!anterior)
        return res.status(404).json({ error: "Usuario no encontrado" });
    const usuario = await prisma_1.prisma.usuario.update({
        where: { id: Number(req.params.id) },
        data: { rol },
        select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
    });
    if (anterior.rol !== rol) {
        await (0, logCambios_1.registrarCambio)(req, {
            modulo: "USUARIOS",
            accion: "CAMBIO_ROL",
            afectado: { tipo: "Usuario", nombre: `${usuario.nombre} (${usuario.email})` },
            descripcion: `Cambió el rol de ${usuario.nombre} (${usuario.email}) de ${ETIQUETA_ROL[anterior.rol]} a ${ETIQUETA_ROL[rol]}`,
            anterior: { Rol: ETIQUETA_ROL[anterior.rol] },
            nuevo: { Rol: ETIQUETA_ROL[rol] },
        });
    }
    res.json(usuario);
});
exports.usuariosRouter.put("/:id", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, email, rol, telefono, numeroDocumento, ciudad, password } = req.body;
    const tipoDocumentoId = (0, listasMaestras_1.idOpcion)(req.body.tipoDocumentoId);
    if (!nombre || !email || !rol) {
        return res.status(400).json({ error: "Nombre, correo y rol son obligatorios" });
    }
    if (!ROLES_VALIDOS.includes(rol)) {
        return res.status(400).json({ error: "Rol inválido" });
    }
    if (id === req.user.id && rol !== "ADMIN") {
        return res.status(400).json({ error: "No puedes quitarte el rol de administrador a ti mismo" });
    }
    const anterior = await prisma_1.prisma.usuario.findUnique({
        where: { id },
        select: { ...datosPerfil, passwordHash: true },
    });
    if (!anterior)
        return res.status(404).json({ error: "Usuario no encontrado" });
    if (tipoDocumentoId !== null && !(await (0, listasMaestras_1.opcionValida)(listasMaestras_1.LISTA.TIPO_DOCUMENTO, tipoDocumentoId, anterior.tipoDocumentoId))) {
        return res.status(400).json({ error: "Tipo de documento inválido" });
    }
    const emailLimpio = String(email).trim().toLowerCase();
    if (emailLimpio !== anterior.email.toLowerCase()) {
        const existe = await prisma_1.prisma.usuario.findUnique({ where: { email: emailLimpio } });
        if (existe && existe.id !== id) {
            return res.status(409).json({ error: "Ese correo ya está registrado por otro usuario" });
        }
    }
    const cambioPassword = Boolean(password && String(password).trim().length > 0);
    if (cambioPassword) {
        if (!passwordValida(password)) {
            return res.status(400).json({
                error: `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres, con letras y números`,
            });
        }
    }
    const dataToUpdate = {
        nombre: String(nombre).trim(),
        email: emailLimpio,
        rol,
        telefono: telefono ? String(telefono).trim() : null,
        tipoDocumentoId,
        numeroDocumento: numeroDocumento ? String(numeroDocumento).trim() : null,
        ciudad: ciudad ? String(ciudad).trim() : null,
    };
    if (cambioPassword) {
        dataToUpdate.passwordHash = await bcryptjs_1.default.hash(password, 10);
    }
    const actualizado = await prisma_1.prisma.usuario.update({
        where: { id },
        data: dataToUpdate,
        select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            tipoDocumentoId: true,
            tipoDocumento: listasMaestras_1.opcionResumen,
            numeroDocumento: true,
            ciudad: true,
            rol: true,
            creadoEn: true,
            _count: { select: { donaciones: true, inscripciones: true, solicitudes: true } },
        },
    });
    const contactoAnterior = {
        Nombre: anterior.nombre,
        Correo: anterior.email,
        Rol: ETIQUETA_ROL[anterior.rol],
        Celular: anterior.telefono,
        "Tipo de doc.": anterior.tipoDocumento?.nombre,
        "Nº de doc.": anterior.numeroDocumento,
        Ciudad: anterior.ciudad,
        ...(cambioPassword ? { Contraseña: "••••••••" } : {}),
    };
    const contactoNuevo = {
        Nombre: actualizado.nombre,
        Correo: actualizado.email,
        Rol: ETIQUETA_ROL[actualizado.rol],
        Celular: actualizado.telefono,
        "Tipo de doc.": actualizado.tipoDocumento?.nombre,
        "Nº de doc.": actualizado.numeroDocumento,
        Ciudad: actualizado.ciudad,
        ...(cambioPassword ? { Contraseña: "Nueva contraseña asignada (oculta)" } : {}),
    };
    await (0, logCambios_1.registrarCambio)(req, {
        modulo: "USUARIOS",
        accion: "ACTUALIZAR_DATOS",
        afectado: { tipo: "Usuario", nombre: `${actualizado.nombre} (${actualizado.email})` },
        descripcion: `Actualizó los datos de ${actualizado.nombre} (${actualizado.email})`,
        ...(0, logCambios_1.cambios)(contactoAnterior, contactoNuevo),
    });
    res.json(actualizado);
});
exports.usuariosRouter.delete("/:id", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const id = Number(req.params.id);
    if (id === req.user.id) {
        return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
    }
    const eliminado = await prisma_1.prisma.usuario.delete({ where: { id } });
    await (0, logCambios_1.registrarCambio)(req, {
        modulo: "USUARIOS",
        accion: "ELIMINAR",
        afectado: { tipo: "Usuario", nombre: `${eliminado.nombre} (${eliminado.email})` },
        descripcion: `Eliminó la cuenta de ${eliminado.nombre} (${eliminado.email})`,
        anterior: {
            Nombre: eliminado.nombre,
            Correo: eliminado.email,
            Rol: ETIQUETA_ROL[eliminado.rol],
            Celular: eliminado.telefono,
        },
    });
    res.status(204).send();
});
exports.usuariosRouter.post("/registro", async (req, res) => {
    const { nombre, email, password, aceptaTratamientoDatos } = req.body;
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    if (!aceptaTratamientoDatos) {
        return res.status(400).json({ error: "Debes aceptar la política de tratamiento de datos para registrarte" });
    }
    const existente = await prisma_1.prisma.usuario.findUnique({ where: { email } });
    if (existente)
        return res.status(409).json({ error: "Ese correo ya está registrado" });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const usuario = await prisma_1.prisma.usuario.create({
        data: {
            nombre,
            email,
            passwordHash,
            rol: "USUARIO",
            consentimientos: { create: { finalidad: "REGISTRO", versionPolitica: consentimiento_1.VERSION_POLITICA_DATOS } },
        },
    });
    const token = (0, auth_1.firmarToken)({ id: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
    res.status(201).json({
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
});
exports.usuariosRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const usuario = await prisma_1.prisma.usuario.findUnique({ where: { email } });
    const ok = usuario ? await bcryptjs_1.default.compare(String(password ?? ""), usuario.passwordHash) : false;
    if (!usuario || !ok) {
        return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const token = (0, auth_1.firmarToken)({ id: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
    res.json({
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
});
exports.usuariosRouter.get("/yo", auth_1.requireAuth, async (req, res) => {
    const usuario = await prisma_1.prisma.usuario.findUnique({ where: { id: req.user.id }, select: datosPerfil });
    res.json(usuario);
});
exports.usuariosRouter.put("/yo/contacto", auth_1.requireAuth, async (req, res) => {
    const { telefono, numeroDocumento, ciudad } = req.body;
    const tipoDocumentoId = (0, listasMaestras_1.idOpcion)(req.body.tipoDocumentoId);
    const texto = (v) => (typeof v === "string" ? v.trim() : "");
    if (!/^[0-9+\s()-]{7,20}$/.test(texto(telefono))) {
        return res.status(400).json({ error: "Escribe un número de celular válido" });
    }
    const antes = await prisma_1.prisma.usuario.findUnique({ where: { id: req.user.id }, select: datosPerfil });
    if (tipoDocumentoId !== null && !(await (0, listasMaestras_1.opcionValida)(listasMaestras_1.LISTA.TIPO_DOCUMENTO, tipoDocumentoId, antes?.tipoDocumentoId))) {
        return res.status(400).json({ error: "Tipo de documento inválido" });
    }
    const usuario = await prisma_1.prisma.usuario.update({
        where: { id: req.user.id },
        data: {
            telefono: texto(telefono),
            tipoDocumentoId,
            numeroDocumento: texto(numeroDocumento) || null,
            ciudad: texto(ciudad) || null,
        },
        select: datosPerfil,
    });
    const contacto = (u) => ({
        Celular: u?.telefono,
        "Tipo de documento": u?.tipoDocumento?.nombre,
        "Número de documento": u?.numeroDocumento,
        Ciudad: u?.ciudad,
    });
    await (0, logCambios_1.registrarCambio)(req, {
        modulo: "CUENTAS",
        accion: "ACTUALIZAR_DATOS",
        afectado: { tipo: "Usuario", nombre: `${usuario.nombre} (${usuario.email})` },
        descripcion: "Actualizó sus datos de contacto",
        ...(0, logCambios_1.cambios)(contacto(antes), contacto(usuario)),
    });
    res.json(usuario);
});
exports.usuariosRouter.get("/:id", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const usuario = await prisma_1.prisma.usuario.findUnique({
        where: { id: Number(req.params.id) },
        select: {
            ...datosPerfil,
            donaciones: {
                select: { id: true, monto: true, canal: true, estado: true, creadoEn: true, campana: { select: { titulo: true } } },
                orderBy: { creadoEn: "desc" },
            },
            inscripciones: {
                select: {
                    id: true,
                    estado: true,
                    creadoEn: true,
                    programa: { select: { nombre: true } },
                    actividad: { select: { titulo: true, fecha: true, horaInicio: true, horaFin: true } },
                },
                orderBy: { creadoEn: "desc" },
            },
            solicitudes: {
                select: {
                    id: true,
                    estado: true,
                    tipoApoyo: true,
                    nombreCompleto: true,
                    tipoDocumento: listasMaestras_1.opcionResumen,
                    numeroDocumento: true,
                    telefono: true,
                    direccion: true,
                    ciudad: true,
                    personasACargo: true,
                    creadoEn: true,
                    programa: { select: { nombre: true } },
                },
                orderBy: { creadoEn: "desc" },
            },
            consentimientos: { select: { finalidad: true, versionPolitica: true, aceptadoEn: true }, orderBy: { aceptadoEn: "desc" } },
        },
    });
    if (!usuario)
        return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
});
exports.usuariosRouter.put("/:id/password", auth_1.requireAuth, (0, auth_1.requireRole)("ADMIN"), async (req, res) => {
    const { password } = req.body;
    if (!passwordValida(password)) {
        return res.status(400).json({ error: `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres, con letras y números` });
    }
    const id = Number(req.params.id);
    const existe = await prisma_1.prisma.usuario.findUnique({ where: { id }, select: { nombre: true, email: true } });
    if (!existe)
        return res.status(404).json({ error: "Usuario no encontrado" });
    await prisma_1.prisma.usuario.update({ where: { id }, data: { passwordHash: await bcryptjs_1.default.hash(password, 10) } });
    await (0, logCambios_1.registrarCambio)(req, {
        modulo: "USUARIOS",
        accion: "CAMBIO_CONTRASENA",
        afectado: { tipo: "Usuario", nombre: `${existe.nombre} (${existe.email})` },
        descripcion: `Cambió la contraseña de ${existe.nombre} (${existe.email})`,
        anterior: { Contraseña: "••••••••" },
        nuevo: { Contraseña: "Nueva contraseña asignada (oculta)" },
    });
    res.status(204).send();
});
