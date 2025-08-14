import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { BaseEditableNode } from './BaseEditableNode';
/**
 * Concat node for Epic 1 - concatenates inputs with optional separator
 */
export const ConcatNode = memo((props) => {
    return (_jsx(BaseEditableNode, { ...props, className: "concat", minWidth: 150, minHeight: 60, children: ({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
            if (isEditing) {
                return (_jsxs("div", { className: "epic1-concat-editor", children: [_jsx("div", { className: "epic1-node-type-label", children: "Concat" }), _jsx("input", { type: "text", className: "epic1-inline-input", value: editBuffer, onChange: (e) => updateBuffer(e.target.value), onKeyDown: (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    confirmEdit();
                                }
                                else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    cancelEdit();
                                }
                                e.stopPropagation();
                            }, onClick: (e) => e.stopPropagation(), placeholder: "Separator (optional)", autoFocus: true }), _jsx("div", { className: "epic1-hint", children: "Leave empty for no separator" })] }));
            }
            return (_jsxs("div", { className: "epic1-concat-display", children: [_jsx("div", { className: "epic1-node-type-label", children: "Concat" }), _jsx("div", { className: "epic1-separator-preview", children: value ? `"${value}"` : _jsx("span", { className: "epic1-placeholder", children: "No separator" }) })] }));
        } }));
});
ConcatNode.displayName = 'ConcatNode';
