import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Trust Score Manager - E17-1753114397393-BA8A32
 *
 * Administrative interface for managing and adjusting user trust scores
 * Part of Epic 17.5.5 - Verification System
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Textarea';
import { User, Shield, Award, Edit3, Save, X, AlertCircle, CheckCircle, Info, Search } from 'lucide-react';
;
accountStatus: 'active' | 'suspended' | 'under_review';
lastActivity: Date;
joinDate: Date;
riskFlags: string;
export const TrustScoreManager = ({
    className = ''
});
{
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [adjustmentData, setAdjustmentData] = useState({});
    adjustmentType: 'manual_override',
        scoreChange;
    0,
        reason;
    '',
    ;
}
;
const [filterType, setFilterType] = useState('all');
const [isLoading, setIsLoading] = useState(false);
// Mock data - in real implementation, this would come from API
const [userTrustData, setUserTrustData] = useState([]);
{
    userId: 'user-1',
        userName;
    'John Director',
        email;
    'john@example.com',
        userType;
    'creator',
        trustScore;
    {
        score: 92,
            grade;
        'A',
            status;
        'excellent',
            lastUpdated;
        new Date(),
            version;
        '1.0',
            confidence;
        95,
        ;
    }
    verificationStatus: {
        email: true,
            phone;
        true,
            identity;
        true,
            professional;
        true,
        ;
    }
    accountStatus: 'active',
        lastActivity;
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        joinDate;
    new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        riskFlags;
    [];
}
{
    userId: 'user-2',
        userName;
    'Sarah Producer',
        email;
    'sarah@example.com',
        userType;
    'creator',
        trustScore;
    {
        score: 45,
            grade;
        'D',
            status;
        'warning',
            lastUpdated;
        new Date(),
            version;
        '1.0',
            confidence;
        70,
        ;
    }
    verificationStatus: {
        email: true,
            phone;
        false,
            identity;
        false,
            professional;
        true,
        ;
    }
    accountStatus: 'under_review',
        lastActivity;
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        joinDate;
    new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        riskFlags;
    ['unusual_activity', 'low_verification'];
    ;
    const getTrustScoreColor = (score) => {
        if (score >= 90)
            return 'text-green-600';
        if (score >= 80)
            return 'text-blue-600';
        if (score >= 70)
            return 'text-yellow-600';
        if (score >= 60)
            return 'text-orange-600';
        return 'text-red-600';
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'fair': return 'text-yellow-600 bg-yellow-100';
            case 'warning': return 'text-orange-600 bg-orange-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
        ;
        const getAccountStatusColor = (status) => {
            switch (status) {
                case 'active': return 'text-green-600 bg-green-100';
                case 'suspended': return 'text-red-600 bg-red-100';
                case 'under_review': return 'text-yellow-600 bg-yellow-100';
                default: return 'text-gray-600 bg-gray-100';
            }
            ;
            const handleApplyAdjustment = async () => {
                if (!selectedUser || !adjustmentData.reason?.trim() || !adjustmentData.scoreChange) {
                    alert('Please fill in all required fields.');
                    return;
                    setIsLoading(true);
                    try {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        // Update the user's trust score
                        const updatedUsers = userTrustData.map(user => { });
                        if (user.userId === selectedUser.userId) {
                            const newScore = Math.max(0, Math.min(100, user.trustScore.score + adjustmentData.scoreChange));
                            return {
                                ...user,
                                trustScore: {
                                    ...user.trustScore,
                                    score: newScore,
                                    grade: getGradeFromScore(newScore),
                                    status: getStatusFromScore(newScore),
                                    lastUpdated: new Date(),
                                },
                                return: user
                            };
                            ;
                            setUserTrustData(updatedUsers);
                            setSelectedUser(updatedUsers.find(u => u.userId === selectedUser.userId) || null);
                            setIsEditing(false);
                            setAdjustmentData({});
                            adjustmentType: 'manual_override',
                                scoreChange;
                            0,
                                reason;
                            '',
                            ;
                        }
                        ;
                    }
                    catch (error) {
                        console.error('Error applying adjustment:', error);
                        alert('Error applying adjustment. Please try again.');
                    }
                    finally {
                        setIsLoading(false);
                    }
                    ;
                    const getGradeFromScore = (score) => {
                        if (score >= 97)
                            return 'A+';
                        if (score >= 93)
                            return 'A';
                        if (score >= 87)
                            return 'B+';
                        if (score >= 80)
                            return 'B';
                        if (score >= 73)
                            return 'C+';
                        if (score >= 67)
                            return 'C';
                        if (score >= 60)
                            return 'D';
                        return 'F';
                    };
                    const getStatusFromScore = (score) => {
                        if (score >= 90)
                            return 'excellent';
                        if (score >= 80)
                            return 'good';
                        if (score >= 70)
                            return 'fair';
                        if (score >= 60)
                            return 'warning';
                        return 'critical';
                    };
                    const filteredUsers = userTrustData.filter(user => { });
                    const matchesSearch = searchTerm === '' || ;
                    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.userId.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesFilter = filterType === 'all' || ;
                    (filterType === 'high_risk' && user.riskFlags.length > 0) ||
                        (filterType === 'low_score' && user.trustScore.score < 60) ||
                        (filterType === 'under_review' && user.accountStatus === 'under_review') ||
                        (filterType === 'creators' && user.userType === 'creator') ||
                        (filterType === 'buyers' && user.userType === 'buyer');
                    return matchesSearch && matchesFilter;
                }
                ;
                const renderUserList = () => ();
                ;
                _jsxs(Card, { className: "user-list", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "list-header", children: [_jsx(CardTitle, { children: "Trust Score Management" }), _jsxs("div", { className: "list-controls", children: [_jsxs("div", { className: "search-bar", children: [_jsx(Search, { className: "w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search users...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input" })] }), _jsxs("select", { value: filterType, onChange: (e) => setFilterType(e.target.value), className: "filter-select", children: [_jsx("option", { value: "all", children: "All Users" }), _jsx("option", { value: "high_risk", children: "High Risk" }), _jsx("option", { value: "low_score", children: "Low Score (<60)" }), _jsx("option", { value: "under_review", children: "Under Review" }), _jsx("option", { value: "creators", children: "Creators Only" }), _jsx("option", { value: "buyers", children: "Buyers Only" })] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "users-list", children: [filteredUsers.map(user => ()
                                        < div, key = { user, : .userId }, className = {} `user-item ${selectedUser?.userId === user.userId ? 'selected' : ''}`), "onClick=", () => setSelectedUser(user), ">", _jsxs("div", { className: "user-info", children: [_jsxs("div", { className: "user-header", children: [_jsxs("div", { className: "user-details", children: [_jsx("span", { className: "user-name", children: user.userName }), _jsx("span", { className: "user-email", children: user.email })] }), _jsxs("div", { className: "user-badges", children: [_jsx(Badge, { className: getStatusColor(user.trustScore.status), children: user.trustScore.status.toUpperCase() }), _jsx(Badge, { className: getAccountStatusColor(user.accountStatus), children: user.accountStatus.replace('_', ' ').toUpperCase() })] })] }), _jsxs("div", { className: "user-metrics", children: [_jsxs("div", { className: "trust-score-display", children: [_jsx("span", { className: "score-label", children: "Trust Score" }), _jsxs("span", { className: `score-value ${getTrustScoreColor(user.trustScore.score)}`, children: ["}", user.trustScore.score, "/100"] }), _jsxs("span", { className: "score-grade", children: ["(", user.trustScore.grade, ")"] })] }), _jsxs("div", { className: "verification-indicators", children: [user.verificationStatus.email && _jsx(CheckCircle, { className: "w-4 h-4 text-green-500", title: "Email verified" }), user.verificationStatus.phone && _jsx(CheckCircle, { className: "w-4 h-4 text-green-500", title: "Phone verified" }), user.verificationStatus.identity && _jsx(Shield, { className: "w-4 h-4 text-blue-500", title: "Identity verified" }), user.verificationStatus.professional && _jsx(Award, { className: "w-4 h-4 text-purple-500", title: "Professional verified" })] })] }), user.riskFlags.length > 0 && ()
                                                < div, " className=\"risk-flags\">", _jsx(AlertCircle, { className: "w-4 h-4 text-red-500" }), _jsxs("span", { children: [user.riskFlags.length, " risk flag(s)"] })] }), ")}"] }) }), "))}"] });
            };
        };
    };
    CardContent >
    ;
    Card >
    ;
    ;
    const renderUserDetails = () => {
        if (!selectedUser) {
            return;
            _jsx(Card, { className: "user-details-placeholder", children: _jsx(CardContent, { children: _jsxs("div", { className: "placeholder-content", children: [_jsx(User, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { children: "Select a user to view and manage their trust score." })] }) }) });
        }
    };
    ;
    return;
    _jsx("div", { className: "user-details-panel", children: _jsxs(Card, { className: "user-profile", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "profile-header", children: [_jsxs("div", { className: "profile-info", children: [_jsx("h3", { children: selectedUser.userName }), _jsx("p", { children: selectedUser.email }), _jsx(Badge, { className: getAccountStatusColor(selectedUser.accountStatus), children: selectedUser.accountStatus.replace('_', ' ').toUpperCase() })] }), _jsxs("div", { className: "trust-score-circle", children: [_jsxs("div", { className: "score-display", children: [_jsxs("span", { className: `score-number ${getTrustScoreColor(selectedUser.trustScore.score)}`, children: ["}", selectedUser.trustScore.score] }), _jsx("span", { className: "score-max", children: "/100" })] }), _jsx("div", { className: "score-grade", children: selectedUser.trustScore.grade })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "profile-details", children: [_jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "User Type" }), _jsx("span", { className: "detail-value", children: selectedUser.userType })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Confidence" }), _jsxs("span", { className: "detail-value", children: [selectedUser.trustScore.confidence, "%"] })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Last Updated" }), _jsx("span", { className: "detail-value", children: selectedUser.trustScore.lastUpdated.toLocaleString() })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Last Activity" }), _jsx("span", { className: "detail-value", children: selectedUser.lastActivity.toLocaleDateString() })] })] }), _jsxs("div", { className: "verification-status", children: [_jsx("h4", { children: "Verification Status" }), _jsxs("div", { className: "verification-grid", children: [_jsxs("div", { className: `verification-item ${selectedUser.verificationStatus.email ? 'verified' : 'unverified'}`, children: ["}", selectedUser.verificationStatus.email ? _jsx(CheckCircle, { className: "w-4 h-4" }) : _jsx(X, { className: "w-4 h-4" }), _jsx("span", { children: "Email" })] }), _jsxs("div", { className: `verification-item ${selectedUser.verificationStatus.phone ? 'verified' : 'unverified'}`, children: ["}", selectedUser.verificationStatus.phone ? _jsx(CheckCircle, { className: "w-4 h-4" }) : _jsx(X, { className: "w-4 h-4" }), _jsx("span", { children: "Phone" })] }), _jsxs("div", { className: `verification-item ${selectedUser.verificationStatus.identity ? 'verified' : 'unverified'}`, children: ["}", selectedUser.verificationStatus.identity ? _jsx(Shield, { className: "w-4 h-4" }) : _jsx(X, { className: "w-4 h-4" }), _jsx("span", { children: "Identity" })] }), _jsxs("div", { className: `verification-item ${selectedUser.verificationStatus.professional ? 'verified' : 'unverified'}`, children: ["}", selectedUser.verificationStatus.professional ? _jsx(Award, { className: "w-4 h-4" }) : _jsx(X, { className: "w-4 h-4" }), _jsx("span", { children: "Professional" })] })] })] }), selectedUser.riskFlags.length > 0 && ()
                            < div, " className=\"risk-section\">", _jsx("h4", { children: "Risk Flags" }), _jsx("div", { className: "risk-flags-list", children: selectedUser.riskFlags.map((flag, index) => ()
                                < Badge, key = { index }, className = "text-red-600 bg-red-100" >
                                _jsx(AlertCircle, { className: "w-3 h-3 mr-1" }), { flag, : .replace('_', ' ').toUpperCase() }) }), "))}"] })] }) });
}
CardContent >
;
Card >
    (_jsx(Card, { className: "score-adjustment", children: _jsx(CardHeader, { children: _jsxs("div", { className: "adjustment-header", children: [_jsx(CardTitle, { children: "Trust Score Adjustment" }), _jsxs(Button, { onClick: () => setIsEditing(!isEditing), variant: "outline", size: "sm", children: [isEditing ? ()
                                <  >
                                _jsx(X, { className: "w-4 h-4 mr-2" })
                                :
                            , "Cancel"] }), ") : ()", _jsxs(_Fragment, { children: [_jsx(Edit3, { className: "w-4 h-4 mr-2" }), "Adjust Score"] }), ")}"] }) }) })
        ,
            _jsxs(CardContent, { children: [isEditing ? ()
                        < div : , " className=\"adjustment-form\">", _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Adjustment Type" }), _jsx("select", { value: adjustmentData.adjustmentType, onChange: (e) => setAdjustmentData(prev => ({}), ...prev, adjustmentType) }), ": e.target.value as TrustScoreAdjustment['adjustmentType']; }))} className=\"form-select\" >", _jsx("option", { value: "manual_override", children: "Manual Override" }), _jsx("option", { value: "penalty", children: "Apply Penalty" }), _jsx("option", { value: "bonus", children: "Award Bonus" }), _jsx("option", { value: "reset", children: "Reset to Default" })] })] })
                ,
                    _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Score Change" }), _jsx("input", { type: "number", min: "-100", max: "100", value: adjustmentData.scoreChange || 0, onChange: (e) => setAdjustmentData(prev => ({}), ...prev, scoreChange) }), ": parseInt(e.target.value) || 0; }))} className=\"form-input\" />", _jsxs("span", { className: "form-helper", children: ["New score: ", Math.max(), "0, Math.min(100) selectedUser.trustScore.score + (adjustmentData.scoreChange || 0) )))}"] })] })
                        ,
                            _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Reason *" }), _jsx(Textarea, { value: adjustmentData.reason || '', onChange: (e) => setAdjustmentData(prev => ({}), ...prev, reason) }), ": e.target.value; }))} placeholder=\"Provide a detailed reason for this adjustment...\" rows=", 3, "className=\"form-textarea\" />"] })
                                ,
                                    _jsxs("div", { className: "adjustment-preview", children: [_jsx("h4", { children: "Adjustment Preview" }), _jsxs("div", { className: "preview-item", children: [_jsx("span", { children: "Current Score:" }), _jsxs("span", { className: getTrustScoreColor(selectedUser.trustScore.score), children: [selectedUser.trustScore.score, " (", selectedUser.trustScore.grade, ")"] })] }), _jsxs("div", { className: "preview-item", children: [_jsx("span", { children: "New Score:" }), _jsx("span", { className: getTrustScoreColor(), Math: true }), ".max(0) Math.min(100) selectedUser.trustScore.score + (adjustmentData.scoreChange || 0) ))))}>", Math.max(0, Math.min(100, selectedUser.trustScore.score + (adjustmentData.scoreChange || 0))), "(", getGradeFromScore(), "Math.max(0) Math.min(100) selectedUser.trustScore.score + (adjustmentData.scoreChange || 0) ))))})"] })] }));
