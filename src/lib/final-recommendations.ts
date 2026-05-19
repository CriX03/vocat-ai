import type { RiasecCareerDetail } from '@/lib/riasec-dictionary';
import {
  rankCareersWithHybridScoring,
  type RankedCareerRecommendation,
} from '@/lib/hybrid-recommendation-scoring';
import type {
  CareerRecommendation,
  ChatResponse,
  RiasecCategory,
  VocationalRecommendations,
} from '@/types/chat';
import type { VocationalDomain, VocationalDomains } from '@/types/vocational-domain';

type RiasecProfileKey = Exclude<RiasecCategory, 'NONE'>;

interface BuildFinalRecommendationsInput {
  primaryProfile: RiasecProfileKey;
  primaryProfileTitle: string;
  riasecScores: Record<RiasecProfileKey, number>;
  vocationalDomains?: VocationalDomains;
  chatResponses?: ChatResponse[];
  careers: RiasecCareerDetail[];
}

const DOMAIN_COPY: Record<string, string> = {
  TECH: 'tecnologia aplicada',
  SOFTWARE: 'desarrollo de software',
  DATA: 'analisis de datos',
  DESIGN: 'diseno y experiencia de usuario',
  BUSINESS: 'negocios y gestion',
  HEALTH: 'salud y bienestar',
  SCIENCE: 'investigacion cientifica',
  EDUCATION: 'educacion y aprendizaje',
  ENGINEERING: 'ingenieria y resolucion tecnica',
  COMMUNICATION: 'comunicacion estrategica',
  ARTS: 'expresion creativa',
};

const PROFILE_AREA_FALLBACK: Record<RiasecProfileKey, string[]> = {
  R: ['ingenieria aplicada', 'operaciones tecnicas', 'tecnologia industrial'],
  I: ['investigacion y datos', 'ciencia aplicada', 'tecnologia analitica'],
  A: ['diseno creativo', 'experiencias digitales', 'produccion audiovisual'],
  S: ['salud y cuidado', 'educacion', 'acompanamiento humano'],
  E: ['negocios y liderazgo', 'estrategia comercial', 'gestion de proyectos'],
  C: ['analisis y control', 'gestion administrativa', 'operacion basada en datos'],
};

interface RecommendationSignals {
  domainSet: Set<VocationalDomain>;
  socialSignal: number;
  creativitySignal: number;
  hasDetectedDomains: boolean;
}

function normalizeScore(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return score / maxScore;
}

function buildRecommendationSignals(
  riasecScores: Record<RiasecProfileKey, number>,
  vocationalDomains: VocationalDomains | undefined
): RecommendationSignals {
  const maxScore = Math.max(...Object.values(riasecScores), 1);
  const domainSet = new Set(vocationalDomains?.detectedDomains ?? []);

  return {
    domainSet,
    socialSignal: normalizeScore(riasecScores.S, maxScore),
    creativitySignal: normalizeScore(riasecScores.A, maxScore),
    hasDetectedDomains: domainSet.size > 0,
  };
}

function isMedicineCareer(careerName: string): boolean {
  const normalizedName = careerName.toLowerCase();
  return normalizedName.includes('medicina');
}

function isUxUiCareer(careerName: string): boolean {
  const normalizedName = careerName.toLowerCase();
  return normalizedName.includes('ux/ui') || normalizedName.includes('ux') || normalizedName.includes('ui');
}

function isSoftwareCareer(careerName: string): boolean {
  const normalizedName = careerName.toLowerCase();
  return normalizedName.includes('software');
}

function passesGuardrails(
  recommendation: RankedCareerRecommendation,
  signals: RecommendationSignals
): boolean {
  const { career } = recommendation;

  if (signals.hasDetectedDomains) {
    const isExploredCareer = career.domains.some((domain) => signals.domainSet.has(domain));
    if (!isExploredCareer) return false;
  }

  if (isMedicineCareer(career.name)) {
    const hasHealthDomain = signals.domainSet.has('HEALTH');
    if (!hasHealthDomain || signals.socialSignal < 0.5) return false;
  }

  if (isUxUiCareer(career.name)) {
    const hasDesignEvidence = signals.domainSet.has('DESIGN') || signals.creativitySignal >= 0.45;
    if (!hasDesignEvidence) return false;
  }

  if (isSoftwareCareer(career.name)) {
    const hasSoftwareEvidence = signals.domainSet.has('TECH') || signals.domainSet.has('SOFTWARE');
    if (!hasSoftwareEvidence) return false;
  }

  return true;
}

