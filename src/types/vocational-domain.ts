export const VOCATIONAL_DOMAINS = [
  'TECH',
  'SOFTWARE',
  'DATA',
  'DESIGN',
  'BUSINESS',
  'HEALTH',
  'SCIENCE',
  'EDUCATION',
  'ENGINEERING',
  'COMMUNICATION',
  'ARTS',
] as const;

export type VocationalDomain = (typeof VOCATIONAL_DOMAINS)[number];

export interface VocationalDomainScores {
  TECH: number;
  SOFTWARE: number;
  DATA: number;
  DESIGN: number;
  BUSINESS: number;
  HEALTH: number;
  SCIENCE: number;
  EDUCATION: number;
  ENGINEERING: number;
  COMMUNICATION: number;
  ARTS: number;
}

export interface VocationalDomains {
  dominantDomain?: VocationalDomain | null;
  detectedDomains?: VocationalDomain[];
  scores?: Partial<VocationalDomainScores>;
}

export function createInitialVocationalDomainScores(): VocationalDomainScores {
  return {
    TECH: 0,
    SOFTWARE: 0,
    DATA: 0,
    DESIGN: 0,
    BUSINESS: 0,
    HEALTH: 0,
    SCIENCE: 0,
    EDUCATION: 0,
    ENGINEERING: 0,
    COMMUNICATION: 0,
    ARTS: 0,
  };
}
