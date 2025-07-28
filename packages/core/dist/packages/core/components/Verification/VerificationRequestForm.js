import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Verification Request Form - E17-1753114397395-B624E7
 *
 * Main component for submitting verification requests.
 * Handles different verification types and guides users through the process.
 */
import { useState, useCallback } from 'react';
{
    requestId: string;
    status: string;
}
 > ;
onCancel ?  : () => void ;
{
    const [currentStep, setCurrentStep] = useState('email');
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitErrors, setSubmitErrors] = useState([]);
    const currentStepData = VERIFICATION_STEPS.find(step => step.id === currentStep);
    const handleStepSubmit = useCallback(async (stepData) => {
        if (!currentStepData)
            return;
        setIsSubmitting(true);
        setSubmitErrors([]);
        try {
            // Update form data
            setFormData(prev => ({ ...prev, ...stepData }));
            // Move to next step or complete
            const currentIndex = VERIFICATION_STEPS.findIndex(step => step.id === currentStep);
            if (currentIndex < VERIFICATION_STEPS.length - 1) {
                setCurrentStep(VERIFICATION_STEPS[currentIndex + 1].id);
            }
            try { }
            catch (error) {
                setSubmitErrors([`Failed to submit ${currentStepData.title}: ${error.message}`]);
            }
        }
        finally {
            setIsSubmitting(false);
        }
        [currentStep, currentStepData, onSubmit];
    });
    const handleStepSelect = useCallback((stepId) => {
        setCurrentStep(stepId);
        setSubmitErrors([]);
    }, []);
    if (!currentStepData) {
        return _jsx("div", { className: "verification-error", children: "Invalid verification step" });
        return;
        _jsxs("div", { className: "verification-request-form", children: [_jsxs("div", { className: "verification-header", children: [_jsx("h2", { children: "Account Verification" }), _jsx("p", { children: "Complete verification to build trust and unlock marketplace features" })] }), _jsxs("div", { className: "verification-steps", children: [VERIFICATION_STEPS.map((step, index) => ()
                            < div, key = { step, : .id }, className = {} `step ${step.id === currentStep ? 'active' : ''} ${}
              VERIFICATION_STEPS.findIndex(s => s.id === currentStep) > index ? 'completed' : ''
            }`), "onClick=", () => handleStepSelect(step.id), ">", _jsx("div", { className: "step-number", children: index + 1 }), _jsxs("div", { className: "step-info", children: [_jsx("div", { className: "step-title", children: step.title }), step.required && _jsx("span", { className: "required", children: "Required" })] })] }), "))}"] });
        { /* Current Step Content */ }
        _jsxs("div", { className: "verification-content", children: [_jsxs("div", { className: "step-header", children: [_jsx("h3", { children: currentStepData.title }), _jsx("p", { children: currentStepData.description })] }), submitErrors.length > 0 && ()
                    < div, " className=\"error-messages\">", submitErrors.map((error, index) => ()
                    < div, key = { index }, className = "error-message" > { error })] });
    }
    div >
    ;
}
_jsx(VerificationStepContent, { step: currentStepData, data: formData, onSubmit: handleStepSubmit, isSubmitting: isSubmitting });
div >
    { /* Navigation */}
    < div;
className = "verification-navigation" >
    { onCancel } && ()
    < button;
type = "button";
className = "btn btn-secondary";
onClick = { onCancel };
disabled = { isSubmitting }
    >
        Cancel;
