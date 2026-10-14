import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USERNAME ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE ?? "redminuto",
  // Las bases en la nube (Aiven) exigen conexión cifrada; en local no se usa.
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

export const prisma = new PrismaClient({ adapter });
