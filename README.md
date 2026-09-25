# RedMinuto API

Backend de **RedMinuto**, la plataforma que centraliza donaciones, voluntariado y solicitudes de ayuda de Casa Minuto de Dios (Corporación Minuto de Dios).

Construido con Express 5, Prisma 7 y MySQL/MariaDB. El frontend correspondiente está en el proyecto hermano `redminuto-web`.

## Usuario administrador

Quien se registra desde la web siempre queda con rol `USUARIO`; el rol `ADMIN` no se puede obtener por autorregistro. La cuenta administradora se crea con el script de seed:

```
npm run seed:admin
```

Con los valores por defecto, esto crea:

| Campo      | Valor                              |
|------------|-------------------------------------|
| Correo     | `admin@casaminutodedios.org`        |
| Contraseña | `CambiarClave123`                   |

**Cambia esta contraseña (o crea un nuevo administrador y elimina este) antes de usar la plataforma en producción.** Puedes personalizar las credenciales del seed definiendo `ADMIN_EMAIL` y `ADMIN_PASSWORD` en tu `.env` antes de ejecutar el script. Si el correo ya existe, el script no hace nada (es seguro volver a ejecutarlo).

Una vez dentro con esa cuenta, el propio administrador puede crear, editar el rol o eliminar cualquier otro usuario (incluidos otros administradores) desde el panel `/admin` → pestaña **Usuarios** en `redminuto-web`.

## Requisitos

- Node.js 20+
- MySQL o MariaDB corriendo localmente (o accesible por red)

### Base de datos con XAMPP (este proyecto ya está configurado así)

Este proyecto usa el MySQL que trae **XAMPP**. A diferencia de otros servicios de Windows, el MySQL de XAMPP **no arranca solo al encender el computador**: cada vez que reinicies tu equipo, antes de correr la API debes:

1. Abrir el **Panel de Control de XAMPP**.
2. Darle **Start** al módulo **MySQL** (debe quedar en verde).

Con eso, el servidor queda escuchando en `localhost:3306`, que es lo que espera el `DATABASE_URL` de este proyecto (`mysql://root:@localhost:3306/redminuto`, usuario `root` sin contraseña — el valor por defecto de XAMPP). La base de datos `redminuto` y todas sus tablas ya existen en `C:\xampp\mysql\data\redminuto`, así que no necesitas volver a crearlas: mientras XAMPP esté corriendo, tus datos (usuarios, programas, donaciones, etc.) persisten entre reinicios.

Si más adelante usas un MySQL distinto a XAMPP (otra instalación, un servidor remoto, Docker, etc.), simplemente ajusta `DATABASE_URL` en tu `.env` con los datos de esa conexión.

## Puesta en marcha

1. Instala las dependencias:
   ```
   npm install
   ```
2. Copia `.env.example` a `.env` y ajusta `DATABASE_URL` si no vas a usar XAMPP (ver sección anterior):
   ```
   cp .env.example .env
   ```
3. Asegúrate de que el módulo MySQL de XAMPP esté iniciado (o tu servidor MySQL/MariaDB, si usas otro).
4. Aplica las migraciones (esto crea la base de datos si no existe y todas las tablas):
   ```
   npx prisma migrate dev
   ```
5. Crea el usuario administrador:
   ```
   npm run seed:admin
   ```
6. Levanta la API en modo desarrollo:
   ```
   npm run dev
   ```

La API queda disponible en `http://localhost:4000/api` (o el puerto que definas en `PORT`).

> **Ojo con `DATABASE_URL`:** la API usa el adaptador de MariaDB y funciona con `mariadb://...`, pero los comandos de Prisma (`migrate`, `studio`) solo aceptan `mysql://...`. Si `npx prisma migrate ...` falla con `P1013 ... scheme is not recognized`, córrelo así (en Git Bash):
> ```
> DATABASE_URL="mysql://root@localhost:3306/redminuto" npx prisma migrate deploy
> ```
> Alternativa sin Prisma: importar `BD/redminuto_base_de_datos.sql` en phpMyAdmin.

> Si al correr `npm run dev` o `npx prisma migrate dev` ves un error como `Can't connect to MySQL server` o `ECONNREFUSED`, casi siempre significa que el módulo MySQL de XAMPP no está iniciado — vuelve al Panel de Control de XAMPP y dale Start.

## Scripts