button >
;
_jsxs("div", { className: "nav-info", children: ["Step ", VERIFICATION_STEPS.findIndex(s => s.id === currentStep) + 1, " of ", VERIFICATION_STEPS.length] });
div >
    _jsx("style", { children: `
        .verification-request-form {
          max-width: 800px;,
  margin: 0 auto;
          padding: 24px;,
  background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        .verification-header {
          text-align: center;
          margin-bottom: 32px;
        .verification-header h2 {
          font-size: 28px;
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 8px 0;
        .verification-header p {
          color: #6b7280;
          font-size: 16px;,
  margin: 0;
        .verification-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;,
  padding: 0 20px;
        .step {
          display: flex;
          align-items: center;,
  cursor: pointer;
          padding: 12px;
          border-radius: 8px;,
  transition: background-color 0.2s;
          min-width: 140px;
        .step:hover {
          background-color: #f3f4f6;
        .step.active {
          background-color: #dbeafe;,
  border: 2px solid #3b82f6;
        .step.completed .step-number {
          background-color: #10b981;,
  color: white;
        .step-number {
          width: 32px;,
  height: 32px;
          border-radius: 50%;
          background-color: #e5e7eb;,
  color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-right: 12px;
          flex-shrink: 0;
        .step.active .step-number {
          background-color: #3b82f6;,
  color: white;
        .step-info {
          flex: 1;
        .step-title {
          font-weight: 500;,
  color: #1f2937;
          font-size: 14px;
          margin-bottom: 2px;
        .required {
          background-color: #fef2f2;,
  color: #dc2626;
          font-size: 11px;,
  padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        .verification-content {
          margin-bottom: 32px;
        .step-header {
          margin-bottom: 24px;
        .step-header h3 {
          font-size: 20px;
          font-weight: 600;,
  color: #1f2937;
          margin: 0 0 8px 0;
        .step-header p {
          color: #6b7280;
          font-size: 14px;,
  margin: 0;
        .error-messages {
          margin-bottom: 20px;
        .error-message {
          background-color: #fef2f2;,
  color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid #dc2626;
          margin-bottom: 8px;
          font-size: 14px;
        .verification-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        .nav-info {
          color: #6b7280;
          font-size: 14px;
        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;,
  cursor: pointer;
          border: none;,
  transition: all 0.2s;
        .btn-secondary {
          background-color: #f3f4f6;,
  color: #374151;
        .btn-secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
        .btn:disabled {,
  opacity: 0.5;
          cursor: not-allowed;
        .verification-error {
          text-align: center;,
  color: #dc2626;
          padding: 40px;
        @media (max-width: 768px) {
          .verification-request-form {
            padding: 16px;
          .verification-steps {
            flex-direction: column;,
  gap: 8px;
          .step {
            width: 100%;
      ` });
