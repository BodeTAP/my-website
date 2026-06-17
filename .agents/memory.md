# Project Memory

This file is the shared memory for future assistant sessions in this repository.
Read it at the start of a session before making decisions, then update it when the
user confirms a lasting preference, project decision, or important current state.

## How To Use

- Keep entries short, concrete, and dated when timing matters.
- Store durable facts here, not secrets or one-off scratch notes.
- Prefer updating existing bullets over duplicating similar notes.
- If a note becomes stale, mark it as stale or replace it with the newer decision.

## User Preferences

- Reply in Indonesian by default, unless the user asks for another language.
- The user wants memory that works across sessions and even across accounts by
  storing project context in the repo.
- Update this memory file after each work session with durable preferences,
  project decisions, or important current state.

## Project Decisions

- Use this repository file, `.agents/memory.md`, as the first lightweight shared
  memory mechanism before adding a database-backed memory system.
- Admin desktop sidebar supports a persisted collapsed icon-rail mode via
  `localStorage` key `admin-sidebar-collapsed`.
- Admin sidebar collapse/expand animation uses CSS width transitions plus Framer
  Motion detail animations.
- Portal client desktop sidebar mirrors the admin sidebar collapse/expand pattern
  using `localStorage` key `portal-sidebar-collapsed`.
- Portal `/portal` index should redirect to `/portal/dashboard` so logged-in
  clients do not land on a 404 page.
- Proposal Generator is intended for general businesses, not only web agency
  use cases; default copy/templates should avoid assuming the seller is a web
  agency.
- Lead Finder landing/product copy should target general business prospecting
  use cases, not only web agencies or website sellers.
- Lead Finder supports optional Social Scan as a paid add-on that scans business
  websites for social links and caches results server-side.
- Lead Finder Social Scan can be enabled/disabled from Admin Tools via
  `tool_lead_finder_social_scan_enabled`; portal UI and API both respect it.
- WhatsApp broadcast auto-reply requires Fonnte device inbound webhook set to
  `/api/webhooks/fonnte/inbound`; status webhook alone is not enough. Admin
  device edit UI now exposes both inbound and device-status webhook URLs.
- Fonnte inbound webhook handling accepts JSON, form-urlencoded, and raw URL
  encoded payloads; auto-replies are sent to the webhook sender number and
  `getFonnteKey()` can fall back to the first key from `fonnte_api_keys`.
- WhatsApp broadcast should allow leads with `waOptInStatus = UNKNOWN`; only
  `OPTED_OUT` or `doNotContact` leads are skipped by consent filtering.
- Proposal Generator now supports a client-editable brand kit/design layer:
  logo, colors, font style, layout preset, logo position, and PDF visibility
  toggles. PDF preview/download should use the same renderer.
- Proposal PDFs should automatically format plain large numeric costs as Rupiah,
  e.g. `1500000` -> `Rp 1.500.000`.

## Current Focus

- Portal Invoice Generator is implemented as a client document generator using
  `generated_invoices`; generated invoices are PDF-only and intentionally do
  not connect to admin invoices, payment links, or Tripay.
- Portal Invoice Generator supports client-editable design templates via
  `invoice_brand_kits`; generated invoice PDFs store the selected design snapshot
  so older invoices keep their original styling.
- Invoice Generator logo upload uses Vercel Blob when `BLOB_READ_WRITE_TOKEN`
  is configured and falls back to `public/uploads/invoice-logos` for local
  development when the token is absent.
- Invoice Generator tax is fixed to optional `PPN 11%`; users can include or
  exclude it, and the API calculates the amount automatically from subtotal
  after discount.
- Portal dashboard now includes tool usage stats, recent activity from generated
  invoices/proposals/credit tool usage, an onboarding checklist, and document
  brand-kit readiness indicators.
- Portal Profile has a global document Brand Kit control that syncs base logo,
  colors, and font style into both Proposal Generator and Invoice Generator
  design settings.
- Portal Invoice Generator has a detail/edit route at
  `/portal/tools/invoice-generator/[id]` with manual status, edit, duplicate,
  delete, and PDF actions.
- Portal Lead Finder supports saved lead lists via `lead_finder_lists`; saved
  lists can be reopened without charging credits again and deleted from the tool
  UI. Saved-list API routes use raw SQL against `lead_finder_lists` so the flow
  still works if a running dev server has not picked up a regenerated Prisma
  client delegate yet.
- Portal Lead Finder UI distinguishes fresh searches from saved-list loads, so
  reopening a saved list does not show the credit-spent success banner.
