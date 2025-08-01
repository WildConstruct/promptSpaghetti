import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Minimal stub for IntegratedFileBrowser to allow build completion
 */
import { useState } from 'react';
const IntegratedFileBrowser = ({ isOpen, onClose, onFileSelect }) => {
    const [files] = useState([
        {
            id: '1',
            name: 'example.psg',
            size: 1024,
            lastModified: new Date(),
            type: 'file',
        }
    ]);
    if (!isOpen)
        return null;
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
            zIndex: 10000,
        }, children: _jsxs("div", { style: {
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                minWidth: '600px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                overflow: 'auto',
            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }, children: [_jsx("h2", { children: "File Browser" }), _jsx("button", { onClick: onClose, style: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }, children: "\u00D7" })] }), _jsx("div", { style: { marginBottom: '16px' }, children: _jsx("input", { type: "text", placeholder: "Search files...", style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' } }) }), _jsx("div", { style: { border: '1px solid #eee', borderRadius: '4px', minHeight: '200px' }, children: files.length === 0 ? (_jsxs("div", { style: { padding: '40px', textAlign: 'center', color: '#666' }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDCC1" }), _jsx("div", { children: "No files found" })] })) : (_jsx("div", { children: files.map(file => (_jsxs("div", { onClick: () => onFileSelect?.(file), style: {
                                padding: '12px',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }, onMouseOver: (e) => e.currentTarget.style.backgroundColor = '#f5f5f5', onMouseOut: (e) => e.currentTarget.style.backgroundColor = 'transparent', children: [_jsx("div", { style: { fontSize: '20px' }, children: file.type === 'folder' ? '📁' : '📄' }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: '500' }, children: file.name }), _jsxs("div", { style: { fontSize: '12px', color: '#666' }, children: [file.size, " bytes \u2022 ", file.lastModified.toLocaleDateString()] })] })] }, file.id))) })) })] }) }));
};
export default IntegratedFileBrowser;
