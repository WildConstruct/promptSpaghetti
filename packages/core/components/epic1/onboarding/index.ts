/**
 * Epic 1 Onboarding & Help System
 * Export all onboarding components
 */

export { TutorialProvider, useTutorial } from './TutorialContext';
export type { TutorialStep, OnboardingState } from './TutorialContext';

export { TutorialOverlay } from './TutorialOverlay';

export {
  SuccessCelebration,
  useSuccessCelebration
} from './SuccessCelebration';

export { ProgressTracker, ProgressWidget } from './ProgressTracker';

export { OnboardingIntegration, useOnboarding } from './OnboardingIntegration';

// Tooltip exports
export { ContextualTooltips, useContextualTooltip } from './ContextualTooltips';
export type { TooltipConfig } from './ContextualTooltips';

export { SmartTooltip, TooltipWrapper } from './SmartTooltip';

export { TooltipContent, QuickTooltip, tooltipContent } from './TooltipContent';

export {
  TooltipManagerProvider,
  useTooltipManager,
  useTooltipSequence,
  AutoTooltips,
  tooltipPresets
} from './TooltipManager';

// Keyboard shortcut exports
export {
  KeyboardShortcutReference,
  useKeyboardShortcuts
} from './KeyboardShortcutReference';

export {
  KeyboardShortcutProvider,
  KeyboardShortcutIntegration,
  useKeyboardShortcutManager,
  useCommonShortcuts,
  ShortcutHint
} from './KeyboardShortcutManager';

export { VisualKeyboardMap, CompactKeyboardView } from './VisualKeyboardMap';

// Tutorial step IDs for external reference
export const TUTORIAL_STEPS = {
  WELCOME: 'welcome',
  EMPTY_CANVAS: 'empty-canvas',
  PASTE_PROMPT: 'paste-prompt',
  NODES_CREATED: 'nodes-created',
  INLINE_EDIT: 'inline-edit',
  PREVIEW_UPDATE: 'preview-update',
  COMPLETION: 'completion'
} as const;

// Achievement IDs
export const ACHIEVEMENTS = {
  TUTORIAL_COMPLETE: 'tutorial_complete',
  FIRST_EDIT: 'first_edit',
  GRAPH_MASTER: 'graph_master',
  SPEED_DEMON: 'speed_demon',
  EXPLORER: 'explorer',
  POWER_USER: 'power_user'
} as const;
