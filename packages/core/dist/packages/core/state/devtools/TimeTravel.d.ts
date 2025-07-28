/**
 * Time Travel Debugging
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools
 *
 * Advanced time-travel debugging with state history navigation and replay
 */
import { EventEmitter } from 'events';
import { StateSnapshot, StateChange } from '../containers/BaseStateContainer';
export interface TimeTravelConfig {
    maxHistorySize: number;
    enableBranching: boolean;
    enableSnapshots: boolean;
    enableDiffing: boolean;
    compressionEnabled: boolean;
    persistHistory: boolean;
    autoSnapshot: {
        enabled: boolean;
        interval: number;
        maxSnapshots: number;
    };
}
export interface TimelineEntry<T = any> {
    id: string;
    timestamp: number;
    type: 'snapshot' | 'change' | 'branch' | 'merge' | 'marker';
    domain: string;
    snapshot?: StateSnapshot<T>;
    change?: StateChange<T>;
    metadata: {
        description?: string;
        author?: string;
        tags: string;
        branchId?: string;
        parentId?: string;
        childIds: string;
        size: number;
        compressed: boolean;
    };
}
export interface TimeBranch {
    id: string;
    name: string;
    description: string;
    created: number;
    lastModified: number;
    parentEntryId: string;
    headEntryId: string;
    entryIds: string;
    metadata: {
        author: string;
        tags: string;
        protected: boolean;
        color: string;
    };
}
export interface TimeTravelState {
    currentPosition: number;
    currentBranch: string;
    totalEntries: number;
    isReplaying: boolean;
    canGoBack: boolean;
    canGoForward: boolean;
    branches: string;
    markers: TimelineMarker;
}
export interface TimelineMarker {
    id: string;
    entryId: string;
    name: string;
    description: string;
    color: string;
    timestamp: number;
    type: 'bookmark' | 'bug' | 'feature' | 'test' | 'milestone';
}
export interface StateDiff {
    path: string;
    type: 'added' | 'removed' | 'modified' | 'unchanged';
    oldValue?: any;
    newValue?: any;
    children?: StateDiff;
}
export interface ReplaySession {
    id: string;
    name: string;
    description: string;
    timeline: TimelineEntry;
    currentIndex: number;
    playbackSpeed: number;
    autoPlay: boolean;
    loop: boolean;
    breakpoints: number;
    created: number;
    lastPlayed: number;
}
export interface TimelineQuery {
    timeRange?: {
        start: number;
        end: number;
    };
    domains?: string;
    types?: string;
    branches?: string;
    tags?: string;
    search?: string;
    limit?: number;
    offset?: number;
}
export declare class TimeTravel extends EventEmitter {
    private config;
    private timeline;
    private timelineOrder;
    private branches;
    private currentPosition;
    private currentBranch;
    private markers;
    private replaySessions;
    private isRecording;
    private isReplaying;
    constructor(config?: Partial<TimeTravelConfig>);
}
//# sourceMappingURL=TimeTravel.d.ts.map