| Script              | Descripción                                              |
|---------------------|-----------------------------------------------------------|
| `npm run dev`       | Levanta la API con recarga automática (`tsx watch`)       |
| `npm run build`     | Compila TypeScript a `dist/`                               |
| `npm run start`     | Corre la build compilada (`dist/index.js`)                 |
| `npm run seed:admin`| Crea el usuario administrador si no existe                 |

Comandos útiles de Prisma:

- `npx prisma migrate dev --name <nombre>` — crea y aplica una nueva migración tras editar `prisma/schema.prisma`.
- `npx prisma studio` — explorador visual de la base de datos.

## Roles y permisos

Solo hay dos roles. Los perfiles de donante, voluntario y beneficiario **no son roles de cuenta**: con la misma cuenta una persona puede donar, inscribirse como voluntaria y pedir ayuda. El tablero del admin calcula cuántas personas participan de cada forma a partir de su actividad.

| Rol       | Puede...                                                                 |
|-----------|---------------------------------------------------------------------------|
| `USUARIO` | Donar a campañas, inscribirse a jornadas de voluntariado (según cupo), registrar solicitudes de ayuda y ver todo su seguimiento personal |
| `ADMIN`   | Lo anterior, más: tablero y reportes, confirmar pagos, gestionar programas, campañas y actividades, revisar inscripciones y solicitudes, y gestionar usuarios |

## Estructura de la API

Todas las rutas cuelgan de `/api`:

| Recurso           | Rutas principales                                                        |
|--------------------|----------------------------------------------------------------------------|
| `/usuarios`        | Registro, login, `GET /yo`; **admin**: listar, crear, cambiar rol y eliminar usuarios |
| `/programas`       | Listar/ver público; **admin**: crear, editar, eliminar                     |
| `/campanas`        | Listar/ver público; **admin**: crear, editar, eliminar                     |
| `/donaciones`      | Crear (autenticado), ver las propias (`/mias`); **admin**: listar todas    |
| `/voluntariado`    | Inscribirse (valida cupo), ver las propias (`/mias`); **admin**: listar todas y cambiar estado |
| `/beneficiarios`   | Registrar solicitud, ver las propias (`/mias`); **admin**: listar todas y cambiar estado |
| `/dashboard`       | Avance por campaña/programa, y `/mio` con el seguimiento personal (incluye el historial de estados) |
| `/actividades`     | Listar jornadas de voluntariado (público); **admin**: crear, editar, eliminar |
| `/reportes`        | **Solo admin**: `/resumen` (tablero con indicadores) y `/exportar/donaciones`, `/exportar/inscripciones` y `/exportar/solicitudes` (CSV para Excel). Aceptan `?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` |

## Modelo de datos (10 tablas)

| Tabla | Para qué sirve |
|-------|----------------|
| `Usuario` | Cuentas con su rol (donante, voluntario, beneficiario, admin) |
| `Programa` | Programas de la sede (ej. comedores comunitarios) con su meta de voluntarios |
| `Campana` | Campañas de recaudo de cada programa, con meta en dinero |
| `Actividad` | Jornadas de voluntariado de un programa: fecha, horario, lugar y cupo propio |
| `Donacion` | Aportes de los donantes a una campaña |
| `Pago` | Transacción de cada donación con la pasarela (sandbox). Su `referencia` única evita donaciones duplicadas por doble clic o reintentos |
| `InscripcionVoluntario` | Inscripción de un voluntario a una actividad (o al programa en general) |
| `SolicitudBeneficiario` | Solicitudes formales de ayuda |
| `HistorialEstado` | Bitácora de trazabilidad: cada creación o cambio de estado de una donación, inscripción o solicitud, con fecha, usuario y nota |
| `ConsentimientoDatos` | Prueba de la autorización de tratamiento de datos (Ley 1581 de 2012): quién, cuándo, para qué y qué versión de la política |

## Notas de seguridad

- Las contraseñas se guardan con `bcrypt`; nunca en texto plano.
- Los listados administrativos que exponen datos personales (usuarios, donaciones, inscripciones, solicitudes) requieren rol `ADMIN`.
- Las relaciones de `Usuario` con sus inscripciones y solicitudes usan borrado en cascada: al eliminar un usuario se eliminan sus inscripciones y solicitudes. Sus donaciones se conservan (para no perder el histórico de recaudo de las campañas), solo se desvincula el donante.
