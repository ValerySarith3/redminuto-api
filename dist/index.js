"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const usuarios_routes_1 = require("./routes/usuarios.routes");
const programas_routes_1 = require("./routes/programas.routes");
const campanas_routes_1 = require("./routes/campanas.routes");
const donaciones_routes_1 = require("./routes/donaciones.routes");
const voluntariado_routes_1 = require("./routes/voluntariado.routes");
const beneficiarios_routes_1 = require("./routes/beneficiarios.routes");
const dashboard_routes_1 = require("./routes/dashboard.routes");
const actividades_routes_1 = require("./routes/actividades.routes");
const reportes_routes_1 = require("./routes/reportes.routes");
const listas_routes_1 = require("./routes/listas.routes");
const pagos_routes_1 = require("./routes/pagos.routes");
const app = (0, express_1.default)();
// En Render la API está detrás de un proxy: así el límite de intentos ve la IP real de cada usuario.
app.set("trust proxy", 1);
// Cabeceras de seguridad HTTP. La API la consume el frontend desde otro origen, así que se permiten sus recursos entre orígenes.
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
// Límite de intentos para frenar ataques de fuerza bruta contra el inicio de sesión y el registro masivo de cuentas.
const limiteLogin = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Demasiados intentos de inicio de sesión. Espera 15 minutos e inténtalo de nuevo." },
});
const limiteRegistro = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Se han creado demasiadas cuentas desde esta conexión. Inténtalo más tarde." },
});
app.use("/api/usuarios/login", limiteLogin);
app.use("/api/usuarios/registro", limiteRegistro);
app.use(express_1.default.json());
// PayU envía la confirmación de pagos como formulario.
app.use(express_1.default.urlencoded({ extended: false }));
app.get("/api", (_req, res) => res.json({ status: "ok", proyecto: "RedMinuto API" }));
app.use("/api/usuarios", usuarios_routes_1.usuariosRouter);
app.use("/api/programas", programas_routes_1.programasRouter);
app.use("/api/campanas", campanas_routes_1.campanasRouter);
app.use("/api/donaciones", donaciones_routes_1.donacionesRouter);
app.use("/api/voluntariado", voluntariado_routes_1.voluntariadoRouter);
app.use("/api/beneficiarios", beneficiarios_routes_1.beneficiariosRouter);
app.use("/api/dashboard", dashboard_routes_1.dashboardRouter);
app.use("/api/actividades", actividades_routes_1.actividadesRouter);
app.use("/api/reportes", reportes_routes_1.reportesRouter);
app.use("/api/pagos", pagos_routes_1.pagosRouter);
app.use("/api/listas", listas_routes_1.listasRouter);
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
    console.log(`RedMinuto API escuchando en http://localhost:${port}`);
});
// Cada minuto se pregunta a PayU por los pagos que siguen pendientes.
setInterval(() => void (0, pagos_routes_1.sincronizarPagosPendientes)(), 60000);
void (0, pagos_routes_1.sincronizarPagosPendientes)();
