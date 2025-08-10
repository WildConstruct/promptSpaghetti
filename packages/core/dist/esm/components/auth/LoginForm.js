import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Login form component
 */
import { useState } from 'react';
import { useEmailValidation, usePasswordValidation, getAuthErrorMessage } from '../../hooks/useAuthValidation';
import { FormField } from '../shared/FormField';
export function LoginForm({ onSuccess, onForgotPassword }) {
    const email = useEmailValidation();
    const password = usePasswordValidation(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isFormValid = email.isValid && password.isValid;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            email.onBlur();
            password.onBlur();
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // TODO: Replace with actual Supabase auth call
            // const { data, error } = await supabase.auth.signInWithPassword({
            //   email: email.value,
            //   password: password.value
            // });
            // Simulated auth call for now
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (email.value === 'test@example.com' && password.value === 'Test1234') {
                        resolve({ user: { email: email.value, id: '123' } });
                    }
                    else {
                        reject(new Error('Invalid login credentials'));
                    }
                }, 1000);
            });
            setShowSuccessMessage(true);
            setTimeout(() => {
                onSuccess({ email: email.value });
            }, 500);
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
                }, role: "status", children: "\u2713 Login successful! Redirecting..." })), _jsx(FormField, { label: "Email", type: "email", value: email.value, onChange: email.onChange, onBlur: email.onBlur, error: email.error, disabled: isLoading, autoComplete: "email", required: true, placeholder: "you@example.com" }), _jsx(FormField, { label: "Password", type: showPassword ? 'text' : 'password', value: password.value, onChange: password.onChange, onBlur: password.onBlur, error: password.error, disabled: isLoading, autoComplete: "current-password", required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", showPasswordToggle: true, onTogglePassword: () => setShowPassword(!showPassword) }), _jsx("div", { style: {
                    textAlign: 'right',
                    marginBottom: '20px'
                }, children: _jsx("button", { type: "button", onClick: onForgotPassword, style: {
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                    }, disabled: isLoading, children: "Forgot password?" }) }), _jsx("button", { type: "submit", disabled: !isFormValid || isLoading, style: {
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isFormValid && !isLoading ? '#007bff' : '#e9ecef',
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
                        e.currentTarget.style.backgroundColor = '#0056b3';
                    }
                }, onMouseLeave: (e) => {
                    if (isFormValid && !isLoading) {
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
                            } }), "Logging in..."] })) : ('Log In') }), _jsx("style", { children: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` })] }));
}
