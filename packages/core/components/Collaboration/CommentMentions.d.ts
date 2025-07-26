import React from 'react';
interface CommentMentionsProps {
    workspaceId: string;
    query: string;
    onSelect: (userId: string, userName: string) => void;
    onClose: () => void;
    maxResults?: number;
}
export declare const CommentMentions: React.FC<CommentMentionsProps>;
export {};
//# sourceMappingURL=CommentMentions.d.ts.map