import React, { useState, useEffect } from 'react';
import { NetworkStatus, ResilienceMetrics } from '../../network-resilience/NetworkResilienceManager';
import { QueuedOperation } from '../../network-resilience/OfflineOperationQueue';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { ReconnectionState } from '../../network-resilience/ReconnectionHandler';
import { ConnectionState, ConnectionQuality } from '../../network-resilience/ConnectionStateManager';
interface NetworkResiliencePanelProps {
  status: NetworkStatus;
  queuedOperations: QueuedOperation[];
  onRetryConnection?: () => void;
  onForceSync?: () => void;
  onClearQueue?: () => void;
  onRetryOperation?: (operationId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkResiliencePanel: React.FC<NetworkResiliencePanelProps> = ({)
  status,
  queuedOperations,
  onRetryConnection,
  onForceSync,
  onClearQueue,
  onRetryOperation,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'queue' | 'metrics'>('status');
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;}
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;}
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;}
    return `${(ms / 3600000).toFixed(1)}h`;}
  };
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  const getOperationPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
    case 'high': return '#dc2626';
    case 'medium': return '#d97706';
    case 'low': return '#059669';
    default: return '#6b7280';
    }
  };
  const getConnectionQualityDescription = (quality: ConnectionQuality) => {
    switch (quality) {
    case ConnectionQuality.EXCELLENT:
      return 'Excellent connection quality. Low latency, no packet loss.';
    case ConnectionQuality.GOOD:
      return 'Good connection quality. Acceptable latency and minimal packet loss.';
    case ConnectionQuality.FAIR:
      return 'Fair connection quality. Some latency or packet loss detected.';
    case ConnectionQuality.POOR:
      return 'Poor connection quality. High latency or significant packet loss.';
    default:
      return 'Connection quality unknown. Gathering metrics...';
    }
  };
  if (!isOpen) return null;
  return ()
    <div className="network-resilience-panel">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div 
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-auto"
        style={{ maxWidth: '90vw' }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Network Resilience
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          {/* Connection Status */}
          <div className="mt-3">
            <ConnectionStatusIndicator 
              status={status} 
              showDetails={true}
              className="w-full"
            />
          </div>
        </div>
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'status', label: 'Status', count: undefined },
              { id: 'queue', label: 'Queue', count: status.queueSize },
              { id: 'metrics', label: 'Metrics', count: undefined }
            ].map((tab) => ()
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && ()
                  <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        {/* Content */}
        <div className="p-4">
          {activeTab === 'status' && ()
            <div className="space-y-4">
              {/* Connection Details */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-2">Connection Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">State:</span>
                    <span className="font-medium">{status.connectionState}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality:</span>
                    <span className="font-medium" style={{ color: getOperationPriorityColor()
                      status.connectionQuality === ConnectionQuality.EXCELLENT ? 'low' :
                        status.connectionQuality === ConnectionQuality.GOOD ? 'medium' : 'high'
                    )}}>
                      {status.connectionQuality}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs text-gray-500 mt-1">
                    {getConnectionQualityDescription(status.connectionQuality)}
                  </div>
                </div>
              </div>
              {/* Reconnection Status */}
              {status.reconnectionState !== ReconnectionState.IDLE && ()
                <div className="bg-blue-50 rounded-lg p-3">
                  <h3 className="font-medium text-blue-900 mb-2">Reconnection Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">State:</span>
                      <span className="font-medium text-blue-900">{status.reconnectionState}</span>
                    </div>
                    {status.reconnectionState === ReconnectionState.ATTEMPTING && ()
                      <div className="text-xs text-blue-600">
                        Attempting to reconnect...
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Sync Status */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-2">Synchronization</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="font-medium">
                      {status.lastSync ? formatTimestamp(status.lastSync) : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Sync:</span>
                    <span className="font-medium">
                      {status.pendingSync ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="space-y-2">
                {!status.isOnline && onRetryConnection && ()
                  <button
                    onClick={onRetryConnection}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry Connection
                  </button>
                )}
                {status.isOnline && onForceSync && ()
                  <button
                    onClick={onForceSync}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={status.pendingSync}
                  >
                    {status.pendingSync ? 'Syncing...' : 'Force Sync'}
                  </button>
                )}
                {status.queueSize > 0 && onClearQueue && ()
                  <button
                    onClick={onClearQueue}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear Queue
                  </button>
                )}
              </div>
            </div>
          )}
          {activeTab === 'queue' && ()
            <div className="space-y-3">
              {queuedOperations.length === 0 ? ()
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">✅</div>
                  <div>No pending operations</div>
                </div>
              ) : ()
                <>
                  <div className="text-sm text-gray-600 mb-3">
                    {queuedOperations.length} operation{queuedOperations.length === 1 ? '' : 's'} pending
                  </div>
                  {queuedOperations.map((operation) => ()
                    <div key={operation.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{operation.type}</span>
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ 
                                backgroundColor: `${getOperationPriorityColor(operation.priority)}20`,}
                                color: getOperationPriorityColor(operation.priority),
                              }}
                            >
                              {operation.priority}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Created: {formatTimestamp(operation.timestamp)}</div>
                            {operation.retryCount > 0 && ()
                              <div>Retries: {operation.retryCount}/{operation.maxRetries}</div>
                            )}
                            {operation.expiresAt && ()
                              <div>Expires: {formatTimestamp(operation.expiresAt)}</div>
                            )}
                          </div>
                        </div>
                        {onRetryOperation && ()
                          <button
                            onClick={() => onRetryOperation(operation.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          {activeTab === 'metrics' && ()
            <div className="space-y-4">
              {/* Connection Metrics */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-3">Connection</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Uptime:</span>
                    <div className="font-medium">{formatDuration(status.metrics.uptime)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Downtime:</span>
                    <div className="font-medium">{formatDuration(status.metrics.totalDowntime)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Attempts:</span>
                    <div className="font-medium">{status.metrics.connectionAttempts}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Successful:</span>
                    <div className="font-medium">{status.metrics.successfulReconnections}</div>
                  </div>
                </div>
              </div>
              {/* Operation Metrics */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-3">Operations</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Queued:</span>
                    <div className="font-medium">{status.metrics.queuedOperations}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Synced:</span>
                    <div className="font-medium">{status.metrics.syncedOperations}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Pending:</span>
                    <div className="font-medium">{status.metrics.pendingOperations}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Conflicts:</span>
                    <div className="font-medium">{status.metrics.conflicts}</div>
                  </div>
                </div>
              </div>
              {/* Performance Metrics */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-3">Performance</h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Avg Reconnect Time:</span>
                    <div className="font-medium">{formatDuration(status.metrics.averageReconnectTime)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Data Loss Events:</span>
                    <div className="font-medium">{status.metrics.dataLoss}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};