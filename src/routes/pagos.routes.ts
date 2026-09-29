import { Router } from "express";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { numeroComprobante } from "../lib/comprobante";
import { registrarHistorial } from "../lib/historial";
import type { EstadoDonacion, EstadoPago } from "../generated/prisma/client";

// Integración con PayU Latam usando su WebCheckout.
// En pruebas se usan las credenciales públicas de sandbox que PayU publica en su documentación
// ("Probar tu solución"); en producción se reemplazan por las de la cuenta de la fundación.
export const pagosRouter = Router();

const payu = {
  merchantId: process.env.PAYU_MERCHANT_ID ?? "",
  accountId: process.env.PAYU_ACCOUNT_ID ?? "",
  apiKey: process.env.PAYU_API_KEY ?? "",
  apiLogin: process.env.PAYU_API_LOGIN ?? "",
  reportsUrl: process.env.PAYU_REPORTS_URL || "https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi",
  checkoutUrl: process.env.PAYU_CHECKOUT_URL || "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/",
  pruebas: process.env.PAYU_TEST !== "0",
};
const WEB_URL = process.env.WEB_URL || process.env.CORS_ORIGIN || "http://localhost:5173";
// URL pública de esta API para la confirmación servidor a servidor (PayU no puede llamar a localhost).
const API_PUBLICA = process.env.API_PUBLIC_URL ?? "";

const MONTO_MIN = 1500;
const MONTO_MAX = 50_000_000;
const MONEDA = "COP";

export const pasarelaConfigurada = () => Boolean(payu.merchantId && payu.accountId && payu.apiKey);
const md5 = (texto: string) => createHash("md5").update(texto).digest("hex");

// Códigos de estado de PayU (transactionState / state_pol).
const ESTADOS: Record<string, { donacion: EstadoDonacion; pago: EstadoPago; texto: string }> = {
  "4": { donacion: "COMPLETADA", pago: "APROBADO", texto: "APPROVED" },
  "7": { donacion: "PENDIENTE", pago: "PENDIENTE", texto: "PENDING" },
  "6": { donacion: "FALLIDA", pago: "RECHAZADO", texto: "DECLINED" },
  "5": { donacion: "FALLIDA", pago: "RECHAZADO", texto: "EXPIRED" },
  "104": { donacion: "FALLIDA", pago: "RECHAZADO", texto: "ERROR" },
};

// Para validar la firma de respuesta PayU exige el valor redondeado a un decimal con "half to even":
// 150.00 → "150.0"; 150.25 → "150.2"; 150.35 → "150.4".
export function valorParaFirma(valor: string) {
  const centimos = Math.round(Number(valor) * 100);
  const base = Math.floor(centimos / 10);
  const resto = centimos % 10;
  const redondeado = resto > 5 || (resto === 5 && base % 2 === 1) ? base + 1 : base;
  return (redondeado / 10).toFixed(1);
}

function firmaValida(recibida: unknown, esperada: string) {
  const a = Buffer.from(String(recibida ?? "").toLowerCase());
  const b = Buffer.from(esperada);
  return a.length === b.length && timingSafeEqual(a, b);
}

pagosRouter.get("/config", (_req, res) => {
  res.json({ pasarela: pasarelaConfigurada() ? "payu" : null, pruebas: payu.pruebas });
});

