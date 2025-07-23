// Epic 9.4.6 - Scheduled Execution Manager Component
// UI component for managing scheduled workflow executions

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores/workflowStore';

interface ScheduledExecution {
  id: string;
  workspace_id: string;
  resource_id: string;
  schedule_name: string;
  schedule_type: 'cron' | 'interval' | 'once';
  schedule_expression: string;
  action_type: 'state_transition' | 'approval_request' | 'custom';
  action_config: Record<string, any>;
  enabled: boolean;
  next_run_at?: Date;
  last_run_at?: Date;
  run_count: number;
  max_runs?: number;
  retry_count: number;
  max_retries: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface ExecutionLog {
  id: string;
  schedule_id: string;
  execution_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: Date;
  completed_at?: Date;
  result_data: Record<string, any>;
  error_message?: string;
  execution_time_ms?: number;
  retry_attempt: number;
  next_retry_at?: Date;
}

interface ScheduledExecutionManagerProps {
  workspaceId: string;
  resourceId?: string;
  onClose?: () => void;
}

type TabType = 'schedules' | 'executions' | 'logs';

export const ScheduledExecutionManager: React.FC<ScheduledExecutionManagerProps> = ({
  workspaceId,
  resourceId,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('schedules');
  const [schedules, setSchedules] = useState<ScheduledExecution[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledExecution | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Load schedules and execution logs
  useEffect(() => {
    loadSchedules();
    loadExecutionLogs();
  }, [workspaceId]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const mockSchedules: ScheduledExecution[] = [
        {
          id: '1',
          workspace_id: workspaceId,
          resource_id: resourceId || 'resource-1',
          schedule_name: 'Daily Status Check',
          schedule_type: 'cron',
          schedule_expression: '0 9 * * *', // 9 AM daily
          action_type: 'state_transition',
          action_config: {
            to_state_id: 'review-state',
            comment: 'Automated daily review trigger'
          },
          enabled: true,
          next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow 9 AM
          last_run_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday 9 AM
          run_count: 15,
          max_runs: undefined,
          retry_count: 0,
          max_retries: 3,
          created_by: 'user1',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-20')
        },
        {
          id: '2',
          workspace_id: workspaceId,
          resource_id: resourceId || 'resource-2',
          schedule_name: 'Weekly Report Generation',
          schedule_type: 'cron',
          schedule_expression: '0 0 * * 0', // Sunday midnight
          action_type: 'custom',
          action_config: {
            action: 'generate_report',
            report_type: 'weekly_summary',
            email_recipients: ['admin@example.com']
          },
          enabled: true,
          next_run_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next Sunday
          last_run_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last Sunday
          run_count: 8,
          max_runs: undefined,
          retry_count: 1,
          max_retries: 3,
          created_by: 'user2',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-15')
        },
        {
          id: '3',
          workspace_id: workspaceId,
          resource_id: resourceId || 'resource-3',
          schedule_name: 'One-time Migration',
          schedule_type: 'once',
          schedule_expression: '2024-01-25T15:00:00Z',
          action_type: 'custom',
          action_config: {
            action: 'migrate_data',
            source: 'old_system',
            target: 'new_system'
          },
          enabled: false,
          next_run_at: new Date('2024-01-25T15:00:00Z'),
          last_run_at: undefined,
          run_count: 0,
          max_runs: 1,
          retry_count: 0,
          max_retries: 3,
          created_by: 'user3',
          created_at: new Date('2024-01-20'),
          updated_at: new Date('2024-01-20')
        }
      ];
      setSchedules(mockSchedules);
    } catch (error) {
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const loadExecutionLogs = async () => {
    try {
      // Mock API call - replace with actual API
      const mockLogs: ExecutionLog[] = [
        {
          id: '1',
          schedule_id: '1',
          execution_id: 'exec-1',
          status: 'completed',
          started_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5000),
          result_data: {
            state_changed: true,
            new_state: 'review',
            affected_resources: 1
          },
          execution_time_ms: 5000,
          retry_attempt: 0
        },
        {
          id: '2',
          schedule_id: '2',
          execution_id: 'exec-2',
          status: 'failed',
          started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30000),
          result_data: {},
          error_message: 'Failed to generate report: Database connection timeout',
          execution_time_ms: 30000,
          retry_attempt: 1,
          next_retry_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000)
        },
        {
          id: '3',
          schedule_id: '1',
          execution_id: 'exec-3',
          status: 'running',
          started_at: new Date(Date.now() - 2 * 60 * 1000),
          result_data: {},
          retry_attempt: 0
        }
      ];
      setExecutionLogs(mockLogs);
    } catch (error) {
      setError('Failed to load execution logs');
    }
  };

  const handleCreateSchedule = async (scheduleData: Partial<ScheduledExecution>) => {
    try {
      // Mock API call - replace with actual API
      const newSchedule: ScheduledExecution = {
        id: Date.now().toString(),
        workspace_id: workspaceId,
        resource_id: resourceId || 'default',
        schedule_name: scheduleData.schedule_name || 'New Schedule',
        schedule_type: scheduleData.schedule_type || 'cron',
        schedule_expression: scheduleData.schedule_expression || '0 0 * * *',
        action_type: scheduleData.action_type || 'state_transition',
        action_config: scheduleData.action_config || {},
        enabled: scheduleData.enabled !== false,
        run_count: 0,
        max_runs: scheduleData.max_runs,
        retry_count: 0,
        max_retries: scheduleData.max_retries || 3,
        created_by: 'current_user',
        created_at: new Date(),
        updated_at: new Date()
      };
      setSchedules(prev => [...prev, newSchedule]);
      setShowCreateSchedule(false);
    } catch (error) {
      setError('Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      // Mock API call - replace with actual API
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      setShowDeleteConfirm(null);
    } catch (error) {
      setError('Failed to delete schedule');
    }
  };

  const handleToggleSchedule = async (scheduleId: string) => {
    try {
      // Mock API call - replace with actual API
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      ));
    } catch (error) {
      setError('Failed to toggle schedule');
    }
  };

