import { NextResponse } from "next/server";

// Populated after running scripts/seed-demo-docs.ts
const DEMO_SESSIONS = [
  { sessionId: "demo-aetna-sbc", name: "Aetna Sample Plan" },
  { sessionId: "demo-bcbs-sbc", name: "Blue Cross Sample Plan" },
];

export async function GET() {
  return NextResponse.json(DEMO_SESSIONS);
}
