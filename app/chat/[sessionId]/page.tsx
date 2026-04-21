"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

const LORA = "var(--font-lora), 'Lora', serif";
const SLATE = "#2C3E5C";

type Citation = { page: number; text: string };
type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  type?: "answer" | "unknown" | "error" | "info";
};

/* ─── Parse [Page X] citations from text ─── */
function parseCitations(text: string) {
  const parts: { type: "text" | "citation"; content?: string; page?: number }[] = [];
  const regex = /\[Page (\d+)\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    parts.push({ type: "citation", page: parseInt(match[1]) });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ type: "text", content: text.slice(lastIndex) });
  return parts;
}

/* ─── Citation Badge ─── */
function CitationBadge({ page, isActive, onClick }: { page: number; isActive: boolean; onClick: (p: number) => void }) {
  return (
    <span className={`cite-badge ${isActive ? "active" : ""}`} onClick={() => onClick(page)} title={`View page ${page} excerpt`}>
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 2h8v1.5H2V2zm0 3h6v1.5H2V5zm0 3h8v1.5H2V8z" fill="currentColor"/></svg>
      p.{page}
    </span>
  );
}

/* ─── Message Bubble ─── */
function MessageBubble({ msg, activeCitation, onCitationClick }: { msg: Message; activeCitation: number | null; onCitationClick: (p: number) => void }) {
  if (msg.role === "user") {
    return (
      <div className="bubble-enter" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <div style={{ background: SLATE, color: "white", padding: "11px 16px", borderRadius: "18px 18px 4px 18px", maxWidth: "70%", fontSize: 14.5, lineHeight: 1.55 }}>
          {msg.content}
        </div>
      </div>
    );
  }

  const isUnknown = msg.type === "unknown";
  const parts = parseCitations(msg.content || "");

  return (
    <div className="bubble-enter" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, var(--teal) 0%, #1D6B5A 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="white"><path d="M10 2C5.58 2 2 5.58 2 10c0 1.85.6 3.56 1.6 4.95L2 18l3.05-1.6C6.44 17.4 8.15 18 10 18c4.42 0 8-3.58 8-8s-3.58-8-8-8z"/></svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", letterSpacing: "0.02em" }}>Plainly</span>
      </div>
      <div style={{ background: isUnknown ? "var(--red-bg)" : "white", border: `1px solid ${isUnknown ? "rgba(192,57,43,0.2)" : "var(--border)"}`, borderRadius: "4px 18px 18px 18px", padding: "14px 18px", maxWidth: "82%", fontSize: 14.5, lineHeight: 1.65, color: "var(--text)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {isUnknown && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(192,57,43,0.15)" }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="var(--red)" strokeWidth="1.5"/><path d="M10 6v5M10 13.5v.5" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--red)", letterSpacing: "0.02em", textTransform: "uppercase" }}>Not found in your document</span>
          </div>
        )}
        <p style={{ margin: 0 }}>
          {parts.map((part, i) =>
            part.type === "text"
              ? <span key={i}>{part.content}</span>
              : <CitationBadge key={i} page={part.page!} isActive={activeCitation === part.page} onClick={onCitationClick} />
          )}
        </p>
      </div>
      {parts.some(p => p.type === "citation") && (
        <div style={{ marginTop: 6, marginLeft: 4, fontSize: 12, color: "var(--text3)" }}>
          Tap <span style={{ color: "var(--teal)", fontWeight: 500 }}>p.XX</span> badges to see the exact document text
        </div>
      )}
    </div>
  );
}

