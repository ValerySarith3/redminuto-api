"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opcionResumen = exports.LISTA = void 0;
exports.idOpcion = idOpcion;
exports.opcionValida = opcionValida;
const prisma_1 = require("./prisma");
// Códigos de las listas maestras que usa el código (las opciones de cada una se administran desde el panel).
exports.LISTA = {
    TIPO_DOCUMENTO: "TIPO_DOCUMENTO",
};
// Lo que se devuelve de una opción cuando va dentro de otro registro (p. ej. el tipo de documento de un usuario).
exports.opcionResumen = { select: { id: true, codigo: true, nombre: true } };
// Convierte el valor recibido del cliente en un id de opción, o null si viene vacío.
function idOpcion(valor) {
    if (valor === null || valor === undefined || valor === "")
        return null;
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : NaN;
}
// La opción existe, pertenece a esa lista y está activa. Si es la que el registro ya tenía (`actual`),
// se acepta aunque se haya desactivado después, para no obligar a cambiarla al editar otros datos.
async function opcionValida(lista, id, actual) {
    if (!Number.isInteger(id))
        return false;
    if (actual !== undefined && id === actual)
        return true;
    const opcion = await prisma_1.prisma.opcionListaMaestra.findFirst({
        where: { id, activo: true, listaMaestra: { codigo: lista } },
        select: { id: true },
    });
    return opcion !== null;
}
