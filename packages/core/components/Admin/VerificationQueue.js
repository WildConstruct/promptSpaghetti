import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Verification Queue Interface - E17-1753114397393-BA8A32
 *
 * Detailed admin review workflow for verification requests
 * Part of Epic 17.5.5 - Verification System
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Textarea } from '../ui/Textarea.js';
import { CheckCircle, AlertCircle, User, Mail, Phone, FileText, Award, Camera, ExternalLink, Flag, Calendar, MapPin, Smartphone, Globe, ArrowLeft, Eye, Download } from 'lucide-react';
export const VerificationQueue = ({ request, onBack, onStatusUpdate, onRequestUpdate, className = '' }) => {
    const [_____activeSection, _____setActiveSection] = useState('details');
    const [reviewDecision, setReviewDecision] = useState({
        status: 'pending',
        reviewNotes: '',
        nextSteps: [],
        flagged: false,
        requiresSeniorReview: false,
        confidenceLevel: 80
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const getVerificationTypeIcon = (type) => {
        const icons = {
            email_verification: Mail,
            phone_verification: Phone,
            government_id: FileText,
            professional_credentials: Award,
            portfolio_verification: Camera,
            social_media_verification: ExternalLink,
            basic_profile: User,
            industry_affiliation: Award,
            address_verification: MapPin,
            payment_method_verification: FileText
        };
        return icons[type] || FileText;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'in_review': return 'text-blue-600 bg-blue-100';
            case 'requires_update': return 'text-orange-600 bg-orange-100';
            case 'expired': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const handleSubmitDecision = async () => {
        if (!reviewDecision.status || !reviewDecision.reviewNotes) {
            alert('Please provide a status and review notes before submitting.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            onStatusUpdate(request.requestId, reviewDecision.status, reviewDecision.reviewNotes);
            onBack();
        }
        catch (error) {
            console.error('Error submitting review decision:', error);
            alert('Error submitting review decision. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const renderRequestDetails = () => {
        const Icon = getVerificationTypeIcon(request.type);
        return (_jsxs(Card, { className: "request-details", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "details-header", children: [_jsx(Icon, { className: "w-6 h-6 text-blue-500" }), _jsxs("div", { children: [_jsx(CardTitle, { children: "Verification Request Details" }), _jsxs("p", { className: "text-sm text-gray-600", children: [request.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), " Verification"] })] }), _jsx(Badge, { className: getStatusColor(request.status), children: request.status.replace('_', ' ').toUpperCase() })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "details-grid", children: [_jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Request ID" }), _jsx("span", { className: "detail-value", children: request.requestId })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "User ID" }), _jsx("span", { className: "detail-value", children: request.userId })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Submitted" }), _jsx("span", { className: "detail-value", children: new Date(request.timestamp).toLocaleString() })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Request Source" }), _jsx("span", { className: "detail-value", children: request.metadata.requestSource.replace('_', ' ') })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Time in Queue" }), _jsxs("span", { className: "detail-value", children: [Math.round((Date.now() - request.timestamp) / (1000 * 60 * 60 * 24)), " days"] })] })] }) })] }));
    };
    const renderUserProfile = () => (_jsxs(Card, { className: "user-profile", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "User Profile Information" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "profile-grid", children: [request.data.fullName && (_jsxs("div", { className: "profile-item", children: [_jsx(User, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "profile-label", children: "Full Name" }), _jsx("span", { className: "profile-value", children: request.data.fullName })] })), request.data.email && (_jsxs("div", { className: "profile-item", children: [_jsx(Mail, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "profile-label", children: "Email" }), _jsx("span", { className: "profile-value", children: request.data.email })] })), request.data.phoneNumber && (_jsxs("div", { className: "profile-item", children: [_jsx(Phone, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "profile-label", children: "Phone" }), _jsx("span", { className: "profile-value", children: request.data.phoneNumber })] })), request.data.dateOfBirth && (_jsxs("div", { className: "profile-item", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "profile-label", children: "Date of Birth" }), _jsx("span", { className: "profile-value", children: request.data.dateOfBirth })] }))] }) })] }));
    const renderVerificationData = () => {
        switch (request.type) {
            case 'government_id':
                return renderGovernmentIdData();
            case 'professional_credentials':
                return renderProfessionalCredentialsData();
            case 'social_media_verification':
                return renderSocialMediaData();
            default:
                return renderGenericVerificationData();
        }
    };
    const renderGovernmentIdData = () => {
        const govId = request.data.governmentId;
        if (!govId)
            return null;
        return (_jsxs(Card, { className: "verification-data", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Government ID Verification" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "data-grid", children: [_jsxs("div", { className: "data-item", children: [_jsx("span", { className: "data-label", children: "Document Type" }), _jsx("span", { className: "data-value", children: govId.type.replace('_', ' ').toUpperCase() })] }), _jsxs("div", { className: "data-item", children: [_jsx("span", { className: "data-label", children: "Document Number" }), _jsx("span", { className: "data-value", children: govId.number })] }), _jsxs("div", { className: "data-item", children: [_jsx("span", { className: "data-label", children: "Expiration Date" }), _jsx("span", { className: "data-value", children: govId.expirationDate })] }), _jsxs("div", { className: "data-item", children: [_jsx("span", { className: "data-label", children: "Issuing Authority" }), _jsx("span", { className: "data-value", children: govId.issuingAuthority })] })] }), govId.documentImages && govId.documentImages.length > 0 && (_jsxs("div", { className: "document-images", children: [_jsx("h4", { children: "Uploaded Documents" }), _jsx("div", { className: "images-grid", children: govId.documentImages.map((image, index) => (_jsxs("div", { className: "image-item", children: [_jsx(FileText, { className: "w-8 h-8 text-gray-400" }), _jsxs("span", { children: ["Document ", index + 1] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Eye, { className: "w-4 h-4 mr-1" }), "View"] })] }, index))) })] }))] })] }));
    };
    const renderProfessionalCredentialsData = () => {
        const credentials = request.data.professionalCredentials;
        if (!credentials)
            return null;
        return (_jsxs(Card, { className: "verification-data", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Professional Credentials" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "data-grid", children: [_jsxs("div", { className: "data-item", children: [_jsx("span", { className: "data-label", children: "Role" }), _jsx("span", { className: "data-value", children: credentials.role })] }), _jsxs("div", { className: "data-item", children: [_jsx("span", { className: "data-label", children: "Experience Level" }), _jsx("span", { className: "data-value", children: credentials.experience })] })] }), credentials.credentials && credentials.credentials.length > 0 && (_jsxs("div", { className: "credentials-list", children: [_jsx("h4", { children: "Credentials" }), credentials.credentials.map((cred, index) => (_jsxs("div", { className: "credential-item", children: [_jsx(Award, { className: "w-4 h-4 text-yellow-500" }), _jsxs("div", { className: "credential-info", children: [_jsx("span", { className: "credential-title", children: cred.title }), _jsxs("span", { className: "credential-details", children: [cred.institution, " \u2022 ", cred.year] })] }), _jsx(Badge, { className: getStatusColor(cred.verificationStatus), children: cred.verificationStatus })] }, index)))] })), credentials.portfolio && credentials.portfolio.length > 0 && (_jsxs("div", { className: "portfolio-list", children: [_jsx("h4", { children: "Portfolio Items" }), credentials.portfolio.map((item, index) => (_jsxs("div", { className: "portfolio-item", children: [_jsx(Camera, { className: "w-4 h-4 text-blue-500" }), _jsxs("div", { className: "portfolio-info", children: [_jsx("span", { className: "portfolio-title", children: item.title }), _jsxs("span", { className: "portfolio-details", children: [item.type, " \u2022 ", item.year, " \u2022 ", item.role] })] }), item.url && (_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-1" }), "View"] }))] }, index)))] }))] })] }));
    };
    const renderSocialMediaData = () => {
        const profiles = request.data.socialMediaProfiles;
        if (!profiles)
            return null;
        return (_jsxs(Card, { className: "verification-data", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Social Media Verification" }) }), _jsx(CardContent, { children: _jsx("div", { className: "profiles-list", children: profiles.map((profile, index) => (_jsxs("div", { className: "profile-item", children: [_jsx(Globe, { className: "w-4 h-4 text-blue-500" }), _jsxs("div", { className: "profile-info", children: [_jsx("span", { className: "profile-platform", children: profile.platform.toUpperCase() }), _jsx("span", { className: "profile-url", children: profile.url }), profile.followerCount && (_jsxs("span", { className: "profile-followers", children: [profile.followerCount.toLocaleString(), " followers"] }))] }), _jsx(Badge, { className: profile.verified ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100', children: profile.verified ? 'Verified' : 'Unverified' })] }, index))) }) })] }));
    };
    const renderGenericVerificationData = () => (_jsxs(Card, { className: "verification-data", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Verification Data" }) }), _jsxs(CardContent, { children: [_jsxs("p", { children: ["Generic verification data display for ", request.type] }), _jsx("pre", { className: "data-dump", children: JSON.stringify(request.data, null, 2) })] })] }));
    const renderMetadata = () => (_jsxs(Card, { className: "metadata", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Request Metadata" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "metadata-grid", children: [_jsxs("div", { className: "metadata-item", children: [_jsx(Smartphone, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "metadata-label", children: "User Agent" }), _jsx("span", { className: "metadata-value", children: request.metadata.userAgent })] }), _jsxs("div", { className: "metadata-item", children: [_jsx(Globe, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "metadata-label", children: "IP Address" }), _jsx("span", { className: "metadata-value", children: request.metadata.ipAddress })] }), _jsxs("div", { className: "metadata-item", children: [_jsx(FileText, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "metadata-label", children: "Session ID" }), _jsx("span", { className: "metadata-value", children: request.metadata.sessionId })] })] }) })] }));
    const renderReviewSection = () => (_jsxs(Card, { className: "review-section", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Review Decision" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "review-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Decision" }), _jsxs("select", { value: reviewDecision.status || 'pending', onChange: (e) => setReviewDecision(prev => ({
                                        ...prev,
                                        status: e.target.value
                                    })), className: "form-select", children: [_jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" }), _jsx("option", { value: "requires_update", children: "Requires Update" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Review Notes *" }), _jsx(Textarea, { value: reviewDecision.reviewNotes || '', onChange: (e) => setReviewDecision(prev => ({
                                        ...prev,
                                        reviewNotes: e.target.value
                                    })), placeholder: "Provide detailed notes about your review decision...", rows: 4, className: "form-textarea" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Confidence Level" }), _jsxs("div", { className: "confidence-slider", children: [_jsx("input", { type: "range", min: "0", max: "100", value: reviewDecision.confidenceLevel || 80, onChange: (e) => setReviewDecision(prev => ({
                                                ...prev,
                                                confidenceLevel: parseInt(e.target.value)
                                            })), className: "slider" }), _jsxs("span", { className: "confidence-value", children: [reviewDecision.confidenceLevel || 80, "%"] })] })] }), _jsxs("div", { className: "form-checkboxes", children: [_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: reviewDecision.flagged || false, onChange: (e) => setReviewDecision(prev => ({
                                                ...prev,
                                                flagged: e.target.checked
                                            })) }), _jsx(Flag, { className: "w-4 h-4 text-red-500" }), "Flag for attention"] }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: reviewDecision.requiresSeniorReview || false, onChange: (e) => setReviewDecision(prev => ({
                                                ...prev,
                                                requiresSeniorReview: e.target.checked
                                            })) }), _jsx(AlertCircle, { className: "w-4 h-4 text-orange-500" }), "Requires senior review"] })] })] }) })] }));
    return (_jsxs("div", { className: `verification-queue ${className}`, children: [_jsxs("div", { className: "queue-header", children: [_jsxs(Button, { onClick: onBack, variant: "outline", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }), "Back to Queue"] }), _jsx("div", { className: "header-actions", children: _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export"] }) })] }), _jsxs("div", { className: "queue-content", children: [_jsxs("div", { className: "content-main", children: [renderRequestDetails(), renderUserProfile(), renderVerificationData(), renderMetadata()] }), _jsxs("div", { className: "content-sidebar", children: [renderReviewSection(), _jsx("div", { className: "action-buttons", children: _jsx(Button, { onClick: handleSubmitDecision, disabled: isSubmitting || !reviewDecision.status || !reviewDecision.reviewNotes, className: "submit-button", children: isSubmitting ? (_jsx(_Fragment, { children: "Processing..." })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "Submit Decision"] })) }) })] })] }), _jsx("style", { jsx: true, children: `
        .verification-queue {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .queue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .queue-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 1.5rem;
        }

        .content-main {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .content-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .details-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }

        .profile-grid, .data-grid, .metadata-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .profile-item, .data-item, .metadata-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .profile-label, .data-label, .metadata-label {
          font-weight: 500;
          color: #374151;
          min-width: 100px;
        }

        .profile-value, .data-value, .metadata-value {
          color: #1f2937;
          flex: 1;
        }

        .document-images, .credentials-list, .portfolio-list, .profiles-list {
          margin-top: 1rem;
        }

        .document-images h4, .credentials-list h4, .portfolio-list h4 {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .image-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
        }

        .credential-item, .portfolio-item, .profile-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }

        .credential-info, .portfolio-info, .profile-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .credential-title, .portfolio-title, .profile-platform {
          font-weight: 600;
          color: #1f2937;
        }

        .credential-details, .portfolio-details, .profile-url, .profile-followers {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .data-dump {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 6px;
          font-size: 0.75rem;
          overflow-x: auto;
        }

        .review-form {
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

        .form-select, .form-textarea {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .confidence-slider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .slider {
          flex: 1;
        }

        .confidence-value {
          font-weight: 600;
          color: #1f2937;
          min-width: 40px;
        }

        .form-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .action-buttons {
          margin-top: 1rem;
        }

        .submit-button {
          width: 100%;
          background: #059669;
          border-color: #059669;
        }

        .submit-button:hover:not(:disabled) {
          background: #047857;
          border-color: #047857;
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .queue-content {
            grid-template-columns: 1fr;
          }
          
          .content-sidebar {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .queue-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .images-grid {
            grid-template-columns: 1fr;
          }
        }
      ` })] }));
};
export default VerificationQueue;
