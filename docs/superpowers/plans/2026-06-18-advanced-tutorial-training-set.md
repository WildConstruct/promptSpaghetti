# Advanced Tutorial Training Set Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an expanded advanced tutorial section that teaches Prompt Spaghetti as phrase-system thinking through guided modules, real template examples, and phrase-grammar debugging exercises.

**Architecture:** Keep the current basic onboarding sequence intact, add a second advanced tutorial sequence, and connect it to existing graph templates plus one new phrase-grammar template. Tutorial content remains data-driven so future lessons can be added without changing overlay mechanics.

**Tech Stack:** React 18, TypeScript, React Flow, Zustand-backed graph state, existing Epic 1 onboarding components, Jest/React Testing Library.

---

## Current Surface

The basic onboarding flow is defined in `packages/core/components/epic1/onboarding/tutorialModel.ts` and consumed directly by `packages/core/components/epic1/onboarding/TutorialContext.tsx`. `OnboardingIntegration.tsx` renders the overlay and progress widget, and app code starts the flow with the `epic1:startTutorial` event.

The advanced concepts already exist in partial form inside `client/src/templates/quickStartTemplates.ts`, especially the branching family, gangster, underworld, diner patrons, spaghetti western, and medieval village templates. `client/src/templates/templateCatalog.ts` exposes those templates in the library.

## Tutorial Set

Add an advanced sequence with these modules:

1. **Prompts Are Phrase Machines**
   Teach that a graph is a system for assembling language, not a pile of isolated choices.

2. **Complete Phrases vs Phrase Parts**
   Show when a node should output a whole phrase versus a phrase fragment.

3. **Glue Nodes**
   Use small Text Block nodes such as `with a`, `wearing`, `under`, and `beside` to keep branches grammatically stable.

4. **Branches as Commitments**
   Teach that once a branch says "suit coat," later nodes need to respect that decision.

5. **Conditional Detail**
   Explain that details can be downstream of a branch only when they apply to that branch.

6. **Merge When The Phrase Is Whole**
   Use the clothing example to avoid outputs such as `rumpled t-shirt black shirt` by merging only after the active branch has become a coherent phrase.

7. **Region Boxes As Thought Labels**
   Teach Region Boxes as containers for intent: fixed DNA, controlled variation, branch group, merge zone, and cleanup zone.

8. **Debugging Bad Output**
   Walk through a malformed phrase, identify the node that made the grammar ambiguous, and fix it by moving a prefix/suffix or merge point.

## Training Graph Example

Create a new quick-start template named `phrase_grammar_branching`:

```text
Character base
  -> Wardrobe branch
     -> "with a"
     -> Jacket option: "rumpled suit coat"
        -> Shirt visible beneath: "over a black shirt" | "over a red shirt" | "over a brown shirt"
     -> Casual option: "rumpled t-shirt" | "open-collar long-sleeved shirt"
  -> Merge after each branch is grammatically complete
  -> Output
```

The point of the example is that shirt colors are only attached to phrases that can accept them. A t-shirt branch should either include its own color internally (`rumpled black t-shirt`) or merge after the colored-shirt branch, never before a suffix that says `black shirt`.

## Implementation Tasks

- [ ] Add a sequence registry for tutorials.
  - Modify `packages/core/components/epic1/onboarding/tutorialModel.ts`.
  - Export:
    ```ts
    export type TutorialSequenceId = 'basic' | 'advanced';

    export const tutorialSequences: Record<TutorialSequenceId, TutorialStepDefinition[]> = {
      basic: tutorialSteps,
      advanced: advancedTutorialSteps,
    };
    ```
  - Keep the existing `tutorialSteps` export for compatibility.

- [ ] Add advanced tutorial step definitions.
  - Create `packages/core/components/epic1/onboarding/advancedTutorialModel.ts`.
  - Export `ADVANCED_TUTORIAL_STEP_IDS` and `advancedTutorialSteps`.
  - Include steps for the eight modules above, using existing anchor ids where possible: `canvas`, `graph-nodes`, `node-palette`, and `preview-button`.
  - Add new anchor ids only when needed:
    ```ts
    export type TutorialAnchorId =
      | 'canvas'
      | 'wizard-button'
      | 'wizard-modal'
      | 'graph-nodes'
      | 'node-palette'
      | 'preview-button'
      | 'region-box'
      | 'template-library';
    ```

- [ ] Teach `TutorialContext` to run more than one sequence.
  - Modify `packages/core/components/epic1/onboarding/TutorialContext.tsx`.
  - Add state:
    ```ts
    activeSequenceId: TutorialSequenceId;
    startTutorial: (sequenceId?: TutorialSequenceId) => void;
    ```
  - Default to `basic`.
  - Persist the active sequence in `localStorage` as part of the existing `onboardingState`.
  - Clamp current step when switching sequences so stale step indexes cannot overflow.

