const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = "voyage-2";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: texts, model: MODEL }),
  });
  if (!res.ok) throw new Error(`Voyage AI error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

export async function embedQuery(query: string): Promise<number[]> {
  const [embedding] = await embedTexts([query]);
  return embedding;
}
