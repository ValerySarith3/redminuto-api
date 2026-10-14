import { Router } from "express";
import { prisma } from "../lib/prisma";
import { registrarCambio, cambios } from "../lib/logCambios";

const conPrograma = { programa: { select: { nombre: true } } } as const;
const datosCampana = (c: { titulo: string; descripcion: string; metaMonto: unknown; programa: { nombre: string } }) => ({
  Título: c.titulo,
  Descripción: c.descripcion,
  Meta: `$${Math.round(Number(c.metaMonto)).toLocaleString("es-CO")}`,
  Programa: c.programa.nombre,
});
import { requireAuth, requireRole } from "../middleware/auth";
import { manejarErrorEliminar } from "../lib/prismaErrors";

export const campanasRouter = Router();

campanasRouter.get("/", async (_req, res) => {
  const campanas = await prisma.campana.findMany({ include: { programa: true } });
  res.json(campanas);
});

campanasRouter.get("/:id", async (req, res) => {
  const campana = await prisma.campana.findUnique({
    where: { id: Number(req.params.id) },
    include: { programa: true },
  });
  if (!campana) return res.status(404).json({ error: "Campaña no encontrada" });
  res.json(campana);
});

campanasRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { titulo, descripcion, metaMonto, programaId } = req.body;
  const campana = await prisma.campana.create({
    data: { titulo, descripcion, metaMonto, programaId: Number(programaId) },
    include: conPrograma,
  });
  await registrarCambio(req, {
    modulo: "CAMPANAS",
    accion: "CREAR",
    afectado: { tipo: "Campaña", nombre: campana.titulo },
    descripcion: `Creó la campaña «${campana.titulo}»`,
    nuevo: datosCampana(campana),
  });
  res.status(201).json(campana);
});

campanasRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { titulo, descripcion, metaMonto, programaId } = req.body;
  const antes = await prisma.campana.findUnique({ where: { id: Number(req.params.id) }, include: conPrograma });
  if (!antes) return res.status(404).json({ error: "Campaña no encontrada" });
  const campana = await prisma.campana.update({
    where: { id: Number(req.params.id) },
    data: { titulo, descripcion, metaMonto, programaId },
    include: conPrograma,
  });
  await registrarCambio(req, {
    modulo: "CAMPANAS",
    accion: "EDITAR",
    afectado: { tipo: "Campaña", nombre: campana.titulo },
    descripcion: `Editó la campaña «${campana.titulo}»`,
    ...cambios(datosCampana(antes), datosCampana(campana)),
  });
  res.json(campana);
});

campanasRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const campana = await prisma.campana.delete({ where: { id: Number(req.params.id) }, include: conPrograma });
    await registrarCambio(req, {
      modulo: "CAMPANAS",
      accion: "ELIMINAR",
      afectado: { tipo: "Campaña", nombre: campana.titulo },
      descripcion: `Eliminó la campaña «${campana.titulo}»`,
      anterior: datosCampana(campana),
    });
    res.status(204).send();
  } catch (e) {
    manejarErrorEliminar(e, res, "No se puede eliminar: la campaña tiene donaciones registradas.");
  }
});

// ---- Novedades de impacto de una campaña ----

const NOVEDAD_TITULO_MAX = 150;
const NOVEDAD_CONTENIDO_MAX = 2000;

function validarNovedad(body: { titulo?: unknown; contenido?: unknown }) {
  const titulo = typeof body.titulo === "string" ? body.titulo.trim() : "";
  const contenido = typeof body.contenido === "string" ? body.contenido.trim() : "";
  if (!titulo || !contenido) return { error: "Escribe el título y el contenido de la novedad" } as const;
  if (titulo.length > NOVEDAD_TITULO_MAX) return { error: `El título admite hasta ${NOVEDAD_TITULO_MAX} caracteres` } as const;
  if (contenido.length > NOVEDAD_CONTENIDO_MAX) {
    return { error: `El contenido admite hasta ${NOVEDAD_CONTENIDO_MAX} caracteres` } as const;
  }
  return { titulo, contenido } as const;
}

const conCampana = { campana: { select: { titulo: true } } } as const;

campanasRouter.get("/:id/novedades", async (req, res) => {
  const novedades = await prisma.novedadCampana.findMany({
    where: { campanaId: Number(req.params.id) },
    orderBy: { creadoEn: "desc" },
  });
  res.json(novedades);
});

campanasRouter.post("/:id/novedades", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const datos = validarNovedad(req.body);
  if ("error" in datos) return res.status(400).json({ error: datos.error });
  const campanaId = Number(req.params.id);
  const existe = await prisma.campana.findUnique({ where: { id: campanaId }, select: { id: true } });
  if (!existe) return res.status(404).json({ error: "Campaña no encontrada" });

  const novedad = await prisma.novedadCampana.create({ data: { ...datos, campanaId }, include: conCampana });
  await registrarCambio(req, {
    modulo: "CAMPANAS",
    accion: "CREAR",
    afectado: { tipo: "Novedad", nombre: `${novedad.titulo} (${novedad.campana.titulo})` },
    descripcion: `Publicó la novedad «${novedad.titulo}» en la campaña «${novedad.campana.titulo}»`,
    nuevo: { Título: novedad.titulo, Contenido: novedad.contenido },
  });
  res.status(201).json(novedad);
});

campanasRouter.put("/novedades/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const datos = validarNovedad(req.body);
  if ("error" in datos) return res.status(400).json({ error: datos.error });
  const id = Number(req.params.id);
  const antes = await prisma.novedadCampana.findUnique({ where: { id } });
  if (!antes) return res.status(404).json({ error: "Novedad no encontrada" });

  const novedad = await prisma.novedadCampana.update({ where: { id }, data: datos, include: conCampana });
  await registrarCambio(req, {
    modulo: "CAMPANAS",
    accion: "EDITAR",
    afectado: { tipo: "Novedad", nombre: `${novedad.titulo} (${novedad.campana.titulo})` },
    descripcion: `Editó la novedad «${novedad.titulo}» de la campaña «${novedad.campana.titulo}»`,
    ...cambios(
      { Título: antes.titulo, Contenido: antes.contenido },
      { Título: novedad.titulo, Contenido: novedad.contenido },
    ),
  });
  res.json(novedad);
});

campanasRouter.delete("/novedades/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const existe = await prisma.novedadCampana.findUnique({ where: { id } });
  if (!existe) return res.status(404).json({ error: "Novedad no encontrada" });

  const novedad = await prisma.novedadCampana.delete({ where: { id }, include: conCampana });
  await registrarCambio(req, {
    modulo: "CAMPANAS",
    accion: "ELIMINAR",
    afectado: { tipo: "Novedad", nombre: `${novedad.titulo} (${novedad.campana.titulo})` },
    descripcion: `Eliminó la novedad «${novedad.titulo}» de la campaña «${novedad.campana.titulo}»`,
    anterior: { Título: novedad.titulo, Contenido: novedad.contenido },
  });
  res.status(204).send();
});
