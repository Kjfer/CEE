import { Link } from 'react-router-dom';
import { BookOpen, FileEdit, LineChart, Users } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useDashboard } from '@/hooks/useDashboard';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const activityDateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { summary, isLoading } = useDashboard();

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Hola, {user?.name ?? 'admin'}</h1>
        <p className="mt-1 capitalize text-muted-foreground">{dateFormatter.format(new Date())}</p>
      </div>

      {isLoading || !summary ? (
        <p className="text-muted-foreground">Cargando resumen...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={BookOpen}
              label="Cursos Publicados"
              value={summary.publishedCourses}
              trend={summary.publishedCoursesDeltaPct}
            />
            <SummaryCard
              icon={FileEdit}
              label="Cursos en Borrador"
              value={summary.draftCourses}
              trend={summary.draftCoursesDeltaPct}
            />
            <SummaryCard
              icon={LineChart}
              label="Ventas del Mes"
              value={summary.monthlySales}
              trend={summary.monthlySalesDeltaPct}
            />
            <SummaryCard
              icon={Users}
              label="Usuarios Registrados"
              value={summary.registeredUsers}
              trend={summary.registeredUsersDeltaPct}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/cursos"
              className="rounded-lg bg-cee-red p-6 text-white transition hover:bg-cee-red-dark"
            >
              <p className="text-lg font-semibold">Gestionar Cursos</p>
              <p className="mt-1 text-sm text-white/80">
                Crear, editar y administrar el estado de los cursos.
              </p>
            </Link>
            <Link
              to="/ventas"
              className="rounded-lg border-2 border-cee-red p-6 text-cee-red transition hover:bg-cee-red hover:text-white"
            >
              <p className="text-lg font-semibold">Ver Ventas</p>
              <p className="mt-1 text-sm opacity-80">
                Revisar KPIs, tendencia e ingresos por curso.
              </p>
            </Link>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Actividad reciente</h2>
              <ul className="mt-4 grid gap-3">
                {summary.recentActivity.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 text-sm">
                    <span>
                      <span className="font-medium">{item.author}</span>{' '}
                      {item.action === 'created' ? 'creó' : 'editó'} el curso{' '}
                      <span className="font-medium">{item.courseTitle}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {activityDateFormatter.format(new Date(item.date))}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