div >
;
;
;
{
    const [stepData, setStepData] = useState(data);
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        await onSubmit(stepData);
    }, [stepData, onSubmit]);
    const updateStepData = useCallback((updates) => {
        setStepData(prev => ({ ...prev, ...updates }));
    }, []);
    switch (step.verificationType) {
        case 'email_verification':
            return;
            _jsx(EmailVerificationStep, { data: stepData, onUpdate: updateStepData, onSubmit: handleSubmit, isSubmitting: isSubmitting });
            ;
        case 'phone_verification':
            return;
            _jsx(PhoneVerificationStep, { data: stepData, onUpdate: updateStepData, onSubmit: handleSubmit, isSubmitting: isSubmitting });
            ;
        case 'government_id':
            return;
            _jsx(GovernmentIdStep, { data: stepData, onUpdate: updateStepData, onSubmit: handleSubmit, isSubmitting: isSubmitting });
            ;
        case 'professional_credentials':
            return;
            _jsx(ProfessionalCredentialsStep, { data: stepData, onUpdate: updateStepData, onSubmit: handleSubmit, isSubmitting: isSubmitting });
            ;
        case 'social_media_verification':
            return;
            _jsx(SocialMediaStep, { data: stepData, onUpdate: updateStepData, onSubmit: handleSubmit, isSubmitting: isSubmitting });
            ;
        default:
            return _jsx("div", { children: "Unknown verification type" });
    }
    ;
    // Individual Step Components (simplified for now - will be expanded)
    const EmailVerificationStep, Partial;
    _jsxs(IdentityValidationData, { children: ["; onUpdate: (data: Partial", _jsxs(IdentityValidationData, { children: [") => void;, onSubmit: (e: React.FormEvent) => Promise", _jsxs("void", { children: [";, isSubmitting: boolean; }> = (", (data, onUpdate, onSubmit, isSubmitting), ") => ", , "return;", _jsxs("form", { onSubmit: onSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email Address *" }), _jsx("input", { type: "email", id: "email", value: data.email || '', onChange: (e) => onUpdate({ email: e.target.value }), required: true, disabled: isSubmitting }), _jsx("div", { className: "form-help", children: "We'll send a verification email to confirm this address" })] }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isSubmitting || !data.email, children: isSubmitting ? 'Sending...' : 'Send Verification Email' }), _jsx("style", { children: `
        .form-group {
          margin-bottom: 20px;
        label {
          display: block;
          font-weight: 500;,
  color: #374151;
          margin-bottom: 6px;
        input {
          width: 100%;,
  padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;,
  input: focus {;
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        .form-help {
          font-size: 12px;,
  color: #6b7280;
          margin-top: 4px;
        .btn-primary {
          background-color: #3b82f6;,
  color: white;
        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
      ` })] }), "); }; const PhoneVerificationStep: React.FC", _jsx(, { ...(,
                                    data) }), ": Partial", _jsxs(IdentityValidationData, { children: ["; onUpdate: (data: Partial", _jsxs(IdentityValidationData, { children: [") => void;, onSubmit: (e: React.FormEvent) => Promise", _jsxs("void", { children: [";, isSubmitting: boolean; }> = (", (data, onUpdate, onSubmit, isSubmitting), ") => ", , "return;", _jsxs("form", { onSubmit: onSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "phone", children: "Phone Number *" }), _jsx("input", { type: "tel", id: "phone", value: data.phoneNumber || '', onChange: (e) => onUpdate({ phoneNumber: e.target.value }), placeholder: "+1 (555) 123-4567", required: true, disabled: isSubmitting }), _jsx("div", { className: "form-help", children: "Include country code. We'll send a verification SMS" })] }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: isSubmitting || !data.phoneNumber, children: isSubmitting ? 'Sending...' : 'Send Verification SMS' }), _jsx("style", { children: `
        .form-group {
          margin-bottom: 20px;
        label {
          display: block;
          font-weight: 500;,
  color: #374151;
          margin-bottom: 6px;
        input {
          width: 100%;,
  padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;,
  input: focus {;
  outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        .form-help {
          font-size: 12px;,
  color: #6b7280;
          margin-top: 4px;
        .btn-primary {
          background-color: #3b82f6;,
  color: white;
          padding: 10px 20px;,
  border: none;
          border-radius: 6px;
          font-weight: 500;,
  cursor: pointer;
        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        .btn-primary:disabled {,
  opacity: 0.5;
          cursor: not-allowed;
      ` })] }), "); }; // Placeholder components for other steps const GovernmentIdStep: React.FC", _jsx(, { ...(,
                                                            data) }), ": Partial", _jsxs(IdentityValidationData, { children: ["; onUpdate: (data: Partial", _jsxs(IdentityValidationData, { children: [") => void;, onSubmit: (e: React.FormEvent) => Promise", _jsxs("void", { children: [";, isSubmitting: boolean; }> = (", (onSubmit, isSubmitting), ") => ()", _jsxs("div", { children: [_jsx("p", { children: "Government ID verification will be implemented in the next iteration." }), _jsx("button", { type: "button", onClick: (e) => onSubmit(e), disabled: isSubmitting, children: "Skip for Now" })] }), "); const ProfessionalCredentialsStep: React.FC", _jsx(, { ...(,
                                                                                    data) }), ": Partial", _jsxs(IdentityValidationData, { children: ["; onUpdate: (data: Partial", _jsxs(IdentityValidationData, { children: [") => void;, onSubmit: (e: React.FormEvent) => Promise", _jsxs("void", { children: [";, isSubmitting: boolean; }> = (", (onSubmit, isSubmitting), ") => ()", _jsxs("div", { children: [_jsx("p", { children: "Professional credentials verification will be implemented in the next iteration." }), _jsx("button", { type: "button", onClick: (e) => onSubmit(e), disabled: isSubmitting, children: "Skip for Now" })] }), "); const SocialMediaStep: React.FC", _jsx(, { ...(,
                                                                                                            data) }), ": Partial", _jsxs(IdentityValidationData, { children: ["; onUpdate: (data: Partial", _jsxs(IdentityValidationData, { children: [") => void;, onSubmit: (e: React.FormEvent) => Promise", _jsxs("void", { children: [";, isSubmitting: boolean; }> = (", (onSubmit, isSubmitting), ") => ()", _jsxs("div", { children: [_jsx("p", { children: "Social media verification will be implemented in the next iteration." }), _jsx("button", { type: "button", onClick: (e) => onSubmit(e), disabled: isSubmitting, children: "Skip for Now" })] }), "); export default VerificationRequestForm;"] })] })] })] })] })] })] })] })] })] })] })] })] })] })] });
}
