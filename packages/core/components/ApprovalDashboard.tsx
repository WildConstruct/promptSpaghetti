// Epic 9.4.2 - Approval Dashboard Component
// Comprehensive dashboard for managing approval requests and reviews
import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  ArrowPathIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
interface ApprovalRequest {
  id: string;
  workspace_id: string;
  resource_id: string;
  rule_id: string;
  transition_id: string;
  requester_id: string;
  title: string;
  description?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  business_justification?: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  requested_at: Date;
  due_date?: Date;
  completed_at?: Date;
  current_approvals: number;
  required_approvals: number;
  approval_percentage: number;
  escalated_at?: Date;
  escalation_reason?: string;
}
interface ReviewerAssignment {
  id: string;
  approval_request_id: string;
  reviewer_id: string;
  assignment_type: 'primary' | 'secondary' | 'escalated';
  assignment_reason?: string;
  assigned_at: Date;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'abstained';
  reviewed_at?: Date;
  review_comment?: string;
  criteria_evaluations: Record<string, any>;
}
interface ApprovalDashboardProps {
  workspaceId: string;
  currentUserId: string;
  mode?: 'reviewer' | 'requester' | 'admin';
}

export const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({)
  workspaceId,
  currentUserId,
  mode = 'reviewer'
}) => {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [reviewerAssignments, setReviewerAssignments] = useState<Record<string, ReviewerAssignment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_____selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({)
    status: '',
    urgency: '',
    overdue: false,
    search: '',
  });
  const [sortBy, setSortBy] = useState<'requested_at' | 'due_date' | 'urgency' | 'approval_percentage'>('requested_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  // Load approval requests
  useEffect(() => {
    fetchApprovalRequests();
  }, [workspaceId, currentUserId, mode, filters, activeTab]);
  const fetchApprovalRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (mode === 'reviewer') {
        queryParams.append('reviewer_id', currentUserId);
      } else if (mode === 'requester') {
        queryParams.append('requester_id', currentUserId);
      }
      if (activeTab === 'pending') {
        queryParams.append('status', 'pending,in_review');
      } else if (activeTab === 'completed') {
        queryParams.append('status', 'approved,rejected,cancelled,expired');
      }
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.urgency) queryParams.append('urgency', filters.urgency);
      if (filters.overdue) queryParams.append('overdue', 'true');
      const response = await fetch(`/api/approval/requests/${workspaceId}?${queryParams}`);}
      if (!response.ok) {
        throw new Error('Failed to fetch approval requests');
      }
      const requests = await response.json();
      setApprovalRequests(requests);
      // Load reviewer assignments for each request
      const assignments: Record<string, ReviewerAssignment[]> = {};
      for (const request of requests) {
        const reviewersResponse = await fetch(`/api/approval/requests/${request.id}/reviewers`);}
        if (reviewersResponse.ok) {
          assignments[request.id] = await reviewersResponse.json();
        }
      }
      setReviewerAssignments(assignments);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch approval requests');
    } finally {
      setLoading(false);
    }
  };
  const handleReviewSubmission = async (;)
    requestId: string,
    decision: 'approve' | 'reject' | 'abstain',
    comment?: string
  ) => {
    try {
      const response = await fetch(`/api/approval/requests/${requestId}/review`, {)}
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({),
          decision,
          comment
        })
      });
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      // Refresh the data
      await fetchApprovalRequests();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'in_review': return 'bg-blue-100 text-blue-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    case 'expired': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
    case 'pending': return <ClockIcon className="h-4 w-4" />;
    case 'in_review': return <EyeIcon className="h-4 w-4" />;
    case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
    case 'rejected': return <XCircleIcon className="h-4 w-4" />;
    case 'cancelled': return <XCircleIcon className="h-4 w-4" />;
    case 'expired': return <ExclamationTriangleIcon className="h-4 w-4" />;
    default: return <ClockIcon className="h-4 w-4" />;
    }
  };
  const isOverdue = (request: ApprovalRequest) => {
    return request.due_date && new Date(request.due_date) < new Date() && 
           ['pending', 'in_review'].includes(request.status);
  };
  const canReview = (request: ApprovalRequest) => {
    const assignment = reviewerAssignments[request.id]?.find(a => a.reviewer_id === currentUserId);
    return assignment && assignment.status === 'pending' && 
           ['pending', 'in_review'].includes(request.status);
  };
  const toggleRequestExpansion = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };
  const filteredAndSortedRequests = approvalRequests;
    .filter(request => {)
      if (filters.search && !request.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      switch (sortBy) {
      case 'requested_at':
        return (new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime()) * multiplier;
      case 'due_date':
        const aDate = a.due_date ? new Date(a.due_date).getTime() : 0;
        const bDate = b.due_date ? new Date(b.due_date).getTime() : 0;
        return (aDate - bDate) * multiplier;
      case 'urgency':
        const urgencyOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        return (urgencyOrder[a.urgency] - urgencyOrder[b.urgency]) * multiplier;
      case 'approval_percentage':
        return (a.approval_percentage - b.approval_percentage) * multiplier;
      default:
        return 0;
      }
    });
  if (loading) {
    return ()
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) {
    return ()
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }
  return ()
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {mode === 'reviewer' ? 'Review Dashboard' : 
                  mode === 'requester' ? 'My Requests' : 'Approval Management'}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {mode === 'reviewer' ? 'Approval requests requiring your review' :
                  mode === 'requester' ? 'Your approval requests and their status' :
                    'Manage all approval requests in this workspace'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchApprovalRequests}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="flex space-x-8 px-6">
          {[
            { id: 'pending', label: 'Pending', count: approvalRequests.filter(r => ['pending', 'in_review'].includes(r.status)).length },
            { id: 'completed', label: 'Completed', count: approvalRequests.filter(r => ['approved', 'rejected', 'cancelled', 'expired'].includes(r.status)).length },
            { id: 'all', label: 'All', count: approvalRequests.length }
          ].map(tab => ()
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Filters */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.urgency}
            onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.overdue}
              onChange={(e) => setFilters(prev => ({ ...prev, overdue: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Overdue only</span>
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="requested_at">Requested Date</option>
              <option value="due_date">Due Date</option>
              <option value="urgency">Urgency</option>
              <option value="approval_percentage">Progress</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded hover:bg-gray-100"
            >
              {sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      {/* Request List */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedRequests.length === 0 ? ()
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No approval requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'pending' ? 'No pending approvals at this time.' : 
                activeTab === 'completed' ? 'No completed approvals found.' : 
                  'No approval requests match your current filters.'}
            </p>
          </div>
        ) : ()
          filteredAndSortedRequests.map((request) => ()
            <div key={request.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleRequestExpansion(request.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedRequests.has(request.id) ? ()
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : ()
                        <ChevronUpIcon className="h-4 w-4" />
                      )}
                    </button>
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>}
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>}
                        {request.urgency}
                      </span>
                      {isOverdue(request) && ()
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          Overdue
                        </span>
                      )}
                      {request.escalated_at && ()
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <BellIcon className="h-3 w-3 mr-1" />
                          Escalated
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Requested {new Date(request.requested_at).toLocaleDateString()}</span>
                    </div>
                    {request.due_date && ()
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Due {new Date(request.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>By {request.requester_id}</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Approval Progress: {request.current_approvals} of {request.required_approvals}
                      </span>
                      <span className="text-gray-600">{Math.round(request.approval_percentage)}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${request.approval_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {canReview(request) && ()
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReviewSubmission(request.id, 'approve')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1 inline" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewSubmission(request.id, 'reject')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1 inline" />
                        Reject
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <EyeIcon className="h-4 w-4 mr-1 inline" />
                    View Details
                  </button>
                </div>
              </div>
              {/* Expanded Details */}
              {expandedRequests.has(request.id) && ()
                <div className="mt-4 space-y-4">
                  {request.description && ()
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-700">{request.description}</p>
                    </div>
                  )}
                  {request.business_justification && ()
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Business Justification</h4>
                      <p className="text-sm text-gray-700">{request.business_justification}</p>
                    </div>
                  )}
                  {/* Reviewers */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Reviewers</h4>
                    <div className="space-y-2">
                      {reviewerAssignments[request.id]?.map((assignment) => ()
                        <div key={assignment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium">{assignment.reviewer_id}</span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(assignment.status)}`}>}
                              {assignment.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              assignment.assignment_type === 'escalated' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {assignment.assignment_type}
                            </span>
                          </div>
                          {assignment.reviewed_at && ()
                            <span className="text-xs text-gray-500">
                              Reviewed {new Date(assignment.reviewed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};