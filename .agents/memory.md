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
- Proposal Generator now supports a client-editable brand kit/design layer:
  logo, colors, font style, layout preset, logo position, and PDF visibility
  toggles. PDF preview/download should use the same renderer.
- Proposal PDFs should automatically format plain large numeric costs as Rupiah,
  e.g. `1500000` -> `Rp 1.500.000`.

## Current Focus

- Lead Finder Social Scan now treats direct social-profile `websiteUri` values
  (Instagram/Facebook/TikTok/LinkedIn/YouTube/X) as `FOUND` before fetching or
  reading cached scan results.
- Current active work is around the portal Proposal Generator and its PDF output.

## Known Context

- Follow `AGENTS.md` for stack rules, commands, auth middleware constraints, and
  framework gotchas.
- Do not store real credentials, tokens, private customer data, or other secrets
  in this memory file.
- If portal pages become dim/unclickable after sidebar changes, inspect
  `components/portal/PortalShell.tsx` first: mobile drawer/backdrop state and
  collapsed sidebar z-index have been the likely source.
