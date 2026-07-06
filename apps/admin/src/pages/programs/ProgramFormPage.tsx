import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { CourseCategory, CourseModality, CourseStatus } from '@cee/types';
import { ImageIcon, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { COURSE_STATUS_OPTIONS } from '@/constants/courseStatus';
import { useToast } from '@/hooks/useToast';
import { programsService, type ProgramFormInput } from '@/services/programsService';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { ProgramModuleModal } from '@/components/ProgramModuleModal';

const CATEGORIES: CourseCategory[] = ['Ingeniería', 'Gestión', 'Tecnología', 'Habilidades Blandas', 'Finanzas'];
const MODALITIES: CourseModality[] = ['Virtual', 'Presencial', 'Híbrido'];
const LEVELS = ['Básico', 'Intermedio', 'Avanzado'];

export default function ProgramFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const isEditing = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const [values, setValues] = useState<ProgramFormInput>({
    title: '',
    short_description: '',
    description: '',
    price: 0,
    original_price: null,
    category: 'Ingeniería',
    modality: 'Virtual',
    level: 'Básico',
    status: 'draft',
    academic_hours: 0,
    certification: 'Certificado CEE-FIIS',
    start_date: null,
    duration_weeks: null,
    schedule_description: null,
    imageFileName: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProgramFormInput, string>>>({});
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  
  // Modules management
  const [modules, setModules] = useState<any[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      if (isEditing && id) {
        setIsLoading(true);
        const { data: prog, error: progErr } = await programsService.getProgram(id);
        if (progErr || !prog) {
          error('Error', 'No se pudo cargar el programa');
          navigate('/programas');
          return;
        }

        setValues({
          title: prog.title,
          short_description: prog.shortDescription,
          description: prog.description,
          price: Number(prog.price),
          original_price: prog.originalPrice ? Number(prog.originalPrice) : null,
          category: prog.category as CourseCategory,
          modality: prog.modality as CourseModality,
          level: prog.level,
          status: prog.status as CourseStatus,
          academic_hours: prog.academicHours,
          certification: prog.certification,
          start_date: prog.startDate,
          duration_weeks: prog.durationWeeks ?? null,
          schedule_description: prog.scheduleDescription ?? null,
          imageFileName: prog.imageUrl ? 'imagen_actual.jpg' : null,
        });

        if (prog.imageUrl) setExistingImageUrl(prog.imageUrl);
        
        // Load modules
        await fetchModules();
      }
      setIsLoading(false);
    }
    loadData();
  }, [id, isEditing, navigate, error]);

  const fetchModules = async () => {
    if (!id) return;
    const { data } = await programsService.getProgramCourses(id);
    if (data) {
      setModules(data);
      const totalHours = data.reduce((sum, mod) => sum + (mod.course?.academic_hours || 0), 0);
      setValues(prev => ({ ...prev, academic_hours: totalHours }));
    }
  };

  const handleChange = (field: keyof ProgramFormInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setValues(prev => ({ ...prev, imageFileName: file.name }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setExistingImageUrl(null);
    setValues(prev => ({ ...prev, imageFileName: null }));
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSelectFromGallery = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const filename = url.split('/').pop() || 'gallery-image.jpg';
      const file = new File([blob], filename, { type: blob.type });
      
      setImageFile(file);
      setExistingImageUrl(url);
      setValues(prev => ({ ...prev, imageFileName: filename }));
      setIsGalleryOpen(false);
    } catch (err) {
      error('Error', 'No se pudo cargar la imagen seleccionada');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) {
      setErrors({ title: 'El título es obligatorio' });
      return;
    }

    setIsSubmitting(true);
    const input: ProgramFormInput = {
      ...values,
      imageFile,
    };

    try {
      if (isEditing && id) {
        const { error: err } = await programsService.updateProgram(id, input);
        if (err) throw new Error(err);
        success('Programa actualizado', 'El programa se guardó correctamente.');
      } else {
        const { data, error: err } = await programsService.createProgram(input);
        if (err) throw new Error(err);
        success('Programa creado', 'El programa se creó correctamente. Ahora puedes añadirle cursos.');
        navigate(`/programas/${data?.id}/editar`);
      }
    } catch (err: any) {
      error('Error al guardar', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleRemoveModule = async (courseId: string) => {
    if (!id) return;
    const { error: err } = await programsService.removeCourseFromProgram(id, courseId);
    if (err) {
      error('Error al quitar módulo', err);
    } else {
      success('Módulo quitado', 'El curso fue removido del programa.');
      fetchModules();
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando datos del programa...</div>;
  }

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Programa' : 'Nuevo Programa'}
        </h1>
        <p className="text-sm text-[#A9A9A9]">
          {isEditing ? 'Modifica los datos del programa' : 'Crea un nuevo programa de estudio'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid gap-8 lg:grid-cols-3">
          
          <div className="lg:col-span-2 grid gap-6">
            <div className="grid gap-1.5">
              <Label htmlFor="title">Título del Programa</Label>
              <Input
                id="title"
                value={values.title}
                onChange={handleChange('title')}
                placeholder="Ej. Programa Integral de..."
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={values.category}
                  onChange={handleChange('category')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="modality">Modalidad</Label>
                <select
                  id="modality"
                  value={values.modality}
                  onChange={handleChange('modality')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              
              <div className="grid gap-1.5">
                <Label htmlFor="level">Nivel</Label>
                <select
                  id="level"
                  value={values.level}
                  onChange={handleChange('level')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="certification">Certificación</Label>
                <Input
                  id="certification"
                  value={values.certification}
                  onChange={handleChange('certification')}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="short_description">Descripción Corta</Label>
              <Textarea
                id="short_description"
                value={values.short_description}
                onChange={handleChange('short_description')}
                className="resize-none h-20"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Descripción Completa</Label>
              <Textarea
                id="description"
                value={values.description}
                onChange={handleChange('description')}
                className="h-32"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="academic_hours">Horas Académicas</Label>
                <div className="relative">
                  <Input
                    id="academic_hours"
                    type="number"
                    value={values.academic_hours}
                    readOnly
                    className="bg-gray-50 text-gray-500 pr-24"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-xs text-gray-400">Auto-calculado</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="duration_weeks">Duración (Semanas)</Label>
                <Input
                  id="duration_weeks"
                  type="number"
                  value={values.duration_weeks || ''}
                  onChange={handleChange('duration_weeks')}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="start_date">Fecha de inicio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={values.start_date || ''}
                  onChange={handleChange('start_date')}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 content-start">
            <div className="grid gap-1.5">
              <Label htmlFor="image">Imagen del Programa (16:9)</Label>
              {!values.imageFileName ? (
                <div className="relative group cursor-pointer">
                  <input
                    ref={imageInputRef}
                    id="image"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg bg-muted/20 group-hover:bg-muted/50 transition-all">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium text-primary">Subir imagen</p>
                  </div>
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden group">
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : existingImageUrl!} 
                    alt="Preview" 
                    className="w-full aspect-video object-cover" 
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <Button type="button" variant="outline" onClick={() => setIsGalleryOpen(true)}>
                <ImageIcon className="h-4 w-4 mr-2" /> Galería
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="price">Precio (S/)</Label>
                <Input id="price" type="number" step="0.01" value={values.price} onChange={handleChange('price')} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={values.status}
                  onChange={handleChange('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {COURSE_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end border-t pt-6 mt-6">
          <Button asChild type="button" variant="outline">
            <Link to="/programas">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar programa'}
          </Button>
        </div>
      </form>

      {/* SECCIÓN DE MÓDULOS (Solo visible si el programa ya existe) */}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-8">
          <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cursos del Programa (Módulos)</h2>
              <p className="text-sm text-gray-500">Agrega cursos existentes a este programa</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-500">Puedes añadir uno o varios cursos a este programa.</p>
              <Button type="button" onClick={() => setIsModuleModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Añadir Cursos
              </Button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                No hay cursos asignados a este programa todavía.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 w-20 text-center">Orden</th>
                      <th className="px-4 py-3">Curso</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {modules.map((mod) => (
                      <tr key={mod.id}>
                        <td className="px-4 py-3 text-center font-medium">Módulo {mod.sort_order}</td>
                        <td className="px-4 py-3 text-gray-900">{mod.course?.title}</td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveModule(mod.course_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {isGalleryOpen && (
        <ImageGalleryModal 
          onClose={() => setIsGalleryOpen(false)}
          onSelect={handleSelectFromGallery}
        />
      )}

      {isModuleModalOpen && id && (
        <ProgramModuleModal 
          programId={id} 
          onClose={() => setIsModuleModalOpen(false)} 
          onAdded={fetchModules} 
        />
      )}
    </section>
  );
}
