/**
 * Policy Assignment Types
 * 
 * TypeScript type definitions for the policy assignment system
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

// Re-export from server types for client-side usage
export {
  PolicyAssignment,
  BulkPolicyAssignment,
  AssignmentTargetType,
  AssignmentStatus,
  AssignmentCondition,
  InheritanceType,
  ConflictResolutionStrategy,
  ConditionType,
  ConditionOperator,
  RiskLevel,
  AssignmentSource,
  PolicyConflict,
  ValidationError,
  BulkAssignmentStatus,
  BulkAssignmentStrategy
} from '../../../server/src/types/PolicyAssignmentTypes';