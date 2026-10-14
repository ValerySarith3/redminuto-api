import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { registrarCambio, cambios } from "../lib/logCambios";
import { firmarToken, requireAuth, requireRole } from "../middleware/auth";
import type { Rol } from "../generated/prisma/client";
import { LISTA, idOpcion, opcionResumen, opcionValida } from "../lib/listasMaestras";
import { VERSION_POLITICA_DATOS } from "../lib/consentimiento";

export const usuariosRouter = Router();

const ROLES_VALIDOS: Rol[] = ["USUARIO", "ADMIN"];
const PASSWORD_MIN = 8;
const ETIQUETA_ROL: Record<Rol, string> = { USUARIO: "Usuario", ADMIN: "Administrador" };

const datosPerfil = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  telefono: true,
  tipoDocumentoId: true,
  tipoDocumento: opcionResumen,
  numeroDocumento: true,
  ciudad: true,
  creadoEn: true,
} as const;

function passwordValida(password: unknown): password is string {
  return typeof password === "string" && password.length >= PASSWORD_MIN && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

usuariosRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true,
      tipoDocumentoId: true,
      tipoDocumento: opcionResumen,
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

usuariosRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: "Rol inválido" });
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return res.status(409).json({ error: "Ese correo ya está registrado" });

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre, email, passwordHash, rol },
    select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
  });
  await registrarCambio(req, {
    modulo: "USUARIOS",
    accion: "CREAR",
    afectado: { tipo: "Usuario", nombre: `${usuario.nombre} (${usuario.email})` },
    descripcion: `Creó la cuenta de ${usuario.nombre} (${usuario.email}) con rol ${ETIQUETA_ROL[usuario.rol]}`,
    nuevo: { Nombre: usuario.nombre, Correo: usuario.email, Rol: ETIQUETA_ROL[usuario.rol] },
  });
  res.status(201).json(usuario);
});

usuariosRouter.put("/:id/rol", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { rol } = req.body;
  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: "Rol inválido" });
  }
  if (Number(req.params.id) === req.user!.id && rol !== "ADMIN") {
    return res.status(400).json({ error: "No puedes quitarte el rol de administrador a ti mismo" });
  }

  const anterior = await prisma.usuario.findUnique({ where: { id: Number(req.params.id) }, select: { rol: true } });
  if (!anterior) return res.status(404).json({ error: "Usuario no encontrado" });

  const usuario = await prisma.usuario.update({
    where: { id: Number(req.params.id) },
    data: { rol },
    select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
  });
  if (anterior.rol !== rol) {
    await registrarCambio(req, {
      modulo: "USUARIOS",
      accion: "CAMBIO_ROL",
      afectado: { tipo: "Usuario", nombre: `${usuario.nombre} (${usuario.email})` },
      descripcion: `Cambió el rol de ${usuario.nombre} (${usuario.email}) de ${ETIQUETA_ROL[anterior.rol]} a ${ETIQUETA_ROL[rol as Rol]}`,
      anterior: { Rol: ETIQUETA_ROL[anterior.rol] },
      nuevo: { Rol: ETIQUETA_ROL[rol as Rol] },
    });
  }
  res.json(usuario);
});

usuariosRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, email, rol, telefono, numeroDocumento, ciudad, password } = req.body;
  const tipoDocumentoId = idOpcion(req.body.tipoDocumentoId);

  if (!nombre || !email || !rol) {
    return res.status(400).json({ error: "Nombre, correo y rol son obligatorios" });
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: "Rol inválido" });
  }
  if (id === req.user!.id && rol !== "ADMIN") {
    return res.status(400).json({ error: "No puedes quitarte el rol de administrador a ti mismo" });
  }

  const anterior = await prisma.usuario.findUnique({
    where: { id },
    select: { ...datosPerfil, passwordHash: true },
  });
  if (!anterior) return res.status(404).json({ error: "Usuario no encontrado" });
  if (tipoDocumentoId !== null && !(await opcionValida(LISTA.TIPO_DOCUMENTO, tipoDocumentoId, anterior.tipoDocumentoId))) {
    return res.status(400).json({ error: "Tipo de documento inválido" });
  }

  const emailLimpio = String(email).trim().toLowerCase();
  if (emailLimpio !== anterior.email.toLowerCase()) {
    const existe = await prisma.usuario.findUnique({ where: { email: emailLimpio } });
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

  const dataToUpdate: any = {
    nombre: String(nombre).trim(),
    email: emailLimpio,
    rol,
    telefono: telefono ? String(telefono).trim() : null,
    tipoDocumentoId,
    numeroDocumento: numeroDocumento ? String(numeroDocumento).trim() : null,
    ciudad: ciudad ? String(ciudad).trim() : null,
  };

  if (cambioPassword) {
    dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
  }

  const actualizado = await prisma.usuario.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true,
      tipoDocumentoId: true,
      tipoDocumento: opcionResumen,
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

  await registrarCambio(req, {
    modulo: "USUARIOS",
    accion: "ACTUALIZAR_DATOS",
    afectado: { tipo: "Usuario", nombre: `${actualizado.nombre} (${actualizado.email})` },
    descripcion: `Actualizó los datos de ${actualizado.nombre} (${actualizado.email})`,
    ...cambios(contactoAnterior, contactoNuevo),
  });

  res.json(actualizado);
});

usuariosRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user!.id) {
    return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
  }
  const eliminado = await prisma.usuario.delete({ where: { id } });
  await registrarCambio(req, {
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

usuariosRouter.post("/registro", async (req, res) => {
  const { nombre, email, password, aceptaTratamientoDatos } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  if (!aceptaTratamientoDatos) {
    return res.status(400).json({ error: "Debes aceptar la política de tratamiento de datos para registrarte" });
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return res.status(409).json({ error: "Ese correo ya está registrado" });

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash,
      rol: "USUARIO",
      consentimientos: { create: { finalidad: "REGISTRO", versionPolitica: VERSION_POLITICA_DATOS } },
    },
  });

  const token = firmarToken({ id: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
  res.status(201).json({
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  });
});

usuariosRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const ok = usuario ? await bcrypt.compare(String(password ?? ""), usuario.passwordHash) : false;
  if (!usuario || !ok) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = firmarToken({ id: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
  res.json({
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  });
});

usuariosRouter.get("/yo", requireAuth, async (req, res) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: req.user!.id }, select: datosPerfil });
  res.json(usuario);
});

usuariosRouter.put("/yo/contacto", requireAuth, async (req, res) => {
  const { telefono, numeroDocumento, ciudad } = req.body;
  const tipoDocumentoId = idOpcion(req.body.tipoDocumentoId);
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  if (!/^[0-9+\s()-]{7,20}$/.test(texto(telefono))) {
    return res.status(400).json({ error: "Escribe un número de celular válido" });
  }
  const antes = await prisma.usuario.findUnique({ where: { id: req.user!.id }, select: datosPerfil });
  if (tipoDocumentoId !== null && !(await opcionValida(LISTA.TIPO_DOCUMENTO, tipoDocumentoId, antes?.tipoDocumentoId))) {
    return res.status(400).json({ error: "Tipo de documento inválido" });
  }
  const usuario = await prisma.usuario.update({
    where: { id: req.user!.id },
    data: {
      telefono: texto(telefono),
      tipoDocumentoId,
      numeroDocumento: texto(numeroDocumento) || null,
      ciudad: texto(ciudad) || null,
    },
    select: datosPerfil,
  });
  const contacto = (u: typeof usuario | null) => ({
    Celular: u?.telefono,
    "Tipo de documento": u?.tipoDocumento?.nombre,
    "Número de documento": u?.numeroDocumento,
    Ciudad: u?.ciudad,
  });
  await registrarCambio(req, {
    modulo: "CUENTAS",
    accion: "ACTUALIZAR_DATOS",
    afectado: { tipo: "Usuario", nombre: `${usuario.nombre} (${usuario.email})` },
    descripcion: "Actualizó sus datos de contacto",
    ...cambios(contacto(antes), contacto(usuario)),
  });
  res.json(usuario);
});

usuariosRouter.get("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
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
          tipoDocumento: opcionResumen,
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
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(usuario);
});

usuariosRouter.put("/:id/password", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { password } = req.body;
  if (!passwordValida(password)) {
    return res.status(400).json({ error: `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres, con letras y números` });
  }
  const id = Number(req.params.id);
  const existe = await prisma.usuario.findUnique({ where: { id }, select: { nombre: true, email: true } });
  if (!existe) return res.status(404).json({ error: "Usuario no encontrado" });

  await prisma.usuario.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  await registrarCambio(req, {
    modulo: "USUARIOS",
    accion: "CAMBIO_CONTRASENA",
    afectado: { tipo: "Usuario", nombre: `${existe.nombre} (${existe.email})` },
    descripcion: `Cambió la contraseña de ${existe.nombre} (${existe.email})`,
    anterior: { Contraseña: "••••••••" },
    nuevo: { Contraseña: "Nueva contraseña asignada (oculta)" },
  });
  res.status(204).send();
});
