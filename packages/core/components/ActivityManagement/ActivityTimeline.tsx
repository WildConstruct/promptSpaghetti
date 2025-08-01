/**
 * Enhanced Activity Timeline Component - Epic 17
 * 
 * Comprehensive user activity timeline interface with advanced filtering,
 * real-time updates, collaboration tracking, and analytics.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Clock, 
  User, 
  Users, 
  Activity as ActivityIcon, 
  TrendingUp, 
  Filter, 
  Search, 
  Calendar,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  GitBranch,
  FileText,
  Settings,
  Eye }
  BarChart3
 from 'lucide-react';
import { activityTimeline,
  ActivityEvent,
  ActivityFilter,
  ActivityStats,
  ActivityType,
  ActivityCategory as _ActivityCategory,
  ActivityImpact }
  ActivitySource as _ActivitySource
 from '../../services/ActivityTimeline';


interface ActivityTimelineProps { userId?: string;
  workspaceId?: string;
  projectId?: string;
  compact?: boolean;
  showStats?: boolean;
  showFilters?: boolean;
  maxItems?: number;
  className?: string;
  /**
  * Activity type configurations for UI styling
  */
  const ACTIVITY_TYPE_CONFIG = {
  user_interaction: {;
  icon: User;
  color: 'text-blue-600 bg-blue-50 border-blue-200';
  badgeColor: 'bg-blue-100 text-blue-800' }


},
  system_event: { ,
  icon: Settings,
  color: 'text-gray-600 bg-gray-50 border-gray-200',
  badgeColor: 'bg-gray-100 text-gray-800' }
},
  graph_operation: { ,
  icon: GitBranch,
  color: 'text-green-600 bg-green-50 border-green-200',
  badgeColor: 'bg-green-100 text-green-800' }
},
  file_operation: { ,
  icon: FileText,
  color: 'text-purple-600 bg-purple-50 border-purple-200',
  badgeColor: 'bg-purple-100 text-purple-800' }
},
  collaboration: { ,
  icon: Users,
  color: 'text-orange-600 bg-orange-50 border-orange-200',
  badgeColor: 'bg-orange-100 text-orange-800' }
},
  performance: { ,
  icon: Zap,
  color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  badgeColor: 'bg-yellow-100 text-yellow-800' }
},
  error: { ,
  icon: AlertTriangle,
  color: 'text-red-600 bg-red-50 border-red-200',
  badgeColor: 'bg-red-100 text-red-800' }
},
  authentication: { ,
  icon: User,
  color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  badgeColor: 'bg-indigo-100 text-indigo-800' }
},
  admin: { ,
  icon: Settings,
  color: 'text-gray-700 bg-gray-100 border-gray-300',
  badgeColor: 'bg-gray-200 text-gray-900' }
},
  integration: { ,
  icon: Globe,
  color: 'text-teal-600 bg-teal-50 border-teal-200',
  badgeColor: 'bg-teal-100 text-teal-800' }
};
/**
 * Impact level configurations
 */
