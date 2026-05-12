import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import {
  buildSystemWithContext,
  chatResponseSchema,
  createFallbackResponse,
  getFallbackQuestionNumber,
  getRecentHistory,
  type ChatRequestBody,
} from '@/lib/chat-contract';
import { analyzeSentiment } from '@/lib/sentiment-analysis';

/* ────────────────────────────────────────────
 * POST Handler
 * ──────────────────────────────────────────── */

export async function POST(request: Request) {
  let fallbackQuestion = 1;

  try {
    const body: ChatRequestBody = await request.json();
    const { message, history, currentQuestion } = body;

    fallbackQuestion = getFallbackQuestionNumber(currentQuestion);

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'El campo "message" es requerido' },
        { status: 400 }
      );
    }

    // ── 1. Análisis de sentimiento local (antes del LLM) ──
    const sentiment = analyzeSentiment(message);

    // ── 2. Construir prompt con score inyectado ──
    const systemWithContext = buildSystemWithContext(sentiment.score, fallbackQuestion);

    // ── 3. Limitar contexto a los últimos 5 mensajes (protocolo §4.3) ──
    const recentHistory = getRecentHistory(history);

    const result = await generateObject({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: 'openai/gpt-5-mini' as any, // Proveedor String API
      system: systemWithContext,
      messages: [
        ...recentHistory,
        { role: 'user', content: message },
      ],
      schema: chatResponseSchema,
    });

    return NextResponse.json(result.object);

  } catch (error) {
    console.error('[VocatAI API Error]', error);

    // Respuesta de fallback estática si todo falla, para que la UI no se cuelgue
    return NextResponse.json(createFallbackResponse(fallbackQuestion));
  }
}