pagosRouter.post("/payu/iniciar", requireAuth, async (req, res) => {
  if (!pasarelaConfigurada()) {
    return res.status(503).json({ error: "La pasarela de pagos no está configurada" });
  }
  const monto = Math.round(Number(req.body.monto));
  const campanaId = Number(req.body.campanaId);
  if (!Number.isFinite(monto) || monto < MONTO_MIN || monto > MONTO_MAX) {
    return res
      .status(400)
      .json({ error: `El monto debe estar entre $${MONTO_MIN.toLocaleString("es-CO")} y $${MONTO_MAX.toLocaleString("es-CO")}` });
  }
  const [campana, donante] = await Promise.all([
    prisma.campana.findUnique({ where: { id: campanaId }, select: { id: true, titulo: true } }),
    prisma.usuario.findUnique({ where: { id: req.user!.id }, select: { nombre: true, email: true, telefono: true } }),
  ]);
  if (!campana) return res.status(404).json({ error: "Campaña no encontrada" });
  if (!donante) return res.status(401).json({ error: "Sesión inválida" });

  const referencia = `RM-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const donacion = await prisma.$transaction(async (tx) => {
    const nueva = await tx.donacion.create({
      data: { monto, canal: "PASARELA", estado: "PENDIENTE", campanaId, donanteId: req.user!.id },
    });
    await tx.pago.create({
      data: { referencia, metodo: "PASARELA", estado: "PENDIENTE", donacionId: nueva.id },
    });
    await registrarHistorial(tx, {
      entidad: "DONACION",
      entidadId: nueva.id,
      estadoNuevo: "PENDIENTE",
      usuarioId: req.user!.id,
      nota: "Pago iniciado en PayU",
    });
    return nueva;
  });

  const valor = String(monto);
  const campos: Record<string, string> = {
    merchantId: payu.merchantId,
    accountId: payu.accountId,
    description: `Donación a ${campana.titulo}`.slice(0, 255),
    referenceCode: referencia,
    amount: valor,
    tax: "0",
    taxReturnBase: "0",
    currency: MONEDA,
    signature: md5(`${payu.apiKey}~${payu.merchantId}~${referencia}~${valor}~${MONEDA}`),
    test: payu.pruebas ? "1" : "0",
    buyerEmail: donante.email,
    buyerFullName: donante.nombre,
    responseUrl: `${WEB_URL}/donacion/resultado`,
  };
  if (donante.telefono) campos.telephone = donante.telefono;
  if (API_PUBLICA) campos.confirmationUrl = `${API_PUBLICA}/api/pagos/payu/confirmacion`;

  res.status(201).json({ donacionId: donacion.id, referencia, urlCheckout: payu.checkoutUrl, campos });
});

async function aplicarResultado(datos: {
  referencia: string;
  valor: string;
  moneda: string;
  estado: string;
  mensaje?: string;
  medio?: string;
  crudo: unknown;
}) {
  const pago = await prisma.pago.findUnique({ where: { referencia: datos.referencia }, include: { donacion: true } });
  if (!pago) return null;

  // El pago debe corresponder exactamente a lo que se cobró.
  if (Math.round(Number(datos.valor)) !== Math.round(Number(pago.donacion.monto)) || datos.moneda !== MONEDA) {
    throw new Error(`Monto inconsistente para la referencia ${datos.referencia}`);
  }

  const destino = ESTADOS[datos.estado] ?? ESTADOS["104"];
  const estadoAnterior = pago.donacion.estado;
  // Una donación ya confirmada o fallida no vuelve a pendiente.
  if (estadoAnterior !== "PENDIENTE" && destino.donacion === "PENDIENTE") return pago.donacion;

  await prisma.$transaction(async (tx) => {
    await tx.pago.update({
      where: { id: pago.id },
      data: { estado: destino.pago, respuestaPasarela: JSON.stringify(datos.crudo) },
    });
    if (estadoAnterior !== destino.donacion) {
      await tx.donacion.update({ where: { id: pago.donacionId }, data: { estado: destino.donacion } });
      await registrarHistorial(tx, {
        entidad: "DONACION",
        entidadId: pago.donacionId,
        estadoAnterior,
        estadoNuevo: destino.donacion,
        nota: `PayU: ${destino.texto}${datos.medio ? ` (${datos.medio})` : ""}${datos.mensaje ? ` · ${datos.mensaje}` : ""}`,
      });
    }
  });
  return { ...pago.donacion, estado: destino.donacion };
}

// PayU devuelve al usuario a /donacion/resultado con los datos firmados en la URL; el front los reenvía aquí.
pagosRouter.get("/payu/respuesta", requireAuth, async (req, res) => {
  const q = req.query as Record<string, string | undefined>;
  const { merchantId, referenceCode, TX_VALUE, currency, transactionState, signature } = q;
  if (!referenceCode || !TX_VALUE || !currency || !transactionState) {
    return res.status(400).json({ error: "Respuesta de pago incompleta" });
  }
  const esperada = md5(
    `${payu.apiKey}~${merchantId}~${referenceCode}~${valorParaFirma(TX_VALUE)}~${currency}~${transactionState}`,
  );
  if (merchantId !== payu.merchantId || !firmaValida(signature, esperada)) {
    return res.status(400).json({ error: "La respuesta del pago no tiene una firma válida" });
  }

  const pago = await prisma.pago.findUnique({ where: { referencia: referenceCode }, include: { donacion: true } });
  if (!pago) return res.status(404).json({ error: "El pago no corresponde a ninguna donación" });
  if (pago.donacion.donanteId !== req.user!.id && req.user!.rol !== "ADMIN") {
    return res.status(403).json({ error: "No tienes permiso para ver esta donación" });
  }

  const donacion = await aplicarResultado({
    referencia: referenceCode,
    valor: TX_VALUE,
    moneda: currency,
    estado: transactionState,
    mensaje: q.message,
    medio: q.lapPaymentMethod,
    crudo: q,
  });
  const campana = await prisma.campana.findUnique({ where: { id: pago.donacion.campanaId }, select: { titulo: true } });
  res.json({
    estado: donacion!.estado,
    mensaje: q.message ?? null,
    monto: Number(pago.donacion.monto),
    campana: campana?.titulo ?? "",
    numeroComprobante: numeroComprobante(pago.donacionId),
  });
});

// Confirmación servidor a servidor de PayU (necesita API_PUBLIC_URL; no llega a localhost).
pagosRouter.post("/payu/confirmacion", async (req, res) => {
  const b = req.body as Record<string, string | undefined>;
  const { merchant_id, reference_sale, value, currency, state_pol, sign } = b;
  if (!reference_sale || !value || !currency || !state_pol) return res.status(400).send("Datos incompletos");

  const esperada = md5(`${payu.apiKey}~${merchant_id}~${reference_sale}~${valorParaFirma(value)}~${currency}~${state_pol}`);
  if (merchant_id !== payu.merchantId || !firmaValida(sign, esperada)) return res.status(401).send("Firma inválida");

  try {
    await aplicarResultado({
      referencia: reference_sale,
      valor: value,
      moneda: currency,
      estado: state_pol,
      mensaje: b.response_message_pol,
      medio: b.payment_method_name,
      crudo: b,
    });
  } catch (e) {
    console.error("[payu]", e);
  }
  res.status(200).send("OK");
});

// ---------------------------------------------------------------------------------------------
// Consulta directa a PayU (API de reportes). No depende de que la persona vuelva a RedMinuto
// después de pagar ni de que PayU pueda llamar a esta API: RedMinuto pregunta por sus pagos pendientes.

const ESTADO_POR_TEXTO: Record<string, string> = {
  APPROVED: "4",
  DECLINED: "6",
  EXPIRED: "5",
  ERROR: "104",
  PENDING: "7",
};
// Si PayU no tiene registro del pago pasado este tiempo, la persona no lo terminó.
const HORAS_ABANDONO = 24;

interface OrdenPayU {
  additionalValues?: { TX_VALUE?: { value: number; currency: string } };
  transactions?: {
    paymentMethod?: string;
    transactionResponse?: { state?: string; responseMessage?: string | null; operationDate?: number };
  }[];
}

async function consultarPayU(referencia: string): Promise<OrdenPayU | null> {
  const respuesta = await fetch(payu.reportsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      test: false,
      language: "es",
      command: "ORDER_DETAIL_BY_REFERENCE_CODE",
      merchant: { apiLogin: payu.apiLogin, apiKey: payu.apiKey },
      details: { referenceCode: referencia },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const cuerpo = (await respuesta.json()) as { code?: string; error?: string | null; result?: { payload?: OrdenPayU[] | null } };
  if (cuerpo.code !== "SUCCESS") throw new Error(cuerpo.error ?? `PayU respondió ${respuesta.status}`);
  return cuerpo.result?.payload?.[0] ?? null;
}

async function sincronizarPago(pago: { referencia: string; creadoEn: Date; donacionId: number }) {
  const orden = await consultarPayU(pago.referencia);
  const ultima = [...(orden?.transactions ?? [])].sort(
    (a, b) => (b.transactionResponse?.operationDate ?? 0) - (a.transactionResponse?.operationDate ?? 0),
  )[0];

  if (!orden || !ultima?.transactionResponse?.state) {
    const horas = (Date.now() - pago.creadoEn.getTime()) / 3_600_000;
    if (horas < HORAS_ABANDONO) return;
    await prisma.$transaction(async (tx) => {
      await tx.pago.update({ where: { referencia: pago.referencia }, data: { estado: "RECHAZADO" } });
      await tx.donacion.update({ where: { id: pago.donacionId }, data: { estado: "FALLIDA" } });
      await registrarHistorial(tx, {
        entidad: "DONACION",
        entidadId: pago.donacionId,
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "FALLIDA",
        nota: `PayU: la persona no completó el pago en ${HORAS_ABANDONO} horas`,
      });
    });
    return;
  }

  const valor = orden.additionalValues?.TX_VALUE;
  await aplicarResultado({
    referencia: pago.referencia,
    valor: String(valor?.value ?? ""),
    moneda: valor?.currency ?? "",
    estado: ESTADO_POR_TEXTO[ultima.transactionResponse.state] ?? "104",
    mensaje: ultima.transactionResponse.responseMessage ?? undefined,
    medio: ultima.paymentMethod,
    crudo: { consulta: "reports-api", orden },
  });
}

let sincronizando: Promise<void> | null = null;

// Revisa en PayU las donaciones por pasarela que siguen pendientes. Si ya hay una revisión en curso, espera esa.
export function sincronizarPagosPendientes(donanteId?: number) {
  if (!pasarelaConfigurada() || !payu.apiLogin) return Promise.resolve();
  if (sincronizando) return sincronizando;
  sincronizando = (async () => {
    const pendientes = await prisma.pago.findMany({
      where: {
        metodo: "PASARELA",
        estado: "PENDIENTE",
        referencia: { startsWith: "RM-" },
        ...(donanteId ? { donacion: { donanteId } } : {}),
      },
      select: { referencia: true, creadoEn: true, donacionId: true },
      orderBy: { creadoEn: "desc" },
      take: 25,
    });
    for (const pago of pendientes) {
      try {
        await sincronizarPago(pago);
      } catch (e) {
        console.error(`[payu] no se pudo consultar ${pago.referencia}:`, e instanceof Error ? e.message : e);
      }
    }
  })().finally(() => {
    sincronizando = null;
  });
  return sincronizando;
}
