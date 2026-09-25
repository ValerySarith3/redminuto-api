# RedMinuto — ¿Qué hace la aplicación?

Resumen para la reunión del grupo (25 sep 2026). Se basa en la Entrega 1 (Semana 3) y en el código actual de `redminuto-api` y `redminuto-web`.

---

## 1. La idea en una frase

**RedMinuto es una plataforma web para Casa Minuto de Dios que reúne en un solo lugar las donaciones, el voluntariado y las solicitudes de ayuda, y le permite a cada persona ver en qué estado está su aporte o su solicitud.**

**Problema:** hoy todo pasa por redes sociales, WhatsApp, hojas de cálculo y varias cuentas bancarias. Nadie sabe con certeza qué pasó con su donación, si quedó inscrito o si su solicitud fue recibida.

**Solución:** un solo sistema con **trazabilidad**: cada donación, inscripción o solicitud queda guardada con fecha, usuario y estado, y se puede consultar.

---

## 2. ¿Quién la usa y qué puede hacer?

Al registrarse **no se elige rol**: con una sola cuenta una persona puede donar, ser voluntaria y pedir ayuda (alguien que dona hoy puede necesitar ayuda mañana). Solo el personal de la sede es **administrador**. Donante, voluntario y beneficiario son formas de participar, no tipos de cuenta.

| Usuario | Qué hace en RedMinuto |
|---|---|
| **Donante** | Se registra, elige una campaña de un programa, dona con un pago simulado (sandbox), recibe un **comprobante** (ej. `RM-D-000012`) y ve en su panel cuánto lleva recaudado la campaña frente a su meta, con el **historial** de su donación (ej. Pendiente → Completada). |
| **Voluntario** | Se registra, ve las **jornadas** de cada programa (fecha, horario, lugar y cupos disponibles), se inscribe (el sistema no deja inscribirse si no hay cupo, si la jornada ya pasó o si ya estaba inscrito) y sigue el estado de su inscripción. |
| **Beneficiario** | Se registra, llena un **formulario formal de solicitud de ayuda** (datos personales, documento, tipo de apoyo, personas a cargo, autorización de datos) y consulta si su solicitud está pendiente, en revisión, aprobada o rechazada, con la fecha de cada cambio. |
| **Administrador** (personal de Casa Minuto de Dios) | Tiene un **tablero con indicadores y gráficos**, genera **reportes** (imprimir/PDF y Excel), confirma los pagos de las donaciones, gestiona programas, campañas y jornadas de voluntariado, revisa inscripciones y solicitudes, y administra usuarios. |

---

## 3. Pantallas de la página web

| Ruta | Qué muestra |
|---|---|
| `/` Inicio | Portada, programas, campañas con barra de avance ($ recaudado / meta) y botón **Donar**. |
| `/voluntariado` | Programas con sus próximas jornadas (fecha, hora, lugar, cupos) y botón **Inscribirme**. |
| `/beneficiarios` | Formulario de solicitud de ayuda. |
| `/dashboard` | **Mi seguimiento**: total donado, mis donaciones con comprobante y avance de la campaña, mi voluntariado y mis solicitudes, cada una con su **línea de tiempo** de estados. |
| `/auth` | Ingreso y registro (nombre, correo, contraseña y aceptación de la política de datos; no se elige rol). |
| `/privacidad` | Política de tratamiento de datos (Ley 1581 de 2012). |
| `/admin` | Panel del administrador con un **menú lateral** en 4 grupos: *Resumen* (Tablero, Reportes), *Seguimiento* (Donaciones, Voluntariado, Solicitudes, con contadores de pendientes), *Contenido* (Programas, Campañas, Actividades) y *Administración* (Usuarios). |

### Panel del administrador: Tablero y Reportes

