"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Plus, Anchor, Ship, Calendar, Users } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  { label: "Show upcoming shoots", icon: <Calendar size={12} /> },
  { label: "List active clients", icon: <Users size={12} /> },
  { label: "What leads are in the pipeline?", icon: <Anchor size={12} /> },
  { label: "Show all booked shoots", icon: <Ship size={12} /> },
];

function getSessionId(): string {
  if (typeof window === "undefined") return "default";
  let id = localStorage.getItem("vm-agent-session");
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("vm-agent-session", id);
  }
  return id;
}

export function MarineAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("default");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setSessionId(getSessionId()); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  function newChat() {
    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("vm-agent-session", id);
    setSessionId(id);
    setMessages([]);
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content }]);
    setLoading(true);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e: unknown) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${e instanceof Error ? e.message : "Something went wrong"}`,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)", maxHeight: "820px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent) 0%, #0d5a74 100%)" }}>
            <Bot size={16} style={{ color: "#f0ece4" }} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "#f0ece4", fontWeight: 500 }}>
              Marina Agent
            </h2>
            <p className="heading-xs" style={{ marginTop: "2px" }}>Powered by Groq · llama-3.3-70b · free</p>
          </div>
        </div>
        <button onClick={newChat}
          className="heading-xs flex items-center gap-1.5"
          style={{
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px",
            padding: "6px 14px", color: "rgba(240,236,228,0.5)",
            background: "transparent", cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
        >
          <Plus size={11} /> New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto card p-5 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(26,122,158,0.12)", border: "1px solid rgba(26,122,158,0.2)" }}>
              <Anchor size={26} style={{ color: "var(--accent)" }} />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.15rem", color: "#f0ece4", fontWeight: 500, marginBottom: "6px" }}>
              Vela Marine Assistant
            </h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(240,236,228,0.45)", maxWidth: "280px", lineHeight: 1.6, marginBottom: "24px" }}>
              Ask about your clients, vessels, upcoming shoots, or pipeline leads.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map(p => (
                <button key={p.label} onClick={() => send(p.label)}
                  className="flex items-center gap-1.5 heading-xs"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px",
                    padding: "7px 14px", color: "rgba(240,236,228,0.55)",
                    background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(240,236,228,0.55)"; }}
                >
                  {p.icon}{p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                style={{ background: "rgba(26,122,158,0.15)" }}>
                <Bot size={13} style={{ color: "var(--accent)" }} />
              </div>
            )}
            <div style={{
              maxWidth: "80%", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
              padding: "10px 16px", fontSize: "0.85rem", lineHeight: 1.65, whiteSpace: "pre-wrap",
              background: msg.role === "user"
                ? "linear-gradient(135deg, var(--accent) 0%, #0d5a74 100%)"
                : "rgba(255,255,255,0.04)",
              color: msg.role === "user" ? "#f0ece4" : "rgba(240,236,228,0.85)",
              border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
              style={{ background: "rgba(26,122,158,0.15)" }}>
              <Bot size={13} style={{ color: "var(--accent)" }} />
            </div>
            <div style={{ borderRadius: "4px 18px 18px 18px", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map(d => (
                  <span key={d} className="animate-bounce" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "block", animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts after first message */}
      {messages.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {QUICK_PROMPTS.slice(0, 3).map(p => (
            <button key={p.label} onClick={() => send(p.label)} disabled={loading}
              className="flex items-center gap-1.5 heading-xs"
              style={{
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px",
                padding: "6px 12px", color: "rgba(240,236,228,0.45)",
                background: "transparent", cursor: "pointer", opacity: loading ? 0.4 : 1,
              }}>
              {p.icon}{p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <textarea ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about shoots, clients, vessels, leads..."
          rows={1}
          style={{
            flex: 1, resize: "none", minHeight: "44px", maxHeight: "120px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px", padding: "10px 14px", color: "#f0ece4",
            fontSize: "0.875rem", lineHeight: 1.5, outline: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="btn-primary flex items-center gap-2"
          style={{ padding: "10px 16px", alignSelf: "flex-end", opacity: loading || !input.trim() ? 0.4 : 1 }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
