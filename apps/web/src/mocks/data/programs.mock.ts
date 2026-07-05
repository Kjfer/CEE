import type { Program } from '@cee/types';

export const mockPrograms: Program[] = [
  {
    id: 'p001',
    slug: 'diploma-liderazgo-gestion',
    title: 'Diploma en Liderazgo y Gestión Ejecutiva',
    category: 'Gestión',
    modality: 'Híbrido',
    level: 'Avanzado',
    shortDescription:
      'Programa integral que combina liderazgo directivo, gestión ágil y finanzas corporativas para formar ejecutivos de alto impacto.',
    description:
      'Este diploma está diseñado para profesionales que buscan consolidar competencias de liderazgo, gestión de proyectos y toma de decisiones financieras. A lo largo de tres módulos secuenciales desarrollarás habilidades directivas, metodologías ágiles y criterio financiero aplicado al negocio.',
    price: 549,
    originalPrice: 699,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=75',
    startDate: '2026-08-01',
    durationWeeks: 16,
    scheduleDescription: 'Sesiones los sábados 9:00 - 13:00',
    academicHours: 144,
    certification: 'Diploma CEE-FIIS',
    rating: 4.9,
    enrolledCount: 128,
    syllabusPdfUrl: '',
    status: 'published',
    graduateProfile: [
      'Liderar equipos multidisciplinarios con enfoque estratégico y humano.',
      'Gestionar proyectos complejos con metodologías ágiles probadas.',
      'Tomar decisiones financieras informadas en contextos corporativos reales.',
    ],
    benefits: [
      'Comprender los fundamentos del liderazgo transformacional.',
      'Aplicar Scrum y Kanban en proyectos reales de la organización.',
      'Interpretar estados financieros y evaluar inversiones estratégicas.',
    ],
    syllabus: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

/** Vínculos programa → cursos (orden = índice + 1). */
export const mockProgramModulesByProgramId: { programId: string; courseIds: string[] }[] = [
  {
    programId: 'p001',
    courseIds: ['c004', 'c001', 'c003'],
  },
];
