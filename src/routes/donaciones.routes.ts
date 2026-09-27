import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { numeroComprobante } from "../lib/comprobante";
import { usuarioPublico } from "../lib/usuarioPublico";
import { historialDe, registrarHistorial } from "../lib/historial";

export const donacionesRouter = Router();

const ESTADOS_DONACION = ["PENDIENTE", "COMPLETADA", "FALLIDA"];

function conComprobante<T extends { id: number }>(donacion: T) {
  return { ...donacion, numeroComprobante: numeroComprobante(donacion.id) };
}

function esErrorUnico(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2002";
}

donacionesRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const donaciones = await prisma.donacion.findMany({
    include: { campana: { include: { programa: true } }, donante: usuarioPublico, pago: true },
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
    include: { campana: true, donante: usuarioPublico, pago: true },
  });
  if (!donacion) return res.status(404).json({ error: "Donación no encontrada" });
  if (donacion.donanteId !== req.user!.id && req.user!.rol !== "ADMIN") {
    return res.status(403).json({ error: "No tienes permiso para ver esta donación" });
  }
  const historial = await historialDe("DONACION", [donacion.id]);
  res.json({ ...conComprobante(donacion), historial });
});

donacionesRouter.post("/", requireAuth, async (req, res) => {
  const { monto, canal, campanaId, referencia } = req.body;
  if (!monto || !canal || !campanaId || !referencia) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const buscarExistente = () =>
    prisma.pago.findUnique({
      where: { referencia: String(referencia) },
      include: { donacion: { include: { campana: true } } },
    });

  const existente = await buscarExistente();
  if (existente) return res.json(conComprobante(existente.donacion));

  const aprobadaPorPasarela = canal === "PASARELA";
  const estado = aprobadaPorPasarela ? "COMPLETADA" : "PENDIENTE";

  try {
    const donacion = await prisma.$transaction(async (tx) => {
      const nueva = await tx.donacion.create({
        data: {
          monto,
          canal,
          estado,
          campanaId: Number(campanaId),
          donanteId: req.user!.id,
        },
        include: { campana: true },
      });
      await tx.pago.create({
        data: {
          referencia: String(referencia),
          metodo: canal,
          estado: aprobadaPorPasarela ? "APROBADO" : "PENDIENTE",
          respuestaPasarela: aprobadaPorPasarela
            ? JSON.stringify({ sandbox: true, codigo: "APPROVED", mensaje: "Transacción aprobada (simulada)" })
            : null,
          donacionId: nueva.id,
        },
      });
      await registrarHistorial(tx, {
        entidad: "DONACION",
        entidadId: nueva.id,
        estadoNuevo: estado,
        usuarioId: req.user!.id,
        nota: aprobadaPorPasarela ? "Pago aprobado por la pasarela (sandbox)" : "Pendiente de confirmar el pago",
      });
      return nueva;
    });
    res.status(201).json(conComprobante(donacion));
  } catch (e) {
    if (esErrorUnico(e)) {
      const creada = await buscarExistente();
      if (creada) return res.json(conComprobante(creada.donacion));
    }
    throw e;
  }
});

donacionesRouter.put("/:id/estado", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { estado, nota } = req.body;
  if (!ESTADOS_DONACION.includes(estado)) return res.status(400).json({ error: "Estado inválido" });

  const id = Number(req.params.id);
  const actual = await prisma.donacion.findUnique({ where: { id } });
  if (!actual) return res.status(404).json({ error: "Donación no encontrada" });

  const donacion = await prisma.$transaction(async (tx) => {
    const actualizada = await tx.donacion.update({ where: { id }, data: { estado } });
    await tx.pago.updateMany({
      where: { donacionId: id },
      data: { estado: estado === "COMPLETADA" ? "APROBADO" : estado === "FALLIDA" ? "RECHAZADO" : "PENDIENTE" },
    });
    if (actual.estado !== estado) {
      await registrarHistorial(tx, {
        entidad: "DONACION",
        entidadId: id,
        estadoAnterior: actual.estado,
        estadoNuevo: estado,
        usuarioId: req.user!.id,
        nota,
      });
    }
    return actualizada;
  });
  res.json(conComprobante(donacion));
});
