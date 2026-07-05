import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Copy, Download, ExternalLink, Linkedin } from 'lucide-react';
import type { Certificate } from '@cee/types';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { formatDateLong } from '@/lib/utils';
import {
  buildLinkedInShareText,
  copyToClipboard,
  getCertificateVerifyUrl,
  getLinkedInShareUrl,
} from '@/lib/linkedin-share';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const [copied, setCopied] = useState(false);
  const verifyUrl = certificate.verificationCode
    ? getCertificateVerifyUrl(certificate.verificationCode)
    : null;

  const handleCopy = async () => {
    if (!verifyUrl) return;
    await copyToClipboard(buildLinkedInShareText(certificate.courseName, verifyUrl));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cee-red/10 text-cee-red">
          <Award className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-cee-red">Certificado digital</p>
          <h3 className="mt-1 font-semibold leading-snug">{certificate.courseName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Emitido el {formatDateLong(certificate.issuedAt)}
            {certificate.grade != null && ` · Nota ${certificate.grade}/20`}
          </p>
          {certificate.certificateNumber && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">{certificate.certificateNumber}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {verifyUrl && (
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.CERTIFICATE_VERIFY.replace(':code', certificate.verificationCode!)}>
              <ExternalLink className="mr-1 h-4 w-4" />
              Ver certificado
            </Link>
          </Button>
        )}
        {certificate.pdfUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={certificate.pdfUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-1 h-4 w-4" />
              Descargar PDF
            </a>
          </Button>
        )}
        {verifyUrl && (
          <>
            <Button asChild variant="outline" size="sm">
              <a href={getLinkedInShareUrl(verifyUrl)} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-1 h-4 w-4" />
                Compartir en LinkedIn
              </a>
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => void handleCopy()}>
              <Copy className="mr-1 h-4 w-4" />
              {copied ? 'Copiado' : 'Copiar texto'}
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
