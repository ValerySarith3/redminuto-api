import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import { usuariosRouter } from "./routes/usuarios.routes";
import { programasRouter } from "./routes/programas.routes";
import { campanasRouter } from "./routes/campanas.routes";
import { donacionesRouter } from "./routes/donaciones.routes";
import { voluntariadoRouter } from "./routes/voluntariado.routes";
import { beneficiariosRouter } from "./routes/beneficiarios.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { actividadesRouter } from "./routes/actividades.routes";
import { reportesRouter } from "./routes/reportes.routes";
import { listasRouter } from "./routes/listas.routes";
import { pagosRouter, sincronizarPagosPendientes } from "./routes/pagos.routes";
import { prisma } from "./lib/prisma";

const app = express();
// En Render la API está detrás de un proxy: así el límite de intentos ve la IP real de cada usuario.
app.set("trust proxy", 1);

// Cabeceras de seguridad HTTP. La API la consume el frontend desde otro origen, así que se permiten sus recursos entre orígenes.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));

// Límite de intentos para frenar ataques de fuerza bruta contra el inicio de sesión y el registro masivo de cuentas.
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos de inicio de sesión. Espera 15 minutos e inténtalo de nuevo." },
});
const limiteRegistro = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Se han creado demasiadas cuentas desde esta conexión. Inténtalo más tarde." },
});
app.use("/api/usuarios/login", limiteLogin);
app.use("/api/usuarios/registro", limiteRegistro);
app.use(express.json());
// PayU envía la confirmación de pagos como formulario.
app.use(express.urlencoded({ extended: false }));

app.get("/api", (_req, res) => res.json({ status: "ok", proyecto: "RedMinuto API" }));
// Lo visita un ping cada 10 minutos: mantiene despiertas la API (Render) y la base de datos (Aiven).
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", bd: "ok" });
  } catch {
    res.status(503).json({ status: "error", bd: "sin conexión" });
  }
});

app.use("/api/usuarios", usuariosRouter);
app.use("/api/programas", programasRouter);
app.use("/api/campanas", campanasRouter);
app.use("/api/donaciones", donacionesRouter);
app.use("/api/voluntariado", voluntariadoRouter);
app.use("/api/beneficiarios", beneficiariosRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/actividades", actividadesRouter);
app.use("/api/reportes", reportesRouter);
app.use("/api/pagos", pagosRouter);
app.use("/api/listas", listasRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`RedMinuto API escuchando en http://localhost:${port}`);
});

// Cada minuto se pregunta a PayU por los pagos que siguen pendientes.
setInterval(() => void sincronizarPagosPendientes(), 60_000);
void sincronizarPagosPendientes();
