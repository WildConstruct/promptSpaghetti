# Epic 17 – Admin Control Plane – Detailed Design

> This document starts with **Story 17.1 – Feature Management & Toggle System** (core foundation). Subsequent stories will extend this base.

Dependencies: Epics 11 (Auth/RBAC), 13 (Analytics & Monitoring), 14 (Experimentation), 16 (Marketplace moderation).

---

## 17.1 Feature Management & Toggle System

### 1. Objectives & KPIs

| ID  | Objective                                                     | KPI                                        |
| --- | ------------------------------------------------------------- | ------------------------------------------ |
| F1  | Safely roll out new features with granular targeting          | <2 % rollback rate                         |
| F2  | Enable A/B traffic allocation hooks for Epic 14               | Toggle activation latency ≤100 ms          |
| F3  | Provide audited change history for compliance                 | 100 % toggle changes logged                |
| F4  | Surface real-time impact metrics (Claude token spend, errors) | Dash refresh ≤5 s                          |
| F5  | Support emergency kill-switch path                            | Activation → service stop ≤30 s            |
| F6  | Claude model toggle switchover success ≥ 99 %                 | `claude_toggle_success_rate` in ClickHouse |

### 2. Toggle Taxonomy

• **Boolean** (on/off)  
• **Percentage Rollout** (0-100 %)  
• **Multivariate** (string value)  
• **Scheduled** (time-window)  
• **Dynamic** (bandit/auto-adjust) – reserved for future Epic 14 integration  
• **Segmentation** (attribute rule set)  
• **Claude-Impact** (AI-related) metadata: `claude_impact` enum {NONE, PROMPT_COST, MODEL_VERSION, OUTPUT_QUALITY, HALLUCINATION_RISK}

### 3. High-Level Architecture

```mermaid
flowchart LR
  FE[Admin UI (Next.js 15)] <-- GraphQL --> FMAPI[Feature-Toggle API (NestJS)]
  FMAPI -- PG --> PG[(Postgres 15)]
  FMAPI -- NATS --> CDN[Config CDN]:::edge
  subgraph Services
    SDK[Feature SDK]:::edge
    APP1(Workspace Svc)
    APP2(Marketplace Svc)
  end
  CDN --> SDK
  SDK --> APP1
  SDK --> APP2
  FMAPI -- Audit --> CH[ClickHouse]:::db
  FMAPI -- OTEL --> OTEL[(OpenTelemetry)]
  classDef edge stroke:#0077ff,stroke-width:2;
  classDef db fill:#fff5d9,stroke:#e0b75a;
```

- Hot-path: Services fetch toggle snapshot from CloudFront (signed HMAC URLs per org, max-age 30 s) → guarantees ≤100 ms activation.
- Additional consumers: **Prompt Engine** and **Claude Simulator** ensure preview & editor behavior respect active toggles.

### 4. Data Model (simplified)

```
Table: feature_toggle
  id UUID PK
  key text UNIQUE
  type enum
  value jsonb -- structure differs per type
  uuid org_id FK -- null => global toggle
  text[] claude_compat
  claude_impact enum
  description text
  created_at timestamptz
  updated_at timestamptz
  archived bool default false

Table: toggle_scope
  id UUID PK
  toggle_id FK
  rule jsonb -- attribute list or percentage value

Table: toggle_audit
  id UUID PK
  toggle_id FK
  actor_id FK(users)
  action enum(created,updated,archived,override)
  before jsonb
  after jsonb
  created_at timestamptz
```

Indexes: `feature_toggle(key)`, GIN on `toggle_scope.rule`.
Partition `toggle_audit` by month for query performance.

### 5. API Surface

| Method | Path                  | Auth      | Notes                                                                 |
| ------ | --------------------- | --------- | --------------------------------------------------------------------- |
| GET    | /toggles              | admin     | Paginated list w/ filter                                              |
| POST   | /toggles              | admin     | Create toggle (draft)                                                 |
| PUT    | /toggles/:id          | admin     | Update values/scopes                                                  |
| POST   | /toggles/:id/activate | admin     | `dryRun` query param simulates impact via Epic 13 before publish      |
| POST   | /toggles/:id/rollback | admin     | Revert to prev version & push NATS `toggle.rolled_back`; 2FA required |
| GET    | /toggles/:id/audit    | admin     | Change history                                                        |
| POST   | /toggles/:id/override | emergency | Temp kill-switch override (TTL)                                       |

