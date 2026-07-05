import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { mediaService, type VideoFormInput } from '@/services/mediaService';
import { storageService } from '@/services/storageService';

const INITIAL_VALUES: VideoFormInput = {
  title: '',
  description: '',
  thumbnailUrl: '',
  videoUrl: '',
  duration: 0,
  category: '',
};

type FormErrors = Partial<Record<keyof VideoFormInput, string>>;

function validate(values: VideoFormInput, hasFile: boolean): FormErrors {
  const errors: FormErrors = {};
  if (values.title.trim().length < 3) errors.title = 'El título debe tener al menos 3 caracteres.';
  if (!values.videoUrl.trim()) errors.videoUrl = 'La URL del video es obligatoria.';
  if (!values.thumbnailUrl && !hasFile) errors.thumbnailUrl = 'La miniatura es obligatoria.';
  return errors;
}

export default function MultimediaFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [values, setValues] = useState<VideoFormInput>(INITIAL_VALUES);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) return;
    let isMounted = true;
    mediaService.getVideoById(id)
      .then((res) => {
        if (!isMounted) return;
        setValues({
          title: res.data.title,
          description: res.data.description,
          thumbnailUrl: res.data.thumbnailUrl,
          videoUrl: res.data.videoUrl,
          duration: res.data.duration,
          category: res.data.category || '',
        });
      })
      .catch(() => {
        if (isMounted) error('Error', 'No se pudo cargar el video.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [id, isEditMode]);

  const handleChange = (field: keyof VideoFormInput) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'duration' ? Number(e.target.value) : e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(values, imageFile !== null);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      let finalThumbnailUrl = values.thumbnailUrl;
      if (imageFile) {
        finalThumbnailUrl = await storageService.uploadPublicFile(imageFile, 'thumbnails');
      }
      
      const submitValues = { ...values, thumbnailUrl: finalThumbnailUrl };

      if (isEditMode && id) {
        await mediaService.updateVideo(id, submitValues);
      } else {
        await mediaService.createVideo(submitValues);
      }
      success('Video guardado', 'Los datos se guardaron correctamente.');
      navigate('/multimedia');
    } catch (err) {
      error('Error', err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <section className="mx-auto max-w-3xl grid gap-6">
      <h1 className="text-2xl font-bold text-center">
        {isEditMode ? 'Editar Video' : 'Nuevo Video'}
      </h1>

      <form className="grid gap-5 w-full bg-white p-6 md:p-8 rounded-xl shadow-sm border" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={values.title} onChange={handleChange('title')} />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" value={values.description} onChange={handleChange('description')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="videoUrl">URL del Video (Youtube/Vimeo)</Label>
            <Input id="videoUrl" value={values.videoUrl} onChange={handleChange('videoUrl')} />
            {errors.videoUrl && <p className="text-sm text-destructive">{errors.videoUrl}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="imageFile">Miniatura (Subir imagen)</Label>
            {isEditMode && values.thumbnailUrl && (
              <p className="text-xs text-muted-foreground mb-1">
                Ya hay una miniatura guardada. Selecciona otra solo si deseas cambiarla.
              </p>
            )}
            <Input 
              id="imageFile" 
              type="file" 
              accept="image/*"
              onChange={handleFileChange} 
            />
            {errors.thumbnailUrl && <p className="text-sm text-destructive">{errors.thumbnailUrl}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="duration">Duración (segundos)</Label>
            <Input id="duration" type="number" value={values.duration} onChange={handleChange('duration')} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="category">Categoría</Label>
            <Input id="category" value={values.category} onChange={handleChange('category')} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar video'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/multimedia">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
