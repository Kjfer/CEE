import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCourses } from '@/hooks/useCourses';
import { useToast } from '@/hooks/useToast';
import { salesRecordsService, type SaleFormInput } from '@/services/salesRecordsService';
import { studentsService } from '@/services/studentsService';
import type { Student } from '@cee/types';

interface FormValues {
  userId: string;
  studentName: string;
  courseId: string;
  amount: string;
  status: 'pending' | 'completed';
  notes: string;
}

interface FormErrors {
  studentName?: string;
  courseId?: string;
  amount?: string;
}

const INITIAL: FormValues = {
  userId: '',
  studentName: '',
  courseId: '',
  amount: '',
  status: 'pending',
  notes: '',
};

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.studentName.trim() && !v.userId) {
    e.studentName = 'El alumno es requerido.';
  }
  if (!v.courseId) {
    e.courseId = 'Selecciona un curso.';
  }
  const amount = Number(v.amount);
  if (!v.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    e.amount = 'Ingresa un monto numérico mayor a 0.';
  }
  return e;
}

export default function SaleFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { success, error } = useToast();
  const { courses } = useCourses();

  const [students, setStudents] = useState<Student[]>([]);
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Derivar estudiantes filtrados
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase().trim();
    const fullName = `${s.firstName} ${s.lastNamePaterno} ${s.lastNameMaterno}`.toLowerCase();
    return fullName.includes(q) || s.dni.includes(q) || (s.email || '').toLowerCase().includes(q);
  });

  // Load students and pre-fill from ?student_id if present
  useEffect(() => {
    studentsService.getStudents().then(({ data }) => {
      setStudents(data);
    }).catch(() => {});

    const studentId = params.get('student_id');
    if (!studentId) return;
    studentsService.getStudentById(studentId).then(({ data: s }) => {
      const fullName = `${s.firstName} ${s.lastNamePaterno} ${s.lastNameMaterno}`.trim();
      setValues((prev) => ({
        ...prev,
        userId: s.id,
        studentName: fullName,
      }));
      setStudentSearch(`${fullName} - ${s.dni}`);
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof FormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ve = validate(values);
    setErrors(ve);
    if (Object.keys(ve).length > 0) return;

    setSubmitting(true);
    try {
      const selectedCourse = courses.find((c) => c.id === values.courseId);
      const input: SaleFormInput = {
        userId: values.userId || undefined,
        studentName: values.studentName.trim(),
        courseId: values.courseId,
        courseName: selectedCourse?.title ?? values.courseId,
        amount: Number(values.amount),
        status: values.status,
        notes: values.notes.trim() || null,
      };
      await salesRecordsService.createSale(input);
      success('Inscripción registrada', 'La venta se registró correctamente.');
      navigate('/ventas');
    } catch (err) {
      error('No se pudo registrar', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl grid gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Registrar inscripción</h1>
        <p className="mt-0.5 text-sm text-[#A9A9A9]">Registra una inscripción manualmente</p>
      </div>

      <form className="grid gap-5 w-full bg-white p-6 md:p-8 rounded-xl shadow-sm border" onSubmit={handleSubmit} noValidate>
        {/* Alumno */}
        {/* Alumno - Buscador dinámico */}
        <div className="grid gap-1.5 relative">
          <Label htmlFor="searchStudent">Alumno</Label>
          <div className="relative">
            <Input
              id="searchStudent"
              type="text"
              placeholder="Escribe para buscar un alumno (nombre, DNI, correo)..."
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                setShowStudentDropdown(true);
                // Si el usuario borra todo, quitamos el alumno seleccionado
                if (!e.target.value.trim()) {
                  setValues(prev => ({ ...prev, userId: '', studentName: '' }));
                }
              }}
              onFocus={() => setShowStudentDropdown(true)}
              onBlur={() => {
                // Pequeño retraso para permitir que el click en la opción se registre
                setTimeout(() => setShowStudentDropdown(false), 200);
              }}
              aria-invalid={Boolean(errors.studentName)}
            />
            {showStudentDropdown && studentSearch.trim() && (
              <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg py-1 text-sm">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <li
                      key={s.id}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100 flex flex-col"
                      onClick={() => {
                        const fullName = `${s.firstName} ${s.lastNamePaterno} ${s.lastNameMaterno}`.trim();
                        setValues(prev => ({
                          ...prev,
                          userId: s.id,
                          studentName: fullName
                        }));
                        setStudentSearch(`${fullName} - ${s.dni}`);
                        setShowStudentDropdown(false);
                      }}
                    >
                      <span className="font-medium text-gray-900">{s.firstName} {s.lastNamePaterno} {s.lastNameMaterno}</span>
                      <span className="text-xs text-gray-500">DNI: {s.dni} {s.email ? `• ${s.email}` : ''}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500">No se encontraron resultados.</li>
                )}
              </ul>
            )}
          </div>
          {errors.studentName && (
            <p className="text-sm text-destructive">{errors.studentName}</p>
          )}
          
          <div className="text-xs text-muted-foreground mt-1">
            Si el alumno no está en la lista, <Link to="/alumnos/nuevo" className="text-[#682222] hover:underline">crea su perfil primero aquí</Link>.
          </div>
        </div>

        {/* Curso */}
        <div className="grid gap-1.5">
          <Label htmlFor="courseId">Curso</Label>
          <select
            id="courseId"
            value={values.courseId}
            onChange={handleChange('courseId')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
            aria-invalid={Boolean(errors.courseId)}
          >
            <option value="">Selecciona un curso...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <p className="text-sm text-destructive">{errors.courseId}</p>
          )}
        </div>

        {/* Monto + Estado */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="amount">Monto (S/)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="199.00"
              value={values.amount}
              onChange={handleChange('amount')}
              aria-invalid={Boolean(errors.amount)}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={values.status}
              onChange={handleChange('status')}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-[#682222] focus:outline-none focus:ring-1 focus:ring-[#682222]/40"
            >
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
            </select>
          </div>
        </div>

        {/* Notas */}
        <div className="grid gap-1.5">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Método de pago, observaciones, etc."
            value={values.notes}
            onChange={handleChange('notes')}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#682222] text-white hover:bg-[#4F1A1A]"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar inscripción'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/ventas">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
