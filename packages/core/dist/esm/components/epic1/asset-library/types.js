/**
 * Types for Epic 1 Asset Library and Preset System
 */
// Type guards
export function isTextBlockPreset(preset) {
    return preset.nodeType === 'textBlock';
}
export function isWeightedChoicePreset(preset) {
    return preset.nodeType === 'weightedChoice';
}
export function isConcatPreset(preset) {
    return preset.nodeType === 'concat';
}
export function isVariablePreset(preset) {
    return (preset.nodeType === 'variable' ||
        preset.nodeType === 'setVariable' ||
        preset.nodeType === 'getVariable');
}
export function isOutputPreset(preset) {
    return preset.nodeType === 'output';
}
