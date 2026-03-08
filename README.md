# Code Blue Relay

Code Blue Relay is a demo-ready, voice-first clinical handoff MVP built as a single-repo Next.js app.

It turns spoken or typed shift handoff into persistent case memory so the next shift can immediately see:

- what changed since the last shift
- what was carried forward from previous shift
- what remains unresolved
- what requires escalation

The demo centers on a high-risk overnight case for Mrs. Elina Moreau and is designed to present cleanly in under 90 seconds.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- lucide-react
- Supabase client scaffold
- ElevenLabs adapter scaffold
- Backboard adapter scaffold

## Routes

- `/`
  Landing page with cinematic hero, animated memory strands, workflow, and product framing.
- `/dashboard`
  Active caseboard with four demo cases and quick actions.
- `/compose`
  Handoff composer showing transcript-to-structured-memory transformation.
- `/case/elina-moreau`
  Full relay detail with audio summary, timeline, carried-forward context, and urgent escalation simulation.

## Demo Flow

1. Open `/`.
2. Click `Watch 30s Handoff` to jump into the Elina Moreau relay summary.
3. Click `Back to Dashboard` and scan the live caseboard.
4. Open `/compose` to show how the transcript becomes structured memory.
5. Return to `/case/elina-moreau` and press `Simulate urgent update` to flip the case from `Watch` to `Escalate`.

## Mocked Integrations

- Supabase:
  `src/lib/supabase.ts` is scaffolded, but the UI runs entirely from local demo data by default.
- ElevenLabs:
  `src/lib/elevenlabs.ts` safely falls back to a mock audio-ready state if env vars are missing or the request fails.
- Backboard:
  `src/lib/backboard.ts` is isolated behind an adapter and defaults to a local mock memory service.

## Environment

Copy `.env.example` to `.env.local` if you want to wire optional integrations.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
BACKBOARD_API_KEY=
```

Leaving these blank keeps the MVP in safe mock mode.

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
```
