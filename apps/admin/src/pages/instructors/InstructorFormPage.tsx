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
  linkedinUrl: '',
  specialties: [],
  experience: [],
  education: [],
  rating: 0,
  testimonials: [],
  publications: [],
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
          linkedinUrl: res.data.linkedinUrl || '',
          specialties: res.data.specialties || [],
          experience: res.data.experience || [],
          education: res.data.education || [],
          rating: res.data.rating || 0,
          testimonials: res.data.testimonials || [],
          publications: res.data.publications || [],
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

  const addArrayItem = <K extends 'experience' | 'education' | 'testimonials' | 'publications'>(
    field: K,
    newItem: any
  ) => {
    setValues((prev) => ({ ...prev, [field]: [...prev[field], newItem] }));
  };

  const updateArrayItem = <K extends 'experience' | 'education' | 'testimonials' | 'publications'>(
    field: K,
    index: number,
    prop: string,
    val: string
  ) => {
    const newArr = [...values[field]] as any[];
    newArr[index] = { ...newArr[index], [prop]: val };
    setValues({ ...values, [field]: newArr });
  };

  const removeArrayItem = <K extends 'experience' | 'education' | 'testimonials' | 'publications'>(
    field: K,
    index: number
  ) => {
    const newArr = [...values[field]];
    newArr.splice(index, 1);
    setValues({ ...values, [field]: newArr });
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
          <Label htmlFor="linkedinUrl">Perfil de LinkedIn (Opcional)</Label>
          <Input
            id="linkedinUrl"
            type="url"
            value={values.linkedinUrl}
            onChange={handleChange('linkedinUrl')}
            placeholder="https://linkedin.com/in/usuario"
            aria-invalid={Boolean(errors.linkedinUrl)}
          />
          {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="specialties">Especialidades (Tags)</Label>
          <p className="text-xs text-muted-foreground mb-1">Escribe una especialidad y presiona Enter para agregarla.</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {values.specialties.map((spec, index) => (
              <span key={index} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs font-medium">
                {spec}
                <button
                  type="button"
                  onClick={() => {
                    const newSpecs = [...values.specialties];
                    newSpecs.splice(index, 1);
                    setValues({ ...values, specialties: newSpecs });
                  }}
                  className="hover:text-destructive focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            id="specialties"
            placeholder="Ej. Finanzas, Liderazgo..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const input = e.currentTarget;
                const value = input.value.replace(/,/g, '').trim();
                if (value && !values.specialties.includes(value)) {
                  setValues({ ...values, specialties: [...values.specialties, value] });
                  input.value = '';
                }
              }
            }}
            onBlur={(e) => {
              const input = e.currentTarget;
              const value = input.value.replace(/,/g, '').trim();
              if (value && !values.specialties.includes(value)) {
                setValues({ ...values, specialties: [...values.specialties, value] });
                input.value = '';
              }
            }}
          />
        </div>

        <div className="grid gap-1.5 border-t pt-4">
          <Label className="text-lg">Experiencia Laboral (Timeline)</Label>
          {values.experience.map((exp, idx) => (
            <div key={exp.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-muted/20 p-3 rounded-lg border">
              <Input className="sm:col-span-4" placeholder="Cargo" value={exp.role} onChange={(e) => updateArrayItem('experience', idx, 'role', e.target.value)} />
              <Input className="sm:col-span-4" placeholder="Empresa" value={exp.company} onChange={(e) => updateArrayItem('experience', idx, 'company', e.target.value)} />
              <Input className="sm:col-span-1" placeholder="Inicio" value={exp.startYear} onChange={(e) => updateArrayItem('experience', idx, 'startYear', e.target.value)} />
              <Input className="sm:col-span-1" placeholder="Fin" value={exp.endYear} onChange={(e) => updateArrayItem('experience', idx, 'endYear', e.target.value)} />
              <Button type="button" variant="ghost" size="icon" className="sm:col-span-2 text-destructive" onClick={() => removeArrayItem('experience', idx)}>
                <X className="h-4 w-4" /> Eliminar
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => addArrayItem('experience', { id: Date.now().toString(), role: '', company: '', startYear: '', endYear: '' })}>
            + Añadir Experiencia
          </Button>
        </div>

        <div className="grid gap-1.5 border-t pt-4">
          <Label className="text-lg">Formación Académica (Timeline)</Label>
          {values.education.map((edu, idx) => (
            <div key={edu.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-muted/20 p-3 rounded-lg border">
              <Input className="sm:col-span-4" placeholder="Grado/Título" value={edu.degree} onChange={(e) => updateArrayItem('education', idx, 'degree', e.target.value)} />
              <Input className="sm:col-span-4" placeholder="Institución" value={edu.institution} onChange={(e) => updateArrayItem('education', idx, 'institution', e.target.value)} />
              <Input className="sm:col-span-1" placeholder="Inicio" value={edu.startYear} onChange={(e) => updateArrayItem('education', idx, 'startYear', e.target.value)} />
              <Input className="sm:col-span-1" placeholder="Fin" value={edu.endYear} onChange={(e) => updateArrayItem('education', idx, 'endYear', e.target.value)} />
              <Button type="button" variant="ghost" size="icon" className="sm:col-span-2 text-destructive" onClick={() => removeArrayItem('education', idx)}>
                <X className="h-4 w-4" /> Eliminar
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => addArrayItem('education', { id: Date.now().toString(), degree: '', institution: '', startYear: '', endYear: '' })}>
            + Añadir Estudio
          </Button>
        </div>

        <div className="grid gap-1.5 border-t pt-4">
          <Label className="text-lg">Calificación Promedio</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="w-24"
              value={values.rating}
              onChange={(e) => setValues({ ...values, rating: parseFloat(e.target.value) || 0 })}
            />
            <span className="text-sm text-muted-foreground">Estrellas (0.0 a 5.0)</span>
          </div>
        </div>

        <div className="grid gap-1.5 border-t pt-4">
          <Label className="text-lg">Testimonios</Label>
          {values.testimonials.map((test, idx) => (
            <div key={test.id} className="grid grid-cols-1 gap-2 bg-muted/20 p-3 rounded-lg border">
              <Input placeholder="Autor (Ej. Juan P.)" value={test.author} onChange={(e) => updateArrayItem('testimonials', idx, 'author', e.target.value)} />
              <Textarea placeholder="Testimonio..." value={test.text} onChange={(e) => updateArrayItem('testimonials', idx, 'text', e.target.value)} />
              <Button type="button" variant="ghost" size="sm" className="w-fit text-destructive" onClick={() => removeArrayItem('testimonials', idx)}>
                Eliminar Testimonio
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => addArrayItem('testimonials', { id: Date.now().toString(), text: '', author: '' })}>
            + Añadir Testimonio
          </Button>
        </div>

        <div className="grid gap-1.5 border-t pt-4">
          <Label className="text-lg">Publicaciones / Artículos</Label>
          {values.publications.map((pub, idx) => (
            <div key={pub.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-muted/20 p-3 rounded-lg border">
              <Input className="sm:col-span-5" placeholder="Título del artículo" value={pub.title} onChange={(e) => updateArrayItem('publications', idx, 'title', e.target.value)} />
              <Input className="sm:col-span-5" placeholder="URL (https://...)" value={pub.url} onChange={(e) => updateArrayItem('publications', idx, 'url', e.target.value)} />
              <Button type="button" variant="ghost" size="icon" className="sm:col-span-2 text-destructive" onClick={() => removeArrayItem('publications', idx)}>
                <X className="h-4 w-4" /> Eliminar
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => addArrayItem('publications', { id: Date.now().toString(), title: '', url: '' })}>
            + Añadir Publicación
          </Button>
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
