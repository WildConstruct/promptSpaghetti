# Multi-Seed Output Template Exports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a template-shaped copy/export step for multiple preview seeds so Prompt Spaghetti can turn existing seed outputs into single-shot image-generation prompts such as 3-up extras cards.

**Architecture:** Keep graph execution unchanged. Add a pure formatter module beside `PreviewTray`, cover it with tests, and wire `PreviewTray` copy actions to choose between plain seed list and 3-up image prompt export.

**Tech Stack:** React 18, TypeScript, Jest/ts-jest, existing PreviewTray clipboard flow.

---

## File Structure

- Create: `packages/core/components/PreviewTray/outputTemplates.ts`
  - Defines export template ids and pure formatting functions.
  - Converts `PreviewResult[]` plus optional refined text into copied text.
- Create: `packages/core/components/PreviewTray/__tests__/outputTemplates.test.ts`
  - Tests plain seed list formatting and grouped 3-up image prompt formatting.
- Modify: `packages/core/components/PreviewTray/PreviewTray.tsx`
  - Adds an export-template selector and copy button behavior.
  - Reuses existing `onCopy` callback, avoiding clipboard implementation churn.
- Modify: `experiments/image-generation/2026-06-20-explore-demo-graphs/analysis.md`
  - Records that grouped export is now a first-class UI/template workflow.

## Tasks

### Task 1: Pure Formatter

- [x] Write failing tests for:
  - plain seed list output keeps existing `Seed <seed>: <text>` behavior.
  - 3-up image prompt groups three results into left/center/right slots.
  - incomplete final groups are skipped so a 3-up prompt never has missing people.
- [x] Implement `outputTemplates.ts` with:
  - `OutputTemplateId = 'plain' | 'three-up-image-prompt'`
  - `formatPreviewResultsForTemplate(results, options)`
  - `OUTPUT_TEMPLATE_OPTIONS`
- [x] Tests green (`outputTemplates.test.ts`)

### Task 2: PreviewTray Integration

- [x] Import `OUTPUT_TEMPLATE_OPTIONS` and `formatPreviewResultsForTemplate`.
- [x] Local `selectedOutputTemplate` state defaulting to `plain`.
- [x] `handleCopyAll` uses formatter (incl. LLM-refined text when enhanced).
- [x] Selector: Plain seed list / 3-up image prompt (+ hint when &lt;3 seeds).
- [x] Button text remains `Copy All`.

### Task 3: Verification and Experiment Continuation

- [x] Formatter + PreviewTray tests green (work-loop B3 verify).
- [ ] Optional: generate Explore 3-up image corpus / analysis.md (experiment lane, not product gate).
