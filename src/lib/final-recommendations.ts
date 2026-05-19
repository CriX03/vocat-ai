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
import type { VocationalDomains } from '@/types/vocational-domain';

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
  const rankedCareers = rankCareersWithHybridScoring({
    careers: input.careers,
    riasecScores: input.riasecScores,
    vocationalDomains: input.vocationalDomains,
    chatResponses: input.chatResponses,
  });

  const topRecommendations = rankedCareers.slice(0, 5);

  return {
    perfil_riasec: input.primaryProfile,
    titulo_perfil: input.primaryProfileTitle,
    justificacion_perfil: buildProfileJustification(
      topRecommendations,
      input.primaryProfileTitle,
      input.vocationalDomains
    ),
    carreras_recomendadas: topRecommendations.map(toCareerRecommendation),
  };
}
