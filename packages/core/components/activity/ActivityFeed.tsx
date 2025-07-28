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
  workspaceId: string;,
  userId: string;
  projectId?: string;
  showStats?: boolean;
  showFilters?: boolean;
  maxItems?: number;
  compact?: boolean;
  export const ActivityFeed: React.FC<ActivityFeedProps> = ({,)
  workspaceId,
  userId,
  projectId,
  showStats = true,
  showFilters = true,
  maxItems,
  compact = false
}) => {
  const [filters, setFilters] = useState<ActivityEventFilter>({)
  project_id: projectId,
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
  } = useActivityFeed(workspaceId, userId, filters, {)
  limit: maxItems || 20,
  autoRefresh: true,
});
  const handleFilterChange = (newFilters: Partial<ActivityEventFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  const handleEventClick = (event: ActivityEventWithActorInfo) => {
    if (!compact) {
      setSelectedEvent(event);
  };
  if (error) {
    return;
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
  return;
    <div className={`activity-feed ${compact ? 'activity-feed--compact' : ''}`}>}
      {showStats && stats && !compact && ()
        <ActivityStats
          stats={stats}
          workspaceId={workspaceId}
          className="activity-feed__stats"
        />
      )}
      {showFilters && !compact && ()
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
          {!compact && ()
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
          {loading && activities.length === 0 ? ()
            <div className="activity-feed__loading">
              <ActivityFeedSkeleton count={5} compact={compact} />
            </div>
          ) : activities.length === 0 ? ()
            <div className="activity-feed__empty">
              <div className="empty-state">
                <div className="empty-state__icon">📋</div>
                <h4>No activity yet</h4>
                <p>
                  {projectId 
                    ? 'Project activity will appear here as team members work on content.'
                    : 'Workspace activity will appear here as team members collaborate.'
                </p>
              </div>
            </div>
          ) : ()
            <>
              {activities.map((activity, index) => ()
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onClick={() => handleEventClick(activity)}
                  compact={compact}
                  showProject={!projectId}
                  isLast={index === activities.length - 1}
                />
              ))}
              {hasMore && !maxItems && ()
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
      {selectedEvent && !compact && ()
        <ActivityEventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};
interface ActivityFeedSkeletonProps {
  count: number;,
  compact: boolean;
const ActivityFeedSkeleton: React.FC<ActivityFeedSkeletonProps> = ({ count, compact }) => ()
  <>
    {Array.from({ length: count }, (_, i) => ()
      <div key={i} className={`activity-item activity-item--skeleton ${compact ? 'activity-item--compact' : ''}`}>}
        <div className="activity-item__avatar"></div>
        <div className="activity-item__content">
          <div className="activity-item__header">
            <div className="activity-item__title"></div>
            <div className="activity-item__time"></div>
          </div>
          {!compact && ()
            <div className="activity-item__description"></div>
          )}
        </div>
      </div>
    ))}
  </>
);
interface ActivityEventModalProps {
  event: ActivityEventWithActorInfo;,
  onClose: () => void;
const ActivityEventModal: React.FC<ActivityEventModalProps> = ({ event, onClose }) => ()
  <div className="modal-overlay">
    <div className="modal modal--medium">
      <div className="modal__header">
        <h2>Activity Details</h2>
        <button className="modal__close" onClick={onClose}>×</button>
      </div>
      <div className="modal__content">
        <div className="activity-event-detail">
          <div className="activity-event-detail__header">
            <div className="activity-event-detail__user">
              <div className="user-avatar">
                {event.actor_name?.charAt(0) || event.actor_id.charAt(0)}
              </div>
              <div className="user-info">
                <div className="user-name">{event.actor_name || event.actor_id}</div>
                <div className="event-time">
                  {new Date(event.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="event-type-badge">
              {event.event_type.replace(/[._]/g, ' ')}
            </div>
          </div>
          <div className="activity-event-detail__content">
            <h4>Event Data</h4>
            <pre className="event-data">
              {JSON.stringify(event.event_data, null, 2)}
            </pre>
            {event.project_name && ()
              <div className="event-context">
                <h4>Context</h4>
                <p><strong>Project:</strong> {event.project_name}</p>
                {event.resource_name && ()
                  <p><strong>Resource:</strong> {event.resource_name} ({event.resource_type})</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal__footer">
        <button className="btn btn--secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  </div>
);

export default ActivityFeed;