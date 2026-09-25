import "dotenv/config";
import express from "express";
import cors from "cors";

import { usuariosRouter } from "./routes/usuarios.routes";
import { programasRouter } from "./routes/programas.routes";
import { campanasRouter } from "./routes/campanas.routes";
import { donacionesRouter } from "./routes/donaciones.routes";
import { voluntariadoRouter } from "./routes/voluntariado.routes";
import { beneficiariosRouter } from "./routes/beneficiarios.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { actividadesRouter } from "./routes/actividades.routes";
import { reportesRouter } from "./routes/reportes.routes";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api", (_req, res) => res.json({ status: "ok", proyecto: "RedMinuto API" }));

app.use("/api/usuarios", usuariosRouter);
app.use("/api/programas", programasRouter);
app.use("/api/campanas", campanasRouter);
app.use("/api/donaciones", donacionesRouter);
app.use("/api/voluntariado", voluntariadoRouter);
app.use("/api/beneficiarios", beneficiariosRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/actividades", actividadesRouter);
app.use("/api/reportes", reportesRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`RedMinuto API escuchando en http://localhost:${port}`);
});
