import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Reply, MoreVertical, Edit3, Trash2, Flag, Check, X } from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { CommentEditor } from './CommentEditor';
{
    const [expandedReplies, setExpandedReplies] = useState(new Set());
    const [editingComment, setEditingComment] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const { comments, loading, error, stats, createComment, updateComment, deleteComment, resolveComment, unresolveComment, refreshComments, realTimeConnection } = useComments({});
    resourceId,
        resourceType,
        workspaceId,
        userId,
        realTime;
}
;
const handleCreateComment = useCallback(async (content, mentions = []) => {
    try {
        await createComment({});
        content,
            mentions,
            target_data;
        targetData,
        ;
    }
    finally { }
});
setShowNewComment(false);
try { }
catch (err) {
    console.error('Failed to create comment:', err);
}
[createComment, targetData];
;
const handleCreateReply = useCallback(async (parentId, content, mentions = []) => {
    try {
        await createComment({});
        content,
            mentions,
            parent_id;
        parentId,
            target_data;
        targetData,
        ;
    }
    finally { }
});
setReplyingTo(null);
try { }
catch (err) {
    console.error('Failed to create reply:', err);
}
[createComment, targetData];
;
const handleUpdateComment = useCallback(async (commentId, content, mentions = []) => {
    try {
        await updateComment(commentId, {});
        content,
            mentions;
    }
    finally { }
});
setEditingComment(null);
try { }
catch (err) {
    console.error('Failed to update comment:', err);
}
[updateComment];
;
const handleDeleteComment = useCallback(async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
        try {
            await deleteComment(commentId);
        }
        catch (err) {
            console.error('Failed to delete comment:', err);
        }
        [deleteComment];
    }
});
const handleResolveComment = useCallback(async (commentId) => {
    try {
        await resolveComment(commentId);
    }
    catch (err) {
        console.error('Failed to resolve comment:', err);
    }
    [resolveComment];
});
const handleUnresolveComment = useCallback(async (commentId) => {
    try {
        await unresolveComment(commentId);
    }
    catch (err) {
        console.error('Failed to unresolve comment:', err);
    }
    [unresolveComment];
});
const toggleReplies = (commentId) => {
    setExpandedReplies(prev => { });
    const next = new Set(prev);
    if (next.has(commentId)) {
        next.delete(commentId);
    }
    else {
        next.add(commentId);
        return next;
    }
    ;
};
const renderComment = (comment, isReply = false) => {
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;
    const canEdit = allowEditing && (comment.author_id === userId || allowModeration);
    const canModerate = allowModeration;
    const isResolved = comment.status === 'resolved';
    return;
    _jsxs("div", { className: `${isReply ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}`, children: ["}", _jsxs("div", { className: `p-4 rounded-lg ${isResolved ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'} ${isReply ? 'bg-gray-50' : ''}`, children: ["}", _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium", children: comment.author_name?.charAt(0).toUpperCase() || 'U' }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: comment.author_name || 'Unknown User' }), isResolved && ()
                                                    < span, " className=\"inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full\">", _jsx(Check, { className: "w-3 h-3 mr-1" }), "Resolved"] }), ")}"] }), _jsxs("div", { className: "text-xs text-gray-500", children: [formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }), comment.updated_at !== comment.created_at && ()
                                            < span, " className=\"ml-2\">(edited)"] }), ")}"] }) })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [canModerate && !isResolved && ()
                        < button, "onClick=", () => handleResolveComment(comment.id), "className=\"p-1 text-gray-400 hover:text-green-600 transition-colors\" title=\"Resolve comment\" >", _jsx(Check, { className: "w-4 h-4" })] }), ")}", canModerate && isResolved && ()
                < button, "onClick=", () => handleUnresolveComment(comment.id), "className=\"p-1 text-gray-400 hover:text-yellow-600 transition-colors\" title=\"Unresolve comment\" >", _jsx(X, { className: "w-4 h-4" })] }, comment.id);
};
{
    canEdit && ()
        < div;
    className = "relative group" >
        (_jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(MoreVertical, { className: "w-4 h-4" }) })
            ,
                _jsxs("div", { className: "absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsxs("button", { onClick: () => setEditingComment(comment.id), className: "flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50", children: [_jsx(Edit3, { className: "w-3 h-3" }), _jsx("span", { children: "Edit" })] }), _jsxs("button", { onClick: () => handleDeleteComment(comment.id), className: "flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50", children: [_jsx(Trash2, { className: "w-3 h-3" }), _jsx("span", { children: "Delete" })] }), !canModerate && ()
                            < button, " className=\"flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50\">", _jsx(Flag, { className: "w-3 h-3" }), _jsx("span", { children: "Report" })] }));
}
div >
;
div >
;
div >
;
div >
    { /* Comment Content */}
    < div;
className = "mt-3" >
    {}
    < CommentEditor;
