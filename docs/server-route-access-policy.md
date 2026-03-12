# Server Route Access Policy

This file is the source of truth for server-side route exposure in the MVP/beta hardening phase.

| Route | Purpose | Access | Auth Required | Capability Required | Rate Limit | Quota | Input Limits | Surface |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/api/llm/status` | Report server LLM mode/capabilities | public-demo | No | None | None | None | None | Public |
| `/api/llm/complete` | Server-routed LLM completion | authenticated-user | Bearer Supabase JWT | `cloud-llm` | `LLM_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-llm` quota | Zod request schema | Private |
| `/api/llm/parse` and aliases | Prompt parsing helpers | authenticated-user | Bearer Supabase JWT | `cloud-llm` | `LLM_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-llm` quota | Zod request schema | Private |
| `/api/llm/suggest` | Inspiration suggestions | authenticated-user | Bearer Supabase JWT | `cloud-llm` | `LLM_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-llm` quota | Zod request schema | Private |
| `/api/llm/metadata` | Metadata extraction | authenticated-user | Bearer Supabase JWT | `cloud-llm` | `LLM_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-llm` quota | Zod request schema | Private |
| `/api/llm/refine` | Text refinement | authenticated-user | Bearer Supabase JWT | `cloud-llm` | `LLM_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-llm` quota | Zod request schema | Private |
| `/api/llm/analyze` | Graph analysis | authenticated-user | Bearer Supabase JWT | `cloud-llm` | `LLM_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-llm` quota | Zod request schema | Private |
| `/api/llm/optimize` | Choice optimization | authenticated-user | Bearer Supabase JWT | `cloud-llm` | `LLM_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-llm` quota | Zod request schema | Private |
| `/api/llm/populate` | Choice population | authenticated-user | Bearer Supabase JWT | `cloud-llm` | `LLM_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-llm` quota | Zod request schema | Private |
| `/api/agent/draft-graph` | Draft a graph from prompt | authenticated-user | Bearer Supabase JWT | `cloud-agent` | `LLM_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-agent` quota | Zod request schema | Private |
| `/api/psg/capabilities` | Report PSG protocol capabilities | public-demo | No | None | None | None | None | Public |
| `/api/psg/validate` | Validate PSG document | authenticated-user | Bearer Supabase JWT | `cloud-psg` | `PSG_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-psg` quota | Zod + request caps | Private |
| `/api/psg/normalize` | Normalize PSG document | authenticated-user | Bearer Supabase JWT | `cloud-psg` | `PSG_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-psg` quota | Zod + request caps | Private |
| `/api/psg/assets/register` | Register PSG assets | authenticated-user | Bearer Supabase JWT | `cloud-psg` | `PSG_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-psg` quota | Zod + request caps | Private |
| `/api/psg/assets/derive` | Register derived PSG asset lineage | authenticated-user | Bearer Supabase JWT | `cloud-psg` | `PSG_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-psg` quota | Zod + request caps | Private |
| `/api/psg/expand-crowd` | Expand PSG crowd plan | authenticated-user | Bearer Supabase JWT | `cloud-psg` | `PSG_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-psg` quota | Zod + request caps | Private |
| `/api/psg/scene/assemble` | Assemble scene payload | authenticated-user | Bearer Supabase JWT | `cloud-psg` | `PSG_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-psg` quota | Zod + request caps | Private |
| `/api/psg/export/comfy` | Export PSG to Comfy bridge | authenticated-user | Bearer Supabase JWT | `cloud-psg` | `PSG_RATE_LIMIT_PER_MINUTE` | Per-user daily `cloud-psg` quota | Zod + request caps | Private |
| `/api/files/*` | User graph file storage | authenticated-user | Bearer Supabase JWT | None | Route-specific | Per-user daily `files` quota | Filename + body limit | Private |
| `/admin`, `/api/admin/*` | Admin/debug/config surfaces | privileged-internal | Basic auth | `admin` | Route-specific | None | Minimal | Internal |

Notes:

- Public-demo routes are intentionally read-only.
- Authenticated-user routes require server-side Supabase token verification, not UI state alone.
- Cloud capability checks now use server-side auth context, not just environment flags. Subscription/capability metadata can be supplied via Supabase user/app metadata, and `ALLOW_ALL_AUTHENTICATED_CLOUD=true` is the explicit bypass for beta/testing.
- Privileged/internal routes are opt-in and only mount when `ENABLE_ADMIN=true` and a non-default `ADMIN_PASSWORD` is configured.
- PSG request caps are intentionally separate from schema validation. A payload can be structurally valid and still be rejected if it exceeds operational limits.
