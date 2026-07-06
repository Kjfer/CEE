import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { settingsService } from '@/services/settingsService';

export default function TermsConditionsPage() {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [termsPdfUrl, setTermsPdfUrl] = useState<string | null>(null);
  const [termsPdfName, setTermsPdfName] = useState<string | null>(null);
  const [termsPdfUpdatedAt, setTermsPdfUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    settingsService
      .getSiteSettings()
      .then((res) => {
        if (!isMounted) return;
        setTermsPdfUrl(res.data.termsPdfUrl);
        setTermsPdfName(res.data.termsPdfName);
        setTermsPdfUpdatedAt(res.data.termsPdfUpdatedAt);
      })
      .catch(() => {
        if (isMounted) setLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      error('Archivo inválido', 'Solo se permiten archivos PDF.');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      error('Archivo muy grande', 'El PDF no debe superar los 10MB.');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const updated = await settingsService.uploadTermsPdf(file);
      setTermsPdfUrl(updated.termsPdfUrl);
      setTermsPdfName(updated.termsPdfName);
      setTermsPdfUpdatedAt(updated.termsPdfUpdatedAt);
      success('PDF actualizado', 'Se reemplazó el archivo de Términos y Condiciones.');
    } catch (err) {
      error('Error al subir', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Cargando configuración...</p>;
  if (loadError) return <p className="text-destructive">No se pudo cargar la configuración.</p>;

  return (
    <section className="mx-auto max-w-3xl grid gap-6">
      <h1 className="text-2xl font-bold text-center">Términos y Condiciones</h1>

      <div className="w-full bg-white p-6 md:p-8 rounded-xl shadow-sm border grid gap-6">
        <p className="text-sm text-muted-foreground">
          Solo puede existir un archivo a la vez. Al subir un PDF nuevo, se reemplaza y elimina el
          anterior automáticamente. Este documento es el que se muestra en la página pública de
          Privacidad (/privacidad).
        </p>

        {termsPdfUrl ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-8 w-8 shrink-0 text-cee-red" />
              <div className="min-w-0">
                <p className="font-medium truncate">{termsPdfName ?? 'terminos-y-condiciones.pdf'}</p>
                {termsPdfUpdatedAt && (
                  <p className="text-xs text-muted-foreground">
                    Actualizado el {new Date(termsPdfUpdatedAt).toLocaleString('es-PE')}
                  </p>
                )}
              </div>
            </div>
            <a
              href={termsPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-sm font-medium text-cee-red hover:underline"
            >
              Ver PDF actual
            </a>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Todavía no se subió ningún archivo de Términos y Condiciones.
          </p>
        )}

        <div className="grid gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="terms-pdf-input"
            disabled={isUploading}
          />
          <Button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-fit"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Subiendo...' : termsPdfUrl ? 'Reemplazar PDF' : 'Subir PDF'}
          </Button>
        </div>
      </div>
    </section>
  );
}
