"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarHistorial = registrarHistorial;
exports.historialDe = historialDe;
const prisma_1 = require("./prisma");
function registrarHistorial(cliente, cambio) {
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
async function historialDe(entidad, entidadIds) {
    if (entidadIds.length === 0)
        return [];
    return prisma_1.prisma.historialEstado.findMany({
        where: { entidad, entidadId: { in: entidadIds } },
        include: { usuario: { select: { nombre: true, rol: true } } },
        orderBy: { creadoEn: "asc" },
    });
}
