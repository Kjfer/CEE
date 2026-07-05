import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCourses } from '@/hooks/useCourses';
import { useToast } from '@/hooks/useToast';
import { certificatesService } from '@/services/certificatesService';
import { studentsService } from '@/services/studentsService';
import type { Student } from '@cee/types';

interface FormValues {
  studentId: string;
  courseId: string;
  grade: string;
  issuedAt: string;
  completedAt: string;
  notes: string;
}

interface FormErrors {
  studentId?: string;
  courseId?: string;
  grade?: string;
  issuedAt?: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function studentFullName(s: Student): string {
  return `${s.firstName} ${s.lastNamePaterno} ${s.lastNameMaterno}`.trim();
}

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.studentId) e.studentId = 'Selecciona un alumno.';
  if (!v.courseId) e.courseId = 'Selecciona un curso.';
  if (!v.grade.trim()) e.grade = 'Ingresa la nota.';
  else if (Number.isNaN(Number(v.grade)) || Number(v.grade) < 0 || Number(v.grade) > 20) {
    e.grade = 'La nota debe estar entre 0 y 20.';
  }
  if (!v.issuedAt) e.issuedAt = 'La fecha de emisión es requerida.';
  return e;
}

export default function CertificateFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { success, error } = useToast();
  const { courses } = useCourses();
  const [students, setStudents] = useState<Student[]>([]);

  const preCurso = params.get('curso') ?? '';
  const preStudentId = params.get('student_id') ?? '';

  const [values, setValues] = useState<FormValues>({
    studentId: preStudentId,
    courseId: preCurso,
    grade: '',
    issuedAt: todayISO(),
    completedAt: todayISO(),
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    studentsService.getStudents().then(({ data }) => setStudents(data)).catch(() => {});
  }, []);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === values.studentId),
    [students, values.studentId],
  );

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === values.courseId),
    [courses, values.courseId],
  );

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
    if (!selectedStudent || !selectedCourse) return;

    setSubmitting(true);
    try {
      await certificatesService.issueCertificate({
        studentId: selectedStudent.id,
        studentName: studentFullName(selectedStudent),
        profileId: selectedStudent.profileId ?? null,
        courseId: selectedCourse.id,
        courseName: selectedCourse.title,
        academicHours: selectedCourse.academicHours,
        grade: Number(values.grade),
        issuedAt: values.issuedAt,
        completedAt: values.completedAt || null,
        notes: values.notes.trim() || null,
      });
      success('Certificado emitido', 'PDF generado y disponible para el estudiante.');
      navigate('/certificados');
    } catch (err) {
      error('No se pudo emitir', err instanceof Error ? err.message : 'Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl grid gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Emitir certificado digital</h1>
        <p className="mt-0.5 text-sm text-[#A9A9A9]">
          Genera el PDF con la plantilla CEE y publícalo para el estudiante.
        </p>
      </div>

      <form className="grid gap-5 w-full bg-white p-6 md:p-8 rounded-xl shadow-sm border" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="studentId">Alumno</Label>
          <select
            id="studentId"
            value={values.studentId}
            onChange={handleChange('studentId')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Selecciona un alumno...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {studentFullName(s)} — DNI {s.dni}
              </option>
            ))}
          </select>
          {errors.studentId && <p className="text-sm text-destructive">{errors.studentId}</p>}
          {selectedStudent && !selectedStudent.profileId && (
            <p className="text-xs text-amber-700">
              Este alumno no tiene cuenta web vinculada; no podrá verlo en /perfil hasta asociar un profile_id.
            </p>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="courseId">Curso</Label>
          <select
            id="courseId"
            value={values.courseId}
            onChange={handleChange('courseId')}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Selecciona un curso...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {errors.courseId && <p className="text-sm text-destructive">{errors.courseId}</p>}
          {selectedCourse && (
            <p className="text-xs text-muted-foreground">{selectedCourse.academicHours} horas académicas</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="grade">Nota (/20)</Label>
            <Input
              id="grade"
              type="number"
              min={0}
              max={20}
              step={0.5}
              placeholder="Ej. 17.5"
              value={values.grade}
              onChange={handleChange('grade')}
            />
            {errors.grade && <p className="text-sm text-destructive">{errors.grade}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="completedAt">Fecha de finalización</Label>
            <Input id="completedAt" type="date" value={values.completedAt} onChange={handleChange('completedAt')} />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="issuedAt">Fecha de emisión</Label>
          <Input id="issuedAt" type="date" value={values.issuedAt} max={todayISO()} onChange={handleChange('issuedAt')} />
          {errors.issuedAt && <p className="text-sm text-destructive">{errors.issuedAt}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea id="notes" value={values.notes} onChange={handleChange('notes')} rows={3} />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="bg-[#682222] text-white hover:bg-[#4F1A1A]">
            {isSubmitting ? 'Generando PDF...' : 'Generar y emitir certificado'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link to="/certificados">Cancelar</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
