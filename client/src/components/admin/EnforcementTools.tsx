/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Enforcement Tools Dashboard
 * 
 * Administrative interface for manual policy enforcement, violation management,
 * and enforcement action oversight. Provides human administrative layer on top
 * of the automated enforcement system.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397376-1B07D9 - Develop enforcement tools
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Eye, 
  Flag,
  CheckCircle,
  XCircle,
  Filter,
  Plus,
  Edit,
  RotateCcw,
  Settings,
  Activity,
  BarChart3,
  Scale,
  AlertCircle,
  Info,
  Zap,
  Download
 from 'lucide-react';


interface EnforcementAction {
  actionId: string;,
  entityType: 'user' | 'template' | 'transaction',
  entityId: string;,
  actionType: 'suspend' | 'restrict' | 'flag' | 'require_verification' | 'block_transaction' | 'quarantine_template',
  severity: 'low' | 'medium' | 'high' | 'critical';,
  reason: string,
  triggeredBy: 'trust_score' | 'risk_factor' | 'fraud_detection' | 'policy_violation' | 'manual_review';,
  triggerDetails: unknown,
  autoApplied: boolean;,
  actionTaken: boolean;
  actionTimestamp?: Date;
  expiresAt?: Date,
  reviewRequired: boolean;
  adminNotes?: string;
  reversal?: {
  reversedAt: Date;,
  reversedBy: string,
  reason: string;


};


interface EnforcementPolicy {
  policyId: string;,
  name: string,
  description: string;,
  enabled: boolean,
  triggers: {
  trustScoreThresholds?: {
  suspend: number;,
  restrict: number,
  flag: number;


};
    riskFactorRules?: {
  criticalRiskCount: number;,
  highRiskCount: number,
  automaticSuspension: boolean;
};
    fraudDetectionRules?: {
  fraudScoreThreshold: number;,
  suspiciousIndicatorThreshold: number;
};
  };
  actions: {
  autoSuspension: boolean,
  autoRestriction: boolean;,
  autoFlagging: boolean,
  requireManualReview: boolean;,
  notifyAdmins: boolean;
};
  exemptions?: {
  highTrustUsers: boolean;,
  verifiedUsers: boolean,
  whitelistedEntities: string;
};


interface ViolationReport {
  reportId: string;,
  type: 'fraud' | 'abuse' | 'violation' | 'security' | 'quality',
  severity: 'low' | 'medium' | 'high' | 'critical';,
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'appealed';
  userId?: string;
  templateId?: string;
  transactionId?: string,
  reporterType: 'automated' | 'user' | 'admin';
  reporterId?: string,
  evidence: string;,
  description: string,
  createdAt: Date;
  assignedTo?: string;
  resolution?: {
  action: string;,
  reason: string,
  resolvedBy: string;,
  resolvedAt: Date;


};


interface EnforcementStats {
  totalActions: number;,
  pendingReviews: number,
  todayActions: number;,
  appeals: number,
  automatedActions: number;,
  manualActions: number,
  actionBreakdown: {
  suspensions: number;,
  restrictions: number,
  flags: number;,
  blocks: number,
  quarantines: number;


};
  severityBreakdown: {
  low: number,
  medium: number;,
  high: number,
  critical: number;
};
  effectivenessMetrics: {
  successRate: number,
  appealRate: number;,
  reversalRate: number,
  avgResolutionTime: number;
};


export interface EnforcementToolsProps {


className?: string;


export const EnforcementTools: React.FC<EnforcementToolsProps> = ({ className }) => {
  const [error, setError] = useState<string | null>(null);
  // Data state
  const [stats, setStats] = useState<EnforcementStats | null>(null);
  const [recentActions, setRecentActions] = useState<EnforcementAction[]>([]);
  const [pendingReviews, setPendingReviews] = useState<EnforcementAction[]>([]);
  const [violationReports, setViolationReports] = useState<ViolationReport[]>([]);
  const [policies, setPolicies] = useState<EnforcementPolicy[]>([]);
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('');
  // Manual action state
  const [manualActionTarget, setManualActionTarget] = useState('');
  const [manualActionType, setManualActionType] = useState('');
  const [manualActionReason, setManualActionReason] = useState('');
  const [manualActionSeverity, setManualActionSeverity] = useState('medium');
  // Load enforcement data
  const loadEnforcementData = async () => {
    try {
      setLoading(true);
      const [statsResponse, actionsResponse, reportsResponse, policiesResponse] = await Promise.all([)
        fetch('/api/admin/enforcement/stats'),
        fetch('/api/admin/enforcement/actions?limit=20'),
        fetch('/api/admin/enforcement/reports?status=pending&limit=10'),
        fetch('/api/admin/enforcement/policies')
      ]);
      const statsResult = await statsResponse.json();
      const actionsResult = await actionsResponse.json();
      const reportsResult = await reportsResponse.json();
      const policiesResult = await policiesResponse.json();
      if (statsResult.success) setStats(statsResult.data);
      if (actionsResult.success) setRecentActions(actionsResult.data);
      if (reportsResult.success) setViolationReports(reportsResult.data);
      if (policiesResult.success) setPolicies(policiesResult.data);
      // Load pending reviews
      const reviewsResponse = await fetch('/api/admin/enforcement/actions?review_required=true&limit=15');
      const reviewsResult = await reviewsResponse.json();
      if (reviewsResult.success) setPendingReviews(reviewsResult.data);
 catch (err) {
  setError('Failed to load enforcement data');
  console.error('Error loading enforcement data:', err);
 finally {
      setLoading(false);
  };
  // Apply manual enforcement action
  const applyManualAction = async () => {
    try {
      if (!manualActionTarget || !manualActionType || !manualActionReason) {
        setError('Please fill in all required fields for manual action');
        return;
      setLoading(true);
      const response = await fetch('/api/admin/enforcement/actions/manual', {
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  entityType: getEntityTypeFromTarget(manualActionTarget),
  entityId: manualActionTarget,
  actionType: manualActionType,
  severity: manualActionSeverity,
  reason: manualActionReason,
  triggeredBy: 'manual_review'

      });
      const result = await response.json();
      if (result.success) {
        // Clear form and reload data
        setManualActionTarget('');
        setManualActionType('');
        setManualActionReason('');
        setManualActionSeverity('medium');
        await loadEnforcementData();
 else {
        setError(result.error || 'Failed to apply manual action');
 catch (err) {
  setError('Error applying manual action');
  console.error('Error applying manual action:', err);
 finally {
      setLoading(false);
  };
  // Approve enforcement action
  const approveAction = async (actionId: string) => {
    try {
      const response = await fetch(`/api/admin/enforcement/actions/${actionId}/approve`, {)}
  },
  method: 'POST';
  });
      if (response.ok) {
        await loadEnforcementData();
 catch (err) {
  console.error('Error approving action:', err);
};
  // Reverse enforcement action
  const reverseAction = async (actionId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/enforcement/actions/${actionId}/reverse`, {)}
  },
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        await loadEnforcementData();
 catch (err) {
  console.error('Error reversing action:', err);
};
  // Update policy
  const updatePolicy = async (policy: EnforcementPolicy) => {
    try {
      const response = await fetch(`/api/admin/enforcement/policies/${policy.policyId}`, {)}
  },
  method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy);
  });
      if (response.ok) {
        await loadEnforcementData();
 catch (err) {
  console.error('Error updating policy:', err);
};
  useEffect(() => {
    loadEnforcementData();
    // Refresh data periodically
    const interval = setInterval(loadEnforcementData, 30000);
    return () => clearInterval(interval);
  }, []);
  // Helper functions
  const getEntityTypeFromTarget = (target: string): 'user' | 'template' | 'transaction' => {
    if (target.startsWith('user_') || target.includes('@')) return 'user';
    if (target.startsWith('template_') || target.startsWith('tpl_')) return 'template';
    if (target.startsWith('tx_') || target.startsWith('transaction_')) return 'transaction';
    return 'user'; // default
  };
  const getActionIcon = (actionType: string) => {
  switch (actionType) {
  case 'suspend': return <Ban className="w-4 h-4" />;
  case 'restrict': return <Shield className="w-4 h-4" />;
  case 'flag': return <Flag className="w-4 h-4" />;
  case 'require_verification': return <CheckCircle className="w-4 h-4" />;
  case 'block_transaction': return <XCircle className="w-4 h-4" />;
  case 'quarantine_template': return <AlertTriangle className="w-4 h-4" />,
  default: return <Info className="w-4 h-4" />;
};
  const getSeverityColor = (severity: string) => {
  switch (severity) {
  case 'critical': return 'text-red-600 bg-red-100';
  case 'high': return 'text-orange-600 bg-orange-100';
  case 'medium': return 'text-yellow-600 bg-yellow-100';
  case 'low': return 'text-blue-600 bg-blue-100',
  default: return 'text-gray-600 bg-gray-100';
};
  if (loading && !stats) {
    return;
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">Loading enforcement tools...</div>
        </CardContent>
      </Card>
    );
  return;
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Enforcement Tools
          <Badge variant="secondary">Epic 17</Badge>
          {error && ()
            <Badge variant="destructive" className="ml-auto">
              <AlertCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {stats && ()
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalActions}</div>
                    <div className="text-sm text-gray-600">Total Actions</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.todayActions} today
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
                    <div className="text-sm text-gray-600">Pending Reviews</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Require attention
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.appeals}</div>
                    <div className="text-sm text-gray-600">Active Appeals</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.effectivenessMetrics.appealRate}% appeal rate
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.effectivenessMetrics.successRate}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.effectivenessMetrics.reversalRate}% reversed
                    </div>
                  </div>
                </div>
                {/* Action Type Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Action Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(stats.actionBreakdown).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {getActionIcon(type)}
                              <span className="capitalize">{type}</span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Severity Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(stats.severityBreakdown).map(([severity, count]) => (
                          <div key={severity} className="flex justify-between items-center">
                            <span className="capitalize">{severity}</span>
                            <Badge className={getSeverityColor(severity)}>
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Recent Actions Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recentActions.slice(0, 5).map((action) => (
                        <div key={action.actionId} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            {getActionIcon(action.actionType)}
                            <div>
                              <span className="font-medium capitalize">{action.actionType}</span>
                              <div className="text-sm text-gray-600">
                                {action.entityType}: {action.entityId}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getSeverityColor(action.severity)}>
                              {action.severity}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {action.autoApplied ? 'Auto' : 'Manual'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            {/* Search and Filter */}
            <div className="border rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Search actions by entity ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    <SelectItem value="suspend">Suspend</SelectItem>
                    <SelectItem value="restrict">Restrict</SelectItem>
                    <SelectItem value="flag">Flag</SelectItem>
                    <SelectItem value="block_transaction">Block</SelectItem>
                    <SelectItem value="quarantine_template">Quarantine</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="transaction">Transaction</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setSelectedSeverity('');
                  setSelectedActionType('');
                  setSelectedEntityType('');
}>
                  <Filter className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            {/* Actions List */}
            <div className="space-y-2">
              {recentActions.map((action) => (
                <Card key={action.actionId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getActionIcon(action.actionType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium capitalize">{action.actionType}</span>
                            <Badge className={getSeverityColor(action.severity)}>
                              {action.severity}
                            </Badge>
                            <Badge variant={action.autoApplied ? 'default' : 'outline'}>
                              {action.autoApplied ? 'Automated' : 'Manual'}
                            </Badge>
                            {action.reviewRequired && ()
                              <Badge variant="destructive">Review Required</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                            <div>
                              <span className="font-medium">Target:</span> {action.entityType} {action.entityId}
                            </div>
                            <div>
                              <span className="font-medium">Trigger:</span> {action.triggeredBy.replace('_', ' ')}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> {action.actionTaken ? 'Applied' : 'Pending'}
                            </div>
                          </div>
                          <p className="text-sm text-gray-800">{action.reason}</p>
                          {action.adminNotes && ()
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                              <strong>Admin Notes:</strong> {action.adminNotes}
                            </div>
                          )}
                          {action.reversal && ()
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                              <strong>Reversed:</strong> {action.reversal.reason} by {action.reversal.reversedBy}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {action.reviewRequired && !action.actionTaken && ()
                          <>
                            <Button size="sm" onClick={() => approveAction(action.actionId)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
  const reason = prompt('Enter reason for reversal:');
  if (reason) reverseAction(action.actionId, reason);
}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {action.actionTaken && !action.reversal && ()
                          <Button size="sm" variant="outline" onClick={() => {
  const reason = prompt('Enter reason for reversal:');
  if (reason) reverseAction(action.actionId, reason);
}>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reverse
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pending Reviews ({pendingReviews.length})</h3>
              <Button onClick={loadEnforcementData}>
                <Activity className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
            <div className="space-y-2">
              {pendingReviews.map((action) => (
                <Card key={action.actionId} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-medium">
                            {action.actionType.toUpperCase()} - {action.entityType} {action.entityId}
                          </div>
                          <div className="text-sm text-gray-600">{action.reason}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Triggered by: {action.triggeredBy} • Severity: {action.severity}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveAction(action.actionId)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
  const reason = prompt('Enter reason for rejection:');
  if (reason) reverseAction(action.actionId, reason);
}>
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pendingReviews.length === 0 && ()
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  All actions have been reviewed
                </div>
              )}
            </div>
          </TabsContent>
          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Violation Reports</h3>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Create Report
              </Button>
            </div>
            <div className="space-y-2">
              {violationReports.map((report) => (
                <Card key={report.reportId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className="w-4 h-4" />
                          <span className="font-medium capitalize">{report.type} Report</span>
                          <Badge className={getSeverityColor(report.severity)}>
                            {report.severity}
                          </Badge>
                          <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">{report.description}</p>
                        <div className="text-xs text-gray-500">
                          Reported by: {report.reporterType} • {report.evidence.length} pieces of evidence
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Enforcement Policies</h3>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Create Policy
              </Button>
            </div>
            <div className="space-y-2">
              {policies.map((policy) => (
                <Card key={policy.policyId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="w-4 h-4" />
                          <span className="font-medium">{policy.name}</span>
                          <Switch 
                            checked={policy.enabled}
                            onCheckedChange={(enabled) => updatePolicy({ ...policy, enabled })}
                          />
                          <span className="text-sm text-gray-600">
                            {policy.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                        <div className="text-xs text-gray-500">
                          Auto-suspension: {policy.actions.autoSuspension ? 'Yes' : 'No'} • 
                          Manual review: {policy.actions.requireManualReview ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Manual Action Tab */}
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manual Enforcement Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-medium">Target (User ID, Template ID, etc.)</label>
                    <Input
                      value={manualActionTarget}
                      onChange={(e) => setManualActionTarget(e.target.value)}
                      placeholder="user_12345, template_abc123, tx_xyz789"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">Action Type</label>
                    <Select value={manualActionType} onValueChange={setManualActionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suspend">Suspend</SelectItem>
                        <SelectItem value="restrict">Restrict</SelectItem>
                        <SelectItem value="flag">Flag</SelectItem>
                        <SelectItem value="require_verification">Require Verification</SelectItem>
                        <SelectItem value="block_transaction">Block Transaction</SelectItem>
                        <SelectItem value="quarantine_template">Quarantine Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Severity</label>
                  <Select value={manualActionSeverity} onValueChange={setManualActionSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Reason</label>
                  <Textarea
                    value={manualActionReason}
                    onChange={(e) => setManualActionReason(e.target.value)}
                    placeholder="Detailed reason for this enforcement action..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={applyManualAction} 
                    disabled={loading || !manualActionTarget || !manualActionType || !manualActionReason}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Apply Action
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setManualActionTarget('');
                    setManualActionType('');
                    setManualActionReason('');
}>
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Ban className="w-3 h-3" />
                    Emergency Suspend
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    Bulk Flag
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    Export Actions
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Error Display */}
        {error && ()
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-2" />
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

export default EnforcementTools;