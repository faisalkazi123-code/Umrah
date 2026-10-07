# Umrah Companion

Mobile-first, offline-first PWA that guides a pilgrim through Umrah step by step:
Ihram → Niyyah → Talbiyah → Masjid Al-Haram → Tawaf (7) → After Tawaf → Sa'ee (7) → Shaving / Trimming → Complete.

Project rules live in [`CLAUDE.md`](./CLAUDE.md).

> **Religious content status:** `Umrah Guide.pdf` (the source of truth) has not been added to this
> repository yet, so **no dua text, rulings or guidance bodies are included**. Every religious record
> exists with its title and source fields and is marked `awaiting_source`; the app shows an explicit
> "not yet added from the Umrah Guide" notice instead of any text. See
> [`server/seed/content/README.md`](./server/seed/content/README.md).

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · React Router 7 · Zustand · i18next ·
IndexedDB (`idb`) · Express 5 · PostgreSQL · Drizzle ORM · Zod · Vitest · Testing Library · Playwright.

## Quick start

```bash
npm install
cp .env.example .env          # set DATABASE_URL
npm run db:migrate
npm run db:seed
npm run dev                   # web on :5173 (proxies /api) + API on :3001
```

The app works without the API: progress is stored on the device and synced when the API is reachable.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server + API with reload |
| `npm run build` | Typecheck, build the PWA to `dist/` and the server to `dist-server/` |
| `npm run start` | Production server: API + built PWA on `PORT` |
| `npm run test` | Unit + integration tests (API tests need `TEST_DATABASE_URL`, otherwise skipped) |
| `npm run test:e2e` | Playwright: full journey, refresh persistence, offline, RTL |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc` |
| `npm run db:generate` | Generate a migration after editing `server/db/schema.ts` |
| `npm run db:migrate` / `npm run db:seed` | Apply migrations / load `server/seed/content/*.json` (idempotent, versioned) |

## Layout

```
shared/domain/        Pure ritual logic used by both client and server
  rounds/             Seven-round state machine (NOT_STARTED → ROUND_1..7 → COMPLETED)
  tawaf/ saee/        Tawaf guidance selection; getSaeeDirection(round)
  journey/            Journey model, stage statuses, progress, ordering rules
shared/content/       Zod content schema + loader (bundled for offline use)
shared/api/           Zod request schemas
server/               Express API, Drizzle schema/migrations, guest sessions, seed
server/seed/content/  Religious content JSON (reviewable outside React code)
src/                  React app: components/, pages/, store/ (Zustand), lib/ (IndexedDB, sync), i18n/
pwa/sw-template.js    Service worker; vite.config.ts injects the precache list at build
e2e/                  Playwright tests
```

## How it works

- **State machines.** Tawaf and Sa'ee only move one round at a time; undo reverts the latest round; reset needs
  confirmation. The same functions run in the browser and on the server, and the API returns `409` for any
  invalid transition. Sa'ee cannot start before Tawaf is complete, and Umrah cannot complete before Sa'ee.
- **Offline first.** All screens and content are precached by the service worker. Progress is written to IndexedDB
  before the UI moves on, and restored exactly on restart. Every change is also put in an IndexedDB outbox and
  replayed in order to the API when it becomes reachable.
- **Guest mode.** No registration. The API issues a random, httpOnly, SameSite=Lax cookie; only its SHA-256 hash is
  stored. All journey and bookmark queries are scoped to that guest session (no IDOR).
- **Security.** Helmet with a strict CSP, rate limiting, Zod on every write, JSON-only bodies (CSRF), parameterized
  Drizzle queries, allow-listed CORS, generic 500 errors, no secrets in the repo (`.env.example`).
- **i18n / RTL.** English and Arabic UI; Arabic sets `dir="rtl"` on `<html>`, with logical CSS properties and
  mirrored directional icons. More languages = one locale file + one entry in `src/i18n/index.ts`.
- **Accessibility.** Text size Small–Extra Large, light/dark/system theme, 48–56px primary touch targets,
  native `<dialog>` confirmations, labelled controls, reduced-motion support.
- **Native packaging.** Plain SPA in `dist/` with relative API calls — compatible with wrapping in Capacitor later.

## Remaining work

- **Transcribe the Umrah Guide.** Add `Umrah Guide.pdf`, then fill dua text, transliteration, meanings,
  guidance bodies, Madinah, Hajj types and footnotes in `server/seed/content/*.json` with `sourcePage`, and
  move each record to `approved` after review. Arabic UI translations of content titles are also pending.
- **Admin panel** (`/admin`, CLAUDE.md §47) with the Edit → Draft → Review → Publish workflow on top of
  `content_versions`. This needs real admin authentication, so it is not stubbed.
- **Verified audio.** The player is wired up but only appears once a dua has an approved `audioUrl`.
- Sign-in (phone/email/Apple/Google) is not built; the `users` table and `guest_sessions.user_id` are reserved for it.
- Manual QA on real devices (small phones, tablets, landscape, screen readers).
