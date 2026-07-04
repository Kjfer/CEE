import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { instructorsService, type InstructorFormInput } from '@/services/instructorsService';
import { supabase } from '@/lib/supabase';

const INITIAL_VALUES: InstructorFormInput = {
  name: '',
  title: '',
  bio: '',
  photoUrl: '',
};

type FormErrors = Partial<Record<keyof InstructorFormInput, string>>;

function validate(values: InstructorFormInput): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres.';
  }
  if (values.title.trim().length < 3) {
    errors.title = 'El título/profesión debe tener al menos 3 caracteres.';
  }
  if (values.bio.trim().length < 10) {
    errors.bio = 'La biografía debe tener al menos 10 caracteres.';
  }
  return errors;
}

export default function InstructorFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [values, setValues] = useState<InstructorFormInput>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditMode || !id) return;

    let isMounted = true;
    instructorsService
      .getInstructorById(id)
      .then((res) => {
        if (!isMounted) return;
        setValues({
          name: res.data.name,
          title: res.data.title,
          bio: res.data.bio,
          photoUrl: res.data.photoUrl,
        });
        if (res.data.photoUrl) setPhotoPreview(res.data.photoUrl);
      })
      .catch((err) => {
        if (isMounted) error('Error', err instanceof Error ? err.message : 'No se pudo cargar el profesor');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode, error]);

  const handleChange = (field: keyof InstructorFormInput) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        error('Error', 'La imagen no debe pesar más de 2MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setValues(prev => ({ ...prev, photoUrl: '' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      let finalPhotoUrl = values.photoUrl;
      
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(`instructors/${fileName}`, photoFile);
          
        if (uploadError) {
          throw new Error('No se pudo subir la imagen del profesor');
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('site-images')
          .getPublicUrl(`instructors/${fileName}`);
          
        finalPhotoUrl = publicUrlData.publicUrl;
      } else if (!finalPhotoUrl && !photoPreview) {
         finalPhotoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name)}&background=random&size=256`;
      }

      const payload = { ...values, photoUrl: finalPhotoUrl };

      if (isEditMode && id) {
        await instructorsService.updateInstructor(id, payload);
        success('Profesor actualizado', 'Los datos del profesor se guardaron correctamente.');
      } else {
        await instructorsService.createInstructor(payload);
        success('Profesor registrado', 'El profesor se registró correctamente.');
      }
      navigate('/profesores');
    } catch (err) {
      error('Error al guardar', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando datos del profesor...</p>;
  }

  return (
    <section className="mx-auto max-w-2xl grid gap-6">
      <h1 className="text-2xl font-bold text-center">
        {isEditMode ? 'Editar profesor' : 'Registrar profesor'}
      </h1>

      <form className="grid gap-5 w-full bg-white p-6 md:p-8 rounded-xl shadow-sm border" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            value={values.name}
            onChange={handleChange('name')}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="title">Título o Profesión</Label>
          <Input
            id="title"
            value={values.title}
            onChange={handleChange('title')}
            placeholder="Ej. Ingeniero de Software, Consultor..."
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            value={values.bio}
            onChange={handleChange('bio')}
            rows={4}
            aria-invalid={Boolean(errors.bio)}
          />
          {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label>Foto del profesor</Label>
          {!photoPreview ? (
            <div className="relative group cursor-pointer w-32 h-32">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Seleccionar foto"
              />
              <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-full bg-muted/20 border-muted-foreground/25 group-hover:bg-muted/50 group-hover:border-primary/50 transition-all duration-200 overflow-hidden">
                <ImageIcon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary">Subir foto</span>
              </div>
            </div>
          ) : (
            <div className="relative w-32 h-32 border rounded-full overflow-hidden bg-muted/10 group">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Recomendado: 256x256px (máx 2MB). Si no subes una, se generará un avatar con sus iniciales.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar profesor'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/profesores">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
