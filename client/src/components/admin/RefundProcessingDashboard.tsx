/**
 * Refund Processing Dashboard
 * 
 * Administrative interface for managing marketplace refunds, including
 * approval workflows, bulk operations, analytics, and policy management.
 * 
 * Part of Epic 17 - Backstage Admin Controls
 * Task: E17-1753114397360-84B238 - Create refund processing
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
import { Progress } from '../ui/progress';
import { 
  DollarSign,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Settings,
  Eye,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Pause,
  Play
} from 'lucide-react';

interface RefundRequest {
  refundId: string;
  purchaseId: string;
  requesterId: string;
  requesterType: 'customer' | 'admin' | 'system';
  reason: string;
  amount: number;
  refundType: 'full' | 'partial';
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  originalPurchase: {
    customerId: string;
    creatorId: string;
    templateId: string;
    originalAmount: number;
    purchaseDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  approvedBy?: string;
  workflowHistory: any[];
  notes: any[];
}

interface RefundStats {
  totalRequests: number;
  pendingRequests: number;
  approvedToday: number;
  totalRefunded: number;
  averageProcessingTime: number;
  byReason: Record<string, number>;
  byStatus: Record<string, number>;
  creatorImpact: {
    creatorsAffected: number;
    totalCreatorDeductions: number;
    avgDeductionAmount: number;
  };
  performance: {
    approvalRate: number;
    avgResolutionTime: number;
    escalationRate: number;
    customerSatisfaction: number;
  };
}

export interface RefundProcessingDashboardProps {
  className?: string;
}

export   const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<RefundRequest[]>([]);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  
  // Manual refund state
  const [manualRefundData, setManualRefundData] = useState({
    purchaseId: '',
    reason: '',
    amount: '',
    description: '',
    priority: 'medium'
  });
  
  // Bulk operations
  const [selectedRefunds, setSelectedRefunds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');

  // Load refund data
  const loadRefundData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, refundsResponse, approvalsResponse] = await Promise.all([
        fetch(`/api/admin/refunds/stats?dateRange=${dateRange}`),
        fetch('/api/admin/refunds?limit=50'),
        fetch('/api/admin/refunds?status=pending&status=reviewing&limit=20')
      ]);

      const statsResult = await statsResponse.json();
      const refundsResult = await refundsResponse.json();
      const approvalsResult = await approvalsResponse.json();

      if (statsResult.success) setStats(statsResult.data);
      if (refundsResult.success) setRefunds(refundsResult.data);
      if (approvalsResult.success) setPendingApprovals(approvalsResult.data);
      
    } catch (err) {
      setError('Failed to load refund data');
      console.error('Error loading refund data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approve refund
  const approveRefund = async (refundId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/refunds/${refundId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      
      if (response.ok) {
        await loadRefundData();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to approve refund');
      }
    } catch (err) {
      setError('Error approving refund');
      console.error('Error approving refund:', err);
    }
  };

  // Reject refund
  const rejectRefund = async (refundId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/refunds/${refundId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        await loadRefundData();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to reject refund');
      }
    } catch (err) {
      setError('Error rejecting refund');
      console.error('Error rejecting refund:', err);
    }
  };

  // Create manual refund
  const createManualRefund = async () => {
    try {
      if (!manualRefundData.purchaseId || !manualRefundData.reason) {
        setError('Purchase ID and reason are required');
        return;
      }

      const response = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualRefundData,
          amount: manualRefundData.amount ? parseInt(manualRefundData.amount) : undefined,
          requesterType: 'admin'
        })
      });
      
      if (response.ok) {
        // Clear form
        setManualRefundData({
          purchaseId: '',
          reason: '',
          amount: '',
          description: '',
          priority: 'medium'
        });
        await loadRefundData();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to create refund');
      }
    } catch (err) {
      setError('Error creating refund');
      console.error('Error creating refund:', err);
    }
  };

  // Bulk operations
  const executeBulkAction = async () => {
    if (selectedRefunds.size === 0 || !bulkAction) return;
    
    try {
      const refundIds = Array.from(selectedRefunds);
      const endpoint = bulkAction === 'approve' ? 'bulk-approve' : 'bulk-reject';
      
      const response = await fetch(`/api/admin/refunds/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          refundIds,
          reason: bulkAction === 'reject' ? 'Bulk rejection' : undefined
        })
      });
      
      if (response.ok) {
        setSelectedRefunds(new Set());
        setBulkAction('');
        await loadRefundData();
      }
    } catch (err) {
      setError('Error executing bulk action');
      console.error('Error with bulk action:', err);
    }
  };

  useEffect(() => {
    loadRefundData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRefundData, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  // Helper functions
  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !stats) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">Loading refund processing dashboard...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Refund Processing Dashboard
          <Badge variant="secondary">Epic 17</Badge>
          {error && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="refunds">All Refunds</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {stats && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
                    <div className="text-sm text-gray-600">Total Requests</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.approvedToday} approved today
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
                    <div className="text-sm text-gray-600">Pending Approval</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Require attention
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatAmount(stats.totalRefunded)}
                    </div>
                    <div className="text-sm text-gray-600">Total Refunded</div>
                    <div className="text-xs text-gray-500 mt-1">
                      This period
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.averageProcessingTime}h
                    </div>
                    <div className="text-sm text-gray-600">Avg Processing</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Time to completion
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {Math.round(stats.performance.approvalRate * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Approval Rate</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(stats.performance.escalationRate * 100)}% escalated
                    </div>
                  </div>
                </div>

                {/* Status & Reason Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Refund Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(stats.byStatus).map(([status, count]) => (
                          <div key={status} className="flex justify-between items-center">
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                            <Badge className={getStatusColor(status)}>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Refund Reasons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(stats.byReason).map(([reason, count]) => (
                          <div key={reason} className="flex justify-between items-center">
                            <span className="capitalize text-sm">{reason.replace(/_/g, ' ')}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Creator Impact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Creator Impact Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold">{stats.creatorImpact.creatorsAffected}</div>
                        <div className="text-sm text-gray-600">Creators Affected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold">
                          {formatAmount(stats.creatorImpact.totalCreatorDeductions)}
                        </div>
                        <div className="text-sm text-gray-600">Total Deductions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold">
                          {formatAmount(stats.creatorImpact.avgDeductionAmount)}
                        </div>
                        <div className="text-sm text-gray-600">Avg Deduction</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Pending Approvals ({pendingApprovals.length})
              </h3>
              <div className="flex gap-2">
                <Button onClick={loadRefundData} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
                {selectedRefunds.size > 0 && (
                  <div className="flex gap-1">
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Bulk action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">Approve</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={executeBulkAction} size="sm">
                      Execute
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map((refund) => (
                <Card key={refund.refundId} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedRefunds.has(refund.refundId)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedRefunds);
                            if (e.target.checked) {
                              newSelected.add(refund.refundId);
                            } else {
                              newSelected.delete(refund.refundId);
                            }
                            setSelectedRefunds(newSelected);
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{refund.refundId}</span>
                            <Badge className={getPriorityColor(refund.priority)}>
                              {refund.priority}
                            </Badge>
                            <Badge variant="outline">
                              {formatAmount(refund.amount)} {refund.refundType}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                            <div>
                              <span className="font-medium">Purchase:</span> {refund.purchaseId}
                            </div>
                            <div>
                              <span className="font-medium">Customer:</span> {refund.originalPurchase.customerId}
                            </div>
                            <div>
                              <span className="font-medium">Reason:</span> {refund.reason.replace(/_/g, ' ')}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {new Date(refund.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {refund.description && (
                            <p className="text-sm text-gray-700 mb-2">{refund.description}</p>
                          )}
                          
                          {refund.dueDate && new Date(refund.dueDate) < new Date() && (
                            <Badge variant="destructive" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            const notes = prompt('Enter approval notes (optional):');
                            approveRefund(refund.refundId, notes || undefined);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) rejectRefund(refund.refundId, reason);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pendingApprovals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  All refunds have been reviewed
                </div>
              )}
            </div>
          </TabsContent>

          {/* All Refunds Tab */}
          <TabsContent value="refunds" className="space-y-4">
            {/* Search and Filters */}
            <div className="border rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Search by refund or purchase ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('');
                  setSelectedPriority('');
                  setSelectedReason('');
                }}>
                  <Filter className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Refunds List */}
            <div className="space-y-2">
              {refunds.map((refund) => (
                <Card key={refund.refundId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{refund.refundId}</span>
                          <Badge className={getStatusColor(refund.status)}>
                            {refund.status}
                          </Badge>
                          <Badge className={getPriorityColor(refund.priority)}>
                            {refund.priority}
                          </Badge>
                          <Badge variant="outline">
                            {formatAmount(refund.amount)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm text-gray-600">
                          <div>Purchase: {refund.purchaseId}</div>
                          <div>Customer: {refund.originalPurchase.customerId}</div>
                          <div>Reason: {refund.reason.replace(/_/g, ' ')}</div>
                          <div>Type: {refund.refundType}</div>
                          <div>Created: {new Date(refund.createdAt).toLocaleDateString()}</div>
                          <div>
                            {refund.approvedBy ? `Approved by: ${refund.approvedBy}` : 'Not approved'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Refund Analytics</h3>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Approval Rate</span>
                      <div className="text-right">
                        <div className="font-bold">{Math.round(stats.performance.approvalRate * 100)}%</div>
                        <Progress value={stats.performance.approvalRate * 100} className="w-16" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Resolution Time</span>
                      <span className="font-bold">{stats.performance.avgResolutionTime}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Escalation Rate</span>
                      <span className="font-bold">{Math.round(stats.performance.escalationRate * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Customer Satisfaction</span>
                      <span className="font-bold">{stats.performance.customerSatisfaction}/5.0</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Approval rate improving (+5%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-sm">Processing time increasing (+1.2h)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Request volume stable (±2%)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Manual Refund Tab */}
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Manual Refund</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-medium">Purchase ID</label>
                    <Input
                      value={manualRefundData.purchaseId}
                      onChange={(e) => setManualRefundData(prev => ({ ...prev, purchaseId: e.target.value }))}
                      placeholder="Enter purchase ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Amount (cents, optional)</label>
                    <Input
                      type="number"
                      value={manualRefundData.amount}
                      onChange={(e) => setManualRefundData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="Leave empty for full refund"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-medium">Reason</label>
                    <Select 
                      value={manualRefundData.reason} 
                      onValueChange={(value) => setManualRefundData(prev => ({ ...prev, reason: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_as_described">Not as described</SelectItem>
                        <SelectItem value="claude_incompat">Claude incompatible</SelectItem>
                        <SelectItem value="technical_issue">Technical issue</SelectItem>
                        <SelectItem value="quality_issue">Quality issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Priority</label>
                    <Select 
                      value={manualRefundData.priority} 
                      onValueChange={(value) => setManualRefundData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="font-medium">Description</label>
                  <Textarea
                    value={manualRefundData.description}
                    onChange={(e) => setManualRefundData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about the refund..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={createManualRefund}
                    disabled={loading || !manualRefundData.purchaseId || !manualRefundData.reason}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Create Refund
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setManualRefundData({
                      purchaseId: '',
                      reason: '',
                      amount: '',
                      description: '',
                      priority: 'medium'
                    })}
                  >
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
                    <Download className="w-3 h-3" />
                    Export Data
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    Import Refunds
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Refund Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Default Refund Policy</h4>
                        <p className="text-sm text-gray-600">Standard policy for marketplace refunds</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Time limit: 7 days</div>
                      <div>Auto-approve threshold: $50</div>
                      <div>Creator liability: 80%</div>
                      <div>Manager approval: No</div>
                    </div>
                    
                    <div className="mt-3">
                      <Button size="sm" variant="outline">
                        Edit Policy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
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