- Public paid-tools landing structure now uses `/tools/proposal-generator` and
  `/tools/invoice-generator`; `/tools/lead-finder` redirects to the existing
  `/lead-finder` landing page. The public `/tools` page has a premium tools
  section above the free tools grid and reads credit prices from Admin Tools
  settings instead of hardcoded defaults. Paid tools pages use 5-minute
  revalidation, specific OG/Twitter metadata, exact-keyword H1s, FAQ +
  SoftwareApplication JSON-LD, and `/tools/lead-finder` is excluded from the
  sitemap because it is a redirect.
- Public navbar uses desktop mega menus for Layanan and Tools, with mobile
  accordion sections for the same groups; the mobile open state uses a nearly
  opaque dark background so hero content does not bleed through.
- Public footer is structured around Brand, Layanan Website, Tools Bisnis,
  Perusahaan, and Hubungi Kami; footer links should prioritize valid service
  routes, premium tools, clickable WhatsApp/email contacts, and clean legal
  links.
- Public homepage positioning now combines website services with premium
  business tools; default hero/SEO copy highlights Lead Finder, Proposal
  Generator, and Invoice Generator alongside website services.
- Public homepage design direction should feel more grounded and less
  template/AI-like: fewer glow/glass effects, more concrete operational copy,
  calmer solid surfaces, and product visuals tied to the actual website/lead/
  proposal/invoice workflow.
- Public background direction uses calm dark banded sections instead of global
  grid/glow effects: base `#020611`, section `#071225`, alt `#06111f`, solid
  surfaces, and subtle dividers.
- Public pages should keep the newer humanized direction: concrete Indonesian
  copy, fewer superlatives, solid dark surfaces, limited glow/glass, and CTAs
  tied to real next steps like WhatsApp, consultation, audit, or portal tools.
- Portal client UX should follow the same grounded direction as public pages:
  workspace-like surfaces, practical copy, fewer glow/gradient effects, and
  tool labels that describe the user's next action clearly.
- Portal Credits now uses a compact workspace layout: small balance header,
  denser credit package cards, compact purchase buttons, and shorter credit
  history rows.
- New client accounts receive a configurable one-time welcome credit bonus
  through `tool_signup_bonus_enabled` and `tool_signup_bonus_amount`; the default
  is 15 credits, recorded as a credit transaction, and guarded against duplicate
  grants.
- Admin Tools now controls Invoice Generator defaults: credit cost, default due
  days, default footer, and whether PPN 11% is included by default. Admin Tools
  also shows usage totals for generated proposals/invoices and credits spent.
- Admin Tools settings API uses partial PATCH semantics for submitted keys, and
  Invoice Generator default due days is constrained to at least 1 day.
- On 2026-05-14, the `generated_invoices` table was applied manually with
  `prisma db execute` and marked applied because `prisma migrate dev` detected
  database drift; do not reset the database for this migration.
- On 2026-05-14, the `invoice_brand_kits` migration was also applied manually
  with `prisma db execute` and marked applied for the same drift reason.
- On 2026-05-16, the `lead_finder_lists` migration was applied manually with
  `prisma db execute` and marked applied with `prisma migrate resolve`.
- Lead Finder Social Scan now treats direct social-profile `websiteUri` values
  (Instagram/Facebook/TikTok/LinkedIn/YouTube/X) as `FOUND` before fetching or
  reading cached scan results.
- Startup-readiness check on 2026-05-17: `npm run lint`, `npx tsc --noEmit`,
  `npm run test:run`, and `npm run build` all passed. Lint still reports many
  warnings, mostly React 19 hook/purity warnings and unused imports/types.
- On 2026-05-17, lint warnings were cleaned to zero; `npm run lint`,
  `npx tsc --noEmit`, `npm run test:run`, and `npm run build` all passed after
  the cleanup. Build still prints non-blocking renderer warnings about
  unsupported `z-index` and string `width`/`height` values.
