import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.4 - Comment Thread Component
 * Individual comment thread with replies
 */
import { useState } from 'react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useCommentReplies } from '../../hooks/useCommentReplies';
{
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const { replies, loading: repliesLoading, error: repliesError, loadMore: loadMoreReplies, hasMore: hasMoreReplies, refresh: refreshReplies, } = useCommentReplies({});
    commentId: comment.id,
        userId,
        enabled;
    showReplies,
    ;
}
;
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
        try { }
        catch (error) {
            console.error('Failed to reply to comment:', error);
        }
        ;
        const handleShowReplies = () => {
            setShowReplies(!showReplies);
        };
        const canShowReplies = comment.reply_count > 0 || showReplies;
        const isResolved = comment.metadata?.resolved;
        return;
        _jsxs("div", { className: `comment-thread ${compact ? 'comment-thread--compact' : ''} ${isLast ? 'comment-thread--last' : ''} ${isResolved ? 'comment-thread--resolved' : ''}`, children: [_jsx(CommentItem, { comment: comment, userId: userId, onUpdate: onUpdate, onDelete: onDelete, onResolve: onResolve, onReply: () => setShowReplyForm(!showReplyForm), compact: compact, isThreadRoot: true }), showReplyForm && ()
                    < div, " className=\"comment-thread__reply-form\">", _jsx(CommentForm, { onSubmit: handleReply, onCancel: () => setShowReplyForm(false), placeholder: `Reply to ${comment.author_name || comment.author_id}...`, submitText: "Post Reply", userId: userId, compact: true })] });
    }
    finally {
    }
};
{
    canShowReplies && ()
        < div;
    className = "comment-thread__replies" >
        { comment, : .reply_count > 0 && !showReplies && ()
                < button,
            className = "comment-thread__show-replies",
            onClick = { handleShowReplies }
                >
                    _jsx("span", { className: "thread-connector" }),
            Show };
    {
        comment.reply_count;
    }
    {
        comment.reply_count === 1 ? 'reply' : 'replies';
    }
    button >
    ;
}
{
    showReplies && ()
        < div;
    className = "comment-replies" >
        (_jsx("div", { className: "comment-replies__header", children: _jsxs("button", { className: "comment-replies__toggle", onClick: handleShowReplies, children: [_jsx("span", { className: "thread-connector thread-connector--active" }), "Hide replies"] }) })
            ,
                _jsxs("div", { className: "comment-replies__list", children: [repliesLoading && replies.length === 0 ? ()
                            < div : , " className=\"comment-replies__loading\">", _jsxs("div", { className: "skeleton-comment", children: [_jsx("div", { className: "skeleton-line skeleton-line--short" }), _jsx("div", { className: "skeleton-line skeleton-line--content" })] })] }));
    repliesError ? ()
        < div : ;
    className = "comment-replies__error" >
        (_jsx("span", { className: "error-message", children: "Failed to load replies" })
            ,
                _jsx("button", { className: "btn btn--ghost btn--small", onClick: refreshReplies, children: "Retry" }));
    div >
    ;
    ();
    {
        replies.map((reply, index) => ()
            < div, key = { reply, : .id }, className = "comment-reply" >
            _jsx(CommentItem, { comment: reply, userId: userId, onUpdate: onUpdate, onDelete: onDelete, onResolve: onResolve, compact: true, isReply: true, isLast: index === replies.length - 1 && !hasMoreReplies }), div >
        );
    }
    {
        hasMoreReplies && ()
            < div;
        className = "comment-replies__load-more" >
            _jsx("button", { className: "btn btn--ghost btn--small", onClick: loadMoreReplies, disabled: repliesLoading, children: repliesLoading ? 'Loading...' : 'Load more replies' });
        div >
        ;
    }
     >
    ;
}
div >
;
div >
;
div >
;
div >
;
;
;
export default CommentThread;
