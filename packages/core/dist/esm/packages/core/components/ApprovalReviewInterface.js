import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Epic 9.4.2 - Approval Review Interface Component
// Detailed interface for reviewing approval requests with diff view
import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, EyeIcon, ClockIcon, UserIcon, DocumentTextIcon, ChevronDownIcon, ChevronRightIcon } from ClipboardDocumentListIcon;
from;
'@heroicons/react/24/outline';
readOnly = false;
{
    const [reviewerAssignments, setReviewerAssignments] = useState([]);
    const [approvalCriteria, setApprovalCriteria] = useState([]);
    const [selectedDecision, setSelectedDecision] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [criteriaEvaluations, setCriteriaEvaluations] = useState({});
    const [expandedSections, setExpandedSections] = useState(new Set(['overview', 'criteria']));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Current user's assignment
    const currentUserAssignment = reviewerAssignments.find(a => a.reviewer_id === currentUserId);
    const canReview = !readOnly && currentUserAssignment?.status === 'pending' && ;
    ['pending', 'in_review'].includes(request.status);
    useEffect(() => { loadReviewData(); }, [request.id, workspaceId]);
    const loadReviewData = async () => {
        try {
            setLoading(true);
            // Load reviewer assignments
            const reviewersResponse = await fetch(`/api/approval/requests/${request.id}/reviewers`);
        }
        finally {
        }
        if (reviewersResponse.ok) {
            const reviewers = await reviewersResponse.json();
            setReviewerAssignments(reviewers);
            // Load approval criteria
            const criteriaResponse = await fetch(`/api/approval/criteria/${workspaceId}`);
        }
        if (criteriaResponse.ok) {
            const criteria = await criteriaResponse.json();
            setApprovalCriteria(criteria);
            // Initialize criteria evaluations
            const initialEvaluations = {};
            criteria.forEach((criterion) => {
                initialEvaluations[criterion.id] = {
                    criteria_id: criterion.id,
                    passed: false,
                    score: 0,
                    comment: ''
                };
            });
        }
        ;
        setCriteriaEvaluations(initialEvaluations);
        try {
        }
        catch (error) {
            setError('Failed to load review data');
        }
        finally {
            setLoading(false);
        }
        ;
        const handleSubmitReview = () => {
            if (!selectedDecision)
                return;
            onReviewSubmit(selectedDecision, reviewComment, criteriaEvaluations);
        };
        const handleCriteriaEvaluation = (criteriaId, field, value) => {
            setCriteriaEvaluations(prev => ({}), ...prev[criteriaId], {
                ...prev[criteriaId][field], value
            });
        };
    };
    const toggleSection = (section) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        }
        else {
            newExpanded.add(section);
            setExpandedSections(newExpanded);
        }
        ;
        const getUrgencyColor = (urgency) => {
            switch (urgency) {
                case 'critical': return 'bg-red-100 text-red-800 border-red-200';
                case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
                case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                case 'low': return 'bg-green-100 text-green-800 border-green-200';
                default: return 'bg-gray-100 text-gray-800 border-gray-200';
            }
            ;
            const getStatusIcon = (status) => {
                switch (status) {
                    case 'approved': return _jsx(CheckCircleIcon, { className: "h-4 w-4 text-green-500" });
                    case 'rejected': return _jsx(XCircleIcon, { className: "h-4 w-4 text-red-500" });
                    case 'reviewing': return _jsx(EyeIcon, { className: "h-4 w-4 text-blue-500" });
                    case 'pending': return _jsx(ClockIcon, { className: "h-4 w-4 text-yellow-500" });
                    default: return _jsx(ClockIcon, { className: "h-4 w-4 text-gray-500" });
                }
                ;
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
                    _jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) });
                }
            };
        };
    };
    ;
    if (error) {
        return;
        _jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx(XCircleIcon, { className: "h-5 w-5 text-red-400" }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: error })] })] }) });
        ;
        return;
        _jsxs("div", { className: "max-w-4xl mx-auto bg-white rounded-lg shadow-lg", children: [_jsxs("div", { className: "border-b border-gray-200 p-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: request.title }), _jsxs("div", { className: "mt-2 flex items-center space-x-4", children: [_jsxs("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(request.urgency)}`, children: ["}", request.urgency.toUpperCase()] }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Requested by ", request.requester_id, " on ", new Date(request.requested_at).toLocaleDateString()] }), request.due_date && ()
                                                < span, " className=\"text-sm text-gray-600\"> Due: ", new Date(request.due_date).toLocaleDateString()] }), ")}"] }) }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(XCircleIcon, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [_jsxs("span", { children: ["Approval Progress: ", request.current_approvals, " of ", request.required_approvals] }), _jsxs("span", { children: [Math.round(request.approval_percentage), "%"] })] }), _jsx("div", { className: "mt-1 w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${request.approval_percentage}%` } }) })] })] })
            ,
                _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "border border-gray-200 rounded-lg", children: [_jsxs("button", { onClick: () => toggleSection('overview'), className: "w-full flex items-center justify-between p-4 hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(DocumentTextIcon, { className: "h-5 w-5 text-gray-400" }), _jsx("span", { className: "font-medium", children: "Request Overview" })] }), expandedSections.has('overview') ? ()
                                            < ChevronDownIcon : , " className=\"h-5 w-5 text-gray-400\" /> ) : ()", _jsx(ChevronRightIcon, { className: "h-5 w-5 text-gray-400" }), ")}"] }), expandedSections.has('overview') && ()
                                    < div, " className=\"border-t border-gray-200 p-4 space-y-4\">", request.description && ()
                                    < div >
                                    (_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Description" })
                                        ,
                                            _jsx("p", { className: "text-sm text-gray-700", children: request.description }))] }), ")}", request.business_justification && ()
                            < div >
                            (_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Business Justification" })
                                ,
                                    _jsx("p", { className: "text-sm text-gray-700", children: request.business_justification }))] });
    }
    _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Resource Details" }), _jsxs("div", { className: "text-sm text-gray-700", children: [_jsxs("p", { children: ["Resource ID: ", request.resource_id] }), _jsxs("p", { children: ["Transition ID: ", request.transition_id] }), _jsxs("p", { children: ["Workspace: ", request.workspace_id] })] })] });
    div >
    ;
}
div >
    { /* Reviewers Section */}
    < div;
