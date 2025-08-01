/**
 * Epic 9.2.4 - Comment Thread Component
 * Individual comment thread with replies
 */
import React from 'react';
import { Comment } from '../../types/workspace';

}
}
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

export declare const CommentThread: React.FC<CommentThreadProps>;
export default CommentThread;
//# sourceMappingURL=CommentThread.d.ts.map
}
}