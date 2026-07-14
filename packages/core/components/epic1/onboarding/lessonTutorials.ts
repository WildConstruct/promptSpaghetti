import type { TutorialStepDefinition } from './tutorialModel';

// Each lesson tutorial loads a tiny single-concept teaching graph (its first
// step carries `loadTemplateId`), walks its nodes with observe + spotlight
// steps, then ends on a `lab` step that hands the canvas back so the learner
// can try the concept on the same building blocks.

const node = (id: string): string[] => [`.react-flow__node[data-id="${id}"]`];

// 2 · Your First Prompt — Text → Output -------------------------------------
export const foundationsTutorialSteps: TutorialStepDefinition[] = [
  {
    id: 'foundations-frame',
    title: 'Every graph ends at an Output',
    description:
      'We loaded the smallest possible graph: one Text Block flowing into one Output node. Whatever reaches Output is what your prompt becomes.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
    loadTemplateId: 'lesson_text_output'
  },
  {
    id: 'foundations-text',
    title: 'The Text Block',
    description:
      'A Text Block holds a fixed phrase — here, “a lone lighthouse at dusk.” It is the simplest source of words in a graph.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('lt-text'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'foundations-output',
    title: 'The Output node is the finish line',
    description:
      'Only what connects to an Output node appears in the result. A graph with no Output produces nothing.',
    action: 'observe',
    position: 'left',
    spotlight: true,
    targetSelectors: node('lt-out'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'foundations-lab',
    title: 'Try it',
    description:
      'Open the Preview tray at the bottom and run the graph. Then double-click the Text Block, change the words, and watch the output follow.',
    action: 'lab',
    hint: 'Preview is deterministic — same graph and seed always give the same result.',
    position: 'bottom',
    spotlight: false
  }
];

// 3 · Weighted Choice & Determinism -----------------------------------------
export const weightedChoiceTutorialSteps: TutorialStepDefinition[] = [
  {
    id: 'wc-frame',
    title: 'A Weighted Choice rolls one option',
    description:
      'This graph has a single Weighted Choice feeding an Output. Each run, it picks exactly one of its options.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
    loadTemplateId: 'lesson_weighted_choice'
  },
  {
    id: 'wc-node',
    title: 'Options and weights',
    description:
      'Three options, each with a weight. A higher weight makes an option more likely — weights are relative, they need not add to 100.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('lw-weather'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'wc-determinism',
    title: 'Same seed, same pick',
    description:
      'Selection is deterministic: a given seed always rolls the same option. That is what makes a graph reproducible — share a seed, share the exact result.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas'
  },
  {
    id: 'wc-lab',
    title: 'Try it',
    description:
      'Open Preview and change the seeds — the pick changes with them. Then bump one option’s weight up and watch it dominate the runs.',
    action: 'lab',
    position: 'bottom',
    spotlight: false
  }
];

// 4 · Concatenate ------------------------------------------------------------
export const concatTutorialSteps: TutorialStepDefinition[] = [
  {
    id: 'concat-frame',
    title: 'Concat joins parts into a phrase',
    description:
      'A subject and a detail, each its own node, flow into a Concat — which assembles them in order.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
    loadTemplateId: 'lesson_concat'
  },
  {
    id: 'concat-inputs',
    title: 'Separate fragments',
    description:
      'The subject (“a red barn”) and the detail are kept apart so each can vary independently. Keeping parts separate is the core authoring habit.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('lc-detail'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'concat-merge',
    title: 'Ordered, with a separator',
    description:
      'Concat joins its inputs in input-number order, glued by its separator — here a comma and a space.',
    action: 'observe',
    position: 'left',
    spotlight: true,
    targetSelectors: node('lc-merge'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'concat-lab',
    title: 'Try it',
    description:
      'Open Preview. Then change the Concat’s separator (try “ — ” or a space) and watch the spacing of the assembled phrase change.',
    action: 'lab',
    position: 'bottom',
    spotlight: false
  }
];

// 5 · Variables — the priority bridge to the capstone ------------------------
export const variablesTutorialSteps: TutorialStepDefinition[] = [
  {
    id: 'var-frame',
    title: 'A Variable is a named bucket',
    description:
      'This graph has a Variable called $hue. A Variable stores one value under a name so you can reuse it.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
    loadTemplateId: 'lesson_variable'
  },
  {
    id: 'var-capture',
    title: 'Capture one roll',
    description:
      'The color roll feeds the Variable, which freezes that single pick into $hue for the run. Wire a choice into a Variable to capture it.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('lv-hue'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'var-read',
    title: 'Read it back with {{hue}}',
    description:
      'This Text Block reads the stored value by writing {{hue}} inside its text. That is how a Variable’s value re-enters the prompt.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('lv-frame'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'var-reuse',
    title: 'Reuse is the whole point',
    description:
      'A SECOND phrase also reads {{hue}} — so the bicycle and its basket always share the same color. One decision, echoed everywhere.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('lv-basket'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'var-lab',
    title: 'Try it',
    description:
      'Open Preview and run a few seeds — both phrases always agree. Then add {{hue}} into a phrase yourself and watch it fill in with the captured color.',
    action: 'lab',
    hint: 'A Variable with no input just holds its default — a one-place constant.',
    position: 'bottom',
    spotlight: false
  },
  {
    id: 'var-bridge',
    title: 'You’re ready for the capstone',
    description:
      'Capture once, reuse anywhere — that’s the whole idea. The Televangelist Saga tutorial scales this to a whole character carried across decades. Try it next.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas'
  }
];

// 6 · Prefixes & Glue --------------------------------------------------------
export const prefixesTutorialSteps: TutorialStepDefinition[] = [
  {
    id: 'prefix-frame',
    title: 'Glue words live in their own node',
    description:
      'Connective words like “wearing” belong in a small node of their own — not baked into every option of a choice.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
    loadTemplateId: 'lesson_prefix'
  },
  {
    id: 'prefix-glue',
    title: 'The glue node',
    description:
      'This Text Block holds just “wearing.” Keeping it separate means you change the connector in one place, not inside every garment option.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('lp-prefix'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'prefix-choice',
    title: 'Bare nouns stay swappable',
    description:
      'The garment choice holds only the noun phrase — “a wide-brimmed hat.” Clean options like these are easy to reuse and reorder.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('lp-garment'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'prefix-lab',
    title: 'Try it',
    description:
      'Open Preview. Then change the glue word from “wearing” to “carrying” — every garment option stays grammatical, because the connector lives in one node.',
    action: 'lab',
    position: 'bottom',
    spotlight: false
  }
];

// 7 · Branching --------------------------------------------------------------
export const branchingTutorialSteps: TutorialStepDefinition[] = [
  {
    id: 'branch-frame',
    title: 'One choice, committed paths',
    description:
      'A Weighted Choice picks a class — knight or wizard — and each option carries its own branch so downstream detail can respect that pick.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
    loadTemplateId: 'lesson_branching'
  },
  {
    id: 'branch-node',
    title: 'Branch handles',
    description:
      'Each option here has a branch output (the small side handles). The selected option’s branch fires; the others stay silent.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('lb-class'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'branch-detail',
    title: 'Detail respects the path',
    description:
      'The knight’s plate armor only flows when the knight is chosen; the wizard’s robes only flow for the wizard. Their gear never mixes.',
    action: 'observe',
    position: 'left',
    spotlight: true,
    targetSelectors: node('lb-knight-detail'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'branch-lab',
    title: 'Try it',
    description:
      'Open Preview and run several seeds. Knight and wizard each keep their own gear — the inactive branch simply drops out of the merge.',
    action: 'lab',
    position: 'bottom',
    spotlight: false
  }
];

// 8 · Region Boxes (reuses the phrase-grammar example) -----------------------
export const regionBoxesTutorialSteps: TutorialStepDefinition[] = [
  {
    id: 'region-frame',
    title: 'Region boxes name intent',
    description:
      'We loaded a richer graph. The coloured boxes behind the nodes are Region Boxes — labels that document what each cluster is for.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
    loadTemplateId: 'phrase_grammar_branching'
  },
  {
    id: 'region-box',
    title: 'A labelled zone',
    description:
      'This box groups the branch-commitment area and titles it. At a glance you can read the graph’s structure before inspecting a single node.',
    action: 'observe',
    position: 'top-right',
    spotlight: true,
    targetSelectors: node('pg-region-branch'),
    anchorId: 'region-box'
  },
  {
    id: 'region-purely-visual',
    title: 'Documentation, not logic',
    description:
      'Region Boxes are purely visual — the engine ignores them. Membership is geometric: a node inside the box belongs to it, no wiring needed.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas'
  },
  {
    id: 'region-lab',
    title: 'Try it',
    description:
      'Drag a node into or out of a box, or rename a box’s header. Open Preview to confirm: the output is exactly the same — boxes only organise.',
    action: 'lab',
    position: 'bottom',
    spotlight: false
  }
];

// 10 · Televangelist Saga — the capstone walkthrough -------------------------
export const televangelistTutorialSteps: TutorialStepDefinition[] = [
  {
    id: 'tv-frame',
    title: 'The capstone: one preacher, forty years',
    description:
      'This is everything together — a televangelist carried across four eras. It is built from variables, fragments, branching and merges you already know.',
    action: 'observe',
    position: 'center',
    spotlight: false,
    anchorId: 'canvas',
    loadTemplateId: 'televangelist_saga'
  },
  {
    id: 'tv-dna',
    title: 'Identity captured once',
    description:
      'The amber box at the left rolls a name, ministry and signature tell, and freezes each into a variable — the locked DNA reused everywhere below.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('tv-region-dna'),
    anchorId: 'region-box'
  },
  {
    id: 'tv-reuse',
    title: 'Reused every era',
    description:
      'Every era line writes {{preacher}} of {{ministry}}. Because the roll is captured, the same man is recognizable in 1974 and in 2004.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    targetSelectors: node('tv-var-preacher'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'tv-fragments',
    title: 'Appearance, fragment by fragment',
    description:
      'Each era breaks the wardrobe into separate choices — top, bottom, footwear, condition — never one combined option, then a Concat assembles the line.',
    action: 'observe',
    position: 'bottom',
    spotlight: true,
    targetSelectors: node('tv1-top'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'tv-branch',
    title: 'The Fall branches by scandal',
    description:
      'In 1991 a branching choice commits to a scandal type; each branch routes to its own fallout fragment, and the inactive branches drop out.',
    action: 'observe',
    position: 'top',
    spotlight: true,
    targetSelectors: node('tv3-scandal'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'tv-history',
    title: 'Stitched into a life story',
    description:
      'A final Concat joins the four era lines into one multi-prompt history — a single man’s rise, peak, fall and comeback.',
    action: 'observe',
    position: 'left',
    spotlight: true,
    targetSelectors: node('tv-history'),
    anchorId: 'graph-nodes'
  },
  {
    id: 'tv-lab',
    title: 'Try it',
    description:
      'Open Preview and run several seeds. Each gives a brand-new preacher who nonetheless stays perfectly consistent across all four decades.',
    action: 'lab',
    position: 'bottom',
    spotlight: false
  }
];