className = "border border-gray-200 rounded-lg" >
    _jsxs("button", { onClick: () => toggleSection('reviewers'), className: "w-full flex items-center justify-between p-4 hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(UserIcon, { className: "h-5 w-5 text-gray-400" }), _jsxs("span", { className: "font-medium", children: ["Reviewers (", reviewerAssignments.length, ")"] })] }), expandedSections.has('reviewers') ? ()
                < ChevronDownIcon : , " className=\"h-5 w-5 text-gray-400\" /> ) : ()", _jsx(ChevronRightIcon, { className: "h-5 w-5 text-gray-400" }), ")}"] });
{
    expandedSections.has('reviewers') && ()
        < div;
    className = "border-t border-gray-200 p-4" >
        (_jsx("div", { className: "space-y-3", children: reviewerAssignments.map((assignment) => ()
                < div, key = { assignment, : .id }, className = "flex items-center justify-between p-3 bg-gray-50 rounded" >
                _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(assignment.status), _jsx("span", { className: "font-medium", children: assignment.reviewer_id })] }), _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${assignment.assignment_type === 'escalated' ? 'bg-orange-100 text-orange-800' :
                                assignment.assignment_type === 'secondary' ? 'bg-blue-100 text-blue-800' : }
  'bg-gray-100 text-gray-800'
`, children: assignment.assignment_type }), assignment.reviewer_id === currentUserId && ()
                            < span, " className=\"px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800\"> You"] })) })
            ,
                _jsxs("div", { className: "text-sm text-gray-600", children: [assignment.reviewed_at ? ()
                            < span > Reviewed : , " ", new Date(assignment.reviewed_at).toLocaleDateString()] }));
    ()
        < span > Pending;
    review;
    span >
    ;
}
div >
;
div >
;
div >
;
div >
;
div >
    { /* Criteria Evaluation Section */};
{
    canReview && approvalCriteria.length > 0 && ()
        < div;
    className = "border border-gray-200 rounded-lg" >
        _jsxs("button", { onClick: () => toggleSection('criteria'), className: "w-full flex items-center justify-between p-4 hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(ClipboardDocumentListIcon, { className: "h-5 w-5 text-gray-400" }), _jsxs("span", { className: "font-medium", children: ["Evaluation Criteria (", approvalCriteria.length, ")"] }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Score: ", calculateOverallScore(), "%"] })] }), expandedSections.has('criteria') ? ()
                    < ChevronDownIcon : , " className=\"h-5 w-5 text-gray-400\" /> ) : ()", _jsx(ChevronRightIcon, { className: "h-5 w-5 text-gray-400" }), ")}"] });
    {
        expandedSections.has('criteria') && ()
            < div;
        className = "border-t border-gray-200 p-4" >
            _jsx("div", { className: "space-y-4", children: approvalCriteria.map((criterion) => ()
                    < div, key = { criterion, : .id }, className = "border border-gray-200 rounded-lg p-4" >
                    (_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium", children: criterion.name }), criterion.is_required && ()
                                        < span, " className=\"px-2 py-1 bg-red-100 text-red-800 text-xs rounded\"> Required"] }), ")}", _jsxs("span", { className: "text-sm text-gray-600", children: ["Weight: ", criterion.weight] })] })
                        ,
                            _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: criteriaEvaluations[criterion.id]?.passed || false, onChange: (e) => handleCriteriaEvaluation(criterion.id, 'passed', e.target.checked), className: "rounded border-gray-300 text-green-600 focus:ring-green-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "Passed" })] }) }))) });
        {
            criterion.description && ()
                < p;
            className = "text-sm text-gray-600 mb-3" > { criterion, : .description };
            p >
            ;
        }
        _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Score (0-100)" }), _jsx("input", { type: "number", min: "0", max: "100", value: criteriaEvaluations[criterion.id]?.score || 0, onChange: (e) => handleCriteriaEvaluation(criterion.id, 'score', parseInt(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Comment" }), _jsx("textarea", { value: criteriaEvaluations[criterion.id]?.comment || '', onChange: (e) => handleCriteriaEvaluation(criterion.id, 'comment', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 2, placeholder: "Add evaluation comment..." })] })] });
        div >
        ;
    }
    { /* Criteria Summary */ }
    _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "Evaluation Summary" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Overall Score:" }), _jsxs("span", { className: "ml-2 font-medium", children: [calculateOverallScore(), "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Required Criteria:" }), _jsxs("span", { className: "ml-2 font-medium", children: [getRequiredCriteriaPassed().passed, " of ", getRequiredCriteriaPassed().total, " passed"] })] })] })] });
    div >
    ;
    div >
    ;
}
div >
;
{ /* Review Decision Section */ }
{
    canReview && ()
        < div;
    className = "border border-gray-200 rounded-lg p-4" >
        (_jsx("h3", { className: "font-medium text-gray-900 mb-4", children: "Your Review Decision" })
            ,
                _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "radio", name: "decision", value: "approve", checked: selectedDecision === 'approve', onChange: (e) => setSelectedDecision(e.target.value), className: "text-green-600 focus:ring-green-500" }), _jsx(CheckCircleIcon, { className: "h-5 w-5 text-green-600" }), _jsx("span", { className: "text-green-800 font-medium", children: "Approve" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "radio", name: "decision", value: "reject", checked: selectedDecision === 'reject', onChange: (e) => setSelectedDecision(e.target.value), className: "text-red-600 focus:ring-red-500" }), _jsx(XCircleIcon, { className: "h-5 w-5 text-red-600" }), _jsx("span", { className: "text-red-800 font-medium", children: "Reject" })] }), _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "radio", name: "decision", value: "abstain", checked: selectedDecision === 'abstain', onChange: (e) => setSelectedDecision(e.target.value), className: "text-gray-600 focus:ring-gray-500" }), _jsx(ClockIcon, { className: "h-5 w-5 text-gray-600" }), _jsx("span", { className: "text-gray-800 font-medium", children: "Abstain" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Review Comment ", selectedDecision === 'reject' ? '(required)' : '(optional)'] }), _jsx("textarea", { value: reviewComment, onChange: (e) => setReviewComment(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 4, placeholder: "Provide your review feedback..." })] })] }));
    div >
    ;
}
div >
    { /* Footer */}
    < div;
className = "border-t border-gray-200 p-6 flex items-center justify-between" >
    (_jsxs("div", { className: "text-sm text-gray-600", children: [canReview ? ()
                :
            , "'Complete your review to submit your decision.' ) : currentUserAssignment ? () 'You have already submitted your review.' ) : () 'You are not assigned as a reviewer for this request.' )}"] })
        ,
            _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200", children: "Close" }), canReview && ()
                        < button, "onClick=", handleSubmitReview, "disabled=", !selectedDecision || (selectedDecision === 'reject' && !reviewComment.trim()), "className=\"px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed\" > Submit Review"] }));
div >
;
div >
;
div >
;
;
;