- SEO sitemap/robots (2026-05-31): replaced `next-sitemap` (postbuild) with
  native Next.js routes `app/sitemap.ts` and `app/robots.ts`. ROOT CAUSE of
  pages not being indexed by Google: the old `next-sitemap` generated
  `public/sitemap*.xml` and `public/robots.txt` containing `http://localhost:3000`
  because `NEXT_PUBLIC_SITE_URL` was localhost at Vercel build time, so Googlebot
  ignored all URLs. The native routes use a `getSiteUrl()` helper with an
  anti-localhost guard (falls back to VERCEL_PROJECT_PRODUCTION_URL then
  https://mfweb.maffisorp.id). Sitemap is now dynamic (revalidate 1h) so
  auto-published articles appear without redeploy. Removed next-sitemap dep,
  postbuild script, config, and the stale static public/ files. Do NOT
  re-add next-sitemap. If sitemap shows wrong domain, check NEXT_PUBLIC_SITE_URL
  env on Vercel (should be https://mfweb.maffisorp.id, not localhost).
- SEO audit (2026-06-16): live `/sitemap.xml` returns 200 with 68 URLs and all
  submitted URLs checked return 200 with matching canonicals. Old
  `/sitemap-0.xml` returns 404 and should be removed from Search Console or
  redirected. Two noindex pages (`/kebijakan-privasi`, `/ketentuan-layanan`)
  are still in the sitemap. Breadcrumb coverage is inconsistent: `/contact`,
  `/kalkulasi-harga`, `/tools`, and `/lead-finder` have no BreadcrumbList;
  some pages mix microdata with JSON-LD, and some JSON-LD uses `next/script`,
  which can appear in the React Flight payload instead of direct HTML. Several
  title tags duplicate the brand suffix as `| MFWEB | MFWEB`; proposal and
  invoice generator landing pages each have two H1s.
- SEO fixes applied (2026-06-16): `/sitemap-0.xml` redirects to
  `/sitemap.xml`, legal noindex pages were removed from `app/sitemap.ts`,
  public JSON-LD now uses native escaped scripts via
  `components/public/JsonLd.tsx`, breadcrumb JSON-LD was added to `/contact`,
  `/kalkulasi-harga`, `/tools`, and `/lead-finder`, duplicate title suffixes
  were removed from public metadata, and proposal/invoice generator landing
  pages now have one H1. Validation after the patch: `npm run lint` passed with
  the 7 known warnings, `npx tsc --noEmit` passed, and `npm run build` passed.
- Public `/tools` UI polish (2026-06-16): redesigned the page as a compact,
  grounded catalog with shorter hero, solid dark bands, smaller 8px-radius
  cards, denser premium/free tool lists, less glow/animation/AI-like marketing
  copy, and practical CTAs. Validation: `npm run lint` passed with the 7 known
  warnings, `npx tsc --noEmit` passed, `npm run build` passed, and local
  `/tools` returned 200 on the dev server.
- Admin Clients detail upgrade (2026-06-17): `Client` now has account-detail
  fields for status, PIC, billing email, alternate phone, city/province,
  contact preference/hours, source, tags, internal notes, account manager, and
  last contacted time. Added migration
  `20260617090000_add_client_account_details`, expanded
  `/api/admin/clients/[id]`, rebuilt `/admin/clients` as an operational list,
  and added `/admin/clients/[id]` with profile editing plus billing, services,
  tools, support, portal access, and health-risk summaries. Validation:
  `npx tsc --noEmit`, `npm run lint` (7 known warnings), `npm run test:run`
  (61 tests), and `npm run build` all passed. On 2026-06-17, the migration SQL
  was applied manually with `prisma db execute` to the Neon DB from `.env` and
  marked applied with `prisma migrate resolve`.
- As of 2026-05-17, `.env` exists locally but is not tracked by Git;
  `.env.example` is tracked.
- Current active work is product polish for the client portal tools and their
  dashboard/profile workflows.
- Broadcast system improvements (2026-05-20): leads page now uses server-side
  pagination via GET /api/admin/leads with query params (page, perPage, q,
  status, consent, hasWebsite, neverContacted, category). LeadsTable no longer
  loads all leads at once. Advanced filters added: consent WA, has website,
  business category (8 categories), never contacted. BroadcastModal has a
  Preview tab showing message with variable substitution for up to 5 leads.
  BroadcastHistoryModal rebuilt with pagination, CSV export, and per-recipient
  drill-down (DrillDownModal). Opt-in conversion tracking: waOptInSource now
  stores the broadcastId that prompted the opt-in
  (format: fonnte_webhook:broadcast:ID).
- Auto-publish AI prompts now include explicit topic rotation across MFWEB
  website services, website pricing tiers, premium portal tools (Lead Finder,
  Proposal Generator, Invoice Generator), and UMKM/freelancer/agency tips.
  Both `DEFAULT_PROMPTS.autoPublish` and `ai_prompt_auto_publish_topic` in
  `lib/aiConfig.ts` were updated, and admin Settings UI now has a "Reset ke
  default" button next to each AI feature System Prompt textarea and the Auto
  Publish Topic prompt textarea so saved DB values can be restored to the
  current code defaults without manual DB edits.
- Public freemium tools (Proposal Generator, Invoice Generator) now generate
  real PDF files via `lib/tools/freemiumProposalPdf.ts` and
  `lib/tools/freemiumInvoicePdf.ts` (pdf-lib, same engine as paid tier) served
  from `POST /api/tools/proposal-generator/pdf` and
  `POST /api/tools/invoice-generator/pdf`. Free PDFs carry a strongly visible
  diagonal watermark (`MFWEB - Free Tier`, opacity 0.12) plus a `FREE TIER`
  badge top-right and a footer attribution so screenshots remain clearly
  branded. PDF endpoints rate-limit at 10 downloads / 24h / IP.
- Each PDF download flow is preceded by an `EmailCaptureModal` that captures
  an optional email (skippable) and stores it in
  `anonymous_tool_usage.metadata.email` for marketing follow-up.
- Each generated freemium document UI exposes a `Kirim via WhatsApp` button
  that opens `wa.me/?text=...` with a pre-filled message (`lib/waShare.ts`),
  so UMKM users can hand-attach the PDF in their WA app afterwards.
- Welcome credit messaging now uses `getWelcomeCreditBreakdown()`
  (`lib/welcomeCredits.ts`) to render concrete breakdowns like
  `15 kredit gratis = 3 proposal + 5 invoice + 5x cari leads` across all paid
  tool landing pages, the public `/tools` page, the Lead Finder landing, and
  the `PaywallGate` modal.
- `PublicLeadFinderForm` 429 handler now persists `resetAt` based on the API's
  `retryAfterMs` instead of a hard-coded 24h to keep client localStorage in
  sync with the server-side Redis window.
- `PaidToolLanding` `InvoiceMockup` is rendered with a fresh year and current
  date so the static landing page doesn't display a stale invoice number to
  visitors months after deployment.
- Codebase bug audit (2026-06-01): completed a full HIGH/MEDIUM/LOW bug audit
  and fixed everything. All commits are local only (NOT pushed). Final state:
  `npx tsc --noEmit`, `npm run lint` (7 pre-existing warnings, intentional),
  `npm run test:run` (61 tests), and `npm run build` all pass. Key fixes:
  - PDF WinAnsi crash: emoji/CJK/non-Latin-1 chars in user input no longer
    throw in pdf-lib `drawText`. New shared helper `lib/tools/pdfText.ts`
    (`sanitizeWinAnsi`) applied to freemium + paid PDF generators
    (`freemiumInvoicePdf`, `freemiumProposalPdf`, `invoicePdf`, `proposalPdf`).
  - Leads table (`LeadsTable.tsx`): selection now a `Map<id, Lead>` so
    broadcast/export/delete keep off-page selections across pagination.
  - `normalizePhone` (`lib/whatsapp.ts`): prefix-based normalization, no length
    heuristic; validate final length at call sites.
  - Broadcast Fonnte validate: compare `not_registered` using `normalizePhone`
    on BOTH sides (was raw `08…` vs `62…`, never matched).
  - Cron/webhook hardening: fail-closed auth (weekly-summary,
    payment-reconcile), invoice status race guard, idempotent credit top-up,
    tripay EXPIRED/FAILED guard (`status: { not: "PAID" }`).
  - Freemium: `lib/rateLimit.ts` self-heals lost Redis TTL (was permanent
    lockout) + `refundRateLimit`/`refundFreemiumQuota`; lead-finder refunds
    quota on upstream failure; double-submit guard on all 3 public forms;
    client soft-limit now reads admin-configured limit (was hardcoded 1),
    threaded via `freemiumLimit` prop.
  - `app/layout.tsx`: `safeMetadataBase()` guards invalid DB-configured site
    URL so metadata generation can't 500 every page.
  - Broadcast variation: reachable opener variants, `replaceAll` for business
    name, word-boundary opt-out detection, whole-broadcast conversion rate
    (server aggregate `optInCount`), mulberry32 PRNG for uniform bullet shuffle.
  - Webhooks: device-status parses JSON/form/raw + seconds-or-ms timestamp;
    inbound prefers exact lead match over fuzzy last-8-digit (avoids wrong
    opt-in/out).
  - PDF routes: `await track()` server analytics; generic client error messages
    (no raw error leakage); invoice PDF recomputes totals server-side.

## Known Context

- Follow `AGENTS.md` for stack rules, commands, auth middleware constraints, and
  framework gotchas.
- As of 2026-06-16, `middleware.ts` is not present in the working tree; the
  auth guard lives directly in `proxy.ts`.
- Do not store real credentials, tokens, private customer data, or other secrets
  in this memory file.
- If portal pages become dim/unclickable after sidebar changes, inspect
  `components/portal/PortalShell.tsx` first: mobile drawer/backdrop state and
  collapsed sidebar z-index have been the likely source.
