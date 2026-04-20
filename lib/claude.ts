// Phase 1: Claude claude-sonnet-4-6 — augmented generation with citations
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type RetrievedChunk = {
  text: string;
  page: number;
};

export async function* streamAnswer(question: string, chunks: RetrievedChunk[]) {
  throw new Error("Not implemented — Phase 1");
}
