import { NextRequest, NextResponse } from "next/server";
import { parsePdf } from "@/lib/pdf";
import { chunkPages } from "@/lib/chunker";
import { embedTexts } from "@/lib/embeddings";
import { storeChunks } from "@/lib/supabase";
import { randomUUID } from "crypto";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  const sessionId = randomUUID();
  const buffer = await file.arrayBuffer();

  const pages = await parsePdf(buffer);
  if (pages.length === 0) {
    return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 422 });
  }

  const chunks = chunkPages(pages, sessionId);
  const embeddings = await embedTexts(chunks.map((c) => c.text));
  await storeChunks(chunks, embeddings);

  return NextResponse.json({ sessionId });
}
