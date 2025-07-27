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
        tags: string[];
        branchId?: string;
        parentId?: string;
        childIds: string[];
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
    entryIds: string[];
    metadata: {
        author: string;
        tags: string[];
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
    branches: string[];
    markers: TimelineMarker[];
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
    children?: StateDiff[];
}
export interface ReplaySession {
    id: string;
    name: string;
    description: string;
    timeline: TimelineEntry[];
    currentIndex: number;
    playbackSpeed: number;
    autoPlay: boolean;
    loop: boolean;
    breakpoints: number[];
    created: number;
    lastPlayed: number;
}
export interface TimelineQuery {
    timeRange?: {
        start: number;
        end: number;
    };
    domains?: string[];
    types?: string[];
    branches?: string[];
    tags?: string[];
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
    recordStateSnapshot<T>(snapshot: StateSnapshot<T>, domain: string, options?: {
        description?: string;
        tags?: string[];
        marker?: Omit<TimelineMarker, 'id' | 'entryId' | 'timestamp'>;
    }): string;
    recordStateChange<T>(change: StateChange<T>, domain: string, options?: {
        description?: string;
        tags?: string[];
    }): string;
    goToPosition(position: number): boolean;
    goToEntry(entryId: string): boolean;
    goToTimestamp(timestamp: number): boolean;
    goBack(steps?: number): boolean;
    goForward(steps?: number): boolean;
    goToStart(): boolean;
    goToEnd(): boolean;
    createBranch(name: string, options?: {
        description?: string;
        fromEntryId?: string;
        author?: string;
        tags?: string[];
        color?: string;
    }): string;
    switchBranch(branchId: string): boolean;
    mergeBranch(sourceBranchId: string, targetBranchId: string, options?: {
        strategy?: 'fast-forward' | 'merge-commit' | 'squash';
        message?: string;
    }): string | null;
    createReplaySession(name: string, options?: {
        description?: string;
        timeRange?: {
            start: number;
            end: number;
        };
        domains?: string[];
        speed?: number;
    }): string;
    startReplay(sessionId: string, options?: {
        autoPlay?: boolean;
        loop?: boolean;
        speed?: number;
        fromIndex?: number;
    }): boolean;
    stepReplay(sessionId: string, direction?: 'forward' | 'backward'): boolean;
    stopReplay(): void;
    createStateDiff(fromEntryId: string, toEntryId: string): StateDiff[];
    addMarker(marker: Omit<TimelineMarker, 'id' | 'timestamp'>): string;
    removeMarker(markerId: string): boolean;
    queryTimeline(query: TimelineQuery): TimelineEntry[];
    searchTimeline(searchTerm: string, options?: {
        fields?: string[];
        caseSensitive?: boolean;
        regex?: boolean;
    }): TimelineEntry[];
    private initializeMainBranch;
    private setupAutoSnapshot;
    private createAutoSnapshot;
    private addEntryToTimeline;
    private getCurrentEntryId;
    private compressSnapshot;
    private getFilteredTimeline;
    private executeAutoReplay;
    private extractStateFromEntry;
    private calculateDeepDiff;
    private getFieldValue;
    private generateEntryId;
    private generateBranchId;
    private generateMarkerId;
    private generateSessionId;
    private generateRandomColor;
    getTimeTravelState(): TimeTravelState;
    canGoBack(): boolean;
    canGoForward(): boolean;
    getTimeline(): TimelineEntry[];
    getBranches(): TimeBranch[];
    getMarkers(): TimelineMarker[];
    getReplaySessions(): ReplaySession[];
    getCurrentEntry(): TimelineEntry | null;
    startRecording(): void;
    stopRecording(): void;
    clearHistory(): void;
    exportHistory(): any;
    importHistory(data: any): void;
}
export declare const globalTimeTravel: TimeTravel;
//# sourceMappingURL=TimeTravel.d.ts.map