/* ─── Thinking Bubble ─── */
function ThinkingBubble() {
  return (
    <div className="bubble-enter" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, var(--teal) 0%, #1D6B5A 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="white"><path d="M10 2C5.58 2 2 5.58 2 10c0 1.85.6 3.56 1.6 4.95L2 18l3.05-1.6C6.44 17.4 8.15 18 10 18c4.42 0 8-3.58 8-8s-3.58-8-8-8z"/></svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)" }}>Plainly</span>
      </div>
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: "4px 18px 18px 18px", padding: "16px 20px", display: "inline-flex", gap: 5, alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Citation Side Panel ─── */
function CitationPanel({ page, citations, onClose }: { page: number; citations: Citation[]; onClose: () => void }) {
  const data = citations.find(c => c.page === page);
  return (
    <div className="cite-panel" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 280, background: "white", padding: "24px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--teal)", marginBottom: 4 }}>Page {page}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: LORA }}>Document excerpt</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div style={{ width: "100%", height: 1, background: "var(--border)" }} />
      {data
        ? <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--text2)", fontStyle: "italic" }}>"{data.text}"</p>
        : <p style={{ fontSize: 13.5, color: "var(--text3)" }}>No excerpt available for this page.</p>
      }
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text3)" }}>
        From your uploaded document
      </div>
    </div>
  );
}

