import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export function StateRecoveryDialog({ report, onAttemptRecovery, onStartFresh, onLoadFromFile, onClose }) {
    const totalRecoverable = report.recoverable.nodes + report.recoverable.edges;
    const totalCorrupted = report.corrupted.nodes.length + report.corrupted.edges.length;
    const total = totalRecoverable + totalCorrupted;
    const recoveryPercentage = total > 0 ? Math.round((totalRecoverable / total) * 100) : 0;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        }, role: "dialog", "aria-labelledby": "recovery-title", "aria-describedby": "recovery-description", children: _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
            }, children: [_jsxs("h2", { id: "recovery-title", style: {
                        margin: '0 0 8px 0',
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }, children: [_jsx("span", { style: { fontSize: '28px' }, children: "\u26A0\uFE0F" }), "State Recovery Needed"] }), _jsx("p", { id: "recovery-description", style: {
                        margin: '0 0 24px 0',
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.6'
                    }, children: report.details || 'We detected issues with your saved work. Choose how to proceed:' }), _jsxs("div", { style: {
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '24px',
                        border: '1px solid #dee2e6'
                    }, children: [_jsx("h3", { style: {
                                margin: '0 0 12px 0',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#495057'
                            }, children: "Recovery Analysis" }), _jsxs("div", { style: { display: 'grid', gap: '8px', fontSize: '13px' }, children: [_jsx(RecoveryStatRow, { label: "Nodes", recoverable: report.recoverable.nodes, corrupted: report.corrupted.nodes.length }), _jsx(RecoveryStatRow, { label: "Edges", recoverable: report.recoverable.edges, corrupted: report.corrupted.edges.length }), report.recoverable.viewport && (_jsx("div", { style: { color: '#28a745' }, children: "\u2713 Viewport position recoverable" })), report.recoverable.selection && (_jsx("div", { style: { color: '#28a745' }, children: "\u2713 Selection state recoverable" }))] }), recoveryPercentage > 0 && (_jsxs("div", { style: {
                                marginTop: '12px',
                                paddingTop: '12px',
                                borderTop: '1px solid #dee2e6'
                            }, children: [_jsxs("div", { style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '4px'
                                    }, children: [_jsx("span", { style: { fontSize: '12px', color: '#6c757d' }, children: "Recovery Rate" }), _jsxs("span", { style: { fontSize: '14px', fontWeight: '600', color: '#495057' }, children: [recoveryPercentage, "%"] })] }), _jsx("div", { style: {
                                        height: '8px',
                                        backgroundColor: '#e9ecef',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }, children: _jsx("div", { style: {
                                            height: '100%',
                                            width: `${recoveryPercentage}%`,
                                            backgroundColor: recoveryPercentage > 80 ? '#28a745' :
                                                recoveryPercentage > 50 ? '#ffc107' : '#dc3545',
                                            transition: 'width 0.3s ease'
                                        } }) })] }))] }), report.errors.length > 0 && (_jsxs("div", { style: {
                        backgroundColor: '#f8d7da',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '24px',
                        border: '1px solid #f5c6cb'
                    }, children: [_jsx("h4", { style: {
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#721c24'
                            }, children: "Errors Detected:" }), _jsxs("ul", { style: {
                                margin: 0,
                                paddingLeft: '20px',
                                fontSize: '12px',
                                color: '#721c24'
                            }, children: [report.errors.slice(0, 3).map((error, index) => (_jsx("li", { children: error }, index))), report.errors.length > 3 && (_jsxs("li", { children: ["...and ", report.errors.length - 3, " more"] }))] })] })), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [report.recommendation !== 'reset' && (_jsxs("button", { onClick: onAttemptRecovery, style: {
                                padding: '12px 20px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#007bff',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#0056b3';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = '#007bff';
                            }, children: [_jsx("span", { children: "\uD83D\uDD27" }), "Attempt Recovery", recoveryPercentage > 0 && (_jsxs("span", { style: { opacity: 0.9, fontSize: '13px' }, children: ["(", recoveryPercentage, "% recoverable)"] }))] })), _jsxs("button", { onClick: onStartFresh, style: {
                                padding: '12px 20px',
                                borderRadius: '6px',
                                border: '1px solid #dee2e6',
                                backgroundColor: report.recommendation === 'reset' ? '#28a745' : '#f8f9fa',
                                color: report.recommendation === 'reset' ? 'white' : '#495057',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }, onMouseEnter: (e) => {
                                if (report.recommendation === 'reset') {
                                    e.currentTarget.style.backgroundColor = '#218838';
                                }
                                else {
                                    e.currentTarget.style.backgroundColor = '#e9ecef';
                                }
                            }, onMouseLeave: (e) => {
                                if (report.recommendation === 'reset') {
                                    e.currentTarget.style.backgroundColor = '#28a745';
                                }
                                else {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }
                            }, children: [_jsx("span", { children: "\uD83C\uDD95" }), "Start Fresh", report.recommendation === 'reset' && (_jsx("span", { style: { opacity: 0.9, fontSize: '13px' }, children: "(Recommended)" }))] }), _jsxs("button", { onClick: onLoadFromFile, style: {
                                padding: '12px 20px',
                                borderRadius: '6px',
                                border: '1px solid #dee2e6',
                                backgroundColor: '#f8f9fa',
                                color: '#495057',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#e9ecef';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }, children: [_jsx("span", { children: "\uD83D\uDCC1" }), "Load from File"] }), onClose && (_jsx("button", { onClick: onClose, style: {
                                padding: '8px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#6c757d',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'color 0.2s'
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.color = '#495057';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.color = '#6c757d';
                            }, children: "Cancel" }))] })] }) }));
}
/**
 * Recovery statistics row component
 */
function RecoveryStatRow({ label, recoverable, corrupted }) {
    const total = recoverable + corrupted;
    if (total === 0) {
        return (_jsxs("div", { style: { color: '#6c757d' }, children: [label, ": None found"] }));
    }
    return (_jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }, children: [_jsxs("span", { style: { color: '#495057' }, children: [label, ":"] }), _jsxs("span", { children: [_jsx("span", { style: { color: '#28a745', fontWeight: '500' }, children: recoverable }), corrupted > 0 && (_jsxs(_Fragment, { children: [' / ', _jsxs("span", { style: { color: '#dc3545', fontWeight: '500' }, children: [corrupted, " corrupted"] })] })), _jsxs("span", { style: { color: '#6c757d', fontSize: '12px', marginLeft: '4px' }, children: ["(of ", total, ")"] })] })] }));
}
