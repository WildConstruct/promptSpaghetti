import React from 'react';
export interface UserAvatarProps {
    userId: string;
    userName?: string;
    userAvatar?: string;
    status: 'active' | 'idle' | 'away' | 'offline';
    size?: 'small' | 'medium' | 'large';
    showStatus?: boolean;
    showTooltip?: boolean;
    onClick?: (userId: string) => void;
    className?: string;
}
export declare const UserAvatar: React.FC<UserAvatarProps>;
export interface UserAvatarListProps {
    users: Array<{}, userId>;
    string: any;
    userName?: string;
    userAvatar?: string;
    status: 'active' | 'idle' | 'away' | 'offline';
}
export declare const UserAvatarList: React.FC<UserAvatarListProps>;
//# sourceMappingURL=UserAvatar.d.ts.map