import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Signup form component with password strength indicator
 */
import { useState } from 'react';
import { useEmailValidation, usePasswordValidation, useConfirmPasswordValidation, getAuthErrorMessage } from '../../hooks/useAuthValidation';
import { FormField } from '../shared/FormField';
import { PasswordStrengthIndicator } from '../shared/PasswordStrengthIndicator';
export function SignupForm({ onSuccess }) {
    const email = useEmailValidation();
    const password = usePasswordValidation(true); // true = signup mode (stricter validation)
    const confirmPassword = useConfirmPasswordValidation(password.value);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const isFormValid = email.isValid &&
        password.isValid &&
        confirmPassword.isValid &&
        agreedToTerms;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            email.onBlur();
            password.onBlur();
            confirmPassword.onBlur();
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // TODO: Replace with actual Supabase auth call
            // const { data, error } = await supabase.auth.signUp({
            //   email: email.value,
            //   password: password.value
            // });
            // Simulated auth call for now
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (email.value.includes('@')) {
                        resolve({ user: { email: email.value, id: '123' } });
                    }
                    else {
                        reject(new Error('Invalid email format'));
                    }
                }, 1000);
            });
            setShowSuccessMessage(true);
            setTimeout(() => {
                onSuccess({ email: email.value });
            }, 1500);
        }
        catch (err) {
            setError(getAuthErrorMessage(err));
            setIsLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [error && (_jsx("div", { style: {
                    padding: '12px',
                    marginBottom: '20px',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '6px',
                    color: '#721c24',
                    fontSize: '14px'
                }, role: "alert", children: error })), showSuccessMessage && (_jsx("div", { style: {
                    padding: '12px',
                    marginBottom: '20px',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '6px',
                    color: '#155724',
                    fontSize: '14px'
                }, role: "status", children: "\u2713 Account created! Check your email to verify your account." })), _jsx(FormField, { label: "Email", type: "email", value: email.value, onChange: email.onChange, onBlur: email.onBlur, error: email.error, disabled: isLoading, autoComplete: "email", required: true, placeholder: "you@example.com" }), _jsx(FormField, { label: "Password", type: password.showPassword ? 'text' : 'password', value: password.value, onChange: password.onChange, onBlur: password.onBlur, error: password.error, disabled: isLoading, autoComplete: "new-password", required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", showPasswordToggle: true, onTogglePassword: password.toggleShowPassword }), password.value && (_jsx(PasswordStrengthIndicator, { strength: password.strength, requirements: password.requirements })), _jsx(FormField, { label: "Confirm Password", type: password.showPassword ? 'text' : 'password', value: confirmPassword.value, onChange: confirmPassword.onChange, onBlur: confirmPassword.onBlur, error: confirmPassword.error, disabled: isLoading, autoComplete: "new-password", required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsxs("div", { style: {
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                }, children: [_jsx("input", { type: "checkbox", id: "terms", checked: agreedToTerms, onChange: (e) => setAgreedToTerms(e.target.checked), disabled: isLoading, style: {
                            marginTop: '4px',
                            cursor: 'pointer'
                        } }), _jsxs("label", { htmlFor: "terms", style: {
                            fontSize: '14px',
                            color: '#495057',
                            cursor: 'pointer',
                            lineHeight: '1.5'
                        }, children: ["I agree to the", ' ', _jsx("a", { href: "#", onClick: (e) => e.preventDefault(), style: {
                                    color: '#007bff',
                                    textDecoration: 'underline'
                                }, children: "Terms of Service" }), ' ', "and", ' ', _jsx("a", { href: "#", onClick: (e) => e.preventDefault(), style: {
                                    color: '#007bff',
                                    textDecoration: 'underline'
                                }, children: "Privacy Policy" })] })] }), _jsx("button", { type: "submit", disabled: !isFormValid || isLoading, style: {
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isFormValid && !isLoading ? '#28a745' : '#e9ecef',
                    color: isFormValid && !isLoading ? 'white' : '#6c757d',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isFormValid && !isLoading ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }, onMouseEnter: (e) => {
                    if (isFormValid && !isLoading) {
                        e.currentTarget.style.backgroundColor = '#218838';
                    }
                }, onMouseLeave: (e) => {
                    if (isFormValid && !isLoading) {
                        e.currentTarget.style.backgroundColor = '#28a745';
                    }
                }, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("span", { style: {
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                border: '2px solid #6c757d',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            } }), "Creating account..."] })) : ('Create Account') }), _jsx("p", { style: {
                    marginTop: '16px',
                    fontSize: '12px',
                    color: '#6c757d',
                    textAlign: 'center',
                    lineHeight: '1.5'
                }, children: "By signing up, you'll get access to save your graphs, collaborate with others, and use advanced features." })] }));
}
