"use client";

import { useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";

type Personality = "oracle" | "grok" | "quantum";
type Model = {
  id: string;
  label: string;
  desc: string;
};

interface SettingsPanelProps {
  onClose: () => void;
  personality: Personality;
  setPersonality: (p: Personality) => void;
  model: string;
  setModel: (m: string) => void;
  clientApiKey: string;
  setClientApiKey: (k: string) => void;
}

const MODELS: Model[] = [
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", desc: "Most powerful — deep reasoning" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B", desc: "Fast & capable" },
  { id: "qwen/qwen3.8-27b", label: "Qwen 3.8 27B", desc: "Multilingual powerhouse" },
];

const PERSONALITIES = [
  { id: "oracle" as Personality, icon: "🔭", label: "Space Oracle", desc: "Deep, wise, cosmic philosopher" },
  { id: "grok" as Personality, icon: "⚡", label: "Grok Outlaw", desc: "Witty, sarcastic, unfiltered" },
  { id: "quantum" as Personality, icon: "⚙️", label: "Quantum Engineer", desc: "Ultra-precise, code-focused" },
];

export default function SettingsPanel({
  onClose,
  personality,
  setPersonality,
  model,
  setModel,
  clientApiKey,
  setClientApiKey,
}: SettingsPanelProps) {
  const [localKey, setLocalKey] = useState(clientApiKey);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const selectedModel = MODELS.find((m) => m.id === model) || MODELS[0];

  const handleSave = () => {
    setClientApiKey(localKey.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 relative"
        style={{
          background: "rgba(10,15,30,0.95)",
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 0 60px rgba(109,40,217,0.3), 0 25px 50px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-white font-semibold text-lg">Pulsar Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Personality */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3 block">
            🌌 Personality Mode
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PERSONALITIES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPersonality(p.id)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                style={{
                  background: personality === p.id ? "rgba(109,40,217,0.25)" : "rgba(255,255,255,0.04)",
                  border: personality === p.id ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: personality === p.id ? "0 0 20px rgba(109,40,217,0.2)" : "none",
                }}
              >
                <span className="text-xl">{p.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{p.label}</div>
                  <div className="text-xs text-gray-400">{p.desc}</div>
                </div>
                {personality === p.id && <Check size={14} className="text-violet-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Model */}
        <div className="mb-6 relative">
          <label className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3 block">
            🤖 AI Model
          </label>
          <button
            onClick={() => setShowModelDropdown((v) => !v)}
            className="w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(56,189,248,0.25)",
            }}
          >
            <div className="text-left">
              <div className="text-sm font-medium text-white">{selectedModel.label}</div>
              <div className="text-xs text-gray-400">{selectedModel.desc}</div>
            </div>
            <ChevronDown
              size={16}
              className="text-gray-400 transition-transform"
              style={{ transform: showModelDropdown ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          {showModelDropdown && (
            <div
              className="absolute w-full mt-1 rounded-xl overflow-hidden z-10"
              style={{
                background: "rgba(10,15,30,0.98)",
                border: "1px solid rgba(56,189,248,0.25)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setModel(m.id); setShowModelDropdown(false); }}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left"
                >
                  <div>
                    <div className="text-sm text-white">{m.label}</div>
                    <div className="text-xs text-gray-400">{m.desc}</div>
                  </div>
                  {model === m.id && <Check size={14} className="text-sky-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* API Key */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-3 block">
            🔑 Groq API Key (optional override)
          </label>
          <input
            type="password"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="gsk_... (uses server key if blank)"
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-1"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(56,189,248,0.2)",
              fontFamily: "monospace",
            }}
          />
          <p className="text-xs text-gray-500 mt-2">
            Your key is used directly in the browser and never stored on our servers.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #6d28d9 0%, #0ea5e9 100%)",
            boxShadow: "0 0 24px rgba(109,40,217,0.4)",
          }}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}
