import { createRequire } from "node:module";
// voyageai ESM build has broken directory imports; force CJS via createRequire
const { VoyageAIClient } = createRequire(import.meta.url)("voyageai") as typeof import("voyageai");

const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY! });
const MODEL = "voyage-2";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await client.embed({ input: texts, model: MODEL });
  return (response.data ?? []).map((item) => item.embedding ?? []);
}

export async function embedQuery(query: string): Promise<number[]> {
  const [embedding] = await embedTexts([query]);
  return embedding;
}
