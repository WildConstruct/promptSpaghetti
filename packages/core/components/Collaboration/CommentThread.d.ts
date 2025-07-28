import React from 'react';

interface CommentThreadProps {
    resourceId: string;
    resourceType: 'project' | 'resource' | 'node' | 'region';
    workspaceId?: string;
    userId: string;
    targetData?: Record<string, any>;
    className?: string;
    maxHeight?: string;
    showReplies?: boolean;
    allowEditing?: boolean;
    allowModeration?: boolean;
    realTime?: boolean;


declare const CommentThread: React.FC<CommentThreadProps>;
export default CommentThread;
//# sourceMappingURL=CommentThread.d.ts.map