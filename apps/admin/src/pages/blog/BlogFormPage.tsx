import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { blogService, type BlogPostFormInput } from '@/services/blogService';
import { storageService } from '@/services/storageService';

const INITIAL_VALUES: BlogPostFormInput = {
  title: '',
  summary: '',
  content: '',
  imageUrl: '',
  slug: '',
  date: '',
};

type FormErrors = Partial<Record<keyof BlogPostFormInput, string>>;

function validate(values: BlogPostFormInput, hasFile: boolean): FormErrors {
  const errors: FormErrors = {};
  if (values.title.trim().length < 5) errors.title = 'El título debe tener al menos 5 caracteres.';
  if (values.summary.trim().length < 10) errors.summary = 'El resumen debe ser descriptivo.';
  if (!values.slug.trim()) errors.slug = 'El slug es obligatorio.';
  if (!values.imageUrl && !hasFile) errors.imageUrl = 'La imagen de portada es obligatoria.';
  return errors;
}

export default function BlogFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [values, setValues] = useState<BlogPostFormInput>(INITIAL_VALUES);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) return;
    let isMounted = true;
    blogService.getPostById(id)
      .then((res) => {
        if (!isMounted) return;
        setValues({
          title: res.data.title,
          summary: res.data.summary,
          content: res.data.content,
          imageUrl: res.data.imageUrl,
          slug: res.data.slug,
          date: res.data.date ? new Date(res.data.date).toISOString().split('T')[0] : '',
        });
      })
      .catch(() => {
        if (isMounted) error('Error', 'No se pudo cargar el artículo.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [id, isEditMode]);

  const handleChange = (field: keyof BlogPostFormInput) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValues((prev) => ({
      ...prev,
      title: newTitle,
      slug: !isEditMode ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
    }));
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
      let finalImageUrl = values.imageUrl;
      if (imageFile) {
        finalImageUrl = await storageService.uploadPublicFile(imageFile, 'blog');
      }

      const submitValues = { 
        ...values, 
        imageUrl: finalImageUrl,
        date: values.date ? new Date(values.date).toISOString() : undefined 
      };
      
      if (isEditMode && id) {
        await blogService.updatePost(id, submitValues);
      } else {
        await blogService.createPost(submitValues);
      }
      success('Post guardado', 'El artículo se guardó correctamente.');
      navigate('/blog');
    } catch (err) {
      error('Error', err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <section className="mx-auto max-w-4xl grid gap-6">
      <h1 className="text-2xl font-bold text-center">
        {isEditMode ? 'Editar Artículo' : 'Nuevo Artículo'}
      </h1>

      <form className="grid gap-5 w-full bg-white p-6 md:p-8 rounded-xl shadow-sm border" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={values.title} onChange={handleTitleChange} />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" value={values.slug} onChange={handleChange('slug')} />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="summary">Resumen (Intro)</Label>
          <Textarea id="summary" value={values.summary} onChange={handleChange('summary')} rows={3} />
          {errors.summary && <p className="text-sm text-destructive">{errors.summary}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="imageFile">Imagen de Portada (Subir archivo)</Label>
            {isEditMode && values.imageUrl && (
              <p className="text-xs text-muted-foreground mb-1">
                Ya hay una imagen guardada. Selecciona otra solo si deseas cambiarla.
              </p>
            )}
            <Input 
              id="imageFile" 
              type="file" 
              accept="image/*"
              onChange={handleFileChange} 
            />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="date">Fecha de publicación (opcional)</Label>
            <Input id="date" type="date" value={values.date} onChange={handleChange('date')} />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="content">Contenido Completo (HTML/Texto)</Label>
          <Textarea id="content" value={values.content} onChange={handleChange('content')} rows={10} />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar post'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/blog">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
