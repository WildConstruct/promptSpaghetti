/**
 * Policy Preview and Staging Dashboard
 * 
 * Comprehensive dashboard for managing policy previews, staging deployments,
 * validation results, user feedback, and production promotions.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-98 - Implement policy preview and staging
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import {
  Badge,
  Button,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import {
  Eye,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  BarChart3,
  ArrowUp,
  MessageSquare,
  Zap,
  Target,
  Shield,
  Activity,
  GitBranch
} from 'lucide-react';

interface PolicyPreview {
  previewId: string;
  policyId: string;
  title: string;
  description: string;
  status: PreviewStatus;
  createdAt: string;
  expiresAt: string;
  changes: number;
  stagingDeployments: number;
  validationResults: number;
}

interface StagingDeployment {
  deploymentId: string;
  previewId: string;
  environmentId: string;
  status: StagingDeploymentStatus;
  deployedAt: string;
  metrics: StagingMetrics;
  issues: StagingIssue[];
}

interface StagingMetrics {
  userInteractions: number;
  consentRates: number;
  errorRates: number;
  userSatisfactionScore: number;
  complianceScore: number;
  accessibilityScore: number;
  securityScore: number;
}

interface StagingIssue {
  issueId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  detectedAt: string;
  status: string;
}

interface ValidationResult {
  validationId: string;
  validationType: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'SKIP';
  score: number;
  findings: number;
  blockers: number;
  warnings: number;
  validatedAt: string;
}

interface UserFeedback {
  feedbackId: string;
  userId: string;
  rating: number;
  comments: string;
  submittedAt: string;
  actionRequired: boolean;
}

enum PreviewStatus {
  DRAFT = 'DRAFT',
  VALIDATING = 'VALIDATING',
  STAGED = 'STAGED',
  TESTING = 'TESTING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

enum StagingDeploymentStatus {
  DEPLOYING = 'DEPLOYING',
  ACTIVE = 'ACTIVE',
  MONITORING = 'MONITORING',
  ISSUE_DETECTED = 'ISSUE_DETECTED',
  ROLLING_BACK = 'ROLLING_BACK',
  ROLLED_BACK = 'ROLLED_BACK',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

const PolicyPreviewDashboard: React.FC = () => {
  const [previews, setPreviews] = useState<PolicyPreview[]>([]);
  const [deployments, setDeployments] = useState<StagingDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('previews');
  const [, ] = useState<PolicyPreview | null>(null);
  const [validationResults] = useState<ValidationResult[]>([]);
  const [userFeedback] = useState<UserFeedback[]>([]);

  // Fetch data
  const fetchPreviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/policy-preview/previews');
      const data = await response.json();
      setPreviews(data.previews || []);
    } catch (error) {
      console.error('Failed to fetch previews:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeployments = useCallback(async () => {
    try {
      const response = await fetch('/api/policy-preview/deployments');
      const data = await response.json();
      setDeployments(data.deployments || []);
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
    }
  }, []);

  useEffect(() => {
    fetchPreviews();
    fetchDeployments();
  }, [fetchPreviews, fetchDeployments]);

  const getStatusColor = (status: PreviewStatus) => {
    switch (status) {
    case PreviewStatus.DRAFT: return 'bg-gray-100 text-gray-800';
    case PreviewStatus.VALIDATING: return 'bg-blue-100 text-blue-800';
    case PreviewStatus.STAGED: return 'bg-green-100 text-green-800';
    case PreviewStatus.TESTING: return 'bg-yellow-100 text-yellow-800';
    case PreviewStatus.APPROVED: return 'bg-emerald-100 text-emerald-800';
    case PreviewStatus.REJECTED: return 'bg-red-100 text-red-800';
    case PreviewStatus.EXPIRED: return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeploymentStatusColor = (status: StagingDeploymentStatus) => {
    switch (status) {
    case StagingDeploymentStatus.DEPLOYING: return 'bg-blue-100 text-blue-800';
    case StagingDeploymentStatus.ACTIVE: return 'bg-green-100 text-green-800';
    case StagingDeploymentStatus.MONITORING: return 'bg-yellow-100 text-yellow-800';
    case StagingDeploymentStatus.ISSUE_DETECTED: return 'bg-orange-100 text-orange-800';
    case StagingDeploymentStatus.ROLLING_BACK: return 'bg-red-100 text-red-800';
    case StagingDeploymentStatus.ROLLED_BACK: return 'bg-gray-100 text-gray-800';
    case StagingDeploymentStatus.COMPLETED: return 'bg-emerald-100 text-emerald-800';
    case StagingDeploymentStatus.FAILED: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case 'low': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'high': return 'text-orange-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
    }
  };

  const handleDeployToStaging = async (previewId: string, environmentId: string) => {
    try {
      const response = await fetch(`/api/policy-preview/previews/${previewId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environmentId })
      });

      if (response.ok) {
        fetchDeployments();
        fetchPreviews();
      }
    } catch (error) {
      console.error('Failed to deploy to staging:', error);
    }
  };

  const handleRollback = async (deploymentId: string, reason: string) => {
    try {
      const response = await fetch(`/api/policy-preview/deployments/${deploymentId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        fetchDeployments();
      }
    } catch (error) {
      console.error('Failed to rollback deployment:', error);
    }
  };

  const handlePromoteToProduction = async (previewId: string) => {
    try {
      const response = await fetch(`/api/policy-preview/previews/${previewId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        fetchPreviews();
      }
    } catch (error) {
      console.error('Failed to promote to production:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policy Preview & Staging</h1>
          <p className="text-muted-foreground">
            Manage policy previews, staging deployments, and production promotions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => fetchPreviews()} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <GitBranch className="h-4 w-4 mr-2" />
            Create Preview
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="previews">Previews</TabsTrigger>
          <TabsTrigger value="staging">Staging</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="previews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Policy Previews
              </CardTitle>
              <CardDescription>
                Manage and track policy preview versions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previews.map((preview) => (
                    <TableRow key={preview.previewId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{preview.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {preview.policyId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(preview.status)}>
                          {preview.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{preview.changes}</span>
                          <Badge variant="outline" size="sm">
                            {preview.validationResults} validations
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(preview.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(preview.expiresAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {preview.status === PreviewStatus.STAGED && (
                            <Select onValueChange={(value) => handleDeployToStaging(preview.previewId, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Deploy" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="staging-1">Staging 1</SelectItem>
                                <SelectItem value="canary-1">Canary</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {preview.status === PreviewStatus.APPROVED && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handlePromoteToProduction(preview.previewId)}
                            >
                              <ArrowUp className="h-4 w-4 mr-1" />
                              Promote
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Staging Deployments
              </CardTitle>
              <CardDescription>
                Monitor active staging deployments and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <Card key={deployment.deploymentId} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">Deployment {deployment.deploymentId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Environment: {deployment.environmentId}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getDeploymentStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(deployment.deployedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {deployment.metrics.userInteractions}
                          </div>
                          <div className="text-sm text-muted-foreground">Interactions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {(deployment.metrics.consentRates * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Consent Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {(deployment.metrics.errorRates * 100).toFixed(2)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Error Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {deployment.metrics.userSatisfactionScore.toFixed(1)}/5
                          </div>
                          <div className="text-sm text-muted-foreground">Satisfaction</div>
                        </div>
                      </div>

                      {/* Issues */}
                      {deployment.issues.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Issues Detected</h5>
                          <div className="space-y-1">
                            {deployment.issues.map((issue) => (
                              <Alert key={issue.issueId} className="py-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="flex items-center justify-between">
                                  <span>{issue.description}</span>
                                  <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                                    {issue.severity}
                                  </Badge>
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Feedback
                        </Button>
                        {deployment.status === StagingDeploymentStatus.ACTIVE && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRollback(deployment.deploymentId, 'Manual rollback')}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Rollback
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Validation Results
              </CardTitle>
              <CardDescription>
                Review validation findings and compliance checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationResults.map((result) => (
                  <Card key={result.validationId} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{result.validationType}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={result.status === 'PASS' ? 'default' : 'destructive'}
                          >
                            {result.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Score: {result.score}/100
                          </span>
                        </div>
                      </div>
                      
                      <Progress value={result.score} className="mb-2" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Findings: </span>
                          {result.findings}
                        </div>
                        <div>
                          <span className="font-medium">Blockers: </span>
                          <span className="text-red-600">{result.blockers}</span>
                        </div>
                        <div>
                          <span className="font-medium">Warnings: </span>
                          <span className="text-yellow-600">{result.warnings}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preview Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Preview Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Previews</span>
                    <span className="font-bold">{previews.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Deployments</span>
                    <span className="font-bold text-green-600">
                      {deployments.filter(d => d.status === StagingDeploymentStatus.ACTIVE).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Success Rate</span>
                    <span className="font-bold text-green-600">94.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg. Validation Score</span>
                    <span className="font-bold">87/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.values(PreviewStatus).map((status) => {
                    const count = previews.filter(p => p.status === status).length;
                    const percentage = previews.length > 0 ? (count / previews.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <Badge className={getStatusColor(status)} variant="outline">
                          {status}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* User Feedback Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Responses</span>
                    <span className="font-bold">{userFeedback.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Rating</span>
                    <span className="font-bold text-green-600">4.2/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Action Required</span>
                    <span className="font-bold text-orange-600">
                      {userFeedback.filter(f => f.actionRequired).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Privacy Policy v2.1 deployed to staging</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>Cookie Policy v1.3 validation completed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span>Terms of Service v3.0 rollback triggered</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <ArrowUp className="h-4 w-4 text-green-600" />
                    <span>Data Processing Policy v1.2 promoted to production</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PolicyPreviewDashboard;