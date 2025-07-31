import React from 'react';

}
export interface UserCursorProps {
    userId: string;
    userName?: string;
    userAvatar?: string;
    x: number;
    y: number;
    color?: string;
    visible?: boolean;
    showLabel?: boolean;
    isFollowing?: boolean;
    nodeId?: string;
    className?: string;

export declare const UserCursor: React.FC<UserCursorProps>;

}
export interface UserCursorOverlayProps {
    cursors: Array<{
        userId: string;
        userName?: string;
        userAvatar?: string;
        x: number;
        y: number;
        nodeId?: string;
        visible?: boolean;
}
    }>;
    followingUserId?: string;
    showLabels?: boolean;
    className?: string;

export declare const UserCursorOverlay: React.FC<UserCursorOverlayProps>;

}
export interface UserSelectionProps {
    userId: string;
    userName?: string;
    nodeIds: string[];
    color?: string;
    opacity?: number;
    showLabel?: boolean;

export declare const UserSelection: React.FC<UserSelectionProps>;

}
export interface TypingIndicatorProps {
    users: Array<{
        userId: string;
        userName?: string;
        nodeId?: string;
}
    }>;
    className?: string;

export declare const TypingIndicator: React.FC<TypingIndicatorProps>;
//# sourceMappingURL=UserCursor.d.ts.map