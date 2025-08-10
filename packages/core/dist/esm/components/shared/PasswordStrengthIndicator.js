import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PasswordStrengthIndicator({ strength, requirements }) {
    const strengthConfig = {
        weak: {
            width: '33%',
            color: '#dc3545',
            label: 'Weak'
        },
        medium: {
            width: '66%',
            color: '#ffc107',
            label: 'Medium'
        },
        strong: {
            width: '100%',
            color: '#28a745',
            label: 'Strong'
        }
    };
    const config = strengthConfig[strength];
    return (_jsxs("div", { style: { marginBottom: '20px', marginTop: '-10px' }, children: [_jsxs("div", { style: { marginBottom: '12px' }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px'
                        }, children: [_jsx("span", { style: {
                                    fontSize: '12px',
                                    color: '#6c757d',
                                    fontWeight: '500'
                                }, children: "Password Strength" }), _jsx("span", { style: {
                                    fontSize: '12px',
                                    color: config.color,
                                    fontWeight: '600'
                                }, children: config.label })] }), _jsx("div", { style: {
                            height: '4px',
                            backgroundColor: '#e9ecef',
                            borderRadius: '2px',
                            overflow: 'hidden'
                        }, children: _jsx("div", { style: {
                                height: '100%',
                                width: config.width,
                                backgroundColor: config.color,
                                transition: 'width 0.3s ease, background-color 0.3s ease'
                            } }) })] }), _jsxs("div", { style: {
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '12px'
                }, children: [_jsx("div", { style: { marginBottom: '4px', fontWeight: '500', color: '#495057' }, children: "Password requirements:" }), _jsxs("ul", { style: {
                            margin: 0,
                            paddingLeft: '20px',
                            listStyle: 'none'
                        }, children: [_jsx(RequirementItem, { met: requirements.minLength, text: "At least 8 characters" }), _jsx(RequirementItem, { met: requirements.hasUppercase, text: "One uppercase letter" }), _jsx(RequirementItem, { met: requirements.hasNumber, text: "One number" }), _jsx(RequirementItem, { met: requirements.hasLowercase, text: "One lowercase letter", optional: true }), _jsx(RequirementItem, { met: requirements.hasSpecial, text: "One special character", optional: true })] })] })] }));
}
function RequirementItem({ met, text, optional = false }) {
    return (_jsxs("li", { style: {
            position: 'relative',
            paddingLeft: '20px',
            marginBottom: '2px',
            color: met ? '#28a745' : optional ? '#6c757d' : '#dc3545'
        }, children: [_jsx("span", { style: {
                    position: 'absolute',
                    left: 0,
                    top: '1px'
                }, children: met ? '✓' : optional ? '○' : '✗' }), text, optional && (_jsx("span", { style: {
                    marginLeft: '4px',
                    color: '#6c757d',
                    fontStyle: 'italic'
                }, children: "(recommended)" }))] }));
}
