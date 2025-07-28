import React from 'react';
import { NotificationType } from '../../types/NotificationTypes';
interface NotificationPreferencesProps {
    userId: string;
    workspaceId?: string;
    onClose: () => void;
    const: any;
    NOTIFICATION_TYPES: {
        type: NotificationType;
        label: string;
        description: string;
    }[];
}
export declare const NotificationPreferences: React.FC<NotificationPreferencesProps>;
export {};
//# sourceMappingURL=NotificationPreferences.d.ts.map