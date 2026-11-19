"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Settings, Send, RotateCcw, Zap } from "lucide-react";
import Starfield from "@/components/Starfield";
import ChatBubble from "@/components/ChatBubble";
import SettingsPanel from "@/components/SettingsPanel";

type Message = { role: "user" | "assistant"; content: string };
type Personality = "oracle" | "grok" | "quantum";

const SUGGESTIONS = [
  "🌌 What is at the center of the Milky Way?",
  "⚡ What would happen if a neutron star hit Earth?",
  "🔭 Explain black hole information paradox simply",
  "🚀 How would a warp drive actually work?",
  "✨ What existed before the Big Bang?",
];

const PERSONALITY_LABELS: Record<Personality, string> = {
  oracle: "Space Oracle",
  grok: "Grok Outlaw",
  quantum: "Quantum Engineer",
};

export default function PulsarChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [personality, setPersonality] = useState<Personality>("oracle");
  const [model, setModel] = useState("openai/gpt-oss-120b");
  const [clientApiKey, setClientApiKey] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 180) + "px";
    }
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || streaming) return;

      const userMsg: Message = { role: "user", content: content.trim() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            model,
            personality,
            clientApiKey,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Error ${res.status}`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantContent };
            return updated;
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `⚠️ **Pulsar encountered a disturbance in the cosmos:** ${err.message}`,
            },
          ]);
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, model, personality, clientApiKey]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const handleReset = () => {
    if (streaming) handleStop();
    setMessages([]);
    setInput("");
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden" style={{ background: "#030712" }}>
      {/* Starfield BG */}
      <Starfield />

      {/* Top Navbar */}
      <nav
        className="relative z-10 flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: "rgba(3,7,18,0.8)",
          borderBottom: "1px solid rgba(139,92,246,0.18)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm animate-pulse-slow"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
              boxShadow: "0 0 18px rgba(14,165,233,0.7)",
            }}
          >
            ✦
          </div>
          <div>
            <span
              className="font-bold text-base tracking-wide"
              style={{
                background: "linear-gradient(90deg, #38bdf8, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pulsar AI
            </span>
            <div className="text-[10px] text-gray-500 leading-none">
              {PERSONALITY_LABELS[personality]}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {hasMessages && (
            <button
              onClick={handleReset}
              title="New conversation"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <RotateCcw size={12} />
              New
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Settings size={16} />
          </button>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4" id="chat-area">
        {!hasMessages ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center h-full gap-8 max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-5 animate-float"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
                  boxShadow: "0 0 40px rgba(14,165,233,0.5), 0 0 80px rgba(109,40,217,0.3)",
                }}
              >
                ✦
              </div>
              <h1
                className="text-4xl font-bold mb-3"
                style={{
                  background: "linear-gradient(90deg, #38bdf8 0%, #a78bfa 50%, #f472b6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Pulsar AI
              </h1>
              <p className="text-gray-400 text-base max-w-xs mx-auto">
                Your cosmic intelligence for exploring the universe — and everything else.
              </p>
            </div>

            {/* Suggestions */}
            <div className="w-full max-w-lg grid grid-cols-1 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s.replace(/^[^\s]+\s/, ""))}
                  className="text-left px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white transition-all group"
                  style={{
                    background: "rgba(13,17,30,0.6)",
                    border: "1px solid rgba(139,92,246,0.18)",
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.4)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(13,17,30,0.9)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.18)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(13,17,30,0.6)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto pb-4">
            {messages.map((m, i) => (
              <ChatBubble
                key={i}
                role={m.role}
                content={m.content}
                streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div
        className="relative z-10 flex-shrink-0 px-4 py-3"
        style={{
          background: "rgba(3,7,18,0.85)",
          borderTop: "1px solid rgba(139,92,246,0.15)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="flex items-end gap-2 rounded-2xl p-2"
            style={{
              background: "rgba(13,17,30,0.8)",
              border: "1px solid rgba(56,189,248,0.25)",
              boxShadow: "0 0 24px rgba(14,165,233,0.1)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Pulsar anything across the cosmos…"
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-200 placeholder-gray-500 px-2 py-1.5 leading-relaxed"
              style={{ minHeight: "36px", maxHeight: "180px" }}
              disabled={streaming}
            />

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {streaming ? (
                <button
                  onClick={handleStop}
                  className="p-2.5 rounded-xl text-white transition-all"
                  style={{
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                  title="Stop generation"
                >
                  <Zap size={16} className="text-red-400" />
                </button>
              ) : (
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #6d28d9, #0ea5e9)"
                      : "rgba(255,255,255,0.08)",
                    boxShadow: input.trim() ? "0 0 18px rgba(109,40,217,0.5)" : "none",
                  }}
                  title="Send message"
                >
                  <Send size={16} />
                </button>
              )}
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-2">
            Powered by Groq · Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          personality={personality}
          setPersonality={setPersonality}
          model={model}
          setModel={setModel}
          clientApiKey={clientApiKey}
          setClientApiKey={setClientApiKey}
        />
      )}
    </div>
  );
}
