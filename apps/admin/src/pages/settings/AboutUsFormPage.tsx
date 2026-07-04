import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { settingsService } from '@/services/settingsService';

interface FormValues {
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription: string;
  mission: string;
  vision: string;
  history: string;
}

export default function AboutUsFormPage() {
  const { success, error } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>({
    aboutTitle: '',
    aboutSubtitle: '',
    aboutDescription: '',
    mission: '',
    vision: '',
    history: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  useEffect(() => {
    let isMounted = true;
    settingsService
      .getSiteSettings()
      .then((res) => {
        if (!isMounted) return;
        const data = res.data;
        setValues({
          aboutTitle: data.aboutTitle,
          aboutSubtitle: data.aboutSubtitle,
          aboutDescription: data.aboutDescription,
          mission: data.mission,
          vision: data.vision,
          history: data.history,
        });
        setExistingImageUrl(data.aboutImageUrl);
        setHeroImages(data.heroImages || []);
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

  const handleChange = (field: keyof FormValues) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Archivo inválido', 'Solo se permiten imágenes (JPG, PNG, WEBP).');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      error('Archivo muy grande', `La imagen no debe superar los 2MB.`);
      e.target.value = '';
      return;
    }

    setImageFileName(file.name);
    setImageFile(file);
    setExistingImageUrl(null);
  };

  const handleRemoveImage = () => {
    setImageFileName(null);
    setImageFile(null);
    setExistingImageUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleAddHeroImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Archivo inválido', 'Solo se permiten imágenes.');
      if (heroImageInputRef.current) heroImageInputRef.current.value = '';
      return;
    }
    
    setIsUploadingHero(true);
    try {
      const url = await settingsService.uploadSiteImage(file);
      setHeroImages(prev => [...prev, url]);
      success('Imagen subida', 'Guarda la configuración para aplicar.');
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setIsUploadingHero(false);
      if (heroImageInputRef.current) heroImageInputRef.current.value = '';
    }
  };

  const handleRemoveHeroImage = (index: number) => {
    setHeroImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = existingImageUrl;
      if (imageFile) {
        finalImageUrl = await settingsService.uploadSiteImage(imageFile);
      }

      await settingsService.updateSiteSettings({
        ...values,
        aboutImageUrl: finalImageUrl ?? undefined,
        heroImages: heroImages,
      });

      success('Configuración guardada', 'La página de Nosotros se actualizó correctamente.');
    } catch (err) {
      error('Error al guardar', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Cargando configuración...</p>;
  if (loadError) return <p className="text-destructive">No se pudo cargar la configuración.</p>;

  return (
    <section className="mx-auto max-w-5xl grid gap-6">
      <h1 className="text-2xl font-bold text-center">Configuración: Nosotros</h1>

      <form className="w-full bg-white p-6 md:p-8 rounded-xl shadow-sm border" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-[1fr_350px] gap-8">
          
          <div className="grid gap-5 content-start">
            <h2 className="text-lg font-semibold border-b pb-2">Sección de Inicio / Principal</h2>
            
            <div className="grid gap-1.5">
              <Label htmlFor="aboutTitle">Título</Label>
              <Input
                id="aboutTitle"
                value={values.aboutTitle}
                onChange={handleChange('aboutTitle')}
              />
            </div>
            
            <div className="grid gap-1.5">
              <Label htmlFor="aboutSubtitle">Subtítulo (Eyebrow / Italic)</Label>
              <Input
                id="aboutSubtitle"
                value={values.aboutSubtitle}
                onChange={handleChange('aboutSubtitle')}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="aboutDescription">Descripción Principal</Label>
              <Textarea
                id="aboutDescription"
                rows={4}
                value={values.aboutDescription}
                onChange={handleChange('aboutDescription')}
              />
            </div>

            <h2 className="text-lg font-semibold border-b pb-2 mt-4">Carrusel de Inicio</h2>
            
            <div className="grid gap-3">
              <Label>Imágenes del Carrusel</Label>
              <div className="grid grid-cols-2 gap-4">
                {heroImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-[21/9] rounded-lg overflow-hidden group border bg-muted/10">
                    <img src={url} alt={`Hero ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveHeroImage(idx)}
                        className="bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="relative aspect-[21/9] rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 hover:bg-muted/50 transition-colors">
                  <input
                    ref={heroImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAddHeroImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploadingHero}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    {isUploadingHero ? (
                       <span className="text-sm font-medium text-muted-foreground">Subiendo...</span>
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm font-medium text-primary">Añadir foto</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold border-b pb-2 mt-4">Contenido de "Nosotros"</h2>

            <div className="grid gap-1.5">
              <Label htmlFor="mission">Misión</Label>
              <Textarea
                id="mission"
                rows={3}
                value={values.mission}
                onChange={handleChange('mission')}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="vision">Visión</Label>
              <Textarea
                id="vision"
                rows={3}
                value={values.vision}
                onChange={handleChange('vision')}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="history">Historia del CEE</Label>
              <Textarea
                id="history"
                rows={5}
                value={values.history}
                onChange={handleChange('history')}
              />
            </div>
          </div>

          <div className="grid gap-6 content-start">
            <div className="grid gap-1.5">
              <Label htmlFor="image">Imagen Principal (Inicio y Nosotros)</Label>
              
              {!imageFileName && !existingImageUrl ? (
                <div className="relative group cursor-pointer">
                  <input
                    ref={imageInputRef}
                    id="image"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg bg-muted/20 border-muted-foreground/25 group-hover:bg-muted/50 transition-all duration-200">
                    <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-primary hover:underline">Subir imagen</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden bg-muted/10 group">
                  <img 
                    src={imageFileName ? URL.createObjectURL(imageFile!) : existingImageUrl!} 
                    alt="Preview" 
                    className="w-full h-auto aspect-video object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-destructive text-destructive-foreground p-2 rounded-full shadow-sm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {imageFileName && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1.5 truncate">
                      {imageFileName}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t pt-6 mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        </div>
      </form>
    </section>
  );
}
