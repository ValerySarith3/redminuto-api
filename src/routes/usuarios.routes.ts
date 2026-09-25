import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { firmarToken, requireAuth, requireRole } from "../middleware/auth";
import type { Rol } from "../generated/prisma/client";
import { VERSION_POLITICA_DATOS } from "../lib/consentimiento";

export const usuariosRouter = Router();

const ROLES_VALIDOS: Rol[] = ["USUARIO", "ADMIN"];

// Uso administrativo: lista todos los usuarios con su rol y actividad.
usuariosRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      creadoEn: true,
      _count: { select: { donaciones: true, inscripciones: true, solicitudes: true } },
    },
    orderBy: { creadoEn: "desc" },
  });
  res.json(usuarios);
});

// El administrador puede crear usuarios de cualquier rol, incluido ADMIN.
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

  const usuario = await prisma.usuario.update({
    where: { id: Number(req.params.id) },
    data: { rol },
    select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
  });
  res.json(usuario);
});

usuariosRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user!.id) {
    return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
  }
  await prisma.usuario.delete({ where: { id } });
  res.status(204).send();
});

// Autorregistro: siempre rol USUARIO (con la misma cuenta se dona, se hace voluntariado y se pide ayuda).
// El rol ADMIN solo lo asigna otro administrador.
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
  if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, usuario.passwordHash);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = firmarToken({ id: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
  res.json({
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  });
});

usuariosRouter.get("/yo", requireAuth, async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user!.id },
    select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
  });
  res.json(usuario);
});
