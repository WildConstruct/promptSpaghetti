;
read_at ?  : string;
created_at: string;
updated_at: string;
;
quiet_hours: {
    enabled: boolean;
    start: string; // HH:MM format,
    end: string; // HH:MM format }
    timezone: string;
}
;
digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
created_at ?  : string;
updated_at ?  : string;
status: 'pending' | 'sent' | 'delivered' | 'failed';
error_message ?  : string;
delivered_at ?  : string;
created_at: string;
;
notification: Notification;
timestamp: string;
setUnreadOnly: (unreadOnly) => void ;
export {};
