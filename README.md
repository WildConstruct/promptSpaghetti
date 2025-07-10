# PromptScape Randomizer Graph

[![codecov](https://codecov.io/gh/WildConstruct/prompt-spaghetti/branch/main/graph/badge.svg)](https://codecov.io/gh/WildConstruct/prompt-spaghetti)

Monorepo for a node-based prompt randomizer graph editor and executor.

## Structure
- `client/`: React + Vite front-end (React-Flow canvas)
- `server/`: Node 18 Fastify API (executor, preview route)
- `packages/core`: Shared types, Zod schemas, engine
- `packages/cli`: CLI wrapper for batch execution

## Quick Start
1. Open in Windsurf or VS Code with DevContainer support.
2. Run `pnpm install` at the repo root.
3. Use `pnpm dev` to start the client and server.

## Ports
- 3000: UI (Vite)
- 8000: API (Fastify)

## Contributing
- Lint: `pnpm lint`
- Test: `pnpm test`
- Coverage: `pnpm test -- --coverage`

---

See `docs/prd.md` and `docs/architecture.md` for full requirements and design.