const IMPACT_CONFIG = {
  critical: { color: 'text-red-700', badgeColor: 'bg-red-100 text-red-800', priority: 5 },
  high: { color: 'text-orange-700', badgeColor: 'bg-orange-100 text-orange-800', priority: 4 },
  medium: { color: 'text-yellow-700', badgeColor: 'bg-yellow-100 text-yellow-800', priority: 3 },
  low: { color: 'text-blue-700', badgeColor: 'bg-blue-100 text-blue-800', priority: 2 },
  none: { color: 'text-gray-700', badgeColor: 'bg-gray-100 text-gray-800', priority: 1 }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ )
  userId
  workspaceId
  projectId
  compact = false
  showStats = true
  showFilters = true
  maxItems = 50 }
  className
}) => { const [activities, setActivities] = useState<ActivityEvent>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('timeline');
  const [filter, setFilter] = useState<ActivityFilter>({)
  userIds: userId ? [userId] : undefined
  workspaceIds: workspaceId ? [workspaceId] : undefined
  projectIds: projectId ? [projectId] : undefined
  limit: maxItems }
});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityEvent | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  // Load activities and stats
  useEffect(() => { const loadData = () => {
      // Update date range filter
      const now = new Date();
      let startDate: Date;
      switch (dateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
      default:
        startDate = new Date(0);
        break;
      const updatedFilter = {
        ...filter }
        dateRange: dateRange !== 'all' ? { start: startDate, end: now } : undefined,
        searchQuery: searchQuery || undefined;
  };
      setActivities(activityTimeline.getActivities(updatedFilter));
      if (showStats) { setStats(activityTimeline.getActivityStats(updatedFilter)) };
    loadData();
    // Subscribe to real-time updates
    const listenerId = `activity-timeline-${Math.random().toString(36).substr(2, 9)}`;}
    activityTimeline.subscribe(listenerId, (_event) => {
      loadData(); // Refresh data when new activities are tracked
    });
    return () => { activityTimeline.unsubscribe(listenerId) };
  }, [filter, searchQuery, dateRange, maxItems, showStats]);
  // Group activities by date for timeline view
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityEvent> = {};
    activities.forEach(activity => { )
  const dateKey = activity.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      groups[dateKey].push(activity) });
    return groups;
  }, [activities]);
  // Filter update helpers
  const updateFilter = (updates: Partial<ActivityFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };
  const resetFilters = () => { setFilter({)
  userIds: userId ? [userId] : undefined
  workspaceIds: workspaceId ? [workspaceId] : undefined
  projectIds: projectId ? [projectId] : undefined
  limit: maxItems }
});
    setSearchQuery('');
    setDateRange('week');
  };
  return;
    <div className={`activity-timeline space-y-6 ${className}`}>}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userId ? 'User Activity Timeline' : 'Team Activity Timeline'}
          </h2>
          <p className="text-gray-600">
            {activities.length} activities {dateRange !== 'all' && `in the last ${dateRange}`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Clear Filters
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      {/* Statistics Cards */}
      {showStats && stats && !compact && ()
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ActivityIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-900">{stats.uniqueUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Session</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {Math.round(stats.averageSessionDuration / 1000 / 60)}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.peakActivity.hour}:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Filters */}
      {showFilters && !compact && ()
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select
                value={dateRange}
                onValueChange={(value) => setDateRange(value as typeof dateRange)}
              >
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="all">All Time</option>
              </Select>
              <Select
                value={filter.types?.[0] || 'all'}
                onValueChange={ (value) => 
                  updateFilter({ )
                    types: value === 'all' ? undefined : [value as ActivityType]  }
              >
                <option value="all">All Types</option>
                <option value="user_interaction">User Interactions</option>
                <option value="graph_operation">Graph Operations</option>
                <option value="collaboration">Collaboration</option>
                <option value="file_operation">File Operations</option>
                <option value="performance">Performance</option>
                <option value="error">Errors</option>
              </Select>
              <Select
                value={filter.impactLevels?.[0] || 'all'}
                onValueChange={ (value) => 
                  updateFilter({ )
                    impactLevels: value === 'all' ? undefined : [value as ActivityImpact]  }
              >
                <option value="all">All Impact Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
              <div className="flex items-center space-x-2">
                <Button
                  variant={filter.successOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={ () => updateFilter({ )
                    successOnly: filter.successOnly ? undefined : true }
                    errorsOnly: undefined ;
  })}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Success
                </Button>
                <Button
                  variant={filter.errorsOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={ () => updateFilter({ )
                    errorsOnly: filter.errorsOnly ? undefined : true }
                    successOnly: undefined ;
  })}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Errors
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ActivityIcon className="w-5 h-5 mr-2" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              {showStats && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
            </TabsList>
            <TabsContent value="timeline" className="mt-6">
              <TimelineView
                groupedActivities={groupedActivities}
                onSelectActivity={setSelectedActivity}
                compact={compact}
              />
            </TabsContent>
            <TabsContent value="list" className="mt-6">
              <ListView
                activities={activities}
                onSelectActivity={setSelectedActivity}
                compact={compact}
              />
            </TabsContent>
            {showStats && ()
              <TabsContent value="analytics" className="mt-6">
                <AnalyticsView stats={stats} activities={activities} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
      {/* Activity Detail Modal */}
      {selectedActivity && ()
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
};
/**
 * Timeline View Component
 */


interface TimelineViewProps { groupedActivities: Record<string, ActivityEvent>;
  onSelectActivity: (activity: ActivityEvent) => void
  compact: boolean;
  const TimelineView: React.FC<TimelineViewProps> = ({);
  groupedActivities;
  onSelectActivity }
  compact


}) => {
  const dates = Object.keys(groupedActivities).sort((a, b) => ;
    new Date(b).getTime() - new Date(a).getTime()
  );
  if (dates.length === 0) {
    return;
      <div className="text-center py-8">
        <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
        <p className="text-gray-500">Try adjusting your filters to see more results.</p>
      </div>
    );
  return;
    <div className="space-y-8">
      {dates.map(dateKey => ()
        <div key={dateKey}>
          <div className="flex items-center mb-4">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">
              { new Date(dateKey).toLocaleDateString('en-US', {)
  weekday: 'long'
  year: 'numeric'
  month: 'long'
  day: 'numeric' }
})}
            </h3>
            <div className="flex-1 border-t border-gray-200 ml-4" />
            <Badge variant="outline" size="sm">
              {groupedActivities[dateKey].length} events
            </Badge>
          </div>
          <div className="space-y-3">
            {groupedActivities[dateKey].map(activity => ()
              <ActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => onSelectActivity(activity)}
                compact={compact}
                showTimestamp
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
/**
 * List View Component
 */


interface ListViewProps { activities: ActivityEvent;
  onSelectActivity: (activity: ActivityEvent) => void
  compact: boolean;
  const ListView: React.FC<ListViewProps> = ({);
  activities;
  onSelectActivity }
  compact


}) => {
  if (activities.length === 0) {
    return;
      <div className="text-center py-8">
        <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
        <p className="text-gray-500">Try adjusting your filters to see more results.</p>
      </div>
    );
  return;
    <div className="space-y-2">
      {activities.map(activity => ()
        <ActivityCard
          key={activity.id}
          activity={activity}
          onClick={() => onSelectActivity(activity)}
          compact={compact}
          showDate
        />
      ))}
    </div>
  );
};
/**
 * Analytics View Component
 */


interface AnalyticsViewProps { stats: ActivityStats | null }
  activities: ActivityEvent;


const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, _activities }) => {
  if (!stats) return null;
  return;
    <div className="space-y-6">
      {/* Activity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byType)
                .sort(([ a], [ b]) => b - a)
                .map(([type, count]) => ()
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${ACTIVITY_TYPE_CONFIG[type as ActivityType]?.color.split(' ')[1] || 'bg-gray-500'}`} />}
                      <span className="text-sm font-medium capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${ACTIVITY_TYPE_CONFIG[type as ActivityType]?.color.split(' ')[1] || 'bg-gray-500'}`}
                          style={{ width: `${(count / stats.totalEvents) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.mostActiveUsers.slice(0, 5).map(user => ()
                <div key={user.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{user.displayName}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{user.eventCount} events</div>
                    <div className="text-xs text-gray-500">
                      {new Date(user.lastActivity).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-900">
              {Math.round(stats.averageExecutionTime)}ms
            </div>
            <div className="text-sm text-gray-600">Avg Execution Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-900">
              {stats.errorRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-900">
              {stats.cacheHitRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Cache Hit Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
/**
 * Activity Card Component
 */


interface ActivityCardProps { activity: ActivityEvent;
  onClick: () => void;
  compact?: boolean;
  showTimestamp?: boolean;
  showDate?: boolean;
  const ActivityCard: React.FC<ActivityCardProps> = ({);
  activity;
  onClick;
  compact = false;
  showTimestamp = false }
  showDate = false


}) => { const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type];
  const impactConfig = IMPACT_CONFIG[activity.impact];
  const TypeIcon = typeConfig?.icon || ActivityIcon;
  return;
  <div
  className={`border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${ }
  compact ? 'bg-white' : typeConfig?.color || 'bg-gray-50'
`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <TypeIcon className={`w-4 h-4 ${typeConfig?.color.split(' ')[0] || 'text-gray-600'}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-medium truncate">{activity.title}</h4>
            {!compact && ()
              <>
                <Badge className={typeConfig?.badgeColor} size="sm">
                  {activity.type.replace('_', ' ')}
                </Badge>
                {activity.impact !== 'none' && ()
                  <Badge className={impactConfig.badgeColor} size="sm">
                    {activity.impact}
                  </Badge>
                )}
                {!activity.success && ()
                  <Badge className="bg-red-100 text-red-800" size="sm">
                    error
                  </Badge>
                )}
              </>
            )}
          </div>
          {activity.description && ()
            <p className="text-sm text-gray-600 line-clamp-2 mb-1">
              {activity.description}
            </p>
          )}
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>{activity.userDisplayName || activity.userId}</span>
            <span>{activity.source}</span>
            {(showTimestamp || showDate) && ()
              <span>
                {showDate 
                  ? activity.timestamp.toLocaleDateString()
                  : activity.timestamp.toLocaleTimeString()
              </span>
            )}
            {activity.duration && ()
              <span>{activity.duration}ms</span>
            )}
            {activity.collaborators && activity.collaborators.length > 0 && ()
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{activity.collaborators.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * Activity Detail Modal
 */


interface ActivityDetailModalProps { activity: ActivityEvent;
  onClose: () => void;
  const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({);
  activity }
  onClose


}) => {
  const typeConfig = ACTIVITY_TYPE_CONFIG[activity.type];
  const TypeIcon = typeConfig?.icon || ActivityIcon;
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TypeIcon className={`w-6 h-6 ${typeConfig?.color.split(' ')[0] || 'text-gray-600'}`} />}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={typeConfig?.badgeColor}>
                    {activity.type.replace('_', ' ')}
                  </Badge>
                  {activity.impact !== 'none' && ()
                    <Badge className={IMPACT_CONFIG[activity.impact].badgeColor}>
                      {activity.impact}
                    </Badge>
                  )}
                  <Badge className={activity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {activity.success ? 'success' : 'error'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <div className="space-y-6">
            {activity.description && ()
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{activity.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Basic Info</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">User:</span> {activity.userDisplayName || activity.userId}</div>
                  <div><span className="font-medium">Action:</span> {activity.action}</div>
                  <div><span className="font-medium">Source:</span> {activity.source}</div>
                  <div><span className="font-medium">Category:</span> {activity.category}</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Timing</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">Timestamp:</span> {activity.timestamp.toLocaleString()}</div>
                  {activity.duration && ()
                    <div><span className="font-medium">Duration:</span> {activity.duration}ms</div>
                  )}
                  {activity.sessionId && ()
                    <div><span className="font-medium">Session:</span> {activity.sessionId.slice(-8)}</div>
                  )}
                </div>
              </div>
            </div>
            {activity.resource && ()
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Resource</h3>
                <p className="text-sm text-gray-600">{activity.resource}</p>
                {activity.resourceId && ()
                  <p className="text-xs text-gray-500 mt-1">ID: {activity.resourceId}</p>
                )}
              </div>
            )}
            {activity.collaborators && activity.collaborators.length > 0 && ()
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Collaborators</h3>
                <div className="flex flex-wrap gap-1">
                  {activity.collaborators.map(collaborator => ()
                    <Badge key={collaborator} variant="outline" size="sm">
                      {collaborator}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {activity.tags.length > 0 && ()
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {activity.tags.map(tag => ()
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {Object.keys(activity.details).length > 0 && ()
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Details</h3>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(activity.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;