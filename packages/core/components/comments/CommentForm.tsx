/**
 * Epic 9.2.4 - Comment Form Component
 * Form for creating and editing comments
 */
import React, { useState, useRef, useEffect } from 'react';
interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  initialValue?: string;
  placeholder?: string;
  submitText?: string;
  userId: string;
  compact?: boolean;
  autoFocus?: boolean;
  export const CommentForm: React.FC<CommentFormProps> = ({,)
  onSubmit,
  onCancel,
  initialValue = '',
  placeholder = 'Write a comment...',
  submitText = 'Post Comment',
  userId,
  compact = false,
  autoFocus = true
}) => {
  const [content, setContent] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
  }, [autoFocus]);
  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;}
  }, [content]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
  console.error('Failed to submit comment:', error);
} finally {
      setSubmitting(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
  };
  const insertFormatting = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
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
    }, 0);
  };
  const isExpanded = focused || content.length > 0;
  return;
    <div className={`comment-form ${compact ? 'comment-form--compact' : ''} ${isExpanded ? 'comment-form--expanded' : ''}`}>}
      <div className="comment-form__avatar">
        <div className="user-avatar user-avatar--small">
          {userId.charAt(0).toUpperCase()}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="comment-form__form">
        <div className="comment-form__input-container">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="comment-form__textarea"
            rows={compact ? 2 : 3}
            disabled={submitting}
          />
          {isExpanded && ()
            <div className="comment-form__toolbar">
              <div className="comment-form__formatting">
                <button
                  type="button"
                  className="formatting-btn"
                  onClick={() => insertFormatting('**', '**')}
                  title="Bold (Ctrl+B)"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className="formatting-btn"
                  onClick={() => insertFormatting('*', '*')}
                  title="Italic (Ctrl+I)"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className="formatting-btn"
                  onClick={() => insertFormatting('`', '`')}
                  title="Code"
                >
                  {'</>'}
                </button>
              </div>
              <div className="comment-form__help">
                <span className="help-text">
                  <kbd>Cmd/Ctrl</kbd> + <kbd>Enter</kbd> to submit
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="comment-form__actions">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary btn--small"
            disabled={!content.trim() || submitting}
          >
            {submitting ? 'Posting...' : submitText}
          </button>
        </div>
        {!compact && ()
          <div className="comment-form__tips">
            <div className="formatting-tips">
              <span className="tip">
                Use <strong>**bold**</strong>, <em>*italic*</em>, or <code>`code`</code>
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CommentForm;