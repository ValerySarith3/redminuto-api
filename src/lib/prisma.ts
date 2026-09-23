import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

export const prisma = new PrismaClient({ adapter });