**Tablero:** muestra el estado de todo de un vistazo y se puede filtrar por periodo (últimos 30 días, 90 días, este año o todo). Casi todo es clicable y lleva a la sección con el filtro ya aplicado.
- Saludo con la fecha y el selector de periodo.
- **Por atender:** pagos por confirmar, voluntarios por aprobar y solicitudes sin resolver.
- Indicadores con animación: recaudo, pagos por confirmar, inscripciones y solicitudes.
- **Evolución del recaudo** mes a mes (se cambia entre monto y número de donaciones) y recaudo por canal.
- Anillos de avance de cada campaña frente a su meta.
- **Estado de los procesos:** gráfico circular que se cambia entre solicitudes, voluntariado y donaciones; al hacer clic en un estado se abren esos registros.
- Qué tipo de ayuda se pide y **la comunidad** (cuántas personas han donado, son voluntarias o han pedido ayuda).
- Próximas jornadas en formato calendario y **actividad reciente** (quién cambió qué y hace cuánto).

**Reportes:** se elige un rango de fechas y se genera un "Reporte de gestión" con:
1. Resumen del periodo.
2. Avance de campañas.
3. Donaciones (por estado, por canal y detalle).
4. Voluntariado (por estado, próximas jornadas y detalle).
5. Solicitudes (por estado, por tipo de apoyo y detalle).

Tiene un botón **Imprimir / PDF** y otros tres que descargan en **Excel (CSV)** las donaciones, el voluntariado y las solicitudes.

---

## 4. Tecnología

- **Frontend:** React 19 + TypeScript, React Router, Tailwind CSS, Framer Motion y Recharts para los gráficos (colores azul/dorado del logo).
- **Backend (API):** Node.js + Express 5 + TypeScript.
- **Base de datos:** MySQL (XAMPP) con Prisma como ORM.
- **Seguridad:** contraseñas cifradas con bcrypt, sesiones con token JWT, permisos por rol.
- **Organización del código:** separado por módulo: donaciones, voluntariado, beneficiarios, actividades, dashboard, reportes, admin.

### Modelo de datos (10 tablas)

| Tabla | Para qué sirve | Requisito que respalda |
|---|---|---|
| `Usuario` | Cuentas (rol `USUARIO` o `ADMIN`) | RF1, RF5 |
| `Programa` | Programas de la sede | RF2, RF9 |
| `Campana` | Campañas de recaudo con meta en dinero | RF2, RF9 |
| `Actividad` **(nueva)** | Jornadas de voluntariado: fecha, horario, lugar y cupo | RF5, RF6 |
| `Donacion` | Aportes a una campaña | RF4 |
| `Pago` **(nueva)** | Transacción con la pasarela sandbox; referencia única para no duplicar | RF3, RNF 8 |
| `InscripcionVoluntario` | Inscripción a una jornada | RF6 |
| `SolicitudBeneficiario` | Solicitud formal de ayuda | RF7, RF8 |
| `HistorialEstado` **(nueva)** | Bitácora: cada cambio de estado con fecha, usuario y nota | RNF 9 (trazabilidad) |
| `ConsentimientoDatos` **(nueva)** | Prueba de la autorización de datos (fecha y versión de la política) | RNF 10 (Ley 1581) |

Un **programa** tiene varias **campañas** (con meta en dinero) y varias **actividades** (jornadas con cupo).

---

## 5. ¿Está implementado lo que prometimos en la Entrega 1?

### Requisitos funcionales

| # | Requisito del documento | Estado | Comentario |
|---|---|---|---|
| RF1 | Donantes se registran y autentican | ✅ Hecho | Registro/login con JWT. |
| RF2 | Elegir programa o campaña a donar | ✅ Hecho | Campañas agrupadas por programa en el inicio. |
| RF3 | Pago por pasarela en modo sandbox | 🟡 Parcial | Es un **pago simulado**: no se conecta a Wompi/PayU sandbox real. Cumple con "medio de pago digital simulado", pero si el profe espera una pasarela sandbox real, falta. |
| RF4 | Comprobante y registro por donación | ✅ Hecho | Número `RM-D-xxxxxx` en el modal y en el panel. No hay comprobante descargable (PDF). |
| RF5 | Voluntarios se registran y ven actividades | ✅ Hecho | Jornadas con fecha, horario, lugar y cupo (tabla `Actividad`). |
| RF6 | Inscribirse validando cupo | ✅ Hecho | Valida el cupo de la jornada, que no haya pasado y que no se repita la inscripción. |
| RF7 | Beneficiario registra solicitud con tipo de apoyo | ✅ Hecho | Alimentos, salud, educación, vivienda, empleo, otro. |
| RF8 | Consultar estado de la solicitud | ✅ Hecho | Estados: Pendiente, En revisión, Aprobada, Rechazada (el documento dice "recibida / en proceso / atendida"; equivalen), con línea de tiempo. |
| RF9 | Dashboard: % de meta y voluntarios vs cupo | ✅ Hecho | Barras de avance públicas, panel personal y tablero del admin con gráficos. |
| RF10 | Admin gestiona programas, actividades y solicitudes | ✅ Hecho | Además: confirmación de donaciones, usuarios y reportes. |

