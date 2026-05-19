import type { RiasecCategory } from '@/types/chat';
import type { VocationalDomain } from '@/types/vocational-domain';

type RiasecProfileKey = Exclude<RiasecCategory, 'NONE'>;
type TraitLevel = 1 | 2 | 3 | 4 | 5;

export interface CareerTraits {
  analytical: TraitLevel;
  creativity: TraitLevel;
  social: TraitLevel;
  technical: TraitLevel;
}

export interface RiasecCareerDetail {
  name: string;
  description: string;
  riasecProfiles: RiasecProfileKey[];
  domains: VocationalDomain[];
  traits: CareerTraits;
}

interface RiasecCareerDetailBase {
  name: string;
  description: string;
}

export interface RiasecProfile {
  title: string;
  description: string;
  descriptions: string[];
  careers: string[];
  careerDetails: RiasecCareerDetail[];
}

interface RiasecProfileBase {
  title: string;
  description: string;
  descriptions: string[];
  careers: string[];
  careerDetails: RiasecCareerDetailBase[];
}

const PROFILE_DOMAIN_MAP: Record<RiasecProfileKey, VocationalDomain[]> = {
  R: ['ENGINEERING', 'TECH'],
  I: ['SCIENCE', 'DATA'],
  A: ['ARTS', 'DESIGN'],
  S: ['HEALTH', 'EDUCATION'],
  E: ['BUSINESS', 'COMMUNICATION'],
  C: ['BUSINESS', 'DATA'],
};

const PROFILE_TRAITS_MAP: Record<RiasecProfileKey, CareerTraits> = {
  R: { analytical: 3, creativity: 2, social: 2, technical: 5 },
  I: { analytical: 5, creativity: 3, social: 2, technical: 4 },
  A: { analytical: 2, creativity: 5, social: 3, technical: 3 },
  S: { analytical: 3, creativity: 3, social: 5, technical: 2 },
  E: { analytical: 4, creativity: 4, social: 4, technical: 3 },
  C: { analytical: 5, creativity: 2, social: 2, technical: 3 },
};

const CAREER_METADATA_OVERRIDES: Partial<
  Record<
    string,
    {
      riasecProfiles?: RiasecProfileKey[];
      domains?: VocationalDomain[];
      traits?: CareerTraits;
    }
  >
> = {
  'Desarrollo de Software': {
    riasecProfiles: ['I', 'C'],
    domains: ['TECH', 'SOFTWARE'],
    traits: {
      analytical: 5,
      creativity: 4,
      social: 2,
      technical: 5,
    },
  },
};

function toCareerDetail(
  profileKey: RiasecProfileKey,
  career: RiasecCareerDetailBase
): RiasecCareerDetail {
  const metadataOverride = CAREER_METADATA_OVERRIDES[career.name];

  return {
    ...career,
    riasecProfiles: metadataOverride?.riasecProfiles ?? [profileKey],
    domains: metadataOverride?.domains ?? PROFILE_DOMAIN_MAP[profileKey],
    traits: metadataOverride?.traits ?? PROFILE_TRAITS_MAP[profileKey],
  };
}

