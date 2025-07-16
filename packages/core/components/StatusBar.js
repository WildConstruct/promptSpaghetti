import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const StatusBar = ({ statusMessage, errors, onPreview, onSaveJson, onCorrections, correctionsEnabled = false, correctionsOpen = false, }) => {
    const errorCount = errors.length;
    return (_jsx("div", { style: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#fff",
            borderTop: "1px solid #eee",
            padding: 8,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }, children: _jsxs("div", { "aria-live": "polite", children: [statusMessage && _jsx("span", { style: { marginRight: 16 }, children: statusMessage }), _jsx("button", { onClick: onPreview, style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: '#eee',
                        color: '#23272f',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "Preview" }), _jsx("button", { onClick: onSaveJson, style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: '#eee',
                        color: '#23272f',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "Save as JSON" }), correctionsEnabled && onCorrections && (_jsx("button", { onClick: onCorrections, style: {
                        marginRight: 16,
                        padding: '6px 16px',
                        background: correctionsOpen ? '#4a5568' : '#eee',
                        color: correctionsOpen ? '#fff' : '#23272f',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }, children: "Corrections" })), errorCount === 0 ? "No errors" : `${errorCount} error${errorCount > 1 ? "s" : ""}`, errorCount > 0 && (_jsx("span", { style: { marginLeft: 16 }, children: errors.map((err) => (_jsx("span", { style: { color: "#f00", marginRight: 8 }, title: err.message, children: err.message }, err.edgeId))) }))] }) }));
};
