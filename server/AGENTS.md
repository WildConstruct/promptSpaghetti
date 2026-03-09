# Agent Guidance — Server Runtime Source of Truth

Scope: all files under `server/**`

Rules for automated agents and developers:

- Canonical runtime
  - Use `server/src/index.ts` as the active server entrypoint.
  - Treat `server/package.json` and `server/tsconfig.json` as the matching build/runtime contract.

- Legacy alternates
  - Files such as `server/src/server-minimal.ts`, `server/src/main-clean.ts`, `server/src/index-cleaned.ts`, and `server/src/index.ts.bak` are legacy or recovery surfaces, not the default runtime.
  - Do not switch scripts, imports, or build config to those files without an explicit source-of-truth update.

- New runtime variants
  - Do not add new `.bak` entrypoints or alternate server mains under `server/src/` unless they are explicitly quarantined and documented.
  - Preferred pattern: place experimental or recovery entrypoints under `server/src/_quarantined/` and note why they exist.

Rationale: the server already has multiple historical entrypoints. Keeping one canonical runtime reduces deployment mistakes and review ambiguity.
