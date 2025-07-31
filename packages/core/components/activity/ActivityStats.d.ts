/**
 * Epic 9.2.3 - Activity Stats Component
 * Statistics dashboard for workspace activity
 */
import React from 'react';
}
interface ActivityStatsData {
    total_events: number;
    events_by_type: Record<string, number>;
    events_by_day: Array<{
        date: string;
        count: number;
}
    }>;
    most_active_users: Array<{
        user_id: string;
        count: number;
    }>;
}
interface ActivityStatsProps {
    stats: ActivityStatsData;
    workspaceId: string;
    className?: string;

export declare const ActivityStats: React.FC<ActivityStatsProps>;
export default ActivityStats;
//# sourceMappingURL=ActivityStats.d.ts.map
}