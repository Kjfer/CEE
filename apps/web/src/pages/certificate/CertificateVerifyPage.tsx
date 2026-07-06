import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, Download, Linkedin } from 'lucide-react';
import type { PublicCertificate } from '@cee/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { buildCertificateFiles } from '@/lib/certificate-builder';
import { CERTIFICATE_LAYOUT_VERSION } from '@cee/certificate-generator';
import {
  buildLinkedInShareText,
  copyToClipboard,
  getCertificateVerifyUrl,
  getLinkedInShareUrl,
} from '@/lib/linkedin-share';
import { formatDateLong } from '@/lib/utils';
import { certificatesService } from '@/services/certificates.service';

export default function CertificateVerifyPage() {
  const { code } = useParams<{ code: string }>();
  const [cert, setCert] = useState<PublicCertificate | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fromStorage, setFromStorage] = useState(false);

  useEffect(() => {
    if (!code) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    certificatesService
      .getPublicByCode(code)
      .then(async ({ data }) => {
        if (!mounted) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setCert(data);

        // Preferir archivos de Storage (URL estable y compartible).
        if (data.previewImageUrl) {
          setPreviewUrl(data.previewImageUrl);
          setPdfUrl(data.pdfUrl ?? null);
          setFromStorage(true);
          return;
        }

        // Fallback: regenerar en el navegador si aún no hay archivos en Storage.
        if (data.grade != null && data.academicHours != null) {
          try {
            const { previewBlob, pdfBytes } = await buildCertificateFiles({
              studentName: data.studentName,
              courseName: data.courseName,
              academicHours: data.academicHours,
              grade: data.grade,
              issuedAt: data.issuedAt,
              certificateNumber: data.certificateNumber,
            });
            if (!mounted) return;
            setPreviewUrl(URL.createObjectURL(previewBlob));
            setPdfUrl(
              data.pdfUrl ??
                URL.createObjectURL(new Blob([Uint8Array.from(pdfBytes)], { type: 'application/pdf' })),
            );
            setFromStorage(false);
          } catch {
            setPreviewUrl(data.previewImageUrl ?? null);
            setPdfUrl(data.pdfUrl ?? null);
          }
        } else {
          setPreviewUrl(data.previewImageUrl ?? null);
          setPdfUrl(data.pdfUrl ?? null);
        }
      })
      .catch(() => {
        if (mounted) setNotFound(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [code]);

  const publicUrl = code ? getCertificateVerifyUrl(code) : '';

  const handleCopy = async () => {
    if (!cert) return;
    await copyToClipboard(buildLinkedInShareText(cert.courseName, publicUrl));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Verificando certificado...</p>
      </section>
    );
  }

  if (notFound || !cert) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Certificado no encontrado</h1>
        <p className="mt-3 text-muted-foreground">El código de verificación no es válido o fue anulado.</p>
        <Button asChild className="mt-6">
          <Link to={ROUTES.HOME}>Volver al inicio</Link>
        </Button>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="CEE-FIIS"
        title="Certificado verificable"
        description={`Credencial digital de ${cert.studentName}`}
        breadcrumb={[{ label: 'Inicio', path: ROUTES.HOME }, { label: 'Verificación' }]}
        size="md"
      />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Certificado válido · {cert.certificateNumber}
        </div>

        {previewUrl && (
          <div className="mb-8 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <img src={previewUrl} alt={`Certificado de ${cert.studentName}`} className="w-full" />
            <p className="border-t border-border px-3 py-2 text-center text-xs text-muted-foreground">
              {fromStorage
                ? 'Certificado digital'
                : `Vista previa generada · Generador v${CERTIFICATE_LAYOUT_VERSION}`}
            </p>
          </div>
        )}

        <dl className="mb-8 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Estudiante</dt>
            <dd className="font-medium">{cert.studentName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Curso</dt>
            <dd className="font-medium">{cert.courseName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fecha de emisión</dt>
            <dd className="font-medium">{formatDateLong(cert.issuedAt)}</dd>
          </div>
          {cert.grade != null && (
            <div>
              <dt className="text-muted-foreground">Nota</dt>
              <dd className="font-medium">{cert.grade}/20</dd>
            </div>
          )}
          {cert.academicHours != null && (
            <div>
              <dt className="text-muted-foreground">Horas académicas</dt>
              <dd className="font-medium">{cert.academicHours}</dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-3">
          {pdfUrl && (
            <Button asChild>
              <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </a>
            </Button>
          )}
          <Button asChild variant="outline">
            <a href={getLinkedInShareUrl(publicUrl)} target="_blank" rel="noopener noreferrer">
              <Linkedin className="mr-2 h-4 w-4" />
              Compartir en LinkedIn
            </a>
          </Button>
          <Button type="button" variant="ghost" onClick={() => void handleCopy()}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? 'Texto copiado' : 'Copiar texto para LinkedIn'}
          </Button>
        </div>
      </section>
    </>
  );
}
