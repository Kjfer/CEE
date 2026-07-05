/** URL pública de verificación y helpers para LinkedIn. */

export function getCertificateVerifyUrl(verificationCode: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/certificados/verificar/${encodeURIComponent(verificationCode)}`;
}

export function getLinkedInShareUrl(publicUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
}

export function buildLinkedInShareText(courseName: string, publicUrl: string): string {
  return `He completado satisfactoriamente "${courseName}" en el Centro de Especialización Ejecutiva CEE-FIIS. Certificado verificable: ${publicUrl}`;
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}
