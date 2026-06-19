import { advancedTutorialSteps } from './advancedTutorialModel';

export type TutorialPlacement =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'center'
  | 'top-right';

export type TutorialAnchorId =
  | 'canvas'
  | 'wizard-button'
  | 'wizard-modal'
  | 'graph-nodes'
  | 'node-palette'
  | 'preview-button'
  | 'region-box'
  | 'template-library';

export type TutorialSequenceId = 'basic' | 'advanced';

export interface TutorialStepDefinition {
  id: string;
  title: string;
  description: string;
  action: 'click' | 'drag' | 'type' | 'observe' | 'paste';
  hint?: string;
  position?: TutorialPlacement;
  spotlight?: boolean;
  anchorId?: TutorialAnchorId;
  target?: string;
  targetSelectors?: string[];
  /** When set, entering this step loads that example graph (by
   *  quickStartTemplates id) so later steps can point at real nodes. */
  loadTemplateId?: string;
}

export const TUTORIAL_STEP_IDS = {
  WELCOME: 'welcome',
  CANVAS: 'canvas',
  OPEN_WIZARD: 'open-wizard',
  ENTER_PROMPT: 'enter-prompt',
  NODES_CREATED: 'nodes-created',
  NODE_PALETTE: 'node-palette',
  PREVIEW_UPDATE: 'preview-update',
  COMPLETION: 'completion'
} as const;

export const TUTORIAL_ANCHOR_SELECTORS: Record<TutorialAnchorId, string[]> = {
  canvas: ['[data-tutorial-anchor="canvas"]', '.graph-canvas-container', '.react-flow__viewport'],
  'wizard-button': ['[data-tutorial-anchor="wizard-button"]', '.prompt-wizard-button'],
  'wizard-modal': ['[data-tutorial-anchor="wizard-modal"]', '.prompt-wizard-modal'],
  'graph-nodes': ['.react-flow__node', '[data-id^="reactflow__node"]'],
  'node-palette': ['[data-tutorial-anchor="node-palette"]', '.node-palette', '.node-toolbar'],
  'preview-button': ['[data-tutorial-anchor="preview-button"]', '.preview-button'],
  'region-box': [
    '[data-tutorial-anchor="region-box"]',
    '.react-flow__node-enhancedBoundingBox',
    '.react-flow__node-boundingBox'
  ],
  'template-library': [
    '[data-tutorial-anchor="template-library"]',
    '[data-tutorial-anchor="asset-library"]',
    '.asset-browser',
    '.document-library-panel'
  ]
};

export const tutorialSteps: TutorialStepDefinition[] = [
  {
    id: TUTORIAL_STEP_IDS.WELCOME,
    title: 'Start with structure',
    description:
      'Prompt Spaghetti turns a prompt into a visual system. In a few steps you will open the wizard, create a small graph, and preview the result.',
    action: 'observe',
    position: 'center',
    spotlight: false
  },
  {
    id: TUTORIAL_STEP_IDS.CANVAS,
    title: 'Your working surface',
    description:
      'The canvas is where prompt logic becomes visible. You pan, zoom, and arrange nodes here as your graph grows.',
    action: 'observe',
    position: 'top-right',
    spotlight: false,
    anchorId: 'canvas'
  },
  {
    id: TUTORIAL_STEP_IDS.OPEN_WIZARD,
    title: 'The wizard turns words into a graph',
    description:
      'The wizard parses plain language into a first-pass graph — the fastest way to begin. Choices written as {a|b|c} become weighted-choice branches.',
    action: 'observe',
    hint: 'Next, you will paste an example prompt with a few alternatives.',
    position: 'right',
    spotlight: true,
    anchorId: 'wizard-button'
  },
  {
    id: TUTORIAL_STEP_IDS.ENTER_PROMPT,
    title: 'Compose a prompt',
    description:
      'We pre-filled an example. Press Create nodes to parse it into a graph — or edit it first.',
    action: 'paste',
    hint: 'Words inside {a|b|c} become weighted-choice branches.',
    position: 'top',
    spotlight: false,
    anchorId: 'wizard-modal'
  },
  {
    id: TUTORIAL_STEP_IDS.NODES_CREATED,
    title: 'Read the graph',
    description:
      'See how choices, text, and flow become explicit nodes. This is the core editing model — every branch and join is visible and editable.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    anchorId: 'graph-nodes'
  },
  {
    id: TUTORIAL_STEP_IDS.NODE_PALETTE,
    title: 'Add nodes by hand',
    description:
      'The node palette is the manual entry point. Drag from here to refine the structure beyond the initial parse.',
    action: 'observe',
    hint: 'Weighted Choice is a good next node to try — it is how branches are made.',
    position: 'right',
    spotlight: true,
    anchorId: 'node-palette'
  },
  {
    id: TUTORIAL_STEP_IDS.PREVIEW_UPDATE,
    title: 'Preview the output',
    description:
      'Preview runs the graph and shows the generated variations per seed. Same graph and seed always produce the same prompt — this closes the authoring loop.',
    action: 'observe',
    position: 'left',
    spotlight: true,
    anchorId: 'preview-button'
  },
  {
    id: TUTORIAL_STEP_IDS.COMPLETION,
    title: 'You have the core loop',
    description:
      'You can now parse, inspect, refine, and preview. From here the editor should feel discoverable rather than overwhelming.',
    action: 'observe',
    position: 'center',
    spotlight: false
  }
];

export const tutorialSequences: Record<TutorialSequenceId, TutorialStepDefinition[]> = {
  basic: tutorialSteps,
  advanced: advancedTutorialSteps,
};

/** Display metadata for each tutorial sequence, used by the Tutorials panel.
 *  Adding a new tutorial = add its steps to tutorialSequences and an entry
 *  here; the panel lists everything in `order`. */
export interface TutorialSequenceMeta {
  title: string;
  summary: string;
  order: number;
}

export const TUTORIAL_SEQUENCE_META: Record<
  TutorialSequenceId,
  TutorialSequenceMeta
> = {
  basic: {
    title: 'Getting Started',
    summary:
      'Open the wizard, turn a prompt into a small graph, and preview the result.',
    order: 1
  },
  advanced: {
    title: 'Phrase Grammar & Branching',
    summary:
      'Walk a real example graph: phrase parts, glue nodes, branch commitments, conditional detail, safe merges, and region boxes.',
    order: 2
  }
};
