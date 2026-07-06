# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install              # install all workspace deps (pnpm only — never npm/yarn)
pnpm dev                  # runs web (5173), admin (5174) and bot (3000) in parallel via Turborepo
pnpm build                # tsc + vite build for every app/package, respecting the ^build graph
pnpm lint                 # tsc --noEmit per workspace (no eslint config, no test runner in this repo)

# Target a single workspace
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter @cee/bot dev      # Express server used by the admin "Ceci" assistant + dashboard summary
pnpm --filter @cee/types build  # rarely needed; types is consumed as source via workspace:*
```

There is no automated test suite (no vitest/jest anywhere in the repo) — `pnpm lint` (bare `tsc`) is the only pre-merge check.

Supabase (schema + edge functions) is managed with the Supabase CLI directly against `supabase/migrations` and `supabase/functions`; there's no `pnpm` wrapper for it.

## Hard rules

- **pnpm only**, and workspace deps use `workspace:*`/`workspace:^` — don't hand-add versions for internal packages.
- All shared domain types live in `packages/types` (`@cee/types`). Never redefine a domain type locally; import from `@cee/types`. Form-input-only shapes (e.g. `CourseFormInput`) that aren't a backend contract stay local to the service that uses them — don't promote those to `@cee/types`.
- Never hand-edit `components/ui/*` in either app — that folder is shadcn/ui-owned.
- `localStorage` access is only allowed inside each app's `store/authStore.ts` (key `cee_token`). The Supabase client (`lib/supabase.ts`) is wired to read/write through that same store's `authStorageAdapter`, not through its own storage.
- The `@/` alias maps to `<app>/src/` in both `apps/web` and `apps/admin`.
- `.env` files are tracked in git in this repo (see `.gitignore` — the env exclusion is commented out), not gitignored secrets. Don't assume they're absent or that adding one is safe-by-default; treat existing `.env` values as already-live credentials.

## Architecture

### Monorepo layout

```
apps/
  web/     # public site — React + Vite + TS, shadcn/ui, Tailwind, Zustand, React Router v6
  admin/   # backoffice/CMS panel — same stack, + recharts, xlsx, react-markdown
  bot/     # Express server (ts-node): AI provider abstraction, dashboard summary, Groq proxy
packages/
  types/                 # @cee/types — shared TS contracts, single source of truth
  config/                # shared tsconfig base
  ui/                    # shared component library — currently a stub (no exports yet)
  certificate-generator/ # @cee/certificate-generator — pdf-lib based diploma PDF/PNG rendering, shared by web + admin
supabase/
  migrations/  # SQL schema history, timestamp-prefixed — the actual source of truth for DB shape
  functions/   # Deno edge functions: ceci-chatbot, check-enrollment, create-admin, toggle-admin-status
```

Turborepo wires the build graph: `build` depends on `^build`, so `packages/*` compile before the apps that consume them.

### Data layer: mock-first, Supabase-direct

There is no custom backend API. Each domain service (`src/services/*.service.ts` in both apps) branches on `VITE_USE_MOCKS`:

- `true` → returns in-memory fixtures from `src/mocks/` (web) or a mutable in-memory array seeded from mocks (admin), with an artificial `delay()`.
- `false` → queries Supabase directly via `@supabase/supabase-js` (`src/lib/supabase.ts`), e.g. `supabase.from('courses').select(...)`.

Both branches must keep an identical function signature/return shape so flipping the flag never requires touching a screen or hook. A leftover Axios client (`services/api.ts`, `constants/api.constants.ts`) exists from an earlier planned NestJS backend that was never built; a few admin mutation paths still call it, but the read paths and current direction are Supabase-first — don't build new features against it.

DB rows are snake_case; domain types are camelCase. The `*-mapper.ts` files (e.g. `services/course-mapper.ts`) hold the `SELECT` column list plus the row→domain formatter — follow that pattern (don't inline ad-hoc mapping) when wiring a new table to a service.

`supabase/migrations` is the actual schema source of truth; `packages/types/src/index.ts` can lag behind or ahead of it, so when adding a field, check the latest migration before trusting the type.

### Auth

Supabase Auth session persistence is routed through each app's Zustand `authStore` (`authStorageAdapter`, key `cee_token`), not Supabase's default storage — this is what makes "localStorage only in authStore" enforceable. Admin routes are wrapped in a `ProtectedRoute requiredRole="admin"`.

### Two independent AI chatbot paths — don't conflate them

- **web** ("Ceci" widget, `services/chatbot.service.ts`): picks between (a) a local intent-classifier mock engine, (b) calling Groq directly from the browser with `VITE_GROQ_API_KEY` (dev-only — this exposes the key client-side, never enable in production), or (c) the Supabase edge function `ceci-chatbot` via `VITE_SUPABASE_CHATBOT_URL`. Tool-calling logic (`buscar_cursos`, `detalle_curso`, `temario_curso`, `get_segmentos`) is duplicated between the browser-direct path here and `supabase/functions/ceci-chatbot/tools.ts` — keep both in sync if you change one.
- **admin** (dashboard assistant + `/debug/consulta-datos`): calls `apps/bot` over HTTP (`VITE_BOT_URL`), which itself selects an AI provider via `AI_PROVIDER` env (`apps/bot/src/ai/`, currently only `groq` is wired — `gemini`/`claude` provider files exist but `gemini` throws and `claude` isn't selectable). The Groq key for this path lives only in `apps/bot`'s env, never in `apps/admin`.

### Certificates

`packages/certificate-generator` renders the official diploma (PDF via pdf-lib, or PNG from a canvas) from a shared field layout (`field-layout.ts`) against `assets/template.png`. Both `apps/web` (student-facing download) and `apps/admin` (issuing/regenerating) call into it via their own `lib/certificate-builder.ts` wrapper — keep layout/coordinate changes in the shared package, not per-app.

### `docs/`

`docs/CLAUDE.md` and `docs/CONTEXT.md` are earlier planning documents (Spanish) written when the backend was still assumed to be a separate NestJS API — parts are now superseded by the Supabase-direct architecture described above. `docs/fase-*/` and `docs/mejoras-finale/` are dated phase-by-phase task breakdowns for historical/planning context, not living specs.
