import type { EntidadHistorial, Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";

type Cliente = Prisma.TransactionClient | typeof prisma;

interface CambioEstado {
  entidad: EntidadHistorial;
  entidadId: number;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  usuarioId?: number;
  nota?: string;
}

export function registrarHistorial(cliente: Cliente, cambio: CambioEstado) {
  return cliente.historialEstado.create({
    data: {
      entidad: cambio.entidad,
      entidadId: cambio.entidadId,
      estadoAnterior: cambio.estadoAnterior ?? null,
      estadoNuevo: cambio.estadoNuevo,
      usuarioId: cambio.usuarioId,
      nota: cambio.nota,
    },
  });
}

export async function historialDe(entidad: EntidadHistorial, entidadIds: number[]) {
  if (entidadIds.length === 0) return [];
  return prisma.historialEstado.findMany({
    where: { entidad, entidadId: { in: entidadIds } },
    include: { usuario: { select: { nombre: true, rol: true } } },
    orderBy: { creadoEn: "asc" },
  });
}