### 6. Toggle Distribution Pipeline

1. Admin activates toggle.
2. FMAPI writes `feature_toggle` row, logs audit.
3. Publishes `config.toggle.updated` NATS event containing new snapshot version.
4. Config-Builder job (Go) consumes event, compiles org-scoped JSON snapshot, uploads to S3 + invalidates CloudFront path.
5. SDKs poll `HEAD` for `etag`; if changed → download new JSON; hot-reload in-process.

### 7. SDK Client (shared across services & clients)

- Language targets: TS/Node, Go, Rust (for Tauri), Swift/Kotlin (mobile).
- Caches snapshot in memory; fallback to last-known file on failure.
- Evaluation engine supports percentage hashing (`murMur3(user_id+key+salt)`), attribute rules, schedules.
- Emits OTEL span `toggle.evaluate` with decision metadata for Epic 13 analytics.

### 8. Metrics & Dashboards

- Toggle state counts (on/off/by type).
- Activation latency (API → service fetch).
- Conversion impact: integrates Epic 14 experiment IDs.
- Claude token spend delta when `claude_impact≠NONE` (requires ClickHouse join).

### 9. Security & Compliance

- JWT auth (Epic 11) with `role=admin` + `permission=toggle.manage`.
- Signed URLs for CDN snapshots (HMAC).
- Audit log immutable (ClickHouse + S3 Glacier backup).
- GDPR: audit entries redact PII in rule snapshots.

### 10. Risks & Mitigations

| Risk                                | Impact | Mitigation                                            |
| ----------------------------------- | ------ | ----------------------------------------------------- |
| Mis-configured toggle causes outage | High   | Staging verification + auto-canary 1 % low-usage orgs |
| Latency fetching snapshot           | Med    | CDN edge cache + 30 s fallback TTL                    |
| Rule explosion slows evaluation     | Low    | SDK pre-compiles regex; perf tests <0.05 ms eval      |
| Emergency override fails            | Low    | Offline `kill-switch.json` checked on boot            |

### 11. Testing Strategy

- Unit: SDK eval cases (200+ permutations) via Jest/Go-test.
- Integration: Activate toggle → verify service picks up within 30 s (Playwright + k6).
- Chaos: Simulate CDN outage; SDK must fallback.
- Security: OWASP scan of FMAPI, IAM policy audit.
- Performance: Hash evaluation benchmark at 50 k ops/s per pod.

### 12. PoC Tasks (Sprint-0)

1. Scaffold `feature-toggle` NestJS module + GraphQL schema.
2. Implement Config-Builder job publishing to S3 dev bucket.
3. Create TypeScript SDK with boolean & percentage evaluation.
4. Wire OTEL spans and send to Epic 13 collector.
5. Demo kill-switch override triggering synthetic outage in staging.

---

## 17.2 Content Management System (CMS)

### Objectives & KPIs

| C-ID | Objective                                  | KPI                             |
| ---- | ------------------------------------------ | ------------------------------- |
| C1   | Streamline content moderation & publishing | Avg review time < 4 h           |
| C2   | AI-assisted tagging and safety scoring     | 90 % auto-tag accuracy          |
| C3   | Version control with diff & rollback       | ≤1 % merge conflicts unresolved |

### Architecture Highlights

- Admin UI `/cms` module (Next.js) leveraging same GraphQL endpoint.
- **CMS API** (NestJS) reuses Epic 16 moderation pipeline.
- Claude-assisted auto-tag microservice (`taggerSvc`) consumes `cms.uploaded` events.
- Assets in `cms-assets/` S3 with versioning.

### Data Model Additions

```
content_item(id PK, org_id FK, type, title, status enum(draft,pending,approved,rejected), current_version, claude_tags text[], safety_score float, created_at)
content_version(id PK, item_id FK, blob_url, changelog_md, diff_json, created_at)
```

GIN index on `claude_tags`, partition by `created_at`.

