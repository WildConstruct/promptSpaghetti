# Server Route Access Policy

_Last updated: 2026-04-13_

This file describes the active Fastify route surface for the MVP/beta hardening
phase.

Implementation source of truth:

- mounted runtime: `server/src/index.ts`
- route surface catalog: `server/src/routeSurfaceCatalog.ts`

The catalog is the canonical contract for route families, access tier, and
product-story classification. This document mirrors that contract in human form.

## Route Families

| Route Family | Purpose | Story Role | Access Tier | Auth | Capability | Rate Limit / Quota | Visibility |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/health` | Basic process health | status | public-readonly | No | None | None | Public |
| `/api/healthz` | API/platform health | status | public-readonly | No | None | None | Public |
| `/preview` | Read-only graph preview execution | preview | public-readonly | No | None | `preview` rate limit only | Public |
| `/api/llm/status` | Server LLM availability and capabilities | status | public-readonly | No | None | None | Public |
| `/api/psg/capabilities` | Hosted PSG capability report | psg-protocol | public-readonly | No | None | None | Public |
| `/api/local-image/status` | Local sandbox image runtime status | sandbox-generation | local-only | No | None | None | Local only |
| `/api/local-image/batch` | Local-only Comfy-compatible batch generation | sandbox-generation | local-only | No | None | route-specific | Local only |
| `/api/local-image/files/:runId/:filename` | Local generated image file access | sandbox-generation | local-only | No | None | route-specific | Local only |
| `/api/agent/draft-graph` | Prompt -> Graph Draft | primary-ai-path | authenticated | Bearer Supabase JWT | `cloud-agent` | `agent:draft-graph` + `cloud-agent` quota | Private |
| `/api/llm/complete` and `/api/llm-complete` | Secondary authenticated completion helper | secondary-authoring-helper | authenticated | Bearer Supabase JWT | `cloud-llm` | `llm:route` + `cloud-llm` quota | Private |
| `/api/ai/parse`, `/api/llm/parse`, `/api/ai-parse`, `/api/llm-parse` | Secondary authenticated parsing helper and compatibility aliases | secondary-authoring-helper | authenticated | Bearer Supabase JWT | `cloud-llm` | `llm:route` + `cloud-llm` quota | Private |
| `/api/llm/suggest` and `/api/llm-suggest` | Secondary authenticated inspiration helper | secondary-authoring-helper | authenticated | Bearer Supabase JWT | `cloud-llm` | `llm:route` + `cloud-llm` quota | Private |
| `/api/llm/metadata` and `/api/llm-metadata` | Secondary authenticated metadata helper | secondary-authoring-helper | authenticated | Bearer Supabase JWT | `cloud-llm` | `llm:route` + `cloud-llm` quota | Private |
| `/api/llm/refine` and `/api/llm-refine` | Secondary authenticated text-refinement helper | secondary-authoring-helper | authenticated | Bearer Supabase JWT | `cloud-llm` | `llm:route` + `cloud-llm` quota | Private |
| `/api/llm/analyze` and `/api/llm-analyze` | Secondary authenticated graph-analysis helper | secondary-authoring-helper | authenticated | Bearer Supabase JWT | `cloud-llm` | `llm:route` + `cloud-llm` quota | Private |
| `/api/llm/optimize` and `/api/llm-optimize` | Secondary authenticated weighted-choice helper | secondary-authoring-helper | authenticated | Bearer Supabase JWT | `cloud-llm` | `llm:route` + `cloud-llm` quota | Private |
| `/api/llm/populate` and `/api/llm-populate` | Secondary authenticated choice-population helper | secondary-authoring-helper | authenticated | Bearer Supabase JWT | `cloud-llm` | `llm:route` + `cloud-llm` quota | Private |
| `/api/psg/validate` | PSG validation | psg-protocol | authenticated | Bearer Supabase JWT | `cloud-psg` | `psg:route` + `cloud-psg` quota | Private |
| `/api/psg/normalize` | PSG normalization | psg-protocol | authenticated | Bearer Supabase JWT | `cloud-psg` | `psg:route` + `cloud-psg` quota | Private |
| `/api/psg/assets/register` | PSG asset registration | psg-protocol | authenticated | Bearer Supabase JWT | `cloud-psg` | `psg:route` + `cloud-psg` quota | Private |
| `/api/psg/assets/derive` | PSG derived-asset lineage | psg-protocol | authenticated | Bearer Supabase JWT | `cloud-psg` | `psg:route` + `cloud-psg` quota | Private |
| `/api/psg/expand-crowd` | Hosted crowd expansion | psg-protocol | authenticated | Bearer Supabase JWT | `cloud-psg` | `psg:route` + `cloud-psg` quota | Private |
| `/api/psg/scene/assemble` | Scene-sidecar assembly | psg-protocol | authenticated | Bearer Supabase JWT | `cloud-psg` | `psg:route` + `cloud-psg` quota | Private |
| `/api/psg/export/comfy` | Downstream Comfy bridge export | psg-protocol | authenticated | Bearer Supabase JWT | `cloud-psg` | `psg:route` + `cloud-psg` quota | Private |
| `/api/files/*` | Authenticated graph file storage | storage | authenticated | Bearer Supabase JWT | None | route-specific + `files` quota | Private |
| `/admin` | Internal admin/debug panel | admin | internal | Basic auth | `admin` | route-specific | Internal |
| `/api/admin/*` including theme/fonts/logo/metrics | Internal admin/theme/upload surfaces | admin | internal | Basic auth | `admin` | route-specific | Internal |

## Product Interpretation

- Public routes stay intentionally small, read-only, and non-persistent.
- `Prompt -> Graph Draft` is the primary authenticated AI path.
- Broader LLM routes remain supported, but they are secondary authoring helpers,
  not the MVP headline.
- PSG routes remain the durable protocol center for validation, normalization,
  export, and hosted upgrade helpers.
- Local sandbox image generation is a separate local-only demo lane. It should
  not be described as part of the hosted public API surface.
- Admin and theme routes are opt-in internal surfaces, not product-facing API.

## Notes

- Authenticated routes require server-side Supabase token verification, not UI
  state alone.
- Capability checks and quota enforcement are owned by
  `server/src/utils/routeAccess.ts`.
- Compatibility aliases in the LLM family stay mounted for now; they are not a
  signal that multiple AI products are in scope.
- Legacy `api/` deployment surfaces remain compatibility-only and should not be
  treated as the canonical Fastify runtime.
