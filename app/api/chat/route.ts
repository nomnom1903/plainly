import { NextRequest } from "next/server";
import { embedQuery } from "@/lib/embeddings";
import { searchChunks } from "@/lib/supabase";
import { streamAnswer } from "@/lib/claude";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { sessionId, question } = await req.json();

  if (!sessionId || !question) {
    return new Response("Missing sessionId or question", { status: 400 });
  }

  const queryEmbedding = await embedQuery(question);
  const chunks = await searchChunks(sessionId, queryEmbedding);

  if (chunks.length === 0) {
    return new Response(
      "data: I couldn't find any relevant information in your document. I'd recommend calling your insurer directly.\n\ndata: [DONE]\n\n",
      { headers: { "Content-Type": "text/event-stream" } }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const token of streamAnswer(question, chunks)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(token)}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify("Something went wrong. Please try again.")}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
