// Epic 9.4.2 - Approval Review Interface Component
// Detailed interface for reviewing approval requests with diff view
import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  StarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
}
interface ApprovalCriteria {
  id: string;
  name: string;
  description?: string;
  weight: number;
  is_required: boolean;
  conditions: Record<string, any>;
  interface ApprovalRequest {
  id: string;
  workspace_id: string;
  resource_id: string;
  transition_id: string;
  requester_id: string;
  title: string;
  description?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  business_justification?: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'cancelled' | 'expired';
  requested_at: Date;
  due_date?: Date;
  current_approvals: number;
  required_approvals: number;
  approval_percentage: number;
  interface ReviewerAssignment {
  id: string;
  reviewer_id: string;
  assignment_type: 'primary' | 'secondary' | 'escalated';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'abstained';
  reviewed_at?: Date;
  review_comment?: string;
  criteria_evaluations: Record<string, any>;
  interface ApprovalReviewInterfaceProps {
  request: ApprovalRequest;
  workspaceId: string;
  currentUserId: string;
  onReviewSubmit: (decision: 'approve' | 'reject' | 'abstain', comment?: string, criteriaEvaluations?: Record<string, any>) => void;
  onClose: () => void;
  readOnly?: boolean;
  export const ApprovalReviewInterface: React.FC<ApprovalReviewInterfaceProps> = ({,)
  request,
  workspaceId,
  currentUserId,
  onReviewSubmit,
  onClose,
  readOnly = false
}
}) => {
  const [reviewerAssignments, setReviewerAssignments] = useState<ReviewerAssignment>([]);
  const [approvalCriteria, setApprovalCriteria] = useState<ApprovalCriteria>([]);
  const [selectedDecision, setSelectedDecision] = useState<'approve' | 'reject' | 'abstain' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [criteriaEvaluations, setCriteriaEvaluations] = useState<Record<string, any>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'criteria']));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Current user's assignment
  const currentUserAssignment = reviewerAssignments.find(a => a.reviewer_id === currentUserId);
  const canReview = !readOnly && currentUserAssignment?.status === 'pending' && ;
                   ['pending', 'in_review'].includes(request.status);
  useEffect(() => {
    loadReviewData();
  }, [request.id, workspaceId]);
  const loadReviewData = async () => {
    try {
      setLoading(true);
      // Load reviewer assignments
      const reviewersResponse = await fetch(`/api/approval/requests/${request.id}/reviewers`);}
      if (reviewersResponse.ok) {
        const reviewers = await reviewersResponse.json();
        setReviewerAssignments(reviewers);
      // Load approval criteria
      const criteriaResponse = await fetch(`/api/approval/criteria/${workspaceId}`);}
      if (criteriaResponse.ok) {
        const criteria = await criteriaResponse.json();
        setApprovalCriteria(criteria);
        // Initialize criteria evaluations
        const initialEvaluations: Record<string, any> = {};
        criteria.forEach((criterion: ApprovalCriteria) => {
  initialEvaluations[criterion.id] = {
  criteria_id: criterion.id,
  passed: false,
  score: 0,
  comment: '',
};
        });
        setCriteriaEvaluations(initialEvaluations);
    } catch (error) {
      setError('Failed to load review data');
    } finally {
      setLoading(false);
  };
  const handleSubmitReview = () => {
    if (!selectedDecision) return;
    onReviewSubmit(selectedDecision, reviewComment, criteriaEvaluations);
  };
  const handleCriteriaEvaluation = (criteriaId: string, field: string, value: Error) => {
  setCriteriaEvaluations(prev => ({)
  ...prev,
  [criteriaId]: {
  ...prev[criteriaId],
  [field]: value,
}));
  };
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    setExpandedSections(newExpanded);
  };
  const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
  case 'critical': return 'bg-red-100 text-red-800 border-red-200';
  case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
  case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  case 'low': return 'bg-green-100 text-green-800 border-green-200';
  default: return 'bg-gray-100 text-gray-800 border-gray-200';
};
  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'approved': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
  case 'rejected': return <XCircleIcon className="h-4 w-4 text-red-500" />;
  case 'reviewing': return <EyeIcon className="h-4 w-4 text-blue-500" />;
  case 'pending': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
  default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
};
  const calculateOverallScore = () => {
    const totalWeight = approvalCriteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedScore = approvalCriteria.reduce((sum, c) => {
      const evaluation = criteriaEvaluations[c.id];
      return sum + (evaluation?.score || 0) * c.weight;
    }, 0);
    return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
  };
  const getRequiredCriteriaPassed = () => {
    const requiredCriteria = approvalCriteria.filter(c => c.is_required);
    const passedRequired = requiredCriteria.filter(c => criteriaEvaluations[c.id]?.passed).length;
    return { passed: passedRequired, total: requiredCriteria.length };
  };
  if (loading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error) {
    return;
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
  return;
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{request.title}</h2>
            <div className="mt-2 flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(request.urgency)}`}>}
                {request.urgency.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">
                Requested by {request.requester_id} on {new Date(request.requested_at).toLocaleDateString()}
              </span>
              {request.due_date && ()
                <span className="text-sm text-gray-600">
                  Due: {new Date(request.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Approval Progress: {request.current_approvals} of {request.required_approvals}</span>
            <span>{Math.round(request.approval_percentage)}%</span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${request.approval_percentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Overview Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              <span className="font-medium">Request Overview</span>
            </div>
            {expandedSections.has('overview') ? ()
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : ()
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSections.has('overview') && ()
            <div className="border-t border-gray-200 p-4 space-y-4">
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
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Resource Details</h4>
                <div className="text-sm text-gray-700">
                  <p>Resource ID: {request.resource_id}</p>
                  <p>Transition ID: {request.transition_id}</p>
                  <p>Workspace: {request.workspace_id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Reviewers Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('reviewers')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span className="font-medium">Reviewers ({reviewerAssignments.length})</span>
            </div>
            {expandedSections.has('reviewers') ? ()
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : ()
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {expandedSections.has('reviewers') && ()
            <div className="border-t border-gray-200 p-4">
              <div className="space-y-3">
                {reviewerAssignments.map((assignment) => ()
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(assignment.status)}
                        <span className="font-medium">{assignment.reviewer_id}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
  assignment.assignment_type === 'escalated' ? 'bg-orange-100 text-orange-800' :,
  assignment.assignment_type === 'secondary' ? 'bg-blue-100 text-blue-800' :,
  'bg-gray-100 text-gray-800'
}`}>
                        {assignment.assignment_type}
                      </span>
                      {assignment.reviewer_id === currentUserId && ()
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {assignment.reviewed_at ? ()
                        <span>Reviewed {new Date(assignment.reviewed_at).toLocaleDateString()}</span>
                      ) : ()
                        <span>Pending review</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Criteria Evaluation Section */}
        {canReview && approvalCriteria.length > 0 && ()
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('criteria')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Evaluation Criteria ({approvalCriteria.length})</span>
                <span className="text-sm text-gray-600">
                  Score: {calculateOverallScore()}%
                </span>
              </div>
              {expandedSections.has('criteria') ? ()
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              ) : ()
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.has('criteria') && ()
              <div className="border-t border-gray-200 p-4">
                <div className="space-y-4">
                  {approvalCriteria.map((criterion) => ()
                    <div key={criterion.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{criterion.name}</span>
                          {criterion.is_required && ()
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              Required
                            </span>
                          )}
                          <span className="text-sm text-gray-600">
                            Weight: {criterion.weight}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={criteriaEvaluations[criterion.id]?.passed || false}
                              onChange={(e) => handleCriteriaEvaluation(criterion.id, 'passed', e.target.checked)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Passed</span>
                          </label>
                        </div>
                      </div>
                      {criterion.description && ()
                        <p className="text-sm text-gray-600 mb-3">{criterion.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Score (0-100)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={criteriaEvaluations[criterion.id]?.score || 0}
                            onChange={(e) => handleCriteriaEvaluation(criterion.id, 'score', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comment
                          </label>
                          <textarea
                            value={criteriaEvaluations[criterion.id]?.comment || ''}
                            onChange={(e) => handleCriteriaEvaluation(criterion.id, 'comment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Add evaluation comment..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Criteria Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Evaluation Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Overall Score:</span>
                        <span className="ml-2 font-medium">{calculateOverallScore()}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Required Criteria:</span>
                        <span className="ml-2 font-medium">
                          {getRequiredCriteriaPassed().passed} of {getRequiredCriteriaPassed().total} passed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Review Decision Section */}
        {canReview && ()
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Your Review Decision</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="decision"
                    value="approve"
                    checked={selectedDecision === 'approve'}
                    onChange={(e) => setSelectedDecision(e.target.value as 'approve')}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Approve</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={selectedDecision === 'reject'}
                    onChange={(e) => setSelectedDecision(e.target.value as 'reject')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                  <span className="text-red-800 font-medium">Reject</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="decision"
                    value="abstain"
                    checked={selectedDecision === 'abstain'}
                    onChange={(e) => setSelectedDecision(e.target.value as 'abstain')}
                    className="text-gray-600 focus:ring-gray-500"
                  />
                  <ClockIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-800 font-medium">Abstain</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Comment {selectedDecision === 'reject' ? '(required)' : '(optional)'}
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Provide your review feedback..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="border-t border-gray-200 p-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {canReview ? ()
            'Complete your review to submit your decision.'
          ) : currentUserAssignment ? ()
            'You have already submitted your review.'
          ) : ()
            'You are not assigned as a reviewer for this request.'
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
          {canReview && ()
            <button
              onClick={handleSubmitReview}
              disabled={!selectedDecision || (selectedDecision === 'reject' && !reviewComment.trim())}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};