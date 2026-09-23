import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Rol } from "../generated/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-cambiar-en-produccion";

export interface TokenPayload {
  id: number;
  rol: Rol;
  nombre: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function firmarToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }
  try {
    const token = header.slice("Bearer ".length);
    req.user = jwt.verify(token, JWT_SECRET) as TokenPayload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requireRole(...roles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "No tienes permiso para esta acción" });
    }
    next();
  };
}
