import { join } from "path";
import { pathToFileURL } from "url";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

// pdfjs-dist v5 in Node.js CJS — must use a file:// URL for workerSrc
GlobalWorkerOptions.workerSrc = pathToFileURL(
  join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
).href;

export type PageChunk = {
  text: string;
  page: number;
};

export async function parsePdf(buffer: ArrayBuffer): Promise<PageChunk[]> {
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: PageChunk[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) pages.push({ text, page: i });
  }

  return pages;
}