### Key APIs

| Method | Path                  | Purpose                          |
| ------ | --------------------- | -------------------------------- |
| POST   | /content              | Upload draft (supports .psgraph) |
| POST   | /content/:id/submit   | Send to moderation               |
| GET    | /content/:id/versions | List with Claude summaries       |
| POST   | /content/:id/merge    | Bulk ops with preview            |

### Moderation Flow

1. Upload triggers VirusTotal → Claude safety (score).
2. If `safety_score>0.7` or tags flagged → Manual queue.
3. Reviewer UI shows Claude diff + merge suggestion.
4. Approval emits `content.approved` NATS event.

### Risks

| Risk                 | Mitigation                             |
| -------------------- | -------------------------------------- |
| High false-positives | Feedback loop to tune Claude threshold |
| Bulk merge error     | Transaction wrap + preview sandbox     |

---

## 17.3 User & Permission Management

### Objectives

| U-ID | Objective                                  | KPI                                 |
| ---- | ------------------------------------------ | ----------------------------------- |
| U1   | Fine-grained RBAC with Claude-aware scopes | <1 privilege escalation incident    |
| U2   | Self-service requests with AI triage       | 70 % auto-approved low-risk tickets |

### Components

- **Identity Service** (Epic 11) extended with **Permission Registry**.
- **Anomaly Detector** microservice uses Claude to flag unusual activity (prompt count spike).
- Admin UI `/users` with heat-map of Claude usage.

### Data Extensions

`role(name PK, inherits)`, `permission(key PK, description)`, `role_perm(role, perm)`, `user_role(user, role, expires_at)`

### Workflows

- **Request Access** ➜ Claude evaluates risk (low, med, high). Low auto-granted; others queue for admin.
- **Temp Beta Grants** for new Claude models via toggle link.

### Testing

- Load test 1 k concurrent RBAC checks (target <1 ms eval).
- Pen-test spoofed token scopes.

---

## 17.4 System Configuration & Monitoring

### Goals

| M-ID | Goal                                           | Metric               |
| ---- | ---------------------------------------------- | -------------------- |
| M1   | Unified dashboard for infra + business metrics | p95 widget load <2 s |
| M2   | Automated health probes incl. Claude API       | MTTR <10 min         |

### Stack

- Grafana 11 + Prometheus for infra.
- ClickHouse views for business (Claude success rate, token spend).
- **Config API** (NestJS) managing secrets (Claude keys) with Vault.
- Backup orchestrator uses RDS snapshots + S3 tiering.

### Health Checks

- Synthetic Claude prompt every 5 min; alert if latency >1 s.
- NATS lag probe, Elastic cluster status, Stripe webhook MTTR.

### Risks

| Risk          | Mitigation                                      |
| ------------- | ----------------------------------------------- |
| Metrics bloat | Rollup rules, 30-day TTL on fine-grained series |
| Secret leak   | Vault transit encryption + audit logs           |

---

## 17.5 Marketplace Administration

### Objectives

| P-ID | Objective                               | KPI                                       |
| ---- | --------------------------------------- | ----------------------------------------- |
| P1   | Ensure Marketplace quality & compliance | <2 % refund due to mis-described template |
| P2   | Fraud & anomaly detection               | Detect ≥90 % fraudulent purchases         |

### Features

1. **Review Queue** with checklist (hallucination sample, licensing).
2. **Featured Slots** – traffic allocation via Epic 14 toggles.
3. **Transaction Monitor** – ClickHouse + Claude anomaly rules.
4. **Policy Enforcement** – admin actions (suspend, delist).
5. **Verification** – trust score algorithm weighting Windsurf contributions.
6. **Analytics** – health score widget (token savings, conversion).

### Data Additions

`marketplace_flag(id, template_id, reason, claude_sentiment, created_at)`

### Risks & Controls

| Risk        | Control                                              |
| ----------- | ---------------------------------------------------- |
| Promo abuse | A/B guard + spend caps                               |
| Fraud rings | Graph-based anomaly clustering via Claude embeddings |

---

_Epic 17 now has detailed designs for all admin stories, each leveraging prior epics while adding AI-assisted workflows to reduce manual load._
