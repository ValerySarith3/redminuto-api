import type { Response } from "express";

function esErrorFK(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: string }).code === "P2003";
}

export function manejarErrorEliminar(e: unknown, res: Response, mensajeConflicto: string) {
  if (esErrorFK(e)) {
    res.status(409).json({ error: mensajeConflicto });
    return;
  }
  throw e;
}
