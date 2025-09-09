# Security Hardening (Vibe-coded App)

This document tracks practical, high‑impact steps for securing this app in line with the provided checklist. It maps actions to our code and lists next steps.

## What’s already implemented

- API/Secrets
  - All client LLM/API calls are routed through the server; no OpenAI/OpenRouter keys in the browser. (client uses `/api/*`)
  - Netlify proxy (Option A) keeps client calls relative.
  - Server loads secrets from `.env` (root + server); no secrets in repo.

- Rate limiting
  - Token bucket on `/api/llm/complete` (per-IP). Can extend to other endpoints if needed.

- Input validation
  - zod on LLM routes and files routes (upload/download/delete) + filename sanitization.

- Supabase storage and auth
  - Server verifies Supabase JWT (`Authorization: Bearer <token>`) and derives `userId` server‑side.
  - Storage paths: `graphs/<userId>/...` (per‑user isolation). See sample RLS in README.

- CSP / Headers
  - Baseline CSP added in `netlify.toml` (restrictive defaults, allows connect to backend/app). XFO, XCTO set.

- Admin hardening
  - Test buttons for Supabase/OpenRouter; auto‑dismiss banners; delete‑key confirmation phrase; form content‑type parser.

## High‑priority next steps

1. Supabase RLS throughout
   - Apply the Storage policies in README and enable RLS on application tables with `user_id = auth.uid()` checks.

2. Rate limit sensitive routes
   - Extend token buckets to `/api/files/*`, `/api/auth/*` (if enabled) and any costly endpoints.

3. Expand validation and sanitization
   - Add zod schemas to any remaining routes; sanitize inputs on the server before use.

4. Tighten CSP
   - Remove `'unsafe-inline'` once styles/scripts are hashed or use nonces. Add `object-src 'none'`, `base-uri 'self'`.

5. Logging/Monitoring
   - Add server‑side logging (filtered/redacted) for LLM and file operations. Add Sentry for client/server errors.

6. Bot/abuse controls
   - Add Turnstile/HCaptcha to signup/login (if exposed) and any unauth’d write endpoints.

7. Dependencies & CI
   - Regular `pnpm audit` and update remediation.
   - Consider Semgrep or similar in CI for SAST checks.

## Optional / longer‑term

- Webhooks (Stripe, etc.): verify signatures server‑side.
- Egress controls: proxy outbound calls and whitelist allowed hosts.
- Human‑in‑the‑loop: YubiKey or Touch ID gate for critical admin actions.

