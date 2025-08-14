import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { BaseEditableNode } from './BaseEditableNode';
/**
 * Variable node for Epic 1 - gets or sets variables
 */
export const VariableNode = memo((props) => {
    const isGetter = props.data.isGetter ?? false;
    return (_jsx(BaseEditableNode, { ...props, className: "variable", minWidth: 180, minHeight: 70, children: ({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
            if (isEditing) {
                return (_jsxs("div", { className: "epic1-variable-editor", children: [_jsx("div", { className: "epic1-node-type-label", children: isGetter ? 'Get Variable' : 'Set Variable' }), _jsx("input", { type: "text", className: "epic1-inline-input", value: editBuffer, onChange: (e) => updateBuffer(e.target.value), onKeyDown: (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    confirmEdit();
                                }
                                else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    cancelEdit();
                                }
                                e.stopPropagation();
                            }, onClick: (e) => e.stopPropagation(), placeholder: "Variable name...", autoFocus: true })] }));
            }
            return (_jsxs("div", { className: "epic1-variable-display", children: [_jsx("div", { className: "epic1-node-type-label", children: isGetter ? 'Get Variable' : 'Set Variable' }), _jsxs("div", { className: "epic1-variable-name", children: [_jsxs("span", { className: "epic1-variable-prefix", children: ["$", isGetter ? '' : '='] }), value || _jsx("span", { className: "epic1-placeholder", children: "unnamed" })] })] }));
        } }));
});
VariableNode.displayName = 'VariableNode';
