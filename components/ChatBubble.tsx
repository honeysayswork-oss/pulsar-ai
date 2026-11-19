"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function ChatBubble({ role, content, streaming }: ChatBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-4 group">
        <div className="flex items-end gap-2 max-w-[80%]">
          <div
            style={{
              background: "linear-gradient(135deg, #6d28d9 0%, #0ea5e9 100%)",
              boxShadow: "0 0 20px rgba(109, 40, 217, 0.4)",
            }}
            className="rounded-2xl rounded-br-sm px-4 py-3 text-white text-sm leading-relaxed"
          >
            {content}
          </div>
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
          >
            U
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 group">
      <div className="flex items-start gap-2 max-w-[90%]">
        {/* Pulsar Avatar */}
        <div className="flex-shrink-0 relative w-8 h-8 mt-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #7c3aed)",
              boxShadow: "0 0 14px rgba(14, 165, 233, 0.6)",
            }}
          >
            ✦
          </div>
        </div>

        {/* Message bubble */}
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: "rgba(13, 17, 30, 0.75)",
            border: "1px solid rgba(56, 189, 248, 0.22)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            color: "#e2e8f0",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ children, className, ...rest }) {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      className="rounded px-1 py-0.5 font-mono text-xs"
                      style={{ background: "rgba(56,189,248,0.1)", color: "#7dd3fc" }}
                      {...rest}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <div
                    className="rounded-lg overflow-auto my-2"
                    style={{ background: "rgba(2,6,23,0.9)", border: "1px solid rgba(56,189,248,0.2)" }}
                  >
                    <pre className="p-4 overflow-auto">
                      <code className="font-mono text-xs" style={{ color: "#bae6fd" }} {...rest}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
              },
              h1({ children }) {
                return <h1 className="text-lg font-bold mb-2" style={{ color: "#7dd3fc" }}>{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-base font-bold mb-2" style={{ color: "#93c5fd" }}>{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-sm font-semibold mb-1" style={{ color: "#a5b4fc" }}>{children}</h3>;
              },
              strong({ children }) {
                return <strong className="font-semibold" style={{ color: "#bae6fd" }}>{children}</strong>;
              },
              blockquote({ children }) {
                return (
                  <blockquote
                    className="pl-3 italic my-2"
                    style={{ borderLeft: "3px solid rgba(56,189,248,0.5)", color: "#94a3b8" }}
                  >
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
          {streaming && (
            <span
              className="inline-block w-2 h-4 ml-1 rounded-sm animate-pulse"
              style={{ background: "linear-gradient(90deg, #38bdf8, #7c3aed)" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
