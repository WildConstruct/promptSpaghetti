/**
 * Schedule Management Dashboard - Epic 17
 * 
 * Unified interface for managing both Feature Toggle Scheduling and Content Scheduling
 * with comprehensive scheduling operations, analytics, and monitoring.
 * 
 * Task: E17-1753114396819-3556E5 - Develop schedule management
 * Epic: 17 - Backstage Admin Controls
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  Calendar,
  Clock,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Edit,
  Eye,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Activity,
  Zap,
  Target,
  Globe,
  Archive,
  Trash2
} from 'lucide-react';

// Import scheduling services
import {
  contentSchedulingService,
  ContentItem,
  SchedulingStats as ContentStats
} from '../../services/ContentSchedulingService';
}
interface ScheduleItem {
  id: string;
  name: string;
  type: 'feature_toggle' | 'content';
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
  nextExecution?: Date;
  lastExecution?: Date;
  createdAt: Date;
  createdBy: string;
  // Feature toggle specific
  toggleId?: string;
  action?: string;
  // Content specific
  contentId?: string;
  contentType?: string;
  operation?: string;
  interface ScheduleAnalytics {
  totalSchedules: number;
  activeSchedules: number;
  completedToday: number;
  failedToday: number;
  upcomingIn24h: number;
  // Performance metrics
  successRate: number;
  averageExecutionTime: number;
  // Type breakdown
  featureToggleSchedules: number;
  contentSchedules: number;
  // Recent executions
  recentExecutions: Array<{
  id: string;
  name: string;
  type: string;
  status: 'success' | 'failed';
  executedAt: Date;
  duration: number;
}
}>;
  // Upcoming schedules
  upcomingSchedules: Array<{
  id: string;
  name: string;
  type: string;
  nextExecution: Date;
}>;
}
interface ScheduleManagementDashboardProps {
  className?: string;
  userId?: string;
  userRole?: string;
const STATUS_CONFIG = {
}
  pending: { color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  active: { color: 'text-blue-600 bg-blue-100', icon: PlayCircle },
  completed: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
  failed: { color: 'text-red-600 bg-red-100', icon: XCircle },
  cancelled: { color: 'text-gray-600 bg-gray-100', icon: StopCircle }
};
const TYPE_CONFIG = {
  feature_toggle: { color: 'text-blue-600 bg-blue-100', icon: Zap, label: 'Feature Toggle' },
  content: { color: 'text-green-600 bg-green-100', icon: FileText, label: 'Content' }
};

export const ScheduleManagementDashboard: React.FC<ScheduleManagementDashboardProps> = ({)
  className = '',
  userId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [schedules, setSchedules] = useState<ScheduleItem>([]);
  const [analytics, setAnalytics] = useState<ScheduleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  // Mock data - in real implementation, this would fetch from APIs
  const mockSchedules: ScheduleItem = [
  {
  id: 'schedule-1',
  name: 'Weekly Maintenance Window',
  type: 'feature_toggle',
  status: 'active',
  toggleId: 'maintenance-mode',
  action: 'enable',
  nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  lastExecution: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  createdBy: 'admin',
}
    {
  id: 'schedule-2',
  name: 'Blog Post Publication',
  type: 'content',
  status: 'pending',
  contentId: 'post-123',
  contentType: 'blog_post',
  operation: 'publish',
  nextExecution: new Date(Date.now() + 6 * 60 * 60 * 1000),
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  createdBy: 'editor',
}
    {
  id: 'schedule-3',
  name: 'Feature Rollout - 50%',
  type: 'feature_toggle',
  status: 'completed',
  toggleId: 'new-dashboard',
  action: 'update_percentage',
  lastExecution: new Date(Date.now() - 4 * 60 * 60 * 1000),
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  createdBy: 'devops'];
  const mockAnalytics: ScheduleAnalytics = {,
  totalSchedules: 45,
  activeSchedules: 12,
  completedToday: 8,
  failedToday: 2,
  upcomingIn24h: 5,
  successRate: 94.2,
  averageExecutionTime: 1.8,
  featureToggleSchedules: 28,
  contentSchedules: 17,
  recentExecutions: [,
  {
  id: 'exec-1',
  name: 'Feature Rollout - 50%',
  type: 'Feature Toggle',
  status: 'success',
  executedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  duration: 1.2,
}
      {
  id: 'exec-2',
  name: 'Newsletter Send',
  type: 'Content',
  status: 'success',
  executedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  duration: 2.5,
}
      {
  id: 'exec-3',
  name: 'Database Maintenance',
  type: 'Feature Toggle',
  status: 'failed',
  executedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  duration: 0.3],
  upcomingSchedules: [,
  {
  id: 'upcoming-1',
  name: 'Blog Post Publication',
  type: 'Content',
  nextExecution: new Date(Date.now() + 6 * 60 * 60 * 1000),
}
      {
  id: 'upcoming-2',
  name: 'Weekly Maintenance',
  type: 'Feature Toggle',
  nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)];
  };
  useEffect(() => {
    // Simulate loading schedules and analytics
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSchedules(mockSchedules);
      setAnalytics(mockAnalytics);
      setLoading(false);
    };
    loadData();
  }, []);
  // Filter schedules based on search and filters
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {)
  const matchesSearch = searchQuery === '' || ;
        schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
      const matchesType = typeFilter === 'all' || schedule.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [schedules, searchQuery, statusFilter, typeFilter]);
  const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {)
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(date);
  };
  const formatDuration = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;}
  };
  const handleExecuteSchedule = (scheduleId: string) => {
    // Implementation for manual schedule execution
    console.log(`Executing schedule: ${scheduleId}`);}
  };
  const handlePauseSchedule = (scheduleId: string) => {
    // Implementation for pausing schedule
    console.log(`Pausing schedule: ${scheduleId}`);}
  };
  const handleDeleteSchedule = (scheduleId: string) => {
    // Implementation for deleting schedule
    console.log(`Deleting schedule: ${scheduleId}`);}
  };
  if (loading) {
    return;
      <div className={`p-6 ${className}`}>}
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading schedule management...</span>
        </div>
      </div>
    );
  return;
    <div className={`p-6 space-y-6 ${className}`}>}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-1">
            Unified dashboard for Feature Toggle and Content Scheduling
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {analytics && ()
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Schedules</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics.totalSchedules}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Schedules</p>
                        <p className="text-3xl font-bold text-green-600">{analytics.activeSchedules}</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-3xl font-bold text-green-600">{analytics.successRate}%</p>
                      </div>
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Upcoming (24h)</p>
                        <p className="text-3xl font-bold text-orange-600">{analytics.upcomingIn24h}</p>
                      </div>
                      <Bell className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Recent Activity & Upcoming */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Executions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Executions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.recentExecutions.map((execution) => ()
                        <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{execution.name}</p>
                            <p className="text-sm text-gray-600">{execution.type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={execution.status === 'success' ? 'success' : 'destructive'}
                            >
                              {execution.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDuration(execution.duration)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {/* Upcoming Schedules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Upcoming Schedules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.upcomingSchedules.map((schedule) => ()
                        <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{schedule.name}</p>
                            <p className="text-sm text-gray-600">{schedule.type}</p>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(schedule.nextExecution)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search schedules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <option value="all">All Types</option>
              <option value="feature_toggle">Feature Toggle</option>
              <option value="content">Content</option>
            </Select>
          </div>
          {/* Schedule List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => {
                  const StatusIcon = STATUS_CONFIG[schedule.status].icon;
                  const TypeIcon = TYPE_CONFIG[schedule.type].icon;
                  return;
                    <div key={schedule.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <TypeIcon className="h-5 w-5 text-gray-600" />
                            <div>
                              <h3 className="text-lg font-medium">{schedule.name}</h3>
                              <p className="text-sm text-gray-600">
                                Created by {schedule.createdBy} on {formatDate(schedule.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {schedule.nextExecution ? 
                                `Next: ${formatDate(schedule.nextExecution)}` :}
                                schedule.lastExecution ?
                                  `Last: ${formatDate(schedule.lastExecution)}` :}
                                  'No execution'
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={TYPE_CONFIG[schedule.type].color}>
                                {TYPE_CONFIG[schedule.type].label}
                              </Badge>
                              <Badge className={STATUS_CONFIG[schedule.status].color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {schedule.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExecuteSchedule(schedule.id)}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePauseSchedule(schedule.id)}
                            >
                              <PauseCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && ()
            <>
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {analytics.successRate}%
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on last 30 days
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Avg Execution Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.averageExecutionTime}s
                    </div>
                    <p className="text-sm text-gray-600">
                      Average across all schedules
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Feature Toggle</span>
                        <span className="font-medium">{analytics.featureToggleSchedules}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Content</span>
                        <span className="font-medium">{analytics.contentSchedules}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Execution Timeline Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Execution Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-600">Execution timeline chart would be rendered here</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Management Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Default Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Timezone
                    </label>
                    <Select defaultValue="UTC">
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Execution Timeout (minutes)
                    </label>
                    <Input type="number" defaultValue="30" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Notification Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Email notifications for failed executions</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Slack notifications for critical failures</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span>Daily summary reports</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleManagementDashboard;