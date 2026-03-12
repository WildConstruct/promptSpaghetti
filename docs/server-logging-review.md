# Server Logging Review

This document captures the Phase 2 logging/privacy review for active beta-facing server surfaces.

## Active findings

### Good current state

- Active LLM, agent, PSG, and file routes do not log raw request bodies by default.
- [server/src/utils/metrics.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/utils/metrics.ts#L1) stores aggregate counters only; it does not retain prompt text, graphs, or PSG documents.
- The active LLM/agent/PSG routes return request-scoped payloads to the caller, but there is no server-side request archive in the reviewed path.

### Remaining caution areas

- [server/src/utils/privacy.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/utils/privacy.ts#L1) provides `redactPII`, but it is not globally enforced across all logging paths.
- Admin-only code still contains `console.error(...)` calls in [server/src/admin-panel-enhanced.ts](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/admin-panel-enhanced.ts#L592) and adjacent handlers. Those routes are now opt-in and gated, but they should still be treated as operator surfaces, not user surfaces.
- Quarantined mock auth utilities still log raw request bodies, for example [server/src/mock-auth-server.js](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/mock-auth-server.js#L46). They are now blocked from production-like runtime, but they remain noisy dev utilities and should stay quarantined.

## Risk classification

| Surface | Current Risk | Reason |
| --- | --- | --- |
| Active LLM routes | Low | No raw prompt logging found in active route/service path. |
| Active PSG routes | Low | No raw document logging found; request limits now reduce abuse risk. |
| Active agent routes | Low | No raw prompt logging found in active route/service path. |
| Active file routes | Low | No file-content logging found. |
| Admin panel | Medium | Gated now, but operator-facing error logging still exists and should not be exposed broadly. |
| Mock auth utilities | Medium | Still log request bodies, but now quarantined from production-like runtime. |

## Guardrails going forward

- Treat imported graphs, PSG documents, and provider payloads as hostile input and avoid logging them verbatim.
- If debug logging is added around LLM/agent/PSG failures, apply [redactPII](/mnt/c/Users/Owner/CascadeProjects/prompt-spaghetti/server/src/utils/privacy.ts#L12) before logging any user-controlled strings.
- Keep usage/accounting logs aggregate where possible: counts, sizes, route keys, quota buckets, not prompt/document bodies.
