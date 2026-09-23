import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { numeroComprobante } from "../lib/comprobante";
import { usuarioPublico } from "../lib/usuarioPublico";

export const donacionesRouter = Router();

function conComprobante<T extends { id: number }>(donacion: T) {
  return { ...donacion, numeroComprobante: numeroComprobante(donacion.id) };
}

// Uso administrativo: expone datos personales de todos los donantes.
donacionesRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const donaciones = await prisma.donacion.findMany({
    include: { campana: true, donante: usuarioPublico },
    orderBy: { creadoEn: "desc" },
  });
  res.json(donaciones.map(conComprobante));
});

donacionesRouter.get("/mias", requireAuth, async (req, res) => {
  const donaciones = await prisma.donacion.findMany({
    where: { donanteId: req.user!.id },
    include: { campana: { include: { programa: true } } },
    orderBy: { creadoEn: "desc" },
  });
  res.json(donaciones.map(conComprobante));
});

donacionesRouter.get("/:id", requireAuth, async (req, res) => {
  const donacion = await prisma.donacion.findUnique({
    where: { id: Number(req.params.id) },
    include: { campana: true, donante: usuarioPublico },
  });
  if (!donacion) return res.status(404).json({ error: "Donación no encontrada" });
  if (donacion.donanteId !== req.user!.id && req.user!.rol !== "ADMIN") {
    return res.status(403).json({ error: "No tienes permiso para ver esta donación" });
  }
  res.json(conComprobante(donacion));
});

// Simula el resultado de una pasarela de pago en modo sandbox (Wompi/PayU) — no procesa dinero real.
donacionesRouter.post("/", requireAuth, async (req, res) => {
  const { monto, canal, campanaId } = req.body;
  if (!monto || !canal || !campanaId) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const estado = canal === "PASARELA" ? "COMPLETADA" : "PENDIENTE";

  const donacion = await prisma.donacion.create({
    data: {
      monto,
      canal,
      estado,
      campanaId: Number(campanaId),
      donanteId: req.user!.id,
    },
    include: { campana: true },
  });
  res.status(201).json(conComprobante(donacion));
});

donacionesRouter.put("/:id/estado", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { estado } = req.body;
  const donacion = await prisma.donacion.update({
    where: { id: Number(req.params.id) },
    data: { estado },
  });
  res.json(conComprobante(donacion));
});
