# LLD Forge

A focused Low-Level Design practice platform built for the CipherSchools 2-Day Engineering Assignment.

## Core learner loop

Problem → Design → Save Draft → Submit → Validate → Evaluate → Feedback → History → Try Again

## Why this MVP is intentionally small

The product focuses on the practice-feedback-retry loop instead of building authentication, leaderboards, microservices, a full UML editor, or a coding judge.

## Stack

- React + TypeScript + Vite
- Node.js + Express + TypeScript
- SQLite + better-sqlite3
- Optional AI evaluator through an OpenAI-compatible HTTP endpoint
- Vitest for tests

## Run locally

Requirements:
- Node.js 20+ recommended
- npm

From the repository root:

```bash
npm install
npm run install:all
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000/api/health

## Optional AI configuration

Copy:

```bash
server/.env.example
```

to:

```bash
server/.env
```

The application works without an AI key. In that case, deterministic/mock evaluation is used so the full demo remains functional.

For an OpenAI-compatible provider, set:

```env
AI_API_URL=...
AI_API_KEY=...
AI_MODEL=...
```

## Test

```bash
npm test
```

## Build

```bash
npm run build
```
