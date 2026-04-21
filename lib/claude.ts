import Anthropic from "@anthropic-ai/sdk";
import type { RetrievedChunk } from "./supabase";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You are Plainly, a helpful assistant that answers questions about insurance documents in plain, easy-to-understand language.

You will be given relevant excerpts from the user's insurance document. Answer the user's question based ONLY on the provided excerpts.

Rules:
- Answer in plain English — avoid jargon, and explain any insurance terms you must use
- Always cite the page number(s) your answer is based on, e.g. "(Page 4)"
- If the answer is not found in the provided excerpts, respond with exactly: "I couldn't find that information in your document. I'd recommend calling your insurer directly for clarification."
- Never guess or make up information not present in the excerpts
- Be concise and direct`;

export async function* streamAnswer(
  question: string,
  chunks: RetrievedChunk[]
): AsyncGenerator<string> {
  const context = chunks
    .map((c) => `[Page ${c.page_num}]\n${c.chunk_text}`)
    .join("\n\n---\n\n");

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    temperature: 0.2,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Document excerpts:\n\n${context}\n\n---\n\nQuestion: ${question}`,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