div >
    _jsxs("div", { className: "adjustment-actions", children: [_jsxs(Button, { onClick: handleApplyAdjustment, disabled: isLoading || !adjustmentData.reason?.trim() || !adjustmentData.scoreChange, className: "apply-button", children: [isLoading ? ()
                        <  > Processing : , "..."] }), ") : ()", _jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Apply Adjustment"] }), ")}"] });
div >
;
div >
;
()
    < div;
className = "adjustment-info" >
    _jsxs("div", { className: "info-message", children: [_jsx(Info, { className: "w-5 h-5 text-blue-500" }), _jsxs("div", { children: [_jsx("p", { children: "Use trust score adjustments to manually override calculated scores when necessary." }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "All adjustments are logged and require justification." })] })] });
div >
;
CardContent >
;
Card >
;
div >
;
;
;
return;
_jsxs("div", { className: `trust-score-manager ${className}`, children: ["}", _jsxs("div", { className: "manager-layout", children: [_jsx("div", { className: "users-section", children: renderUserList() }), _jsx("div", { className: "details-section", children: renderUserDetails() })] }), _jsx("style", { children: `
        .trust-score-manager {
          max-width: 1400px;
  margin: 0 auto;
          padding: 1.5rem;
        .manager-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
        .users-section {
          display: flex;
          flex-direction: column;
        .details-section {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .list-header {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .list-controls {
          display: flex;
  gap: 0.75rem;
        .search-bar {
          position: relative;
  flex: 1;
        .search-bar .lucide {
          position: absolute;
  left: 0.75rem;
          top: 50%;
  transform: translateY(-50%);
          z-index: 1;
        .search-input {
          width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .search-input:focus {,
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        .filter-select {
          padding: 0.5rem;
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
  background: white;
          min-width: 150px;
        .users-list {
          display: flex;
          flex-direction: column;
  gap: 0.75rem;
          max-height: 600px;
          overflow-y: auto;
        .user-item {
          padding: 1rem;
  border: 1px solid #e5e7eb;
          border-radius: 8px;
  cursor: pointer;
          transition: all 0.2s ease;
        .user-item:hover {
          border-color: #3b82f6;
  background: #f8fafc;
        .user-item.selected {
          border-color: #3b82f6;
  background: #eff6ff;
        .user-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        .user-details {
          display: flex;
          flex-direction: column;
  gap: 0.25rem;
        .user-name {
          font-weight: 600;
  color: #1f2937;
        .user-email {
          font-size: 0.875rem;
  color: #6b7280;
        .user-badges {
          display: flex;
  gap: 0.5rem;
        .user-metrics {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .trust-score-display {
          display: flex;
          align-items: center;
  gap: 0.5rem;
        .score-label {
          font-size: 0.875rem;
  color: #6b7280;
        .score-value {
          font-weight: 600;
        .score-grade {
          font-size: 0.875rem;
  color: #6b7280;
        .verification-indicators {
          display: flex;
  gap: 0.25rem;
        .risk-flags {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          margin-top: 0.5rem;
          font-size: 0.875rem;
  color: #dc2626;
        .user-details-placeholder {
          height: 400px;
  display: flex;
          align-items: center;
          justify-content: center;
        .placeholder-content {
          text-align: center;
  color: #6b7280;
        .user-details-panel {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .profile-info h3 {
          font-size: 1.25rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.25rem;
        .profile-info p {
          color: #6b7280;
          margin-bottom: 0.5rem;
        .trust-score-circle {
          text-align: center;
        .score-display {
          display: flex;
          align-items: baseline;
          justify-content: center;
  gap: 0.25rem;
        .score-number {
          font-size: 2rem;
          font-weight: 700;
        .score-max {
          font-size: 1rem;
  color: #9ca3af;
        .score-grade {
          font-size: 1rem;
          font-weight: 600;
  color: #6b7280;
          margin-top: 0.25rem;
        .profile-details {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
          margin-bottom: 1.5rem;
        .detail-item {
          display: flex;
          justify-content: space-between;
  padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        .detail-label {
          font-weight: 500;
  color: #374151;
        .detail-value {
          color: #1f2937;
        .verification-status h4 {
          font-weight: 600;
  color: #1f2937;
          margin-bottom: 0.75rem;
        .verification-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        .verification-item {
          display: flex;
          align-items: center;
  gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
        .verification-item.verified {
          background: #d1fae5;
  color: #065f46;
        .verification-item.unverified {
          background: #fee2e2;
  color: #991b1b;
        .risk-section h4 {
          font-weight: 600;
  color: #1f2937;
          margin: 1.5rem 0 0.75rem 0;
        .risk-flags-list {
          display: flex;
          flex-wrap: wrap;
  gap: 0.5rem;
        .adjustment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .adjustment-form {
          display: flex;
          flex-direction: column;
  gap: 1rem;
        .form-group {
          display: flex;
          flex-direction: column;
  gap: 0.5rem;
        .form-group label {
          font-weight: 500;
  color: #374151;
        .form-select, .form-input, .form-textarea {
          padding: 0.5rem;
  border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        .form-select:focus, .form-input:focus, .form-textarea:focus {,
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        .form-helper {
          font-size: 0.75rem;
  color: #6b7280;
        .adjustment-preview {
          background: #f9fafb;
  border: 1px solid #e5e7eb;
          border-radius: 6px;
  padding: 1rem;
        .adjustment-preview h4 {
          font-weight: 600;
  color: #1f2937;
          margin-bottom: 0.75rem;
        .preview-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        .adjustment-actions {
          display: flex;
          justify-content: flex-end;
        .apply-button {
          background: #059669;
          border-color: #059669;
        .apply-button:hover:not(:disabled) {,
  background: #047857;
          border-color: #047857;
        .adjustment-info {
          text-align: center;
  padding: 2rem;
        .info-message {
          display: flex;
          align-items: flex-start;
  gap: 0.75rem;
          text-align: left;
  background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
  padding: 1rem;
        @media (max-width: 1200px) {
          .manager-layout {
            grid-template-columns: 1fr;
        @media (max-width: 768px) {
          .list-controls {
            flex-direction: column;
          .search-bar {
            order: 2;
          .profile-header {
            flex-direction: column;
  gap: 1rem;
            align-items: stretch;
          .verification-grid {
            grid-template-columns: 1fr;
      ` })] });
;
;
export default TrustScoreManager;
