import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity, 
  Filter, 
  RefreshCw, 
  Search, 
  Calendar,
  Users,
  MessageCircle,
  Edit3,
  GitBranch,
  FileText,
  Settings,
  Trash2 }
  ExternalLink
 from 'lucide-react';
import { useActivityFeed } from '../../hooks/useActivityFeed';
import { ActivityEvent, ActivityEventType } from '../../types/ActivityTypes';


interface ActivityFeedProps { workspaceId?: string;
  projectId?: string;
  userId?: string;
  className?: string;
  maxHeight?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  realTime?: boolean;
  const ACTIVITY_ICONS: Record<ActivityEventType, React.ComponentType<unknown>> = {;
  'project_created': FileText;
  'project_updated': Edit3;
  'project_deleted': Trash2;
  'resource_created': FileText;
  'resource_updated': Edit3;
  'resource_deleted': Trash2;
  'comment_added': MessageCircle;
  'comment_updated': MessageCircle;
  'comment_deleted': MessageCircle;
  'member_added': Users;
  'member_removed': Users;
  'member_role_changed': Users;
  'workflow_state_changed': GitBranch;
  'approval_requested': GitBranch;
  'approval_granted': GitBranch;
  'approval_rejected': GitBranch;
  'version_created': GitBranch;
  'branch_created': GitBranch;
  'branch_merged': GitBranch;
  'template_applied': FileText;
  'collaboration_started': Users;
  'collaboration_ended': Users }


};
const ACTIVITY_COLORS: Record<ActivityEventType, string> = { 'project_created': 'text-green-500'
  'project_updated': 'text-blue-500'
  'project_deleted': 'text-red-500'
  'resource_created': 'text-green-500'
  'resource_updated': 'text-blue-500'
  'resource_deleted': 'text-red-500'
  'comment_added': 'text-purple-500'
  'comment_updated': 'text-purple-500'
  'comment_deleted': 'text-red-500'
  'member_added': 'text-green-500'
  'member_removed': 'text-red-500'
  'member_role_changed': 'text-orange-500'
  'workflow_state_changed': 'text-blue-500'
  'approval_requested': 'text-yellow-500'
  'approval_granted': 'text-green-500'
  'approval_rejected': 'text-red-500'
  'version_created': 'text-blue-500'
  'branch_created': 'text-green-500'
  'branch_merged': 'text-purple-500'
  'template_applied': 'text-blue-500'
  'collaboration_started': 'text-green-500'
  'collaboration_ended': 'text-gray-500' }
};

export const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [actorFilter, setActorFilter] = useState<string>('all');
  const { activities
    loading
    error
    hasMore
    stats
    actors
    refreshActivities
    loadMore }
    realTimeConnection
 = useActivityFeed({ )
  workspaceId
  projectId
  userId
  searchTerm
  typeFilter: typeFilter === 'all' ? undefined : typeFilter
  dateFilter: dateFilter === 'all' ? undefined : dateFilter
  actorFilter: actorFilter === 'all' ? undefined : actorFilter }
  realTime
});
  const handleRefresh = useCallback(() => { refreshActivities() }, [refreshActivities]);
  const handleLoadMore = useCallback(() => { if (hasMore && !loading) {
      loadMore() }, [hasMore, loading, loadMore]);
  const renderActivityItem = (activity: ActivityEvent) => {
    const Icon = ACTIVITY_ICONS[activity.type] || Activity;
    const iconColor = ACTIVITY_COLORS[activity.type] || 'text-gray-500';
    return;
      <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        {/* Icon */}
        <div className={`flex-shrink-0 p-1 rounded-full bg-gray-100 ${iconColor}`}>}
          <Icon className="w-4 h-4" />
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {activity.actor_name || 'Unknown User'}
              </span>
              <span className="text-sm text-gray-500">
                {activity.description}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
              {activity.resource_url && ()
                <button
                  onClick={() => window.open(activity.resource_url, '_blank')}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="View resource"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          {/* Details */}
          {activity.details && ()
            <div className="mt-1 text-sm text-gray-600">
              {typeof activity.details === 'string' ? ()
                activity.details
              ) : ()
                <pre className="whitespace-pre-wrap font-sans">
                  {JSON.stringify(activity.details, null, 2)}
                </pre>
              )}
            </div>
          )}
          {/* Metadata */}
          {(activity.project_name || activity.resource_name) && ()
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {activity.project_name && ()
                <span>Project: {activity.project_name}</span>
              )}
              {activity.resource_name && ()
                <span>Resource: {activity.resource_name}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  return;
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>}
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
            {stats && ()
              <span className="text-sm text-gray-500">
                ({stats.total} activities)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Real-time connection indicator */}
            { realTime && ()
              <div className={`w-2 h-2 rounded-full ${
  realTimeConnection?.status === 'connected' ? 'bg-green-400' :
  realTimeConnection?.status === 'connecting' ? 'bg-yellow-400' : }
  'bg-red-400'
`} title={`Connection: ${realTimeConnection?.status || 'disconnected'}`} />}
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Refresh activities"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            </button>
          </div>
        </div>
        {/* Search and Filters */}
        {(showSearch || showFilters) && ()
          <div className="mt-4 space-y-3">
            {/* Search */}
            {showSearch && ()
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            {/* Filters */}
            {showFilters && ()
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  {/* Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as ActivityEventType | 'all')}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All Types</option>
                    <option value="project_created">Project Created</option>
                    <option value="project_updated">Project Updated</option>
                    <option value="comment_added">Comments</option>
                    <option value="member_added">Member Changes</option>
                    <option value="workflow_state_changed">Workflow</option>
                    <option value="version_created">Versions</option>
                    <option value="collaboration_started">Collaboration</option>
                  </select>
                  {/* Date Filter */}
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  {/* Actor Filter */}
                  {actors && actors.length > 0 && ()
                    <select
                      value={actorFilter}
                      onChange={(e) => setActorFilter(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">All Users</option>
                      {actors.map(actor => ()
                        <option key={actor.id} value={actor.id}>
                          {actor.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Activity List */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {loading && activities.length === 0 && ()
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => ()
                <div key={i} className="flex items-start space-x-3 p-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && ()
          <div className="p-8 text-center text-red-500">
            <p>Error loading activities: {error.message}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && activities.length === 0 && ()
          <div className="p-8 text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No activities found</p>
            {(searchTerm || typeFilter !== 'all' || dateFilter !== 'all') && ()
              <p className="text-sm mt-2">Try adjusting your filters</p>
            )}
          </div>
        )}
        {!loading && !error && activities.length > 0 && ()
          <div className="divide-y divide-gray-100">
            {activities.map(renderActivityItem)}
          </div>
        )}
        {/* Load More */}
        {hasMore && !loading && activities.length > 0 && ()
          <div className="p-4 text-center border-t border-gray-200">
            <button
              onClick={handleLoadMore}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Load more activities
            </button>
          </div>
        )}
        {loading && activities.length > 0 && ()
          <div className="p-4 text-center border-t border-gray-200">
            <div className="text-sm text-gray-500">Loading more activities...</div>
          </div>
        )}
      </div>
    </div>
  );
};