import { createRequire } from "node:module";

// pdf-parse v1 is CJS — use createRequire to avoid ESM interop issues
const pdfParse = createRequire(import.meta.url)("pdf-parse") as (
  buf: Buffer,
  opts?: { pagerender?: (pageData: any) => Promise<string> }
) => Promise<any>;

export type PageChunk = { text: string; page: number };

export async function parsePdf(buffer: ArrayBuffer): Promise<PageChunk[]> {
  const pages: PageChunk[] = [];
  let pageNum = 0;

  await pdfParse(Buffer.from(buffer), {
    pagerender: async (pageData: any) => {
      const num = ++pageNum;
      const content = await pageData.getTextContent();
      const text = content.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (text) pages.push({ text, page: num });
      return text;
    },
  });

  return pages;
}
