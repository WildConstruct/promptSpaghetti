/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Shared Components Index
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 *
 * Centralized exports for all shared admin components
 */

export { default as StatusBadge } from './StatusBadge';
export type { StatusType, StatusSize } from './StatusBadge';

export {
  LoadingSpinner,
  ErrorState,
  EmptyState,
  EmptySearchState,
  EmptyUsersState,
  LoadingOverlay,
} from './LoadingStates';

export { default as MetricsCard } from './MetricsCard';
export type { MetricData } from './MetricsCard';

export { default as AdminTable } from './AdminTable';
export type { TableColumn, TableAction } from './AdminTable';

// Layout components are exported from layout index
export * from '../layout';

// Form components are exported from forms index
export * from '../forms';

// Hooks are exported from hooks index
export * from '../hooks';
