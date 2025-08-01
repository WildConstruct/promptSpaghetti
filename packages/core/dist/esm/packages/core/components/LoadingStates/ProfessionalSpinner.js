import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { animationDurations, createSmoothTransition } from '../../utils/smoothAnimations';
import '../../styles/smoothAnimations.css';
export const ProfessionalSpinner = ({
    size = 'medium',
    variant = 'primary',
    type = 'spinner',
    message,
    progress
});
{
    const getSizeConfig = () => {
        const sizes = {
            small: { spinner: 16, text: 12, gap: 8 },
            medium: { spinner: 24, text: 14, gap: 12 },
            large: { spinner: 32, text: 16, gap: 16 },
            xl: { spinner: 48, text: 18, gap: 20 }
        };
        return sizes[size];
    };
    const getColors = () => {
        const colors = {
            primary: {
                main: '#3b82f6',
                light: 'rgba(59, 130, 246, 0.3)',
                gradient: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
            },
            secondary: {
                main: '#6b7280',
                light: 'rgba(107, 114, 128, 0.3)',
                gradient: 'linear-gradient(45deg, #6b7280, #374151)',
            },
            accent: {
                main: '#10b981',
                light: 'rgba(16, 185, 129, 0.3)',
                gradient: 'linear-gradient(45deg, #10b981, #047857)',
            },
            cinema4d: {
                main: '#ff6b35',
                light: 'rgba(255, 107, 53, 0.3)',
                gradient: 'linear-gradient(45deg, #ff6b35, #e55039)',
            },
            return: colors[variant]
        };
        const { spinner: spinnerSize, text: textSize, gap } = getSizeConfig();
        const colors = getColors();
        const containerStyle = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: gap,
            color: '#f3f4f6',
        };
        const renderSpinner = () => {
            switch (type) {
                case 'spinner':
                    return;
                    _jsx("div", { style: {
                            width: spinnerSize,
                            height: spinnerSize,
                            border: `2px solid ${colors.light}`
                        }, "borderTop:": true });
                    `2px solid ${colors.main}`;
            }
        }, borderRadius, animation;
    };
    createSmoothTransition(['border-color']);
}
className = "animate-loading-spinner"
    /  >
;
;
'dots';
return;
_jsxs("div", { className: "spinner-dots", style: { gap: spinnerSize / 4 }, children: [[0, 1, 2].map((i) => ()
            < div, key = { i }, className = "dot", style = {}, {
            width: spinnerSize / 3,
            height: spinnerSize / 3,
            background: colors.main,
            animationDelay: `${i * 0.16}s`
        }), "} /> ))}"] });
;
'pulse';
return;
_jsx("div", { style: {
        width: spinnerSize,
        height: spinnerSize,
        borderRadius: '50%',
        background: colors.gradient,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ...createSmoothTransition(['background'])
    }, className: "animate-loading-pulse" });
;
'bars';
return;
_jsxs("div", { style: {
        display: 'flex',
        gap: spinnerSize / 8,
        alignItems: 'flex-end',
        height: spinnerSize,
    }, children: [[0, 1, 2, 3].map((i) => ()
            < div, key = { i }, style = {}, {
            width: spinnerSize / 6,
            background: colors.gradient,
            borderRadius: spinnerSize / 12,
            animation: 'bar-bounce 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`
        }), ", height: '100%', transformOrigin: 'bottom'; }} /> ))}"] });
;
'ring';
return;
_jsx("div", { style: {
        width: spinnerSize,
        height: spinnerSize,
        border: `3px solid ${colors.light}`
    }, "borderRadius:": true });
'50%',
    position;
'relative',
    animation;
'spin 2s linear infinite';
    >
        _jsx("div", { style: {
                position: 'absolute',
                top: -3,
                left: -3,
                right: -3,
                bottom: -3,
                border: '3px solid transparent',
                borderTop: `3px solid ${colors.main}`
            }, "borderRadius:": true });
'50%',
    animation;