const baseRiasecDictionary: Record<RiasecProfileKey, RiasecProfileBase> = {
  R: {
    title: 'Realista (Hacedor)',
    description: 'Te orientas a resolver problemas concretos con acción, herramientas y resultados visibles. Valoras la eficiencia, la técnica y el trabajo aplicado.',
    descriptions: [
      'Este perfil suele destacar en actividades prácticas donde hay que construir, reparar, operar o mejorar procesos físicos. Prefiere aprender haciendo y ver resultados tangibles.',
      'Las personas realistas valoran los entornos estructurados, con objetivos claros, procedimientos técnicos y retos operativos que requieran precisión y constancia.',
      'Tienden a sentirse cómodas con maquinaria, sistemas, trabajo de campo, tecnología aplicada, logística o tareas que combinan coordinación y ejecución.',
      'Su motivación principal suele estar en producir soluciones concretas, optimizar recursos y aportar valor a través de habilidades técnicas confiables.',
    ],
    careers: [
      'Ingeniería Civil',
      'Ingeniería Mecánica',
      'Arquitectura Técnica',
      'Mantenimiento Industrial',
      'Electromecánica',
      'Automatización y Control',
      'Agronomía',
      'Veterinaria de Campo',
      'Topografía',
      'Logística Operativa',
      'Informática de Sistemas',
      'Seguridad Industrial',
    ],
    careerDetails: [
      {
        name: 'Ingeniería Civil',
        description: 'Diseña y ejecuta obras de infraestructura como carreteras, puentes y edificaciones, combinando cálculo, materiales y supervisión en terreno.',
      },
      {
        name: 'Ingeniería Mecánica',
        description: 'Desarrolla, optimiza y mantiene sistemas mecánicos en industria, transporte y manufactura, con fuerte base en física aplicada.',
      },
      {
        name: 'Arquitectura Técnica',
        description: 'Coordina aspectos técnicos y constructivos de proyectos de edificación, asegurando calidad, seguridad y cumplimiento de normativas.',
      },
      {
        name: 'Mantenimiento Industrial',
        description: 'Garantiza el funcionamiento de equipos y líneas de producción mediante diagnóstico, prevención de fallas y mejora continua.',
      },
      {
        name: 'Electromecánica',
        description: 'Integra conocimientos eléctricos y mecánicos para instalar, ajustar y reparar maquinaria en entornos productivos.',
      },
      {
        name: 'Automatización y Control',
        description: 'Implementa sistemas automatizados con sensores, PLC y control de procesos para aumentar eficiencia y confiabilidad operativa.',
      },
      {
        name: 'Agronomía',
        description: 'Planifica y mejora sistemas de producción agrícola, considerando suelos, cultivos, clima, productividad y sostenibilidad.',
      },
      {
        name: 'Veterinaria de Campo',
        description: 'Atiende salud animal en entornos productivos, con enfoque en prevención, manejo sanitario y bienestar de especies.',
      },
      {
        name: 'Topografía',
        description: 'Realiza levantamientos y análisis del terreno para proyectos de construcción, minería e infraestructura territorial.',
      },
      {
        name: 'Logística Operativa',
        description: 'Organiza movimientos de materiales, rutas y recursos físicos para asegurar operaciones eficientes y entregas oportunas.',
      },
      {
        name: 'Informática de Sistemas',
        description: 'Administra infraestructura tecnológica, redes y plataformas para mantener estabilidad, rendimiento y soporte técnico.',
      },
      {
        name: 'Seguridad Industrial',
        description: 'Diseña e implementa medidas de prevención de riesgos para proteger personas, equipos y procesos en ambientes técnicos.',
      },
    ],
  },
  I: {
    title: 'Investigador (Pensador)',
    description: 'Te impulsa comprender a profundidad, analizar evidencia y resolver problemas complejos con método, lógica y pensamiento crítico.',
    descriptions: [
      'Este perfil se orienta a la exploración intelectual, la formulación de hipótesis y la búsqueda de explicaciones rigurosas sobre fenómenos técnicos o científicos.',
      'Suele preferir entornos donde se valora la autonomía, la investigación, la lectura analítica y la toma de decisiones basada en datos verificables.',
      'Las personas investigadoras disfrutan descomponer problemas, modelar escenarios, experimentar y mejorar soluciones a partir de evidencia.',
      'Su motivación central está en aprender continuamente, profundizar en conceptos abstractos y generar conocimiento con impacto real.',
    ],
    careers: [
      'Investigación Científica',
      'Medicina',
      'Bioinformática',
      'Desarrollo de Software',
      'Ciencia de Datos',
      'Matemáticas Aplicadas',
      'Biotecnología',
      'Física',
      'Química Analítica',
      'Epidemiología',
      'Neurociencia',
      'Ciberseguridad',
    ],
    careerDetails: [
      {
        name: 'Investigación Científica',
        description: 'Diseña estudios, experimenta y publica hallazgos para ampliar el conocimiento en áreas como salud, tecnología o ambiente.',
      },
      {
        name: 'Medicina',
        description: 'Diagnostica y trata condiciones de salud combinando razonamiento clínico, actualización constante y toma de decisiones basada en evidencia.',
      },
      {
        name: 'Bioinformática',
        description: 'Aplica programación y estadística al análisis de datos biológicos para apoyar investigación genética, molecular y biomédica.',
      },
      {
        name: 'Desarrollo de Software',
        description: 'Construye soluciones digitales mediante diseño lógico, modelado de sistemas y resolución estructurada de problemas.',
      },
      {
        name: 'Ciencia de Datos',
        description: 'Extrae patrones y conocimiento de grandes volúmenes de datos para apoyar decisiones estratégicas con modelos analíticos.',
      },
      {
        name: 'Matemáticas Aplicadas',
        description: 'Formula modelos cuantitativos para resolver problemas de ingeniería, finanzas, logística o investigación tecnológica.',
      },
      {
        name: 'Biotecnología',
        description: 'Desarrolla soluciones en salud, alimentos o industria usando procesos biológicos y técnicas de laboratorio avanzadas.',
      },
      {
        name: 'Física',
        description: 'Estudia principios fundamentales de la materia y la energía para aplicaciones en investigación, tecnología y desarrollo experimental.',
      },
      {
        name: 'Química Analítica',
        description: 'Identifica y cuantifica compuestos para control de calidad, investigación y evaluación de materiales en distintos sectores.',
      },
      {
        name: 'Epidemiología',
        description: 'Analiza patrones de salud en poblaciones para prevenir enfermedades y orientar políticas sanitarias basadas en datos.',
      },
      {
        name: 'Neurociencia',
        description: 'Investiga el funcionamiento del sistema nervioso para comprender conducta, cognición y trastornos neurológicos.',
      },
      {
        name: 'Ciberseguridad',
        description: 'Evalúa vulnerabilidades y diseña estrategias de defensa digital para proteger sistemas, redes y datos sensibles.',
      },
    ],
  },
  A: {
    title: 'Artístico (Creador)',
    description: 'Buscas expresar ideas y emociones con originalidad, sensibilidad estética y libertad creativa en proyectos con identidad propia.',
    descriptions: [
      'Este perfil destaca en espacios donde se valora la imaginación, la experimentación y la construcción de propuestas visuales, sonoras o narrativas.',
      'Las personas artísticas suelen sentirse más cómodas en entornos flexibles, con margen para explorar estilos, conceptos y enfoques no convencionales.',
      'Tienen facilidad para observar matices, conectar con lo simbólico y transformar experiencias en piezas con impacto cultural o comunicativo.',
      'Su motivación principal está en crear significado, innovar en formas de expresión y aportar valor a través de la creatividad aplicada.',
    ],
    careers: [
      'Diseño Gráfico',
      'Dirección de Arte',
      'Ilustración',
      'Animación Digital',
      'Diseño UX/UI',
      'Bellas Artes',
      'Literatura y Edición',
      'Producción Musical',
      'Artes Escénicas',
      'Cine y Audiovisuales',
      'Fotografía',
      'Publicidad Creativa',
    ],
    careerDetails: [
      {
        name: 'Diseño Gráfico',
        description: 'Crea piezas visuales para comunicar mensajes de marca, producto o cultura mediante tipografía, color y composición.',
      },
      {
        name: 'Dirección de Arte',
        description: 'Define conceptos estéticos y coordina equipos creativos para mantener coherencia visual en campañas y producciones.',
      },
      {
        name: 'Ilustración',
        description: 'Desarrolla imágenes originales para libros, medios digitales, publicidad o contenido editorial con estilo propio.',
      },
      {
        name: 'Animación Digital',
        description: 'Diseña narrativas en movimiento para cine, videojuegos, educación o contenidos interactivos.',
      },
      {
        name: 'Diseño UX/UI',
        description: 'Combina creatividad y usabilidad para construir experiencias digitales intuitivas, atractivas y centradas en personas.',
      },
      {
        name: 'Bellas Artes',
        description: 'Produce obra artística en distintos formatos para expresión cultural, investigación estética y circulación en espacios creativos.',
      },
      {
        name: 'Literatura y Edición',
        description: 'Escribe, corrige y estructura contenidos narrativos o informativos con enfoque en calidad expresiva y coherencia.',
      },
      {
        name: 'Producción Musical',
        description: 'Compone, arregla y produce piezas sonoras integrando creatividad, técnica de audio y lenguaje musical.',
      },
      {
        name: 'Artes Escénicas',
        description: 'Interpreta o crea propuestas teatrales y performáticas que articulan expresión corporal, voz y narrativa.',
      },
      {
        name: 'Cine y Audiovisuales',
        description: 'Desarrolla proyectos de guion, dirección o montaje para contar historias con impacto visual y emocional.',
      },
      {
        name: 'Fotografía',
        description: 'Construye relatos visuales mediante técnica de captura, edición y dirección de mirada en contextos artísticos o comerciales.',
      },
      {
        name: 'Publicidad Creativa',
        description: 'Genera conceptos y campañas innovadoras para conectar marcas con audiencias de forma memorable y diferencial.',
      },
    ],
  },
  S: {
    title: 'Social (Ayudador)',
    description: 'Te mueve acompañar, enseñar y apoyar a otras personas, construyendo relaciones de confianza con empatía y comunicación efectiva.',
    descriptions: [
      'Este perfil se orienta al trabajo humano directo, especialmente en contextos donde escuchar, orientar y facilitar el desarrollo de otros es clave.',
      'Las personas sociales suelen destacar en roles colaborativos, con enfoque en bienestar, aprendizaje, inclusión y resolución pacífica de conflictos.',
      'Tienen sensibilidad para identificar necesidades emocionales o formativas y traducirlas en acciones concretas de apoyo o intervención.',
      'Su motivación principal está en generar impacto positivo en comunidades, equipos o individuos a través del servicio y la cooperación.',
    ],
    careers: [
      'Psicología',
      'Enfermería',
      'Medicina Familiar',
      'Educación y Docencia',
      'Pedagogía',
      'Trabajo Social',
      'Terapia Ocupacional',
      'Fisioterapia',
      'Orientación Vocacional',
      'Recursos Humanos',
      'Mediación Comunitaria',
      'Fonoaudiología',
    ],
    careerDetails: [
      {
        name: 'Psicología',
        description: 'Evalúa y acompaña procesos emocionales y conductuales para promover salud mental y bienestar en diferentes poblaciones.',
      },
      {
        name: 'Enfermería',
        description: 'Brinda cuidado integral a pacientes con enfoque técnico y humano, participando activamente en prevención y recuperación.',
      },
      {
        name: 'Medicina Familiar',
        description: 'Atiende personas y familias de manera continua, integrando prevención, diagnóstico temprano y educación en salud.',
      },
      {
        name: 'Educación y Docencia',
        description: 'Diseña y facilita procesos de aprendizaje para desarrollar competencias académicas, sociales y personales.',
      },
      {
        name: 'Pedagogía',
        description: 'Planifica estrategias educativas y mejora prácticas de enseñanza para distintos niveles y contextos formativos.',
      },
      {
        name: 'Trabajo Social',
        description: 'Interviene en problemáticas sociales para fortalecer redes de apoyo y acceso a derechos en comunidades vulnerables.',
      },
      {
        name: 'Terapia Ocupacional',
        description: 'Diseña actividades terapéuticas para mejorar autonomía, funcionalidad y calidad de vida en distintos grupos.',
      },
      {
        name: 'Fisioterapia',
        description: 'Previene y rehabilita limitaciones del movimiento mediante evaluación clínica, ejercicio terapéutico y seguimiento continuo.',
      },
      {
        name: 'Orientación Vocacional',
        description: 'Guía procesos de decisión académica y profesional con herramientas de autoconocimiento, información y planificación.',
      },
      {
        name: 'Recursos Humanos',
        description: 'Gestiona talento, clima laboral y desarrollo profesional para alinear bienestar de las personas con objetivos organizacionales.',
      },
      {
        name: 'Mediación Comunitaria',
        description: 'Facilita diálogo y acuerdos entre partes para resolver conflictos de forma colaborativa y constructiva.',
      },
      {
        name: 'Fonoaudiología',
        description: 'Evalúa e interviene en comunicación, lenguaje y deglución para mejorar funcionalidad y participación social.',
      },
    ],
  },
  E: {
    title: 'Emprendedor (Persuasor)',
    description: 'Te energiza liderar proyectos, influir en decisiones y movilizar personas para alcanzar objetivos con visión estratégica.',
    descriptions: [
      'Este perfil sobresale en contextos dinámicos donde hay que proponer iniciativas, negociar, tomar decisiones y asumir responsabilidad por resultados.',
      'Las personas emprendedoras suelen combinar ambición, comunicación persuasiva y capacidad para detectar oportunidades de negocio o mejora.',
      'Disfrutan trabajar con metas, indicadores de crecimiento, liderazgo de equipos y desafíos que exigen iniciativa constante.',
      'Su motivación central está en generar impacto, crear valor, abrir nuevos caminos y transformar ideas en proyectos sostenibles.',
    ],
    careers: [
      'Administración de Empresas',
      'Emprendimiento',
      'Dirección Comercial',
      'Marketing Estratégico',
      'Ventas Consultivas',
      'Relaciones Públicas',
      'Derecho Corporativo',
      'Negocios Internacionales',
      'Gestión de Proyectos',
      'Product Management',
      'Consultoría de Negocios',
      'Gestión Inmobiliaria',
    ],
    careerDetails: [
      {
        name: 'Administración de Empresas',
        description: 'Planifica y coordina recursos, personas y procesos para lograr objetivos organizacionales de manera eficiente.',
      },
      {
        name: 'Emprendimiento',
        description: 'Crea y desarrolla modelos de negocio desde la ideación hasta la validación comercial y escalamiento.',
      },
      {
        name: 'Dirección Comercial',
        description: 'Define estrategias de crecimiento de ingresos, lidera equipos de ventas y optimiza resultados de mercado.',
      },
      {
        name: 'Marketing Estratégico',
        description: 'Diseña posicionamiento, segmentación y propuestas de valor para conectar productos con necesidades reales.',
      },
      {
        name: 'Ventas Consultivas',
        description: 'Construye relaciones de confianza con clientes para ofrecer soluciones personalizadas y de alto impacto.',
      },
      {
        name: 'Relaciones Públicas',
        description: 'Gestiona reputación, comunicación institucional y vínculo con audiencias clave en escenarios diversos.',
      },
      {
        name: 'Derecho Corporativo',
        description: 'Asesora a empresas en contratos, cumplimiento normativo y decisiones legales estratégicas.',
      },
      {
        name: 'Negocios Internacionales',
        description: 'Desarrolla operaciones globales, alianzas comerciales y estrategias de expansión en mercados externos.',
      },
      {
        name: 'Gestión de Proyectos',
        description: 'Planifica y ejecuta iniciativas complejas coordinando alcance, tiempos, presupuesto y equipos multidisciplinarios.',
      },
      {
        name: 'Product Management',
        description: 'Define visión y hoja de ruta de productos, alineando necesidades de usuarios con objetivos de negocio.',
      },
      {
        name: 'Consultoría de Negocios',
        description: 'Diagnostica problemas organizacionales y propone estrategias para mejorar rentabilidad y competitividad.',
      },
      {
        name: 'Gestión Inmobiliaria',
        description: 'Administra y comercializa activos inmobiliarios combinando análisis de mercado, negociación y planificación financiera.',
      },
    ],
  },
  C: {
    title: 'Convencional (Organizador)',
    description: 'Te caracterizas por el orden, la precisión y la confiabilidad en tareas que exigen método, estructura y control de información.',
    descriptions: [
      'Este perfil se desempeña mejor en entornos con procesos definidos, estándares claros y responsabilidades que requieren exactitud constante.',
      'Las personas convencionales suelen destacar en organización documental, análisis numérico, seguimiento administrativo y gestión operativa.',
      'Tienden a preferir la planificación, la secuencia lógica y el trabajo detallado para asegurar calidad y cumplimiento.',
      'Su motivación principal está en mantener sistemas eficientes, reducir errores y aportar estabilidad a la operación diaria.',
    ],
    careers: [
      'Contabilidad',
      'Auditoría',
      'Finanzas',
      'Administración Pública',
      'Análisis de Datos',
      'Inteligencia de Negocios',
      'Gestión Documental',
      'Bibliotecología',
      'Logística Administrativa',
      'Comercio Exterior Operativo',
      'Control de Calidad',
      'Gestión de Nómina',
    ],
    careerDetails: [
      {
        name: 'Contabilidad',
        description: 'Registra y analiza operaciones financieras para asegurar control, transparencia y cumplimiento tributario.',
      },
      {
        name: 'Auditoría',
        description: 'Evalúa procesos y estados financieros para verificar cumplimiento normativo y detectar oportunidades de mejora.',
      },
      {
        name: 'Finanzas',
        description: 'Gestiona presupuestos, inversiones y riesgos para sostener decisiones económicas responsables y eficientes.',
      },
      {
        name: 'Administración Pública',
        description: 'Organiza recursos y procedimientos en instituciones estatales para brindar servicios con orden y trazabilidad.',
      },
      {
        name: 'Análisis de Datos',
        description: 'Estructura y examina información para generar reportes confiables que respalden decisiones operativas y estratégicas.',
      },
      {
        name: 'Inteligencia de Negocios',
        description: 'Construye paneles e indicadores de gestión para monitorear desempeño y optimizar procesos internos.',
      },
      {
        name: 'Gestión Documental',
        description: 'Administra ciclos de vida de documentos, asegurando clasificación, resguardo y acceso eficiente a información crítica.',
      },
      {
        name: 'Bibliotecología',
        description: 'Organiza colecciones y sistemas de información para facilitar consulta, preservación y difusión de conocimiento.',
      },
      {
        name: 'Logística Administrativa',
        description: 'Coordina inventarios, compras y flujos internos con foco en control, tiempos y reducción de errores.',
      },
      {
        name: 'Comercio Exterior Operativo',
        description: 'Gestiona documentación y procesos aduaneros para asegurar operaciones internacionales correctas y oportunas.',
      },
      {
        name: 'Control de Calidad',
        description: 'Define y ejecuta verificaciones para mantener estándares de producto o servicio de forma consistente.',
      },
      {
        name: 'Gestión de Nómina',
        description: 'Administra pagos, contratos y registros laborales con exactitud, confidencialidad y cumplimiento legal.',
      },
    ],
  },
};

export const riasecDictionary: Record<RiasecProfileKey, RiasecProfile> =
  (Object.entries(baseRiasecDictionary) as [RiasecProfileKey, RiasecProfileBase][]).reduce(
    (accumulator, [profileKey, profileValue]) => {
      accumulator[profileKey] = {
        ...profileValue,
        careerDetails: profileValue.careerDetails.map((career) =>
          toCareerDetail(profileKey, career)
        ),
      };

      return accumulator;
    },
    {} as Record<RiasecProfileKey, RiasecProfile>
  );
