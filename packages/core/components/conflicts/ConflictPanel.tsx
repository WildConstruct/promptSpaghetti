import React, { useState } from 'react';

export interface ConflictData {
  id: string;
  type: string;
  description: string;
  operations: Array<{
    id: string;
    userId: string;
    userName?: string;
    timestamp: number;
    oldValue: Error;
    newValue: Error;
  }>;
  nodeId?: string;
  edgeId?: string;
  property?: string;
  detectedAt: number;
  autoResolved: boolean;
}

export interface ConflictPanelProps {
  conflicts: ConflictData[];
  onResolveConflict: (conflictId: string, strategy: string, userSelection?: Record<string, unknown>) => void;
  onViewConflict: (conflictId: string) => void;
  currentUserId: string;
  className?: string;
}

export const ConflictPanel: React.FC<ConflictPanelProps> = (
  { conflicts,
  onResolveConflict,
  onViewConflict,
  currentUserId,
  className }
) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('last_writer_wins');

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
  };

  const getConflictIcon = (type: string): string => {
    switch (type) {
    case 'node_position':
      return '📍';
    case 'node_properties':
      return '⚙️';
    case 'node_creation':
      return '➕';
    case 'node_deletion':
      return '➖';
    case 'edge_creation':
      return '🔗';
    case 'edge_deletion':
      return '🔓';
    case 'edge_properties':
      return '🔧';
    default:
      return '⚠️';
    }
  };

  const getConflictColor = (type: string): string => {
    switch (type) {
    case 'node_position':
      return 'border-blue-200 bg-blue-50';
    case 'node_properties':
      return 'border-green-200 bg-green-50';
    case 'node_creation':
      return 'border-purple-200 bg-purple-50';
    case 'node_deletion':
      return 'border-red-200 bg-red-50';
    case 'edge_creation':
      return 'border-indigo-200 bg-indigo-50';
    case 'edge_deletion':
      return 'border-orange-200 bg-orange-50';
    case 'edge_properties':
      return 'border-teal-200 bg-teal-50';
    default:
      return 'border-gray-200 bg-gray-50';
    }
  };

  const resolutionStrategies = [
    { value: 'last_writer_wins', label: 'Last Writer Wins', description: 'Use the most recent change' },
    { value: 'first_writer_wins', label: 'First Writer Wins', description: 'Use the earliest change' },
    { value: 'merge_properties', label: 'Merge Properties', description: 'Combine all changes' },
    { value: 'positional_offset', label: 'Offset Position', description: 'Offset overlapping positions' },
    { value: 'user_resolution', label: 'Manual Resolution', description: 'Choose specific values' }
  ];

  if (conflicts.length === 0) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">✅</div>
          <p>No conflicts detected</p>
          <p className="text-sm">All changes are synchronized</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            Conflicts ({conflicts.length})
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>⚠️</span>
            <span>Requires resolution</span>
          </div>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {conflicts.map(conflict => (
          <div key={conflict.id} className="p-4">
            <div className={`rounded-lg border-2 p-3 ${getConflictColor(conflict.type)}`}>
              {/* Conflict Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getConflictIcon(conflict.type)}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {conflict.description}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span>{formatTimestamp(conflict.detectedAt)}</span>
                      {conflict.nodeId && (
                        <>
                          <span>•</span>
                          <span>Node: {conflict.nodeId.slice(0, 8)}...</span>
                        </>
                      )}
                      {conflict.property && (
                        <>
                          <span>•</span>
                          <span>Property: {conflict.property}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onViewConflict(conflict.id)}
                  className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50"
                >
                  View
                </button>
              </div>

              {/* Operations */}
              <div className="space-y-2 mb-3">
                {conflict.operations.map(op => (
                  <div key={op.id} className="bg-white rounded p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {op.userName || op.userId}
                        {op.userId === currentUserId && ' (You)'}
                      </span>
                      <span className="text-gray-500">
                        {formatTimestamp(op.timestamp)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {op.oldValue && (
                        <div className="text-red-600">
                          <span className="font-medium">From: </span>
                          <span>{JSON.stringify(op.oldValue)}</span>
                        </div>
                      )}
                      <div className="text-green-600">
                        <span className="font-medium">To: </span>
                        <span>{JSON.stringify(op.newValue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resolution Controls */}
              <div className="border-t pt-3">
                <div className="flex items-center space-x-2 mb-2">
                  <label className="text-xs font-medium text-gray-700">
                    Resolution Strategy:
                  </label>
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="text-xs border rounded px-2 py-1 bg-white"
                  >
                    {resolutionStrategies.map(strategy => (
                      <option key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  {resolutionStrategies.find(s => s.value === selectedStrategy)?.description}
                </div>

                {selectedStrategy === 'user_resolution' && (
                  <div className="mb-3">
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Choose preferred value:
                    </label>
                    <div className="space-y-1">
                      {conflict.operations.map(op => (
                        <label key={op.id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`conflict-${conflict.id}`}
                            value={op.id}
                            className="text-xs"
                          />
                          <span className="text-xs">
                            {op.userName || op.userId}: {JSON.stringify(op.newValue)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onResolveConflict(conflict.id, selectedStrategy)}
                    className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600"
                  >
                    Resolve Conflict
                  </button>
                  <button
                    onClick={() => setExpandedConflict(
                      expandedConflict === conflict.id ? null : conflict.id
                    )}
                    className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
                  >
                    {expandedConflict === conflict.id ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedConflict === conflict.id && (
                <div className="border-t pt-3 mt-3">
                  <h5 className="font-medium text-xs text-gray-700 mb-2">
                    Conflict Details
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium">Type: </span>
                      <span>{conflict.type}</span>
                    </div>
                    <div>
                      <span className="font-medium">Detected: </span>
                      <span>{new Date(conflict.detectedAt).toLocaleString()}</span>
                    </div>
                    {conflict.nodeId && (
                      <div>
                        <span className="font-medium">Node ID: </span>
                        <span className="font-mono">{conflict.nodeId}</span>
                      </div>
                    )}
                    {conflict.edgeId && (
                      <div>
                        <span className="font-medium">Edge ID: </span>
                        <span className="font-mono">{conflict.edgeId}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Auto-Resolved: </span>
                      <span>{conflict.autoResolved ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConflictPanel;

// Notification component for conflict alerts
interface ConflictNotificationProps {
  conflict: ConflictData;
  onResolve: (conflict: ConflictData) => void;
  onDismiss: () => void;
}

export };