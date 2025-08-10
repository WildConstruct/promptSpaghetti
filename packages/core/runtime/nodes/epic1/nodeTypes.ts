/**
 * Node type enum for Epic 1 nodes
 * Separated to avoid circular dependencies
 */

export enum Epic1NodeType {
  TextBlock = 'TextBlock',
  WeightedChoice = 'WeightedChoice',
  Concat = 'Concat',
  Variable = 'Variable',
  Output = 'Output'
}
