/**
 * WorkerIndicator - Shows WebWorker pool status
 */

import React from 'react';
import './WorkerIndicator.css';

export interface WorkerIndicatorProps {
  enabled: boolean;
  totalWorkers?: number;
  busyWorkers?: number;
  queuedTasks?: number;
  className?: string;
}

export const WorkerIndicator: React.FC<WorkerIndicatorProps> = ({
  enabled,
  totalWorkers = 0,
  busyWorkers = 0,
  queuedTasks = 0,
  className = ''
}) => {
  if (!enabled) {
    return (
      <div className={`worker-indicator disabled ${className}`}>
        <span className="worker-badge">
          🔧 Main Thread
        </span>
      </div>
    );
  }

  const idleWorkers = totalWorkers - busyWorkers;
  const utilizationPercent = totalWorkers > 0 ? Math.round((busyWorkers / totalWorkers) * 100) : 0;

  return (
    <div className={`worker-indicator ${className}`}>
      <span className="worker-badge active">
        ⚡ Workers
      </span>
      
      <div className="worker-stats">
        <div className="worker-stat" title={`${busyWorkers} busy, ${idleWorkers} idle`}>
          <span className="worker-stat-label">Active:</span>
          <span className="worker-stat-value">{busyWorkers}/{totalWorkers}</span>
          <div className="worker-utilization-bar">
            <div 
              className="worker-utilization-fill" 
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>
        </div>
        
        {queuedTasks > 0 && (
          <div className="worker-stat" title="Tasks waiting for execution">
            <span className="worker-stat-label">Queued:</span>
            <span className="worker-stat-value queued">{queuedTasks}</span>
          </div>
        )}
      </div>
    </div>
  );
};