initialContent = { comment, : .content_markdown };
onSave = {}(content, mentions);
handleUpdateComment(comment.id, content, mentions);
onCancel = {}();
setEditingComment(null);
placeholder = "Edit your comment...";
submitLabel = "Update";
workspaceId = { workspaceId }
    /  >
;
()
    < div;
className = "prose prose-sm max-w-none" >
    { comment, : .content_html ? ()
            < div : , dangerouslySetInnerHTML = {} };
{
    __html: comment.content_html;
}
/>;
()
    < div;
className = "whitespace-pre-wrap" > { comment, : .content_markdown };
div >
;
div >
;
div >
    { /* Comment Actions */};
{
    !isEditing && ()
        < div;
    className = "flex items-center space-x-4 mt-3 text-sm" >
        { showReplies } && ()
        < button;
    onClick = {}();
    setReplyingTo(comment.id);
}
className = "flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
    >
        (_jsx(Reply, { className: "w-3 h-3" })
            ,
                _jsx("span", { children: "Reply" }));
button >
;
{
    comment.replies && comment.replies.length > 0 && ()
        < button;
    onClick = {}();
    toggleReplies(comment.id);
}
className = "flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
    >
        (_jsx(MessageCircle, { className: "w-3 h-3" })
            ,
                _jsxs("span", { children: [expandedReplies.has(comment.id) ? 'Hide' : 'Show', " ", comment.replies.length, " ", comment.replies.length === 1 ? 'reply' : 'replies'] }));
button >
;
div >
;
{ /* Reply Editor */ }
{
    isReplying && ()
        < div;
    className = "mt-4 pt-4 border-t border-gray-200" >
        _jsx(CommentEditor, { onSave: (content, mentions) => handleCreateReply(comment.id, content, mentions), onCancel: () => setReplyingTo(null), placeholder: "Write a reply...", submitLabel: "Reply", workspaceId: workspaceId });
    div >
    ;
}
div >
    { /* Replies */};
{
    showReplies && comment.replies && expandedReplies.has(comment.id) && ()
        < div;
    className = "mt-4 space-y-4" >
        { comment, : .replies.map(reply => renderComment(reply, true)) };
    div >
    ;
}
div >
;
;
;
// Group comments by parent
const rootComments = comments.filter(comment => !comment.parent_id);
return;
_jsxs("div", { className: `bg-white rounded-lg border border-gray-200 ${className}`, children: ["}", _jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(MessageCircle, { className: "w-5 h-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Comments" }), stats && ()
                                    < span, " className=\"text-sm text-gray-500\"> (", stats.total, " comments)"] }), ")}"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [realTime && ()
                            < div, " className=", `w-2 h-2 rounded-full ${realTimeConnection?.status === 'connected' ? 'bg-green-400' : ,
                            realTimeConnection?.status === 'connecting' ? 'bg-yellow-400' : ,
                            'bg-red-400'}`, " title=", `Connection: ${realTimeConnection?.status || 'disconnected'}`, " />} )}", _jsxs("button", { onClick: () => setShowNewComment(!showNewComment), className: "inline-flex items-center space-x-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors", children: [_jsx(MessageCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Add Comment" })] })] })] }), showNewComment && ()
            < div, " className=\"mt-4 pt-4 border-t border-gray-200\">", _jsx(CommentEditor, { onSave: handleCreateComment, onCancel: () => setShowNewComment(false), placeholder: "Write a comment...", submitLabel: "Comment", workspaceId: workspaceId })] });
div >
    { /* Comments List */}
    < div;
className = "overflow-y-auto";
style = {};
{
    maxHeight;
}
 >
    { loading } && ()
    < div;
className = "p-8 text-center" >
    _jsx("div", { className: "animate-pulse space-y-4", children: [...Array(2)].map((_, i) => ()
            < div, key = { i }, className = "p-4" >
            _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "w-8 h-8 bg-gray-200 rounded-full" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-full" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-3/4" })] })] })) });
div >
;
div >
;
{
    error && ()
        < div;
    className = "p-8 text-center text-red-500" >
        (_jsxs("p", { children: ["Error loading comments: ", error.message] })
            ,
                _jsx("button", { onClick: refreshComments, className: "mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors", children: "Try again" }));
    div >
    ;
}
{
    !loading && !error && rootComments.length === 0 && ()
        < div;
    className = "p-8 text-center text-gray-500" >
        (_jsx(MessageCircle, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" })
            ,
                _jsx("p", { children: "No comments yet" })
                    ,
                        _jsx("p", { className: "text-sm mt-2", children: "Be the first to start the conversation!" }));
    div >
    ;
}
{
    !loading && !error && rootComments.length > 0 && ()
        < div;
    className = "p-4 space-y-4" >
        { rootComments, : .map(comment => renderComment(comment)) };
    div >
    ;
}
div >
;
div >
;
;
;
export default CommentThread;
