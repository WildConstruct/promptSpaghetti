/**
 * Epic 9.2.3 - Activity Filters Component
 * Filter controls for activity feed
 */
import React from 'react';
import { ActivityEventFilter } from '../../types/workspace';

interface ActivityFiltersProps {
    filters: ActivityEventFilter;
    eventTypes: string[];
    onFilterChange: (filters: Partial<ActivityEventFilter>) => void;
    className?: string;

export declare const ActivityFilters: React.FC<ActivityFiltersProps>;
export default ActivityFilters;
//# sourceMappingURL=ActivityFilters.d.ts.map