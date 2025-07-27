/**
 * Dependency Graph Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Dependency Visualization UI
 */
import React from 'react';
import { DependencyGraph } from '../StateDevTools';
export interface DependencyGraphPanelProps {
    dependencyGraph: DependencyGraph | null;
    onGenerateGraph: () => void;
    selectedDomain: string;
    onDomainChange: (domain: string) => void;
}
export declare const DependencyGraphPanel: React.FC<DependencyGraphPanelProps>;
//# sourceMappingURL=DependencyGraphPanel.d.ts.map