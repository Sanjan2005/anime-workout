# Anime Workout RPG

Gamified web app that generates personalized workout and nutrition plans inspired by anime characters, with an RPG-style progression system (50 XP/day cap, ranks, streaks).

## Tech Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Supabase** (Auth, PostgreSQL, Storage)
- **Prisma** ORM
- **Google AI Studio** — Gemini 2.5 Flash (free tier via `@google/genai`)
- **TanStack Query** + PWA via `@serwist/next`

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (for image uploads) |
| `DATABASE_URL` | Supabase Dashboard → Settings → Database |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) — **free tier only** |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

**Important:** Use a Google AI Studio free API key only. Do **not** attach Google Cloud billing or use Vertex AI credentials.

### 3. Database

```bash
npx prisma db push
npm run db:seed
```

### 4. Supabase Storage

Create a bucket named `character-images` in Supabase Storage (private recommended; service role used server-side).

Enable Email auth in Supabase Authentication → Providers.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Profile & Nutrition** — BMR/TDEE calculator with cut/bulk/maintain targets
- **XP Engine** — Dynamic 50 XP/day allocation across exercises by difficulty
- **Workout UI** — Set completion with server-side XP awards and daily cap
- **AI Plans** — Gemini Flash analyzes character images and generates structured plans
- **Progress** — XP history chart, rank badges, streak milestones
- **PWA** — Installable on mobile for offline-friendly workout view

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run XP engine unit tests |
| `npm run db:seed` | Seed exercise catalog (~20 exercises, 5 tiers each) |
| `npm run db:push` | Push Prisma schema to database |

## Deploy (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add all env vars from `.env.example`
4. Deploy

## Architecture Notes

- XP is awarded only via server actions with idempotent completion records
- Daily XP cap enforced in Postgres transactions
- Gemini integration uses `responseSchema` + `responseMimeType: application/json`
- AI generation rate-limited to 5 requests/user/day
