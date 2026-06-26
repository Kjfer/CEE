import { CheckCircle2 } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

interface LandingStudentProfileProps {
  graduateProfile: string[];
}

const PREREQUISITES = [
  'Formación técnica o universitaria en áreas afines al programa.',
  'Interés genuino por aplicar lo aprendido en un entorno profesional real.',
  'Disponibilidad para participar en las sesiones y actividades prácticas.',
];

/** "Perfil del egresado" (de course.graduateProfile) + requisitos genéricos reutilizables. */
export function LandingStudentProfile({ graduateProfile }: LandingStudentProfileProps) {
  return (
    <div>
      <SectionHeading
        eyebrow="¿Es para ti?"
        title="Perfil del egresado"
        description="Al concluir el programa, te integrarás a un perfil profesional con alta demanda en el mercado."
      />

      {graduateProfile.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {graduateProfile.map((profile, index) => (
            <div
              key={profile}
              className="flex items-start gap-4 rounded-xl border border-border bg-muted/40 p-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cee-red font-bold text-white">
                {index + 1}
              </div>
              <p className="pt-1.5 text-foreground">{profile}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-cee-red/20 bg-cee-red/5 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-foreground">Requisitos previos</h3>
        <ul className="mt-4 space-y-3">
          {PREREQUISITES.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cee-red" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
