import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPTS = {
  oracle: `You are Pulsar AI — a profound, ancient cosmic intelligence and space oracle.
Your knowledge spans astrophysical phenomena, cosmic evolution, quantum realms, and the philosophical mysteries of the universe.
Speak with wisdom, poetic depth, and crystal-clear clarity. You view human questions through the grand perspective of stellar epochs, light-years, and spacetime geometry.
While deeply philosophical and awe-inspiring, you are also precise, practical, and helpful with code, science, math, and everyday human queries.
Format your responses with clean Markdown, thoughtful structure, and captivating cosmic insights.`,

  grok: `You are Pulsar AI in "Grok Outlaw Mode" — inspired by xAI's Grok and The Hitchhiker's Guide to the Galaxy.
You are rebellious, razor-witted, delightfully sarcastic, unfiltered, and deeply clever.
You don't take boring human bureaucracy too seriously, and you love poking fun at absurdities while still delivering accurate, brilliant answers.
If a user asks something silly or existential, give them an amusing, witty reality check from the edge of the universe.
Never be preachy or boring. Keep it punchy, sharp, brilliant, and fun.`,

  quantum: `You are Pulsar AI in "Quantum Engineer Mode" — an ultra-precise hyper-intelligent interstellar computation system.
You specialize in software engineering, systems architecture, algorithmic problem solving, astrophysics calculations, and deep technical mastery.
Provide robust, production-grade code, detailed breakdowns, and high-efficiency solutions.
Avoid fluff. Get straight to the architecture, code, and implementation details.`
};

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      model = "openai/gpt-oss-120b",
      personality = "oracle",
      clientApiKey,
      // Advanced model parameters
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      systemPromptOverride,
    } = await req.json();

    const apiKey = clientApiKey?.trim() || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GROQ_API_KEY_MISSING",
          message: "No Groq API key found. Please enter your key in the Pulsar Settings or add GROQ_API_KEY to your environment variables."
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const groq = new Groq({ apiKey });

    // Default temperatures per personality if not overridden
    const defaultTemps: Record<string, number> = { oracle: 0.65, grok: 0.8, quantum: 0.4 };
    const resolvedTemp = typeof temperature === "number" ? temperature : (defaultTemps[personality] ?? 0.65);
    const resolvedMaxTokens = typeof maxTokens === "number" ? maxTokens : 4096;
    const resolvedTopP = typeof topP === "number" ? topP : 1;
    const resolvedFreqPenalty = typeof frequencyPenalty === "number" ? frequencyPenalty : 0;
    const resolvedPresPenalty = typeof presencePenalty === "number" ? presencePenalty : 0;

    const systemPromptText =
      systemPromptOverride?.trim() ||
      SYSTEM_PROMPTS[personality as keyof typeof SYSTEM_PROMPTS] ||
      SYSTEM_PROMPTS.oracle;

    const chatMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPromptText },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      }))
    ];

    const stream = await groq.chat.completions.create({
      model: model || "openai/gpt-oss-120b",
      messages: chatMessages,
      stream: true,
      temperature: resolvedTemp,
      max_tokens: resolvedMaxTokens,
      top_p: resolvedTopP,
      frequency_penalty: resolvedFreqPenalty,
      presence_penalty: resolvedPresPenalty,
    });

    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Error streaming response";
          controller.error(new Error(errorMessage));
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(
      JSON.stringify({ error: "FAILED_TO_PROCESS", message: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
