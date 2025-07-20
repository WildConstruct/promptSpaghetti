import React from 'react';
import { LockNotification } from '../types/locking';
interface LockNotificationsProps {
    notifications: LockNotification[];
    onMarkAsRead: (notificationId: string) => void;
}
export declare const LockNotifications: React.FC<LockNotificationsProps>;
export {};
//# sourceMappingURL=LockNotifications.d.ts.map