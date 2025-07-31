/**
 * Epic 16 Comment Submission Form
 * Task: E16-1753114247004-424BDA - Create comment submission flow
 *
 * User-friendly comment submission interface with rich text editing,
 * attachment support, real-time validation, and integration with
 * existing comment infrastructure.
 */
import React from 'react';

}
export interface CommentSubmissionData {
    content: string;
    contentType: 'text' | 'markdown' | 'rich';
    resourceId: string;
    resourceType: 'template' | 'project' | 'user' | 'marketplace_item';
    parentCommentId?: string;
    authorId: string;
    mentions: string[];
    hashtags: string[];
    attachments: CommentAttachment[];
    metadata?: Record<string, unknown>;

}
export interface CommentAttachment {
    id: string;
    name: string;
    type: 'image' | 'file' | 'link' | 'code';
    url: string;
    size?: number;
    preview?: string;
    metadata?: Record<string, unknown>;

}
export interface CommentSubmissionConfig {
    enableRichText: boolean;
    enableMarkdown: boolean;
    enableAttachments: boolean;
    enableMentions: boolean;
    enableHashtags: boolean;
    enableCodeBlocks: boolean;
    enableLinkPreviews: boolean;
    maxContentLength: number;
    maxAttachments: number;
    allowedFileTypes: string[];
    maxFileSize: number;
    enableDrafts: boolean;
    autoSaveDrafts: boolean;
    enableSpellCheck: boolean;
    enablePreview: boolean;
    moderationSettings: {
        requireApproval: boolean;
        enableAutoModeration: boolean;
        flagSuspiciousContent: boolean;
}
    };

}
export interface CommentSubmissionFormProps {
    resourceId: string;
    resourceType: 'template' | 'project' | 'user' | 'marketplace_item';
    parentCommentId?: string;
    authorId: string;
    config?: Partial<CommentSubmissionConfig>;
    onSubmit?: (data: CommentSubmissionData) => Promise<void>;
    onCancel?: () => void;
    onDraftSave?: (draft: Partial<CommentSubmissionData>) => void;
    onValidationError?: (errors: string[]) => void;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
    disabled?: boolean;

export declare const CommentSubmissionForm: React.FC<CommentSubmissionFormProps>;
export default CommentSubmissionForm;
//# sourceMappingURL=CommentSubmissionForm.d.ts.map
}