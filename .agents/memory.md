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
- Current active work is product polish for the client portal tools and their
  dashboard/profile workflows.

## Known Context

- Follow `AGENTS.md` for stack rules, commands, auth middleware constraints, and
  framework gotchas.
- Do not store real credentials, tokens, private customer data, or other secrets
  in this memory file.
- If portal pages become dim/unclickable after sidebar changes, inspect
  `components/portal/PortalShell.tsx` first: mobile drawer/backdrop state and
  collapsed sidebar z-index have been the likely source.
