import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { BenefitCategory } from '@cee/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BENEFIT_CATEGORY_OPTIONS } from '@/constants/benefitCategory';
import { useToast } from '@/hooks/useToast';
import { benefitsService, type BenefitFormInput } from '@/services/benefitsService';

interface FormValues {
  title: string;
  description: string;
  discountLabel: string;
  category: BenefitCategory;
  code: string;
  validUntil: string;
  isActive: boolean;
}

const INITIAL_VALUES: FormValues = {
  title: '',
  description: '',
  discountLabel: '',
  category: 'descuento',
  code: '',
  validUntil: '',
  isActive: true,
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.title.trim().length < 3) {
    errors.title = 'El título debe tener al menos 3 caracteres.';
  }
  if (values.description.trim().length < 10) {
    errors.description = 'La descripción debe tener al menos 10 caracteres.';
  }
  if (!values.discountLabel.trim()) {
    errors.discountLabel = 'Ingresa el valor del beneficio (ej. "15% OFF").';
  }

  return errors;
}

export default function BenefitFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingBenefit, setIsLoadingBenefit] = useState(isEditMode);
  const [loadError, setLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode || !id) return;

    let isMounted = true;
    benefitsService
      .getBenefitById(id)
      .then((response) => {
        if (!isMounted) return;
        const benefit = response.data;
        setValues({
          title: benefit.title,
          description: benefit.description,
          discountLabel: benefit.discountLabel,
          category: benefit.category,
          code: benefit.code ?? '',
          validUntil: benefit.validUntil ?? '',
          isActive: benefit.isActive,
        });
      })
      .catch(() => {
        if (isMounted) setLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoadingBenefit(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  const handleChange = (field: keyof FormValues) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const input: BenefitFormInput = {
        title: values.title.trim(),
        description: values.description.trim(),
        discountLabel: values.discountLabel.trim(),
        category: values.category,
        code: values.code.trim() || null,
        validUntil: values.validUntil || null,
        isActive: values.isActive,
      };

      if (isEditMode && id) {
        await benefitsService.updateBenefit(id, input);
      } else {
        await benefitsService.createBenefit(input);
      }

      success('Beneficio guardado', 'El beneficio se guardó correctamente.');
      navigate('/beneficios');
    } catch (err) {
      error('No se pudo guardar el beneficio', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingBenefit) {
    return <p className="text-muted-foreground">Cargando beneficio...</p>;
  }

  if (loadError) {
    return <p className="text-destructive">No se pudo cargar el beneficio.</p>;
  }

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">{isEditMode ? 'Editar beneficio' : 'Nuevo beneficio'}</h1>

      <form className="grid max-w-2xl gap-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={values.title}
            onChange={handleChange('title')}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={values.description}
            onChange={handleChange('description')}
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="discountLabel">Valor mostrado (ej. "15% OFF")</Label>
            <Input
              id="discountLabel"
              value={values.discountLabel}
              onChange={handleChange('discountLabel')}
              aria-invalid={Boolean(errors.discountLabel)}
            />
            {errors.discountLabel && <p className="text-sm text-destructive">{errors.discountLabel}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={values.category}
              onChange={handleChange('category')}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {BENEFIT_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="code">Código promocional (opcional)</Label>
            <Input id="code" value={values.code} onChange={handleChange('code')} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="validUntil">Vigente hasta (opcional)</Label>
            <Input id="validUntil" type="date" value={values.validUntil} onChange={handleChange('validUntil')} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setValues((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="isActive">Visible para los estudiantes (activo)</Label>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar beneficio'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/beneficios">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
