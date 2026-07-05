import { PDFDocument, StandardFonts, rgb, type RGB } from 'pdf-lib';
import {
  CERTIFICATE_FIELD_LAYOUT,
  formatGrade,
  middleRatioToPdfBaseline,
  parseCertificateDate,
  scaleFontSize,
  type CertificateData,
  type FieldAlign,
} from './field-layout';

const MAROON = rgb(0.45, 0.08, 0.08);
const BLACK = rgb(0.1, 0.1, 0.1);

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function pickColor(color: 'maroon' | 'black'): RGB {
  return color === 'maroon' ? MAROON : BLACK;
}

function pickHex(color: 'maroon' | 'black'): string {
  return color === 'maroon' ? '#682222' : '#1a1a1a';
}

export async function generateCertificatePdf(
  templatePng: Uint8Array,
  data: CertificateData,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(templatePng);
  const width = pngImage.width;
  const height = pngImage.height;
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(pngImage, { x: 0, y: 0, width, height });

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const layout = CERTIFICATE_FIELD_LAYOUT;
  const { day, month, yearSuffix } = parseCertificateDate(data.issuedAt);

  const drawCenteredLines = (
    text: string,
    top: number,
    fontSize: number,
    bold: boolean,
    maxWidthRatio: number,
    color: 'maroon' | 'black',
  ) => {
    const font = bold ? fontBold : fontRegular;
    const size = scaleFontSize(fontSize, height);
    const lineHeight = size * 1.35;
    const maxChars = Math.floor((width * maxWidthRatio) / (size * 0.48));
    const lines = wrapText(text, maxChars);

    lines.forEach((line, i) => {
      const lineTop = top + (i * lineHeight) / height;
      const textWidth = font.widthOfTextAtSize(line, size);
      page.drawText(line, {
        x: (width - textWidth) / 2,
        y: middleRatioToPdfBaseline(height, lineTop, size),
        size,
        font,
        color: pickColor(color),
      });
    });
  };

  const drawAt = (
    text: string,
    left: number,
    top: number,
    fontSize: number,
    bold: boolean,
    color: 'maroon' | 'black',
    align: FieldAlign = 'left',
  ) => {
    const font = bold ? fontBold : fontRegular;
    const size = scaleFontSize(fontSize, height);
    const textWidth = font.widthOfTextAtSize(text, size);
    const anchorX = width * left;
    page.drawText(text, {
      x: align === 'center' ? anchorX - textWidth / 2 : anchorX,
      y: middleRatioToPdfBaseline(height, top, size),
      size,
      font,
      color: pickColor(color),
    });
  };

  drawCenteredLines(
    data.studentName.toUpperCase(),
    layout.studentName.top,
    layout.studentName.fontSize,
    layout.studentName.bold,
    layout.studentName.maxWidth,
    layout.studentName.color,
  );

  drawCenteredLines(
    data.courseName,
    layout.courseName.top,
    layout.courseName.fontSize,
    layout.courseName.bold,
    layout.courseName.maxWidth,
    layout.courseName.color,
  );

  drawAt(
    String(data.academicHours),
    layout.hours.left,
    layout.hours.top,
    layout.hours.fontSize,
    layout.hours.bold,
    layout.hours.color,
    layout.hours.align,
  );
  drawAt(
    formatGrade(data.grade),
    layout.grade.left,
    layout.grade.top,
    layout.grade.fontSize,
    layout.grade.bold,
    layout.grade.color,
    layout.grade.align,
  );
  drawAt(
    day,
    layout.dateDay.left,
    layout.dateDay.top,
    layout.dateDay.fontSize,
    layout.dateDay.bold,
    layout.dateDay.color,
    layout.dateDay.align,
  );
  drawAt(
    month,
    layout.dateMonth.left,
    layout.dateMonth.top,
    layout.dateMonth.fontSize,
    layout.dateMonth.bold,
    layout.dateMonth.color,
    layout.dateMonth.align,
  );
  drawAt(
    yearSuffix,
    layout.dateYearSuffix.left,
    layout.dateYearSuffix.top,
    layout.dateYearSuffix.fontSize,
    layout.dateYearSuffix.bold,
    layout.dateYearSuffix.color,
    layout.dateYearSuffix.align,
  );

  if (data.certificateNumber) {
    drawAt(
      data.certificateNumber,
      layout.certificateNumber.left,
      layout.certificateNumber.top,
      layout.certificateNumber.fontSize,
      layout.certificateNumber.bold,
      layout.certificateNumber.color,
      layout.certificateNumber.align,
    );
  }

  return pdfDoc.save();
}

export async function generateCertificatePngFromCanvas(
  templateUrl: string,
  data: CertificateData,
): Promise<Blob> {
  const img = await loadImage(templateUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');

  ctx.drawImage(img, 0, 0);
  const { day, month, yearSuffix } = parseCertificateDate(data.issuedAt);
  const w = canvas.width;
  const h = canvas.height;
  const layout = CERTIFICATE_FIELD_LAYOUT;

  const drawCenteredLines = (
    text: string,
    top: number,
    fontSize: number,
    bold: boolean,
    color: 'maroon' | 'black',
  ) => {
    const size = scaleFontSize(fontSize, h);
    const lineHeight = size * 1.35;
    ctx.fillStyle = pickHex(color);
    ctx.font = `${bold ? 'bold' : 'normal'} ${size}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxChars = Math.floor((w * 0.75) / (size * 0.48));
    const lines = wrapText(text, maxChars);
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, h * top + i * lineHeight);
    });
  };

  const drawAt = (
    text: string,
    left: number,
    top: number,
    fontSize: number,
    bold: boolean,
    color: 'maroon' | 'black',
    align: FieldAlign = 'left',
  ) => {
    const size = scaleFontSize(fontSize, h);
    ctx.fillStyle = pickHex(color);
    ctx.font = `${bold ? 'bold' : 'normal'} ${size}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w * left, h * top);
  };

  drawCenteredLines(
    data.studentName.toUpperCase(),
    layout.studentName.top,
    layout.studentName.fontSize,
    layout.studentName.bold,
    layout.studentName.color,
  );
  drawCenteredLines(
    data.courseName,
    layout.courseName.top,
    layout.courseName.fontSize,
    layout.courseName.bold,
    layout.courseName.color,
  );
  drawAt(
    String(data.academicHours),
    layout.hours.left,
    layout.hours.top,
    layout.hours.fontSize,
    layout.hours.bold,
    layout.hours.color,
    layout.hours.align,
  );
  drawAt(
    formatGrade(data.grade),
    layout.grade.left,
    layout.grade.top,
    layout.grade.fontSize,
    layout.grade.bold,
    layout.grade.color,
    layout.grade.align,
  );
  drawAt(
    day,
    layout.dateDay.left,
    layout.dateDay.top,
    layout.dateDay.fontSize,
    layout.dateDay.bold,
    layout.dateDay.color,
    layout.dateDay.align,
  );
  drawAt(
    month,
    layout.dateMonth.left,
    layout.dateMonth.top,
    layout.dateMonth.fontSize,
    layout.dateMonth.bold,
    layout.dateMonth.color,
    layout.dateMonth.align,
  );
  drawAt(
    yearSuffix,
    layout.dateYearSuffix.left,
    layout.dateYearSuffix.top,
    layout.dateYearSuffix.fontSize,
    layout.dateYearSuffix.bold,
    layout.dateYearSuffix.color,
    layout.dateYearSuffix.align,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar PNG'))), 'image/png');
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export type { CertificateData };
