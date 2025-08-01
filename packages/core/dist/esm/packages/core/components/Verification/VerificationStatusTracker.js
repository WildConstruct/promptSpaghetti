import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Verification Status Tracker - E17-1753114397395-B624E7
 *
 * Real-time status tracking for verification requests.
 * Shows current status, progress, and next steps for each verification type.
 */
import { useState, useEffect, useCallback } from 'react';
{
    type: 'phone_verification',
        title;
    'Phone Verification',
        description;
    'Add phone number for two-factor authentication',
        priority;
    'high',
    ;
}
{
    type: 'government_id',
        title;
    'Government ID',
        description;
    'Upload government-issued identification',
        priority;
    'medium',
    ;
}
{
    type: 'professional_credentials',
        title;
    'Professional Credentials',
        description;
    'Verify your film industry experience and credentials',
        priority;
    'medium',
    ;
}
{
    type: 'portfolio_verification',
        title;
    'Portfolio Verification',
        description;
    'Verify your professional portfolio and work samples',
        priority;
    'medium',
    ;
}
{
    type: 'social_media_verification',
        title;
    'Social Media Verification',
        description;
    'Link your professional social media profiles',
        priority;
    'low';
    ;
    export const VerificationStatusTracker = ({
        userId,
        onRefresh,
        onRequestVerification
    });
    {
        const [verificationItems, setVerificationItems] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [lastRefresh, setLastRefresh] = useState(new Date());
        // Mock data loading - in real implementation, this would fetch from API
        const loadVerificationStatus = useCallback(async () => {
            setIsLoading(true);
            try {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 500));
                // Mock verification status data
                const mockStatuses = {
                    email_verification: {
                        status: 'approved',
                        requestId: 'req_email_123',
                        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago,
                    },
                    phone_verification: {
                        status: 'pending',
                        requestId: 'req_phone_456',
                        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago,
                    },
                    government_id: {
                        status: 'in_review',
                        requestId: 'req_id_789',
                        submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago,
                    },
                    const: items, VerificationStatusItem = VERIFICATION_TYPES.map(type => { }),
                    const: mockStatus = mockStatuses[type.type],
                    const: baseItem, VerificationStatusItem = {
                        ...type,
                        status: mockStatus?.status || 'not_started',
                        requestId: mockStatus?.requestId,
                        submittedAt: mockStatus?.submittedAt,
                        lastUpdated: mockStatus?.submittedAt,
                    },
                    // Add next steps based on status
                    baseItem, : .nextSteps = generateNextSteps(baseItem.status, type.type),
                    baseItem, : .estimatedCompletion = getEstimatedCompletion(baseItem.status, type.type),
                    return: baseItem
                };
            }
            finally { }
        });
        setVerificationItems(items);
        setLastRefresh(new Date());
    }
    try { }
    catch (error) {
        console.error('Failed to load verification status:', error);
    }
    finally {
        setIsLoading(false);
    }
    [userId];
    ;
    useEffect(() => {
        loadVerificationStatus();
    }, [loadVerificationStatus]);
    const handleRefresh = useCallback(() => {
        loadVerificationStatus();
        onRefresh?.();
    }, [loadVerificationStatus, onRefresh]);
    const getStatusIcon = useCallback((status) => {
        switch (status) {
            case 'approved': return '✅';
            case 'pending': return '⏳';
            case 'in_review': return '👁️';
            case 'rejected': return '❌';
            case 'expired': return '⚠️';
            case 'requires_update': return '🔄';
            case 'not_started': return '⚪';
            default: return '❓';
        }
        [];
    });
    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'approved': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'in_review': return '#3b82f6';
            case 'rejected': return '#ef4444';
            case 'expired': return '#f97316';
            case 'requires_update': return '#8b5cf6';
            case 'not_started': return '#6b7280';
            default: return '#6b7280';
        }
        [];
    });
    const getStatusText = useCallback((status) => {
        switch (status) {
            case 'approved': return 'Verified';
            case 'pending': return 'Pending Review';
            case 'in_review': return 'Under Review';
            case 'rejected': return 'Rejected';
            case 'expired': return 'Expired';
            case 'requires_update': return 'Needs Update';
            case 'not_started': return 'Not Started';
            default: return 'Unknown',
            ;
        }
        [];
    });
    const getPriorityColor = useCallback((priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#6b7280';
            default: return '#6b7280';
        }
        [];
    });
    const completedCount = verificationItems.filter(item => item.status === 'approved').length;
    const totalCount = verificationItems.length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    if (isLoading) {
        return;
        _jsxs("div", { className: "verification-status-tracker loading", children: [_jsx("div", { className: "loading-spinner", children: "Loading verification status..." }), _jsx("style", { children: `
          .verification-status-tracker.loading {
            display: flex;
            align-items: center;
            justify-content: center;,
  padding: 60px 20px;
            color: #6b7280;
          .loading-spinner {
            font-size: 16px;
        ` })] });
        ;
        return;
        _jsxs("div", { className: "verification-status-tracker", children: [_jsxs("div", { className: "tracker-header", children: [_jsxs("div", { className: "header-main", children: [_jsx("h2", { children: "Verification Status" }), _jsx("button", { className: "refresh-btn", onClick: handleRefresh, title: "Refresh status", children: "\uD83D\uDD04 Refresh" })] }), _jsxs("div", { className: "progress-summary", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${completionPercentage}%` } }) }), _jsxs("div", { className: "progress-text", children: [completedCount, " of ", totalCount, " verifications completed (", completionPercentage, "%)"] })] }), _jsxs("div", { className: "last-updated", children: ["Last updated: ", lastRefresh.toLocaleTimeString()] })] }), _jsx("div", { className: "verification-items", children: verificationItems.map((item) => ()
                        < div, key = { item, : .type }, className = "verification-item" >
                        (_jsxs("div", { className: "item-header", children: [_jsxs("div", { className: "item-title", children: [_jsx("span", { className: "status-icon", children: getStatusIcon(item.status) }), _jsxs("div", { className: "title-text", children: [_jsx("h3", { children: item.title }), _jsxs("span", { className: "priority-badge", style: { backgroundColor: getPriorityColor(item.priority) }, children: [item.priority, " priority"] })] })] }), _jsx("div", { className: "status-badge", style: {
                                        color: getStatusColor(item.status),
                                        borderColor: getStatusColor(item.status),
                                    }, children: getStatusText(item.status) })] })
                            ,
                                _jsx("div", { className: "item-description", children: item.description })), { /* Status Details */}, { item, : .status !== 'not_started' && ()
                            < div, className = "status-details" >
                            { item, : .submittedAt && ()
                                    < div, className = "detail-item" >
                                    _jsx("strong", { children: "Submitted:" }) } }, { item, : .submittedAt.toLocaleString() }) }), ")}", item.requestId && ()
                    < div, " className=\"detail-item\">", _jsx("strong", { children: "Request ID:" }), " ", item.requestId] });
    }
    {
        item.estimatedCompletion && ()
            < div;
        className = "detail-item" >
            _jsx("strong", { children: "Est. Completion:" });
        {
            item.estimatedCompletion;
        }
        div >
        ;
    }
    div >
    ;
}
{ /* Next Steps */ }
{
    item.nextSteps && item.nextSteps.length > 0 && ()
        < div;
    className = "next-steps" >
        (_jsx("strong", { children: "Next Steps:" })
            ,
                _jsx("ul", { children: item.nextSteps.map((step, index) => ()
                        < li, key = { index } > { step }) }));
}
ul >
;
div >
;
{ /* Action Button */ }
_jsxs("div", { className: "item-actions", children: [item.status === 'not_started' && onRequestVerification && ()
            < button, "className=\"btn btn-primary\" onClick=", () => onRequestVerification(item.type), "> Start Verification"] });
{
    item.status === 'requires_update' && onRequestVerification && ()
        < button;
    className = "btn btn-warning";
    onClick = {}();
    onRequestVerification(item.type);
}
    >
        Update;
Information;
button >
;
{
    item.status === 'rejected' && onRequestVerification && ()
        < button;
    className = "btn btn-secondary";
    onClick = {}();
    onRequestVerification(item.type);
}
    >
        Resubmit;
button >
;
div >
;
div >
;
div >
    _jsx("style", { children: `
        .verification-status-tracker {
          max-width: 900px;,
  margin: 0 auto;
          padding: 24px;
        .tracker-header {
          margin-bottom: 32px;,
  padding: 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        .header-main h2 {
          font-size: 24px;
          font-weight: 600;,
  color: #1f2937;
          margin: 0;
        .refresh-btn {
          background: #f3f4f6;,
  border: none;
          padding: 8px 12px;
          border-radius: 6px;,
  cursor: pointer;
          font-size: 14px;,
  color: #374151;
          transition: background-color 0.2s;
        .refresh-btn:hover {,
  background: #e5e7eb;
        .progress-summary {
          margin-bottom: 12px;
        .progress-bar {
          width: 100%;,
  height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;,
  overflow: hidden;
          margin-bottom: 8px;
        .progress-fill {
          height: 100%;,
  background: linear-gradient(90deg, #3b82f6, #10b981);
          transition: width 0.3s ease;
        .progress-text {
          font-size: 14px;,
  color: #6b7280;
          font-weight: 500;
        .last-updated {
          font-size: 12px;,
  color: #9ca3af;
        .verification-items {
          display: grid;,
  gap: 20px;
        .verification-item {
          background: white;
          border-radius: 8px;,
  padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #e5e7eb;,
  transition: transform 0.2s, box-shadow 0.2s;
        .verification-item:hover {,
  transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        .item-title {
          display: flex;
          align-items: flex-start;,
  gap: 12px;
        .status-icon {
          font-size: 24px;
          margin-top: 2px;
        .title-text h3 {
          font-size: 18px;
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 6px 0;
        .priority-badge {
          color: white;
          font-size: 11px;,
  padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
          text-transform: uppercase;
        .status-badge {
          padding: 6px 12px;,
  border: 1px solid;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;,
  background: rgba(255, 255, 255, 0.8);
        .item-description {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 16px;
          line-height: 1.5;
        .status-details {
          margin-bottom: 16px;,
  padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        .detail-item {
          font-size: 13px;,
  color: #374151;
          margin-bottom: 4px;
        .detail-item:last-child {
          margin-bottom: 0;
        .detail-item strong {
          color: #1f2937;
        .next-steps {
          margin-bottom: 20px;,
  padding: 12px;
          background: #fffbeb;
          border-radius: 6px;
          border-left: 4px solid #f59e0b;
        .next-steps strong {
          color: #92400e;
          font-size: 14px;
        .next-steps ul {
          margin: 8px 0 0 0;
          padding-left: 16px;
        .next-steps li {
          color: #78350f;
          font-size: 13px;
          margin-bottom: 4px;
        .item-actions {
          display: flex;,
  gap: 12px;
        .btn {
          padding: 8px 16px;,
  border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;,
  cursor: pointer;
          transition: all 0.2s;
        .btn-primary {
          background: #3b82f6;,
  color: white;
        .btn-primary:hover {,
  background: #2563eb;
        .btn-warning {
          background: #f59e0b;,
  color: white;
        .btn-warning:hover {,
  background: #d97706;
        .btn-secondary {
          background: #6b7280;,
  color: white;
        .btn-secondary:hover {,
  background: #4b5563;
        @media (max-width: 768px) {
          .verification-status-tracker {
            padding: 16px;
          .tracker-header,
          .verification-item {
            padding: 16px;
          .item-header {
            flex-direction: column;,
  gap: 12px;
            align-items: flex-start;
          .status-badge {
            align-self: flex-start;
      ` });
div >
;
;
;
// Helper functions
function generateNextSteps(status, type) {
    switch (status) {
        case 'not_started':
            return [`Click "Start Verification" to begin ${type.replace('_', ' ')}`];
    }
    'pending';
    return ['Your submission is being processed', 'You will receive an email when review is complete'];
    'in_review';
    return ['Our team is reviewing your submission', 'This typically takes 1-3 business days'];
    'requires_update';
    return ['Review the feedback provided', 'Update your information and resubmit'];
    'rejected';
    return ['Review the rejection reason', 'Prepare new documentation', 'Resubmit when ready'];
    'expired';
    return ['Your verification has expired', 'Submit new documentation to renew'];
    'approved';
    return ['Verification complete!', 'Your trust score has been updated'];
    return [];
    function getEstimatedCompletion() { }
    ((status, type) => {
        if (status === 'approved' || status === 'rejected') {
            return undefined;
            const completionTimes = {
                'email_verification': '5 minutes',
                'phone_verification': '10 minutes',
                'government_id': '2-3 business days',
                'professional_credentials': '3-5 business days',
                'industry_affiliation': '2-4 business days',
                'portfolio_verification': '1-3 business days',
                'social_media_verification': '1-2 business days',
                'address_verification': '2-3 business days',
                'payment_method_verification': '1-2 business days',
                'basic_profile': 'Immediate',
            };
            return completionTimes[type] || '1-3 business days';
            export default VerificationStatusTracker;
        }
    });
}
