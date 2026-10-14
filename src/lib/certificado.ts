import PDFDocument from "pdfkit";

// Colombia no tiene horario de verano: la hora local siempre es UTC−5.
const DESFASE_COLOMBIA_HORAS = 5;

// Abreviaturas usuales en Colombia; una opción nueva de la lista maestra se muestra con su nombre completo.
const ABREVIATURA_DOCUMENTO: Record<string, string> = {
  CC: "C.C.",
  TI: "T.I.",
  CE: "C.E.",
  PPT: "PPT",
  RC: "R.C.",
  OTRO: "Documento",
};

// Momento (en UTC) en que termina una jornada: su fecha a la hora de fin, en hora de Colombia.
export function finDeJornada(fecha: Date, horaFin: string) {
  const [horas, minutos] = horaFin.split(":").map(Number);
  return new Date(
    Date.UTC(
      fecha.getUTCFullYear(),
      fecha.getUTCMonth(),
      fecha.getUTCDate(),
      (Number.isFinite(horas) ? horas : 23) + DESFASE_COLOMBIA_HORAS,
      Number.isFinite(minutos) ? minutos : 59,
    ),
  );
}

// El certificado se habilita cuando la inscripción fue aceptada y la jornada ya terminó.
export function certificadoDisponible(
  estado: string,
  actividad: { fecha: Date; horaFin: string } | null,
  ahora = new Date(),
) {
  return estado === "ACEPTADA" && actividad !== null && finDeJornada(actividad.fecha, actividad.horaFin) <= ahora;
}

export function codigoCertificado(inscripcionId: number) {
  return `RM-VOL-${String(inscripcionId).padStart(6, "0")}`;
}

function duracionHoras(horaInicio: string, horaFin: string) {
  const minutos = (h: string) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + (mm || 0);
  };
  const total = minutos(horaFin) - minutos(horaInicio);
  if (!Number.isFinite(total) || total <= 0) return null;
  const horas = total / 60;
  return Number.isInteger(horas) ? `${horas}` : horas.toFixed(1).replace(".", ",");
}

function hora12(hora: string) {
  const [hh, mm] = hora.split(":").map(Number);
  const sufijo = hh < 12 ? "a. m." : "p. m.";
  const h = hh % 12 === 0 ? 12 : hh % 12;
  return `${h}:${String(mm || 0).padStart(2, "0")} ${sufijo}`;
}

const COLORES = {
  azul: "#012965",
  azulMedio: "#0a5ebe",
  dorado: "#cc9407",
  doradoClaro: "#fdce32",
  texto: "#232c3d",
  gris: "#647087",
};

export interface DatosCertificado {
  inscripcionId: number;
  voluntario: {
    nombre: string;
    tipoDocumento: { codigo: string; nombre: string } | null;
    numeroDocumento: string | null;
  };
  actividad: { titulo: string; fecha: Date; horaInicio: string; horaFin: string; lugar: string };
  programa: string;
}

