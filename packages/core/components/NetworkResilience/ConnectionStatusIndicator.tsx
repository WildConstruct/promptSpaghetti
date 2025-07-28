import React, { useState, useEffect } from 'react';
import { ConnectionState, ConnectionQuality } from '../../network-resilience/ConnectionStateManager';
import { ReconnectionState } from '../../network-resilience/ReconnectionHandler';
import { NetworkStatus } from '../../network-resilience/NetworkResilienceManager';
interface ConnectionStatusIndicatorProps {
  status: NetworkStatus;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({)
  status,
  showDetails = false,
  compact = false,
  className = '',
  onClick
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (status.reconnectionState === ReconnectionState.ATTEMPTING) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [status.reconnectionState]);
  const getConnectionIcon = () => {
    if (status.reconnectionState === ReconnectionState.ATTEMPTING) {
      return '🔄';
    }
    switch (status.connectionState) {
    case ConnectionState.CONNECTED:
      return status.connectionQuality === ConnectionQuality.EXCELLENT ? '🟢' :
        status.connectionQuality === ConnectionQuality.GOOD ? '🟡' :
          status.connectionQuality === ConnectionQuality.FAIR ? '🟠' : '🔴';
    case ConnectionState.CONNECTING:
      return '🔵';
    case ConnectionState.DISCONNECTED:
      return '⚫';
    case ConnectionState.OFFLINE:
      return '📴';
    case ConnectionState.FAILED:
      return '❌';
    default:
      return '❓';
    }
  };
  const getStatusText = () => {
    if (status.reconnectionState === ReconnectionState.ATTEMPTING) {
      return 'Reconnecting...';
    }
    switch (status.connectionState) {
    case ConnectionState.CONNECTED:
      return `Connected (${status.connectionQuality})`;}
    case ConnectionState.CONNECTING:
      return 'Connecting...';
    case ConnectionState.DISCONNECTED:
      return 'Disconnected';
    case ConnectionState.OFFLINE:
      return 'Offline';
    case ConnectionState.FAILED:
      return 'Connection Failed';
    default:
      return 'Unknown';
    }
  };
  const getStatusColor = () => {
    if (status.isOnline) {
      switch (status.connectionQuality) {
      case ConnectionQuality.EXCELLENT:
        return '#22c55e'; // green-500
      case ConnectionQuality.GOOD:
        return '#eab308'; // yellow-500
      case ConnectionQuality.FAIR:
        return '#f97316'; // orange-500
      case ConnectionQuality.POOR:
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
      }
    } else {
      return status.reconnectionState === ReconnectionState.ATTEMPTING ? '#3b82f6' : '#ef4444';
    }
  };
  const formatLastSync = () => {
    if (!status.lastSync) return 'Never';
    const now = Date.now();
    const diff = now - status.lastSync;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;}
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;}
    return `${Math.floor(diff / 86400000)}d ago`;}
  };
  if (compact) {
    return ()
      <div 
        className={`inline-flex items-center gap-1 cursor-pointer ${className}`}
        onClick={onClick}
        title={getStatusText()}
      >
        <span 
          className={`text-sm ${isAnimating ? 'animate-spin' : ''}`}
          style={{ color: getStatusColor() }}
        >
          {getConnectionIcon()}
        </span>
        {status.queueSize > 0 && ()
          <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">
            {status.queueSize}
          </span>
        )}
      </div>
    );
  }
  return ()
    <div 
      className={`connection-status-indicator ${className}`}
      onClick={onClick}
      style={{
        padding: '8px 12px',
        backgroundColor: '#f8fafc',
        border: `2px solid ${getStatusColor()}`,}
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        minWidth: '200px',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span 
            className={`text-lg ${isAnimating ? 'animate-spin' : ''}`}
            style={{ color: getStatusColor() }}
          >
            {getConnectionIcon()}
          </span>
          <span className="font-medium text-sm text-gray-800">
            {getStatusText()}
          </span>
        </div>
        {status.queueSize > 0 && ()
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">Queue:</span>
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              {status.queueSize}
            </span>
          </div>
        )}
      </div>
      {showDetails && ()
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Last Sync:</span>
              <span className="ml-1">{formatLastSync()}</span>
            </div>
            <div>
              <span className="font-medium">Uptime:</span>
              <span className="ml-1">{Math.floor(status.metrics.uptime / 1000)}s</span>
            </div>
            <div>
              <span className="font-medium">Synced:</span>
              <span className="ml-1">{status.metrics.syncedOperations}</span>
            </div>
            <div>
              <span className="font-medium">Conflicts:</span>
              <span className="ml-1">{status.metrics.conflicts}</span>
            </div>
          </div>
        </div>
      )}
      {status.pendingSync && ()
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <div className="animate-spin">⚙️</div>
            <span>Synchronizing...</span>
          </div>
        </div>
      )}
    </div>
  );
};