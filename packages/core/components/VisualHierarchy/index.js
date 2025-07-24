/**
 * Epic 8.4 Task 2 - Visual Hierarchy Design System
 *
 * Complete visual hierarchy design system for progressive disclosure architecture
 * providing consistent visual cues, typography, spacing, and accessibility.
 */
export { 
// Core design tokens
TypographyScale, HierarchyColors, SpacingScale, ComponentSizes, FieldImportanceStyles, 
// Classification utilities
classifyFieldPriority, 
// UI components
HierarchyHeader, HierarchyField, ComplexityIndicator, 
// Accessibility utilities
AccessibilityUtils } from './HierarchyDesignSystem.js';
// Re-export enhanced progressive disclosure component
export { ProgressiveDisclosureSection } from '../Inspector/ProgressiveDisclosureSection.js';
// Demo component for testing and documentation
export { VisualHierarchyDemoEditor } from '../Inspector/editors/VisualHierarchyDemoEditor.js';
export default {
    TypographyScale,
    HierarchyColors,
    SpacingScale,
    ComponentSizes,
    FieldImportanceStyles,
    classifyFieldPriority,
    HierarchyHeader,
    HierarchyField,
    ComplexityIndicator,
    AccessibilityUtils,
    ProgressiveDisclosureSection,
    VisualHierarchyDemoEditor
};
