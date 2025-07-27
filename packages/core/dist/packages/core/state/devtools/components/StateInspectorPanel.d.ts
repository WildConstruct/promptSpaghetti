/**
 * State Inspector Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - State Inspection UI
 */
import React from 'react';
import { StateDevTools } from '../StateDevTools';
export interface StateInspectorPanelProps {
    devTools: StateDevTools;
    selectedDomain: string;
    onDomainChange: (domain: string) => void;
}
export declare const StateInspectorPanel: React.FC<StateInspectorPanelProps>;
//# sourceMappingURL=StateInspectorPanel.d.ts.map