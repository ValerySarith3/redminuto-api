import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { cambios, registrarCambio } from "../lib/logCambios";
import { manejarErrorEliminar } from "../lib/prismaErrors";

export const listasRouter = Router();

// Opciones activas de una lista, para llenar los selectores de los formularios (público).
listasRouter.get("/:codigo/opciones", async (req, res) => {
  const opciones = await prisma.opcionListaMaestra.findMany({
    where: { activo: true, listaMaestra: { codigo: req.params.codigo } },
    select: { id: true, codigo: true, nombre: true },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });
  res.json(opciones);
});

// Todas las listas con todas sus opciones (activas e inactivas) y cuántos registros usan cada una.
listasRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const listas = await prisma.listaMaestra.findMany({
    orderBy: { nombre: "asc" },
    include: {
      opciones: {
        orderBy: [{ orden: "asc" }, { nombre: "asc" }],
        include: { _count: { select: { usuariosConTipoDocumento: true, solicitudesConTipoDocumento: true } } },
      },
    },
  });
  res.json(
    listas.map((l) => ({
      ...l,
      opciones: l.opciones.map(({ _count, ...o }) => ({
        ...o,
        enUso: _count.usuariosConTipoDocumento + _count.solicitudesConTipoDocumento,
      })),
    })),
  );
});

function validarOpcion(body: { codigo?: unknown; nombre?: unknown; orden?: unknown; activo?: unknown }) {
  const codigo = typeof body.codigo === "string" ? body.codigo.trim().toUpperCase().replace(/\s+/g, "_") : "";
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const orden = Number(body.orden ?? 0);
  if (!codigo || !nombre) return { error: "Escribe el código y el nombre de la opción" } as const;
  if (!/^[A-Z0-9_]{1,30}$/.test(codigo)) {
    return { error: "El código admite hasta 30 letras sin tilde, números o guion bajo" } as const;
  }
  if (nombre.length > 100) return { error: "El nombre admite hasta 100 caracteres" } as const;
  if (!Number.isInteger(orden) || orden < 0) return { error: "El orden debe ser un número entero positivo" } as const;
  return { codigo, nombre, orden, activo: body.activo !== false } as const;
}

const datosOpcion = (o: { codigo: string; nombre: string; orden: number; activo: boolean }) => ({
  Código: o.codigo,
  Nombre: o.nombre,
  Orden: o.orden,
  Activa: o.activo,
});

function esCodigoRepetido(e: unknown) {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
}

listasRouter.post("/:id/opciones", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const datos = validarOpcion(req.body);
  if ("error" in datos) return res.status(400).json({ error: datos.error });
  const lista = await prisma.listaMaestra.findUnique({ where: { id: Number(req.params.id) } });
  if (!lista) return res.status(404).json({ error: "Lista no encontrada" });

  try {
    const opcion = await prisma.opcionListaMaestra.create({ data: { ...datos, listaMaestraId: lista.id } });
    await registrarCambio(req, {
      modulo: "LISTAS",
      accion: "CREAR",
      afectado: { tipo: "Opción de lista", nombre: `${opcion.nombre} (${lista.nombre})` },
      descripcion: `Agregó la opción «${opcion.nombre}» a la lista «${lista.nombre}»`,
      nuevo: datosOpcion(opcion),
    });
    res.status(201).json({ ...opcion, enUso: 0 });
  } catch (e) {
    if (esCodigoRepetido(e)) return res.status(409).json({ error: "Ya existe una opción con ese código en esta lista" });
    throw e;
  }
});

listasRouter.put("/opciones/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const datos = validarOpcion(req.body);
  if ("error" in datos) return res.status(400).json({ error: datos.error });
  const id = Number(req.params.id);
  const antes = await prisma.opcionListaMaestra.findUnique({ where: { id }, include: { listaMaestra: true } });
  if (!antes) return res.status(404).json({ error: "Opción no encontrada" });

  try {
    const opcion = await prisma.opcionListaMaestra.update({ where: { id }, data: datos });
    await registrarCambio(req, {
      modulo: "LISTAS",
      accion: "EDITAR",
      afectado: { tipo: "Opción de lista", nombre: `${opcion.nombre} (${antes.listaMaestra.nombre})` },
      descripcion: `Editó la opción «${opcion.nombre}» de la lista «${antes.listaMaestra.nombre}»`,
      ...cambios(datosOpcion(antes), datosOpcion(opcion)),
    });
    res.json(opcion);
  } catch (e) {
    if (esCodigoRepetido(e)) return res.status(409).json({ error: "Ya existe una opción con ese código en esta lista" });
    throw e;
  }
});

listasRouter.delete("/opciones/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const existe = await prisma.opcionListaMaestra.findUnique({ where: { id }, include: { listaMaestra: true } });
  if (!existe) return res.status(404).json({ error: "Opción no encontrada" });
  try {
    await prisma.opcionListaMaestra.delete({ where: { id } });
    await registrarCambio(req, {
      modulo: "LISTAS",
      accion: "ELIMINAR",
      afectado: { tipo: "Opción de lista", nombre: `${existe.nombre} (${existe.listaMaestra.nombre})` },
      descripcion: `Eliminó la opción «${existe.nombre}» de la lista «${existe.listaMaestra.nombre}»`,
      anterior: datosOpcion(existe),
    });
    res.status(204).send();
  } catch (e) {
    manejarErrorEliminar(e, res, "Esta opción ya está en uso. Desactívala para que no aparezca en los formularios.");
  }
});
