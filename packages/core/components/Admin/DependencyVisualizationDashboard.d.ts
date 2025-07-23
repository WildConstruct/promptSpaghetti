/**
 * Epic 17 Dependency Visualization Dashboard
 *
 * Advanced dashboard for visualizing and managing feature toggle dependencies.
 * Provides comprehensive visualization, analysis, and management capabilities.
 */
import React from 'react';
import { FeatureToggleDependencyService } from '../../services/FeatureToggleDependencyService';
interface DashboardProps {
    dependencyService: FeatureToggleDependencyService;
    selectedToggles?: string[];
    onToggleSelect?: (toggleId: string) => void;
    onDependencyCreate?: (source: string, target: string) => void;
    onConflictResolve?: (conflictId: string, resolution: string) => void;
}
export declare const DependencyVisualizationDashboard: React.FC<DashboardProps>;
export default DependencyVisualizationDashboard;
//# sourceMappingURL=DependencyVisualizationDashboard.d.ts.map