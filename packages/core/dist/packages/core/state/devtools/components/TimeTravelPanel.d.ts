/**
 * Time Travel Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Time Travel UI
 */
import React from 'react';
import { TimeTravel, TimeTravelState } from '../TimeTravel';
export interface TimeTravelPanelProps {
    timeTravel: TimeTravel;
    timeTravelState: TimeTravelState | null;
    selectedDomain: string;
    onDomainChange: (domain: string) => void;
}
export declare const TimeTravelPanel: React.FC<TimeTravelPanelProps>;
//# sourceMappingURL=TimeTravelPanel.d.ts.map