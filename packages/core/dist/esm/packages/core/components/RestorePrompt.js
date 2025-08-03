import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
draft: {
    nodes: Node;
    edges: Edge;
}
 | null;
onRestore: (nodes, edges) => void onDismiss;
() => void ;
export const RestorePrompt = ({
    show,
    draft,
    onRestore });
onDismiss;
{
    if (!show || !draft) {
        return null;
        return;
        _jsx("div", { style: {
                position: 'absolute',
                zIndex: 10,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(20,20,20,0.92)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }, "data-testid": "restore-draft-modal", children: _jsxs("div", { style: {
                    background: '#23262b',
                    padding: 32,
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #0008'
                }, children: [_jsx("h3", { style: { color: '#fff', marginBottom: 12 }, children: "Restore unsaved graph draft?" }), _jsx("p", { style: { color: '#ccc', marginBottom: 24 }, children: "A saved graph draft was found. Restore it?" }), _jsx("button", { onClick: () => onRestore(draft.nodes, draft.edges), style: { marginRight: 16 }, children: "Restore" }), _jsx("button", { onClick: onDismiss, children: "Dismiss" })] }) });
        ;
    }
    ;
}
