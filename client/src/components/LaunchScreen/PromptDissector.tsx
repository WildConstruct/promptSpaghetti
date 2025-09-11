// This file now re-exports the refactored PromptDissector component
// The original 2637-line implementation has been split into modular components:
// - hooks/useParsingEngine.ts - Parsing logic and LLM integration
// - hooks/useHighlightManager.ts - Highlight segments and history management
// - components/TextEditor.tsx - Text editing and overlay rendering
// - components/Toolbar.tsx - Mode selection and controls
// Original backup saved as PromptDissector-backup.tsx

export { PromptDissector, default } from './PromptDissector/index';
export type { PromptDissector as PromptDissectorComponent } from './PromptDissector/index';
