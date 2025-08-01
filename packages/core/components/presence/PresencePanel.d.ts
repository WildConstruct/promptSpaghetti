import React from 'react';

}
}
export interface PresenceUser { userId: string;
    userName?: string;
    userAvatar?: string;
    status: 'active' | 'idle' | 'away' | 'offline';
    lastSeen: number;
    cursor?: {
        x: number;
        y: number;
        nodeId?: string }
}
    };
    selection?: string[];
    currentTool?: string;
    isTyping?: boolean;
    focusedNodeId?: string;

}
}
export interface PresencePanelProps {
    users: PresenceUser[];
    currentUserId: string;
    onUserClick?: (userId: string) => void;
    onFollowUser?: (userId: string) => void;
    onUnfollowUser?: () => void;
    followingUserId?: string;
    showDetailedView?: boolean;
    maxAvatars?: number;
    className?: string;

export declare const PresencePanel: React.FC<PresencePanelProps>;
//# sourceMappingURL=PresencePanel.d.ts.map
}
}