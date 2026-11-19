# Pulsar AI — Space-Themed AI Chat Bot

A Grok-inspired AI chat interface powered by Groq API, built with Next.js 16, Tailwind CSS, and TypeScript.

## Features

- 🌌 **Animated Starfield** — Live canvas star field with shooting stars and nebula glow
- ✦ **3 AI Personalities** — Space Oracle, Grok Outlaw, Quantum Engineer
- 🤖 **Multiple Models** — GPT-OSS 120B, GPT-OSS 20B, Qwen 3.8 27B (via Groq)
- ⚡ **Streaming responses** — Real-time token streaming
- 🔭 **Cosmic suggestion prompts** — Quick-start space questions
- ⚙️ **Settings panel** — Switch personality, model, and API key on the fly
- 📱 **Fully responsive** — Works on mobile and desktop

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your Groq API key:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GROQ_API_KEY
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set environment variable `GROQ_API_KEY` in Vercel dashboard
4. Deploy!

## Project Structure

```
pulsar-ai/
├── app/
│   ├── api/chat/route.ts   # Groq streaming API endpoint
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Entry page
│   └── globals.css         # Cosmic theme styles
├── components/
│   ├── Starfield.tsx       # Canvas animated star field
│   ├── ChatBubble.tsx      # Message bubble with Markdown
│   ├── SettingsPanel.tsx   # Personality/model/key settings
│   └── PulsarChat.tsx      # Main chat UI
├── .env.local              # Your Groq API key (gitignored)
└── .env.example            # Template for env vars
```

## Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: Groq SDK (streaming chat completions)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Markdown**: react-markdown + remark-gfm
