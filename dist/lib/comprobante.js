"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numeroComprobante = numeroComprobante;
function numeroComprobante(donacionId) {
    return `RM-D-${String(donacionId).padStart(6, "0")}`;
}
