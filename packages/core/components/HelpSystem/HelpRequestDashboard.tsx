/**
 * Epic 16 Help Request Dashboard
 * 
 * Comprehensive dashboard for managing help requests with intelligent routing,
 * knowledge base integration, and real-time analytics.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  HelpRequest,
  HelpRequestType,
  HelpCategory,
  HelpPriority,
  HelpRequestStatus,
  Epic16HelpRequestService,
  KnowledgeBaseArticle
} from '../../services/Epic16HelpRequestService';
}
interface HelpRequestDashboardProps {
  helpService: Epic16HelpRequestService;
  userId: string;
  userRole: 'user' | 'agent' | 'admin';
  onRequestSelect?: (request: HelpRequest) => void;
}
interface HelpRequestFilters {
  status: HelpRequestStatus;
  category: HelpCategory;
  priority: HelpPriority;
  type: HelpRequestType;
  assignedTo?: string;
}
  dateRange?: { start: Date; end: Date };
  searchQuery: string;

export const HelpRequestDashboard: React.FC<HelpRequestDashboardProps> = ({)
  helpService,
  userId,
  userRole,
  onRequestSelect
}) => {
  // State management
  const [requests, setRequests] = useState<HelpRequest>([]);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HelpRequestFilters>({)
  status: [],
  category: [],
  priority: [],
  type: [],
  searchQuery: '',
});
  const [pagination, setPagination] = useState({)
  page: 0,
  limit: 25,
  total: 0,
  hasMore: false,
});
  const [_____showCreateModal, setShowCreateModal] = useState(false);
  const [analytics, setAnalytics] = useState<unknown>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle>([]);
  // Load help requests
  const loadRequests = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
  const filterCriteria = {
  status: filters.status.length > 0 ? filters.status : undefined,
  category: filters.category.length > 0 ? filters.category : undefined,
  priority: filters.priority.length > 0 ? filters.priority : undefined,
  assignedTo: filters.assignedTo,
  dateRange: filters.dateRange,
  limit: pagination.limit,
  offset: pagination.page * pagination.limit,
};
      const result = await helpService.getHelpRequests(filterCriteria);
      setRequests(result.requests);
      setPagination(prev => ({)
  ...prev,
  total: result.total,
  hasMore: result.hasMore,
}));
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load help requests');
} finally {
      setLoading(false);
  }, [helpService, filters, pagination.page, pagination.limit]);
  // Load analytics
  const loadAnalytics = useCallback(async () => {
  try {
  const timeRange = {
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days,
  end: new Date(),
};
      const analyticsData = await helpService.getAnalytics(timeRange);
      setAnalytics(analyticsData);
    } catch (err) {
  console.error('Failed to load analytics:', err);
}, [helpService]);
  // Load knowledge base articles
  const loadKnowledgeBase = useCallback(async () => {
  try {
  const articles = await helpService.searchKnowledgeBase({)
  query: '',
  limit: 10,
});
      setKnowledgeBase(articles);
    } catch (err) {
  console.error('Failed to load knowledge base:', err);
}, [helpService]);
  // Effects
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);
  useEffect(() => {
    loadAnalytics();
    loadKnowledgeBase();
  }, [loadAnalytics, loadKnowledgeBase]);
  // Filter requests based on search query
  const filteredRequests = useMemo(() => {
    if (!filters.searchQuery) return requests;
    const query = filters.searchQuery.toLowerCase();
    return requests.filter(request =>)
      request.title.toLowerCase().includes(query) ||
      request.description.toLowerCase().includes(query) ||
      request.id.toLowerCase().includes(query) ||
      request.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [requests, filters.searchQuery]);
  // Handle request status update
  const handleStatusUpdate = async (requestId: string, newStatus: HelpRequestStatus) => {
    try {
      await helpService.updateStatus(requestId, newStatus, userId);
      await loadRequests();
      if (selectedRequest?.id === requestId) {
        const updatedRequest = requests.find(r => r.id === requestId);
        if (updatedRequest) {
          setSelectedRequest({ ...updatedRequest, status: newStatus });
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to update request status');
};
  // Handle request escalation
  const handleEscalation = async (requestId: string, reason: string) => {
    try {
      await helpService.escalateRequest(requestId, reason, userId);
      await loadRequests();
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to escalate request');
};
  // Handle knowledge base search
  const searchKnowledgeBase = async (query: string) => {
    try {
      const results = await helpService.searchKnowledgeBase({ query, limit: 5 });
      setKnowledgeBase(results);
    } catch (err) {
  console.error('Knowledge base search failed:', err);
};
  // Reset filters
  const resetFilters = () => {
  setFilters({)
  status: [],
  category: [],
  priority: [],
  type: [],
  searchQuery: '',
});
    setPagination(prev => ({ ...prev, page: 0 }));
  };
  // Render status badge
  const renderStatusBadge = (status: HelpRequestStatus) => {
  const colors = {
  [HelpRequestStatus.SUBMITTED]: 'bg-blue-100 text-blue-800',
  [HelpRequestStatus.TRIAGED]: 'bg-purple-100 text-purple-800',
  [HelpRequestStatus.AUTO_SUGGESTED]: 'bg-yellow-100 text-yellow-800',
  [HelpRequestStatus.IN_PROGRESS]: 'bg-orange-100 text-orange-800',
  [HelpRequestStatus.PENDING_USER]: 'bg-gray-100 text-gray-800',
  [HelpRequestStatus.ESCALATED]: 'bg-red-500 text-white',
  [HelpRequestStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [HelpRequestStatus.CLOSED]: 'bg-gray-300 text-gray-700',
  [HelpRequestStatus.REOPENED]: 'bg-red-100 text-red-800',
};
    return;
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>}
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };
  // Render priority badge
  const renderPriorityBadge = (priority: HelpPriority) => {
  const colors = {
  [HelpPriority.LOW]: 'bg-gray-100 text-gray-800',
  [HelpPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [HelpPriority.HIGH]: 'bg-yellow-100 text-yellow-800',
  [HelpPriority.URGENT]: 'bg-orange-100 text-orange-800',
  [HelpPriority.CRITICAL]: 'bg-red-500 text-white',
};
    return;
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>}
        {priority.toUpperCase()}
      </span>
    );
  };
  if (loading && requests.length === 0) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading help requests...</span>
        </div>
      </div>
    );
  return;
    <div className="help-request-dashboard h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Help Request System</h1>
            <p className="text-sm text-gray-600">
              Epic 16 Intelligent Help & Support Management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {userRole !== 'user' && ()
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Create Request
              </button>
            )}
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {error && ()
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 flex">
        {/* Sidebar - Analytics and Knowledge Base */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          {/* Analytics Dashboard */}
          {analytics && ()
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics (30 days)</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalRequests}</div>
                  <div className="text-xs text-gray-600">Total Requests</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.autoResolutionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Auto-Resolved</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(analytics.averageResponseTime)}m
                  </div>
                  <div className="text-xs text-gray-600">Avg Response</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.customerSatisfaction.toFixed(1)}/5
                  </div>
                  <div className="text-xs text-gray-600">Satisfaction</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SLA Compliance:</span>
                    <span className="font-medium">{(100 - analytics.slaBreachRate).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deflection Rate:</span>
                    <span className="font-medium">{analytics.deflectionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolution Time:</span>
                    <span className="font-medium">{Math.round(analytics.averageResolutionTime / 60)}h</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Knowledge Base Quick Access */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Knowledge Base</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                View All
              </button>
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search articles..."
                onChange={(e) => searchKnowledgeBase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              {knowledgeBase.slice(0, 5).map((article) => ()
                <div key={article.id} className="bg-white border border-gray-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{article.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{article.summary}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{article.viewCount} views</span>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-gray-500">{article.helpfulnessRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="Search requests..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.values(HelpRequestStatus).map((status) => ()
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={(e) => {
                        const newStatus = e.target.checked;
                          ? [...filters.status, status]
                          : filters.status.filter(s => s !== status);
                        setFilters({ ...filters, status: newStatus });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {status.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="space-y-1">
                {Object.values(HelpPriority).map((priority) => ()
                  <label key={priority} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(priority)}
                      onChange={(e) => {
                        const newPriority = e.target.checked;
                          ? [...filters.priority, priority]
                          : filters.priority.filter(p => p !== priority);
                        setFilters({ ...filters, priority: newPriority });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 capitalize">
                      {priority}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.values(HelpCategory).map((category) => ()
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={(e) => {
                        const newCategory = e.target.checked;
                          ? [...filters.category, category]
                          : filters.category.filter(c => c !== category);
                        setFilters({ ...filters, category: newCategory });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {category.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Main Content - Request List */}
        <div className="flex-1 flex flex-col">
          {/* Request List Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredRequests.length} of {pagination.total} requests
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value), page: 0 })}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </div>
          {/* Request List */}
          <div className="flex-1 overflow-y-auto">
            {filteredRequests.length === 0 ? ()
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No help requests found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.status.length || filters.category.length || filters.searchQuery
                    ? 'Try adjusting your filters.'
                    : 'Get started by creating your first help request.'}
                </p>
              </div>
            ) : ()
              <div className="divide-y divide-gray-200">
                {filteredRequests.map((request) => ()
                  <HelpRequestListItem
                    key={request.id}
                    request={request}
                    onSelect={() => {
                      setSelectedRequest(request);
                      onRequestSelect?.(request);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                    onEscalate={handleEscalation}
                    currentUserId={userId}
                    userRole={userRole}
                    selected={selectedRequest?.id === request.id}
                    renderStatusBadge={renderStatusBadge}
                    renderPriorityBadge={renderPriorityBadge}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Pagination */}
          {pagination.total > pagination.limit && ()
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                  disabled={pagination.page === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page + 1} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasMore}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Help Request List Item Component
}
interface HelpRequestListItemProps {
  request: HelpRequest;
  onSelect: () => void;
  onStatusUpdate: (requestId: string, newStatus: HelpRequestStatus) => void;
  onEscalate: (requestId: string, reason: string) => void;
  currentUserId: string;
  userRole: 'user' | 'agent' | 'admin';
  selected: boolean;
  renderStatusBadge: (status: HelpRequestStatus) => React.ReactNode;
  renderPriorityBadge: (priority: HelpPriority) => React.ReactNode;
  const HelpRequestListItem: React.FC<HelpRequestListItemProps> = ({,)
  request,
  onSelect,
  onStatusUpdate,
  onEscalate,
  currentUserId,
  userRole,
  selected,
  renderStatusBadge,
  renderPriorityBadge
}
}) => {
  const [showActions, setShowActions] = useState(false);
  const canModify = userRole === 'admin' || userRole === 'agent';
  const isOverdue = request.sla.responseTime.deadline < new Date() && !request.firstResponseAt;
  const isSLAWarning = request.sla.responseTime.deadline.getTime() - Date.now() < (60 * 60 * 1000); // 1 hour warning;
  const routingStrategy = request.routingDecision.strategy;
  const routingIcon = {
  'auto_resolve': '🤖',
  'knowledge_base': '📚',
  'community': '👥',
  'support_agent': '👨‍💼',
  'specialist': '🎯',
}[routingStrategy] || '❓';
  return;
    <div
      className={`relative p-4 hover:bg-gray-50 cursor-pointer ${selected ? 'bg-blue-50 border-l-4 border-blue-500' : ''} ${isOverdue ? 'bg-red-50' : isSLAWarning ? 'bg-yellow-50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-blue-600">#{request.id.split('-').pop()}</span>
            {renderStatusBadge(request.status)}
            {renderPriorityBadge(request.priority)}
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded" title={`Routing: ${routingStrategy}`}>}
              {routingIcon} {routingStrategy.replace('_', ' ')}
            </span>
            {request.autoResolvedBy && ()
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                AUTO-RESOLVED
              </span>
            )}
            {isOverdue && ()
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                OVERDUE
              </span>
            )}
            {isSLAWarning && !isOverdue && ()
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                SLA WARNING
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {request.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {request.description}
          </p>
          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
            <span>Type: {request.type.replace('_', ' ')}</span>
            <span>Category: {request.category.replace('_', ' ')}</span>
            {request.assignedTo && <span>Assigned: {request.assignedTo}</span>}
            <span>Created: {request.createdAt.toLocaleDateString()}</span>
            {request.responses.length > 0 && ()
              <span>{request.responses.length} response{request.responses.length !== 1 ? 's' : ''}</span>
            )}
            {request.suggestedArticles.length > 0 && ()
              <span>{request.suggestedArticles.length} suggested articles</span>
            )}
          </div>
          {/* Smart Routing Info */}
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-medium">Routing:</span> {request.routingDecision.reasoning} 
            <span className="ml-2">Confidence: {(request.routingDecision.confidence * 100).toFixed(0)}%</span>
            <span className="ml-2">Est. Resolution: {request.routingDecision.estimatedResolutionTime}min</span>
          </div>
        </div>
        {canModify && ()
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {showActions && ()
              <div className="absolute right-4 top-12 z-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-32">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusUpdate(request.id, HelpRequestStatus.IN_PROGRESS);
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Start Progress
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusUpdate(request.id, HelpRequestStatus.RESOLVED);
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEscalate(request.id, 'Manual escalation');
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Escalate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpRequestDashboard;