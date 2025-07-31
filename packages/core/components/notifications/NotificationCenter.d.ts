/**
 * Epic 9.2.5 - Notification Center UI Component
 * Complete notification system with real-time updates, filtering, and user preferences
 */
import React from 'react';
import { NotificationManager } from './NotificationManager';

}
export interface Notification {
    id: string;
    user_id: string;
    workspace_id: string;
    event_id?: string;
    notification_type: string;
    title: string;
    message: string;
    action_url?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    delivery_channel: 'in_app' | 'email' | 'push';
    read_at?: string;
    delivered_at: string;
    icon?: string;
    color?: string;
    action_label?: string;


}
interface NotificationCenterProps {
    notificationManager: NotificationManager;
    isOpen: boolean;
    onClose: () => void;
    className?: string;

export declare const NotificationCenter: React.FC<NotificationCenterProps>;
}
export {};
//# sourceMappingURL=NotificationCenter.d.ts.map