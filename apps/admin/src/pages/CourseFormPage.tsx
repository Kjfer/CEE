import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CourseCategory, CourseModality, CourseStatus, Instructor } from '@cee/types';
import { Paperclip, UploadCloud, FileText, X, ImageIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { COURSE_STATUS_OPTIONS } from '@/constants/courseStatus';
import { useToast } from '@/hooks/useToast';
import { coursesService, type CourseFormInput } from '@/services/coursesService';
import { instructorsService } from '@/services/instructorsService';
import { ScheduleBuilder } from '@/components/ScheduleBuilder';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';

const CATEGORY_OPTIONS: CourseCategory[] = [
  'Ingeniería',
  'Gestión',
  'Tecnología',
  'Habilidades Blandas',
  'Finanzas',
];

const MODALITY_OPTIONS: CourseModality[] = ['Presencial', 'Virtual', 'Híbrido'];

const MAX_FILE_SIZE_MB = 10;

interface FormValues {
  title: string;
  description: string;
  price: string;
  category: CourseCategory | '';
  modality: CourseModality;
  moodleCourseId: string;
  status: CourseStatus;
  durationWeeks: string;
  scheduleDescription: string;
  startDate: string;
  maxStudents: string;
  minStudents: string;
  alertDaysBefore: string;
  instructorIds: string[];
}

const INITIAL_VALUES: FormValues = {
  title: '',
  description: '',
  price: '',
  category: '',
  modality: 'Virtual',
  moodleCourseId: '',
  status: 'draft',
  durationWeeks: '',
  scheduleDescription: '',
  startDate: '',
  maxStudents: '',
  minStudents: '',
  alertDaysBefore: '',
  instructorIds: [],
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function fileNameFromUrl(url: string) {
  return url.split('/').pop() ?? url;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.title.trim().length < 3) {
    errors.title = 'El nombre debe tener al menos 3 caracteres.';
  }
  if (values.description.trim().length < 10) {
    errors.description = 'La descripción debe tener al menos 10 caracteres.';
  }
  const price = Number(values.price);
  if (!values.price.trim() || Number.isNaN(price) || price <= 0) {
    errors.price = 'Ingresa un precio numérico mayor a 0.';
  }
  if (!values.category) {
    errors.category = 'Selecciona una categoría.';
  }
  const moodleId = Number(values.moodleCourseId.trim());
  if (!values.moodleCourseId.trim() || Number.isNaN(moodleId)) {
    errors.moodleCourseId = 'Ingresa un Moodle Course ID numérico válido.';
  }

  const max = Number(values.maxStudents);
  const min = Number(values.minStudents);
  if (min > max && min > 0 && max > 0) {
    errors.minStudents = 'El cupo mínimo no puede ser mayor al cupo máximo.';
  }

  return errors;
}

export default function CourseFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [syllabusFileName, setSyllabusFileName] = useState<string | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [isInstructorDropdownOpen, setIsInstructorDropdownOpen] = useState(false);
  const instructorDropdownRef = useRef<HTMLDivElement>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(isEditMode);
  const [loadError, setLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (instructorDropdownRef.current && !instructorDropdownRef.current.contains(event.target as Node)) {
        setIsInstructorDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    instructorsService.getInstructors().then((res) => {
      if (isMounted) setAllInstructors(res.data);
    }).catch(() => {});

    if (!isEditMode || !id) {
      return;
    }
    coursesService
      .getCourseById(id)
      .then((response) => {
        if (!isMounted) return;
        const course = response.data;
        setValues({
          title: course.title,
          description: course.description,
          price: String(course.price),
          category: course.category,
          modality: course.modality,
          moodleCourseId: course.moodleCourseId != null ? String(course.moodleCourseId) : '',
          status: course.status,
          durationWeeks: course.durationWeeks != null ? String(course.durationWeeks) : '',
          scheduleDescription: course.scheduleDescription ?? '',
          startDate: course.startDate ? course.startDate.slice(0, 10) : '',
          maxStudents:     course.maxStudents     != null ? String(course.maxStudents)     : '',
          minStudents:     course.minStudents     != null ? String(course.minStudents)     : '',
          alertDaysBefore: course.alertDaysBefore != null ? String(course.alertDaysBefore) : '',
          instructorIds: course.instructors.map((i) => i.id),
        });
        if (course.syllabusPdfUrl) {
          setSyllabusFileName(fileNameFromUrl(course.syllabusPdfUrl));
        }
        if (course.imageUrl) {
          setImageFileName(fileNameFromUrl(course.imageUrl));
          setExistingImageUrl(course.imageUrl);
        }
      })
      .catch(() => {
        if (isMounted) setLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCourse(false);
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      error('Archivo inválido', 'Solo se permiten archivos PDF.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      error('Archivo muy grande', `El sílabo no debe superar los ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }

    setSyllabusFileName(file.name);
    setSyllabusFile(file);
  };

  const handleRemoveFile = () => {
    setSyllabusFileName(null);
    setSyllabusFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const handleSelectFromGallery = (url: string) => {
    setExistingImageUrl(url);
    setImageFile(null);
    setImageFileName(url.split('/').pop() || 'imagen-reciclada.jpg');
    setIsGalleryOpen(false);
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
      const input: CourseFormInput = {
        title: values.title.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        category: values.category as CourseCategory,
        modality: values.modality,
        moodleCourseId: Number(values.moodleCourseId.trim()),
        status: values.status,
        syllabusFileName,
        syllabusFile,
        imageFileName,
        imageFile,
        durationWeeks: values.durationWeeks ? Number(values.durationWeeks) : null,
        scheduleDescription: values.scheduleDescription.trim() || null,
        startDate: values.startDate || null,
        maxStudents:     values.maxStudents     ? Number(values.maxStudents)     : null,
        minStudents:     values.minStudents     ? Number(values.minStudents)     : null,
        alertDaysBefore: values.alertDaysBefore ? Number(values.alertDaysBefore) : null,
        instructorIds: values.instructorIds,
      };

      if (isEditMode && id) {
        await coursesService.updateCourse(id, input);
      } else {
        await coursesService.createCourse(input);
      }

      success('Curso guardado', 'El curso se guardó correctamente.');
      navigate('/cursos');
    } catch (err) {
      error('No se pudo guardar el curso', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCourse) {
    return <p className="text-muted-foreground">Cargando curso...</p>;
  }

  if (loadError) {
    return <p className="text-destructive">No se pudo cargar el curso.</p>;
  }

  const filteredInstructors = allInstructors.filter((i) =>
    i.name.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  return (
    <section className="mx-auto max-w-5xl grid gap-6">
      <h1 className="text-2xl font-bold text-center">{isEditMode ? 'Editar curso' : 'Registrar curso'}</h1>

      <form className="w-full bg-white p-6 md:p-8 rounded-xl shadow-sm border" onSubmit={handleSubmit} noValidate>
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          {/* Columna Izquierda (Parámetros Principales) */}
          <div className="grid gap-5 content-start">
            <div className="grid gap-1.5">
              <Label htmlFor="title">Nombre del curso</Label>
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

            <div className="grid gap-4 sm:grid-cols-3 items-start">
              <div className="grid gap-1.5">
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={values.category}
                  onChange={handleChange('category')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-invalid={Boolean(errors.category)}
                >
                  <option value="">Selecciona...</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="modality">Modalidad</Label>
                <select
                  id="modality"
                  value={values.modality}
                  onChange={handleChange('modality')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {MODALITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="moodleCourseId">Moodle ID</Label>
                <Input
                  id="moodleCourseId"
                  value={values.moodleCourseId}
                  onChange={handleChange('moodleCourseId')}
                  aria-invalid={Boolean(errors.moodleCourseId)}
                />
                {errors.moodleCourseId && (
                  <p className="text-sm text-destructive">{errors.moodleCourseId}</p>
                )}
              </div>
            </div>

            <div className="grid gap-1.5 relative" ref={instructorDropdownRef}>
              <Label>Profesores asignados</Label>
              {allInstructors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay profesores registrados.</p>
              ) : (
                <div className="relative">
                  <div 
                    className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
                    onClick={() => setIsInstructorDropdownOpen(!isInstructorDropdownOpen)}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {values.instructorIds.length === 0 ? (
                        <span className="text-muted-foreground">Seleccionar profesores...</span>
                      ) : (
                        values.instructorIds.map(id => {
                          const inst = allInstructors.find(i => i.id === id);
                          if (!inst) return null;
                          return (
                            <span key={id} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                               <img src={inst.photoUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
                               {inst.name}
                            </span>
                          )
                        })
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isInstructorDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isInstructorDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full z-50 rounded-md border bg-white shadow-lg outline-none overflow-hidden">
                      <div className="p-2 border-b bg-muted/20">
                        <Input 
                          type="search" 
                          placeholder="Buscar profesor por nombre..." 
                          value={instructorSearch}
                          onChange={(e) => setInstructorSearch(e.target.value)}
                          className="h-8"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        {filteredInstructors.length === 0 ? (
                          <p className="p-2 text-sm text-muted-foreground text-center">No se encontraron profesores.</p>
                        ) : (
                          filteredInstructors.map(instructor => {
                            const isSelected = values.instructorIds.includes(instructor.id);
                            return (
                              <label key={instructor.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setValues((prev) => ({ ...prev, instructorIds: [...prev.instructorIds, instructor.id] }));
                                    } else {
                                      setValues((prev) => ({ ...prev, instructorIds: prev.instructorIds.filter((instructorId) => instructorId !== instructor.id) }));
                                    }
                                  }}
                                />
                                <img src={instructor.photoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                                <span className="text-sm font-medium truncate">{instructor.name}</span>
                              </label>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 items-start">
              <div className="grid gap-1.5">
                <Label htmlFor="startDate">Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={values.startDate}
                  onChange={handleChange('startDate')}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="durationWeeks">Semanas</Label>
                <Input
                  id="durationWeeks"
                  type="number"
                  min="1"
                  value={values.durationWeeks}
                  onChange={handleChange('durationWeeks')}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Horario</Label>
              <ScheduleBuilder
                value={values.scheduleDescription}
                onChange={(val) => setValues(prev => ({ ...prev, scheduleDescription: val }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3 items-start">
              <div className="grid gap-1.5">
                <Label htmlFor="maxStudents">Cupo máx.</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={values.maxStudents}
                  onChange={handleChange('maxStudents')}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="minStudents">Cupo mín.</Label>
                <Input
                  id="minStudents"
                  type="number"
                  min="1"
                  value={values.minStudents}
                  onChange={handleChange('minStudents')}
                  aria-invalid={Boolean(errors.minStudents)}
                />
                {errors.minStudents && (
                  <p className="text-sm text-destructive">{errors.minStudents}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="alertDaysBefore">Días de alerta</Label>
                <Input
                  id="alertDaysBefore"
                  type="number"
                  min="1"
                  value={values.alertDaysBefore}
                  onChange={handleChange('alertDaysBefore')}
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha (Media, Precios, Estado) */}
          <div className="grid gap-6 content-start">
            
            <div className="grid gap-1.5">
              <Label htmlFor="image">Imagen del curso (16:9)</Label>
              {!imageFileName ? (
                <div className="relative group cursor-pointer">
                  <input
                    ref={imageInputRef}
                    id="image"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Seleccionar imagen"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg bg-muted/20 border-muted-foreground/25 group-hover:bg-muted/50 group-hover:border-primary/50 transition-all duration-200">
                    <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        <span className="text-primary hover:underline">Subir imagen</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        1280x720 (máx 2MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden bg-muted/10 group">
                  <img 
                    src={imageFileName && imageFile ? URL.createObjectURL(imageFile) : existingImageUrl!} 
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
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => setIsGalleryOpen(true)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Seleccionar del banco de imágenes
              </Button>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="syllabus">Sílabo (PDF)</Label>
              {!syllabusFileName ? (
                <div className="relative group cursor-pointer">
                  <input
                    ref={fileInputRef}
                    id="syllabus"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Seleccionar archivo PDF"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg bg-muted/20 border-muted-foreground/25 group-hover:bg-muted/50 group-hover:border-primary/50 transition-all duration-200">
                    <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        <span className="text-primary hover:underline">Subir PDF</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (máx. {MAX_FILE_SIZE_MB}MB)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                    <div className="p-2 bg-background/80 rounded-md shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col truncate min-w-0 flex-1">
                      <span className="text-sm font-medium truncate" title={syllabusFileName}>{syllabusFileName}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    aria-label="Quitar archivo"
                    className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 items-start">
              <div className="grid gap-1.5">
                <Label htmlFor="price">Precio (S/)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.price}
                  onChange={handleChange('price')}
                  aria-invalid={Boolean(errors.price)}
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={values.status}
                  onChange={handleChange('status')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {COURSE_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
          </div>
        </div>

        <div className="flex gap-3 justify-end border-t pt-6 mt-6">
          <Button asChild type="button" variant="outline">
            <Link to="/cursos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar curso'}
          </Button>
        </div>
      </form>
      {/* Gallery Modal */}
      {isGalleryOpen && (
        <ImageGalleryModal 
          onClose={() => setIsGalleryOpen(false)}
          onSelect={handleSelectFromGallery}
        />
      )}
    </section>
  );
}
