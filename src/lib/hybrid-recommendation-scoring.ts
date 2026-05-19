import type { RiasecCareerDetail } from '@/lib/riasec-dictionary';
import type { ChatResponse, RiasecCategory } from '@/types/chat';
import type { VocationalDomain, VocationalDomains } from '@/types/vocational-domain';

type RiasecProfileKey = Exclude<RiasecCategory, 'NONE'>;
type RiasecScoresMap = Record<RiasecProfileKey, number>;

export interface HybridScoringConfig {
  riasecWeight: number;
  domainWeight: number;
  consistencyWeight: number;
  intensityWeight: number;
  domainMatchBonus: number;
  noDomainPenalty: number;
  hardConstraintPenalty: number;
  minSocialSignalForHealth: number;
  lowEvidenceThreshold: number;
  lowEvidencePenalty: number;
}

export interface HybridScoringInput {
  careers: RiasecCareerDetail[];
  riasecScores: RiasecScoresMap;
  vocationalDomains?: VocationalDomains;
  chatResponses?: ChatResponse[];
  config?: Partial<HybridScoringConfig>;
}

interface ConversationalSignals {
  consistencyByProfile: RiasecScoresMap;
  intensityByProfile: RiasecScoresMap;
}

export interface HybridScoreBreakdown {
  riasecMatch: number;
  domainMatch: number;
  conversationalConsistency: number;
  accumulatedIntensity: number;
  constraintsMultiplier: number;
  finalScore: number;
}

export interface RankedCareerRecommendation {
  career: RiasecCareerDetail;
  score: number;
  breakdown: HybridScoreBreakdown;
}

