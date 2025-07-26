import React from 'react';
import { Notification } from '../../types/NotificationTypes';
interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}
export declare const NotificationItem: React.FC<NotificationItemProps>;
export default NotificationItem;
//# sourceMappingURL=NotificationItem.d.ts.map