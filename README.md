# Learn Tagalog 🇵🇭

A voice-first AI tutor for learning conversational Tagalog. Tap the orb, speak (in English, Tagalog, or Taglish), and **Kuya Tutor** answers out loud, walking you through vocabulary, grammar, pronunciation, and cultural context one short exchange at a time.

Built with Next.js, LangGraph, OpenAI, and ElevenLabs.

## How it works

```
 🎙️ You speak
   │
   ▼
 /api/speech-to-text   → ElevenLabs Scribe transcribes your audio
   │
   ▼
 /api/chat             → LangGraph agent (gpt-4o-mini) replies as Kuya Tutor
   │
   ▼
 /api/text-to-speech   → ElevenLabs Flash v2.5 speaks the reply
   │
   ▼
 🔊 You hear the answer (and see it in the transcript)
```

The UI is a single chat column with an animated orb ([`thinking-orbs`](https://www.npmjs.com/package/thinking-orbs)) that reflects what the app is doing: **listening** while recording, **searching** while transcribing, **solving** while the tutor thinks, and **breathing** when idle.

## The tutor

Kuya Tutor's behavior lives in the system prompt in [`app/api/chat/route.ts`](app/api/chat/route.ts). It is designed to:

- Teach everyday Manila Tagalog as it's actually spoken, including natural Taglish, and flag formal vs. casual usage
- Give every new word with a pronunciation guide (stressed syllable in caps, e.g. *sa-LA-mat*), glottal-stop notes where meaning changes, and an English gloss
- Introduce only 3–5 new words or one grammar point per session, covering markers (*ang/ng/sa*), verb focus and aspect, linkers, enclitics, and politeness (*po/opo*)
- Follow a session structure: warm-up → spaced-repetition review → new material → practice → wrap-up
- Correct mistakes by showing the fix first, then briefly explaining why, and nudge you to answer in Tagalog

Built-in commands you can say or type:

| Command | What it does |
| --- | --- |
| `quiz me` | Runs a 5-question quiz on recent material |
| `free talk` | Relaxed conversation in Tagalog, correcting only major errors |
| `English please` | Switches explanations to English |

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Agent:** LangGraph (`@langchain/langgraph`) + `@langchain/openai` (`gpt-4o-mini`)
- **Voice:** ElevenLabs Speech-to-Text (`scribe_v1`) and Text-to-Speech (`eleven_flash_v2_5`)
- **Audio capture:** browser `MediaRecorder` API

## Getting started

### Prerequisites

- Node.js 20+
- An [OpenAI API key](https://platform.openai.com/api-keys)
- An [ElevenLabs API key](https://elevenlabs.io/) and a voice ID to use for the tutor

### Setup

```bash
git clone https://github.com/mattusuquen/learn-tagalog.git
cd learn-tagalog
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```bash
OPENAI_API_KEY=your-api-key-here
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
ELEVENLABS_VOICE_ID=your-elevenlabs-voice-id-here
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
│   ├── chat/route.ts            # LangGraph tutor agent + system prompt
│   ├── speech-to-text/route.ts  # Audio → text via ElevenLabs Scribe
│   └── text-to-speech/route.ts  # Text → MP3 via ElevenLabs
├── layout.tsx                   # Root layout and fonts
├── page.tsx                     # Voice chat UI and recording logic
└── globals.css
```

## Personalizing the tutor

The system prompt includes a **Student profile** section with placeholder values for level, goals, session length, and focus. Fill these in with your own details to tailor the lessons; if they're left as placeholders, the tutor asks about your level and goals at the start of the first session.

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

- Conversation state lives in the browser only; refreshing the page starts a new session.
- Voice replies autoplay after each response, so some browsers may require an initial click on the page before audio will play.
