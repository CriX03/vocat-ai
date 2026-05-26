import { generateObject } from "ai";
import { NextResponse } from "next/server";
import {
  buildConversationMemory,
  buildSystemWithContext,
  chatResponseSchema,
  createFallbackResponse,
  getFallbackQuestionNumber,
  getRecentHistory,
  type ChatRequestBody,
} from "@/lib/chat-contract";
import { analyzeSentiment } from "@/lib/sentiment-analysis";

const DEFAULT_MODEL_CANDIDATES = ["openai/gpt-4.1-mini", "openai/gpt-4.1-nano"] as const;
const DEFAULT_TIMEOUT_MS = 20000;

function getModelCandidates(): string[] {
  const configuredModel = process.env.VOCATAI_MODEL?.trim();
  const configuredCandidates =
    process.env.VOCATAI_MODEL_CANDIDATES?.split(",").map((candidate) => candidate.trim()) ?? [];

  return [configuredModel, ...configuredCandidates, ...DEFAULT_MODEL_CANDIDATES].filter(
    (value): value is string => Boolean(value),
  );
}

function getTimeoutMs(): number {
  const parsed = Number.parseInt(process.env.VOCATAI_MODEL_TIMEOUT_MS ?? "", 10);

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return DEFAULT_TIMEOUT_MS;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Model request timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function isAccessError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  return /free tier users do not have access to this model/i.test(error.message);
}

async function generateWithFallbackModel(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
) {
  const timeoutMs = getTimeoutMs();
  const modelCandidates = getModelCandidates();

  let lastError: unknown = null;

  for (const model of modelCandidates) {
    try {
      const result = await withTimeout(
        generateObject({
          model,
          system,
          messages,
          schema: chatResponseSchema,
        }),
        timeoutMs,
      );

      return result.object;
    } catch (error) {
      lastError = error;
      const reason = isAccessError(error) ? "model-access" : "runtime";
      console.warn(`[VocatAI Stream] model failed (${reason}): ${model}`);
    }
  }

  throw lastError ?? new Error("No model candidates available");
}

export async function POST(request: Request) {
  let fallbackQuestion = 1;

  try {
    const body: ChatRequestBody = await request.json();
    const { message, history, currentQuestion } = body;

    fallbackQuestion = getFallbackQuestionNumber(currentQuestion);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: 'El campo "message" es requerido' },
        { status: 400 },
      );
    }

    const sentiment = analyzeSentiment(message);

    const memoryContext = buildConversationMemory(history, fallbackQuestion);

    const systemWithContext = buildSystemWithContext(
      sentiment.score,
      fallbackQuestion,
      memoryContext ?? undefined,
    );

    const recentHistory = getRecentHistory(history, fallbackQuestion);

    const responseObject = await generateWithFallbackModel(systemWithContext, [
      ...recentHistory,
      { role: "user", content: message },
    ]);

    return new Response(JSON.stringify(responseObject), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[VocatAI Stream Route Error]", error);

    return NextResponse.json(createFallbackResponse(fallbackQuestion));
  }
}
