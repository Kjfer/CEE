import {
  generateCertificatePdf,
  generateCertificatePngFromCanvas,
  type CertificateData,
} from '@cee/certificate-generator';
import templateUrl from '@cee/certificate-generator/assets/template.png?url';

export async function loadCertificateTemplate(): Promise<Uint8Array> {
  const res = await fetch(templateUrl);
  if (!res.ok) throw new Error('No se pudo cargar la plantilla del certificado.');
  return new Uint8Array(await res.arrayBuffer());
}

export async function buildCertificateFiles(data: CertificateData): Promise<{
  pdfBytes: Uint8Array;
  previewBlob: Blob;
}> {
  const template = await loadCertificateTemplate();
  const pdfBytes = await generateCertificatePdf(template, data);
  const previewBlob = await generateCertificatePngFromCanvas(templateUrl, data);
  return { pdfBytes, previewBlob };
}

export { templateUrl };
export type { CertificateData };
