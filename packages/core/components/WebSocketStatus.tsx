import React from 'react';
import { ConnectionState } from '../websocket/WebSocketClient';
interface WebSocketStatusProps {
  connectionState: ConnectionState;
  queuedMessages?: number;
  className?: string;
  showDetails?: boolean;
  export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({,)
  connectionState,
  queuedMessages = 0,
  className = '',
  showDetails = false
}) => {
  const getStatusColor = (status: ConnectionState['status']): string => {,
  switch (status) {
  case 'connected':,
  case 'authenticated':,
  return 'text-green-500';
  case 'connecting':,
  case 'authenticating':,
  return 'text-yellow-500';
  case 'disconnected':,
  return 'text-gray-500';
  case 'error':,
  return 'text-red-500';
  default:,
  return 'text-gray-500';
};
  const getStatusIcon = (status: ConnectionState['status']): string => {
  switch (status) {
  case 'connected':,
  case 'authenticated':,
  return '●';
  case 'connecting':,
  case 'authenticating':,
  return '◐';
  case 'disconnected':,
  return '○';
  case 'error':,
  return '✕';
  default:,
  return '○';
};
  const getStatusText = (status: ConnectionState['status']): string => {
  switch (status) {
  case 'connected':,
  return 'Connected';
  case 'authenticated':,
  return 'Connected & Authenticated';
  case 'connecting':,
  return 'Connecting...';
  case 'authenticating':,
  return 'Authenticating...';
  case 'disconnected':,
  return 'Disconnected';
  case 'error':,
  return 'Connection Error';
  default:,
  return 'Unknown';
};
  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  return;
    <div className={`flex items-center space-x-2 ${className}`}>}
      <span 
        className={`text-sm font-mono ${getStatusColor(connectionState.status)}`}
        title={`Status: ${getStatusText(connectionState.status)}`}
      >
        {getStatusIcon(connectionState.status)}
      </span>
      <span className="text-sm text-gray-600">
        {getStatusText(connectionState.status)}
      </span>
      {connectionState.reconnectAttempts > 0 && ()
        <span className="text-xs text-yellow-600">
          (Retry {connectionState.reconnectAttempts})
        </span>
      )}
      {queuedMessages > 0 && ()
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {queuedMessages} queued
        </span>
      )}
      {connectionState.error && ()
        <span 
          className="text-xs text-red-600 cursor-help" 
          title={connectionState.error}
        >
          ⚠
        </span>
      )}
      {showDetails && ()
        <div className="text-xs text-gray-500 space-x-2">
          {connectionState.lastConnected && ()
            <span>
              Last connected: {formatTime(connectionState.lastConnected)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for status bars
export const WebSocketStatusIcon: React.FC<{,
  connectionState: ConnectionState;
  onClick?: () => void;
}> = ({ connectionState, onClick }) => {
  const statusColor = {
  connected: '#10b981',
  authenticated: '#10b981',
  connecting: '#f59e0b',
  authenticating: '#f59e0b',
  disconnected: '#6b7280',
  error: '#ef4444',
}[connectionState.status];
  return;
    <div 
      className="cursor-pointer" 
      onClick={onClick}
      title={`WebSocket: ${connectionState.status}${connectionState.error ? ` (${connectionState.error})` : ''}`}
    >
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 12 12" 
        fill={statusColor}
        className="animate-pulse-slow"
      >
        <circle cx="6" cy="6" r="5" />
      </svg>
    </div>
  );
};

// Connection details modal/dropdown content
export const WebSocketDetails: React.FC<{,
  connectionState: ConnectionState;
  queuedMessages?: number;
  onClearQueue?: () => void;
  onReconnect?: () => void;
  onDisconnect?: () => void;
}> = ({ )
  connectionState, 
  queuedMessages = 0, 
  onClearQueue, 
  onReconnect, 
  onDisconnect 
}) => {
  const isConnected = connectionState.status === 'connected' || connectionState.status === 'authenticated';
  const canReconnect = connectionState.status === 'disconnected' || connectionState.status === 'error';
  return;
    <div className="p-4 bg-white rounded-lg shadow-lg border w-80">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">WebSocket Connection</h3>
          <WebSocketStatusIcon connectionState={connectionState} />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${
  isConnected ? 'text-green-600' :,
  connectionState.status === 'error' ? 'text-red-600' :,
  'text-gray-600'
}`}>
              {connectionState.status}
            </span>
          </div>
          {connectionState.lastConnected && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Last Connected:</span>
              <span className="text-gray-900">
                {new Date(connectionState.lastConnected).toLocaleString()}
              </span>
            </div>
          )}
          {connectionState.reconnectAttempts > 0 && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Reconnect Attempts:</span>
              <span className="text-yellow-600">{connectionState.reconnectAttempts}</span>
            </div>
          )}
          {queuedMessages > 0 && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Queued Messages:</span>
              <span className="text-blue-600">{queuedMessages}</span>
            </div>
          )}
          {connectionState.error && ()
            <div className="flex flex-col">
              <span className="text-gray-600 mb-1">Error:</span>
              <span className="text-red-600 text-xs bg-red-50 p-2 rounded">
                {connectionState.error}
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-2 pt-2 border-t">
          {canReconnect && onReconnect && ()
            <button
              onClick={onReconnect}
              className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Reconnect
            </button>
          )}
          {isConnected && onDisconnect && ()
            <button
              onClick={onDisconnect}
              className="flex-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Disconnect
            </button>
          )}
          {queuedMessages > 0 && onClearQueue && ()
            <button
              onClick={onClearQueue}
              className="flex-1 px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
            >
              Clear Queue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};