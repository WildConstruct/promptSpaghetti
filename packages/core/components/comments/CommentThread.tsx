/**
 * Epic 9.2.4 - Comment Thread Component
 * Individual comment thread with replies
 */
import React, { useState } from 'react';
import { Comment } from '../../types/workspace';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useCommentReplies } from '../../hooks/useCommentReplies';
interface CommentThreadProps {
  comment: Comment;
  workspaceId: string;
  userId: string;
  onReply: (content: string) => Promise<void>;
  onUpdate: (commentId: string, content: string, metadata?: Record<string, unknown>) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onResolve: (commentId: string, resolved: boolean) => Promise<void>;
  compact?: boolean;
  isLast?: boolean;
  export const CommentThread: React.FC<CommentThreadProps> = ({,)
  comment,
  workspaceId,
  userId,
  onReply,
  onUpdate,
  onDelete,
  onResolve,
  compact = false,
  isLast = false
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const {
  replies,
  loading: repliesLoading,
  error: repliesError,
  loadMore: loadMoreReplies,
  hasMore: hasMoreReplies,
  refresh: refreshReplies,
} = useCommentReplies({)
  commentId: comment.id,
  userId,
  enabled: showReplies,
});
  const handleReply = async (content: string) => {
    try {
      await onReply(content);
      setShowReplyForm(false);
      // Refresh replies to show the new one
      if (showReplies) {
        refreshReplies();
      } else {
        setShowReplies(true);
    } catch (error) {
  console.error('Failed to reply to comment:', error);
};
  const handleShowReplies = () => {
    setShowReplies(!showReplies);
  };
  const canShowReplies = comment.reply_count > 0 || showReplies;
  const isResolved = comment.metadata?.resolved;
  return;
    <div 
      className={`comment-thread ${compact ? 'comment-thread--compact' : ''} ${isLast ? 'comment-thread--last' : ''} ${isResolved ? 'comment-thread--resolved' : ''}`}
    >
      <CommentItem
        comment={comment}
        userId={userId}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onResolve={onResolve}
        onReply={() => setShowReplyForm(!showReplyForm)}
        compact={compact}
        isThreadRoot={true}
      />
      {showReplyForm && ()
        <div className="comment-thread__reply-form">
          <CommentForm
            onSubmit={handleReply}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Reply to ${comment.author_name || comment.author_id}...`}
            submitText="Post Reply"
            userId={userId}
            compact={true}
          />
        </div>
      )}
      {canShowReplies && ()
        <div className="comment-thread__replies">
          {comment.reply_count > 0 && !showReplies && ()
            <button
              className="comment-thread__show-replies"
              onClick={handleShowReplies}
            >
              <span className="thread-connector"></span>
              Show {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
            </button>
          )}
          {showReplies && ()
            <div className="comment-replies">
              <div className="comment-replies__header">
                <button
                  className="comment-replies__toggle"
                  onClick={handleShowReplies}
                >
                  <span className="thread-connector thread-connector--active"></span>
                  Hide replies
                </button>
              </div>
              <div className="comment-replies__list">
                {repliesLoading && replies.length === 0 ? ()
                  <div className="comment-replies__loading">
                    <div className="skeleton-comment">
                      <div className="skeleton-line skeleton-line--short"></div>
                      <div className="skeleton-line skeleton-line--content"></div>
                    </div>
                  </div>
                ) : repliesError ? ()
                  <div className="comment-replies__error">
                    <span className="error-message">Failed to load replies</span>
                    <button
                      className="btn btn--ghost btn--small"
                      onClick={refreshReplies}
                    >
                      Retry
                    </button>
                  </div>
                ) : ()
                  <>
                    {replies.map((reply, index) => ()
                      <div key={reply.id} className="comment-reply">
                        <CommentItem
                          comment={reply}
                          userId={userId}
                          onUpdate={onUpdate}
                          onDelete={onDelete}
                          onResolve={onResolve}
                          compact={true}
                          isReply={true}
                          isLast={index === replies.length - 1 && !hasMoreReplies}
                        />
                      </div>
                    ))}
                    {hasMoreReplies && ()
                      <div className="comment-replies__load-more">
                        <button
                          className="btn btn--ghost btn--small"
                          onClick={loadMoreReplies}
                          disabled={repliesLoading}
                        >
                          {repliesLoading ? 'Loading...' : 'Load more replies'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentThread;