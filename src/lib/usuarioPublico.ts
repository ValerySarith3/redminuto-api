// Campos seguros de Usuario para exponer en relaciones — nunca incluir passwordHash.
export const usuarioPublico = {
  select: { id: true, nombre: true, email: true, rol: true, creadoEn: true },
} as const;
