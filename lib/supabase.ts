// Phase 1: Supabase pgvector — store and retrieve chunks
import { createClient } from "@supabase/supabase-js";
import type { Chunk } from "./chunker";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function storeChunks(chunks: Chunk[], embeddings: number[][]): Promise<void> {
  throw new Error("Not implemented — Phase 1");
}

export async function searchChunks(sessionId: string, queryEmbedding: number[], topK = 5) {
  throw new Error("Not implemented — Phase 1");
}

export async function deleteSession(sessionId: string): Promise<void> {
  throw new Error("Not implemented — Phase 1");
}
