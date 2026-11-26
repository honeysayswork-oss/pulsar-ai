"use client";

import { useState } from "react";
import { X, ChevronDown, Check, RotateCcw, Info } from "lucide-react";

type Personality = "oracle" | "grok" | "quantum";
type Model = { id: string; label: string; desc: string };

export interface AIParams {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPromptOverride: string;
}

export const DEFAULT_PARAMS: AIParams = {
  temperature: 0.65,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemPromptOverride: "",
};

interface SettingsPanelProps {
  onClose: () => void;
  personality: Personality;
  setPersonality: (p: Personality) => void;
  model: string;
  setModel: (m: string) => void;
  clientApiKey: string;
  setClientApiKey: (k: string) => void;
  aiParams: AIParams;
  setAiParams: (p: AIParams) => void;
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

type Tab = "personality" | "model" | "params" | "api";

interface SliderRowProps {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  left: string;
  right: string;
}

function SliderRow({ label, hint, value, min, max, step, onChange, left, right }: SliderRowProps) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-white font-medium">{label}</span>
          <span className="group relative cursor-help">
            <Info size={11} className="text-gray-500" />
            <span
              className="absolute left-4 top-0 z-20 w-52 text-xs rounded-lg p-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(10,15,30,0.98)", border: "1px solid rgba(56,189,248,0.25)", color: "#94a3b8" }}
            >
              {hint}
            </span>
          </span>
        </div>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-md"
          style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8" }}
        >
          {value.toFixed(step < 1 ? 2 : 0)}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #38bdf8 0%, #7c3aed ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%)`,
          accentColor: "#38bdf8",
        }}
      />
      <div className="flex justify-between text-[10px] text-gray-600 mt-1">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

export default function SettingsPanel({
  onClose,
  personality,
  setPersonality,
  model,
  setModel,
  clientApiKey,
  setClientApiKey,
  aiParams,
  setAiParams,
}: SettingsPanelProps) {
  const [localKey, setLocalKey] = useState(clientApiKey);
  const [localParams, setLocalParams] = useState<AIParams>({ ...aiParams });
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("personality");

  const selectedModel = MODELS.find((m) => m.id === model) || MODELS[0];

  const setParam = <K extends keyof AIParams>(key: K, val: AIParams[K]) => {
    setLocalParams((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    setClientApiKey(localKey.trim());
    setAiParams(localParams);
    onClose();
  };

  const handleReset = () => {
    setLocalParams({ ...DEFAULT_PARAMS });
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "personality", label: "Persona", icon: "🌌" },
    { id: "model", label: "Model", icon: "🤖" },
    { id: "params", label: "Params", icon: "🎛️" },
    { id: "api", label: "API Key", icon: "🔑" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl relative flex flex-col"
        style={{
          background: "rgba(10,15,30,0.97)",
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 0 60px rgba(109,40,217,0.3), 0 25px 50px rgba(0,0,0,0.6)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
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

        {/* Tabs */}
        <div
          className="flex gap-1 mx-6 mb-4 p-1 rounded-xl flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === t.id ? "rgba(109,40,217,0.35)" : "transparent",
                color: activeTab === t.id ? "#c4b5fd" : "#6b7280",
                border: activeTab === t.id ? "1px solid rgba(139,92,246,0.4)" : "1px solid transparent",
              }}
            >
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 pb-4 flex-1">

          {/* ── PERSONALITY TAB ── */}
          {activeTab === "personality" && (
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
          )}

          {/* ── MODEL TAB ── */}
          {activeTab === "model" && (
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown((v) => !v)}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all mb-1"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(56,189,248,0.25)" }}
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
                  className="w-full rounded-xl overflow-hidden"
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
          )}

          {/* ── PARAMS TAB ── */}
          {activeTab === "params" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-gray-500">Fine-tune how the AI generates responses.</p>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors text-gray-400 hover:text-white"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <RotateCcw size={10} /> Reset
                </button>
              </div>

              <SliderRow
                label="Temperature"
                hint="Controls randomness. Low = focused & deterministic. High = creative & unpredictable."
                value={localParams.temperature}
                min={0} max={2} step={0.01}
                onChange={(v) => setParam("temperature", v)}
                left="Precise (0)"
                right="Wild (2)"
              />

              <SliderRow
                label="Max Tokens"
                hint="Maximum length of the response. 1 token ≈ 4 characters. Higher = longer replies."
                value={localParams.maxTokens}
                min={256} max={8192} step={256}
                onChange={(v) => setParam("maxTokens", v)}
                left="Short (256)"
                right="Long (8192)"
              />

              <SliderRow
                label="Top P (Nucleus)"
                hint="Limits tokens to top P% cumulative probability. Lower = more focused vocabulary."
                value={localParams.topP}
                min={0.01} max={1} step={0.01}
                onChange={(v) => setParam("topP", v)}
                left="Narrow (0)"
                right="All tokens (1)"
              />

              <SliderRow
                label="Frequency Penalty"
                hint="Penalises tokens that have already appeared. Higher = less repetition of the same words."
                value={localParams.frequencyPenalty}
                min={-2} max={2} step={0.1}
                onChange={(v) => setParam("frequencyPenalty", v)}
                left="Allow repeats"
                right="Avoid repeats"
              />

              <SliderRow
                label="Presence Penalty"
                hint="Penalises tokens that appeared at all. Higher = more likely to introduce new topics."
                value={localParams.presencePenalty}
                min={-2} max={2} step={0.1}
                onChange={(v) => setParam("presencePenalty", v)}
                left="Stay on topic"
                right="Explore topics"
              />

              {/* System Prompt Override */}
              <div className="mt-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm text-white font-medium">System Prompt Override</span>
                  <span className="group relative cursor-help">
                    <Info size={11} className="text-gray-500" />
                    <span
                      className="absolute left-4 top-0 z-20 w-52 text-xs rounded-lg p-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(10,15,30,0.98)", border: "1px solid rgba(56,189,248,0.25)", color: "#94a3b8" }}
                    >
                      Completely replace the personality prompt with your own. Leave blank to use the selected personality.
                    </span>
                  </span>
                </div>
                <textarea
                  value={localParams.systemPromptOverride}
                  onChange={(e) => setParam("systemPromptOverride", e.target.value)}
                  placeholder="e.g. You are a helpful assistant that only speaks in haiku..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none resize-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(56,189,248,0.2)",
                    lineHeight: "1.6",
                  }}
                />
                <p className="text-[10px] text-gray-600 mt-1">Leave blank to use the personality preset above.</p>
              </div>
            </div>
          )}

          {/* ── API KEY TAB ── */}
          {activeTab === "api" && (
            <div>
              <input
                type="password"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="gsk_... (uses server key if blank)"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all mb-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  fontFamily: "monospace",
                }}
              />
              <p className="text-xs text-gray-500">
                Your key is used directly in the browser and never stored on our servers. The server&#39;s built-in key is used if you leave this blank.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
    </div>
  );
}
