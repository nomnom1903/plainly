// Phase 1: Split page text into overlapping chunks
import type { PageChunk } from "./pdf";

export type Chunk = {
  text: string;
  page: number;
  sessionId: string;
  isDemo: boolean;
};

export function chunkPages(pages: PageChunk[], sessionId: string, isDemo = false): Chunk[] {
  throw new Error("Not implemented — Phase 1");
}
