import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  X, 
  Bold, 
  Italic, 
  Link, 
  List, 
  Code, 
  AtSign, 
  Paperclip,
  Smile,
  Eye,
  Edit3
} from 'lucide-react';
import { CommentMentions } from './CommentMentions';

interface CommentEditorProps {
  initialContent?: string;
  onSave: (content: string, mentions: string[]) => void;
  onCancel: () => void;
  placeholder?: string;
  submitLabel?: string;
  workspaceId?: string;
  maxLength?: number;
  showPreview?: boolean;
  allowFormatting?: boolean;
  allowMentions?: boolean;
  allowAttachments?: boolean;
}

export   const [isPreview, setIsPreview] = useState(false);
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionPositionRef = useRef({ start: 0, end: 0 });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Handle mention detection
  useEffect(() => {
    if (!allowMentions) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleTextChange = () => {
      const value = textarea.value;
      const cursorPos = textarea.selectionStart;
      
      // Find @ symbol before cursor
      const textBeforeCursor = value.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        
        // Check if there's a space after @, if so, don't show mentions
        if (textAfterAt.includes(' ')) {
          setShowMentions(false);
          return;
        }
        
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        mentionPositionRef.current = {
          start: lastAtIndex,
          end: cursorPos
        };
      } else {
        setShowMentions(false);
      }
    };

    textarea.addEventListener('input', handleTextChange);
    textarea.addEventListener('selectionchange', handleTextChange);

    return () => {
      textarea.removeEventListener('input', handleTextChange);
      textarea.removeEventListener('selectionchange', handleTextChange);
    };
  }, [allowMentions]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setContent(newContent);
      setCursorPosition(e.target.selectionStart);
    }
  };

  const handleMentionSelect = (userId: string, userName: string) => {
    const { start, end } = mentionPositionRef.current;
    const beforeMention = content.substring(0, start);
    const afterMention = content.substring(end);
    const newContent = `${beforeMention}@${userName} ${afterMention}`;
    
    setContent(newContent);
    setMentions(prev => [...prev.filter(id => id !== userId), userId]);
    setShowMentions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + userName.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertFormatting = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position after formatting
    setTimeout(() => {
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave(content.trim(), mentions);
    } catch (err) {
      console.error('Failed to save comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const renderPreview = () => {
    // Simple markdown-like rendering for preview
    const previewContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');

    return (
      <div 
        className="min-h-[100px] p-3 border border-gray-300 rounded-md prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: previewContent || '<em>Nothing to preview</em>' }}
      />
    );
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      {allowFormatting && (
        <div className="flex items-center justify-between p-2 border border-gray-300 border-b-0 rounded-t-md bg-gray-50">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => insertFormatting('`', '`')}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => insertFormatting('[link text](', ')')}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="Link"
            >
              <Link className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => insertFormatting('- ', '')}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="List"
            >
              <List className="w-4 h-4" />
            </button>

            {allowMentions && (
              <button
                type="button"
                onClick={() => {
                  const cursorPos = textareaRef.current?.selectionStart || 0;
                  const newContent = content.substring(0, cursorPos) + '@' + content.substring(cursorPos);
                  setContent(newContent);
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                      textareaRef.current.setSelectionRange(cursorPos + 1, cursorPos + 1);
                    }
                  }, 0);
                }}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="Mention"
              >
                <AtSign className="w-4 h-4" />
              </button>
            )}

            {allowAttachments && (
              <button
                type="button"
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            )}
          </div>

          {showPreview && (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className={`p-1 rounded transition-colors ${
                  isPreview 
                    ? 'text-blue-600 bg-blue-100' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
                title={isPreview ? 'Edit' : 'Preview'}
              >
                {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Editor/Preview */}
      <div className="relative">
        {isPreview ? (
          renderPreview()
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full min-h-[100px] p-3 border border-gray-300 ${
              allowFormatting ? 'rounded-b-md rounded-t-none' : 'rounded-md'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
            style={{ maxHeight: '300px' }}
          />
        )}

        {/* Character Counter */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/{maxLength}
        </div>
      </div>

      {/* Mentions Dropdown */}
      {showMentions && allowMentions && workspaceId && (
        <div className="absolute z-10 w-full mt-1">
          <CommentMentions
            workspaceId={workspaceId}
            query={mentionQuery}
            onSelect={handleMentionSelect}
            onClose={() => setShowMentions(false)}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-gray-500">
          <span className="font-medium">Tip:</span> Use **bold**, *italic*, `code`, or @mentions
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="inline-flex items-center space-x-2 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Posting...' : submitLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};