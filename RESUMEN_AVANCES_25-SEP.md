# RedMinuto: avances del 25 de septiembre y lo que falta

Resumen para el grupo. Complementa `RESUMEN_REDMINUTO.md`, que explica qué hace la aplicación.

---

## 1. En una frase

**Los 10 requisitos funcionales de la Entrega 1 ya están implementados.** Hoy se reforzó la base de datos, se rediseñó el panel del administrador y se prepararon los mockups. Lo que falta son mejoras de la propuesta de valor, las pruebas con usuarios y publicar la app en internet.

---

## 2. Lo que se hizo hoy

### Base de datos: de 6 a 10 tablas
| Tabla nueva | Para qué | Requisito que respalda |
|---|---|---|
| `Actividad` | Jornadas de voluntariado con fecha, horario, lugar y cupo | RF5, RF6 |
| `Pago` | Referencia única por pago, para que un doble clic no duplique la donación | RF3, RNF 8 (confiabilidad) |
| `HistorialEstado` | Bitácora: quién cambió qué estado y cuándo | RNF 9 (trazabilidad) |
| `ConsentimientoDatos` | Prueba de que la persona aceptó la política de datos | RNF 10 (Ley 1581) |

### Cambios en la página
- **Registro sin rol:** con una sola cuenta se puede donar, ser voluntario y pedir ayuda. Solo quedan dos roles: *Usuario* y *Administrador*.
- **Política de datos:** hay que aceptarla al registrarse y al pedir ayuda. Nueva página `/privacidad`.
- **Voluntariado por jornadas:** cada programa muestra sus jornadas con los cupos en tiempo real. No deja inscribirse si no hay cupo o si la jornada ya pasó.
- **Mi seguimiento:** cada donación, inscripción y solicitud muestra su **línea de tiempo** (ej. Pendiente → En revisión → Aprobada).
- **Botón "Cerrar sesión"** visible en la barra de arriba.
- **Logo real** de RedMinuto en toda la página y en el ícono de la pestaña.
- **Fuentes nuevas:** *Merriweather* para títulos e *Inter* para textos.

### Panel del administrador (rediseñado)
- **Menú lateral en 4 grupos:** Resumen, Seguimiento, Contenido y Administración. Tiene contadores amarillos de lo pendiente.
- **Tablero interactivo:**
  - Saludo y selector de periodo.
  - "Por atender": pagos, voluntarios y solicitudes pendientes.
  - Indicadores con animación.
  - Gráfico de evolución del recaudo y avance de cada campaña en anillos.
  - Gráfico circular de estados, qué ayuda se pide, la comunidad y la actividad reciente.
  - **Casi todo se puede tocar y lleva a la sección ya filtrada.**
- **Reportes:** reporte de gestión por rango de fechas. Se imprime o se guarda como **PDF**, y se descarga para **Excel**: donaciones, voluntariado y solicitudes.
- **Nuevas secciones:** *Donaciones* (confirmar o rechazar pagos por transferencia, llave o efectivo) y *Actividades* (crear jornadas).
- Filtros por estado en Donaciones, Voluntariado y Solicitudes.

### Mockups
- Lienzo con **10 pantallas reales** de la página: 7 de escritorio y 3 de celular.
- Link: https://claude.ai/artifact/Szp5g7fopyfJRC1s284Uj2 (Valery debe compartirlo desde *Share* para que el resto lo pueda abrir).

---

## 3. Estado frente al PDF (Entrega 1)

### Requisitos funcionales: 10 de 10 ✅
| RF | Estado | Nota |
|---|---|---|
| RF1 Registro y autenticación | ✅ | |
| RF2 Elegir programa o campaña | ✅ | |
| RF3 Pago por pasarela sandbox | 🟡 | Pago **simulado**; no se conecta a Wompi/PayU real |
| RF4 Comprobante y registro | ✅ | Número de comprobante; falta el PDF descargable |
| RF5 Ver actividades | ✅ | Jornadas con fecha, hora y lugar |
| RF6 Inscripción validando cupo | ✅ | |
| RF7 Solicitud con tipo de apoyo | ✅ | |
| RF8 Consultar estado de la solicitud | ✅ | Con línea de tiempo |
| RF9 Dashboard de metas y cupos | ✅ | |
| RF10 Admin gestiona todo | ✅ | Además tiene tablero y reportes |

