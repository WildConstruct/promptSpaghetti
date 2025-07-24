import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Comment Submission Form
 * Task: E16-1753114247004-424BDA - Create comment submission flow
 *
 * User-friendly comment submission interface with rich text editing,
 * attachment support, real-time validation, and integration with
 * existing comment infrastructure.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
const DEFAULT_CONFIG = {
    enableRichText: true,
    enableMarkdown: true,
    enableAttachments: true,
    enableMentions: true,
    enableHashtags: true,
    enableCodeBlocks: true,
    enableLinkPreviews: true,
    maxContentLength: 10000,
    maxAttachments: 5,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    enableDrafts: true,
    autoSaveDrafts: true,
    enableSpellCheck: true,
    enablePreview: true,
    moderationSettings: {
        requireApproval: false,
        enableAutoModeration: true,
        flagSuspiciousContent: true
    }
};
export const CommentSubmissionForm = ({ resourceId, resourceType, parentCommentId, authorId, config: userConfig, onSubmit, onCancel, onDraftSave, onValidationError, placeholder = 'Write your comment...', className = '', autoFocus = false, disabled = false }) => {
    const config = { ...DEFAULT_CONFIG, ...userConfig };
    // State management
    const [content, setContent] = useState('');
    const [contentType, setContentType] = useState('text');
    const [attachments, setAttachments] = useState([]);
    const [mentions, setMentions] = useState([]);
    const [hashtags, setHashtags] = useState([]);
    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [characterCount, setCharacterCount] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    // Refs
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    // Auto-focus on mount
    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [autoFocus]);
    // Auto-save drafts
    useEffect(() => {
        if (config.autoSaveDrafts && content.length > 10) {
            const timer = setTimeout(() => {
                saveDraft();
            }, 2000); // Save after 2 seconds of inactivity
            return () => clearTimeout(timer);
        }
    }, [content, attachments, mentions, hashtags, config.autoSaveDrafts]);
    // Character count tracking
    useEffect(() => {
        setCharacterCount(content.length);
    }, [content]);
    // Content change handler
    const handleContentChange = useCallback((newContent) => {
        setContent(newContent);
        // Auto-detect mentions and hashtags
        if (config.enableMentions) {
            const detectedMentions = extractMentions(newContent);
            setMentions(detectedMentions);
        }
        if (config.enableHashtags) {
            const detectedHashtags = extractHashtags(newContent);
            setHashtags(detectedHashtags);
        }
        // Clear validation errors when content changes
        setValidationErrors([]);
    }, [config.enableMentions, config.enableHashtags]);
    // Validation
    const validateSubmission = useCallback(() => {
        const errors = [];
        // Content validation
        if (!content.trim()) {
            errors.push({ field: 'content', message: 'Comment content is required' });
        }
        if (content.length > config.maxContentLength) {
            errors.push({
                field: 'content',
                message: `Comment exceeds maximum length of ${config.maxContentLength} characters`
            });
        }
        // Attachment validation
        if (attachments.length > config.maxAttachments) {
            errors.push({
                field: 'attachments',
                message: `Maximum ${config.maxAttachments} attachments allowed`
            });
        }
        // File size validation
        for (const attachment of attachments) {
            if (attachment.size && attachment.size > config.maxFileSize) {
                errors.push({
                    field: 'attachments',
                    message: `File "${attachment.name}" exceeds maximum size of ${formatFileSize(config.maxFileSize)}`
                });
            }
        }
        // Content moderation checks
        if (config.moderationSettings.flagSuspiciousContent) {
            const suspiciousPatterns = detectSuspiciousContent(content);
            if (suspiciousPatterns.length > 0) {
                errors.push({
                    field: 'content',
                    message: 'Content may require moderation review'
                });
            }
        }
        return errors;
    }, [content, attachments, config]);
    // Submit handler
    const handleSubmit = async () => {
        if (disabled || isSubmitting)
            return;
        const errors = validateSubmission();
        if (errors.length > 0) {
            setValidationErrors(errors);
            if (onValidationError) {
                onValidationError(errors.map(e => e.message));
            }
            return;
        }
        setIsSubmitting(true);
        try {
            const submissionData = {
                content: content.trim(),
                contentType,
                resourceId,
                resourceType,
                parentCommentId,
                authorId,
                mentions,
                hashtags,
                attachments,
                metadata: {
                    submittedAt: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    contentLength: content.length,
                    hasAttachments: attachments.length > 0,
                    hasMentions: mentions.length > 0,
                    hasHashtags: hashtags.length > 0
                }
            };
            if (onSubmit) {
                await onSubmit(submissionData);
            }
            // Clear form after successful submission
            resetForm();
            clearDraft();
            console.log('✅ Comment submitted successfully');
        }
        catch (error) {
            console.error('❌ Comment submission failed:', error);
            setValidationErrors([{
                    field: 'submission',
                    message: `Failed to submit comment: ${error.message}`
                }]);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // Cancel handler
    const handleCancel = () => {
        if (content.trim() && config.enableDrafts) {
            saveDraft();
        }
        resetForm();
        if (onCancel) {
            onCancel();
        }
    };
    // File upload handler
    const handleFileUpload = async (files) => {
        if (!config.enableAttachments)
            return;
        const newAttachments = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Validate file type
            if (!config.allowedFileTypes.includes(file.type)) {
                setValidationErrors(prev => [...prev, {
                        field: 'attachments',
                        message: `File type "${file.type}" is not allowed`
                    }]);
                continue;
            }
            // Validate file size
            if (file.size > config.maxFileSize) {
                setValidationErrors(prev => [...prev, {
                        field: 'attachments',
                        message: `File "${file.name}" is too large`
                    }]);
                continue;
            }
            // Create attachment
            const attachment = {
                id: `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                type: getAttachmentType(file.type),
                url: URL.createObjectURL(file), // In real app, would upload to server
                size: file.size,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                metadata: {
                    originalFile: file,
                    uploadedAt: new Date().toISOString()
                }
            };
            newAttachments.push(attachment);
        }
        if (attachments.length + newAttachments.length > config.maxAttachments) {
            setValidationErrors(prev => [...prev, {
                    field: 'attachments',
                    message: `Cannot attach more than ${config.maxAttachments} files`
                }]);
            return;
        }
        setAttachments(prev => [...prev, ...newAttachments]);
    };
    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };
    const handleDragLeave = () => {
        setDragOver(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };
    // Draft management
    const saveDraft = () => {
        if (!config.enableDrafts)
            return;
        const draft = {
            content,
            attachments,
            mentions,
            hashtags,
            lastSaved: new Date()
        };
        localStorage.setItem(`comment_draft_${resourceId}_${authorId}`, JSON.stringify(draft));
        setDraftSaved(true);
        if (onDraftSave) {
            onDraftSave({
                content,
                attachments,
                mentions,
                hashtags
            });
        }
        // Hide draft saved indicator after 3 seconds
        setTimeout(() => setDraftSaved(false), 3000);
    };
    const loadDraft = () => {
        if (!config.enableDrafts)
            return;
        const draftKey = `comment_draft_${resourceId}_${authorId}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setContent(draft.content);
                setAttachments(draft.attachments);
                setMentions(draft.mentions);
                setHashtags(draft.hashtags);
            }
            catch (error) {
                console.error('Failed to load draft:', error);
            }
        }
    };
    const clearDraft = () => {
        if (!config.enableDrafts)
            return;
        localStorage.removeItem(`comment_draft_${resourceId}_${authorId}`);
    };
    const resetForm = () => {
        setContent('');
        setAttachments([]);
        setMentions([]);
        setHashtags([]);
        setValidationErrors([]);
        setShowPreview(false);
        setCharacterCount(0);
    };
    // Load draft on mount
    useEffect(() => {
        loadDraft();
    }, [resourceId, authorId]);
    return (_jsxs("div", { className: `comment-submission-form ${className}`, style: {
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: 'white',
            overflow: 'hidden'
        }, children: [_jsxs("div", { style: {
                    padding: '12px 16px',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }, children: [_jsx("div", { style: {
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151'
                        }, children: parentCommentId ? '💬 Reply to comment' : '✍️ Add comment' }), _jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            color: '#6b7280'
                        }, children: [draftSaved && (_jsx("span", { style: { color: '#059669' }, children: "\u2713 Draft saved" })), _jsxs("span", { children: [characterCount, "/", config.maxContentLength] }), config.enablePreview && (_jsx("button", { onClick: () => setShowPreview(!showPreview), style: {
                                    padding: '4px 8px',
                                    backgroundColor: showPreview ? '#3b82f6' : 'transparent',
                                    color: showPreview ? 'white' : '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                }, children: "Preview" }))] })] }), _jsxs("div", { style: {
                    position: 'relative',
                    minHeight: '120px'
                }, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: [dragOver && (_jsx("div", { style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            border: '2px dashed #3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            fontSize: '14px',
                            color: '#3b82f6',
                            fontWeight: '500'
                        }, children: "\uD83D\uDCCE Drop files to attach" })), !showPreview && (_jsx("textarea", { ref: textareaRef, value: content, onChange: (e) => handleContentChange(e.target.value), placeholder: placeholder, disabled: disabled || isSubmitting, spellCheck: config.enableSpellCheck, style: {
                            width: '100%',
                            minHeight: '120px',
                            padding: '16px',
                            border: 'none',
                            outline: 'none',
                            resize: 'vertical',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            fontFamily: 'inherit',
                            backgroundColor: disabled ? '#f9fafb' : 'white'
                        } })), showPreview && (_jsx("div", { style: {
                            padding: '16px',
                            minHeight: '120px',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            color: '#374151',
                            backgroundColor: '#f9fafb'
                        }, children: content ? renderPreview(content, contentType) : (_jsx("span", { style: { color: '#9ca3af', fontStyle: 'italic' }, children: "Nothing to preview yet..." })) }))] }), attachments.length > 0 && (_jsxs("div", { style: {
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e5e7eb'
                }, children: [_jsxs("div", { style: {
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#6b7280',
                            marginBottom: '8px'
                        }, children: ["Attachments (", attachments.length, ")"] }), _jsx("div", { style: {
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px'
                        }, children: attachments.map(attachment => (_jsx(AttachmentPreview, { attachment: attachment, onRemove: () => setAttachments(prev => prev.filter(a => a.id !== attachment.id)) }, attachment.id))) })] })), validationErrors.length > 0 && (_jsx("div", { style: {
                    padding: '12px 16px',
                    backgroundColor: '#fef2f2',
                    borderTop: '1px solid #fecaca'
                }, children: validationErrors.map((error, index) => (_jsxs("div", { style: {
                        fontSize: '12px',
                        color: '#dc2626',
                        marginBottom: index < validationErrors.length - 1 ? '4px' : 0
                    }, children: ["\u274C ", error.message] }, index))) })), _jsxs("div", { style: {
                    padding: '12px 16px',
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }, children: [config.enableAttachments && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => fileInputRef.current?.click(), disabled: disabled || isSubmitting, title: "Attach files", style: {
                                            padding: '6px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '4px',
                                            cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
                                            fontSize: '16px'
                                        }, children: "\uD83D\uDCCE" }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: config.allowedFileTypes.join(','), onChange: (e) => e.target.files && handleFileUpload(e.target.files), style: { display: 'none' } })] })), config.enableMarkdown && (_jsx("button", { onClick: () => setContentType(contentType === 'markdown' ? 'text' : 'markdown'), disabled: disabled || isSubmitting, title: "Toggle Markdown", style: {
                                    padding: '6px 8px',
                                    backgroundColor: contentType === 'markdown' ? '#3b82f6' : 'transparent',
                                    color: contentType === 'markdown' ? 'white' : '#6b7280',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    fontWeight: '500'
                                }, children: "MD" })), _jsx("button", { onClick: () => setShowEmojiPicker(!showEmojiPicker), disabled: disabled || isSubmitting, title: "Add emoji", style: {
                                    padding: '6px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
                                    fontSize: '16px'
                                }, children: "\uD83D\uDE0A" }), config.enableDrafts && content.length > 0 && (_jsx("button", { onClick: saveDraft, disabled: disabled || isSubmitting, title: "Save draft", style: {
                                    padding: '4px 8px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
                                    fontSize: '11px',
                                    color: '#6b7280'
                                }, children: "\uD83D\uDCBE Save" }))] }), _jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }, children: [_jsx("button", { onClick: handleCancel, disabled: isSubmitting, style: {
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    color: '#374151',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                }, children: "Cancel" }), _jsxs("button", { onClick: handleSubmit, disabled: disabled || isSubmitting || !content.trim(), style: {
                                    padding: '8px 16px',
                                    backgroundColor: disabled || isSubmitting || !content.trim() ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: disabled || isSubmitting || !content.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }, children: [isSubmitting && (_jsx("div", { style: {
                                            width: '12px',
                                            height: '12px',
                                            border: '2px solid white',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        } })), parentCommentId ? 'Reply' : 'Comment'] })] })] }), _jsx("style", { children: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        ` })] }));
};
const AttachmentPreview = ({ attachment, onRemove }) => {
    return (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 8px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px'
        }, children: [attachment.type === 'image' && attachment.preview ? (_jsx("img", { src: attachment.preview, alt: attachment.name, style: {
                    width: '24px',
                    height: '24px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                } })) : (_jsx("span", { style: { fontSize: '16px' }, children: getFileIcon(attachment.type) })), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: {
                            fontWeight: '500',
                            color: '#374151',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }, children: attachment.name }), attachment.size && (_jsx("div", { style: { color: '#6b7280', fontSize: '11px' }, children: formatFileSize(attachment.size) }))] }), _jsx("button", { onClick: onRemove, style: {
                    padding: '2px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px'
                }, children: "\u00D7" })] }));
};
// Helper functions
function extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map(match => match.substring(1)) : [];
}
function extractHashtags(content) {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(match => match.substring(1)) : [];
}
function detectSuspiciousContent(content) {
    const patterns = [
        /spam/i,
        /buy now/i,
        /click here/i,
        /urgent/i
    ];
    return patterns.filter(pattern => pattern.test(content)).map(p => p.toString());
}
function getAttachmentType(mimeType) {
    if (mimeType.startsWith('image/'))
        return 'image';
    if (mimeType.includes('text/') || mimeType.includes('application/json'))
        return 'code';
    return 'file';
}
function getFileIcon(type) {
    const icons = {
        image: '🖼️',
        file: '📄',
        link: '🔗',
        code: '💻'
    };
    return icons[type] || '📄';
}
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
function renderPreview(content, contentType) {
    // Simple preview - in real app would use proper markdown/rich text renderer
    if (contentType === 'markdown') {
        return (_jsx("div", { style: { whiteSpace: 'pre-wrap' }, children: content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code style="background: #f3f4f6; padding: 2px 4px; border-radius: 3px;">$1</code>') }));
    }
    return _jsx("div", { style: { whiteSpace: 'pre-wrap' }, children: content });
}
export default CommentSubmissionForm;
