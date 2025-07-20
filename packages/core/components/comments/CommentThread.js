import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 9.2.4 - Comment Thread Component
 * Individual comment thread with replies
 */
import { useState } from 'react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useCommentReplies } from '../../hooks/useCommentReplies';
export const CommentThread = ({ comment, workspaceId, userId, onReply, onUpdate, onDelete, onResolve, compact = false, isLast = false, }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const { replies, loading: repliesLoading, error: repliesError, loadMore: loadMoreReplies, hasMore: hasMoreReplies, refresh: refreshReplies, } = useCommentReplies({
        commentId: comment.id,
        userId,
        enabled: showReplies,
    });
    const handleReply = async (content) => {
        try {
            await onReply(content);
            setShowReplyForm(false);
            // Refresh replies to show the new one
            if (showReplies) {
                refreshReplies();
            }
            else {
                setShowReplies(true);
            }
        }
        catch (error) {
            console.error('Failed to reply to comment:', error);
        }
    };
    const handleShowReplies = () => {
        setShowReplies(!showReplies);
    };
    const canShowReplies = comment.reply_count > 0 || showReplies;
    const isResolved = comment.metadata?.resolved;
    return (_jsxs("div", { className: `comment-thread ${compact ? 'comment-thread--compact' : ''} ${isLast ? 'comment-thread--last' : ''} ${isResolved ? 'comment-thread--resolved' : ''}`, children: [_jsx(CommentItem, { comment: comment, userId: userId, onUpdate: onUpdate, onDelete: onDelete, onResolve: onResolve, onReply: () => setShowReplyForm(!showReplyForm), compact: compact, isThreadRoot: true }), showReplyForm && (_jsx("div", { className: "comment-thread__reply-form", children: _jsx(CommentForm, { onSubmit: handleReply, onCancel: () => setShowReplyForm(false), placeholder: `Reply to ${comment.author_name || comment.author_id}...`, submitText: "Post Reply", userId: userId, compact: true }) })), canShowReplies && (_jsxs("div", { className: "comment-thread__replies", children: [comment.reply_count > 0 && !showReplies && (_jsxs("button", { className: "comment-thread__show-replies", onClick: handleShowReplies, children: [_jsx("span", { className: "thread-connector" }), "Show ", comment.reply_count, " ", comment.reply_count === 1 ? 'reply' : 'replies'] })), showReplies && (_jsxs("div", { className: "comment-replies", children: [_jsx("div", { className: "comment-replies__header", children: _jsxs("button", { className: "comment-replies__toggle", onClick: handleShowReplies, children: [_jsx("span", { className: "thread-connector thread-connector--active" }), "Hide replies"] }) }), _jsx("div", { className: "comment-replies__list", children: repliesLoading && replies.length === 0 ? (_jsx("div", { className: "comment-replies__loading", children: _jsxs("div", { className: "skeleton-comment", children: [_jsx("div", { className: "skeleton-line skeleton-line--short" }), _jsx("div", { className: "skeleton-line skeleton-line--content" })] }) })) : repliesError ? (_jsxs("div", { className: "comment-replies__error", children: [_jsx("span", { className: "error-message", children: "Failed to load replies" }), _jsx("button", { className: "btn btn--ghost btn--small", onClick: refreshReplies, children: "Retry" })] })) : (_jsxs(_Fragment, { children: [replies.map((reply, index) => (_jsx("div", { className: "comment-reply", children: _jsx(CommentItem, { comment: reply, userId: userId, onUpdate: onUpdate, onDelete: onDelete, onResolve: onResolve, compact: true, isReply: true, isLast: index === replies.length - 1 && !hasMoreReplies }) }, reply.id))), hasMoreReplies && (_jsx("div", { className: "comment-replies__load-more", children: _jsx("button", { className: "btn btn--ghost btn--small", onClick: loadMoreReplies, disabled: repliesLoading, children: repliesLoading ? 'Loading...' : 'Load more replies' }) }))] })) })] }))] }))] }));
};
export default CommentThread;
