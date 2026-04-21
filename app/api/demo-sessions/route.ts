import { NextResponse } from "next/server";

// Populated after running scripts/seed-demo-docs.ts
const DEMO_SESSIONS = [
  { sessionId: "demo-aetna-sbc", name: "Sample Plan A" },
];

export async function GET() {
  return NextResponse.json(DEMO_SESSIONS);
}
