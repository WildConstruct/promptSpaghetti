import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 9.2.4 - Comment Item Component
 * Individual comment display and interaction
 */
import { useState } from 'react';
import { CommentForm } from './CommentForm';
export const CommentItem = ({ comment, userId, onUpdate, onDelete, onResolve, onReply, compact = false, isReply = false, isThreadRoot = false, isLast = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const isAuthor = comment.author_id === userId;
    const isResolved = comment.metadata?.resolved;
    const resolvedBy = comment.metadata?.resolved_by;
    const resolvedAt = comment.metadata?.resolved_at;
    const handleEdit = async (content) => {
        try {
            await onUpdate(comment.id, content);
            setIsEditing(false);
        }
        catch (error) {
            console.error('Failed to update comment:', error);
        }
    };
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            setDeleting(true);
            try {
                await onDelete(comment.id);
            }
            catch (error) {
                console.error('Failed to delete comment:', error);
                setDeleting(false);
            }
        }
    };
    const handleResolve = async () => {
        if (onResolve) {
            try {
                await onResolve(comment.id, !isResolved);
            }
            catch (error) {
                console.error('Failed to resolve comment:', error);
            }
        }
    };
    const formatTime = (date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };
    const formatContent = (content) => {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br />');
    };
    if (deleting) {
        return (_jsx("div", { className: "comment-item comment-item--deleting", children: _jsx("div", { className: "comment-item__content", children: _jsx("div", { className: "deletion-notice", children: "Comment is being deleted..." }) }) }));
    }
    return (_jsxs("div", { className: `comment-item ${compact ? 'comment-item--compact' : ''} ${isReply ? 'comment-item--reply' : ''} ${isThreadRoot ? 'comment-item--thread-root' : ''} ${isLast ? 'comment-item--last' : ''} ${isResolved ? 'comment-item--resolved' : ''}`, onMouseEnter: () => setShowActions(true), onMouseLeave: () => setShowActions(false), children: [_jsx("div", { className: "comment-item__avatar", children: _jsx("div", { className: "user-avatar user-avatar--small", children: (comment.author_name || comment.author_id).charAt(0).toUpperCase() }) }), _jsxs("div", { className: "comment-item__content", children: [_jsxs("div", { className: "comment-item__header", children: [_jsxs("div", { className: "comment-item__author", children: [_jsx("span", { className: "author-name", children: comment.author_name || comment.author_id }), _jsx("span", { className: "comment-item__time", children: formatTime(new Date(comment.created_at)) }), comment.updated_at > comment.created_at && (_jsx("span", { className: "comment-item__edited", children: "(edited)" }))] }), _jsxs("div", { className: `comment-item__actions ${showActions || isResolved ? 'comment-item__actions--visible' : ''}`, children: [isResolved && (_jsx("span", { className: "comment-item__resolved-badge", children: "\u2713 Resolved" })), !isEditing && (_jsxs(_Fragment, { children: [onReply && !isReply && (_jsx("button", { className: "comment-action", onClick: onReply, title: "Reply", children: "Reply" })), isAuthor && (_jsx("button", { className: "comment-action", onClick: () => setIsEditing(true), title: "Edit", children: "Edit" })), onResolve && isThreadRoot && (_jsx("button", { className: "comment-action", onClick: handleResolve, title: isResolved ? 'Mark as unresolved' : 'Mark as resolved', children: isResolved ? 'Unresolve' : 'Resolve' })), isAuthor && (_jsx("button", { className: "comment-action comment-action--danger", onClick: handleDelete, title: "Delete", children: "Delete" }))] }))] })] }), _jsx("div", { className: "comment-item__body", children: isEditing ? (_jsx(CommentForm, { onSubmit: handleEdit, onCancel: () => setIsEditing(false), initialValue: comment.content, submitText: "Save Changes", userId: userId, compact: true })) : (_jsx("div", { className: "comment-item__text", dangerouslySetInnerHTML: { __html: formatContent(comment.content) } })) }), isResolved && resolvedBy && resolvedAt && (_jsx("div", { className: "comment-item__resolution", children: _jsxs("span", { className: "resolution-info", children: ["Resolved by ", resolvedBy, " ", formatTime(new Date(resolvedAt))] }) }))] })] }));
};
export default CommentItem;