  const handleRunNow = async (scheduleId: string) => {
    try {
      // Mock API call - replace with actual API
      const newLog: ExecutionLog = {
        id: Date.now().toString(),
        schedule_id: scheduleId,
        execution_id: `exec-${Date.now()}`,
        status: 'running',
        started_at: new Date(),
        result_data: {},
        retry_attempt: 0
      };
      setExecutionLogs(prev => [newLog, ...prev]);
      
      // Simulate completion after 3 seconds
      setTimeout(() => {
        setExecutionLogs(prev => prev.map(log => 
          log.id === newLog.id 
            ? { 
              ...log, 
              status: 'completed', 
              completed_at: new Date(),
              execution_time_ms: 3000,
              result_data: { manual_execution: true }
            }
            : log
        ));
      }, 3000);
    } catch (error) {
      setError('Failed to run schedule');
    }
  };

  const formatCronExpression = (expression: string) => {
    // Basic cron expression formatting
    const parts = expression.split(' ');
    if (parts.length === 5) {
      const [minute, hour, day, month, dayOfWeek] = parts;
      if (minute === '0' && hour === '0' && day === '*' && month === '*' && dayOfWeek === '*') {
        return 'Daily at midnight';
      }
      if (minute === '0' && hour === '9' && day === '*' && month === '*' && dayOfWeek === '*') {
        return 'Daily at 9:00 AM';
      }
      if (minute === '0' && hour === '0' && day === '*' && month === '*' && dayOfWeek === '0') {
        return 'Weekly on Sunday at midnight';
      }
    }
    return expression;
  };

