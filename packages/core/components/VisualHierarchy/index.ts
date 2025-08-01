/**
 * Epic 8.4 Task 2 - Visual Hierarchy Design System
 *
 * Complete visual hierarchy design system for progressive disclosure architecture
 * providing consistent visual cues, typography, spacing, and accessibility.
 */

export { // Core design tokens
  TypographyScale,
  HierarchyColors,
  SpacingScale,
  ComponentSizes,
  FieldImportanceStyles,

  // Classification utilities
  classifyFieldPriority,
  type FieldPriority,

  // UI components
  HierarchyHeader,
  HierarchyField,
  ComplexityIndicator,

  // Accessibility utilities
  AccessibilityUtils,

  // Props interfaces
  type HierarchyHeaderProps,
  type HierarchyFieldProps,
  type ComplexityIndicatorProps }
 from './HierarchyDesignSystem';

// Re-export enhanced progressive disclosure component
export { ProgressiveDisclosureSection,
  type ProgressiveDisclosureSectionProps }
 from '../Inspector/ProgressiveDisclosureSection';

// Demo component for testing and documentation
export { VisualHierarchyDemoEditor } from '../Inspector/editors/VisualHierarchyDemoEditor';

export default { TypographyScale,
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
  VisualHierarchyDemoEditor }
};
