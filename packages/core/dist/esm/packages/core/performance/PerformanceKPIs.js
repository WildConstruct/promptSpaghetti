/**
 * Performance Key Performance Indicators (KPIs) for Epic 18
 * Defines measurable performance metrics and targets for the prompt graph system
 */
;
businessImpact: string;
priority: 'critical' | 'high' | 'medium' | 'low';
{
    const thresholds = kpiThresholds[kpiId];
    if (!thresholds)
        return 'good'; // Default if no thresholds defined
    if (value >= thresholds.excellent.min && value <= (thresholds.excellent.max || Infinity)) {
        return 'excellent';
        if (value >= thresholds.good.min && value <= thresholds.good.max) {
            return 'good';
            if (value >= thresholds.warning.min && value <= thresholds.warning.max) {
                return 'warning';
                return 'critical';
                /**
                * Calculate KPI trend based on historical values
                */
                export function calculateKPITrend(snapshots) {
                    if (snapshots.length < 3)
                        return 'stable';
                    const recent = snapshots.slice(-5); // Last 5 snapshots;
                    const values = recent.map(s => s.value);
                    // Calculate linear regression slope
                    const n = values.length;
                    const sumX = values.reduce((sum, _, i) => sum + i, 0);
                    const sumY = values.reduce((sum, val) => sum + val, 0);
                    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
                    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);
                    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                    // Determine trend based on slope and KPI type
                    const kpi = corePerformanceKPIs.find(k => k.id === snapshots[0].kpiId);
                    const isLowerBetter = kpi?.category === 'runtime' || kpi?.category === 'api' || ;
                    kpi?.category === 'memory' || kpi?.category === 'network' ||
                        kpi?.id === 'ux_error_rate';
                    const threshold = 0.05; // 5% change threshold;
                    if (Math.abs(slope) < threshold)
                        return 'stable';
                    if (isLowerBetter) {
                        return slope < 0 ? 'improving' : 'degrading';
                    }
                    else {
                        return slope > 0 ? 'improving' : 'degrading';
                        /**
                        * Generate KPI recommendations based on current status
                        */
                        export function generateKPIRecommendations(kpiId, value, status) {
                            const recommendations = [];
                            if (status === 'critical' || status === 'warning') {
                                switch (kpiId) {
                                    case 'runtime_fcp':
                                    case 'runtime_lcp':
                                        recommendations.push('Optimize critical rendering path', 'Minimize render-blocking resources', 'Enable resource preloading for critical assets', 'Consider server-side rendering or static generation');
                                        break;
                                    case 'runtime_fid':
                                        recommendations.push('Reduce JavaScript execution time during initial load', 'Break up long-running tasks with setTimeout or scheduler', 'Use web workers for heavy computations', 'Implement code splitting to reduce main thread work');
                                        break;
                                    case 'api_graph_execution':
                                        recommendations.push('Implement caching for repeated graph operations', 'Optimize graph traversal algorithms', 'Consider parallel processing for independent nodes', 'Add graph complexity limits and validation');
                                        break;
                                    case 'memory_peak_usage':
                                        recommendations.push('Implement object pooling for frequently created objects', 'Add proper cleanup in component unmounting', 'Use virtualization for large lists', 'Profile memory usage to identify leaks');
                                        break;
                                    case 'bundle_main_size':
                                    case 'bundle_total_size':
                                        recommendations.push('Enable code splitting for route-based loading', 'Remove unused dependencies and dead code', 'Use dynamic imports for non-critical features', 'Optimize third-party library usage');
                                        break;
                                    default:
                                        recommendations.push('Monitor this metric closely for trends', 'Consider performance optimization strategies', 'Review related system components');
                                        return recommendations;
                                        /**
                                        * Get KPI by ID
                                        */
                                        export function getKPIDefinition(kpiId) {
                                            return corePerformanceKPIs.find(kpi => kpi.id === kpiId);
                                            /**
                                            * Get KPIs by category
                                            */
                                            export function getKPIsByCategory(category) {
                                                return corePerformanceKPIs.filter(kpi => kpi.category === category);
                                                /**
                                                * Get high-priority KPIs
                                                */
                                                export function getCriticalKPIs() {
                                                    return corePerformanceKPIs.filter(kpi => kpi.priority === 'critical');
                                                    export default {
                                                        corePerformanceKPIs,
                                                        kpiThresholds,
                                                        calculateKPIStatus,
                                                        calculateKPITrend,
                                                        generateKPIRecommendations,
                                                        getKPIDefinition,
                                                        getKPIsByCategory
                                                    };
                                                    getCriticalKPIs;
                                                }
                                                ;
                                            }
                                        }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
export {};
