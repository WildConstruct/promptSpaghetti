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

export const advancedTutorialSteps: TutorialStepDefinition[] = [
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.PHRASE_MACHINES,
    title: 'Prompts Are Phrase Machines',
    description:
      'Think of the graph as a system for assembling language. Each node should make a phrase decision that the next node can safely inherit.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.PHRASE_PARTS,
    title: 'Complete Phrases vs Phrase Parts',
    description:
      'Some nodes should output complete phrases, while others are useful fragments. The trick is knowing whether the next node expects a finished thought or a part of one.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    anchorId: 'graph-nodes',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.GLUE_NODES,
    title: 'Glue Nodes',
    description:
      'Small Text Block nodes such as "with a", "wearing", "under", and "beside" keep branches grammatically stable without hiding the structure.',
    action: 'observe',
    hint: 'Glue nodes are often tiny, but they make bad prompt grammar much easier to debug.',
    position: 'right',
    spotlight: true,
    anchorId: 'node-palette',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.BRANCH_COMMITMENTS,
    title: 'Branches as Commitments',
    description:
      'A branch is a promise. Once a branch chooses a suit coat, downstream detail should respect that choice instead of attaching generic suffixes to every path.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    anchorId: 'graph-nodes',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.CONDITIONAL_DETAIL,
    title: 'Conditional Detail',
    description:
      'Attach detail downstream only when it applies to that branch. Shirt colors can follow the jacket path, while a t-shirt branch should carry its own complete wording.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    anchorId: 'graph-nodes',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.SAFE_MERGE,
    title: 'Merge When The Phrase Is Whole',
    description:
      'Merge branches after each active path has become a coherent phrase. That avoids broken outputs like a t-shirt branch receiving a separate black-shirt suffix.',
    action: 'observe',
    position: 'left',
    spotlight: true,
    anchorId: 'preview-button',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.REGION_BOXES,
    title: 'Region Boxes As Thought Labels',
    description:
      'Use Region Boxes to name intent: fixed DNA, controlled variation, branch group, merge zone, cleanup zone. They make the graph readable before anyone inspects a node.',
    action: 'observe',
    position: 'top-right',
    spotlight: true,
    anchorId: 'region-box',
  },
  {
    id: ADVANCED_TUTORIAL_STEP_IDS.DEBUG_BAD_OUTPUT,
    title: 'Debugging Bad Output',
    description:
      'When output sounds wrong, find the node that made the grammar ambiguous. Move the prefix, suffix, or merge point until each branch can stand on its own.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    anchorId: 'template-library',
  },
];
