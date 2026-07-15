/**
 * Node type enum for Epic 1 nodes
 * Separated to avoid circular dependencies
 */

export enum Epic1NodeType {
  TextBlock = 'TextBlock',
  WeightedChoice = 'WeightedChoice',
  Concat = 'Concat',
  Variable = 'Variable',
  Output = 'Output',
  /** Sentence skeleton with {slot} fill — see docs/template-slot-node-design.md */
  Template = 'Template',
  /** Nested precomp document — see docs/nested-psg-precomp-plan.md */
  SubPSG = 'SubPSG'
}
