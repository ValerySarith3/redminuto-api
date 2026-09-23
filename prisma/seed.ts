import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@casaminutodedios.org";
  const password = process.env.ADMIN_PASSWORD ?? "CambiarClave123";

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log(`Ya existe un usuario con el correo ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.usuario.create({
    data: { nombre: "Administrador Casa Minuto de Dios", email, passwordHash, rol: "ADMIN" },
  });

  console.log(`Usuario administrador creado: ${email} / ${password}`);
  console.log("Cambia la contraseña después de iniciar sesión por primera vez.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
