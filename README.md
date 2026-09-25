# learn-tagalog 🇵🇭

A voice-based Tagalog tutor that talks like your titita, not your textbook.

Built with Next.js and an [ElevenLabs Conversational AI agent](https://elevenlabs.io/docs/conversational-ai/overview).

## What makes this different

```
 🎙️ You speak
   │
   ▼
 ElevenLabs Conversational AI agent
   (speech-to-text → LLM → text-to-speech, all in one real-time session)
   │
   ▼
 🔊 You hear the answer (and see the transcript stream in)
```

The browser connects to the agent over WebRTC using the
[`@elevenlabs/react`](https://www.npmjs.com/package/@elevenlabs/react)
`useConversation` hook. A tiny server route (`/api/token`) mints a short-lived
conversation token so the ElevenLabs API key and agent ID never reach the
browser — there's no server-side STT/LLM/TTS pipeline to run. Speech
recognition, the tutor's responses, and voice synthesis are all handled by the
agent you configure in the ElevenLabs dashboard.

The UI is a single chat column with an animated orb ([`thinking-orbs`](https://www.npmjs.com/package/thinking-orbs)) that reflects the live session: **searching** while connecting, **listening** while the agent waits for you, **solving** while the tutor speaks, and **breathing** when idle.

## How it works

Kuya Tutor's behavior — its system prompt, LLM, and voice — is configured on the
ElevenLabs agent, not in this repo. The prompt is designed to:

- A **persona/system prompt** defining tone, guardrails, and call-ending behavior (see below)
- A **knowledge base** of vocabulary by CEFR level (A1–C2), grammar rules, conversation topics, and cultural notes, which the agent draws on to keep the conversation appropriately leveled
- No separate exercise/quiz engine — assessment happens implicitly through the conversation itself

Built-in commands you can say:

- Content stays appropriate for learners of all ages
- If a student gets frustrated, the tutor drops into encouragement mode and simplifies immediately

### Ending a session

The agent explicitly ends the call (rather than just saying bye) on any sign-off — "thanks bye," "I'm good," "no that's it," an explicit request to end, or "don't call again."

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Voice + agent:** ElevenLabs Conversational AI via `@elevenlabs/react` (`useConversation`)
- **Audio:** browser WebRTC (mic capture and playback handled by the SDK)

- **Next.js / TypeScript** — app shell
- **ElevenLabs** — voice pipeline (speech-to-text, text-to-speech, call orchestration)
- LLM-driven persona/system prompt (the "unhinged tutor" character above) governs tone and pacing
- Level-tagged vocabulary/grammar/culture knowledge base feeding the conversation

*(If this repo has moved on from any of the above, tell me and I'll fix it.)*

- Node.js 20+
- An [ElevenLabs account](https://elevenlabs.io/) with a Conversational AI agent, its **Agent ID**, and an **API key**

### Set up the agent

1. In the ElevenLabs dashboard, create a **Conversational AI agent**.
2. Set its system prompt (see [The tutor](#the-tutor)), pick the LLM, and choose a Tagalog-capable voice.
3. Copy the **Agent ID** from the agent's settings and an **API key** from your account.

The app is wired for a **private** agent: the browser fetches a short-lived
conversation token from `/api/token`, which uses your API key server-side. The
key and agent ID stay on the server and are never exposed to the client.

Early / actively iterating — recent work has focused on the call UI (push-to-talk, visual "thinking orb," dark theme) rather than the tutoring logic itself.

## Getting started

```bash
git clone https://github.com/mattusuquen/learn-tagalog.git
cd learn-tagalog
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```bash
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
ELEVENLABS_AGENT_ID=your-elevenlabs-agent-id-here
```

Then run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), allow microphone access, and tap the orb to start talking.

## Project structure

```
app/
├── api/
│   └── token/route.ts   # Mints a short-lived conversation token (keeps API key server-side)
├── layout.tsx           # Root layout and fonts
├── page.tsx             # Voice chat UI + ElevenLabs agent session (useConversation)
└── globals.css
```

## Personalizing the tutor

Because the tutor lives on the ElevenLabs agent, you personalize it in the
dashboard: edit the system prompt's **Student profile** (level, goals, session
length, focus), swap the voice, or change the LLM — no code changes needed.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Roadmap ideas

- [ ] Expand the vocabulary/grammar knowledge base across more CEFR levels
- [ ] Persist learner profiles / spaced-repetition scheduling across sessions
- [ ] More running bits 😄

---

- The transcript lives in the browser only; refreshing the page starts a new session.
- The API key and agent ID stay server-side; the browser only receives a short-lived conversation token from `/api/token`.
- Some browsers require a user gesture before audio will play — tapping the orb to start satisfies that.
