/**
 * Epic 9.2.3 - Activity Feed Component
 * Main activity feed interface for workspace activity
 */
import React from 'react';

interface ActivityFeedProps {
    workspaceId: string;
    userId: string;
    projectId?: string;
    showStats?: boolean;
    showFilters?: boolean;
    maxItems?: number;
    compact?: boolean;

export declare const ActivityFeed: React.FC<ActivityFeedProps>;
export default ActivityFeed;
//# sourceMappingURL=ActivityFeed.d.ts.map