import { CheckCircle2 } from 'lucide-react';

const reasons = [
  {
    title: 'Formación de la UNI',
    description: 'Programas diseñados por la Facultad de Ingeniería Industrial y Sistemas con excelencia académica reconocida.',
  },
  {
    title: 'Docentes Especializados',
    description: 'Profesionales con amplia experiencia en industria que combinan teoría y práctica en cada clase.',
  },
  {
    title: 'Metodología Ágil',
    description: 'Uso de metodologías modernas y prácticas que se aplican en empresas líderes.',
  },
  {
    title: 'Certificación Profesional',
    description: 'Obtén certificados de especialización reconocidos por la industria.',
  },
  {
    title: 'Flexibilidad Horaria',
    description: 'Programas presenciales, virtuales e híbridos adaptados a tu disponibilidad.',
  },
  {
    title: 'Networking Profesional',
    description: 'Conecta con profesionales de tu sector y expande tu red de contactos.',
  },
];

export function WhyChooseUsSection() {
  return (
    <div>
      <div className="mb-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-cee-red">Nuestro Valor</p>
        <h2 className="mt-2 text-2xl font-bold">¿Por qué elegirnos?</h2>
        <p className="mt-3 max-w-2xl mx-auto text-base text-muted-foreground">
          Nos diferenciamos por nuestro compromiso con tu desarrollo profesional y éxito empresarial.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason, idx) => (
          <div key={idx} className="flex gap-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-cee-red mt-1" />
            <div>
              <h3 className="font-semibold text-foreground">{reason.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{reason.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
