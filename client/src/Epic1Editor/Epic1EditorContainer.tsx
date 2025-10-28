// This file now re-exports the refactored Epic1EditorContainer
// The original 1177-line implementation has been split into modular hooks:
// - hooks/useWorkspaceRecovery.ts - Workspace recovery logic
// - hooks/usePromptParsing.ts - Prompt parsing and node creation
// - hooks/useSupabaseFileOperations.ts - File operations (already existed)
// - hooks/useEditOperations.ts - Edit operations (already existed)
// Original backup saved as Epic1EditorContainer-backup.tsx

export { Epic1EditorContainer } from './Epic1EditorContainer-refactored';
export type { Epic1EditorContainer as Epic1EditorContainerComponent } from './Epic1EditorContainer-refactored';
