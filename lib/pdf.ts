// Phase 1: PDF parsing — pdfjs-dist extracts text per page with page numbers
export type PageChunk = {
  text: string;
  page: number;
};

export async function parsePdf(buffer: ArrayBuffer): Promise<PageChunk[]> {
  throw new Error("Not implemented — Phase 1");
}
