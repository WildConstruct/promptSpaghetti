/**
 * Epic 9.2.4 - Comment Item Component
 * Individual comment display and interaction
 */
import React, { useState } from 'react';
import { Comment } from '../../types/workspace';
import { CommentForm } from './CommentForm';
interface CommentItemProps {
  comment: Comment;
  userId: string;
  onUpdate: (commentId: string, content: string, metadata?: Record<string, unknown>) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onResolve?: (commentId: string, resolved: boolean) => Promise<void>;
  onReply?: () => void;
  compact?: boolean;
  isReply?: boolean;
  isThreadRoot?: boolean;
  isLast?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({)
  comment,
  userId,
  onUpdate,
  onDelete,
  onResolve,
  onReply,
  compact = false,
  isReply = false,
  isThreadRoot = false,
  isLast = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isAuthor = comment.author_id === userId;
  const isResolved = comment.metadata?.resolved;
  const resolvedBy = comment.metadata?.resolved_by;
  const resolvedAt = comment.metadata?.resolved_at;
  const handleEdit = async (content: string) => {
    try {
      await onUpdate(comment.id, content);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setDeleting(true);
      try {
        await onDelete(comment.id);
      } catch (error) {
        console.error('Failed to delete comment:', error);
        setDeleting(false);
      }
    }
  };
  const handleResolve = async () => {
    if (onResolve) {
      try {
        await onResolve(comment.id, !isResolved);
      } catch (error) {
        console.error('Failed to resolve comment:', error);
      }
    }
  };
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;}
    if (diffHours < 24) return `${diffHours}h ago`;}
    if (diffDays < 7) return `${diffDays}d ago`;}
    return date.toLocaleDateString();
  };
  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
  };
  if (deleting) {
    return ()
      <div className="comment-item comment-item--deleting">
        <div className="comment-item__content">
          <div className="deletion-notice">
            Comment is being deleted...
          </div>
        </div>
      </div>
    );
  }
  return ()
    <div 
      className={`comment-item ${compact ? 'comment-item--compact' : ''} ${isReply ? 'comment-item--reply' : ''} ${isThreadRoot ? 'comment-item--thread-root' : ''} ${isLast ? 'comment-item--last' : ''} ${isResolved ? 'comment-item--resolved' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="comment-item__avatar">
        <div className="user-avatar user-avatar--small">
          {(comment.author_name || comment.author_id).charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="comment-item__content">
        <div className="comment-item__header">
          <div className="comment-item__author">
            <span className="author-name">
              {comment.author_name || comment.author_id}
            </span>
            <span className="comment-item__time">
              {formatTime(new Date(comment.created_at))}
            </span>
            {comment.updated_at > comment.created_at && ()
              <span className="comment-item__edited">
                (edited)
              </span>
            )}
          </div>
          <div className={`comment-item__actions ${showActions || isResolved ? 'comment-item__actions--visible' : ''}`}>}
            {isResolved && ()
              <span className="comment-item__resolved-badge">
                ✓ Resolved
              </span>
            )}
            {!isEditing && ()
              <>
                {onReply && !isReply && ()
                  <button
                    className="comment-action"
                    onClick={onReply}
                    title="Reply"
                  >
                    Reply
                  </button>
                )}
                {isAuthor && ()
                  <button
                    className="comment-action"
                    onClick={() => setIsEditing(true)}
                    title="Edit"
                  >
                    Edit
                  </button>
                )}
                {onResolve && isThreadRoot && ()
                  <button
                    className="comment-action"
                    onClick={handleResolve}
                    title={isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
                  >
                    {isResolved ? 'Unresolve' : 'Resolve'}
                  </button>
                )}
                {isAuthor && ()
                  <button
                    className="comment-action comment-action--danger"
                    onClick={handleDelete}
                    title="Delete"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="comment-item__body">
          {isEditing ? ()
            <CommentForm
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              initialValue={comment.content}
              submitText="Save Changes"
              userId={userId}
              compact={true}
            />
          ) : ()
            <div 
              className="comment-item__text"
              dangerouslySetInnerHTML={{ __html: formatContent(comment.content) }}
            />
          )}
        </div>
        {isResolved && resolvedBy && resolvedAt && ()
          <div className="comment-item__resolution">
            <span className="resolution-info">
              Resolved by {resolvedBy} {formatTime(new Date(resolvedAt))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;