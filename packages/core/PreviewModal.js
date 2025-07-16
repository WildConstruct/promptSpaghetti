import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const PreviewModal = ({ open, loading, error, results, onClose, onCancel, onResultHover }) => {
    if (!open)
        return null;
    return (_jsx("div", { role: "dialog", "aria-modal": "true", style: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }, children: _jsxs("div", { style: { background: "#fff", borderRadius: 8, padding: 24, minWidth: 400, maxWidth: 600 }, children: [_jsx("h2", { children: "Preview 5 Results" }), loading && _jsx("div", { style: { marginBottom: 12 }, children: "Loading..." }), error && _jsxs("div", { style: { color: "#c00" }, children: ["Error: ", error] }), !loading && !error && (_jsx("ul", { style: { padding: 0, listStyle: "none" }, children: results.map((res, i) => (_jsxs("li", { onMouseEnter: () => onResultHover?.(i), style: { marginBottom: 16, padding: 8, border: "1px solid #eee", borderRadius: 4, position: "relative", cursor: 'pointer' }, children: [_jsx("span", { style: {
                                    position: "absolute",
                                    top: -10,
                                    left: -10,
                                    background: res.error ? "#c00" : "#4d7cff",
                                    color: "#fff",
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 12,
                                    fontWeight: 600
                                }, children: res.seed }), res.error ? (_jsx("div", { style: { color: "#c00" }, children: res.error })) : (_jsx("div", { style: { fontFamily: "monospace", whiteSpace: "pre-wrap" }, children: res.output }))] }, i))) })), _jsx("button", { onClick: onClose, style: { marginTop: 16 }, children: "Close" })] }) }));
};
