/**
 * Epic 1 Delightful Details
 * Export all Easter eggs and delightful components
 */
export { EasterEggManager } from './EasterEggManager';
export { PlayfulLoadingStates, InlineLoadingSpinner, PlayfulProgressBar } from './PlayfulLoadingStates';
export { UnexpectedAnimations, celebrateNodeClick } from './UnexpectedAnimations';
export { DelightfulIntegration, useDelightfulLoading } from './DelightfulIntegration';
// Re-export for convenience
export const EASTER_EGGS = {
    KONAMI: 'konami',
    LONGPRESS: 'longpress',
    TRIPLECLICK: 'tripleclick',
    SHAKE: 'shake',
    SHIFT: 'shift',
};
export const LOADING_TYPES = {
    GRAPH: 'graph',
    PREVIEW: 'preview',
    SAVE: 'save',
    GENERAL: 'general',
};