function buildGeneralAreaRecommendation(area: string, profileTitle: string): CareerRecommendation {
  return {
    carrera: `Area: ${area}`,
    descripcion: `Ruta general vinculada a ${area}.`,
    razon: `Por ahora hay evidencia parcial, por eso priorizamos esta area general alineada con tu perfil ${profileTitle} antes de cerrar una profesion especifica.`,
  };
}

function isLowConfidence(recommendations: RankedCareerRecommendation[]): boolean {
  if (recommendations.length === 0) return true;
  const topScore = recommendations[0].score;
  const secondScore = recommendations[1]?.score ?? 0;
  const scoreGap = topScore - secondScore;

  return topScore < 0.42 || scoreGap < 0.04;
}

function buildLowConfidenceFallback(
  profile: RiasecProfileKey,
  profileTitle: string,
  vocationalDomains: VocationalDomains | undefined
): CareerRecommendation[] {
  const domainAreas = (vocationalDomains?.detectedDomains ?? [])
    .slice(0, 3)
    .map((domain) => DOMAIN_COPY[domain] ?? domain.toLowerCase());

  const fallbackAreas = domainAreas.length > 0 ? domainAreas : PROFILE_AREA_FALLBACK[profile];

  return fallbackAreas.slice(0, 5).map((area) => buildGeneralAreaRecommendation(area, profileTitle));
}

function toCareerRecommendation(recommendation: RankedCareerRecommendation): CareerRecommendation {
  const domainText = recommendation.career.domains
    .slice(0, 2)
    .map((domain) => DOMAIN_COPY[domain] ?? domain.toLowerCase())
    .join(' y ');

  return {
    carrera: recommendation.career.name,
    descripcion: recommendation.career.description,
    razon: `Encaja por tu combinacion de intereses en ${domainText}, junto con una afinidad consistente con las habilidades que esta ruta exige.`,
  };
}

function buildProfileJustification(
  topRecommendations: RankedCareerRecommendation[],
  profileTitle: string,
  vocationalDomains: VocationalDomains | undefined
): string {
  const topCareerNames = topRecommendations
    .slice(0, 2)
    .map((item) => item.career.name.toLowerCase())
    .join(' y ');

  const detectedDomainText = (vocationalDomains?.detectedDomains ?? [])
    .slice(0, 3)
    .map((domain) => DOMAIN_COPY[domain] ?? domain.toLowerCase())
    .join(', ');

  if (detectedDomainText) {
    return `Tu perfil ${profileTitle} muestra una tendencia clara hacia ${detectedDomainText}, con interes sostenido en ${topCareerNames}.`;
  }

  return `Tu perfil ${profileTitle} refleja una combinacion solida de preferencias y habilidades que se alinea especialmente con ${topCareerNames}.`;
}

export function buildFinalRecommendations(
  input: BuildFinalRecommendationsInput
): VocationalRecommendations {
  const recommendationSignals = buildRecommendationSignals(input.riasecScores, input.vocationalDomains);

  const rankedCareers = rankCareersWithHybridScoring({
    careers: input.careers,
    riasecScores: input.riasecScores,
    vocationalDomains: input.vocationalDomains,
    chatResponses: input.chatResponses,
  });

  const coherentRecommendations = rankedCareers.filter((recommendation) =>
    passesGuardrails(recommendation, recommendationSignals)
  );

  const topRecommendations = coherentRecommendations.slice(0, 5);
  const lowConfidence = isLowConfidence(topRecommendations);
  const careerRecommendations = lowConfidence
    ? buildLowConfidenceFallback(input.primaryProfile, input.primaryProfileTitle, input.vocationalDomains)
    : topRecommendations.map(toCareerRecommendation);

  const finalCareerRecommendations = careerRecommendations.length > 0
    ? careerRecommendations
    : buildLowConfidenceFallback(input.primaryProfile, input.primaryProfileTitle, input.vocationalDomains);

  return {
    perfil_riasec: input.primaryProfile,
    titulo_perfil: input.primaryProfileTitle,
    justificacion_perfil: buildProfileJustification(
      topRecommendations,
      input.primaryProfileTitle,
      input.vocationalDomains
    ),
    carreras_recomendadas: finalCareerRecommendations,
  };
}
