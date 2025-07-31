// packages/core/components/Help/index.ts
// Help System Exports for Story 8.4 Task 4
export { ContextualTooltip, ProgressiveOnboardingSystem, BUILT_IN_HELP_CONTENT } from './ContextualHelpSystem';
export {
  HelpProvider,
  useHelpSystem,
  useHelpContentRegistration,
  useFieldHelp,
  useOnboardingHelp,
  HelpSystemSettings,
} from './HelpContentManager';
export {
  withHelp,
  HelpfulInput,
  HelpfulButton,
  HelpfulSection,
  useContextualHelp,
  OnboardingOverlay,
} from './HelpIntegration';
// Default export for easy importing
export { default } from './HelpIntegration';
