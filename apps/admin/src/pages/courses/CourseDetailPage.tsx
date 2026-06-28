import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Course, CourseCategory, CourseStatus } from '@cee/types';
import { ArrowLeft, Download, FileText, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { coursesService } from '@/services/coursesService';
import { cn, formatPrice } from '@/lib/utils';

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CourseStatus, { label: string; cls: string }> = {
  published: { label: 'Publicado',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  draft:     { label: 'Borrador',    cls: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
  review:    { label: 'En Revisión', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
};

const CATEGORY_CLS: Record<CourseCategory, string> = {
  'Gestión':             'bg-blue-50 text-blue-700',
  'Tecnología':          'bg-purple-50 text-purple-700',
  'Finanzas':            'bg-emerald-50 text-emerald-700',
  'Habilidades Blandas': 'bg-orange-50 text-orange-700',
  'Ingeniería':          'bg-red-50 text-red-700',
};

function Chip({ cls, label }: { cls: string; label: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', cls)}>
      {label}
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Info grid row ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A9A9A9]">{label}</p>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const dateFmt = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
function fmtDate(iso: string) {
  return dateFmt.format(new Date(`${iso.slice(0, 10)}T00:00:00`));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();

  const [course,    setCourse]    = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound,  setNotFound]  = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    coursesService.getCourseById(id)
      .then((res) => setCourse(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-white shadow-sm">
        <p className="text-sm text-[#A9A9A9]">Cargando curso...</p>
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl bg-white shadow-sm">
        <p className="text-sm font-medium text-gray-500">Curso no encontrado</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/cursos')}>
          Volver a cursos
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[course.status];

  return (
    <section className="grid gap-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <Link
            to="/cursos"
            className="flex items-center gap-1.5 text-xs text-[#A9A9A9] hover:text-[#682222]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a cursos
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Chip cls={statusCfg.cls} label={statusCfg.label} />
            <Chip cls={CATEGORY_CLS[course.category]} label={course.category} />
            <Chip cls="bg-gray-100 text-gray-600" label={course.modality} />
            <Chip cls="bg-gray-100 text-gray-600" label={course.level} />
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          className="gap-2 border-gray-200 hover:border-[#682222] hover:text-[#682222]"
        >
          <Link to={`/cursos/${course.id}/editar`}>
            <Pencil className="h-4 w-4" />
            Editar curso
          </Link>
        </Button>
      </div>

      {/* ── Información general ── */}
      <Section title="Información general">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {/* Precio */}
          <InfoRow
            label="Precio"
            value={
              <span className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#682222]">{formatPrice(course.price)}</span>
                {course.originalPrice != null && (
                  <span className="text-sm text-[#A9A9A9] line-through">{formatPrice(course.originalPrice)}</span>
                )}
              </span>
            }
          />
          <InfoRow label="Horas académicas"      value={course.academicHours ? `${course.academicHours} h` : null} />
          <InfoRow label="Duración"              value={course.durationWeeks ? `${course.durationWeeks} semanas` : null} />
          <InfoRow label="Cupo máximo"           value={course.maxStudents ?? null} />
          <InfoRow label="Mínimo de alumnos"     value={course.minStudents ?? null} />
          <InfoRow label="Días de alerta"        value={course.alertDaysBefore ? `${course.alertDaysBefore} días` : null} />
          <InfoRow label="Horario"               value={course.scheduleDescription ?? null} />
          <InfoRow label="Fecha de inicio"       value={course.startDate ? fmtDate(course.startDate) : null} />
          <InfoRow label="Certificación"         value={course.certification} />
          {course.moodleCourseId != null && (
            <InfoRow label="Moodle Course ID" value={<span className="font-mono text-xs">{course.moodleCourseId}</span>} />
          )}
          <InfoRow label="Fecha de creación"     value={fmtDate(course.createdAt)} />
          <InfoRow label="Última actualización"  value={fmtDate(course.updatedAt)} />
        </div>
      </Section>

      {/* ── Descripción ── */}
      <Section title="Descripción">
        <div className="grid gap-4">
          {course.shortDescription && (
            <p className="rounded-lg bg-[#682222]/5 px-4 py-3 text-sm font-medium leading-relaxed text-[#682222]">
              {course.shortDescription}
            </p>
          )}
          {course.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {course.description}
            </p>
          )}
        </div>
      </Section>

      {/* ── Perfil del egresado ── */}
      {course.graduateProfile.length > 0 && (
        <Section title="Perfil del egresado">
          <ul className="grid gap-2">
            {course.graduateProfile.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-[#682222] text-center text-[10px] font-bold leading-5 text-white">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Beneficios ── */}
      {course.benefits.length > 0 && (
        <Section title="Beneficios del curso">
          <ul className="grid gap-2 sm:grid-cols-2">
            {course.benefits.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#682222]" />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Plan de estudios (módulos) ── */}
      {course.syllabus.length > 0 && (
        <Section title="Plan de estudios">
          <div className="grid gap-4">
            {course.syllabus.map((mod) => (
              <div key={mod.id} className="rounded-lg border border-gray-100 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-900">{mod.title}</p>
                <ul className="grid gap-1">
                  {mod.topics.map((topic, ti) => (
                    <li key={ti} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#A9A9A9]" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Sílabo (PDF) ── */}
      <Section title="Sílabo (PDF)">
        {course.syllabusPdfUrl ? (
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <a
                href={course.syllabusPdfUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#682222] hover:text-[#682222]"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </a>
            </div>
            {/* PDF viewer */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <embed
                src={course.syllabusPdfUrl}
                type="application/pdf"
                className="h-[600px] w-full"
                title={`Sílabo: ${course.title}`}
              />
              {/* Fallback for browsers that don't support embed */}
              <noscript>
                <p className="p-4 text-sm text-gray-600">
                  Tu navegador no puede mostrar el PDF.{' '}
                  <a href={course.syllabusPdfUrl} className="text-[#682222] underline" target="_blank" rel="noopener noreferrer">
                    Descárgalo aquí.
                  </a>
                </p>
              </noscript>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <FileText className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No se ha subido el sílabo aún.</p>
            <Button asChild variant="outline" size="sm" className="border-gray-200 hover:border-[#682222] hover:text-[#682222]">
              <Link to={`/cursos/${course.id}/editar`}>Subir sílabo</Link>
            </Button>
          </div>
        )}
      </Section>

      {/* ── Instructores ── */}
      {course.instructors.length > 0 && (
        <Section title="Instructores">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {course.instructors.map((inst) => (
              <div
                key={inst.id}
                className="flex items-start gap-3 rounded-lg border border-gray-100 p-4"
              >
                {inst.photoUrl ? (
                  <img
                    src={inst.photoUrl}
                    alt={inst.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#682222] text-lg font-bold text-white">
                    {inst.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{inst.name}</p>
                  <p className="truncate text-xs text-[#A9A9A9]">{inst.title}</p>
                  {inst.bio && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">{inst.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </section>
  );
}
