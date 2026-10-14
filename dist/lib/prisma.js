"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("../generated/prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const adapter = new adapter_mariadb_1.PrismaMariaDb({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USERNAME ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_DATABASE ?? "redminuto",
    // Las bases en la nube (Aiven) exigen conexión cifrada; en local no se usa.
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});
exports.prisma = new client_1.PrismaClient({ adapter });
