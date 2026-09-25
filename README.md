# Learn Tagalog 🇵🇭

A voice-first AI tutor for learning conversational Tagalog. Tap the orb, speak (in English, Tagalog, or Taglish), and **Kuya Tutor** answers out loud, walking you through vocabulary, grammar, pronunciation, and cultural context one short exchange at a time.

Built with Next.js and an [ElevenLabs Conversational AI agent](https://elevenlabs.io/docs/conversational-ai/overview).

## How it works

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

## The tutor

Kuya Tutor's behavior — its system prompt, LLM, and voice — is configured on the
ElevenLabs agent, not in this repo. The prompt is designed to:

- Teach everyday Manila Tagalog as it's actually spoken, including natural Taglish, and flag formal vs. casual usage
- Give every new word with a pronunciation guide (stressed syllable in caps, e.g. *sa-LA-mat*), glottal-stop notes where meaning changes, and an English gloss
- Introduce only 3–5 new words or one grammar point per session, covering markers (*ang/ng/sa*), verb focus and aspect, linkers, enclitics, and politeness (*po/opo*)
- Follow a session structure: warm-up → spaced-repetition review → new material → practice → wrap-up
- Correct mistakes by showing the fix first, then briefly explaining why, and nudge you to answer in Tagalog

Built-in commands you can say:

| Command | What it does |
| --- | --- |
| `quiz me` | Runs a 5-question quiz on recent material |
| `free talk` | Relaxed conversation in Tagalog, correcting only major errors |
| `English please` | Switches explanations to English |

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Voice + agent:** ElevenLabs Conversational AI via `@elevenlabs/react` (`useConversation`)
- **Audio:** browser WebRTC (mic capture and playback handled by the SDK)

## Getting started

### Prerequisites

- Node.js 20+
- An [ElevenLabs account](https://elevenlabs.io/) with a Conversational AI agent, its **Agent ID**, and an **API key**

### Set up the agent

1. In the ElevenLabs dashboard, create a **Conversational AI agent**.
2. Set its system prompt (see [The tutor](#the-tutor)), pick the LLM, and choose a Tagalog-capable voice.
3. Copy the **Agent ID** from the agent's settings and an **API key** from your account.

The app is wired for a **private** agent: the browser fetches a short-lived
conversation token from `/api/token`, which uses your API key server-side. The
key and agent ID stay on the server and are never exposed to the client.

### Setup

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

## Roadmap

- [ ] Pronunciation scoring on spoken answers
- [ ] Persist session history so spaced-repetition review carries across sessions
- [ ] Show-translation toggle for tutor replies
- [ ] Configurable student profile from the UI

## Notes

- The transcript lives in the browser only; refreshing the page starts a new session.
- The API key and agent ID stay server-side; the browser only receives a short-lived conversation token from `/api/token`.
- Some browsers require a user gesture before audio will play — tapping the orb to start satisfies that.
