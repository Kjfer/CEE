import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { instructorsService, type InstructorFormInput } from '@/services/instructorsService';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await instructorsService.updateInstructor(id, values);
        success('Profesor actualizado', 'Los datos del profesor se guardaron correctamente.');
      } else {
        await instructorsService.createInstructor(values);
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
    <section className="grid gap-6 max-w-2xl">
      <h1 className="text-2xl font-bold">
        {isEditMode ? 'Editar profesor' : 'Registrar profesor'}
      </h1>

      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
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
          <Label htmlFor="photoUrl">URL de la foto</Label>
          <Input
            id="photoUrl"
            type="url"
            value={values.photoUrl}
            onChange={handleChange('photoUrl')}
            placeholder="https://..."
          />
          <p className="text-xs text-muted-foreground">
            Ingresa la URL pública de la foto del docente. Opcionalmente podrías añadir una carga de imágenes aquí en el futuro.
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