- [ ] Add programmatic start events.
  - Modify `packages/core/components/epic1/onboarding/OnboardingIntegration.tsx`.
  - Keep `epic1:startTutorial` as the basic tutorial entry point.
  - Add:
    ```ts
    window.dispatchEvent(new CustomEvent('epic1:startTutorial', {
      detail: { sequenceId: 'advanced' },
    }));
    ```
  - `OnboardingIntegration` should read `event.detail?.sequenceId` and pass it to `startTutorial`.

- [ ] Add a visible advanced tutorial entry point.
  - Inspect the current help/tutorial launcher before editing.
  - Prefer a second menu item labeled `Advanced Tutorial` beside the existing tutorial/help action.
  - Do not replace the basic tutorial. New users still need the short first-run path.

- [ ] Add the phrase-grammar training template.
  - Modify `client/src/templates/quickStartTemplates.ts`.
  - Add a template id `phrase_grammar_branching`.
  - Use Region Boxes to label:
    - `Branch commitment`
    - `Grammar glue`
    - `Complete phrase merge`
    - `Bad-output fix`
  - Use React Flow node types exactly as defined in `AGENTS.md`: `weightedChoice`, `textBlock`, `concat`, and `output`.

- [ ] Expose the new template in the catalog.
  - Modify `client/src/templates/templateCatalog.ts`.
  - Add the catalog item under `characters`.
  - Suggested metadata:
    ```ts
    {
      id: 'phrase_grammar_branching',
      category: 'characters',
      title: 'Phrase Grammar Branching',
      description: 'A clothing branch that teaches prefixes, branch commitments, and safe merge points.',
      tags: ['advanced', 'branching', 'grammar', 'regions'],
    }
    ```

- [ ] Add model tests.
  - Create `packages/core/components/epic1/onboarding/__tests__/advancedTutorialModel.test.ts`.
  - Assert all advanced step ids are unique.
  - Assert every step has a title, description, and known anchor id.
  - Assert the advanced sequence includes the titles:
    - `Prompts Are Phrase Machines`
    - `Merge When The Phrase Is Whole`
    - `Region Boxes As Thought Labels`

- [ ] Add context tests.
  - Extend `packages/core/components/epic1/onboarding/__tests__/TutorialContext.test.tsx`.
  - Cover `startTutorial('advanced')`.
  - Cover persistence and restoration of `activeSequenceId`.
  - Cover switching back to `basic`.

- [ ] Add template catalog tests.
  - Extend the existing template tests, or create `client/src/templates/__tests__/phraseGrammarBranching.test.ts`.
  - Assert the template exists in both `quickStartTemplates.ts` and `templateCatalog.ts`.
  - Assert it contains at least one Region Box and at least one merge-oriented node.
  - Assert no output path can produce the exact bad phrase `rumpled t-shirt black shirt`.

- [ ] Verify manually in the browser.
  - Start or reuse the local app at `http://localhost:3000/`.
  - Launch the basic tutorial and confirm it still starts at the original welcome step.
  - Launch the advanced tutorial and confirm it starts with the phrase-machine lesson.
  - Load the Phrase Grammar Branching template.
  - Confirm Region Boxes make the graph readable at first glance.

## Commands

Run focused tests first:

```powershell
pnpm --filter core test -- onboarding
pnpm --filter client test -- templates
```

Then run the broader check that is already used for this repo:

```powershell
pnpm test -- --runInBand
```

If test filtering differs in the local package scripts, use the nearest existing package-level test command and record the exact command in the final handoff.

## Acceptance Criteria

- Basic onboarding still works and preserves its current content.
- Advanced tutorial can be launched separately from basic onboarding.
- Advanced steps teach phrase-system thinking, not only UI controls.
- The new clothing-branch template demonstrates prefixes, branch commitments, safe merge points, and Region Boxes.
- Tests cover tutorial sequence selection, advanced tutorial model integrity, and the phrase-grammar template.
- No unrelated docs, scripts, or prior uncommitted files are staged as part of implementation.

## Follow-Up Track

The next implementation track is local Region Box fragment saving:

- Let a user save a Region Box and its enclosed nodes as a fragment.
- Add a user-fragments section to the fragment/template library.
- Ask for a local documents folder path the first time a save is attempted.
- Persist that folder path in a browser cookie for future saves.
- Keep the local-save design isolated enough to swap or augment with Supabase login-backed storage later.
