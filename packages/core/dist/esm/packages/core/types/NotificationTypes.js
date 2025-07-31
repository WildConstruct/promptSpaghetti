;
read_at ?  : string;
created_at: string;
updated_at: string;
;
quiet_hours: {
    enabled: boolean;
    start: string; // HH:MM format,
    end: string; // HH:MM format,
    timezone: string;
}
;
digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
created_at ?  : string;
updated_at ?  : string;
;
export {};
