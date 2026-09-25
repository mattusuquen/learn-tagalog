# learn-tagalog 🇵🇭

A voice-based Tagalog tutor that talks like your titita, not your textbook.

Call in, speak Tagalog, get roasted (affectionately) for your pronunciation, and actually get better. No flashcards, no multiple choice — the conversation *is* the lesson.

## What makes this different

Most language apps quiz you. This one **guilt-trips you like a real Filipino relative** while adapting to your level in real time.

- **Taglish by default** — code-switches mid-sentence, because that's how Filipinos actually talk. Full Tagalog immersion the moment you can handle it, English dropped in only when needed for clarity.
- **Roasts instead of scores** — you won't get "78% accuracy," you'll get something like *"that 'ng' sound was so American I could smell the ranch dressing."*
- **Never actually mean** — the nagging only works because it's obviously on your side, same energy as Duolingo's owl but with more lola.
- **Running bits** — recurring jokes about the words Filipinos know are brutal for foreigners (`ng`, `mga`, ...) so there's a reason to come back beyond "keep your streak."
- **Adaptive difficulty** — the agent assesses your level through natural conversation (not a placement test) and adjusts on the fly. Gets easier fast if you're frustrated, harder if you're coasting.
- **Vocab in context, not in isolation** — new words are introduced the way you'd actually encounter them ("you'll hear this a lot at the market"), 3–5 per session.
- **Session summary** — every call ends with what you practiced, what's improving, and what to work on next.

## How it works

The tutor is a voice agent with:

- A **persona/system prompt** defining tone, guardrails, and call-ending behavior (see below)
- A **knowledge base** of vocabulary by CEFR level (A1–C2), grammar rules, conversation topics, and cultural notes, which the agent draws on to keep the conversation appropriately leveled
- No separate exercise/quiz engine — assessment happens implicitly through the conversation itself

### Guardrails

- Content stays appropriate for learners of all ages
- If a student gets frustrated, the tutor drops into encouragement mode and simplifies immediately

### Ending a session

The agent explicitly ends the call (rather than just saying bye) on any sign-off — "thanks bye," "I'm good," "no that's it," an explicit request to end, or "don't call again."

## Tech stack

> Flagging this section as best-effort — I'm reconstructing it from the agent's system prompt and prior notes on the project rather than reading the repo directly, so treat specifics as a starting point to correct rather than ground truth.

- **Next.js / TypeScript** — app shell
- **Retell** — voice pipeline (speech-to-text, text-to-speech, call orchestration)
- LLM-driven persona/system prompt (the "unhinged tutor" character above) governs tone and pacing
- Level-tagged vocabulary/grammar/culture knowledge base feeding the conversation

*(If this repo has moved on from any of the above, tell me and I'll fix it.)*

## Status

Early / actively iterating — recent work has focused on the call UI (push-to-talk, visual "thinking orb," dark theme) rather than the tutoring logic itself.

## Getting started

```bash
git clone https://github.com/mattusuquen/learn-tagalog.git
cd learn-tagalog
npm install
npm run dev
```

You'll need a Retell API key (and any other provider keys the app expects) in a `.env.local` — see `.env.example` if one exists, or ask the maintainer.

## Roadmap ideas

- [ ] Expand the vocabulary/grammar knowledge base across more CEFR levels
- [ ] Persist learner profiles / spaced-repetition scheduling across sessions
- [ ] More running bits 😄

---

*Built by [Matt Usuquen](https://github.com/mattusuquen).*