// Devuelve el PDF del certificado en un Buffer (A4 horizontal).
export function generarCertificado(datos: DatosCertificado): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
      info: {
        Title: `Certificado de voluntariado – ${datos.voluntario.nombre}`,
        Author: "Casa Minuto de Dios – RedMinuto",
        Subject: `Participación en «${datos.actividad.titulo}»`,
      },
    });
    const partes: Buffer[] = [];
    doc.on("data", (parte: Buffer) => partes.push(parte));
    doc.on("end", () => resolve(Buffer.concat(partes)));
    doc.on("error", reject);

    const ancho = doc.page.width;
    const alto = doc.page.height;
    const margen = 60;
    const anchoTexto = ancho - margen * 2;

    // Marco: franja azul exterior y filete dorado interior.
    doc.rect(0, 0, ancho, alto).fill("#fbfdff");
    doc.lineWidth(14).strokeColor(COLORES.azul).rect(7, 7, ancho - 14, alto - 14).stroke();
    doc.lineWidth(1.5).strokeColor(COLORES.dorado).rect(26, 26, ancho - 52, alto - 52).stroke();
    // Esquinas doradas.
    for (const [x, y] of [
      [26, 26],
      [ancho - 26, 26],
      [26, alto - 26],
      [ancho - 26, alto - 26],
    ]) {
      doc.circle(x, y, 5).fill(COLORES.dorado);
    }

    doc
      .fillColor(COLORES.azulMedio)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("CASA MINUTO DE DIOS  ·  REDMINUTO", margen, 62, { width: anchoTexto, align: "center", characterSpacing: 2 });

    doc
      .fillColor(COLORES.azul)
      .font("Times-Bold")
      .fontSize(40)
      .text("Certificado de participación", margen, 92, { width: anchoTexto, align: "center" });

    const yLinea = 146;
    doc
      .moveTo(ancho / 2 - 90, yLinea)
      .lineTo(ancho / 2 + 90, yLinea)
      .lineWidth(2)
      .strokeColor(COLORES.doradoClaro)
      .stroke();

    doc
      .fillColor(COLORES.gris)
      .font("Helvetica")
      .fontSize(13)
      .text("Casa Minuto de Dios hace constar que", margen, 172, { width: anchoTexto, align: "center" });

    doc
      .fillColor(COLORES.azul)
      .font("Times-BoldItalic")
      .fontSize(34)
      .text(datos.voluntario.nombre, margen, 198, { width: anchoTexto, align: "center" });

    const { tipoDocumento, numeroDocumento } = datos.voluntario;
    let y = doc.y + 4;
    if (numeroDocumento) {
      doc
        .fillColor(COLORES.gris)
        .font("Helvetica")
        .fontSize(12)
        .text(`${tipoDocumento ? (ABREVIATURA_DOCUMENTO[tipoDocumento.codigo] ?? tipoDocumento.nombre) : "Documento"} ${numeroDocumento}`, margen, y, {
          width: anchoTexto,
          align: "center",
        });
      y = doc.y;
    }

    const fecha = datos.actividad.fecha.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    const horas = duracionHoras(datos.actividad.horaInicio, datos.actividad.horaFin);
    const duracion = horas ? `, con una intensidad de ${horas} ${horas === "1" ? "hora" : "horas"}` : "";

    // Cada línea usa una sola fuente: pdfkit no centra bien un párrafo que cambia de fuente a mitad de línea.
    doc
      .fillColor(COLORES.texto)
      .font("Helvetica")
      .fontSize(14)
      .text("participó como voluntario(a) en la jornada", margen, y + 18, { width: anchoTexto, align: "center" });
    doc
      .fillColor(COLORES.azul)
      .font("Helvetica-Bold")
      .fontSize(18)
      .text(`«${datos.actividad.titulo}»`, margen, doc.y + 6, { width: anchoTexto, align: "center" });
    doc
      .fillColor(COLORES.texto)
      .font("Helvetica")
      .fontSize(13)
      .text(
        `del programa ${datos.programa}, realizada el ${fecha} de ${hora12(datos.actividad.horaInicio)} a ${hora12(datos.actividad.horaFin)} en ${datos.actividad.lugar}${duracion}.`,
        margen + 60,
        doc.y + 6,
        { width: anchoTexto - 120, align: "center", lineGap: 3 },
      );

    doc
      .fillColor(COLORES.gris)
      .font("Helvetica-Oblique")
      .fontSize(12)
      .text("Gracias por donar tu tiempo y tu talento al servicio de quienes más lo necesitan.", margen, doc.y + 16, {
        width: anchoTexto,
        align: "center",
      });

    // Firma y datos de expedición.
    const yFirma = alto - 128;
    const anchoFirma = 220;
    const xFirma = ancho / 2 - anchoFirma / 2;
    doc
      .moveTo(xFirma, yFirma)
      .lineTo(xFirma + anchoFirma, yFirma)
      .lineWidth(1)
      .strokeColor(COLORES.texto)
      .stroke();
    doc
      .fillColor(COLORES.texto)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Coordinación de Voluntariado", xFirma - 40, yFirma + 8, { width: anchoFirma + 80, align: "center" })
      .font("Helvetica")
      .fillColor(COLORES.gris)
      .text("Casa Minuto de Dios", { width: anchoFirma + 80, align: "center" });

    const expedido = new Date().toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Bogota",
    });
    doc
      .fontSize(9)
      .fillColor(COLORES.gris)
      .text(`Expedido el ${expedido}`, margen, alto - 62, { width: anchoTexto / 2, align: "left" })
      .text(`Código de verificación: ${codigoCertificado(datos.inscripcionId)}`, ancho / 2, alto - 62, {
        width: anchoTexto / 2,
        align: "right",
      });

    doc.end();
  });
}