const QUICK_QUESTIONS = ["What's my deductible?", "Is my therapist covered?", "How does the ER copay work?"];

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const isDemo = sessionId.startsWith("demo-");
  const initialQ = searchParams.get("q");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const msgRefs = useRef<Record<number, HTMLDivElement>>({});
  const sentInitial = useRef(false);

  useEffect(() => {
    if (sentInitial.current) return;
    sentInitial.current = true;
    if (initialQ) {
      sendMessage(initialQ);
    } else {
      setMessages([{ id: 0, role: "assistant", type: "info", content: "I've read through your insurance document. Ask me anything — what's covered, what you'll owe, why a claim might be denied. I'll answer in plain English and point you to the exact page." }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Cleanup session on unmount (skip demo sessions)
  useEffect(() => {
    if (isDemo) return;
    return () => { navigator.sendBeacon(`/api/session/${sessionId}`, JSON.stringify({ _method: "DELETE" })); };
  }, [sessionId, isDemo]);

  const sendMessage = useCallback(async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now(), role: "user", content: q };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setActiveCitation(null);

    let answer = "";
    const aiId = Date.now() + 1;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, question: q }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      setMessages(prev => [...prev, { id: aiId, role: "assistant", type: "answer", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          const raw = line.slice(6);
          if (raw === "[DONE]") break;

          try {
            const parsed = JSON.parse(raw);
            if (typeof parsed === "string") {
              answer += parsed;
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: answer } : m));
            } else if (parsed?.type === "citations") {
              setCitations(parsed.data);
            }
          } catch {}
        }
      }

      const isUnknown = answer.toLowerCase().includes("couldn't find") || answer.toLowerCase().includes("not in") || answer.toLowerCase().includes("call your insurer");
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, type: isUnknown ? "unknown" : "answer" } : m));

    } catch {
      setMessages(prev => prev.map(m => m.id === aiId
        ? { ...m, type: "error", content: "Something went wrong. Please try again." }
        : m
      ));
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [input, loading, sessionId]);

  const userMessages = messages.filter(m => m.role === "user");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 52, background: "white", borderBottom: "1px solid var(--border)", flexShrink: 0, zIndex: 5, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, var(--teal) 0%, #1D6B5A 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="white"><path d="M10 2C5.58 2 2 5.58 2 10c0 1.85.6 3.56 1.6 4.95L2 18l3.05-1.6C6.44 17.4 8.15 18 10 18c4.42 0 8-3.58 8-8s-3.58-8-8-8z"/></svg>
          </div>
          <span style={{ fontFamily: LORA, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>Plainly</span>
          <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 2px" }} />
          <button onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "var(--text2)", fontSize: 12.5, padding: "4px 6px", borderRadius: 6, transition: "background 0.15s, color 0.15s", fontFamily: "inherit" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text2)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8l5-5 5 5M4.5 6.5V13h3v-3h1v3h3V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            New document
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 12px 4px 8px", fontSize: 12, color: "var(--text2)", maxWidth: 260, overflow: "hidden", flexShrink: 1 }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M3 2h7l4 4v9H3V2z" fill="var(--surface2)" stroke="var(--border2)" strokeWidth="1.2"/><path d="M10 2v4h4" fill="none" stroke="var(--border2)" strokeWidth="1.2"/></svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isDemo ? "Sample Plan — Demo" : "Your document"}
          </span>
          {isDemo && <span style={{ background: "var(--teal)", color: "white", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, flexShrink: 0 }}>DEMO</span>}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          <button onClick={() => setHistoryOpen(h => !h)} style={{ display: "flex", alignItems: "center", gap: 5, background: historyOpen ? "var(--surface)" : "none", border: `1px solid ${historyOpen ? "var(--border)" : "transparent"}`, cursor: "pointer", color: historyOpen ? "var(--text)" : "var(--text2)", fontSize: 12.5, padding: "4px 10px", borderRadius: 20, transition: "all 0.15s", fontFamily: "inherit" }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            History {userMessages.length > 0 && <span style={{ background: "var(--teal)", color: "white", fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 10, marginLeft: 2 }}>{userMessages.length}</span>}
          </button>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)" }} />
            <span style={{ fontSize: 12, color: "var(--teal)", fontWeight: 500 }}>Ready</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* History sidebar */}
        {historyOpen && (
          <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", background: "white", display: "flex", flexDirection: "column", overflowY: "auto", animation: "slideInLeft 0.2s ease" }}>
            <div style={{ padding: "14px 14px 8px", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text3)" }}>This session</div>
            {userMessages.length === 0
              ? <div style={{ padding: "8px 14px 14px", fontSize: 12.5, color: "var(--text3)", lineHeight: 1.5 }}>Your questions will appear here as you ask them.</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 6px 12px" }}>
                  {userMessages.map((m, i) => (
                    <button key={m.id} onClick={() => { const el = msgRefs.current[m.id]; if (el && scrollRef.current) scrollRef.current.scrollTop = el.offsetTop - 24; }}
                      style={{ background: "none", border: "none", borderRadius: 7, padding: "8px 10px", textAlign: "left", cursor: "pointer", fontSize: 12.5, color: "var(--text2)", lineHeight: 1.45, transition: "background 0.12s, color 0.12s", display: "flex", gap: 8, alignItems: "flex-start", fontFamily: "inherit" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text2)"; }}
                    >
                      <span style={{ fontSize: 11, color: "var(--text3)", marginTop: 1, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as any}>{m.content}</span>
                    </button>
                  ))}
                </div>
            }
            <div style={{ marginTop: "auto", padding: "12px 14px", borderTop: "1px solid var(--border)", fontSize: 11.5, color: "var(--text3)", lineHeight: 1.5 }}>Session only — clears on close</div>
          </div>
        )}

        {/* Chat + citation */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 24px 8px", paddingRight: activeCitation !== null ? 300 : 24, transition: "padding-right 0.25s ease" }}>
            {messages.map(msg => (
              <div key={msg.id} ref={el => { if (el) msgRefs.current[msg.id] = el; }}>
                <MessageBubble msg={msg} activeCitation={activeCitation} onCitationClick={p => setActiveCitation(prev => prev === p ? null : p)} />
              </div>
            ))}
            {loading && <ThinkingBubble />}
            <div style={{ height: 8 }} />
          </div>
          {activeCitation !== null && <CitationPanel page={activeCitation} citations={citations} onClose={() => setActiveCitation(null)} />}
        </div>
      </div>

      {/* Input area */}
      <div style={{ padding: "12px 20px 16px", background: "white", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        {messages.length <= 1 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {QUICK_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "5px 12px", fontSize: 12.5, color: "var(--text2)", cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--teal)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
              >{q}</button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); e.currentTarget.style.height = "auto"; e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 120) + "px"; }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything about your coverage…"
            style={{ flex: 1, height: 44, minHeight: 44, padding: "11px 14px", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, fontSize: 14.5, color: "var(--text)", outline: "none", fontFamily: "inherit", lineHeight: 1.5, transition: "border-color 0.15s" }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--teal)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            style={{ width: 44, height: 44, borderRadius: 12, border: "none", flexShrink: 0, background: input.trim() && !loading ? "var(--teal)" : "var(--surface2)", color: input.trim() && !loading ? "white" : "var(--text3)", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s, color 0.15s" }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 10h14M10 4l7 6-7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--text3)", textAlign: "center" }}>
          Answers are based on your document only. For decisions, always confirm with your insurer.
        </div>
      </div>
    </div>
  );
}
