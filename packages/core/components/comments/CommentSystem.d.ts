/**
 * Epic 9.2.4 - Comment System Component
 * Main interface for threaded commenting system
 */
import React from 'react';

}
interface CommentSystemProps {
    workspaceId: string;
    targetType: string;
    targetId: string;
    userId: string;
    resourceId?: string;
    projectId?: string;
    className?: string;
    compact?: boolean;

export declare const CommentSystem: React.FC<CommentSystemProps>;
export default CommentSystem;
//# sourceMappingURL=CommentSystem.d.ts.map
}