'spin 1s linear infinite reverse';
/>;
div >
;
;
return null;
;
return;
_jsxs("div", { style: containerStyle, children: [renderSpinner(), message && ()
            < div, "style=", {
            fontSize: textSize,
            color: '#9ca3af',
            textAlign: 'center',
            fontWeight: 500,
            letterSpacing: '0.025em',
            ...createSmoothTransition(['color'])
        }, ">", message] });
{
    typeof progress === 'number' && ()
        < div;
    style = {};
    {
        width: spinnerSize * 2,
            height;
        4,
            background;
        colors.light,
            borderRadius;
        2,
            overflow;
        'hidden',
            position;
        'relative',
        ;
    }
}
    >
        _jsx("div", { style: {
                width: `${progress}%`
            }, "height:": true });
'100%',
    background;
colors.gradient,
    borderRadius;
2,
;
createSmoothTransition(['width'], animationDurations.normal);
/>
    < div;
style = {};
{
    position: 'absolute',
        top;
    0,
        left;
    0,
        right;
    0,
        bottom;
    0,
        background;
    'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        animation;
    'shimmer 2s infinite',
    ;
}
/>;
div >
;
div >
;
;
;
export const LoadingOverlay = ({
    visible,
    message,
    progress,
    variant = 'primary',
    backdrop = 'blur',
    onCancel
});
{
    if (!visible)
        return null;
    const getBackdropStyle = () => {
        const base = {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        };
        switch (backdrop) {
            case 'blur':
                return {
                    ...base,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                };
            case 'solid':
                return {
                    ...base,
                    background: 'rgba(0, 0, 0, 0.8)',
                };
            case 'transparent':
                return {
                    ...base,
                    background: 'transparent',
                };
            default:
                return base;
        }
        ;
        return;
        _jsxs("div", { style: getBackdropStyle(), children: [_jsxs("div", { style: {
                        background: 'rgba(31, 41, 55, 0.95)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: 16,
                        padding: 32,
                        border: '1px solid rgba(55, 65, 81, 0.3)',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        animation: 'scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        minWidth: 200,
                        textAlign: 'center',
                    }, children: [_jsx(ProfessionalSpinner, { size: "large", variant: variant, type: "spinner", message: message, progress: progress }), onCancel && ()
                            < button, "onClick=", onCancel, "style=", {
                            marginTop: 20,
                            background: 'rgba(107, 114, 128, 0.2)',
                            border: '1px solid rgba(107, 114, 128, 0.3)',
                            borderRadius: 8,
                            padding: '8px 16px',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            fontSize: 14,
                            ...createSmoothTransition(['background', 'border-color', 'color'])
                        }, "onMouseEnter=", (e) => {
                            e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)';
                            e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.5)';
                            e.currentTarget.style.color = '#f3f4f6';
                        }, "onMouseLeave=", (e) => {
                            e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                            e.currentTarget.style.color = '#9ca3af';
                        }, "> Cancel"] }), ")}"] });
    };
    div >
    ;
    ;
}
;
export const InlineLoader = ({
    loading,
    size = 'medium',
    text,
    children
});
{
    if (!loading) {
        return _jsx(_Fragment, { children: children });
        return;
        _jsxs("div", { style: {
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: size === 'small' ? 40 : 60,
                color: '#9ca3af',
            }, children: [_jsx("div", { style: {
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(31, 41, 55, 0.8)',
                        backdropFilter: 'blur(2px)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }, children: _jsx(ProfessionalSpinner, { size: size, variant: "secondary", type: "dots", message: text }) }), _jsx("div", { style: { opacity: 0.3 }, children: children })] });
        ;
    }
    ;
    // Additional keyframes for bar animation
    const barBounceKeyframes = `;
  @keyframes bar-bounce {
    0%, 80%, 100% {
      transform: scaleY(0.6);
    40% {
      transform: scaleY(1);
`;
    // Inject keyframes
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = barBounceKeyframes;
        document.head.appendChild(style);
    }
}
