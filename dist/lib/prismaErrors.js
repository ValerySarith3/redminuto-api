"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manejarErrorEliminar = manejarErrorEliminar;
function esErrorFK(e) {
    return typeof e === "object" && e !== null && "code" in e && e.code === "P2003";
}
function manejarErrorEliminar(e, res, mensajeConflicto) {
    if (esErrorFK(e)) {
        res.status(409).json({ error: mensajeConflicto });
        return;
    }
    throw e;
}
