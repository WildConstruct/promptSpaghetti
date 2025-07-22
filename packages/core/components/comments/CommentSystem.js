import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.4 - Comment System Component
 * Main interface for threaded commenting system
 */
import { useState } from 'react';
import { CommentThread } from './CommentThread';
import { CommentForm } from './CommentForm';
import { useComments } from '../../hooks/useComments';
export const CommentSystem = ({ workspaceId, targetType, targetId, userId, resourceId, projectId, className = '', compact = false }) => {
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc');
    const { comments, loading, error, createComment, updateComment, deleteComment, loadMore, hasMore, refresh } = useComments({
        workspaceId,
        targetType,
        targetId,
        userId,
        sortOrder
    });
    const handleCreateComment = async (content, parentCommentId) => {
        const commentData = {
            workspace_id: workspaceId,
            project_id: projectId,
            resource_id: resourceId,
            author_id: userId,
            content,
            parent_comment_id: parentCommentId,
            target_type: targetType,
            target_id: targetId,
            metadata: {}
        };
        try {
            await createComment(commentData);
            if (!parentCommentId) {
                setShowCommentForm(false);
            }
        }
        catch (error) {
            console.error('Failed to create comment:', error);
        }
    };
    const handleUpdateComment = async (commentId, content, metadata) => {
        const updates = { content };
        if (metadata) {
            updates.metadata = metadata;
        }
        try {
            await updateComment(commentId, updates);
        }
        catch (error) {
            console.error('Failed to update comment:', error);
        }
    };
    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);
        }
        catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };
    const handleResolveComment = async (commentId, resolved) => {
        const comment = comments.find(c => c.id === commentId);
        if (!comment)
            return;
        const updates = {
            metadata: {
                ...comment.metadata,
                resolved,
                resolved_by: resolved ? userId : undefined,
                resolved_at: resolved ? new Date().toISOString() : undefined
            }
        };
        try {
            await updateComment(commentId, updates);
        }
        catch (error) {
            console.error('Failed to resolve comment:', error);
        }
    };
    const totalComments = comments.reduce((total, comment) => {
        return total + 1 + (comment.reply_count || 0);
    }, 0);
    if (loading && comments.length === 0) {
        return (_jsx("div", { className: `comment-system comment-system--loading ${className}`, children: _jsxs("div", { className: "comment-system__skeleton", children: [_jsx("div", { className: "skeleton-line skeleton-line--title" }), _jsx("div", { className: "skeleton-line skeleton-line--content" }), _jsx("div", { className: "skeleton-line skeleton-line--short" })] }) }));
    }
    return (_jsxs("div", { className: `comment-system ${compact ? 'comment-system--compact' : ''} ${className}`, children: [_jsxs("div", { className: "comment-system__header", children: [_jsxs("div", { className: "comment-system__title", children: [_jsxs("h3", { children: ["Comments ", totalComments > 0 && `(${totalComments})`] }), _jsxs("div", { className: "comment-system__actions", children: [comments.length > 1 && (_jsxs("select", { value: sortOrder, onChange: (e) => setSortOrder(e.target.value), className: "comment-sort-select", children: [_jsx("option", { value: "desc", children: "Newest first" }), _jsx("option", { value: "asc", children: "Oldest first" })] })), _jsx("button", { className: "btn btn--primary btn--small", onClick: () => setShowCommentForm(!showCommentForm), children: showCommentForm ? 'Cancel' : 'Add Comment' })] })] }), error && (_jsxs("div", { className: "comment-system__error", children: [_jsx("span", { className: "error-message", children: error }), _jsx("button", { className: "btn btn--ghost btn--small", onClick: refresh, children: "Retry" })] }))] }), showCommentForm && (_jsx("div", { className: "comment-system__form", children: _jsx(CommentForm, { onSubmit: (content) => handleCreateComment(content), onCancel: () => setShowCommentForm(false), placeholder: "Add a comment...", submitText: "Post Comment", userId: userId }) })), _jsx("div", { className: "comment-system__content", children: comments.length === 0 && !loading ? (_jsx("div", { className: "comment-system__empty", children: _jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-state__icon", children: "\uD83D\uDCAC" }), _jsx("div", { className: "empty-state__title", children: "No comments yet" }), _jsx("div", { className: "empty-state__message", children: "Start a conversation by adding the first comment." }), !showCommentForm && (_jsx("button", { className: "btn btn--primary", onClick: () => setShowCommentForm(true), children: "Add First Comment" }))] }) })) : (_jsxs("div", { className: "comment-system__threads", children: [comments.map((comment, index) => (_jsx(CommentThread, { comment: comment, workspaceId: workspaceId, userId: userId, onReply: (content) => handleCreateComment(content, comment.id), onUpdate: handleUpdateComment, onDelete: handleDeleteComment, onResolve: handleResolveComment, compact: compact, isLast: index === comments.length - 1 }, comment.id))), hasMore && (_jsx("div", { className: "comment-system__load-more", children: _jsx("button", { className: "btn btn--ghost", onClick: loadMore, disabled: loading, children: loading ? 'Loading...' : 'Load More Comments' }) }))] })) })] }));
};
export default CommentSystem;
