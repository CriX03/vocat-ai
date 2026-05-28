import { streamObject } from "ai";
import { NextResponse } from "next/server";
import {
  buildSystemWithContext,
  chatResponseSchema,
  createFallbackResponse,
  getFallbackQuestionNumber,
  getRecentHistory,
  type ChatRequestBody,
} from "@/lib/chat-contract";
import { analyzeSentiment } from "@/lib/sentiment-analysis";

export async function POST(request: Request) {
  let fallbackQuestion = 1;
  const modelName = process.env.AI_MODEL?.trim() || "openai/gpt-4.1-mini";

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

    const systemWithContext = buildSystemWithContext(
      sentiment.score,
      fallbackQuestion,
    );

    const recentHistory = getRecentHistory(history);

    const result = await streamObject({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: modelName as any,
      system: systemWithContext,
      messages: [...recentHistory, { role: "user", content: message }],
      schema: chatResponseSchema,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let hasChunks = false;

        try {
          for await (const chunk of result.textStream) {
            if (!chunk) continue;

            hasChunks = true;
            controller.enqueue(encoder.encode(chunk));
          }

          if (!hasChunks) {
            const finalObject = await result.object;
            controller.enqueue(encoder.encode(JSON.stringify(finalObject)));
          }
        } catch (streamError) {
          console.error("[VocatAI Stream API Error]", streamError);

          if (!hasChunks) {
            const fallbackResponse = createFallbackResponse(fallbackQuestion);
            controller.enqueue(
              encoder.encode(JSON.stringify(fallbackResponse)),
            );
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
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
