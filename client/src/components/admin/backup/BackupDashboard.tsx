/**
 * Backup Dashboard - E17-1753114397268-242256
 * 
 * Administrative interface for backup configuration and management
 * Part of Epic 17.4.6 - Backup System (Backstage Admin Controls)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { 
  Database,
  Save,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  HardDrive,
  Activity,
  TrendingUp,
  BarChart3,
  Eye,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Copy,
  Archive,
  CloudUpload,
  Server,
  Timer,
  Users,
  Lock,
  Key,
  FileText,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';

// Types extending Epic 19 backup infrastructure for admin use
export interface AdminBackupConfiguration {
  config_id: string;
  name: string;
  description: string;
  enabled: boolean;
  backup_type: 'full' | 'incremental' | 'differential';
  
  // Schedule configuration
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time_of_day: string; // HH:MM format
    days_of_week?: number[]; // 0-6 for weekly
    day_of_month?: number; // 1-31 for monthly
    timezone: string;
  };
  
  // Data scope
  data_scope: {
    include_admin_configs: boolean;
    include_user_permissions: boolean;
    include_system_settings: boolean;
    include_audit_logs: boolean;
    include_marketplace_data: boolean;
    custom_tables: string[];
    exclude_tables: string[];
  };
  
  // Retention policy
  retention_policy: {
    keep_hourly: number; // hours
    keep_daily: number; // days  
    keep_weekly: number; // weeks
    keep_monthly: number; // months
    compliance_hold_days?: number;
    archive_after_days?: number;
  };
  
  // Storage configuration
  storage: {
    provider: 'local' | 'aws_s3' | 'gcp_storage' | 'azure_blob';
    location: string;
    encryption_enabled: boolean;
    compression_enabled: boolean;
    storage_class?: string;
  };
  
  // Notification settings
  notifications: {
    on_success: boolean;
    on_failure: boolean;
    on_completion: boolean;
    recipients: string[];
    slack_webhook?: string;
    email_template?: string;
  };
  
  created_by: string;
  created_at: Date;
  updated_at: Date;
  last_run_at?: Date;
  next_run_at?: Date;
}

export interface BackupExecution {
  execution_id: string;
  config_id: string;
  recovery_point_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  
  started_at: Date;
  completed_at?: Date;
  duration_seconds?: number;
  
  backup_size_bytes?: number;
  compressed_size_bytes?: number;
  record_count?: number;
  
  progress: {
    current_step: string;
    steps_completed: number;
    total_steps: number;
    percentage: number;
    estimated_remaining_seconds?: number;
  };
  
  error_details?: {
    error_code: string;
    error_message: string;
    stack_trace?: string;
    retry_count: number;
  };
  
  validation_results?: {
    checksum_valid: boolean;
    record_counts_match: boolean;
    schema_valid: boolean;
    integrity_score: number;
  };
}

export interface BackupMetrics {
  total_configurations: number;
  active_configurations: number;
  total_recovery_points: number;
  total_storage_bytes: number;
  
  recent_executions: {
    successful: number;
    failed: number;
    average_duration_minutes: number;
    last_24h_count: number;
  };
  
  storage_breakdown: {
    provider: string;
    size_bytes: number;
    cost_estimate?: number;
    usage_percentage: number;
  }[];
  
  upcoming_backups: {
    config_name: string;
    next_run: Date;
    estimated_duration: number;
  }[];
  
  health_status: {
    overall_status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  };
}

const BackupDashboard: React.FC = () => {
  // State management
  const [configurations, setConfigurations] = useState<AdminBackupConfiguration[]>([]);
  const [executions, setExecutions] = useState<BackupExecution[]>([]);
  const [metrics, setMetrics] = useState<BackupMetrics | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load dashboard data
  useEffect(() => {
    loadBackupData();
    const interval = setInterval(loadBackupData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadBackupData = async () => {
    setLoading(true);
    try {
      const [configsRes, executionsRes, metricsRes] = await Promise.all([
        fetch('/api/admin/backup/configurations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch('/api/admin/backup/executions?limit=50', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch('/api/admin/backup/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
      ]);

      if (configsRes.ok) setConfigurations(await configsRes.json());
      if (executionsRes.ok) setExecutions(await executionsRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
    } catch (error) {
      console.error('Failed to load backup data:', error);
    }
    setLoading(false);
  };

  const handleRunBackup = async (configId: string) => {
    try {
      const response = await fetch(`/api/admin/backup/configurations/${configId}/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      if (response.ok) {
        loadBackupData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to run backup:', error);
    }
  };

  const handleToggleConfiguration = async (configId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/backup/configurations/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ enabled })
      });
      
      if (response.ok) {
        setConfigurations(prev => 
          prev.map(config => 
            config.config_id === configId ? { ...config, enabled } : config
          )
        );
      }
    } catch (error) {
      console.error('Failed to update configuration:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const renderOverviewTab = () => (
    <div className="overview-content">
      {/* Health Status Cards */}
      <div className="status-cards">
        {metrics && (
          <>
            <Card className="status-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Configurations</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.active_configurations}/{metrics.total_configurations}
                    </p>
                  </div>
                  <Settings className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="status-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recovery Points</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.total_recovery_points}</p>
                  </div>
                  <Archive className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="status-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Storage Used</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatBytes(metrics.total_storage_bytes)}
                    </p>
                  </div>
                  <HardDrive className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="status-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {metrics.recent_executions.successful > 0 
                        ? Math.round((metrics.recent_executions.successful / 
                          (metrics.recent_executions.successful + metrics.recent_executions.failed)) * 100)
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* System Health */}
      {metrics?.health_status && (
        <Card className="health-status">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              System Health
              <Badge className={`ml-2 ${
                metrics.health_status.overall_status === 'healthy' ? 'bg-green-100 text-green-800' :
                  metrics.health_status.overall_status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
              }`}>
                {metrics.health_status.overall_status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.health_status.issues.length > 0 && (
              <div className="issues-section mb-4">
                <h4 className="font-semibold text-red-700 mb-2">Issues</h4>
                <ul className="list-disc list-inside space-y-1">
                  {metrics.health_status.issues.map((issue, index) => (
                    <li key={index} className="text-red-600 text-sm">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {metrics.health_status.recommendations.length > 0 && (
              <div className="recommendations-section">
                <h4 className="font-semibold text-blue-700 mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {metrics.health_status.recommendations.map((rec, index) => (
                    <li key={index} className="text-blue-600 text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Backups */}
      {metrics?.upcoming_backups && metrics.upcoming_backups.length > 0 && (
        <Card className="upcoming-backups">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upcoming Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="backup-schedule-list">
              {metrics.upcoming_backups.slice(0, 5).map((backup, index) => (
                <div key={index} className="backup-schedule-item">
                  <div className="backup-info">
                    <h4 className="backup-name">{backup.config_name}</h4>
                    <p className="backup-time">
                      {new Date(backup.next_run).toLocaleString()}
                    </p>
                  </div>
                  <div className="backup-duration">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      ~{formatDuration(backup.estimated_duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderConfigurationsTab = () => (
    <div className="configurations-content">
      <div className="configurations-header">
        <div className="header-actions">
          <Button onClick={() => {/* Open create config modal */}}>
            <Plus className="w-4 h-4 mr-2" />
            New Configuration
          </Button>
          <Button variant="outline" onClick={loadBackupData}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="configurations-grid">
        {configurations.map(config => (
          <Card key={config.config_id} className="config-card">
            <CardHeader className="pb-3">
              <div className="config-header">
                <div className="config-title">
                  <h3 className="text-lg font-semibold">{config.name}</h3>
                  <Badge className={config.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {config.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="config-actions">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRunBackup(config.config_id)}
                    disabled={!config.enabled}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="config-details">
                <div className="detail-item">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {config.backup_type} backup • {config.schedule.frequency}
                  </span>
                </div>
                
                <div className="detail-item">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {config.storage.provider} • {config.storage.encryption_enabled ? 'Encrypted' : 'Unencrypted'}
                  </span>
                </div>
                
                {config.last_run_at && (
                  <div className="detail-item">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Last run: {new Date(config.last_run_at).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {config.next_run_at && (
                  <div className="detail-item">
                    <Timer className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Next run: {new Date(config.next_run_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="config-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => handleToggleConfiguration(config.config_id, e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderExecutionsTab = () => (
    <div className="executions-content">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Executions
            </span>
            <Button variant="outline" size="sm" onClick={loadBackupData}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="executions-table">
            <div className="table-header">
              <div className="header-cell">Configuration</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Started</div>
              <div className="header-cell">Duration</div>
              <div className="header-cell">Size</div>
              <div className="header-cell">Actions</div>
            </div>
            
            {executions.map(execution => (
              <div key={execution.execution_id} className="table-row">
                <div className="table-cell">
                  <div className="execution-config">
                    <span className="config-name">
                      {configurations.find(c => c.config_id === execution.config_id)?.name || execution.config_id}
                    </span>
                  </div>
                </div>
                
                <div className="table-cell">
                  <Badge className={getStatusColor(execution.status)}>
                    {execution.status}
                  </Badge>
                  {execution.status === 'running' && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${execution.progress.percentage}%` }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="table-cell">
                  <span className="text-sm">
                    {new Date(execution.started_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="table-cell">
                  <span className="text-sm">
                    {execution.duration_seconds 
                      ? formatDuration(execution.duration_seconds)
                      : execution.status === 'running' 
                        ? `${Math.floor((Date.now() - new Date(execution.started_at).getTime()) / 1000)}s`
                        : '-'
                    }
                  </span>
                </div>
                
                <div className="table-cell">
                  <span className="text-sm">
                    {execution.backup_size_bytes 
                      ? formatBytes(execution.backup_size_bytes)
                      : '-'
                    }
                  </span>
                </div>
                
                <div className="table-cell">
                  <div className="action-buttons">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {execution.recovery_point_id && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="backup-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="title-section">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Backup Management</h1>
              <p className="text-gray-600 mt-1">Configure and monitor system backup operations</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="dashboard-tabs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="configurations">
          {renderConfigurationsTab()}
        </TabsContent>

        <TabsContent value="executions">
          {renderExecutionsTab()}
        </TabsContent>
      </Tabs>

      <style jsx>{`
        .backup-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .dashboard-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .dashboard-tabs {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        /* Overview Tab Styles */
        .overview-content {
          space-y: 24px;
        }

        .status-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .status-card {
          border: 1px solid #e5e7eb;
        }

        .health-status, .upcoming-backups {
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
        }

        .backup-schedule-list {
          space-y: 12px;
        }

        .backup-schedule-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .backup-info h4 {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .backup-time {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .backup-duration {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Configurations Tab Styles */
        .configurations-content {
          space-y: 24px;
        }

        .configurations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .configurations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 16px;
        }

        .config-card {
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }

        .config-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .config-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .config-title {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .config-actions {
          display: flex;
          gap: 8px;
        }

        .config-details {
          space-y: 8px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .config-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #10b981;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }

        .toggle-label {
          font-size: 14px;
          color: #374151;
        }

        /* Executions Tab Styles */
        .executions-content {
          space-y: 24px;
        }

        .executions-table {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 12px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          font-size: 14px;
          color: #374151;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
        }

        .table-row:hover {
          background: #f9fafb;
        }

        .table-cell {
          font-size: 14px;
          color: #374151;
        }

        .execution-config {
          display: flex;
          flex-direction: column;
        }

        .config-name {
          font-weight: 600;
          color: #1f2937;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 4px;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .backup-dashboard {
            padding: 16px;
          }

          .status-cards {
            grid-template-columns: 1fr;
          }

          .configurations-grid {
            grid-template-columns: 1fr;
          }

          .config-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .config-actions {
            justify-content: stretch;
          }

          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .header-cell::before {
            content: attr(data-label) ': ';
            font-weight: 600;
          }
        }
      `}</style>
    </div>
  );
};

export default BackupDashboard;