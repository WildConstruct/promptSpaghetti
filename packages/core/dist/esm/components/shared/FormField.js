import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FormField({ label, type, value, onChange, onBlur, error, disabled = false, autoComplete, required = false, placeholder, showPasswordToggle = false, onTogglePassword }) {
    const inputId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${inputId}-error`;
    return (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("label", { htmlFor: inputId, style: {
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#212529'
                }, children: [label, required && (_jsx("span", { style: {
                            color: '#dc3545',
                            marginLeft: '4px'
                        }, "aria-label": "required", children: "*" }))] }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { id: inputId, type: type, value: value, onChange: (e) => onChange(e.target.value), onBlur: onBlur, disabled: disabled, autoComplete: autoComplete, required: required, placeholder: placeholder, "aria-invalid": !!error, "aria-describedby": error ? errorId : undefined, style: {
                            width: '100%',
                            padding: showPasswordToggle ? '10px 40px 10px 12px' : '10px 12px',
                            fontSize: '15px',
                            border: `1px solid ${error ? '#dc3545' : '#ced4da'}`,
                            borderRadius: '6px',
                            backgroundColor: disabled ? '#e9ecef' : 'white',
                            color: '#495057',
                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }, onFocus: (e) => {
                            if (!error) {
                                e.currentTarget.style.borderColor = '#80bdff';
                                e.currentTarget.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                            }
                        }, onBlurCapture: (e) => {
                            e.currentTarget.style.borderColor = error ? '#dc3545' : '#ced4da';
                            e.currentTarget.style.boxShadow = 'none';
                        } }), showPasswordToggle && onTogglePassword && (_jsx("button", { type: "button", onClick: onTogglePassword, disabled: disabled, style: {
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#6c757d',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }, "aria-label": type === 'password' ? 'Show password' : 'Hide password', children: type === 'password' ? '👁' : '👁‍🗨' }))] }), error && (_jsx("div", { id: errorId, style: {
                    marginTop: '4px',
                    fontSize: '13px',
                    color: '#dc3545'
                }, role: "alert", children: error }))] }));
}
