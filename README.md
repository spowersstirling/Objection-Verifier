# Objection Verifier

AI-powered media accuracy verification. Upload a transcript and a published article — get a scored verdict.

Built as a prototyping challenge submission for Objection AI.

## What it does

Takes an interview transcript and a published article, runs a three-step Claude API analysis pipeline, and returns a scored verdict across four dimensions: Quote Fidelity, Coverage, Context Retention, and Material Omission. The aggregate score maps to a rating label: Verified, Fair, Selective, Distorted, or Fabricated.

## Demo

The live demo analyses a November 2024 GearJunkie interview with Aron D'Souza (president of the Enhanced Games) against the published article. The engine identified five material omissions including the Peter Thiel endorsement story, the Ozempic-vs-AI market size argument, and the Apollo moon landing comparison.

Live: https://objection-verifier.vercel.app

## Tech stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude API (claude-opus-4-5)
- Vercel

## Running locally

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env.local` and add your Anthropic API key
4. Run `npm run dev`
5. Open http://localhost:3000

## AI workflow

Three sequential Claude API calls: (1) claim extraction from transcript as structured JSON, (2) per-claim analysis against the article across four scoring dimensions, (3) verdict synthesis with weighted aggregate score, rating label, and top findings. Demo result is pre-computed as static JSON for instant loading. Live engine runs on any pasted transcript and article input.

## Deliberate cuts

- **Audio transcription** — the brief permits mocking; building a Whisper pipeline adds three hours for a feature that doesn't change the core demonstration
- **Multi-model jury** — described as v2 on the landing page; running analysis across Claude, GPT, and Gemini in parallel maps onto Objection's tribunal architecture but introduced orchestration risk under time pressure
