import type { Request } from "express";
import { prisma } from "./prisma";

export type ModuloLog =
  | "CUENTAS"
  | "USUARIOS"
  | "PROGRAMAS"
  | "CAMPANAS"
  | "ACTIVIDADES"
  | "DONACIONES"
  | "VOLUNTARIADO"
  | "SOLICITUDES";

export type AccionLog =
  | "INICIO_SESION"
  | "REGISTRO"
  | "CREAR"
  | "EDITAR"
  | "ELIMINAR"
  | "CAMBIO_ROL"
  | "CAMBIO_CONTRASENA"
  | "ACTUALIZAR_DATOS"
  | "CAMBIO_ESTADO";

export type Datos = Record<string, string | number | boolean | Date | null | undefined>;

function texto(valor: Datos[string]) {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  return String(valor);
}

function serializar(datos: Datos | null | undefined) {
  if (!datos || Object.keys(datos).length === 0) return null;
  return JSON.stringify(Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, texto(v)])));
}

// Deja solo los campos que realmente cambiaron entre dos versiones de un registro.
export function cambios(antes: Datos, despues: Datos) {
  const anterior: Datos = {};
  const nuevo: Datos = {};
  for (const campo of Object.keys(despues)) {
    if (texto(antes[campo]) !== texto(despues[campo])) {
      anterior[campo] = antes[campo];
      nuevo[campo] = despues[campo];
    }
  }
  return { anterior, nuevo };
}

interface Evento {
  modulo: ModuloLog;
  accion: AccionLog;
  descripcion: string;
  // A quién o a qué se le hizo el cambio (un usuario, un programa, una donación…).
  afectado: { tipo: string; nombre: string };
  exitoso?: boolean;
  // Información antes y después del cambio, como { "Campo": valor }.
  anterior?: Datos | null;
  nuevo?: Datos | null;
  // Por defecto, quien hace la petición (si inició sesión).
  usuarioId?: number | null;
}

function ipDe(req: Request) {
  const reenviada = req.headers["x-forwarded-for"];
  const ip = (typeof reenviada === "string" ? reenviada.split(",")[0] : req.ip) ?? "";
  return ip.replace(/^::ffff:/, "").slice(0, 64) || null;
}

// Registrar el cambio nunca debe tumbar la operación principal: si falla, solo se reporta en consola.
export async function registrarCambio(req: Request, evento: Evento) {
  try {
    await prisma.logCambio.create({
      data: {
        modulo: evento.modulo,
        accion: evento.accion,
        descripcion: evento.descripcion,
        afectadoTipo: evento.afectado.tipo.slice(0, 40),
        afectadoNombre: evento.afectado.nombre.slice(0, 255),
        exitoso: evento.exitoso ?? true,
        datosAnteriores: serializar(evento.anterior),
        datosNuevos: serializar(evento.nuevo),
        usuarioId: evento.usuarioId === undefined ? (req.user?.id ?? null) : evento.usuarioId,
        ip: ipDe(req),
      },
    });
  } catch (e) {
    console.error("[log-cambios]", e);
  }
}
