# RedMinuto API

## Requisitos

- Node.js 20+
- MySQL/MariaDB (XAMPP)

## Ejecutar

1. Iniciar MySQL desde el panel de XAMPP.
2. Instalar dependencias:
   ```
   npm install
   ```
3. Copiar `.env.example` a `.env` y completar los datos de la base de datos.
4. Crear las tablas:
   ```
   npx prisma migrate deploy --config prisma7.config.ts
   ```
   (o importar `BD/redminuto_base_de_datos.sql` en phpMyAdmin)
5. Crear el usuario administrador:
   ```
   npm run seed:admin
   ```
6. Levantar la API:
   ```
   npm run dev
   ```

La API queda en `http://localhost:4000/api`.
