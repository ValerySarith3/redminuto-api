import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { usuarioPublico } from "../lib/usuarioPublico";

export const beneficiariosRouter = Router();

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

  const solicitud = await prisma.solicitudBeneficiario.create({
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
  res.status(201).json(solicitud);
});

beneficiariosRouter.put("/:id/estado", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { estado } = req.body;
  const solicitud = await prisma.solicitudBeneficiario.update({
    where: { id: Number(req.params.id) },
    data: { estado },
  });
  res.json(solicitud);
});
