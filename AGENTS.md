<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Stack versions (all bleeding-edge — verify APIs before use)

- **Next.js 16.2.4** (App Router), **React 19.2.4**, **TypeScript** (strict)
- **Prisma v7** — uses `prisma.config.ts` (not inline `schema` in `package.json`); schema at `prisma/schema.prisma`
- **NextAuth v5 beta** — APIs differ substantially from v4
- **Tailwind CSS v4** — **no `tailwind.config.*`**; configured via PostCSS (`postcss.config.mjs`) and CSS variables in `app/globals.css`
- **shadcn/ui** base-nova style; components in `components/ui/`

---

## Commands

```bash
npm run dev               # Start dev server
npm run build             # Production build (postbuild auto-runs next-sitemap)
npm run lint              # ESLint (flat config, eslint.config.mjs)
npm run test              # Vitest watch mode
npm run test:run          # Vitest single run (no watch)
npx tsc --noEmit          # Type-check (no typecheck script — CI uses this directly)
npx prisma migrate dev    # Run DB migrations
npx prisma generate       # Regenerate Prisma client (also runs on postinstall)
npx prisma db seed        # Seed DB via prisma/seed.ts
npx prisma studio         # Prisma GUI
```

**Note:** `CLAUDE.md` incorrectly says "There is no test suite configured" — there is one in `tests/` using Vitest + jsdom + fast-check.

---

## CI pipeline

`.github/workflows/ci.yml`: `lint` → `typecheck` → `build` (sequential dependencies).
- CI does **not** run tests (`npm run test` / `vitest` is not in CI).
- Build job injects dummy env vars for all required secrets.
- `.next/cache` is cached, keyed on `package-lock.json` + source files.

---

## Environment / secrets

- `.env` is committed and contains **real credentials** (DATABASE_URL, AUTH_SECRET, AUTH_RESEND_KEY). No `.env.example` exists.
- Required vars: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_RESEND_KEY`, `EMAIL_FROM`, `TRIPAY_API_KEY`, `TRIPAY_MERCHANT_CODE`, `BLOB_READ_WRITE_TOKEN`, `ANTHROPIC_API_KEY`, `PEXELS_API_KEY`, `NEXT_PUBLIC_SENTRY_DSN`
- `TRIPAY_SANDBOX=true` enables Tripay sandbox mode.

---

## Architecture: route groups

```
app/
  (public)/          # Marketing site — no auth
  admin/
    login/           # Public
    (protected)/     # ADMIN role required
  portal/
    login|register|reset-password/  # Public auth flows
    (protected)/     # Any authenticated session
  onboarding/[token]/  # Token-based, fully public
  api/
    admin/*          # Protected admin CRUD + AI endpoints
    portal/*         # Protected client endpoints
    webhooks/tripay  # Payment webhook (public, HMAC-verified)
```

---

## Middleware / auth

- `proxy.ts` is the auth guard middleware, re-exported from `middleware.ts` (do not edit `middleware.ts` logic directly).
- Uses NextAuth v5 `getToken()` with `cookieName` as both `cookieName` **and** `salt` — this is intentional and required for v5. Do not break this symmetry.
- Admin routes redirect to `/admin/login` unless `token.role === "ADMIN"`.
- RBAC permissions are always validated **from the database**, not from the JWT. See `lib/permissions.ts`.

---

## Key lib files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Full NextAuth v5 config (Credentials, Google, Resend magic-link) |
| `lib/auth.config.ts` | Edge-compatible base config (imported by middleware) |
| `lib/prisma.ts` | Prisma singleton client |
| `lib/ai.ts` | Anthropic Claude SDK (`claude-haiku-4-5-20251001`); Pexels cover image flow |
| `lib/whatsapp.ts` | WA send with 9-layer anti-spam humanization engine (`sendWA`, `sendWABatch`, `sendWABatchRotated`) |
| `lib/tripay.ts` | Tripay gateway; proxied via `cloudflare-worker/` |
| `lib/rateLimit.ts` | Upstash Redis rate limiter for public routes |
| `lib/permissions.ts` | RBAC permission service (DB-backed) |
| `lib/utils.ts` | `cn()` — clsx + tailwind-merge |

---

## Quirks / gotchas

- **No Prettier** configured anywhere. Do not add a `.prettierrc` or run prettier.
- **`postinstall`** auto-runs `prisma generate` — after `npm install`, the Prisma client is always regenerated.
- **`postbuild`** auto-runs `next-sitemap` — sitemap/robots.txt is generated from `next-sitemap.config.js`.
- **Tailwind v4**: use CSS variables and `@layer` in `app/globals.css`; there is no `theme.extend` object.
- **AI model**: hardcoded as `claude-haiku-4-5-20251001` in `lib/ai.ts`; configurable Haiku/Sonnet via DB settings (`lib/aiSettings.ts`).
- **Tripay payments** go through a Cloudflare Worker proxy (`cloudflare-worker/`) to bypass IP whitelisting.
- **Sentry** is tunneled through `/monitoring` route (set in `next.config.ts` via `withSentryConfig`).
- **Tests** live in `tests/lib/` and `tests/api/`; run with jsdom environment; use `fast-check` for property-based tests.
