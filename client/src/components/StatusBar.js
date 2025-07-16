import { jsx as _jsx } from "react/jsx-runtime";
export default function StatusBar({ errorCount }) {
    return (_jsx("div", { style: {
            height: 32,
            background: '#2a2a2a',
            borderTop: '1px solid #444',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 12,
            fontFamily: 'sans-serif',
            fontSize: 13,
            color: errorCount > 0 ? '#ff6b6b' : '#4CAF50',
            fontWeight: 500,
        }, children: errorCount > 0 ? `⚠️ Validation Errors: ${errorCount}` : '✅ No errors' }));
}
