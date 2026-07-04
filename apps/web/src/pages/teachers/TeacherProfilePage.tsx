import { useParams } from 'react-router-dom';
import { CalendarDays, Star, Briefcase, GraduationCap, Quote, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ROUTES } from '@/constants/routes';
import { useTeacher } from '@/hooks/useTeacher';
import { CourseCard } from '@/components/shared/CourseCard';

const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.249-.129.597-.129.946v5.421h-3.554s.05-8.789 0-9.514h3.554v1.347c.42-.648 1.36-1.573 3.322-1.573 2.432 0 4.261 1.589 4.261 5.004v4.736zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.706 0-.968.77-1.706 1.96-1.706 1.188 0 1.915.738 1.939 1.706 0 .948-.751 1.706-1.984 1.706zm1.581 11.597H3.635V9.038h3.283v11.414zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
  </svg>
);

export default function TeacherProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { teacher, isLoading, error } = useTeacher(slug);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </section>
    );
  }

  if (error || !teacher) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Profesor no encontrado.</p>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Breadcrumb
        items={[
          { label: 'Inicio', path: ROUTES.HOME },
          { label: 'Profesores' },
          { label: teacher.name },
        ]}
      />

      <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <img
          src={teacher.photoUrl}
          alt={teacher.name}
          className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-cee-red/15"
          loading="eager"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl">{teacher.name}</h1>
              <p className="mt-1 font-medium text-cee-red">{teacher.title}</p>
            </div>
            {teacher.linkedinUrl && (
              <a
                href={teacher.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A66C2] transition hover:scale-110 hover:shadow-lg"
                aria-label="Ver perfil en LinkedIn"
              >
                <LinkedInLogo />
              </a>
            )}
          </div>
        </div>
      </div>

      {teacher.specialties && teacher.specialties.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {teacher.specialties.map((spec, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {teacher.rating && teacher.rating > 0 ? (
        <div className="mt-6 flex items-center gap-1.5">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{teacher.rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">Calificación promedio</span>
        </div>
      ) : null}

      <p className="mt-8 text-base leading-relaxed text-muted-foreground">{teacher.bio}</p>

      {/* TRAYECTORIA Y EDUCACIÓN */}
      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        {teacher.experience && teacher.experience.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6 text-xl font-semibold">
              <Briefcase className="h-6 w-6 text-cee-red" />
              <h2>Experiencia Laboral</h2>
            </div>
            <div className="relative border-l-2 border-muted pl-6 pb-2 grid gap-8">
              {teacher.experience.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background bg-cee-red"></div>
                  <h3 className="font-semibold text-lg">{exp.role}</h3>
                  <p className="font-medium text-muted-foreground">{exp.company}</p>
                  <span className="inline-block mt-1 bg-muted px-2.5 py-0.5 rounded text-xs font-semibold text-muted-foreground">
                    {exp.startYear} - {exp.endYear || 'Presente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {teacher.education && teacher.education.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6 text-xl font-semibold">
              <GraduationCap className="h-6 w-6 text-cee-red" />
              <h2>Formación Académica</h2>
            </div>
            <div className="relative border-l-2 border-muted pl-6 pb-2 grid gap-8">
              {teacher.education.map((edu) => (
                <div key={edu.id} className="relative">
                  <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background bg-cee-red"></div>
                  <h3 className="font-semibold text-lg">{edu.degree}</h3>
                  <p className="font-medium text-muted-foreground">{edu.institution}</p>
                  <span className="inline-block mt-1 bg-muted px-2.5 py-0.5 rounded text-xs font-semibold text-muted-foreground">
                    {edu.startYear} - {edu.endYear || 'Presente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TESTIMONIOS */}
      {teacher.testimonials && teacher.testimonials.length > 0 && (
        <div className="mt-12 pt-10 border-t">
          <h2 className="text-xl font-semibold mb-6">Testimonios de alumnos</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {teacher.testimonials.map((test) => (
              <div key={test.id} className="bg-muted/30 p-6 rounded-2xl relative">
                <Quote className="h-8 w-8 text-muted/40 absolute top-4 left-4" />
                <p className="relative z-10 text-muted-foreground italic mb-4 mt-2">"{test.text}"</p>
                <p className="font-semibold text-sm">— {test.author}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CURSOS ACTIVOS */}

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Cursos en los que participa</h2>
        {teacher.activeCourses && teacher.activeCourses.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {teacher.activeCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No tiene cursos activos por el momento.
          </p>
        )}
      </div>

      {/* PUBLICACIONES Y ARTÍCULOS */}
      {teacher.publications && teacher.publications.length > 0 && (
        <div className="mt-12 pt-10 border-t">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-cee-red" />
            Recursos y Publicaciones
          </h2>
          <div className="grid gap-3">
            {teacher.publications.map((pub) => (
              <a
                key={pub.id}
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
              >
                <span className="font-medium group-hover:text-cee-red transition-colors">{pub.title}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-cee-red transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
