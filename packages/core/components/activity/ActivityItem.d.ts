/**
 * Epic 9.2.3 - Activity Item Component
 * Individual activity event display component
 */
import React from 'react';
import { ActivityEventWithActorInfo } from '../../types/workspace';

interface ActivityItemProps {
    activity: ActivityEventWithActorInfo;
    onClick?: () => void;
    compact?: boolean;
    showProject?: boolean;
    isLast?: boolean;

export declare const ActivityItem: React.FC<ActivityItemProps>;
export default ActivityItem;
//# sourceMappingURL=ActivityItem.d.ts.map