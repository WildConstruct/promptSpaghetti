/**
 * Epic 9.2.4 - Comment System Component
 * Main interface for threaded commenting system
 */
import React, { useState } from 'react';
import { CreateComment, UpdateComment } from '../../types/workspace';
import { CommentThread } from './CommentThread';
import { CommentForm } from './CommentForm';
import { useComments } from '../../hooks/useComments';
interface CommentSystemProps {
  workspaceId: string;,
  targetType: string;
  targetId: string;,
  userId: string;
  resourceId?: string;
  projectId?: string;
  className?: string;
  compact?: boolean;
  export const CommentSystem: React.FC<CommentSystemProps> = ({,)
  workspaceId,
  targetType,
  targetId,
  userId,
  resourceId,
  projectId,
  className = '',
  compact = false
}) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    loadMore,
    hasMore,
    refresh
  } = useComments({)
  workspaceId,
    targetType,
    targetId,
    userId,
    sortOrder
  });
  const handleCreateComment = async (content: string, parentCommentId?: string) => {
    const commentData: CreateComment = {,
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
    } catch (error) {
  console.error('Failed to create comment:', error);
};
  const handleUpdateComment = async (commentId: string, content: string, metadata?: Record<string, unknown>) => {
    const updates: UpdateComment = { content };
    if (metadata) {
      updates.metadata = metadata;
    try {
      await updateComment(commentId, updates);
    } catch (error) {
  console.error('Failed to update comment:', error);
};
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
  console.error('Failed to delete comment:', error);
};
  const handleResolveComment = async (commentId: string, resolved: boolean) => {
  const comment = comments.find(c => c.id === commentId);
  if (!comment) return;
  const updates: UpdateComment = {,
  metadata: {,
  ...comment.metadata,
  resolved,
  resolved_by: resolved ? userId : undefined,
  resolved_at: resolved ? new Date().toISOString() : undefined,
};
    try {
      await updateComment(commentId, updates);
    } catch (error) {
  console.error('Failed to resolve comment:', error);
};
  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.reply_count || 0);
  }, 0);
  if (loading && comments.length === 0) {
    return;
      <div className={`comment-system comment-system--loading ${className}`}>}
        <div className="comment-system__skeleton">
          <div className="skeleton-line skeleton-line--title"></div>
          <div className="skeleton-line skeleton-line--content"></div>
          <div className="skeleton-line skeleton-line--short"></div>
        </div>
      </div>
    );
  return;
    <div className={`comment-system ${compact ? 'comment-system--compact' : ''} ${className}`}>}
      <div className="comment-system__header">
        <div className="comment-system__title">
          <h3>
            Comments {totalComments > 0 && `(${totalComments})`}
          </h3>
          <div className="comment-system__actions">
            {comments.length > 1 && ()
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="comment-sort-select"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            )}
            <button
              className="btn btn--primary btn--small"
              onClick={() => setShowCommentForm(!showCommentForm)}
            >
              {showCommentForm ? 'Cancel' : 'Add Comment'}
            </button>
          </div>
        </div>
        {error && ()
          <div className="comment-system__error">
            <span className="error-message">{error}</span>
            <button
              className="btn btn--ghost btn--small"
              onClick={refresh}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      {showCommentForm && ()
        <div className="comment-system__form">
          <CommentForm
            onSubmit={(content) => handleCreateComment(content)}
            onCancel={() => setShowCommentForm(false)}
            placeholder="Add a comment..."
            submitText="Post Comment"
            userId={userId}
          />
        </div>
      )}
      <div className="comment-system__content">
        {comments.length === 0 && !loading ? ()
          <div className="comment-system__empty">
            <div className="empty-state">
              <div className="empty-state__icon">💬</div>
              <div className="empty-state__title">No comments yet</div>
              <div className="empty-state__message">
                Start a conversation by adding the first comment.
              </div>
              {!showCommentForm && ()
                <button
                  className="btn btn--primary"
                  onClick={() => setShowCommentForm(true)}
                >
                  Add First Comment
                </button>
              )}
            </div>
          </div>
        ) : ()
          <div className="comment-system__threads">
            {comments.map((comment, index) => ()
              <CommentThread
                key={comment.id}
                comment={comment}
                workspaceId={workspaceId}
                userId={userId}
                onReply={(content) => handleCreateComment(content, comment.id)}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                onResolve={handleResolveComment}
                compact={compact}
                isLast={index === comments.length - 1}
              />
            ))}
            {hasMore && ()
              <div className="comment-system__load-more">
                <button
                  className="btn btn--ghost"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Comments'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSystem;