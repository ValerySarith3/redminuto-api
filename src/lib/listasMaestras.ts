import { prisma } from "./prisma";

// Códigos de las listas maestras que usa el código (las opciones de cada una se administran desde el panel).
export const LISTA = {
  TIPO_DOCUMENTO: "TIPO_DOCUMENTO",
} as const;
export type CodigoLista = (typeof LISTA)[keyof typeof LISTA];

// Lo que se devuelve de una opción cuando va dentro de otro registro (p. ej. el tipo de documento de un usuario).
export const opcionResumen = { select: { id: true, codigo: true, nombre: true } } as const;

// Convierte el valor recibido del cliente en un id de opción, o null si viene vacío.
export function idOpcion(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : Number.NaN;
}

// La opción existe, pertenece a esa lista y está activa. Si es la que el registro ya tenía (`actual`),
// se acepta aunque se haya desactivado después, para no obligar a cambiarla al editar otros datos.
export async function opcionValida(lista: CodigoLista, id: number, actual?: number | null) {
  if (!Number.isInteger(id)) return false;
  if (actual !== undefined && id === actual) return true;
  const opcion = await prisma.opcionListaMaestra.findFirst({
    where: { id, activo: true, listaMaestra: { codigo: lista } },
    select: { id: true },
  });
  return opcion !== null;
}
