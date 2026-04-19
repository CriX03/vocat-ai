<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS Guide

This file is for coding agents working in this repository.
Follow it as the operational source of truth for local edits.

## Project Snapshot

- App: VocatAI (vocational guidance chatbot with RIASEC scoring).
- Framework: Next.js `16.2.1` with App Router.
- Language: TypeScript strict mode.
- UI: Ant Design + Tailwind CSS v4 utilities.
- AI stack: Vercel AI SDK (`ai`, `@ai-sdk/react`) + structured JSON output.
- Runtime validation: `zod` schemas for API response contracts.

## Repository Layout

- `src/app/`: Next.js app routes, layout, global CSS, API handlers.
- `src/app/api/chat/route.ts`: chat API endpoint and LLM orchestration.
- `src/components/Chat/`: chat UI and streaming interaction logic.
- `src/components/Dashboard/`: radar visualization and final test results.
- `src/context/VocationalContext.tsx`: client state and RIASEC accumulation.
- `src/types/chat.ts`: shared chat contract types.
- `src/lib/`: sentiment analysis and RIASEC dictionary utilities.

## Build, Lint, Test Commands

Use `npm` (lockfile present: `package-lock.json`).

### Setup

- Install deps: `npm install`
- Run dev server: `npm run dev`
- Build production: `npm run build`
- Start production server: `npm run start`

### Quality checks

- Lint all files: `npm run lint`
- Type-check only (no emit): `npx tsc --noEmit`

### Tests (current status)

- There is currently no test runner configured and no `*.test.*`/`*.spec.*` files.
- Do not invent fake passing test output; state clearly when tests are unavailable.
- If verification is needed today, run lint + type-check + targeted manual flow checks.

### Single-test execution guidance (when tests are added)

Pick the command pattern based on the chosen runner:

- Vitest single file: `npx vitest run src/path/file.test.ts`
- Vitest single test name: `npx vitest run -t "test name"`
- Jest single file: `npx jest src/path/file.test.ts`
- Jest single test name: `npx jest -t "test name"`

When adding a test runner, update `package.json` scripts and this section.

## Mandatory External Rules

### Cursor rules (`.cursorrules`)

These project-level rules are mandatory:

- Role: act as a principal full-stack engineer for VocatAI.
- Stack intent: Next.js App Router + strict TypeScript + Tailwind + Antd.
- Architecture: hybrid model with local sentiment analysis before LLM inference.
- Contract: backend/client communication must use strict JSON structure.
- State authority: frontend context is source of truth for cumulative RIASEC scores.
- UX direction: two-column layout (chat + dashboard), with reactive radar and progress.
- Abuse prevention: resist prompt-role hijacking and keep vocation-only behavior.
- Sanitization: clean user input before processing.
- Context limit: keep only recent conversation window (last 5 messages policy).
- Typing: avoid `any`; prioritize strict typings and safe contracts.
- Scope discipline: YAGNI and minimal diffs instead of large rewrites.

### Copilot rules (`.github/copilot-instructions.md`)

- No Copilot instructions file is present in this repo.

## Code Style and Conventions

### Formatting

- Use TypeScript across app code (`.ts`/`.tsx`).
- Follow existing formatting style:
  - single quotes
  - semicolons
  - trailing commas where formatter/linter applies
  - 2-space indentation
- Prefer readable small functions over dense inline logic.

### Imports

- Order imports in this pattern:
  1) external packages,
  2) Next/React helpers,
  3) internal `@/*` modules,
  4) type-only imports (`import type`) where applicable.
- Keep imports explicit; remove unused imports promptly.
- Use path alias `@/*` from `tsconfig.json` instead of long relative chains.

### Types and schemas

- `strict: true` is enabled; preserve strict correctness.
- Do not add `any` unless absolutely unavoidable and documented.
- Prefer narrow union types for domain values (example: `RiasecCategory`).
- Keep shared contract types in `src/types/chat.ts` aligned with API schema.
- Validate external/LLM boundaries with `zod` before state updates.

### Naming

- React components: PascalCase (`ChatWindow`, `RiasecRadarChart`).
- Hooks/utilities/functions: camelCase (`useVocational`, `analyzeSentiment`).
- Constants: UPPER_SNAKE_CASE for immutable config (`SYSTEM_PROMPT`).
- Files: keep existing folder naming conventions and domain grouping.
- Preserve existing Spanish domain keys in JSON contract:
  - `dialogo_ia`, `analisis_riasec`, `metadatos`, `pregunta_n`, etc.

## Next.js and Runtime Patterns

- Use App Router conventions under `src/app/`.
- Add `'use client'` only when client hooks/state/browser APIs are needed.
- Keep server logic in route handlers/server components when possible.
- For browser-only charting libraries, continue using dynamic import with `ssr: false`.
- Before framework-level changes, consult docs in `node_modules/next/dist/docs/`.

## State Management Rules

- Client context reducer owns cumulative RIASEC scoring.
- AI suggestions are inputs, not authoritative accumulated state.
- Keep question counter and finish conditions deterministic in state updates.
- Avoid mutating state objects directly; always return new objects.

## Error Handling Rules

- Validate request payloads and return typed JSON errors with proper status codes.
- Wrap API handlers in `try/catch` and log actionable server errors.
- Provide safe fallback responses so UI does not crash on model/runtime failures.
- In UI, render non-blocking user-facing error messages for request failures.
- Never expose secrets, raw stack traces, or provider internals to end users.

## Agent Execution Checklist

- Read impacted files before editing; preserve established patterns.
- Keep edits minimal and task-focused; avoid unrelated refactors.
- Run at least: `npm run lint` and `npx tsc --noEmit` after meaningful changes.
- If tests exist later, run targeted tests first, then broader suite as needed.
- Update this `AGENTS.md` when commands, architecture, or rules change.
