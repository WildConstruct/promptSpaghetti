import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Verification Center - E17-1753114397405-9BF042
 *
 * Comprehensive identity verification interface for Wild Construct creators
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useIdentityValidation } from '../../hooks/useIdentityValidation';
import { CheckCircle, XCircle, Clock, Shield, Star, Award, User, Phone, Mail, FileText, Camera, ExternalLink, TrendingUp } from 'lucide-react';
export const VerificationCenter = ({ userId, onVerificationComplete, className = '' }) => {
    const { userTrustScore, validationSummary, getVerificationCompletionPercentage, getRecommendedVerificationSteps, getTrustTierBenefits, submitEmailVerification, submitPhoneVerification, submitGovernmentIdVerification, submitProfessionalCredentials, submitSocialMediaVerification, submitPortfolioVerification, isLoading } = useIdentityValidation({ userId, autoLoadUserData: true });
    const [activeStep, setActiveStep] = useState(null);
    const [formData, setFormData] = useState({});
    const completionPercentage = getVerificationCompletionPercentage();
    const recommendedSteps = getRecommendedVerificationSteps();
    const trustBenefits = getTrustTierBenefits();
    const getTrustTierColor = (tier) => {
        switch (tier) {
            case 'expert': return 'text-purple-600 bg-purple-100';
            case 'professional': return 'text-blue-600 bg-blue-100';
            case 'verified': return 'text-green-600 bg-green-100';
            case 'basic': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getVerificationIcon = (type, status) => {
        const icons = {
            email_verification: Mail,
            phone_verification: Phone,
            government_id: FileText,
            professional_credentials: Award,
            portfolio_verification: Camera,
            social_media_verification: ExternalLink
        };
        const Icon = icons[type] || User;
        if (status === 'completed') {
            return _jsx(CheckCircle, { className: "w-5 h-5 text-green-500" });
        }
        else if (status === 'pending') {
            return _jsx(Clock, { className: "w-5 h-5 text-yellow-500" });
        }
        else if (status === 'rejected') {
            return _jsx(XCircle, { className: "w-5 h-5 text-red-500" });
        }
        return _jsx(Icon, { className: "w-5 h-5 text-gray-400" });
    };
    const handleVerificationSubmit = async (type, data) => {
        let result;
        switch (type) {
            case 'email_verification':
                result = await submitEmailVerification(data.email);
                break;
            case 'phone_verification':
                result = await submitPhoneVerification(data.phone);
                break;
            case 'government_id':
                result = await submitGovernmentIdVerification(data);
                break;
            case 'professional_credentials':
                result = await submitProfessionalCredentials(data);
                break;
            case 'social_media_verification':
                result = await submitSocialMediaVerification(data);
                break;
            case 'portfolio_verification':
                result = await submitPortfolioVerification(data);
                break;
        }
        if (result?.success) {
            setActiveStep(null);
            setFormData({});
            onVerificationComplete?.(type);
        }
    };
    const renderTrustScoreOverview = () => (_jsxs(Card, { className: "trust-score-overview", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "trust-header", children: [_jsxs("div", { className: "trust-info", children: [_jsx(CardTitle, { children: "Trust Score" }), _jsx("div", { className: "trust-tier", children: _jsxs(Badge, { className: getTrustTierColor(userTrustScore?.tier), children: [_jsx(Shield, { className: "w-4 h-4 mr-1" }), userTrustScore?.tier?.toUpperCase() || 'UNVERIFIED'] }) })] }), _jsx("div", { className: "trust-score", children: _jsxs("div", { className: "score-circle", children: [_jsx("div", { className: "score-value", children: userTrustScore?.overall || 0 }), _jsx("div", { className: "score-max", children: "/100" })] }) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "verification-progress", children: [_jsxs("div", { className: "progress-header", children: [_jsx("span", { children: "Verification Progress" }), _jsxs("span", { children: [completionPercentage, "% Complete"] })] }), _jsx(Progress, { value: completionPercentage, className: "progress-bar" })] }), userTrustScore && (_jsxs("div", { className: "trust-breakdown", children: [_jsx("h4", { children: "Trust Components" }), _jsxs("div", { className: "components-grid", children: [_jsxs("div", { className: "component-item", children: [_jsx(User, { className: "w-4 h-4" }), _jsx("span", { children: "Identity" }), _jsxs("span", { className: "component-score", children: [userTrustScore.components.identity, "/100"] })] }), _jsxs("div", { className: "component-item", children: [_jsx(Award, { className: "w-4 h-4" }), _jsx("span", { children: "Professional" }), _jsxs("span", { className: "component-score", children: [userTrustScore.components.professional, "/100"] })] }), _jsxs("div", { className: "component-item", children: [_jsx(Star, { className: "w-4 h-4" }), _jsx("span", { children: "Community" }), _jsxs("span", { className: "component-score", children: [userTrustScore.components.community, "/100"] })] }), _jsxs("div", { className: "component-item", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), _jsx("span", { children: "Activity" }), _jsxs("span", { className: "component-score", children: [userTrustScore.components.activity, "/100"] })] })] })] })), _jsxs("div", { className: "trust-benefits", children: [_jsx("h4", { children: "Your Benefits" }), _jsx("ul", { className: "benefits-list", children: trustBenefits.map((benefit, index) => (_jsxs("li", { children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }), _jsx("span", { children: benefit })] }, index))) })] })] })] }));
    const renderVerificationSteps = () => (_jsxs(Card, { className: "verification-steps", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Verification Steps" }) }), _jsx(CardContent, { children: _jsx("div", { className: "steps-list", children: recommendedSteps.map((step, index) => (_jsxs("div", { className: `step-item ${activeStep === step.type ? 'active' : ''}`, children: [_jsxs("div", { className: "step-header", children: [_jsx("div", { className: "step-icon", children: getVerificationIcon(step.type, 'incomplete') }), _jsxs("div", { className: "step-info", children: [_jsx("div", { className: "step-title", children: step.title }), _jsx("div", { className: "step-description", children: step.description })] }), _jsxs("div", { className: "step-actions", children: [_jsxs(Badge, { variant: step.priority === 'high' ? 'destructive' :
                                                    step.priority === 'medium' ? 'default' : 'secondary', children: [step.priority, " priority"] }), _jsx(Button, { onClick: () => setActiveStep(step.type), variant: "outline", size: "sm", children: "Start Verification" })] })] }), activeStep === step.type && (_jsx("div", { className: "step-form", children: renderVerificationForm(step.type) }))] }, step.type))) }) })] }));
    const renderVerificationForm = (type) => {
        switch (type) {
            case 'email_verification':
                return (_jsxs("div", { className: "verification-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email Address" }), _jsx("input", { type: "email", value: formData.email || '', onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "Enter your email address", className: "form-input" })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { onClick: () => handleVerificationSubmit(type, formData), children: "Send Verification Email" }), _jsx(Button, { variant: "outline", onClick: () => setActiveStep(null), children: "Cancel" })] })] }));
            case 'phone_verification':
                return (_jsxs("div", { className: "verification-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Phone Number" }), _jsx("input", { type: "tel", value: formData.phone || '', onChange: (e) => setFormData({ ...formData, phone: e.target.value }), placeholder: "+1 (555) 123-4567", className: "form-input" })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { onClick: () => handleVerificationSubmit(type, formData), children: "Send Verification Code" }), _jsx(Button, { variant: "outline", onClick: () => setActiveStep(null), children: "Cancel" })] })] }));
            case 'professional_credentials':
                return (_jsxs("div", { className: "verification-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Professional Role" }), _jsxs("select", { value: formData.role || '', onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "form-select", children: [_jsx("option", { value: "", children: "Select your primary role" }), _jsx("option", { value: "director", children: "Director" }), _jsx("option", { value: "producer", children: "Producer" }), _jsx("option", { value: "screenwriter", children: "Screenwriter" }), _jsx("option", { value: "cinematographer", children: "Cinematographer" }), _jsx("option", { value: "editor", children: "Editor" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Experience Level" }), _jsxs("select", { value: formData.experience || '', onChange: (e) => setFormData({ ...formData, experience: e.target.value }), className: "form-select", children: [_jsx("option", { value: "", children: "Select experience level" }), _jsx("option", { value: "student", children: "Student" }), _jsx("option", { value: "emerging", children: "Emerging Professional" }), _jsx("option", { value: "professional", children: "Professional" }), _jsx("option", { value: "veteran", children: "Veteran" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Education/Training" }), _jsx("textarea", { value: formData.education || '', onChange: (e) => setFormData({ ...formData, education: e.target.value }), placeholder: "Describe your film education, training, or relevant experience...", className: "form-textarea", rows: 4 })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { onClick: () => handleVerificationSubmit(type, {
                                        professionalCredentials: {
                                            role: formData.role,
                                            experience: formData.experience,
                                            credentials: [{
                                                    type: 'degree',
                                                    title: formData.education,
                                                    institution: 'User Provided',
                                                    year: new Date().getFullYear(),
                                                    verificationStatus: 'pending'
                                                }],
                                            portfolio: []
                                        }
                                    }), children: "Submit Credentials" }), _jsx(Button, { variant: "outline", onClick: () => setActiveStep(null), children: "Cancel" })] })] }));
            case 'social_media_verification':
                return (_jsxs("div", { className: "verification-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "LinkedIn Profile" }), _jsx("input", { type: "url", value: formData.linkedin || '', onChange: (e) => setFormData({ ...formData, linkedin: e.target.value }), placeholder: "https://linkedin.com/in/yourprofile", className: "form-input" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "IMDb Profile (if available)" }), _jsx("input", { type: "url", value: formData.imdb || '', onChange: (e) => setFormData({ ...formData, imdb: e.target.value }), placeholder: "https://imdb.com/name/nm...", className: "form-input" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Professional Website" }), _jsx("input", { type: "url", value: formData.website || '', onChange: (e) => setFormData({ ...formData, website: e.target.value }), placeholder: "https://yourwebsite.com", className: "form-input" })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { onClick: () => handleVerificationSubmit(type, [
                                        ...(formData.linkedin ? [{
                                                platform: 'linkedin',
                                                url: formData.linkedin,
                                                verified: false
                                            }] : []),
                                        ...(formData.imdb ? [{
                                                platform: 'imdb',
                                                url: formData.imdb,
                                                verified: false
                                            }] : []),
                                        ...(formData.website ? [{
                                                platform: 'website',
                                                url: formData.website,
                                                verified: false
                                            }] : [])
                                    ]), children: "Verify Profiles" }), _jsx(Button, { variant: "outline", onClick: () => setActiveStep(null), children: "Cancel" })] })] }));
            default:
                return (_jsxs("div", { className: "verification-form", children: [_jsxs("p", { children: ["Verification form for ", type, " is coming soon."] }), _jsx(Button, { variant: "outline", onClick: () => setActiveStep(null), children: "Close" })] }));
        }
    };
    const renderValidationHistory = () => (_jsxs(Card, { className: "validation-history", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Verification History" }) }), _jsx(CardContent, { children: validationSummary && (_jsxs("div", { className: "history-summary", children: [_jsxs("div", { className: "summary-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Total Requests" }), _jsx("span", { className: "stat-value", children: validationSummary.totalRequests })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Approved" }), _jsx("span", { className: "stat-value text-green-600", children: validationSummary.approvedCount })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Pending" }), _jsx("span", { className: "stat-value text-yellow-600", children: validationSummary.pendingCount })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Rejected" }), _jsx("span", { className: "stat-value text-red-600", children: validationSummary.rejectedCount })] })] }), userTrustScore?.badges && userTrustScore.badges.length > 0 && (_jsxs("div", { className: "earned-badges", children: [_jsx("h4", { children: "Earned Badges" }), _jsx("div", { className: "badges-grid", children: userTrustScore.badges.map((badge, index) => (_jsxs(Badge, { variant: "default", className: "badge-item", children: [_jsx(Award, { className: "w-3 h-3 mr-1" }), badge.replace('_', ' ').toUpperCase()] }, index))) })] }))] })) })] }));
    if (isLoading) {
        return (_jsxs("div", { className: "verification-center loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading verification data..." })] }));
    }
    return (_jsxs("div", { className: `verification-center ${className}`, children: [_jsxs("div", { className: "verification-header", children: [_jsx("h2", { children: "Identity Verification" }), _jsx("p", { children: "Build trust and unlock premium features by verifying your identity and professional credentials." })] }), _jsxs(Tabs, { defaultValue: "overview", className: "verification-tabs", children: [_jsxs(TabsList, { className: "grid grid-cols-3 w-full", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "verify", children: "Verify Identity" }), _jsx(TabsTrigger, { value: "history", children: "History" })] }), _jsx(TabsContent, { value: "overview", className: "tab-content", children: renderTrustScoreOverview() }), _jsx(TabsContent, { value: "verify", className: "tab-content", children: renderVerificationSteps() }), _jsx(TabsContent, { value: "history", className: "tab-content", children: renderValidationHistory() })] }), _jsx("style", { jsx: true, children: `
        .verification-center {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }

        .verification-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .verification-header h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .verification-header p {
          color: #6b7280;
          font-size: 1.125rem;
        }

        .trust-score-overview {
          margin-bottom: 1rem;
        }

        .trust-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .trust-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .trust-tier {
          display: flex;
          align-items: center;
        }

        .score-circle {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .score-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }

        .score-max {
          font-size: 1rem;
          color: #9ca3af;
        }

        .verification-progress {
          margin: 1.5rem 0;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .trust-breakdown {
          margin: 1.5rem 0;
        }

        .trust-breakdown h4 {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .components-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .component-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .component-score {
          margin-left: auto;
          font-weight: 600;
          color: #374151;
        }

        .trust-benefits h4 {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .benefits-list li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .step-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .step-item.active {
          border-color: #3b82f6;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        .step-icon {
          flex-shrink: 0;
        }

        .step-info {
          flex: 1;
        }

        .step-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .step-description {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .step-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .step-form {
          border-top: 1px solid #e5e7eb;
          padding: 1rem;
          background: #f9fafb;
        }

        .verification-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
        }

        .form-input, .form-select, .form-textarea {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .history-summary {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .earned-badges h4 {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .badges-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .badge-item {
          display: flex;
          align-items: center;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem;
          gap: 1rem;
        }

        .loading-spinner {
          width: 2rem;
          height: 2rem;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .trust-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .components-grid {
            grid-template-columns: 1fr;
          }

          .summary-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .step-header {
            flex-direction: column;
            gap: 0.75rem;
            align-items: stretch;
          }

          .step-actions {
            justify-content: center;
          }
        }
      ` })] }));
};
export default VerificationCenter;