const RIASEC_KEYS: RiasecProfileKey[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export const DEFAULT_SCORING_CONFIG: HybridScoringConfig = {
  riasecWeight: 0.4,
  domainWeight: 0.3,
  consistencyWeight: 0.2,
  intensityWeight: 0.1,
  domainMatchBonus: 0.08,
  noDomainPenalty: 0.82,
  hardConstraintPenalty: 0.2,
  minSocialSignalForHealth: 0.55,
  lowEvidenceThreshold: 0.16,
  lowEvidencePenalty: 0.75,
};

function normalizeRiasecScores(riasecScores: RiasecScoresMap): RiasecScoresMap {
  const maxScore = Math.max(...Object.values(riasecScores), 1);

  return RIASEC_KEYS.reduce(
    (accumulator, key) => {
      accumulator[key] = riasecScores[key] / maxScore;
      return accumulator;
    },
    { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } satisfies RiasecScoresMap
  );
}

function getAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getDetectedDomainSet(vocationalDomains: VocationalDomains | undefined): Set<VocationalDomain> {
  return new Set(vocationalDomains?.detectedDomains ?? []);
}

function getDomainScores(
  vocationalDomains: VocationalDomains | undefined
): Partial<Record<VocationalDomain, number>> {
  return vocationalDomains?.scores ?? {};
}

function computeConversationalSignals(chatResponses: ChatResponse[] | undefined): ConversationalSignals {
  const initialValues: RiasecScoresMap = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  if (!chatResponses || chatResponses.length === 0) {
    return {
      consistencyByProfile: initialValues,
      intensityByProfile: initialValues,
    };
  }

  let validTurns = 0;
  let totalPoints = 0;

  const occurrences = { ...initialValues };
  const points = { ...initialValues };

  for (const response of chatResponses) {
    const category = response.analisis_riasec.categoria;
    if (category === 'NONE') continue;

    const boundedPoints = Math.max(0, Math.min(3, response.analisis_riasec.puntos));
    validTurns += 1;
    totalPoints += boundedPoints;
    occurrences[category] += 1;
    points[category] += boundedPoints;
  }

  return {
    consistencyByProfile: RIASEC_KEYS.reduce(
      (accumulator, key) => {
        accumulator[key] = validTurns > 0 ? occurrences[key] / validTurns : 0;
        return accumulator;
      },
      { ...initialValues }
    ),
    intensityByProfile: RIASEC_KEYS.reduce(
      (accumulator, key) => {
        accumulator[key] = totalPoints > 0 ? points[key] / totalPoints : 0;
        return accumulator;
      },
      { ...initialValues }
    ),
  };
}

function computeDomainMatchScore(
  career: RiasecCareerDetail,
  domainSet: Set<VocationalDomain>,
  domainScores: Partial<Record<VocationalDomain, number>>
): number {
  if (career.domains.length === 0) return 0;

  const domainScoreValues = career.domains.map((domain) => {
    if (!domainSet.has(domain)) return 0;

    const rawDomainScore = domainScores[domain];
    if (typeof rawDomainScore !== 'number') return 1;

    return Math.max(0, Math.min(1, rawDomainScore / 5));
  });

  return getAverage(domainScoreValues);
}

function computeSocialSignal(
  normalizedRiasecScores: RiasecScoresMap,
  conversationalSignals: ConversationalSignals
): number {
  return (
    normalizedRiasecScores.S * 0.5 +
    conversationalSignals.consistencyByProfile.S * 0.3 +
    conversationalSignals.intensityByProfile.S * 0.2
  );
}

interface DomainConstraintRule {
  domains: VocationalDomain[];
  mode: 'any' | 'all';
  isSatisfied: (domainSet: Set<VocationalDomain>, socialSignal: number, config: HybridScoringConfig) => boolean;
}

const DOMAIN_CONSTRAINT_RULES: DomainConstraintRule[] = [
  {
    domains: ['HEALTH'],
    mode: 'any',
    isSatisfied: (domainSet, socialSignal, config) =>
      domainSet.has('HEALTH') && socialSignal >= config.minSocialSignalForHealth,
  },
  {
    domains: ['SOFTWARE'],
    mode: 'any',
    isSatisfied: (domainSet) => domainSet.has('SOFTWARE') || domainSet.has('TECH'),
  },
];

function applyConstraintRules(
  career: RiasecCareerDetail,
  domainSet: Set<VocationalDomain>,
  socialSignal: number,
  config: HybridScoringConfig
): number {
  let multiplier = 1;

  for (const rule of DOMAIN_CONSTRAINT_RULES) {
    const appliesToCareer =
      rule.mode === 'all'
        ? rule.domains.every((domain) => career.domains.includes(domain))
        : rule.domains.some((domain) => career.domains.includes(domain));

    if (appliesToCareer && !rule.isSatisfied(domainSet, socialSignal, config)) {
      multiplier *= config.hardConstraintPenalty;
    }
  }

  return multiplier;
}

function buildCareerScore(
  career: RiasecCareerDetail,
  normalizedRiasecScores: RiasecScoresMap,
  domainSet: Set<VocationalDomain>,
  domainScores: Partial<Record<VocationalDomain, number>>,
  conversationalSignals: ConversationalSignals,
  config: HybridScoringConfig
): HybridScoreBreakdown {
  const riasecMatch = getAverage(career.riasecProfiles.map((profile) => normalizedRiasecScores[profile]));
  const domainMatch = computeDomainMatchScore(career, domainSet, domainScores);
  const conversationalConsistency = getAverage(
    career.riasecProfiles.map((profile) => conversationalSignals.consistencyByProfile[profile])
  );
  const accumulatedIntensity = getAverage(
    career.riasecProfiles.map((profile) => conversationalSignals.intensityByProfile[profile])
  );

  let weightedScore =
    riasecMatch * config.riasecWeight +
    domainMatch * config.domainWeight +
    conversationalConsistency * config.consistencyWeight +
    accumulatedIntensity * config.intensityWeight;

  const hasDomainMatch = career.domains.some((domain) => domainSet.has(domain));
  if (hasDomainMatch) {
    weightedScore += config.domainMatchBonus;
  } else if (domainSet.size > 0) {
    weightedScore *= config.noDomainPenalty;
  }

  const socialSignal = computeSocialSignal(normalizedRiasecScores, conversationalSignals);
  const evidenceSignal = (conversationalConsistency + accumulatedIntensity) / 2;
  const constraintsMultiplier = applyConstraintRules(career, domainSet, socialSignal, config);
  const lowEvidenceMultiplier =
    evidenceSignal < config.lowEvidenceThreshold ? config.lowEvidencePenalty : 1;
  const finalScore = weightedScore * constraintsMultiplier * lowEvidenceMultiplier;

  return {
    riasecMatch,
    domainMatch,
    conversationalConsistency,
    accumulatedIntensity,
    constraintsMultiplier,
    finalScore,
  };
}

function dedupeCareersByName(recommendations: RankedCareerRecommendation[]): RankedCareerRecommendation[] {
  const bestByName = new Map<string, RankedCareerRecommendation>();

  for (const recommendation of recommendations) {
    const currentBest = bestByName.get(recommendation.career.name);
    if (!currentBest || recommendation.score > currentBest.score) {
      bestByName.set(recommendation.career.name, recommendation);
    }
  }

  return Array.from(bestByName.values());
}

export function rankCareersWithHybridScoring({
  careers,
  riasecScores,
  vocationalDomains,
  chatResponses,
  config,
}: HybridScoringInput): RankedCareerRecommendation[] {
  const mergedConfig: HybridScoringConfig = {
    ...DEFAULT_SCORING_CONFIG,
    ...config,
  };

  const normalizedRiasecScores = normalizeRiasecScores(riasecScores);
  const conversationalSignals = computeConversationalSignals(chatResponses);
  const domainSet = getDetectedDomainSet(vocationalDomains);
  const domainScores = getDomainScores(vocationalDomains);

  const scoredCareers = careers.map((career) => {
    const breakdown = buildCareerScore(
      career,
      normalizedRiasecScores,
      domainSet,
      domainScores,
      conversationalSignals,
      mergedConfig
    );

    return {
      career,
      score: breakdown.finalScore,
      breakdown,
    };
  });

  return dedupeCareersByName(scoredCareers).sort((left, right) => right.score - left.score);
}
