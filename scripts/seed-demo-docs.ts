import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: join(process.cwd(), ".env.local") });

const DEMO_DOCS = [
  {
    sessionId: "demo-aetna-sbc",
    name: "Sample Plan A",
    file: "demo-plan-a.pdf",
  },
];

async function main() {
  // Dynamic imports after dotenv loads — avoids both hoisting and CJS top-level await issues
  const { parsePdf } = await import("../lib/pdf");
  const { chunkPages } = await import("../lib/chunker");
  const { embedTexts } = await import("../lib/embeddings");
  const { storeChunks, supabase } = await import("../lib/supabase");

  console.log("Starting demo doc seeding...");

  for (const doc of DEMO_DOCS) {
    console.log(`\nSeeding: ${doc.name} (${doc.sessionId})`);

    // Clear existing rows for idempotency
    const { error: delError } = await supabase
      .from("document_chunks")
      .delete()
      .eq("session_id", doc.sessionId);
    if (delError) throw new Error(`Failed to clear ${doc.sessionId}: ${delError.message}`);

    const filePath = join(process.cwd(), "public", "demo-docs", doc.file);
    const buffer = readFileSync(filePath).buffer;

    console.log("  Parsing PDF...");
    const pages = await parsePdf(buffer);
    console.log(`  → ${pages.length} pages extracted`);

    const chunks = chunkPages(pages, doc.sessionId, true);
    console.log(`  → ${chunks.length} chunks created`);

    console.log("  Embedding chunks (this may take a moment)...");
    const embeddings = await embedTexts(chunks.map((c) => c.text));
    console.log(`  → ${embeddings.length} embeddings generated`);

    console.log("  Storing in Supabase...");
    await storeChunks(chunks, embeddings);
    console.log(`  ✓ Done: ${doc.name}`);
  }

  console.log("\n✓ All demo docs seeded successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nSeeding failed:", err.message ?? err);
  process.exit(1);
});
