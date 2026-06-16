import type { Course } from '@cee/types';
import {
  instructorMendoza,
  instructorTorres,
  instructorQuispe,
  instructorParedes,
  instructorVargas,
  instructorRojas,
  instructorHuanca,
  instructorFlores,
} from './instructors.mock';

export const mockCourses: Course[] = [
  // ─── GESTIÓN ──────────────────────────────────────────────────────────────
  {
    id: 'c001',
    slug: 'gestion-proyectos-agiles',
    title: 'Gestión de Proyectos Ágiles con Scrum y Kanban',
    category: 'Gestión',
    modality: 'Virtual',
    level: 'Intermedio',
    shortDescription:
      'Domina Scrum y Kanban para liderar equipos y entregar proyectos de alto valor en entornos complejos.',
    description:
      'Programa intensivo para profesionales que buscan implementar metodologías ágiles en sus organizaciones. Aprenderás a planificar sprints, gestionar backlogs, facilitar ceremonias ágiles y medir el rendimiento del equipo con métricas clave.',
    price: 199,
    originalPrice: 249,
    imageUrl: 'https://picsum.photos/seed/gestion-proyectos-agiles/800/450',
    academicHours: 48,
    certification: 'Certificación CEE-FIIS',
    rating: 4.8,
    enrolledCount: 342,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/gestion-proyectos-agiles.pdf',
    status: 'published',
    graduateProfile: [
      'Planifica y ejecuta proyectos usando Scrum y Kanban en equipos multidisciplinarios.',
      'Facilita ceremonias ágiles (sprint planning, daily, retrospectiva) con efectividad.',
      'Gestiona el backlog priorizando valor para el negocio.',
      'Mide el desempeño del equipo con métricas como velocity y lead time.',
    ],
    syllabus: [
      {
        id: 'c001-m1',
        title: 'Módulo 1: Fundamentos de la Agilidad',
        topics: [
          'Manifiesto Ágil y sus doce principios',
          'Diferencias entre marcos ágiles y metodologías tradicionales',
          'Roles y responsabilidades en un equipo ágil',
        ],
      },
      {
        id: 'c001-m2',
        title: 'Módulo 2: Scrum en Profundidad',
        topics: [
          'Artefactos: Product Backlog, Sprint Backlog e Increment',
          'Ceremonias: Planning, Daily, Review y Retrospectiva',
          'Estimación con Story Points y Planning Poker',
          'Métricas: velocity, burndown y burnup charts',
        ],
      },
      {
        id: 'c001-m3',
        title: 'Módulo 3: Kanban y Flujo Continuo',
        topics: [
          'Principios Kanban y visualización del trabajo',
          'Límites WIP y gestión del cuello de botella',
          'Métricas de flujo: lead time, cycle time y throughput',
        ],
      },
      {
        id: 'c001-m4',
        title: 'Módulo 4: Escalado y Contexto Organizacional',
        topics: [
          'Introducción a SAFe y LeSS',
          'Ágil en organizaciones no tecnológicas',
          'Simulación de sprint completo: caso integrador',
        ],
      },
    ],
    instructors: [instructorMendoza],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Acceso de por vida al material y a sus actualizaciones',
      'Sesiones de mentoría grupal con el instructor',
    ],
    updatedAt: '2024-10-12T00:00:00Z',
    createdAt: '2024-03-01T00:00:00Z',
  },

  {
    id: 'c006',
    slug: 'marketing-digital-growth-hacking',
    title: 'Marketing Digital y Growth Hacking',
    category: 'Gestión',
    modality: 'Virtual',
    level: 'Básico',
    shortDescription:
      'Diseña campañas digitales, gestiona redes sociales y aplica técnicas de growth hacking para escalar tu negocio.',
    description:
      'Programa introductorio a las herramientas y estrategias del marketing digital. Cubre SEO, SEM, social media, email marketing y analítica web, con énfasis en medición de resultados y optimización continua.',
    price: 149,
    originalPrice: 189,
    imageUrl: 'https://picsum.photos/seed/marketing-digital-growth-hacking/800/450',
    academicHours: 36,
    certification: 'Certificación CEE-FIIS',
    rating: 4.5,
    enrolledCount: 412,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/marketing-digital-growth-hacking.pdf',
    status: 'published',
    graduateProfile: [
      'Diseña estrategias de marketing digital alineadas a los objetivos del negocio.',
      'Gestiona campañas de Google Ads y Meta Ads con foco en ROI.',
      'Aplica técnicas SEO on-page y off-page para mejorar el posicionamiento orgánico.',
      'Analiza el desempeño de campañas con Google Analytics 4 y toma decisiones basadas en datos.',
    ],
    syllabus: [
      {
        id: 'c006-m1',
        title: 'Módulo 1: Estrategia Digital y Buyer Persona',
        topics: [
          'Ecosistema digital y canales de adquisición',
          'Construcción del buyer persona y customer journey',
          'Embudo de conversión (TOFU, MOFU, BOFU)',
        ],
      },
      {
        id: 'c006-m2',
        title: 'Módulo 2: SEO y Marketing de Contenidos',
        topics: [
          'Investigación de palabras clave y análisis de competencia',
          'Optimización on-page: estructura, metadatos y velocidad',
          'Estrategia de contenidos y link building',
        ],
      },
      {
        id: 'c006-m3',
        title: 'Módulo 3: Publicidad Digital (SEM y Social Ads)',
        topics: [
          'Campañas de Google Ads: Search, Display y Shopping',
          'Meta Ads: segmentación, formatos y A/B testing',
          'Presupuesto, puja y métricas clave (CPC, CPA, ROAS)',
          'Email marketing y automatización',
        ],
      },
      {
        id: 'c006-m4',
        title: 'Módulo 4: Analítica y Growth Hacking',
        topics: [
          'Google Analytics 4: configuración e interpretación',
          'Técnicas de growth hacking y experimentos de crecimiento',
          'Dashboard de métricas y reporte para dirección',
        ],
      },
    ],
    instructors: [instructorRojas],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Créditos en Google Ads para practicar campañas reales',
      'Plantillas de estrategia digital y calendario de contenidos',
    ],
    updatedAt: '2024-07-15T00:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
  },

  // ─── TECNOLOGÍA ───────────────────────────────────────────────────────────
  {
    id: 'c002',
    slug: 'analisis-datos-negocios-python',
    title: 'Análisis de Datos para Negocios con Python',
    category: 'Tecnología',
    modality: 'Virtual',
    level: 'Intermedio',
    shortDescription:
      'Extrae, transforma y visualiza datos empresariales con Python para tomar decisiones basadas en evidencia.',
    description:
      'Curso práctico que cubre el ciclo completo del análisis de datos: desde la limpieza y exploración con pandas hasta la visualización con matplotlib y seaborn, y la comunicación de hallazgos a stakeholders no técnicos.',
    price: 249,
    originalPrice: null,
    imageUrl: 'https://picsum.photos/seed/analisis-datos-negocios-python/800/450',
    academicHours: 56,
    certification: 'Certificación CEE-FIIS',
    rating: 4.7,
    enrolledCount: 215,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/analisis-datos-negocios-python.pdf',
    status: 'published',
    graduateProfile: [
      'Importa, limpia y transforma datasets reales usando pandas y numpy.',
      'Construye visualizaciones efectivas con matplotlib, seaborn y plotly.',
      'Aplica análisis estadístico descriptivo e inferencial a problemas de negocio.',
      'Comunica hallazgos de datos a audiencias ejecutivas con dashboards claros.',
    ],
    syllabus: [
      {
        id: 'c002-m1',
        title: 'Módulo 1: Python para el Análisis de Datos',
        topics: [
          'Entorno de trabajo: Jupyter, Google Colab y VSCode',
          'Estructuras de datos: listas, diccionarios, DataFrames',
          'Fundamentos de numpy para cálculo vectorizado',
        ],
      },
      {
        id: 'c002-m2',
        title: 'Módulo 2: Manipulación de Datos con pandas',
        topics: [
          'Carga de datos: CSV, Excel y bases de datos SQL',
          'Limpieza: valores nulos, duplicados y outliers',
          'Agrupaciones, pivots y merge de DataFrames',
          'Manejo de series temporales',
        ],
      },
      {
        id: 'c002-m3',
        title: 'Módulo 3: Visualización y Storytelling con Datos',
        topics: [
          'Principios de visualización efectiva',
          'Gráficos estadísticos con seaborn y matplotlib',
          'Dashboards interactivos con plotly y Streamlit',
        ],
      },
      {
        id: 'c002-m4',
        title: 'Módulo 4: Proyecto Final de Análisis',
        topics: [
          'Análisis exploratorio de un dataset empresarial real',
          'Identificación de insights accionables',
          'Presentación ejecutiva de resultados',
        ],
      },
    ],
    instructors: [instructorTorres],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Dataset real de empresa peruana para el proyecto final',
      'Foro de consultas activo durante 6 meses post-curso',
    ],
    updatedAt: '2024-09-20T00:00:00Z',
    createdAt: '2024-04-10T00:00:00Z',
  },

  {
    id: 'c007',
    slug: 'machine-learning-industria',
    title: 'Machine Learning Aplicado a la Industria',
    category: 'Tecnología',
    modality: 'Virtual',
    level: 'Avanzado',
    shortDescription:
      'Implementa modelos de ML para resolver problemas reales de predicción, clasificación y optimización industrial.',
    description:
      'Programa avanzado para ingenieros y analistas con experiencia en Python que buscan aplicar ML en contextos industriales: mantenimiento predictivo, control de calidad, pronóstico de demanda y optimización de procesos.',
    price: 349,
    originalPrice: 420,
    imageUrl: 'https://picsum.photos/seed/machine-learning-industria/800/450',
    academicHours: 72,
    certification: 'Certificación CEE-FIIS',
    rating: 0,
    enrolledCount: 0,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/machine-learning-industria.pdf',
    status: 'draft',
    graduateProfile: [
      'Construye y evalúa modelos supervisados (regresión, clasificación) con scikit-learn.',
      'Aplica modelos de series temporales para pronóstico de demanda y producción.',
      'Implementa pipelines de ML reproducibles listos para entornos de producción.',
      'Interpreta y comunica resultados de modelos a audiencias no técnicas.',
    ],
    syllabus: [
      {
        id: 'c007-m1',
        title: 'Módulo 1: Fundamentos de Machine Learning',
        topics: [
          'Tipos de aprendizaje: supervisado, no supervisado y por refuerzo',
          'Flujo de trabajo de un proyecto de ML (CRISP-DM)',
          'Preprocesamiento: encoding, escalado e imputación',
          'Evaluación de modelos: métricas y validación cruzada',
        ],
      },
      {
        id: 'c007-m2',
        title: 'Módulo 2: Modelos Supervisados',
        topics: [
          'Regresión lineal, Ridge y Lasso para pronósticos',
          'Árboles de decisión, Random Forest y Gradient Boosting',
          'Clasificación: SVM y regresión logística aplicada a control de calidad',
        ],
      },
      {
        id: 'c007-m3',
        title: 'Módulo 3: Series Temporales y Pronóstico de Demanda',
        topics: [
          'Modelos clásicos: ARIMA y SARIMA',
          'Modelos basados en ML para series temporales',
          'Caso práctico: pronóstico en cadena de suministro',
        ],
      },
      {
        id: 'c007-m4',
        title: 'Módulo 4: MLOps y Despliegue en Producción',
        topics: [
          'Pipelines con scikit-learn y MLflow',
          'Versionado de modelos y monitoreo de drift',
          'Despliegue con FastAPI y contenedores Docker',
          'Proyecto final: sistema de mantenimiento predictivo',
        ],
      },
    ],
    instructors: [instructorHuanca, instructorTorres],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Datasets industriales reales de manufactura y logística',
      'Acceso al servidor GPU del laboratorio de IA de la FIIS',
    ],
    updatedAt: '2024-11-28T00:00:00Z',
    createdAt: '2024-07-01T00:00:00Z',
  },

  // ─── FINANZAS ─────────────────────────────────────────────────────────────
  {
    id: 'c003',
    slug: 'finanzas-corporativas-avanzadas',
    title: 'Finanzas Corporativas Avanzadas',
    category: 'Finanzas',
    modality: 'Presencial',
    level: 'Avanzado',
    shortDescription:
      'Domina la valorización de empresas, la estructura de capital y las decisiones de inversión en contextos de alta incertidumbre.',
    description:
      'Programa dirigido a directivos y gerentes financieros que buscan profundizar en valorización por descuento de flujos, opciones reales, M&A y estructuración de deuda corporativa en el mercado peruano.',
    price: 320,
    originalPrice: 380,
    imageUrl: 'https://picsum.photos/seed/finanzas-corporativas-avanzadas/800/450',
    academicHours: 64,
    certification: 'Certificación CEE-FIIS',
    rating: 0,
    enrolledCount: 0,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/finanzas-corporativas-avanzadas.pdf',
    status: 'draft',
    graduateProfile: [
      'Valora empresas mediante DCF, múltiplos de mercado y opciones reales.',
      'Diseña la estructura óptima de capital para maximizar el valor del accionista.',
      'Evalúa proyectos de inversión bajo incertidumbre con análisis de riesgo.',
      'Analiza operaciones de fusión, adquisición y due diligence financiero.',
    ],
    syllabus: [
      {
        id: 'c003-m1',
        title: 'Módulo 1: Valorización de Empresas',
        topics: [
          'Métodos de valorización: DCF, múltiplos y valor en libros',
          'Estimación del WACC en mercados emergentes',
          'Modelo de opciones reales (ROV)',
          'Casos: empresas listadas en la BVL',
        ],
      },
      {
        id: 'c003-m2',
        title: 'Módulo 2: Estructura de Capital y Financiamiento',
        topics: [
          'Teorías de estructura de capital: Modigliani-Miller y trade-off',
          'Instrumentos de deuda: bonos, préstamos y leasing',
          'Emisiones de acciones y mercado de capitales peruano',
        ],
      },
      {
        id: 'c003-m3',
        title: 'Módulo 3: Decisiones de Inversión',
        topics: [
          'Evaluación de proyectos: VPN, TIR y período de recupero',
          'Análisis de sensibilidad y simulación Monte Carlo',
          'Racionamiento de capital y portafolio de proyectos',
        ],
      },
      {
        id: 'c003-m4',
        title: 'Módulo 4: Fusiones, Adquisiciones y Reestructuración',
        topics: [
          'Motivaciones estratégicas del M&A',
          'Proceso de due diligence financiero',
          'Estructuración del deal y mecanismos de pago',
          'Integración post-fusión y creación de valor',
        ],
      },
    ],
    instructors: [instructorQuispe],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Casos reales de empresas peruanas y latinoamericanas',
      'Networking con directivos financieros del sector privado',
    ],
    updatedAt: '2024-11-05T00:00:00Z',
    createdAt: '2024-05-15T00:00:00Z',
  },

  {
    id: 'c009',
    slug: 'gestion-financiera-no-financieros',
    title: 'Gestión Financiera para No Financieros',
    category: 'Finanzas',
    modality: 'Híbrido',
    level: 'Básico',
    shortDescription:
      'Interpreta estados financieros, gestiona presupuestos y toma decisiones de negocio con fundamentos financieros sólidos.',
    description:
      'Diseñado para directivos y profesionales sin formación contable que necesitan leer e interpretar información financiera para tomar mejores decisiones en sus áreas de responsabilidad.',
    price: 159,
    originalPrice: 199,
    imageUrl: 'https://picsum.photos/seed/gestion-financiera-no-financieros/800/450',
    academicHours: 36,
    certification: 'Certificación CEE-FIIS',
    rating: 4.6,
    enrolledCount: 523,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/gestion-financiera-no-financieros.pdf',
    status: 'published',
    graduateProfile: [
      'Lee e interpreta los tres estados financieros clave: balance, resultados y flujo de caja.',
      'Elabora y controla presupuestos operativos alineados a la estrategia.',
      'Evalúa la rentabilidad y viabilidad financiera de proyectos e iniciativas.',
      'Toma decisiones fundamentadas en indicadores financieros (ROE, ROI, EBITDA).',
    ],
    syllabus: [
      {
        id: 'c009-m1',
        title: 'Módulo 1: Contabilidad y Estados Financieros',
        topics: [
          'El lenguaje de los negocios: activos, pasivos y patrimonio',
          'Estado de resultados: ingresos, costos y utilidades',
          'Balance general y flujo de caja libre',
        ],
      },
      {
        id: 'c009-m2',
        title: 'Módulo 2: Análisis e Indicadores Financieros',
        topics: [
          'Ratios de liquidez, endeudamiento y rentabilidad',
          'EBITDA, ROE, ROI y su interpretación gerencial',
          'Análisis comparativo: benchmarking sectorial',
        ],
      },
      {
        id: 'c009-m3',
        title: 'Módulo 3: Presupuesto y Control de Gestión',
        topics: [
          'Elaboración del presupuesto operativo anual',
          'Control presupuestal y análisis de variaciones',
          'Cuadro de mando integral (BSC) financiero',
          'Caso integrador: diagnóstico financiero de empresa peruana',
        ],
      },
    ],
    instructors: [instructorQuispe],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Plantillas Excel de estados financieros y tablero de KPIs',
      'Casos reales de empresas del mercado peruano',
    ],
    updatedAt: '2024-09-05T00:00:00Z',
    createdAt: '2024-03-15T00:00:00Z',
  },

  // ─── HABILIDADES BLANDAS ──────────────────────────────────────────────────
  {
    id: 'c004',
    slug: 'liderazgo-habilidades-directivas',
    title: 'Liderazgo y Habilidades Directivas',
    category: 'Habilidades Blandas',
    modality: 'Híbrido',
    level: 'Intermedio',
    shortDescription:
      'Desarrolla las competencias directivas para inspirar equipos, gestionar conflictos y liderar el cambio organizacional.',
    description:
      'Programa para jefes, supervisores y profesionales en transición a roles de liderazgo. Combina liderazgo situacional con práctica intensiva mediante role plays, feedback 360° y coaching grupal.',
    price: 179,
    originalPrice: null,
    imageUrl: 'https://picsum.photos/seed/liderazgo-habilidades-directivas/800/450',
    academicHours: 40,
    certification: 'Certificación CEE-FIIS',
    rating: 4.6,
    enrolledCount: 287,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/liderazgo-habilidades-directivas.pdf',
    status: 'published',
    graduateProfile: [
      'Adapta su estilo de liderazgo al nivel de madurez y motivación del colaborador.',
      'Facilita conversaciones difíciles y gestiona conflictos con técnicas probadas.',
      'Diseña planes de desarrollo y feedback continuo para su equipo.',
      'Lidera procesos de cambio organizacional minimizando la resistencia.',
    ],
    syllabus: [
      {
        id: 'c004-m1',
        title: 'Módulo 1: Autoconocimiento y Estilos de Liderazgo',
        topics: [
          'Liderazgo situacional, transformacional y servant leadership',
          'Evaluación de estilo personal con herramienta DISC',
          'Inteligencia emocional aplicada al liderazgo',
        ],
      },
      {
        id: 'c004-m2',
        title: 'Módulo 2: Comunicación y Feedback',
        topics: [
          'Comunicación asertiva y escucha activa',
          'Modelo SBI para dar y recibir feedback efectivo',
          'Conversaciones difíciles: técnica DESC',
          'Presentaciones ejecutivas de alto impacto',
        ],
      },
      {
        id: 'c004-m3',
        title: 'Módulo 3: Gestión de Equipos de Alto Desempeño',
        topics: [
          'Etapas de desarrollo del equipo (modelo Tuckman)',
          'Delegación efectiva y empowerment',
          'Gestión de conflictos y negociación intraequipo',
        ],
      },
      {
        id: 'c004-m4',
        title: 'Módulo 4: Liderazgo del Cambio',
        topics: [
          'Modelo de cambio de Kotter (8 pasos)',
          'Gestión de la resistencia al cambio',
          'Proyecto integrador: plan de liderazgo personal',
        ],
      },
    ],
    instructors: [instructorParedes],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Evaluación DISC incluida y sesión de debriefing personalizado',
      'Acceso a red de alumni de directivos CEE-FIIS',
    ],
    updatedAt: '2024-08-30T00:00:00Z',
    createdAt: '2024-02-20T00:00:00Z',
  },

  {
    id: 'c008',
    slug: 'comunicacion-ejecutiva-oratoria',
    title: 'Comunicación Ejecutiva y Oratoria de Alto Impacto',
    category: 'Habilidades Blandas',
    modality: 'Virtual',
    level: 'Básico',
    shortDescription:
      'Desarrolla confianza y claridad al hablar en público y comunicar mensajes ejecutivos con impacto.',
    description:
      'Programa práctico con enfoque en la oratoria aplicada al mundo profesional. A través de grabaciones, retroalimentación personalizada y storytelling, aprenderás a estructurar y entregar mensajes que persuaden y movilizan a tu audiencia.',
    price: 129,
    originalPrice: null,
    imageUrl: 'https://picsum.photos/seed/comunicacion-ejecutiva-oratoria/800/450',
    academicHours: 32,
    certification: 'Certificación CEE-FIIS',
    rating: 4.5,
    enrolledCount: 378,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/comunicacion-ejecutiva-oratoria.pdf',
    status: 'published',
    graduateProfile: [
      'Estructura mensajes ejecutivos claros con el método SCQA y la pirámide de Minto.',
      'Gestiona el lenguaje corporal, la voz y el contacto visual en presentaciones.',
      'Aplica técnicas de storytelling para conectar emocionalmente con la audiencia.',
      'Responde con confianza preguntas difíciles en exposiciones de alto nivel.',
    ],
    syllabus: [
      {
        id: 'c008-m1',
        title: 'Módulo 1: Fundamentos de la Comunicación Ejecutiva',
        topics: [
          'Comunicación verbal, no verbal y paraverbal',
          'El modelo SCQA para estructurar mensajes',
          'Diagnóstico de estilo comunicativo personal',
        ],
      },
      {
        id: 'c008-m2',
        title: 'Módulo 2: Presencia y Manejo del Escenario',
        topics: [
          'Control de la voz: dicción, ritmo y énfasis',
          'Lenguaje corporal y gesticulación efectiva',
          'Gestión del nerviosismo y la ansiedad escénica',
          'Taller de oratoria: exposición grabada y feedback',
        ],
      },
      {
        id: 'c008-m3',
        title: 'Módulo 3: Storytelling y Diseño de Presentaciones',
        topics: [
          'Estructura narrativa: inicio, conflicto y resolución',
          'Diseño de slides ejecutivos con la pirámide de Minto',
          'Uso de datos y visualizaciones en presentaciones',
          'Pitch de proyecto: presentación final de 5 minutos',
        ],
      },
    ],
    instructors: [instructorFlores, instructorParedes],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Grabación y análisis de videofeedback personalizado',
      'Biblioteca de plantillas de presentaciones ejecutivas',
    ],
    updatedAt: '2024-06-10T00:00:00Z',
    createdAt: '2024-01-25T00:00:00Z',
  },

  // ─── INGENIERÍA ───────────────────────────────────────────────────────────
  {
    id: 'c005',
    slug: 'ingenieria-procesos-lean-manufacturing',
    title: 'Ingeniería de Procesos y Lean Manufacturing',
    category: 'Ingeniería',
    modality: 'Presencial',
    level: 'Avanzado',
    shortDescription:
      'Optimiza procesos productivos eliminando desperdicios con las herramientas del Lean Manufacturing y Six Sigma.',
    description:
      'Programa técnico-gerencial para ingenieros y líderes de operaciones que buscan implementar mejora continua en planta. Cubre value stream mapping, 5S, SMED, control estadístico de procesos y proyectos de reducción de costos.',
    price: 289,
    originalPrice: null,
    imageUrl: 'https://picsum.photos/seed/ingenieria-procesos-lean-manufacturing/800/450',
    academicHours: 60,
    certification: 'Certificación CEE-FIIS',
    rating: 4.7,
    enrolledCount: 134,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/ingenieria-procesos-lean-manufacturing.pdf',
    status: 'review',
    graduateProfile: [
      'Mapea y analiza flujos de valor (VSM) identificando desperdicios críticos.',
      'Implementa herramientas Lean: 5S, SMED, Poka-Yoke y TPM.',
      'Aplica control estadístico de procesos (SPC) para reducir variabilidad.',
      'Lidera proyectos de mejora continua con metodología DMAIC.',
    ],
    syllabus: [
      {
        id: 'c005-m1',
        title: 'Módulo 1: Filosofía Lean y Pensamiento de Sistemas',
        topics: [
          'Historia y principios del Sistema Toyota de Producción',
          'Los 8 desperdicios (MUDA) y cómo identificarlos',
          'Value Stream Mapping (VSM): estado actual y futuro',
        ],
      },
      {
        id: 'c005-m2',
        title: 'Módulo 2: Herramientas Lean Operativas',
        topics: [
          '5S: implementación y auditoría',
          'SMED: reducción de tiempos de cambio',
          'Poka-Yoke y sistemas a prueba de error',
          'TPM: mantenimiento productivo total',
        ],
      },
      {
        id: 'c005-m3',
        title: 'Módulo 3: Control Estadístico de Procesos',
        topics: [
          'Cartas de control: X-barra, R y P',
          'Análisis de capacidad de proceso (Cp, Cpk)',
          'Introducción a Six Sigma y metodología DMAIC',
        ],
      },
      {
        id: 'c005-m4',
        title: 'Módulo 4: Proyecto de Mejora en Planta',
        topics: [
          'Selección y definición del problema (fase Define)',
          'Recolección y análisis de datos del proceso',
          'Implementación de mejoras y control de resultados',
        ],
      },
    ],
    instructors: [instructorVargas],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Visita técnica a planta industrial incluida',
      'Kit de herramientas VSM y plantillas de auditoría 5S',
    ],
    updatedAt: '2024-11-20T00:00:00Z',
    createdAt: '2024-06-01T00:00:00Z',
  },

  {
    id: 'c010',
    slug: 'transformacion-digital-industria-40',
    title: 'Transformación Digital e Industria 4.0',
    category: 'Ingeniería',
    modality: 'Híbrido',
    level: 'Intermedio',
    shortDescription:
      'Lidera la hoja de ruta de transformación digital de tu organización integrando IoT, automatización y analítica avanzada.',
    description:
      'Programa para ingenieros y directivos que buscan comprender y liderar la adopción de tecnologías de la Industria 4.0: IoT industrial, gemelos digitales, automatización robótica de procesos (RPA) y analítica en tiempo real.',
    price: 219,
    originalPrice: null,
    imageUrl: 'https://picsum.photos/seed/transformacion-digital-industria-40/800/450',
    academicHours: 44,
    certification: 'Certificación CEE-FIIS',
    rating: 0,
    enrolledCount: 0,
    moodleCourseId: null,
    syllabusPdfUrl: '/syllabi/transformacion-digital-industria-40.pdf',
    status: 'review',
    graduateProfile: [
      'Diseña hojas de ruta de transformación digital adaptadas a la realidad de su industria.',
      'Evalúa y selecciona tecnologías 4.0 (IoT, RPA, IA) con criterios técnicos y financieros.',
      'Gestiona proyectos de implementación tecnológica con foco en gestión del cambio.',
      'Construye indicadores de madurez digital y monitorea el progreso de la transformación.',
    ],
    syllabus: [
      {
        id: 'c010-m1',
        title: 'Módulo 1: El Paradigma de la Industria 4.0',
        topics: [
          'De la Industria 3.0 a la 4.0: evolución y contexto global',
          'Tecnologías habilitadoras: IoT, Big Data, IA, Cloud y Blockchain',
          'Casos de éxito en manufactura, logística y servicios',
        ],
      },
      {
        id: 'c010-m2',
        title: 'Módulo 2: IoT Industrial y Gemelos Digitales',
        topics: [
          'Arquitectura de soluciones IoT: sensores, gateways y plataformas',
          'Gemelos digitales: concepto, aplicaciones y ROI',
          'Plataformas IIoT: AWS IoT, Azure IoT Hub y PTC ThingWorx',
        ],
      },
      {
        id: 'c010-m3',
        title: 'Módulo 3: Automatización y RPA',
        topics: [
          'Automatización robótica de procesos (RPA) con UiPath',
          'Identificación de procesos candidatos a automatización',
          'Integración de RPA con sistemas ERP y CRM',
        ],
      },
      {
        id: 'c010-m4',
        title: 'Módulo 4: Hoja de Ruta de Transformación Digital',
        topics: [
          'Diagnóstico de madurez digital (modelo CMMI-Digital)',
          'Diseño de la hoja de ruta y priorización de iniciativas',
          'Gestión del cambio tecnológico y cultura de innovación',
          'Proyecto final: plan de transformación digital sectorial',
        ],
      },
    ],
    instructors: [instructorVargas, instructorHuanca],
    benefits: [
      'Certificado a nombre de la FIIS-UNI avalado por el CEE',
      'Acceso al laboratorio de IoT y automatización de la FIIS',
      'Plantilla de diagnóstico y hoja de ruta digital descargable',
    ],
    updatedAt: '2024-10-30T00:00:00Z',
    createdAt: '2024-08-01T00:00:00Z',
  },
];
