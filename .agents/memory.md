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

## Project Decisions

- Use this repository file, `.agents/memory.md`, as the first lightweight shared
  memory mechanism before adding a database-backed memory system.
- Admin desktop sidebar supports a persisted collapsed icon-rail mode via
  `localStorage` key `admin-sidebar-collapsed`.
- Admin sidebar collapse/expand animation uses CSS width transitions plus Framer
  Motion detail animations.

## Current Focus

- The active IDE file when this memory was created was
  `components/admin/AdminShell.tsx`.

## Known Context

- Follow `AGENTS.md` for stack rules, commands, auth middleware constraints, and
  framework gotchas.
- Do not store real credentials, tokens, private customer data, or other secrets
  in this memory file.
