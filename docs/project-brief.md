# Project Brief: PromptScape Randomizer Graph

_Last updated: 2025-07-09_

---

## 1. Executive Summary

| Item              | Value                                                                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goal**          | Build an MVP of **PromptScape Randomizer Graph**: a React-Flow front-end plus Node/TypeScript executor (Python bridge optional) that lets prompt artists design deterministic, branching prompt grammars. |
| **Sprint Window** | **4 weeks** (T₀ → T₀ + 28 days)                                                                                                                                                                           |
| **Success Check** | A demo graph with six core nodes executes end-to-end inside Windsurf, produces five seeded prompt variants in < 1 s, and can also be run headlessly from a CLI command.                                   |

---

## 2. Problem / Opportunity Statement ❓ _(needs input)_

Explain **why** deterministic, node-based prompt grammars matter to the business / users. What pain does this solve and what opportunity does it unlock?
Why deterministic, node-based prompt grammars matter:
In creative AI applications, ensuring deterministic and reliable outputs is crucial for maintaining consistency in content generation. By allowing prompt artists to build node-based, branching prompt grammars, we provide a flexible and controlled environment for creating content that can be tested, adjusted, and refined without the randomness often associated with traditional prompt engineering.

Pain it solves:
Unpredictability: Traditional random prompt generation can lead to inconsistent outputs, making it difficult to achieve reliable results.
Manual effort: Rewriting or tweaking prompts for variations is often a tedious, manual task.
Scalability: As content needs grow (e.g., for LLMs, image generators), scaling prompt creation manually becomes unsustainable.
Opportunity it unlocks:
Automation and consistency: Unlocks automated and repeatable prompt creation with fine-grained control.
Scalable creative workflows: Allows artists to scale content creation without sacrificing quality or consistency.
Collaborative creativity: Provides an intuitive tool that artists, engineers, and testers can use to co-create prompts with clear specifications and variations.

---

## 3. Primary User Personas & Key Workflows ❓ _(needs input)_

|                         | Persona                                                                                                                   | Goals / Jobs-to-Be-Done |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **Prompt Artist**       | - Design and refine prompt grammars for deterministic AI outputs.                                                         |
|                         | - Experiment with prompt variations, ensuring all branches are tested and produce valid results.                          |
|                         | - Ensure generated content is within defined creative parameters, balancing randomness with controlled creative freedom.  |
| **QA Reviewer**         | - Test output variants to ensure they meet quality standards (accuracy, creativity, and relevance).                       |
|                         | - Validate that all prompts work as intended with edge-case handling and no broken branches in the graph.                 |
| **Automation Engineer** | - Develop and maintain automated systems that integrate with the graph designer to generate prompts at scale.             |
|                         | - Ensure that the system can execute a variety of prompt configurations headlessly (CLI-based) for testing or production. |

Describe the top three user flows the MVP must support.

---

## 4. Scope & Functional Requirements (Phase-0)

### 4.1 Core Features (Already Defined)

1. React-Flow editor with six node types (WeightedChoice, Concat, Output, etc.)
2. Deterministic executor with seeded RNG
3. CLI wrapper `npx promptgraph exec …` ➜ prints prompt
4. Preview-5 button in UI to generate variants
5. CI pipeline (lint, tests, Docker build)

### 4.2 Out-of-Scope (Phase-1 backlog)

• Node library expansion (Conditional, RandomInt …)  
• Python executor bridge  
• Persist / Reload graphs  
• Error handling improvements  
• Corrections Store (Edge-Case Tuning module)

---

## 5. Non-Functional Requirements ❓ _(needs input)_

| Area              | Requirement                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Performance**   | - < 1 second to generate five variants of a prompt.                                                              |
|                   | - Memory usage: < 500 MB during execution of graph traversal and node execution.                                 |
| **Compatibility** | - Browsers: Chrome ≥ 113, Firefox ≥ 114, Edge (latest)                                                           |
| **Security**      | - All secrets managed through Windsurf **Secret Manager** (e.g., API keys for image generation or LLM services). |
|                   | - No keys, credentials, or tokens in source code or Git history.                                                 |
| **Accessibility** | - WCAG 2.1 AA standard for the editor UI: ensures visual accessibility and keyboard navigability for all users.  |

Add any others (bundle size, localization, etc.).

---

## 6. Technical & Integration Contracts

| Contract                     | Spec                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Bundle JSON**              | Uses `GeneratorBundle` interface (see exporter spec). Versioning field `metadata.version`; must remain backward-compatible (semver). |
| **CLI Exit Codes**           | `0` = success, `1` = validation error, `>1` = executor crash. Logs JSON lines for pipeline consumption.                              |
| **Python Bridge (optional)** | REST/gRPC endpoint: `POST /execute` body =`{bundle, seed}`. Response `{text, debug}`.                                                |

---

## 7. Deployment & Environments ❓ _(needs input)_

Outline dev → staging → prod deploy flow; preview URL naming; artifact registry.
Development → Staging → Production Deploy Flow:
Development
Code pushed to feature/ branches.
Build process auto-triggers containerized development environment for local testing.
Continuous integration (CI) runs tests on pull requests.
Deploy to Windsurf’s preview URL for live testing.
Staging
Once QA and product teams approve, code merged into main and tagged for staging.
Full integration tests and end-to-end testing are done here.
Auto-deployment to staging environments via Docker.
Production
After staging is validated, deploy to production environments.
Ensure production URL points to live UI and APIs.
Use Windsurf’s integrated secrets management to inject API keys securely in the environment.
Preview URL Naming:
Each feature branch gets a dedicated preview URL in the Windsurf IDE.
https://<branch-name>-preview.windsurf.com
Artifact Registry:
All generated bundle files (i.e., prompts) should be stored in a private artifact registry, accessible to the production environment (e.g., AWS S3 or GitHub Packages for easy sharing across deployments).

---

## 8. Acceptance Criteria for Alpha Handoff

- [ ] Editor draws six node types, edits params, saves graph JSON.
- [ ] Executor + CLI deterministic (< 1 s for demo graph).
- [ ] CI pipeline green on `main` branch.
- [ ] Demo accessible via Windsurf Preview URL and README.

---

## 9. Risks & Mitigation

| Risk                             | Likelihood | Impact | Mitigation                                                              |
| -------------------------------- | ---------- | ------ | ----------------------------------------------------------------------- |
| Scope creep around Python bridge | M          | H      | Defer bridge to Phase-1; maintain thin Node adapter.                    |
| Perf on large graphs             | M          | M      | Profiling in Playwright e2e tests; virtualise React-Flow nodes if >500. |
| RNG parity JS ↔ Py              | L          | H      | Golden-file tests for same seed across runtimes.                        |
| …                                |            |        |                                                                         |

Add more as discovered.

---

## 10. Stakeholders & Decision Makers ❓ _(needs input)_

| Role              | Name    | Responsibility                                                                    |
| ----------------- | ------- | --------------------------------------------------------------------------------- |
| **Product Owner** | \[Name] | Responsible for defining scope and priorities, overseeing the MVP roadmap.        |
| **Tech Lead**     | \[Name] | Responsible for architecture decisions, code quality, and technical feasibility.  |
| **UX Lead**       | \[Name] | Oversees the design of the editor UI, ensuring accessibility and user experience. |

## 11. References

- Phase-0 implementation plan (see project ticket)
- Exporter & Corrections Store spec v0.2 (2025-07-08)
- Windsurf Dev-Container docs

---

> _Fill in the ❓ sections and confirm. Once finalized, this brief locks Phase-0 scope and we can progress to PM → PRD phase._
