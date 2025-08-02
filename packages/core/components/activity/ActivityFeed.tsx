/**
 * Epic 9.2.3 - Activity Feed Component
 * Main activity feed interface for workspace activity
 */
import React, { useState } from 'react';
import { ActivityItem } from './ActivityItem';
import { ActivityFilters } from './ActivityFilters';
import { ActivityStats } from './ActivityStats';
import { useActivityFeed } from '../../hooks/useActivityFeed';
import { ActivityEventWithActorInfo, ActivityEventFilter } from '../../types/workspace';

interface ActivityFeedProps {
  workspaceId: string;
  userId: string;
  projectId?: string;
  showStats?: boolean;
  showFilters?: boolean;
  maxItems?: number;
  compact?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  workspaceId,
  userId,
  projectId,
  showStats = true,
  showFilters = true,
  maxItems,
  compact = false
}) => {
  const [filters, setFilters] = useState<ActivityEventFilter>({
    project_id: projectId
  });
  const [selectedEvent, setSelectedEvent] = useState<ActivityEventWithActorInfo | null>(null);
  
  const { 
    activities,
    loading,
    error,
    hasMore,
    stats,
    eventTypes,
    loadMore,
    refresh
  } = useActivityFeed(workspaceId, userId, filters, {
    limit: maxItems || 20,
    autoRefresh: true
  });

  const handleFilterChange = (newFilters: Partial<ActivityEventFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleEventClick = (event: ActivityEventWithActorInfo) => {
    if (!compact) {
      setSelectedEvent(event);
    }
  };

  if (error) {
    return (
      <div className="activity-feed activity-feed--error">
        <div className="activity-feed__error">
          <h3>Failed to load activity</h3>
          <p>{error}</p>
          <button 
            className="btn btn--secondary"
            onClick={refresh}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`activity-feed ${compact ? 'activity-feed--compact' : ''}`}>
      {showStats && stats && !compact && (
        <ActivityStats
          stats={stats}
          workspaceId={workspaceId}
          className="activity-feed__stats"
        />
      )}
      
      {showFilters && !compact && (
        <ActivityFilters
          filters={filters}
          eventTypes={eventTypes}
          onFilterChange={handleFilterChange}
          className="activity-feed__filters"
        />
      )}
      
      <div className="activity-feed__content">
        <div className="activity-feed__header">
          <h3>
            {projectId ? 'Project Activity' : 'Workspace Activity'}
            {activities.length > 0 && ` (${activities.length})`}
          </h3>
          {!compact && (
            <button
              className="btn btn--ghost btn--small"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
        
        <div className="activity-feed__list">
          {loading && activities.length === 0 ? (
            <div className="activity-feed__loading">
              <ActivityFeedSkeleton count={5} compact={compact} />
            </div>
          ) : activities.length === 0 ? (
            <div className="activity-feed__empty">
              <div className="empty-state">
                <div className="empty-state__icon">📋</div>
                <h4>No activity yet</h4>
                <p>
                  {projectId 
                    ? 'Project activity will appear here as team members work on content.'
                    : 'Workspace activity will appear here as team members collaborate.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <>
              {activities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onClick={() => handleEventClick(activity)}
                  compact={compact}
                  showProject={!projectId}
                  isLast={index === activities.length - 1}
                />
              ))}
              
              {hasMore && !maxItems && (
                <div className="activity-feed__load-more">
                  <button
                    className="btn btn--secondary btn--block"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More Activity'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {selectedEvent && !compact && (
        <ActivityEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
};

// Skeleton loader component
const ActivityFeedSkeleton: React.FC<{ count: number; compact: boolean }> = ({ count, compact }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`activity-skeleton ${compact ? 'activity-skeleton--compact' : ''}`}>
          <div className="activity-skeleton__avatar" />
          <div className="activity-skeleton__content">
            <div className="activity-skeleton__line activity-skeleton__line--short" />
            <div className="activity-skeleton__line activity-skeleton__line--long" />
            {!compact && <div className="activity-skeleton__line activity-skeleton__line--medium" />}
          </div>
        </div>
      ))}
    </>
  );
};

// Activity Event Modal placeholder
const ActivityEventModal: React.FC<{
  event: ActivityEventWithActorInfo;
  onClose: () => void;
  workspaceId: string;
}> = ({ event, onClose, workspaceId }) => {
  // Placeholder implementation
  return null;
};