### Requisitos no funcionales
| RNF | Estado | Qué falta |
|---|---|---|
| 1 Usabilidad (< 5 min) | 🟡 | Medirlo en las pruebas con usuarios |
| 2 Disponibilidad 99% | ⏳ | Publicar la app en internet |
| 3 Seguridad | 🟡 | Hay contraseñas cifradas, sesión con token y permisos por rol; falta HTTPS (llega al publicar) |
| 4 Escalabilidad | 🟡 | Sin pruebas de carga |
| 5 Rendimiento (< 3 s) | 🟡 | Rápido en local, pero sin medir formalmente |
| 6 Compatibilidad / responsive | ✅ | Probado en escritorio y celular |
| 7 Mantenibilidad | ✅ | Código separado por módulos |
| 8 Confiabilidad | ✅ | No duplica donaciones ni inscripciones |
| 9 Trazabilidad | ✅ | Tabla `HistorialEstado` |
| 10 Ley 1581 | 🟡 | Hay consentimiento y política; falta que el usuario pueda **ver, corregir o borrar sus datos** |

---

## 4. Lo que falta (para repartir)

### A. Del PDF: prioridad alta
1. **Pruebas con usuarios** (objetivo específico 3): definir tareas (donar, inscribirse, pedir ayuda), medir el tiempo (< 5 min) y hacer una encuesta corta.
2. **Publicar la app en internet**, por ejemplo con Render o Railway para la API y Vercel para la web. Eso da HTTPS y disponibilidad (RNF 2 y 3).
3. **Derechos de datos (Ley 1581):** una opción en "Mi seguimiento" para editar datos personales y pedir que se borre la cuenta.

### B. De la propuesta de valor del PDF: prioridad media
4. **Comprobante de donación en PDF** descargable (RF4, dolor del donante).
5. **Certificado de participación** para voluntarios con inscripción aceptada ("reconocimiento o certificación" en el lienzo de propuesta de valor).
6. **Novedades de impacto:** el admin publica avances de un programa y el donante los ve en su panel ("recibir actualizaciones claras sobre el impacto").
7. **Tiempo estimado de respuesta** en las solicitudes de ayuda. La observación mostró ansiedad por no saber cuánto tarda.
8. **Pasarela sandbox real** (Wompi o PayU en modo de pruebas), si el profe la pide. La tabla `Pago` ya está lista.

### C. Detalles de estilo y calidad: prioridad baja
9. En **celular**, la barra de arriba queda algo apretada (menú, logo, nombre y cerrar sesión).
10. **Datos de demostración:** un script que cargue programas, jornadas, donaciones y solicitudes de ejemplo para que las demos y los mockups no se vean vacíos.
11. Revisar los textos y estados vacíos de cada pantalla.
12. Algunas advertencias del linter (`npm run lint`), ninguna grave.
13. Pruebas automáticas (hoy no hay ninguna).
14. **Guardar en git:** los cambios de hoy **no tienen commit** todavía.

---

## 5. Para correr el proyecto

1. XAMPP → **Start** en MySQL.
2. `redminuto-api` → `npm run dev` (API en http://localhost:4000/api).
3. `redminuto-web` → `npm run dev` (web en http://localhost:5173).
4. Cuenta admin de desarrollo: `admin@redminuto.test` / `AdminSeguro123`.

**Si tu base de datos es de antes de hoy**, tienes dos opciones para actualizarla:
- Importar `redminuto-api/BD/redminuto_base_de_datos.sql` en phpMyAdmin, **o**
- En Git Bash, dentro de `redminuto-api`:
  ```
  DATABASE_URL="mysql://root@localhost:3306/redminuto" npx prisma migrate deploy
  ```
Después, en `redminuto-web` corre `npm install` (hoy se agregó la librería de gráficos Recharts).
