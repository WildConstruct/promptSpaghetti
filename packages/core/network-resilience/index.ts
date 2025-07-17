// Core Network Resilience Components
export { OfflineOperationQueue } from './OfflineOperationQueue';
export { ConnectionStateManager } from './ConnectionStateManager';
export { ReconnectionHandler } from './ReconnectionHandler';
export { SynchronizationRecovery } from './SynchronizationRecovery';
export { NetworkResilienceManager } from './NetworkResilienceManager';

// Type Exports
export type {
  QueuedOperation,
  QueueMetrics,
  OfflineQueueConfig
} from './OfflineOperationQueue';

export type {
  ConnectionStateData,
  ConnectionMetrics,
  NetworkInfo,
  ConnectionStateConfig
} from './ConnectionStateManager';

export type {
  ReconnectionAttempt,
  ReconnectionConfig,
  ReconnectionStats
} from './ReconnectionHandler';

export type {
  DocumentState,
  DocumentOperation,
  SyncDelta,
  ConflictInfo,
  ConflictResolution,
  SyncProgress,
  RecoveryConfig,
  RecoveryStats
} from './SynchronizationRecovery';

export type {
  NetworkResilienceConfig,
  ResilienceMetrics,
  NetworkStatus
} from './NetworkResilienceManager';

// Enums
export {
  ConnectionState,
  ConnectionQuality
} from './ConnectionStateManager';

export {
  ReconnectionState
} from './ReconnectionHandler';

// UI Components
export {
  ConnectionStatusIndicator,
  OfflineIndicator,
  NetworkResiliencePanel
} from '../components/NetworkResilience';

export type {
  ConnectionStatusIndicatorProps,
  OfflineIndicatorProps,
  NetworkResiliencePanelProps
} from '../components/NetworkResilience';