### Requisitos no funcionales

| # | Requisito | Estado | Comentario |
|---|---|---|---|
| 1 | Usabilidad (menos de 5 min) | ✅ | Flujos cortos, mensajes de confirmación. Falta validarlo con usuarios reales. |
| 2 | Disponibilidad 99% | ⏳ No aplica aún | La app corre en local; se cumple cuando se despliegue. |
| 3 | Seguridad (cifrado, HTTPS, sesiones) | 🟡 Parcial | bcrypt + JWT + roles. HTTPS depende del despliegue. |
| 4 | Escalabilidad | 🟡 | Arquitectura API + BD separada lo permite; no probado con carga. |
| 5 | Rendimiento (menos de 3 s) | ✅ en local | No medido formalmente. |
| 6 | Compatibilidad / responsive | ✅ | Tailwind responsive; funciona en Chrome/Edge/Firefox. |
| 7 | Mantenibilidad (módulos por dominio) | ✅ | Rutas y carpetas separadas por módulo. |
| 8 | Confiabilidad (no perder/duplicar) | ✅ | Evita doble inscripción; cada pago tiene una referencia única, así que un doble clic o un reintento no duplica la donación. Las operaciones se guardan en transacciones. |
| 9 | Trazabilidad (fecha, hora, usuario) | ✅ | Tabla `HistorialEstado`: cada creación y cambio de estado queda con fecha, usuario y nota; el usuario lo ve como línea de tiempo. |
| 10 | Ley 1581 de 2012 | ✅ | Autorización obligatoria al registrarse y al pedir ayuda, guardada en `ConsentimientoDatos`, más la página `/privacidad`. |

**Conclusión:** los 10 requisitos funcionales del documento están implementados (RF3 como pago simulado). Lo que queda son mejoras y los requisitos no funcionales que dependen de desplegar la app.

---

## 6. Lo que falta o se puede mejorar (para repartir en el grupo)

**Ya resuelto (25 sep):** pestaña de donaciones para confirmar pagos, jornadas con fecha y hora, historial de estados, protección contra donaciones duplicadas, autorización de datos al registrarse con su página de política, tablero del admin y reportes.

**Pendiente**
1. **Pasarela sandbox real** (Wompi o PayU en modo de pruebas), si el profe lo pide así. La tabla `Pago` ya está lista para guardar la respuesta de la pasarela.
2. Comprobante de donación descargable en PDF.
3. Certificado o constancia de participación para voluntarios (se puede sacar de las inscripciones aceptadas).
4. Mensajes de actualización sobre el impacto de los programas para los donantes.

**Próxima entrega**
5. Pruebas con usuarios (objetivo específico 3 del documento).
6. Desplegar la app (para HTTPS y disponibilidad).

---

## 7. Cómo mostrar la app en la reunión

1. Abrir XAMPP y darle **Start** a MySQL.
2. En `redminuto-api`: `npm run dev` (API en `http://localhost:4000/api`).
3. En `redminuto-web`: `npm run dev` (web en `http://localhost:5173`).
4. Entrar como administrador con la cuenta de desarrollo `admin@redminuto.test` / `AdminSeguro123` (o crear otra con `npm run seed:admin`).
5. Antes de la demo, crear 1 o 2 **actividades** en la pestaña Actividades para que el voluntario tenga jornadas donde inscribirse.

**Demo sugerida (5 min):** crear una cuenta → donar a una campaña → ver comprobante y la barra de avance en *Mi seguimiento* → con la misma cuenta, inscribirse a una jornada y enviar una solicitud de ayuda → entrar como admin: mostrar el **Tablero**, confirmar la donación en *Donaciones*, cambiar el estado de la solicitud y generar un **Reporte** → volver a la cuenta y ver la línea de tiempo con el nuevo estado.
