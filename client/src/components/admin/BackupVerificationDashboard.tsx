/**
 * Backup Verification Dashboard - Epic 17.4.6
 * 
 * Administrative interface for managing backup verification processes,
 * monitoring verification results, and configuring verification steps.
 * 
 * Task: E17-1753114397279-AC5DA5 - Create verification steps
 * Epic: 17 - Backstage Admin Controls (Story 17.4.6 - Backup System)
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { 
  Shield,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Database,
  Lock,
  Unlock,
  FileCheck,
  BarChart3,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Activity,
  Zap,
  Target
} from 'lucide-react';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
enum VerificationStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  WARNING = 'warning',
  SKIPPED = 'skipped',
  TIMEOUT = 'timeout',
  ERROR = 'error'
  enum SessionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
  enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
  enum VerificationStepType {
  INTEGRITY = 'integrity',
  ACCESSIBILITY = 'accessibility',
  ENCRYPTION = 'encryption',
  RESTORATION = 'restoration',
  COMPLIANCE = 'compliance',
  METADATA = 'metadata',
  PERFORMANCE = 'performance'
  interface BackupVerificationStep {
  stepId: string;,
  stepName: string,
  stepType: VerificationStepType;,
  description: string,
  required: boolean;,
  timeout: number,
  retryAttempts: number;
  dependencies?: string,
  configurable: boolean;,
  estimatedDuration: number;
  interface BackupVerificationResult {
  stepId: string;,
  status: VerificationStatus,
  message: string;,
  timestamp: Date,
  duration: number;,
  details: Record<string, unknown>;
  warnings?: string;
  recommendations?: string;
  interface VerificationSession {
  sessionId: string;,
  backupId: string,
  initiatedBy: string;,
  initiatedAt: Date;
  completedAt?: Date,
  status: SessionStatus;,
  steps: BackupVerificationResult,
  summary: VerificationSummary;,
  configuration: VerificationConfiguration;
  interface VerificationSummary {
  totalSteps: number;,
  passedSteps: number,
  failedSteps: number;,
  warningSteps: number,
  skippedSteps: number;,
  totalDuration: number,
  overallStatus: VerificationStatus;,
  criticalIssues: string,
  riskLevel: RiskLevel;
  interface VerificationConfiguration {
  stepsEnabled: string;,
  stepsDisabled: string,
  timeoutOverrides: Record<string, number>;
  retryOverrides: Record<string, number>;
  customParameters: Record<string, unknown>;
  skipOnWarnings: boolean;,
  abortOnCriticalFailure: boolean;
  interface BackupData {
  backupId: string;,
  backupPath: string,
  backupType: string;,
  createdAt: Date,
  originalSize: number;,
  compressedSize: number,
  checksum: string;}


  // ==========================================
  // MAIN COMPONENT
  // ==========================================
  export interface BackupVerificationDashboardProps {
  }

className?: string;
}
}
export const BackupVerificationDashboard: React.FC<BackupVerificationDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Data state
  const [verificationSteps, setVerificationSteps] = useState<BackupVerificationStep[]>([]);
  const [activeSessions, setActiveSessions] = useState<VerificationSession[]>([]);
  const [recentSessions, setRecentSessions] = useState<VerificationSession[]>([]);
  const [backups, setBackups] = useState<BackupData[]>([]);
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('');
  // Configuration state
  const [verificationConfig, setVerificationConfig] = useState<Partial<VerificationConfiguration>>({
  stepsEnabled: [],
    stepsDisabled: [],
    timeoutOverrides: {},
    retryOverrides: {},
    customParameters: {},
    skipOnWarnings: false,
    abortOnCriticalFailure: true;
  });
  // Load dashboard data
  const loadDashboardData = async () => {
  try {
  setLoading(true);
  const [stepsResponse, sessionsResponse, backupsResponse] = await Promise.all([)
  fetch('/api/admin/backup-verification/steps'),
  fetch('/api/admin/backup-verification/sessions?limit=20'),
  fetch('/api/admin/backups?limit=50')
  ]);
  if (stepsResponse.ok) {
  const stepsResult = await stepsResponse.json();
  setVerificationSteps(stepsResult.data || []);
  if (sessionsResponse.ok) {
  const sessionsResult = await sessionsResponse.json();
  const sessions = sessionsResult.data || [];
  setActiveSessions(sessions.filter((s: VerificationSession) =>,
  [SessionStatus.PENDING, SessionStatus.RUNNING].includes(s.status)
  ));
  setRecentSessions(sessions.filter((s: VerificationSession) =>,
  [SessionStatus.COMPLETED, SessionStatus.FAILED].includes(s.status)
  ));
  if (backupsResponse.ok) {
  const backupsResult = await backupsResponse.json();
  setBackups(backupsResult.data || []);
} catch (err) {
  setError('Failed to load dashboard data');
  console.error('Dashboard loading error:', err);
} finally {
      setLoading(false);
  };
  // Start backup verification
  const startVerification = async (backupId: string, config?: Partial<VerificationConfiguration>) => {
    try {
      const response = await fetch('/api/admin/backup-verification/verify', {
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({),
          backupId,
          configuration: { ...verificationConfig, ...config }
  }
      });
      if (response.ok) {
        await loadDashboardData();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to start verification');
    } catch (err) {
  setError('Error starting verification');
  console.error('Verification start error:', err);
};
  // Cancel verification session
  const cancelVerification = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/backup-verification/sessions/${sessionId}/cancel`, {)}
  },
  method: 'POST';
  });
      if (response.ok) {
        await loadDashboardData();
    } catch (err) {
  console.error('Error cancelling verification:', err);
};
  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 30 seconds for active sessions
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);
  // Helper functions
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;}
    return `${seconds}s`;}
  };
  const getStatusColor = (status: VerificationStatus | SessionStatus) => {
  switch (status) {
  case 'passed':,
  case 'completed':,
  return 'bg-green-100 text-green-800';
  case 'failed':,
  case 'error':,
  return 'bg-red-100 text-red-800';
  case 'warning':,
  return 'bg-yellow-100 text-yellow-800';
  case 'running':,
  case 'pending':,
  return 'bg-blue-100 text-blue-800';
  case 'timeout':,
  case 'cancelled':,
  return 'bg-gray-100 text-gray-800';
  default:,
  return 'bg-gray-100 text-gray-800';
};
  const getRiskLevelColor = (level: RiskLevel) => {
  switch (level) {
  case RiskLevel.LOW:,
  return 'bg-green-100 text-green-800';
  case RiskLevel.MEDIUM:,
  return 'bg-yellow-100 text-yellow-800';
  case RiskLevel.HIGH:,
  return 'bg-orange-100 text-orange-800';
  case RiskLevel.CRITICAL:,
  return 'bg-red-100 text-red-800';
  default:,
  return 'bg-gray-100 text-gray-800';
};
  const getStepIcon = (stepType: VerificationStepType) => {
  switch (stepType) {
  case VerificationStepType.INTEGRITY:,
  return <Shield className="w-4 h-4" />;
  case VerificationStepType.ACCESSIBILITY:,
  return <Unlock className="w-4 h-4" />;
  case VerificationStepType.ENCRYPTION:,
  return <Lock className="w-4 h-4" />;
  case VerificationStepType.RESTORATION:,
  return <RotateCcw className="w-4 h-4" />;
  case VerificationStepType.COMPLIANCE:,
  return <FileCheck className="w-4 h-4" />;
  case VerificationStepType.METADATA:,
  return <Database className="w-4 h-4" />;
  case VerificationStepType.PERFORMANCE:,
  return <Zap className="w-4 h-4" />;
  default:,
  return <Target className="w-4 h-4" />;
};
  if (loading && verificationSteps.length === 0) {
    return;
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">Loading backup verification dashboard...</div>
        </CardContent>
      </Card>
    );
  return;
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Backup Verification Dashboard
          <Badge variant="secondary">Epic 17.4.6</Badge>
          {error && ()
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Sessions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeSessions.length}</div>
                  <div className="text-sm text-gray-600">Active Sessions</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activeSessions.filter(s => s.status === SessionStatus.RUNNING).length} running
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {recentSessions.filter(s => s.status === SessionStatus.COMPLETED).length}
                  </div>
                  <div className="text-sm text-gray-600">Completed Today</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last 24 hours
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {recentSessions.filter(s => s.summary.riskLevel === RiskLevel.HIGH || s.summary.riskLevel === RiskLevel.CRITICAL).length}
                  </div>
                  <div className="text-sm text-gray-600">High Risk</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Require attention
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{verificationSteps.length}</div>
                  <div className="text-sm text-gray-600">Verification Steps</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {verificationSteps.filter(s => s.required).length} required
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Select value={selectedBackup} onValueChange={setSelectedBackup}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select backup to verify" />
                    </SelectTrigger>
                    <SelectContent>
                      {backups.map(backup => (
                        <SelectItem key={backup.backupId} value={backup.backupId}>
                          {backup.backupId} ({backup.backupType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => selectedBackup && startVerification(selectedBackup)}
                    disabled={!selectedBackup || loading}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Verification
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    View Reports
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Global Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export Data
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadDashboardData}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Verification Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentSessions.slice(0, 5).map(session => (
                      <div key={session.sessionId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                          <span className="text-sm font-medium">{session.backupId}</span>
                          <Badge className={getRiskLevelColor(session.summary.riskLevel)}>
                            {session.summary.riskLevel}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.initiatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Step Success Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {verificationSteps.slice(0, 5).map(step => {
  const successRate = Math.random() * 30 + 70; // Mock success rate;
                      return;
                        <div key={step.stepId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1">
                              {getStepIcon(step.stepType)}
                              {step.stepName}
                            </span>
                            <span>{Math.round(successRate)}%</span>
                          </div>
                          <Progress value={successRate} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Active Sessions Tab */}
          <TabsContent value="active" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Active Verification Sessions ({activeSessions.length})
              </h3>
              <Button onClick={loadDashboardData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
            <div className="space-y-3">
              {activeSessions.map(session => (
                <Card key={session.sessionId} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{session.sessionId}</span>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                          {session.status === SessionStatus.RUNNING && ()
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <Activity className="w-3 h-3" />
                              Running...
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Backup: {session.backupId} | Started: {new Date(session.initiatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {session.status === SessionStatus.RUNNING && ()
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => cancelVerification(session.sessionId)}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Progress Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Progress</div>
                        <div>{session.steps.length} / {session.summary.totalSteps} steps</div>
                      </div>
                      <div>
                        <div className="font-medium">Passed</div>
                        <div className="text-green-600">{session.summary.passedSteps}</div>
                      </div>
                      <div>
                        <div className="font-medium">Failed</div>
                        <div className="text-red-600">{session.summary.failedSteps}</div>
                      </div>
                      <div>
                        <div className="font-medium">Duration</div>
                        <div>{formatDuration(session.summary.totalDuration)}</div>
                      </div>
                    </div>
                    {session.summary.totalSteps > 0 && ()
                      <div className="mt-3">
                        <Progress 
                          value={(session.steps.length / session.summary.totalSteps) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {activeSessions.length === 0 && ()
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No active verification sessions
                </div>
              )}
            </div>
          </TabsContent>
          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {/* Search and Filters */}
            <div className="border rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Search by backup ID or session ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRiskLevel} onValueChange={setFilterRiskLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('');
                  setFilterRiskLevel('');
                }}>
                  <Filter className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            {/* History List */}
            <div className="space-y-2">
              {recentSessions.map(session => (
                <Card key={session.sessionId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{session.sessionId}</span>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                          <Badge className={getRiskLevelColor(session.summary.riskLevel)}>
                            {session.summary.riskLevel} risk
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm text-gray-600 mb-2">
                          <div>Backup: {session.backupId}</div>
                          <div>By: {session.initiatedBy}</div>
                          <div>Started: {new Date(session.initiatedAt).toLocaleDateString()}</div>
                          <div>Duration: {formatDuration(session.summary.totalDuration)}</div>
                          <div>Steps: {session.summary.passedSteps}/{session.summary.totalSteps}</div>
                          <div>
                            {session.summary.criticalIssues.length > 0 && ()
                              <span className="text-red-600">
                                {session.summary.criticalIssues.length} issues
                              </span>
                            )}
                          </div>
                        </div>
                        {session.summary.criticalIssues.length > 0 && ()
                          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            Issues: {session.summary.criticalIssues.slice(0, 2).join(', ')}
                            {session.summary.criticalIssues.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Configure Tab */}
          <TabsContent value="configure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Global Settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Skip on Warnings</div>
                      <div className="text-sm text-gray-600">Continue verification even if warnings occur</div>
                    </div>
                    <Switch 
                      checked={verificationConfig.skipOnWarnings} 
                      onCheckedChange={(checked) => 
                        setVerificationConfig(prev => ({ ...prev, skipOnWarnings: checked }))
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Abort on Critical Failure</div>
                      <div className="text-sm text-gray-600">Stop verification if a critical step fails</div>
                    </div>
                    <Switch 
                      checked={verificationConfig.abortOnCriticalFailure} 
                      onCheckedChange={(checked) => 
                        setVerificationConfig(prev => ({ ...prev, abortOnCriticalFailure: checked }))
                    />
                  </div>
                </div>
                {/* Step Configuration */}
                <div>
                  <h4 className="font-medium mb-3">Step Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {verificationSteps.map(step => (
                      <div key={step.stepId} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStepIcon(step.stepType)}
                            <span className="font-medium text-sm">{step.stepName}</span>
                            {step.required && ()
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <Switch 
                            checked={!verificationConfig.stepsDisabled?.includes(step.stepId)}
                            onCheckedChange={(checked) => {
  const disabled = verificationConfig.stepsDisabled || [];
  const newDisabled = checked ;
  ? disabled.filter(id => id !== step.stepId)
  : [...disabled, step.stepId];
  setVerificationConfig(prev => ({ )
  ...prev,
  stepsDisabled: newDisabled
}));
                            }}
                            disabled={step.required}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mb-2">{step.description}</div>
                        <div className="text-xs text-gray-500">
                          Timeout: {Math.round(step.timeout / 1000)}s | 
                          Est. Duration: {step.estimatedDuration}s
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>
                    <Settings className="w-4 h-4 mr-1" />
                    Save Configuration
                  </Button>
                  <Button variant="outline">
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Steps Tab */}
          <TabsContent value="steps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Verification Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(VerificationStepType).map(stepType => (
                    <div key={stepType}>
                      <h4 className="font-medium mb-2 flex items-center gap-2 capitalize">
                        {getStepIcon(stepType)}
                        {stepType.replace('_', ' ')} Steps
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                        {verificationSteps
                          .filter(step => step.stepType === stepType)
                          .map(step => (
                            <div key={step.stepId} className="border rounded p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{step.stepName}</span>
                                {step.required && ()
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                                {step.configurable && ()
                                  <Badge variant="secondary" className="text-xs">Configurable</Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mb-2">{step.description}</div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Timeout: {Math.round(step.timeout / 1000)}s</span>
                                <span>Est: {step.estimatedDuration}s</span>
                                <span>Retries: {step.retryAttempts}</span>
                              </div>
                              {step.dependencies && step.dependencies.length > 0 && ()
                                <div className="text-xs text-blue-600 mt-1">
                                  Depends on: {step.dependencies.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Error Display */}
        {error && ()
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-6 text-xs"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackupVerificationDashboard;