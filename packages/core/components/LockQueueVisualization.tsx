// Epic 9.4.3 - Lock Queue Visualization Component
// Visualization for lock queue management

import React from 'react';
import { Clock, User, X } from 'lucide-react';
import { LockQueue } from '../types/locking';

interface LockQueueVisualizationProps {
  queue: LockQueue[];
  onRemoveFromQueue: (queueId: string) => void;
}

export const LockQueueVisualization: React.FC<LockQueueVisualizationProps> = ({
  queue,
  onRemoveFromQueue
}) => {
  const groupedQueue = queue.reduce((acc, item) => {
    if (!acc[item.resource_id]) {
      acc[item.resource_id] = [];
    }
    acc[item.resource_id].push(item);
    return acc;
  }, {} as Record<string, LockQueue[]>);

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
    case 1: return 'bg-red-100 text-red-800 border-red-200';
    case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
    case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 4: return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
    case 1: return 'Critical';
    case 2: return 'High';
    case 3: return 'Medium';
    case 4: return 'Low';
    default: return 'Normal';
    }
  };

  if (queue.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Queue Items</h3>
        <p className="text-gray-500">
          There are no pending lock requests in the queue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedQueue).map(([resourceId, items]) => (
        <div key={resourceId} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900">
                Resource: {resourceId.substring(0, 8)}...
              </h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {items.length} in queue
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {items
              .sort((a, b) => a.priority - b.priority || new Date(a.queued_at).getTime() - new Date(b.queued_at).getTime())
              .map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {item.user_id.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {item.lock_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`}>
                      {getPriorityLabel(item.priority)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {item.estimated_wait_time 
                            ? formatWaitTime(item.estimated_wait_time)
                            : 'Unknown'
                          }
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Queued: {new Date(item.queued_at).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFromQueue(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Remove from queue"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Queue Statistics */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-500">Total Wait Time</div>
                <div className="font-medium text-gray-900">
                  {formatWaitTime(
                    items.reduce((sum, item) => sum + (item.estimated_wait_time || 0), 0)
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Avg Wait Time</div>
                <div className="font-medium text-gray-900">
                  {formatWaitTime(
                    Math.round(
                      items.reduce((sum, item) => sum + (item.estimated_wait_time || 0), 0) / items.length
                    )
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Queue Length</div>
                <div className="font-medium text-gray-900">
                  {items.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};