import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
import './LoadingState.css';
export const LoadingState = ({
    message = 'Loading...',
    size = 'medium',
    overlay = false,
    showSpinner = true,
    className = ''
});
{
    const sizeConfig = {
        small: { spinner: 16, fontSize: '14px', padding: '16px' },
        medium: { spinner: 24, fontSize: '16px', padding: '24px' },
        large: { spinner: 32, fontSize: '18px', padding: '32px' }
    };
    const config = sizeConfig[size];
    const content = ();
    ;
    _jsx("div", { className: `loading-state ${overlay ? 'overlay' : ''} ${className}`, style: { padding: config.padding }, children: _jsxs("div", { className: "loading-content", children: [showSpinner && ()
                    < Loader2, "size=", config.spinner, "className=\"loading-spinner\" /> )}", _jsx("span", { className: "loading-message", style: { fontSize: config.fontSize }, children: message })] }) });
    ;
    return overlay ? ()
        < div : ;
    className = "loading-overlay" >
        { content };
    div >
    ;
    content;
}
;
export default LoadingState;
