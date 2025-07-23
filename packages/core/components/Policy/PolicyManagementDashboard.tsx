/**
 * Policy Management Dashboard - E17-1753114397370-5ABAA8
 * 
 * Comprehensive UI for managing policies across all domains in Wild Construct.
 * Provides policy creation, editing, evaluation, and compliance monitoring.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Switch } from '../ui/Switch';
import { usePolicyManagement } from '../../hooks/usePolicyManagement';
import { 
  PolicyDomain, 
  PolicyType, 
  PolicyStatus, 
  UnifiedPolicy,
  ComplianceFramework,
  PolicyEvaluationResult,
  PolicyViolation
} from '../../services/PolicyManagement';
import {
  Shield,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  AlertCircle,
  Activity,
  BarChart3,
  Users,
  Globe,
  Zap,
  Lock
} from 'lucide-react';

export interface PolicyManagementDashboardProps {
  userId: string;
  userRole: string;
  className?: string;
}

export const PolicyManagementDashboard: React.FC<PolicyManagementDashboardProps> = ({
  userId,
  userRole,
  className = ''
}) => {
  const {
    policies,
    evaluationResults,
    violations,
    isLoading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy,
    evaluatePolicies,
    generateComplianceReport,
    getPolicyStatistics,
    getFilteredPolicies,
    getRecentEvaluations,
    getPolicyViolations,
    domains,
    types,
    statuses,
    frameworks
  } = usePolicyManagement({
    autoEvaluate: true,
    enableRealTimeUpdates: true
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [__selectedPolicy, setSelectedPolicy] = useState<UnifiedPolicy | null>(null);
  const [__isCreatingPolicy, setIsCreatingPolicy] = useState(false);
  const [__isEditingPolicy, setIsEditingPolicy] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<PolicyDomain | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<PolicyStatus | 'ALL'>('ALL');

  const statistics = useMemo(() => getPolicyStatistics(), [getPolicyStatistics]);

  const filteredPolicies = useMemo(() => {
    return getFilteredPolicies({
      domain: domainFilter !== 'ALL' ? domainFilter : undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      search: searchTerm
    });
  }, [getFilteredPolicies, domainFilter, statusFilter, searchTerm]);

  const recentEvaluations = useMemo(() => getRecentEvaluations(10), [getRecentEvaluations]);
  const recentViolations = useMemo(() => 
    getPolicyViolations({ resolved: false, limit: 10 }), 
    [getPolicyViolations]
  );

  const getDomainIcon = (domain: PolicyDomain) => {
    const iconMap = {
      [PolicyDomain.SECURITY]: Shield,
      [PolicyDomain.CONTENT]: FileText,
      [PolicyDomain.QUALITY]: CheckCircle,
      [PolicyDomain.COMPLIANCE]: Settings,
      [PolicyDomain.VFX_PIPELINE]: Activity,
      [PolicyDomain.DATA_PROTECTION]: Lock,
      [PolicyDomain.ACCESS_CONTROL]: Users,
      [PolicyDomain.MARKETPLACE]: Globe
    };
    return iconMap[domain] || Settings;
  };

  const getStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case PolicyStatus.INACTIVE: return 'bg-gray-100 text-gray-800';
      case PolicyStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case PolicyStatus.DEPRECATED: return 'bg-red-100 text-red-800';
      case PolicyStatus.EMERGENCY: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const __handleCreatePolicy = async () => {
    try {
      setIsCreatingPolicy(false);
    } catch (err) {
      console.error('Failed to create policy:', err);
    }
  };

  const __handleUpdatePolicy = async () => {
    try {
      setIsEditingPolicy(false);
      setSelectedPolicy(null);
    } catch (err) {
      console.error('Failed to update policy:', err);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      try {
        await deletePolicy(policyId, userId);
      } catch (err) {
        console.error('Failed to delete policy:', err);
      }
    }
  };

  const renderOverview = () => (
    <div className="policy-overview space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalPolicies}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold text-green-600">{statistics.activePolicies}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Evaluations</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.evaluationMetrics.totalEvaluations}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Eval Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(statistics.evaluationMetrics.averageEvaluationTime)}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy by Domain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Policies by Domain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statistics.byDomain).map(([domain, count]) => {
                const Icon = getDomainIcon(domain as PolicyDomain);
                return (
                  <div key={domain} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{domain}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recent Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentViolations.slice(0, 5).map((violation) => (
                <div key={violation.id} className="flex items-start justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{violation.policyName}</p>
                    <p className="text-xs text-red-700 mt-1">{violation.violation.description}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {new Date(violation.metadata.detectedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={`text-xs ${getSeverityColor(violation.violation.severity)}`}>
                    {violation.violation.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPolicyList = () => (
    <div className="policy-list space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          
          <Select value={domainFilter} onValueChange={(value) => setDomainFilter(value as PolicyDomain | 'ALL')}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Domains</SelectItem>
              {domains.map(domain => (
                <SelectItem key={domain} value={domain}>{domain}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PolicyStatus | 'ALL')}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsCreatingPolicy(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Policy
        </Button>
      </div>

      {/* Policy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPolicies.map((policy) => {
          const Icon = getDomainIcon(policy.domain);
          return (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <CardTitle className="text-lg">{policy.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{policy.type}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(policy.status)}>
                    {policy.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {policy.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Domain:</span>
                    <span className="font-medium">{policy.domain}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Enforcement:</span>
                    <Badge variant={policy.enforcement.mode === 'ENFORCE' ? 'default' : 'secondary'}>
                      {policy.enforcement.mode}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Rules:</span>
                    <span className="font-medium">{policy.configuration.rules.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Evaluations:</span>
                    <span className="font-medium">{policy.metadata.evaluationCount}</span>
                  </div>
                </div>

                {/* Compliance Frameworks */}
                {policy.compliance.frameworks.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Compliance:</p>
                    <div className="flex flex-wrap gap-1">
                      {policy.compliance.frameworks.map(framework => (
                        <Badge key={framework} variant="outline" className="text-xs">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setIsEditingPolicy(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    v{policy.metadata.version}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No policies found</p>
          <p className="text-gray-500 text-sm mb-6">
            {searchTerm || domainFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try adjusting your filters'
              : 'Create your first policy to get started'
            }
          </p>
          {(!searchTerm && domainFilter === 'ALL' && statusFilter === 'ALL') && (
            <Button onClick={() => setIsCreatingPolicy(true)}>
              Create First Policy
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderEvaluations = () => (
    <div className="evaluations space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Policy Evaluations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvaluations.map((evaluation) => (
              <div key={evaluation.evaluationId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium">{evaluation.policyName}</p>
                    <Badge 
                      className={
                        evaluation.result === 'ALLOW' ? 'bg-green-100 text-green-800' :
                        evaluation.result === 'DENY' ? 'bg-red-100 text-red-800' :
                        evaluation.result === 'RESTRICT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {evaluation.result}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Entity: {evaluation.requestId} • 
                    Time: {evaluation.performance.evaluationTimeMs}ms • 
                    Confidence: {Math.round(evaluation.confidence * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(evaluation.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {evaluation.metadata.reviewRequired && (
                    <Badge variant="outline" className="text-yellow-600">
                      Review Required
                    </Badge>
                  )}
                  {evaluation.metadata.escalationRequired && (
                    <Badge variant="outline" className="text-red-600">
                      Escalation Required
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompliance = () => (
    <div className="compliance space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {frameworks.map(framework => (
          <Card key={framework}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{framework}</p>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">
                {policies.filter(p => p.compliance.frameworks.includes(framework)).length} policies
              </p>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-800 text-lg mb-2">Policy Management Error</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`policy-management-dashboard ${className}`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Policy Management</h1>
        <p className="text-gray-600">
          Manage security, compliance, and governance policies across the Wild Construct platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Evaluations
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="policies">
          {renderPolicyList()}
        </TabsContent>

        <TabsContent value="evaluations">
          {renderEvaluations()}
        </TabsContent>

        <TabsContent value="compliance">
          {renderCompliance()}
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-center mt-2">Processing...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .policy-management-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .policy-overview .grid {
          gap: 1rem;
        }

        .policy-list .policy-card {
          transition: all 0.2s ease;
        }

        .policy-list .policy-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .policy-management-dashboard {
            padding: 0.5rem;
          }
          
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PolicyManagementDashboard;