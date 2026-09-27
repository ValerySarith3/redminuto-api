import "dotenv/config";
import { defineConfig } from "prisma/config";

const { DB_HOST = "localhost", DB_PORT = "3306", DB_USERNAME = "root", DB_PASSWORD = "", DB_DATABASE = "redminuto" } = process.env;
const credenciales = DB_PASSWORD ? `${DB_USERNAME}:${encodeURIComponent(DB_PASSWORD)}` : DB_USERNAME;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `mysql://${credenciales}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
  },
});
