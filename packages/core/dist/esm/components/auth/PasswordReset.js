import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Password reset form component
 */
import { useState } from 'react';
import { useEmailValidation, getAuthErrorMessage } from '../../hooks/useAuthValidation';
import { FormField } from '../shared/FormField';
export function PasswordReset({ onBack }) {
    const email = useEmailValidation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.isValid) {
            email.onBlur();
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // TODO: Replace with actual Supabase auth call
            // const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
            //   redirectTo: `${window.location.origin}/reset-password`
            // });
            // Simulated auth call for now
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
            setIsSuccess(true);
        }
        catch (err) {
            setError(getAuthErrorMessage(err));
        }
        finally {
            setIsLoading(false);
        }
    };
    if (isSuccess) {
        return (_jsxs("div", { style: { textAlign: 'center', padding: '20px 0' }, children: [_jsx("div", { style: {
                        fontSize: '48px',
                        marginBottom: '16px'
                    }, children: "\uD83D\uDCE7" }), _jsx("h3", { style: {
                        margin: '0 0 12px 0',
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#212529'
                    }, children: "Check Your Email" }), _jsxs("p", { style: {
                        margin: '0 0 24px 0',
                        fontSize: '14px',
                        color: '#6c757d',
                        lineHeight: '1.5'
                    }, children: ["We've sent a password reset link to", _jsx("br", {}), _jsx("strong", { children: email.value })] }), _jsxs("div", { style: {
                        padding: '12px',
                        backgroundColor: '#d1ecf1',
                        border: '1px solid #bee5eb',
                        borderRadius: '6px',
                        color: '#0c5460',
                        fontSize: '13px',
                        textAlign: 'left',
                        marginBottom: '24px'
                    }, children: [_jsx("strong", { children: "Didn't receive the email?" }), _jsxs("ul", { style: {
                                margin: '8px 0 0 0',
                                paddingLeft: '20px'
                            }, children: [_jsx("li", { children: "Check your spam folder" }), _jsx("li", { children: "Make sure you entered the correct email" }), _jsx("li", { children: "Wait a few minutes and try again" })] })] }), _jsx("button", { onClick: onBack, style: {
                        padding: '10px 20px',
                        borderRadius: '6px',
                        border: '1px solid #007bff',
                        backgroundColor: 'white',
                        color: '#007bff',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }, onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = '#007bff';
                        e.currentTarget.style.color = 'white';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '#007bff';
                    }, children: "Back to Login" })] }));
    }
    return (_jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [_jsx("p", { style: {
                    margin: '0 0 20px 0',
                    fontSize: '14px',
                    color: '#6c757d',
                    lineHeight: '1.5'
                }, children: "Enter your email address and we'll send you a link to reset your password." }), error && (_jsx("div", { style: {
                    padding: '12px',
                    marginBottom: '20px',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '6px',
                    color: '#721c24',
                    fontSize: '14px'
                }, role: "alert", children: error })), _jsx(FormField, { label: "Email", type: "email", value: email.value, onChange: email.onChange, onBlur: email.onBlur, error: email.error, disabled: isLoading, autoComplete: "email", required: true, placeholder: "you@example.com" }), _jsx("button", { type: "submit", disabled: !email.isValid || isLoading, style: {
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: email.isValid && !isLoading ? '#007bff' : '#e9ecef',
                    color: email.isValid && !isLoading ? 'white' : '#6c757d',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: email.isValid && !isLoading ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                }, onMouseEnter: (e) => {
                    if (email.isValid && !isLoading) {
                        e.currentTarget.style.backgroundColor = '#0056b3';
                    }
                }, onMouseLeave: (e) => {
                    if (email.isValid && !isLoading) {
                        e.currentTarget.style.backgroundColor = '#007bff';
                    }
                }, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("span", { style: {
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                border: '2px solid #6c757d',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            } }), "Sending..."] })) : ('Send Reset Link') })] }));
}
