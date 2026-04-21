import { createClient } from "@supabase/supabase-js";
import type { Chunk } from "./chunker";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function storeChunks(chunks: Chunk[], embeddings: number[][]): Promise<void> {
  const rows = chunks.map((chunk, i) => ({
    session_id: chunk.sessionId,
    is_demo: chunk.isDemo,
    page_num: chunk.page,
    chunk_text: chunk.text,
    embedding: `[${embeddings[i].join(",")}]`,
  }));

  const { error } = await supabase.from("document_chunks").insert(rows);
  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
}

export type RetrievedChunk = {
  chunk_text: string;
  page_num: number;
  similarity: number;
};

export async function searchChunks(
  sessionId: string,
  queryEmbedding: number[],
  topK = 5
): Promise<RetrievedChunk[]> {
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: `[${queryEmbedding.join(",")}]`,
    session_id_filter: sessionId,
    match_count: topK,
  });

  if (error) throw new Error(`Supabase search failed: ${error.message}`);
  return data ?? [];
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("document_chunks")
    .delete()
    .eq("session_id", sessionId)
    .eq("is_demo", false);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
}
