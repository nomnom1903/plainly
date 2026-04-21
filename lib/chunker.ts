import type { PageChunk } from "./pdf";

export type Chunk = {
  text: string;
  page: number;
  sessionId: string;
  isDemo: boolean;
};

const CHUNK_SIZE = 2000; // ~500 tokens
const OVERLAP = 400;     // ~100 tokens

export function chunkPages(pages: PageChunk[], sessionId: string, isDemo = false): Chunk[] {
  const chunks: Chunk[] = [];

  for (const { text, page } of pages) {
    if (text.length <= CHUNK_SIZE) {
      chunks.push({ text, page, sessionId, isDemo });
      continue;
    }

    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + CHUNK_SIZE, text.length);
      const chunkText = text.slice(start, end).trim();
      if (chunkText) chunks.push({ text: chunkText, page, sessionId, isDemo });
      start += CHUNK_SIZE - OVERLAP;
    }
  }

  return chunks;
}
