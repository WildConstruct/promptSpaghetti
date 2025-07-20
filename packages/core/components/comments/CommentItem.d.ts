/**
 * Epic 9.2.4 - Comment Item Component
 * Individual comment display and interaction
 */
import React from 'react';
import { Comment } from '../../types/workspace';
interface CommentItemProps {
    comment: Comment;
    userId: string;
    onUpdate: (commentId: string, content: string, metadata?: any) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    onResolve?: (commentId: string, resolved: boolean) => Promise<void>;
    onReply?: () => void;
    compact?: boolean;
    isReply?: boolean;
    isThreadRoot?: boolean;
    isLast?: boolean;
}
export declare const CommentItem: React.FC<CommentItemProps>;
export default CommentItem;
//# sourceMappingURL=CommentItem.d.ts.map