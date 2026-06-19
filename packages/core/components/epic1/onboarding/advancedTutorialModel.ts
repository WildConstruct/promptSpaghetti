import type { TutorialStepDefinition } from './tutorialModel';

export const ADVANCED_TUTORIAL_STEP_IDS = {
  PHRASE_MACHINES: 'advanced-phrase-machines',
  PHRASE_PARTS: 'advanced-phrase-parts',
  GLUE_NODES: 'advanced-glue-nodes',
  BRANCH_COMMITMENTS: 'advanced-branch-commitments',
  CONDITIONAL_DETAIL: 'advanced-conditional-detail',
  SAFE_MERGE: 'advanced-safe-merge',
  REGION_BOXES: 'advanced-region-boxes',
  DEBUG_BAD_OUTPUT: 'advanced-debug-bad-output',
} as const;

// Each step points at a real node in the `phrase_grammar_branching` example
// graph (loaded by the first step) so the concept is shown, not just described.
const pgNode = (id: string): string[] => [`.react-flow__node[data-id="${id}"]`];

export const advancedTutorialSteps: TutorialStepDefinition[] = [
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.PHRASE_MACHINES,
    title: 'Prompts Are Phrase Machines',
    description:
      'We just loaded a small clothing-character system. Think of this graph as a machine for assembling language — every node makes a phrase decision the next node can safely inherit. We will walk through it piece by piece.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
    loadTemplateId: 'phrase_grammar_branching',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.PHRASE_PARTS,
    title: 'Complete Phrases vs Phrase Parts',
    description:
      'This Text Block outputs a complete phrase ("a weary back-alley character"). Other nodes, like the Wardrobe branch, output parts that still need gluing. The skill is knowing whether the next node expects a finished thought or a fragment.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: pgNode('pg-character-base'),
    anchorId: 'graph-nodes',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.GLUE_NODES,
    title: 'Glue Nodes',
    description:
      'This tiny "with a" Text Block is a glue node — it keeps the branches downstream grammatically stable without burying connective words inside a choice. Glue nodes are small, but they make bad grammar easy to spot and fix.',
    action: 'observe',
    hint: 'Glue lives in the green "Grammar glue" region box.',
    position: 'right',
    spotlight: true,
    targetSelectors: pgNode('pg-with-a'),
    anchorId: 'graph-nodes',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.BRANCH_COMMITMENTS,
    title: 'Branches as Commitments',
    description:
      'This Wardrobe branch is a promise. Once it chooses the suit coat, the downstream detail must respect that — instead of bolting a generic suffix onto every path. The teal "Branch commitment" box marks where that promise is made.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: pgNode('pg-wardrobe'),
    anchorId: 'graph-nodes',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.CONDITIONAL_DETAIL,
    title: 'Conditional Detail',
    description:
      'This "visible shirt beneath jacket" choice only fires on the jacket branch — conditional detail attached where it applies. The t-shirt branch already carries its own complete wording, so it never needs it.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: pgNode('pg-visible-shirt'),
    anchorId: 'graph-nodes',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.SAFE_MERGE,
    title: 'Merge When The Phrase Is Whole',
    description:
      'This Merge fires only after each active path has become a coherent phrase. Merging too early is what produces broken output — like a t-shirt branch receiving a separate black-shirt suffix meant for jackets.',
    action: 'observe',
    position: 'left',
    spotlight: true,
    targetSelectors: pgNode('pg-safe-merge'),
    anchorId: 'graph-nodes',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.REGION_BOXES,
    title: 'Region Boxes As Thought Labels',
    description:
      'The colored Region Boxes name intent — branch commitment, grammar glue, complete-phrase merge, bad-output fix. They make the graph readable at a glance, before anyone inspects a single node.',
    action: 'observe',
    position: 'top-right',
    spotlight: true,
    targetSelectors: pgNode('pg-region-branch'),
    anchorId: 'region-box',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.DEBUG_BAD_OUTPUT,
    title: 'Debugging Bad Output',
    description:
      'When output sounds wrong, find the node that made the grammar ambiguous. The orange "Bad-output fix" box shows the rule: the t-shirt path includes its own color internally, so it never receives a suffix meant for the jacket path.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: pgNode('pg-region-fix'),
    anchorId: 'graph-nodes',
  },
];
