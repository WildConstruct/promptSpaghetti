/**
 * Recurring Schedule Manager - Epic 17
 * 
 * Advanced recurring schedule management with pattern builder, conflict detection,
 * and schedule optimization features.
 * 
 * Task: E17-1753114396816-7C558C - Implement recurring schedule options
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
  Repeat,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Search,
  TrendingUp,
  Zap,
  Globe,
  Users,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import { RecurrenceEditor, RecurrenceData } from '../../components/admin/scheduling/RecurrenceEditor';

// Import scheduling models
import {
  ScheduleType,
  RecurrenceType,
  ScheduleAction,
  ScheduleStatus,
  FeatureToggleSchedule
} from '../../../server/src/database/scheduling-models';
interface RecurringSchedule extends FeatureToggleSchedule {
  nextOccurrences: Date;
  conflictCount: number;
  performanceMetrics: {
  successRate: number;
  averageExecutionTime: number;
  lastFailureReason?: string;
};
interface ScheduleConflict {
  id: string;
  scheduleIds: string;
  type: 'time_overlap' | 'action_conflict' | 'resource_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedResolution: string;
  interface RecurringScheduleManagerProps {
  className?: string;
  userId?: string;
  userRole?: string;
  const RECURRENCE_PRESETS = [;
  {
  id: 'daily-business',
  name: 'Daily (Business Days)',
  description: 'Monday to Friday',
  pattern: {
  type: 'weekly' as RecurrenceType,
  interval: 1,
  daysOfWeek: [1, 2, 3, 4, 5],
}
  {
  id: 'weekly-maintenance',
  name: 'Weekly Maintenance',
  description: 'Sunday at 2 AM',
  pattern: {
  type: 'weekly' as RecurrenceType,
  interval: 1,
  daysOfWeek: [0],
}
  {
  id: 'monthly-first',
  name: 'Monthly (First Day)',
  description: '1st of every month',
  pattern: {
  type: 'monthly' as RecurrenceType,
  interval: 1,
  daysOfMonth: [1],
}
  {
  id: 'quarterly',
  name: 'Quarterly',
  description: 'Every 3 months',
  pattern: {
  type: 'monthly' as RecurrenceType,
  interval: 3,
}
  {
    id: 'bi-weekly',
    name: 'Bi-weekly',
    description: 'Every 2 weeks',
    pattern: {
  type: 'weekly' as RecurrenceType,
      interval: 2];
const ACTION_CONFIG = {
  enable: { color: 'text-green-600 bg-green-100', icon: Play, label: 'Enable' },
  disable: { color: 'text-red-600 bg-red-100', icon: Pause, label: 'Disable' },
  update_value: { color: 'text-blue-600 bg-blue-100', icon: Settings, label: 'Update' },
  activate_rollout: { color: 'text-purple-600 bg-purple-100', icon: TrendingUp, label: 'Rollout' },
  modify_percentage: { color: 'text-orange-600 bg-orange-100', icon: Target, label: 'Modify %' }
};
const STATUS_CONFIG = {
  pending: { color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  active: { color: 'text-green-600 bg-green-100', icon: Activity },
  completed: { color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
  cancelled: { color: 'text-gray-600 bg-gray-100', icon: XCircle },
  failed: { color: 'text-red-600 bg-red-100', icon: AlertTriangle },
  paused: { color: 'text-yellow-600 bg-yellow-100', icon: Pause }
};

export const RecurringScheduleManager: React.FC<RecurringScheduleManagerProps> = ({)
  className = '',
  userId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('schedules');
  const [schedules, setSchedules] = useState<RecurringSchedule>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [_____showCreateModal, setShowCreateModal] = useState(false);
  // Mock data - in real implementation, this would fetch from APIs
  const mockSchedules: RecurringSchedule = [
  {
  id: 'schedule-1',
  toggleId: 'maintenance-mode',
  name: 'Weekly Maintenance Window',
  description: 'Enable maintenance mode every Sunday at 2 AM',
  type: ScheduleType.RECURRING,
  action: ScheduleAction.ENABLE,
  startTime: new Date('2024-01-07T02:00:00.000Z'),
  endTime: new Date('2024-01-07T06:00:00.000Z'),
  timezone: 'America/New_York',
  recurrence: {
  type: RecurrenceType.WEEKLY,
  interval: 1,
  daysOfWeek: [0],
},
  actionConfig: {},
      status: ScheduleStatus.ACTIVE,
      enabled: true,
      createdBy: 'admin',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      lastExecution: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      executionCount: 12,
      failureCount: 1,
      priority: 1,
      conflictResolution: 'override',
      nextOccurrences: [,
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        new Date(Date.now() + 16 * 24 * 60 * 60 * 1000)
      ],
      conflictCount: 0,
      performanceMetrics: {
  successRate: 91.7,
  averageExecutionTime: 1.8,
  lastFailureReason: 'Network timeout',
}
    {
  id: 'schedule-2',
  toggleId: 'feature-rollout',
  name: 'Daily Feature Rollout',
  description: 'Gradually increase feature rollout every day at 9 AM',
  type: ScheduleType.RECURRING,
  action: ScheduleAction.MODIFY_PERCENTAGE,
  startTime: new Date('2024-01-15T09:00:00.000Z'),
  timezone: 'UTC',
  recurrence: {
  type: RecurrenceType.DAILY,
  interval: 1,
  endDate: new Date('2024-02-15T00:00:00.000Z'),
},
  actionConfig: {
  rolloutPercentage: 10,
},
  status: ScheduleStatus.ACTIVE,
      enabled: true,
      createdBy: 'devops',
      createdAt: new Date('2024-01-10T00:00:00.000Z'),
      updatedAt: new Date('2024-01-10T00:00:00.000Z'),
      nextExecution: new Date(Date.now() + 14 * 60 * 60 * 1000),
      lastExecution: new Date(Date.now() - 10 * 60 * 60 * 1000),
      executionCount: 25,
      failureCount: 2,
      priority: 2,
      conflictResolution: 'skip',
      nextOccurrences: [,
        new Date(Date.now() + 14 * 60 * 60 * 1000),
        new Date(Date.now() + 38 * 60 * 60 * 1000),
        new Date(Date.now() + 62 * 60 * 60 * 1000)
      ],
      conflictCount: 1,
      performanceMetrics: {
  successRate: 92.0,
  averageExecutionTime: 0.8,
}
    {
  id: 'schedule-3',
  toggleId: 'database-backup',
  name: 'Monthly Database Backup',
  description: 'Enable backup mode on the first of every month',
  type: ScheduleType.RECURRING,
  action: ScheduleAction.ENABLE,
  startTime: new Date('2024-02-01T01:00:00.000Z'),
  endTime: new Date('2024-02-01T03:00:00.000Z'),
  timezone: 'UTC',
  recurrence: {
  type: RecurrenceType.MONTHLY,
  interval: 1,
  daysOfMonth: [1],
},
  actionConfig: {},
      status: ScheduleStatus.PENDING,
      enabled: true,
      createdBy: 'admin',
      createdAt: new Date('2024-01-20T00:00:00.000Z'),
      updatedAt: new Date('2024-01-20T00:00:00.000Z'),
      nextExecution: new Date('2024-02-01T01:00:00.000Z'),
      executionCount: 0,
      failureCount: 0,
      priority: 3,
      conflictResolution: 'skip',
      nextOccurrences: [,
        new Date('2024-02-01T01:00:00.000Z'),
        new Date('2024-03-01T01:00:00.000Z'),
        new Date('2024-04-01T01:00:00.000Z')
      ],
      conflictCount: 0,
      performanceMetrics: {
  successRate: 0,
  averageExecutionTime: 0];
  const mockConflicts: ScheduleConflict = [
  {
  id: 'conflict-1',
  scheduleIds: ['schedule-2', 'schedule-4'],
  type: 'time_overlap',
  severity: 'medium',
  description: 'Feature rollout and maintenance window overlap on Sundays at 9 AM',
  suggestedResolution: 'Reschedule feature rollout to 10 AM on Sundays'];
  useEffect(() => {
  const loadData = async () => {
  setLoading(true);
  await new Promise(resolve => setTimeout(resolve, 1000));
  setSchedules(mockSchedules);
  setConflicts(mockConflicts);
  setLoading(false);
};
    loadData();
  }, []);
  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {)
  const matchesSearch = searchQuery === '' || ;
        schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.toggleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
      const matchesAction = actionFilter === 'all' || schedule.action === actionFilter;
      return matchesSearch && matchesStatus && matchesAction;
    });
  }, [schedules, searchQuery, statusFilter, actionFilter]);
  const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {)
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(date);
  };
  const getRecurrenceDescription = (recurrence: RecurrenceData): string => {
    const { type, interval, daysOfWeek, daysOfMonth, _____monthsOfYear } = recurrence;
    switch (type) {
    case 'daily':
      return interval === 1 ? 'Every day' : `Every ${interval} days`;}
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = daysOfWeek.map(d => dayNames[d]).join(', ');
        return interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;}
      return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;}
    case 'monthly':
      if (daysOfMonth && daysOfMonth.length > 0) {
        const days = daysOfMonth.join(', ');
        return interval === 1 ? `Monthly on day ${days}` : `Every ${interval} months on day ${days}`;}
      return interval === 1 ? 'Monthly' : `Every ${interval} months`;}
    case 'yearly':
      return interval === 1 ? 'Yearly' : `Every ${interval} years`;}
    case 'custom':
      return recurrence.cronExpression || 'Custom pattern';
    default:
      return 'Unknown pattern';
  };
  const handlePauseSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => )
      s.id === scheduleId ? { ...s, status: ScheduleStatus.PAUSED } : s
    ));
  };
  const handleResumeSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => )
      s.id === scheduleId ? { ...s, status: ScheduleStatus.ACTIVE } : s
    ));
  };
  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
  };
  const handleDuplicateSchedule = (scheduleId: string) => {
    const originalSchedule = schedules.find(s => s.id === scheduleId);
    if (originalSchedule) {
      const duplicatedSchedule: RecurringSchedule = {
        ...originalSchedule,
        id: `schedule-${Date.now()}`}
},
  name: `${originalSchedule.name} (Copy)`}
},
  status: ScheduleStatus.PENDING,
        executionCount: 0,
        failureCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        nextExecution: undefined,
        lastExecution: undefined,
        performanceMetrics: {
  successRate: 0,
  averageExecutionTime: 0,
};
      setSchedules(prev => [...prev, duplicatedSchedule]);
  };
  if (loading) {
    return;
      <div className={`p-6 ${className}`}>}
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading recurring schedules...</span>
        </div>
      </div>
    );
  return;
    <div className={`p-6 space-y-6 ${className}`}>}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recurring Schedules</h1>
          <p className="text-gray-600 mt-1">
            Manage recurring schedules with advanced pattern configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Recurring Schedule
          </Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Builder</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts ({conflicts.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search recurring schedules..."
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
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <option value="all">All Actions</option>
              <option value="enable">Enable</option>
              <option value="disable">Disable</option>
              <option value="update_value">Update Value</option>
              <option value="modify_percentage">Modify Percentage</option>
              <option value="activate_rollout">Activate Rollout</option>
            </Select>
          </div>
          {/* Schedule List */}
          <div className="space-y-4">
            {filteredSchedules.map((schedule) => {
              const ActionIcon = ACTION_CONFIG[schedule.action].icon;
              const StatusIcon = STATUS_CONFIG[schedule.status].icon;
              return;
                <Card key={schedule.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Repeat className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{schedule.name}</h3>
                            {schedule.conflictCount > 0 && ()
                              <Badge variant="destructive" className="text-xs">
                                {schedule.conflictCount} conflicts
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{schedule.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Toggle:</span>
                              <p className="text-gray-900">{schedule.toggleId}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Pattern:</span>
                              <p className="text-gray-900">
                                {schedule.recurrence ? getRecurrenceDescription(schedule.recurrence) : 'No pattern'}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Next Run:</span>
                              <p className="text-gray-900">
                                {schedule.nextExecution ? formatDate(schedule.nextExecution) : 'Not scheduled'}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Success Rate:</span>
                              <p className="text-gray-900">{schedule.performanceMetrics.successRate.toFixed(1)}%</p>
                            </div>
                          </div>
                          {/* Next Occurrences */}
                          <div className="mt-4">
                            <span className="font-medium text-gray-700 text-sm">Next 3 occurrences:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {schedule.nextOccurrences.slice(0, 3).map((date, index) => ()
                                <Badge key={index} variant="outline" className="text-xs">
                                  {formatDate(date)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={ACTION_CONFIG[schedule.action].color}>
                              <ActionIcon className="h-3 w-3 mr-1" />
                              {ACTION_CONFIG[schedule.action].label}
                            </Badge>
                            <Badge className={STATUS_CONFIG[schedule.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {schedule.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {schedule.executionCount} executions, {schedule.failureCount} failed
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {schedule.status === ScheduleStatus.ACTIVE ? ()
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePauseSchedule(schedule.id)}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : ()
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResumeSchedule(schedule.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateSchedule(schedule.id)}
                          >
                            <Copy className="h-4 w-4" />
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        {/* Pattern Builder Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preset Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Pattern Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {RECURRENCE_PRESETS.map((preset) => ()
                    <div key={preset.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{preset.name}</h4>
                          <p className="text-sm text-gray-600">{preset.description}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Use
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Custom Pattern Builder */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Pattern Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <RecurrenceEditor
                  value={{
  type: 'weekly',
  interval: 1,
}}
                  onChange={(recurrence) => {
  console.log('Recurrence updated:', recurrence);
}}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Schedule Conflicts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conflicts.length === 0 ? ()
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">No conflicts detected</p>
                  <p className="text-gray-600">All recurring schedules are properly configured</p>
                </div>
              ) : ()
                <div className="space-y-4">
                  {conflicts.map((conflict) => ()
                    <div key={conflict.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={conflict.severity === 'critical' ? 'destructive' : 'default'}
                              className="text-xs"
                            >
                              {conflict.severity} priority
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {conflict.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-900 mb-1">{conflict.description}</p>
                          <p className="text-sm text-gray-600 mb-3">{conflict.suggestedResolution}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Auto-resolve
                          </Button>
                          <Button size="sm">
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {schedules.filter(s => s.status === ScheduleStatus.ACTIVE).length}
                </div>
                <p className="text-sm text-gray-600">Currently running</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {(schedules.reduce((sum, s) => sum + s.performanceMetrics.successRate, 0) / schedules.length).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Across all schedules</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {schedules.reduce((sum, s) => sum + s.executionCount, 0)}
                </div>
                <p className="text-sm text-gray-600">All time</p>
              </CardContent>
            </Card>
          </div>
          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600">Performance trends chart would be rendered here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecurringScheduleManager;