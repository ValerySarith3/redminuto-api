import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { usuarioPublico } from "../lib/usuarioPublico";
import { registrarHistorial } from "../lib/historial";
import { VERSION_POLITICA_DATOS } from "../lib/consentimiento";

export const beneficiariosRouter = Router();

const ESTADOS_SOLICITUD = ["PENDIENTE", "EN_REVISION", "APROBADA", "RECHAZADA"];

// Uso administrativo: expone descripciones y datos personales de todos los beneficiarios.
beneficiariosRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const solicitudes = await prisma.solicitudBeneficiario.findMany({
    include: { beneficiario: usuarioPublico, programa: true },
    orderBy: { creadoEn: "desc" },
  });
  res.json(solicitudes);
});

beneficiariosRouter.get("/mias", requireAuth, async (req, res) => {
  const solicitudes = await prisma.solicitudBeneficiario.findMany({
    where: { beneficiarioId: req.user!.id },
    include: { programa: true },
    orderBy: { creadoEn: "desc" },
  });
  res.json(solicitudes);
});

beneficiariosRouter.post("/", requireAuth, async (req, res) => {
  const {
    descripcion,
    programaId,
    tipoApoyo,
    nombreCompleto,
    tipoDocumento,
    numeroDocumento,
    telefono,
    direccion,
    ciudad,
    personasACargo,
    aceptaTratamientoDatos,
  } = req.body;

  if (
    !descripcion ||
    !programaId ||
    !tipoApoyo ||
    !nombreCompleto ||
    !tipoDocumento ||
    !numeroDocumento ||
    !telefono ||
    !direccion ||
    !ciudad ||
    !personasACargo
  ) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  if (!aceptaTratamientoDatos) {
    return res.status(400).json({ error: "Debes autorizar el tratamiento de tus datos personales para continuar" });
  }

  const solicitud = await prisma.$transaction(async (tx) => {
    const nueva = await tx.solicitudBeneficiario.create({
      data: {
        descripcion,
        tipoApoyo,
        nombreCompleto,
        tipoDocumento,
        numeroDocumento,
        telefono,
        direccion,
        ciudad,
        personasACargo: Number(personasACargo),
        aceptaTratamientoDatos: true,
        beneficiarioId: req.user!.id,
        programaId: Number(programaId),
      },
      include: { programa: true },
    });
    await tx.consentimientoDatos.create({
      data: { usuarioId: req.user!.id, finalidad: "SOLICITUD_AYUDA", versionPolitica: VERSION_POLITICA_DATOS },
    });
    await registrarHistorial(tx, {
      entidad: "SOLICITUD",
      entidadId: nueva.id,
      estadoNuevo: nueva.estado,
      usuarioId: req.user!.id,
      nota: "Solicitud recibida",
    });
    return nueva;
  });
  res.status(201).json(solicitud);
});

beneficiariosRouter.put("/:id/estado", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { estado, nota } = req.body;
  if (!ESTADOS_SOLICITUD.includes(estado)) return res.status(400).json({ error: "Estado inválido" });

  const id = Number(req.params.id);
  const actual = await prisma.solicitudBeneficiario.findUnique({ where: { id } });
  if (!actual) return res.status(404).json({ error: "Solicitud no encontrada" });

  const solicitud = await prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitudBeneficiario.update({ where: { id }, data: { estado } });
    if (actual.estado !== estado) {
      await registrarHistorial(tx, {
        entidad: "SOLICITUD",
        entidadId: id,
        estadoAnterior: actual.estado,
        estadoNuevo: estado,
        usuarioId: req.user!.id,
        nota,
      });
    }
    return actualizada;
  });
  res.json(solicitud);
});
