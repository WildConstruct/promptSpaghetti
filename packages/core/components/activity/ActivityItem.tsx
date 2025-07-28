/**
 * Epic 9.2.3 - Activity Item Component
 * Individual activity event display component
 */
import React from 'react';
import { ActivityEventWithActorInfo } from '../../types/workspace';
interface ActivityItemProps {
  activity: ActivityEventWithActorInfo;
  onClick?: () => void;
  compact?: boolean;
  showProject?: boolean;
  isLast?: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({)
  activity,
  onClick,
  compact = false,
  showProject = true,
  isLast = false
}) => {
  const getActivityIcon = (eventType: string) => {
    if (eventType.includes('created')) return '✨';
    if (eventType.includes('updated')) return '✏️';
    if (eventType.includes('deleted')) return '🗑️';
    if (eventType.includes('invited')) return '👥';
    if (eventType.includes('comment')) return '💬';
    if (eventType.includes('archived')) return '📦';
    return '📝';
  };
  const getActivityTitle = () => {
    const { event_type, event_data, actor_name, actor_id } = activity;
    const actorDisplay = actor_name || actor_id;
    switch (event_type) {
    case 'workspace.created':
      return `${actorDisplay} created the workspace`;}
    case 'workspace.updated':
      return `${actorDisplay} updated workspace settings`;}
    case 'workspace.archived':
      return `${actorDisplay} archived the workspace`;}
    case 'project.created':
      return `${actorDisplay} created project "${event_data.project_name}"`;}
    case 'project.updated':
      return `${actorDisplay} updated project settings`;}
    case 'project.deleted':
      return `${actorDisplay} deleted a project`;}
    case 'resource.created':
      return `${actorDisplay} created ${event_data.resource_type} "${event_data.resource_name}"`;}
    case 'resource.updated':
      return `${actorDisplay} updated a ${event_data.resource_type}`;}
    case 'resource.deleted':
      return `${actorDisplay} deleted a ${event_data.resource_type}`;}
    case 'comment.created':
      return `${actorDisplay} added a comment`;}
    case 'comment.updated':
      return `${actorDisplay} edited a comment`;}
    case 'comment.deleted':
      return `${actorDisplay} deleted a comment`;}
    case 'user.invited':
      return `${actorDisplay} invited ${event_data.invited_user} as ${event_data.role}`;}
    case 'user.joined':
      return `${actorDisplay} joined the workspace`;}
    case 'user.left':
      return `${actorDisplay} left the workspace`;}
    default:
      return `${actorDisplay} performed ${event_type.replace(/[._]/g, ' ')}`;}
    }
  };
  const getActivityDescription = () => {
    const { event_type, event_data } = activity;
    if (compact) return null;
    switch (event_type) {
    case 'workspace.updated':
      return event_data.changes ? 
        `Updated: ${event_data.changes.join(', ')}` : }
        'Updated workspace settings';
    case 'project.created':
      return event_data.description || 'New project created';
    case 'resource.created':
      return `Created new ${event_data.resource_type} in the project`;}
    case 'comment.created':
      if (event_data.target_type === 'node') {
        return 'Commented on a graph node';
      } else if (event_data.target_type === 'region') {
        return 'Commented on a graph region';
      }
      return 'Added a comment to the resource';
    case 'user.invited':
      return `Invited with ${event_data.role} permissions`;}
    default:
      return null;
    }
  };
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;}
    if (diffHours < 24) return `${diffHours}h ago`;}
    if (diffDays < 7) return `${diffDays}d ago`;}
    return date.toLocaleDateString();
  };
  const title = getActivityTitle();
  const description = getActivityDescription();
  const icon = getActivityIcon(activity.event_type);
  return ();
    <div 
      className={`activity-item ${compact ? 'activity-item--compact' : ''} ${onClick ? 'activity-item--clickable' : ''} ${isLast ? 'activity-item--last' : ''}`}
      onClick={onClick}
    >
      <div className="activity-item__icon">
        {icon}
      </div>
      <div className="activity-item__content">
        <div className="activity-item__header">
          <div className="activity-item__title">
            {title}
          </div>
          <div className="activity-item__time">
            {formatTime(new Date(activity.created_at))}
          </div>
        </div>
        {description && ()
          <div className="activity-item__description">
            {description}
          </div>
        )}
        {showProject && activity.project_name && ()
          <div className="activity-item__context">
            <span className="activity-item__project">
              📁 {activity.project_name}
            </span>
            {activity.resource_name && ()
              <span className="activity-item__resource">
                • {activity.resource_name}
              </span>
            )}
          </div>
        )}
        {!compact && ()
          <div className="activity-item__meta">
            <span className="activity-item__event-type">
              {activity.event_type}
            </span>
            {activity.aggregation_key && ()
              <span className="activity-item__group">
                Grouped
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;