"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cambios = cambios;
exports.registrarCambio = registrarCambio;
const prisma_1 = require("./prisma");
function texto(valor) {
    if (valor === null || valor === undefined || valor === "")
        return "—";
    if (valor instanceof Date)
        return valor.toISOString().slice(0, 10);
    if (typeof valor === "boolean")
        return valor ? "Sí" : "No";
    return String(valor);
}
function serializar(datos) {
    if (!datos || Object.keys(datos).length === 0)
        return null;
    return JSON.stringify(Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, texto(v)])));
}
// Deja solo los campos que realmente cambiaron entre dos versiones de un registro.
function cambios(antes, despues) {
    const anterior = {};
    const nuevo = {};
    for (const campo of Object.keys(despues)) {
        if (texto(antes[campo]) !== texto(despues[campo])) {
            anterior[campo] = antes[campo];
            nuevo[campo] = despues[campo];
        }
    }
    return { anterior, nuevo };
}
function ipDe(req) {
    const reenviada = req.headers["x-forwarded-for"];
    const ip = (typeof reenviada === "string" ? reenviada.split(",")[0] : req.ip) ?? "";
    return ip.replace(/^::ffff:/, "").slice(0, 64) || null;
}
// Registrar el cambio nunca debe tumbar la operación principal: si falla, solo se reporta en consola.
async function registrarCambio(req, evento) {
    try {
        await prisma_1.prisma.logCambio.create({
            data: {
                modulo: evento.modulo,
                accion: evento.accion,
                descripcion: evento.descripcion,
                afectadoTipo: evento.afectado.tipo.slice(0, 40),
                afectadoNombre: evento.afectado.nombre.slice(0, 255),
                datosAnteriores: serializar(evento.anterior),
                datosNuevos: serializar(evento.nuevo),
                usuarioId: evento.usuarioId === undefined ? (req.user?.id ?? null) : evento.usuarioId,
                ip: ipDe(req),
            },
        });
    }
    catch (e) {
        console.error("[log-cambios]", e);
    }
}
