import type { VocationalDomains } from '@/types/vocational-domain';

/**
 * Protocolo de Comunicación VocatAI
 *
 * Contrato JSON estricto para toda interacción entre servidor y cliente.
 * PROHIBIDO responder en texto plano fuera de esta estructura.
 */

/** Categorías RIASEC válidas para el análisis vocacional */
export type RiasecCategory = 'R' | 'I' | 'A' | 'S' | 'E' | 'C' | 'NONE';

/** Análisis RIASEC generado por la IA en cada interacción */
export interface RiasecAnalysis {
  /** Categoría RIASEC detectada en la respuesta del usuario */
  categoria: RiasecCategory;
  /** Puntos asignados según intensidad detectada (rango 1-3) */
  puntos: number;
  /** Justificación de la IA para la asignación de puntos */
  justificacion: string;
}

/** Metadatos de control y seguimiento de la sesión */
export interface ChatMetadata {
  /** Score de sentimiento detectado por la capa local (-5 a 5) */
  sentiment_score: number;
  /** Contador de interacción actual (1-15) */
  pregunta_n: number;
  /** True si la confianza del perfil RIASEC es > 90% */
  finalizar_test: boolean;
}

/** Carrera recomendada con justificación específica */
export interface CareerRecommendation {
  carrera: string;
  descripcion: string;
  razon: string;
}

/** Bloque estructurado de recomendaciones vocacionales */
export interface VocationalRecommendations {
  perfil_riasec: Exclude<RiasecCategory, 'NONE'>;
  titulo_perfil: string;
  justificacion_perfil: string;
  carreras_recomendadas: CareerRecommendation[];
}

/**
 * Respuesta estructurada de la IA.
 *
 * Toda respuesta del backend DEBE ajustarse a esta interfaz.
 * El frontend parseará exclusivamente este formato.
 */
export interface ChatResponse {
  /** Texto empático y fluido dirigido al usuario */
  dialogo_ia: string;
  /** Análisis RIASEC correspondiente a la interacción */
  analisis_riasec: RiasecAnalysis;
  /** Metadatos de control de la sesión */
  metadatos: ChatMetadata;
  /** Recomendaciones estructuradas; null mientras no haya suficiente claridad */
  recomendaciones: VocationalRecommendations | null;
  /** Capa opcional para dominios vocacionales detectados */
  vocationalDomains?: VocationalDomains;
}
