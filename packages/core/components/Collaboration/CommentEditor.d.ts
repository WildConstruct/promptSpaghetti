import React from 'react';

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

export declare const CommentEditor: React.FC<CommentEditorProps>;
export {};
//# sourceMappingURL=CommentEditor.d.ts.map