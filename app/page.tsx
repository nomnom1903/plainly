"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const SAMPLE_QUESTIONS = [
  "Is my MRI covered, and do I need approval first?",
  "How much will my prescription drugs cost?",
  "What does my plan cover for mental health?",
  "Why might a claim be denied?",
];

const LORA = "var(--font-lora), 'Lora', serif";

function ProcessingView({ fileName, error }: { fileName: string; error?: string }) {
  const steps = [
    { label: "Reading your document", detail: "Extracting text and structure…" },
    { label: "Identifying your coverage", detail: "Finding deductibles, copays, limits…" },
    { label: "Preparing your assistant", detail: "Ready to answer your questions." },
  ];
  const step = 1;

  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div className="fade-up" style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ width: 72, height: 88, margin: "0 auto 28px", position: "relative" }}>
          <div style={{ width: "100%", height: "100%", background: "white", border: "1.5px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
              <path d="M4 2h14l8 8v20H4V2z" fill="var(--surface)" stroke="var(--border2)" strokeWidth="1.5"/>
              <path d="M18 2v8h8" fill="none" stroke="var(--border2)" strokeWidth="1.5"/>
              <path d="M7 14h14M7 18h14M7 22h9" stroke="var(--border2)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          {!error && (
            <div className="spin" style={{ position: "absolute", bottom: -10, right: -10, width: 28, height: 28, borderRadius: "50%", background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2v4M10 14v4M2 10h4M14 10h4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          )}
        </div>
        <div style={{ fontFamily: LORA, fontSize: 22, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
          {error ? "Something went wrong" : "Reading your document"}
        </div>
        <div style={{ fontSize: 13.5, color: error ? "var(--red)" : "var(--text2)", marginBottom: 32 }}>
          {error || fileName}
        </div>
        {!error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", opacity: i > step ? 0.35 : 1, transition: "opacity 0.3s ease" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1, background: i < step ? "var(--teal)" : "transparent", border: i < step ? "none" : `2px solid ${i === step ? "var(--teal)" : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i < step
                    ? <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : i === step
                    ? <div className="spin" style={{ width: 10, height: 10, borderRadius: "50%", borderTop: "2px solid var(--teal)", borderRight: "2px solid transparent" }}/>
                    : null}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: i <= step ? "var(--text)" : "var(--text3)" }}>{s.label}</div>
                  {i === step && <div style={{ fontSize: 12.5, color: "var(--teal)", marginTop: 1 }}>{s.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState<"landing" | "processing">("landing");
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setUploadError("");
    setView("processing");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      router.push(`/chat/${data.sessionId}?name=${encodeURIComponent(file.name)}`);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    }
  }, [router]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  if (view === "processing") {
    return (
      <main style={{ height: "100vh" }}>
        <ProcessingView fileName={fileName} error={uploadError} />
        {uploadError && (
          <div style={{ textAlign: "center", paddingTop: 16 }}>
            <button onClick={() => { setView("landing"); setUploadError(""); }} style={{ background: "var(--teal)", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Try again
            </button>
          </div>
        )}
      </main>
    );
  }

  return (
    <main style={{ height: "100vh", overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 620 }}>

        {/* Logo + tagline */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--teal) 0%, #1D6B5A 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="white"><path d="M10 2C5.58 2 2 5.58 2 10c0 1.85.6 3.56 1.6 4.95L2 18l3.05-1.6C6.44 17.4 8.15 18 10 18c4.42 0 8-3.58 8-8s-3.58-8-8-8z"/></svg>
            </div>
            <span style={{ fontFamily: LORA, fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text)" }}>Plainly</span>
          </div>
          <h1 style={{ fontFamily: LORA, fontSize: 30, fontWeight: 500, color: "var(--text)", lineHeight: 1.3, marginBottom: 10, letterSpacing: "-0.02em" }}>
            Your insurance questions,<br/>
            <em style={{ fontWeight: 400 }}>answered plainly.</em>
          </h1>
          <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
            Upload your insurance document (SBC, EOB, or policy PDF) and ask anything in plain English. No jargon. No 50-page reading.
          </p>
        </div>

        {/* Upload zone */}
        <div className="fade-up" style={{ marginBottom: 28, animationDelay: "0.08s" }}>
          <div
            className={`drop-zone ${dragging ? "drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{ padding: "36px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
          >
            <input ref={inputRef} type="file" accept=".pdf" onChange={handleFile} style={{ display: "none" }} />
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid var(--border)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="var(--text2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 16.7A5 5 0 0 0 17 7h-1.26A8 8 0 1 0 4 15.25" stroke="var(--text2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14.5, fontWeight: 500, color: "var(--text)", marginBottom: 3 }}>Drop your insurance PDF here</div>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>or click to browse · SBC, EOB, or policy document</div>
            </div>
          </div>
        </div>

        {/* Sample questions */}
        <div className="fade-up" style={{ animationDelay: "0.14s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text3)", whiteSpace: "nowrap" }}>or try without uploading</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 12px 4px 8px", fontSize: 12, color: "var(--text2)" }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l4 4v9H3V2z" fill="var(--surface2)" stroke="var(--border2)" strokeWidth="1.2"/><path d="M10 2v4h4" fill="none" stroke="var(--border2)" strokeWidth="1.2"/></svg>
              Sample document: Summary of Benefits — 2024
              <span style={{ background: "var(--teal)", color: "white", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10 }}>DEMO</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => router.push(`/chat/demo-aetna-sbc?q=${encodeURIComponent(q)}`)}
                style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px", textAlign: "left", cursor: "pointer", fontSize: 13.5, color: "var(--text)", lineHeight: 1.45, transition: "border-color 0.15s, box-shadow 0.15s", fontFamily: "inherit" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--teal)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(42,138,117,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >{q}</button>
            ))}
          </div>
        </div>

        <div className="fade-up" style={{ marginTop: 28, fontSize: 12, color: "var(--text3)", textAlign: "center", animationDelay: "0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}><rect x="2" y="5" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5V4a2 2 0 0 1 4 0v1" stroke="currentColor" strokeWidth="1.2"/></svg>
          <span>Your document stays in this browser session only. Nothing is stored or shared.</span>
        </div>
      </div>
    </main>
  );
}