  const formatScheduleExpression = (schedule: ScheduledExecution) => {
    switch (schedule.schedule_type) {
    case 'cron':
      return formatCronExpression(schedule.schedule_expression);
    case 'interval':
      return `Every ${schedule.schedule_expression}`;
    case 'once':
      return `Once at ${new Date(schedule.schedule_expression).toLocaleString()}`;
    default:
      return schedule.schedule_expression;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'running': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ___getStatusIcon = (status: string) => {
    switch (status) {
    case 'running': return <PlayIcon className="h-4 w-4 text-blue-600" />;
    case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
    case 'failed': return <XCircleIcon className="h-4 w-4 text-red-600" />;
    case 'cancelled': return <StopIcon className="h-4 w-4 text-gray-600" />;
    default: return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const renderSchedulesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scheduled Executions</h3>
        <button
          onClick={() => setShowCreateSchedule(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Schedule</span>
        </button>
      </div>

      <div className="space-y-3">
        {schedules.map(schedule => (
          <div key={schedule.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{schedule.schedule_name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    schedule.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    {schedule.schedule_type.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatScheduleExpression(schedule)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CogIcon className="h-4 w-4" />
                    <span>{schedule.action_type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                  <span>Runs: {schedule.run_count}{schedule.max_runs ? `/${schedule.max_runs}` : ''}</span>
                  <span>Next: {schedule.next_run_at?.toLocaleString() || 'N/A'}</span>
                  <span>Last: {schedule.last_run_at?.toLocaleString() || 'Never'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRunNow(schedule.id)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Run now"
                >
                  <PlayIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggleSchedule(schedule.id)}
                  className={`p-2 rounded-md transition-colors ${
                    schedule.enabled
                      ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                      : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                  }`}
                  title={schedule.enabled ? 'Disable' : 'Enable'}
                >
                  {schedule.enabled ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(schedule.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No scheduled executions found. Create your first schedule to get started.</p>
        </div>
      )}
    </div>
  );

  const renderExecutionLogsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Execution Logs</h3>
      
      <div className="space-y-3">
        {executionLogs.map(log => (
          <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(log.status)}`}>
                    {log.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    Schedule: {schedules.find(s => s.id === log.schedule_id)?.schedule_name || 'Unknown'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Execution ID: {log.execution_id}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span>Started: {log.started_at.toLocaleString()}</span>
                  {log.completed_at && (
                    <span>Completed: {log.completed_at.toLocaleString()}</span>
                  )}
                  {log.execution_time_ms && (
                    <span>Duration: {(log.execution_time_ms / 1000).toFixed(2)}s</span>
                  )}
                  {log.retry_attempt > 0 && (
                    <span>Retry: {log.retry_attempt}</span>
                  )}
                </div>
                {log.error_message && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    {log.error_message}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleLogExpansion(log.id)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {expandedLogs.has(log.id) ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            {expandedLogs.has(log.id) && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h5 className="font-medium text-sm mb-2">Execution Details</h5>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify({
                    execution_id: log.execution_id,
                    schedule_id: log.schedule_id,
                    status: log.status,
                    started_at: log.started_at,
                    completed_at: log.completed_at,
                    execution_time_ms: log.execution_time_ms,
                    retry_attempt: log.retry_attempt,
                    result_data: log.result_data,
                    error_message: log.error_message
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {executionLogs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No execution logs found.</p>
        </div>
      )}
    </div>
  );

  const renderStatisticsTab = () => {
    const totalExecutions = executionLogs.length;
    const completedExecutions = executionLogs.filter(log => log.status === 'completed').length;
    const ___failedExecutions = executionLogs.filter(log => log.status === 'failed').length;
    const successRate = totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : '0';
    const avgExecutionTime = executionLogs
      .filter(log => log.execution_time_ms)
      .reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / 
      executionLogs.filter(log => log.execution_time_ms).length || 0;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Execution Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Schedules</div>
                <div className="text-2xl font-bold text-gray-900">{schedules.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Executions</div>
                <div className="text-2xl font-bold text-gray-900">{totalExecutions}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Success Rate</div>
                <div className="text-2xl font-bold text-gray-900">{successRate}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Avg Duration</div>
                <div className="text-2xl font-bold text-gray-900">
                  {avgExecutionTime ? `${(avgExecutionTime / 1000).toFixed(1)}s` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-4">Schedule Status</h4>
          <div className="space-y-2">
            {schedules.map(schedule => (
              <div key={schedule.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{schedule.schedule_name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    schedule.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {schedule.run_count} runs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'schedules', label: 'Schedules', icon: ClockIcon },
    { id: 'logs', label: 'Execution Logs', icon: EyeIcon },
    { id: 'statistics', label: 'Statistics', icon: CogIcon }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Scheduled Executions</h2>
              <p className="text-sm text-gray-500">
                Manage automated workflow executions and schedules
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'schedules' && renderSchedulesTab()}
            {activeTab === 'logs' && renderExecutionLogsTab()}
            {activeTab === 'statistics' && renderStatisticsTab()}
          </>
        )}
      </div>

      {/* Create Schedule Modal */}
      {showCreateSchedule && (
        <CreateScheduleModal
          onClose={() => setShowCreateSchedule(false)}
          onSubmit={handleCreateSchedule}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteScheduleModal
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDeleteSchedule(showDeleteConfirm)}
        />
      )}
    </div>
  );
};

// Sub-components for modals
const CreateScheduleModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: Partial<ScheduledExecution>) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    schedule_name: '',
    schedule_type: 'cron' as 'cron' | 'interval' | 'once',
    schedule_expression: '0 9 * * *', // 9 AM daily
    action_type: 'state_transition' as 'state_transition' | 'approval_request' | 'custom',
    action_config: {},
    enabled: true,
    max_runs: undefined as number | undefined,
    max_retries: 3
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create Schedule</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Name
            </label>
            <input
              type="text"
              value={formData.schedule_name}
              onChange={(e) => setFormData(prev => ({ ...prev, schedule_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Type
            </label>
            <select
              value={formData.schedule_type}
              onChange={(e) => setFormData(prev => ({ ...prev, schedule_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="cron">Cron Expression</option>
              <option value="interval">Interval</option>
              <option value="once">One Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Expression
            </label>
            <input
              type="text"
              value={formData.schedule_expression}
              onChange={(e) => setFormData(prev => ({ ...prev, schedule_expression: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder={formData.schedule_type === 'cron' ? '0 9 * * *' : 
                formData.schedule_type === 'interval' ? '1 hour' : 
                  '2024-01-25T15:00:00Z'}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.schedule_type === 'cron' && 'Cron format: minute hour day month dayOfWeek'}
              {formData.schedule_type === 'interval' && 'Interval format: "5 minutes", "1 hour", "2 days"'}
              {formData.schedule_type === 'once' && 'ISO 8601 datetime format'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={formData.action_type}
              onChange={(e) => setFormData(prev => ({ ...prev, action_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="state_transition">State Transition</option>
              <option value="approval_request">Approval Request</option>
              <option value="custom">Custom Action</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Runs (optional)
            </label>
            <input
              type="number"
              value={formData.max_runs || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, max_runs: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Retries
            </label>
            <input
              type="number"
              value={formData.max_retries}
              onChange={(e) => setFormData(prev => ({ ...prev, max_retries: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="10"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
              Enable schedule immediately
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteScheduleModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
}> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Delete Schedule</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this schedule? This action cannot be undone and will stop all future executions.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduledExecutionManager;