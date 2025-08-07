import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useRef, useEffect } from 'react';
import { BaseEditableNode } from './BaseEditableNode';
/**
 * TextBlock node for Epic 1 - displays and edits plain text content
 */
export const TextBlockNode = memo((props) => {
    const textareaRef = useRef(null);
    return (_jsx(BaseEditableNode, { ...props, className: "text-block", minWidth: 200, minHeight: 80, children: ({ isEditing, value, editBuffer, updateBuffer, confirmEdit, cancelEdit }) => {
            // Auto-focus and select text when entering edit mode
            useEffect(() => {
                if (isEditing && textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.select();
                }
            }, [isEditing]);
            if (isEditing) {
                return (_jsx("textarea", { ref: textareaRef, className: "epic1-inline-textarea", value: editBuffer, onChange: (e) => updateBuffer(e.target.value), onKeyDown: (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            confirmEdit();
                        }
                        else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEdit();
                        }
                        e.stopPropagation();
                    }, onClick: (e) => e.stopPropagation(), placeholder: "Enter text..." }));
            }
            return (_jsxs("div", { className: "epic1-text-display", children: [_jsx("div", { className: "epic1-node-type-label", children: "Text Block" }), _jsx("div", { className: "epic1-text-content", children: value || _jsx("span", { className: "epic1-placeholder", children: "Click to edit text" }) })] }));
        } }));
});
TextBlockNode.displayName = 'TextBlockNode';
