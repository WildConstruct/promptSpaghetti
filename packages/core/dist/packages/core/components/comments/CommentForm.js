import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.4 - Comment Form Component
 * Form for creating and editing comments
 */
import { useState, useRef, useEffect } from 'react';
{
    const [content, setContent] = useState(initialValue);
    const [submitting, setSubmitting] = useState(false);
    const [focused, setFocused] = useState(false);
    const textareaRef = useRef(null);
    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
        [autoFocus];
    });
    useEffect(() => {
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || submitting)
            return;
        setSubmitting(true);
        try {
            await onSubmit(content.trim());
            setContent('');
        }
        catch (error) {
            console.error('Failed to submit comment:', error);
        }
        finally {
            setSubmitting(false);
        }
        ;
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit(e);
                if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancel();
                }
                ;
                const insertFormatting = (before, after = '') => {
                    if (!textareaRef.current)
                        return;
                    const textarea = textareaRef.current;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const selectedText = content.substring(start, end);
                    const newContent = ;
                    content.substring(0, start) +
                        before + selectedText + after +
                        content.substring(end);
                    setContent(newContent);
                    // Restore cursor position
                    setTimeout(() => {
                        if (textarea) {
                            const newCursorPos = start + before.length + selectedText.length;
                            textarea.setSelectionRange(newCursorPos, newCursorPos);
                            textarea.focus();
                        }
                        0;
                    });
                };
                const isExpanded = focused || content.length > 0;
                return;
                _jsxs("div", { className: `comment-form ${compact ? 'comment-form--compact' : ''} ${isExpanded ? 'comment-form--expanded' : ''}`, children: ["}", _jsx("div", { className: "comment-form__avatar", children: _jsx("div", { className: "user-avatar user-avatar--small", children: userId.charAt(0).toUpperCase() }) }), _jsxs("form", { onSubmit: handleSubmit, className: "comment-form__form", children: [_jsxs("div", { className: "comment-form__input-container", children: [_jsx("textarea", { ref: textareaRef, value: content, onChange: (e) => setContent(e.target.value), onFocus: () => setFocused(true), onBlur: () => setFocused(false), onKeyDown: handleKeyDown, placeholder: placeholder, className: "comment-form__textarea", rows: compact ? 2 : 3, disabled: submitting }), isExpanded && ()
                                            < div, " className=\"comment-form__toolbar\">", _jsxs("div", { className: "comment-form__formatting", children: [_jsx("button", { type: "button", className: "formatting-btn", onClick: () => insertFormatting('**', '**'), title: "Bold (Ctrl+B)", children: _jsx("strong", { children: "B" }) }), _jsx("button", { type: "button", className: "formatting-btn", onClick: () => insertFormatting('*', '*'), title: "Italic (Ctrl+I)", children: _jsx("em", { children: "I" }) }), _jsx("button", { type: "button", className: "formatting-btn", onClick: () => insertFormatting('`', '`'), title: "Code", children: '</>' })] }), _jsx("div", { className: "comment-form__help", children: _jsxs("span", { className: "help-text", children: [_jsx("kbd", { children: "Cmd/Ctrl" }), " + ", _jsx("kbd", { children: "Enter" }), " to submit"] }) })] }), ")}"] })] })
                    ,
                        _jsxs("div", { className: "comment-form__actions", children: [_jsx("button", { type: "button", className: "btn btn--ghost btn--small", onClick: onCancel, disabled: submitting, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn btn--primary btn--small", disabled: !content.trim() || submitting, children: submitting ? 'Posting...' : submitText })] });
                {
                    !compact && ()
                        < div;
                    className = "comment-form__tips" >
                        _jsx("div", { className: "formatting-tips", children: _jsxs("span", { className: "tip", children: ["Use ", _jsx("strong", { children: "**bold**" }), ", ", _jsx("em", { children: "*italic*" }), ", or ", _jsx("code", { children: "`code`" })] }) });
                }
            }
        };
    };
    div >
    ;
}
form >
;
div >
;
;
;
export default CommentForm;
