import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  Reply, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Flag, 
  Check, 
  X,
  AtSign,
  Send,
  Paperclip,
  Smile
} from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { CommentEditor } from './CommentEditor';
import { CommentMentions } from './CommentMentions';
import { Comment, CommentStatus } from '../../types/CommentTypes';
interface CommentThreadProps {
  resourceId: string;
  resourceType: 'project' | 'resource' | 'node' | 'region';
  workspaceId?: string;
  userId: string;
  targetData?: Record<string, any>;
  className?: string;
  maxHeight?: string;
  showReplies?: boolean;
  allowEditing?: boolean;
  allowModeration?: boolean;
  realTime?: boolean;
}
const CommentThread: React.FC<CommentThreadProps> = ({ )
  resourceId, 
  resourceType,
  workspaceId,
  userId,
  targetData,
  className,
  maxHeight = '400px',
  showReplies = true,
  allowEditing = true,
  allowModeration = false,
  realTime = true
}) => {
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const {
    comments,
    loading,
    error,
    stats,
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
    unresolveComment,
    refreshComments,
    realTimeConnection
  } = useComments({)
    resourceId,
    resourceType,
    workspaceId,
    userId,
    realTime
  });
  const handleCreateComment = useCallback(async (content: string, mentions: string[] = []) => {
    try {
      await createComment({)
        content,
        mentions,
        target_data: targetData,
      });
      setShowNewComment(false);
    } catch (err) {
      console.error('Failed to create comment:', err);
    }
  }, [createComment, targetData]);
  const handleCreateReply = useCallback(async (parentId: string, content: string, mentions: string[] = []) => {
    try {
      await createComment({)
        content,
        mentions,
        parent_id: parentId,
        target_data: targetData,
      });
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to create reply:', err);
    }
  }, [createComment, targetData]);
  const handleUpdateComment = useCallback(async (commentId: string, content: string, mentions: string[] = []) => {
    try {
      await updateComment(commentId, {)
        content,
        mentions
      });
      setEditingComment(null);
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  }, [updateComment]);
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    try {
      await deleteComment(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  }, [deleteComment]);
  const handleResolveComment = useCallback(async (commentId: string) => {
    try {
      await resolveComment(commentId);
    } catch (err) {
      console.error('Failed to resolve comment:', err);
    }
  }, [resolveComment]);
  const handleUnresolveComment = useCallback(async (commentId: string) => {
    try {
      await unresolveComment(commentId);
    } catch (err) {
      console.error('Failed to unresolve comment:', err);
    }
  }, [unresolveComment]);
  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {)
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };
  const renderComment = (comment: Comment, isReply = false) => {
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;
    const canEdit = allowEditing && (comment.author_id === userId || allowModeration);
    const canModerate = allowModeration;
    const isResolved = comment.status === 'resolved';
    return ()
      <div key={comment.id} className={`${isReply ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}`}>}
        <div className={`p-4 rounded-lg ${isResolved ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'} ${isReply ? 'bg-gray-50' : ''}`}>}
          {/* Comment Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {comment.author_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.author_name || 'Unknown User'}
                  </span>
                  {isResolved && ()
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      <Check className="w-3 h-3 mr-1" />
                      Resolved
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  {comment.updated_at !== comment.created_at && ()
                    <span className="ml-2">(edited)</span>
                  )}
                </div>
              </div>
            </div>
            {/* Actions Menu */}
            <div className="flex items-center space-x-1">
              {canModerate && !isResolved && ()
                <button
                  onClick={() => handleResolveComment(comment.id)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Resolve comment"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {canModerate && isResolved && ()
                <button
                  onClick={() => handleUnresolveComment(comment.id)}
                  className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                  title="Unresolve comment"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {canEdit && ()
                <div className="relative group">
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingComment(comment.id)}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                    {!canModerate && ()
                      <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Flag className="w-3 h-3" />
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Comment Content */}
          <div className="mt-3">
            {isEditing ? ()
              <CommentEditor
                initialContent={comment.content_markdown}
                onSave={(content, mentions) => handleUpdateComment(comment.id, content, mentions)}
                onCancel={() => setEditingComment(null)}
                placeholder="Edit your comment..."
                submitLabel="Update"
                workspaceId={workspaceId}
              />
            ) : ()
              <div className="prose prose-sm max-w-none">
                {comment.content_html ? ()
                  <div dangerouslySetInnerHTML={{ __html: comment.content_html }} />
                ) : ()
                  <div className="whitespace-pre-wrap">{comment.content_markdown}</div>
                )}
              </div>
            )}
          </div>
          {/* Comment Actions */}
          {!isEditing && ()
            <div className="flex items-center space-x-4 mt-3 text-sm">
              {showReplies && ()
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              )}
              {comment.replies && comment.replies.length > 0 && ()
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>
                    {expandedReplies.has(comment.id) ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </button>
              )}
            </div>
          )}
          {/* Reply Editor */}
          {isReplying && ()
            <div className="mt-4 pt-4 border-t border-gray-200">
              <CommentEditor
                onSave={(content, mentions) => handleCreateReply(comment.id, content, mentions)}
                onCancel={() => setReplyingTo(null)}
                placeholder="Write a reply..."
                submitLabel="Reply"
                workspaceId={workspaceId}
              />
            </div>
          )}
        </div>
        {/* Replies */}
        {showReplies && comment.replies && expandedReplies.has(comment.id) && ()
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };
  // Group comments by parent
  const rootComments = comments.filter(comment => !comment.parent_id);
  return ()
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>}
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
            {stats && ()
              <span className="text-sm text-gray-500">
                ({stats.total} comments)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Real-time connection indicator */}
            {realTime && ()
              <div className={`w-2 h-2 rounded-full ${
                realTimeConnection?.status === 'connected' ? 'bg-green-400' :
                realTimeConnection?.status === 'connecting' ? 'bg-yellow-400' :
                'bg-red-400'
              }`} title={`Connection: ${realTimeConnection?.status || 'disconnected'}`} />}
            )}
            <button
              onClick={() => setShowNewComment(!showNewComment)}
              className="inline-flex items-center space-x-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Add Comment</span>
            </button>
          </div>
        </div>
        {/* New Comment Editor */}
        {showNewComment && ()
          <div className="mt-4 pt-4 border-t border-gray-200">
            <CommentEditor
              onSave={handleCreateComment}
              onCancel={() => setShowNewComment(false)}
              placeholder="Write a comment..."
              submitLabel="Comment"
              workspaceId={workspaceId}
            />
          </div>
        )}
      </div>
      {/* Comments List */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {loading && ()
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              {[...Array(2)].map((_, i) => ()
                <div key={i} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && ()
          <div className="p-8 text-center text-red-500">
            <p>Error loading comments: {error.message}</p>
            <button
              onClick={refreshComments}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && rootComments.length === 0 && ()
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet</p>
            <p className="text-sm mt-2">Be the first to start the conversation!</p>
          </div>
        )}
        {!loading && !error && rootComments.length > 0 && ()
          <div className="p-4 space-y-4">
            {rootComments.map(comment => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentThread;