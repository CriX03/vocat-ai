import Sentiment from 'sentiment';

const sentiment = new Sentiment();

/**
 * Sanitiza el input del usuario eliminando etiquetas HTML/Scripts
 * y caracteres especiales peligrosos antes del procesamiento.
 */
function sanitizeInput(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')          // Elimina etiquetas HTML/Script
    .replace(/[<>"'`\\]/g, '')        // Elimina caracteres de inyección
    .trim();
}

/**
 * @description Normaliza el score bruto de la librería sentiment al rango contractual (-5 a 5).
 * La librería devuelve scores sin límite fijo; se aplica un clamp lineal.
 *
 * @jsdoc-weight La normalización usa el rango natural de la librería (~-10 a 10)
 * dividido entre 2 y acotado. Esto preserva la granularidad sin distorsionar
 * las señales emocionales moderadas que son las más frecuentes en un test vocacional.
 */
function normalizeScore(rawScore: number): number {
  const normalized = rawScore / 2;
  return Math.max(-5, Math.min(5, Math.round(normalized * 100) / 100));
}

export interface SentimentResult {
  /** Score normalizado en rango -5 a 5 */
  score: number;
  /** Score bruto devuelto por la librería */
  comparative: number;
}

/**
 * Analiza el sentimiento del texto del usuario.
 *
 * Pipeline: sanitización → análisis → normalización.
 * Diseñado para inyectar el score en el contexto de la IA
 * y ajustar la empatía del diálogo según el protocolo.
 *
 * @param userInput - Texto crudo del usuario
 * @returns SentimentResult con score normalizado (-5 a 5)
 */
export function analyzeSentiment(userInput: string): SentimentResult {
  const cleanText = sanitizeInput(userInput);

  if (cleanText.length === 0) {
    return { score: 0, comparative: 0 };
  }

  const result = sentiment.analyze(cleanText);

  return {
    score: normalizeScore(result.score),
    comparative: result.comparative,
  };
}
