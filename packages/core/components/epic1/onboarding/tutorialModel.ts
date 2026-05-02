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
  | 'preview-button';

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
  'preview-button': ['[data-tutorial-anchor="preview-button"]', '.preview-button']
};

export const tutorialSteps: TutorialStepDefinition[] = [
  {
    id: TUTORIAL_STEP_IDS.WELCOME,
    title: 'Start With Structure',
    description:
      'Prompt Spaghetti turns a prompt into a visual system. You will open the wizard, create a small graph, and preview the result in a few steps.',
    action: 'observe',
    position: 'center',
    spotlight: false
  },
  {
    id: TUTORIAL_STEP_IDS.CANVAS,
    title: 'This Is Your Working Surface',
    description:
      'The canvas is where prompt logic becomes visible. Pan, zoom, and arrange nodes here as your graph grows.',
    action: 'observe',
    position: 'top-right',
    spotlight: false,
    anchorId: 'canvas'
  },
  {
    id: TUTORIAL_STEP_IDS.OPEN_WIZARD,
    title: 'Open The Wizard',
    description:
      'Use the Wizard to turn plain language into a first-pass graph. This is the fastest way to begin.',
    action: 'click',
    hint: 'Start with a sentence that has a few choices or alternatives.',
    position: 'right',
    spotlight: true,
    anchorId: 'wizard-button'
  },
  {
    id: TUTORIAL_STEP_IDS.ENTER_PROMPT,
    title: 'Compose A Prompt',
    description:
      'Enter a short prompt and let the parser segment it into nodes.',
    action: 'paste',
    hint: 'Example: A {brave|cunning|wise} hero enters the {ancient ruins|dark forest}.',
    position: 'top',
    spotlight: false,
    anchorId: 'wizard-modal'
  },
  {
    id: TUTORIAL_STEP_IDS.NODES_CREATED,
    title: 'Read The Graph',
    description:
      'Once the graph appears, notice how choices, text, and flow become explicit. This is the core editing model of the app.',
    action: 'observe',
    position: 'right',
    spotlight: true,
    anchorId: 'graph-nodes'
  },
  {
    id: TUTORIAL_STEP_IDS.NODE_PALETTE,
    title: 'Add Nodes Manually',
    description:
      'The node palette is the manual entry point. Drag from here when you want to refine the structure beyond the initial parse.',
    action: 'drag',
    hint: 'Weighted Choice is a good next node to try.',
    position: 'right',
    spotlight: true,
    anchorId: 'node-palette'
  },
  {
    id: TUTORIAL_STEP_IDS.PREVIEW_UPDATE,
    title: 'Preview The Output',
    description:
      'Use Preview to test the graph and inspect the generated variations. This closes the authoring loop.',
    action: 'click',
    position: 'left',
    spotlight: true,
    anchorId: 'preview-button'
  },
  {
    id: TUTORIAL_STEP_IDS.COMPLETION,
    title: 'You Have The Core Loop',
    description:
      'You can now parse, inspect, refine, and preview. From here, the editor should feel discoverable rather than overwhelming.',
    action: 'observe',
    position: 'center',
    spotlight: false
  }
];
