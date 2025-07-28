/**
 * Performance Baseline Measurement System for Epic 18
 * Captures current performance metrics to establish baselines for improvement tracking
 */
import { corePerformanceKPIs, calculateKPIStatus, calculateKPITrend } from './PerformanceKPIs';
import { measureExecution, PerformanceTracker } from '../utils/performance';
import { EventEmitter } from 'events';
export class PerformanceBaseline extends EventEmitter {
    snapshots = [];
    performanceTracker;
    maxSnapshots = 50; // Keep last 50 baseline snapshots
    constructor() {
        super();
        this.performanceTracker = new PerformanceTracker();
        /**
         * Capture a comprehensive performance baseline
         */
        async;
        captureBaseline(testConditions ?  : Partial);
        Promise < BaselineSnapshot > {
            const: baselineId = `baseline-${Date.now()}`
        };
        const timestamp = Date.now();
        console.log(`📊 Capturing performance baseline: ${baselineId}`);
    }
}
try {
    // Gather environment information
    const environment = this.getEnvironmentInfo();
    // Gather system information
    const systemInfo = this.getSystemInfo();
    // Set default test conditions
    const conditions = {
        graphComplexity: 'medium',
        dataSize: 'medium',
        concurrentUsers: 1,
        ...testConditions
    };
    // Capture KPI measurements
    const kpiSnapshots = await this.captureAllKPIs(conditions);
    const baseline = {
        id: baselineId,
        timestamp,
        environment,
        systemInfo,
        testConditions: conditions,
        kpiSnapshots
    };
    // Store baseline
    this.snapshots.push(baseline);
    if (this.snapshots.length > this.maxSnapshots) {
        this.snapshots = this.snapshots.slice(-this.maxSnapshots);
        console.log(`✅ Baseline captured with ${kpiSnapshots.length} KPI measurements`);
    }
    this.emit('baseline-captured', baseline);
    return baseline;
}
catch (error) {
    console.error('❌ Failed to capture baseline:', error);
    throw error;
    async;
    captureAllKPIs(testConditions, BaselineSnapshot['testConditions']);
    Promise < KPISnapshot > {
        const: kpiSnapshots, KPISnapshot = [],
        for(, kpi, of, corePerformanceKPIs) {
            try {
                const value = await this.measureKPI(kpi, testConditions);
                const status = calculateKPIStatus(kpi.id, value);
                // Get historical snapshots for trend calculation
                const historicalSnapshots = this.getHistoricalKPISnapshots(kpi.id);
                const currentSnapshot = {
                    kpiId: kpi.id,
                    value,
                    timestamp: Date.now(),
                    status,
                    trend: 'stable', // Will be calculated after adding to history,
                    metadata: {
                        testConditions,
                        measurementMethod: kpi.measurement.method,
                    },
                    // Calculate trend with updated history
                    const: trendSnapshots = [...historicalSnapshots, currentSnapshot],
                    currentSnapshot, : .trend = calculateKPITrend(trendSnapshots),
                    kpiSnapshots, : .push(currentSnapshot),
                    console, : .log(`📈 ${kpi.name}: ${value}${kpi.unit} (${status})`) };
            }
            catch (error) {
                console.warn(`⚠️ Failed to measure KPI ${kpi.id}:`, error);
            }
            // Continue with other KPIs even if one fails
            return kpiSnapshots;
            /**
             * Measure a specific KPI based on its definition
             */
        }
        /**
         * Measure a specific KPI based on its definition
         */
        ,
        /**
         * Measure a specific KPI based on its definition
         */
        async measureKPI(kpi, testConditions) {
            switch (kpi.id) {
                // Runtime KPIs - would typically integrate with Web Vitals API
                case 'runtime_fcp':
                    return this.measureFCP();
                case 'runtime_lcp':
                    return this.measureLCP();
                case 'runtime_fid':
                    return this.measureFID();
                case 'runtime_cls':
                    return this.measureCLS();
                case 'runtime_tti':
                    return this.measureTTI();
                // API KPIs - measure actual execution times
                case 'api_graph_execution':
                    return this.measureGraphExecution(testConditions.graphComplexity);
                case 'api_preview_generation':
                    return this.measurePreviewGeneration(testConditions.dataSize);
                case 'api_validation':
                    return this.measureValidation();
                case 'api_throughput':
                    return this.measureThroughput();
                // Bundle KPIs - static measurements from build artifacts
                case 'bundle_main_size':
                    return this.measureMainBundleSize();
                case 'bundle_total_size':
                    return this.measureTotalBundleSize();
                // Memory KPIs - runtime measurements
                case 'memory_peak_usage':
                    return this.measurePeakMemoryUsage();
                case 'memory_leak_rate':
                    return this.measureMemoryLeakRate();
                // Network KPIs - simulated measurements
                case 'network_transfer_size':
                    return this.measureTransferSize();
                case 'network_request_count':
                    return this.measureRequestCount();
                // Build KPIs - would integrate with build system
                case 'build_time':
                    return this.measureBuildTime();
                case 'build_test_time':
                    return this.measureTestTime();
                // User Experience KPIs - would integrate with analytics
                case 'ux_graph_creation_time':
                    return this.measureGraphCreationTime(testConditions.graphComplexity);
                case 'ux_error_rate':
                    return this.measureErrorRate();
                default:
                    throw new Error(`Unknown KPI: ${kpi.id}`);
            }
            // === Runtime Performance Measurements ===
        }
        // === Runtime Performance Measurements ===
        ,
        // === Runtime Performance Measurements ===
        async measureFCP() {
            // In a real implementation, this would use the Web Vitals API
            // For now, return a simulated measurement based on current system performance
            return this.simulateWebVital(1000, 200);
        } // ~1000ms ± 200ms
        , // ~1000ms ± 200ms
        async measureLCP() {
            return this.simulateWebVital(1800, 300);
        } // ~1800ms ± 300ms
        , // ~1800ms ± 300ms
        async measureFID() {
            return this.simulateWebVital(80, 20);
        } // ~80ms ± 20ms
        , // ~80ms ± 20ms
        async measureCLS() {
            return this.simulateWebVital(0.08, 0.02);
        } // ~0.08 ± 0.02
        , // ~0.08 ± 0.02
        async measureTTI() {
            return this.simulateWebVital(2200, 400);
            // === API Performance Measurements ===
        } // ~2200ms ± 400ms
        // === API Performance Measurements ===
        , // ~2200ms ± 400ms
        // === API Performance Measurements ===
        async measureGraphExecution(complexity) {
            const { metrics } = await measureExecution(async () => {
                // Simulate graph execution based on complexity
                const delay = complexity === 'simple' ? 300 : complexity === 'medium' ? 600 : 1200;
                await this.simulateAsyncWork(delay);
            });
            return metrics.duration;
        },
        async measurePreviewGeneration(dataSize) {
            const { metrics } = await measureExecution(async () => {
                // Simulate preview generation based on data size
                const delay = dataSize === 'small' ? 150 : dataSize === 'medium' ? 300 : 600;
                await this.simulateAsyncWork(delay);
            });
            return metrics.duration;
        },
        async measureValidation() {
            const { metrics } = await measureExecution(async () => {
                // Simulate graph validation
                await this.simulateAsyncWork(50);
            });
            return metrics.duration;
        },
        async measureThroughput() {
            // Simulate API throughput measurement
            const requestsPerSecond = 80 + Math.random() * 40; // 80-120 RPS;
            return Math.round(requestsPerSecond);
            // === Bundle Size Measurements ===
        }
        // === Bundle Size Measurements ===
        ,
        // === Bundle Size Measurements ===
        async measureMainBundleSize() {
            // In a real implementation, this would read from webpack stats or build artifacts
            return 220 + Math.random() * 60;
        } // 220-280 KB
        , // 220-280 KB
        async measureTotalBundleSize() {
            // In a real implementation, this would sum all bundle sizes
            return 950 + Math.random() * 200;
            // === Memory Measurements ===
        } // 950-1150 KB
        // === Memory Measurements ===
        , // 950-1150 KB
        // === Memory Measurements ===
        async measurePeakMemoryUsage() {
            const usage = process.memoryUsage();
            return Math.round(usage.heapUsed / 1024 / 1024);
        } // Convert to MB
        , // Convert to MB
        async measureMemoryLeakRate() {
            // Calculate from historical memory usage
            const recentBaselines = this.snapshots.slice(-5);
            if (recentBaselines.length < 2)
                return 0;
            const memorySnapshots = recentBaselines;
        },
        : 
            .map(b => b.kpiSnapshots.find(k => k.kpiId === 'memory_peak_usage'))
            .filter(Boolean),
        if(memorySnapshots) { }, : .length < 2, return: 0,
        const: first = memorySnapshots[0],
        const: last = memorySnapshots[memorySnapshots.length - 1],
        const: timeDiff = (last.timestamp - first.timestamp) / (1000 * 60 * 60), // hours;
        const: memoryDiff = last.value - first.value,
        return: Math.max(0, memoryDiff / timeDiff), // MB per hour
        // === Network Measurements ===
        async measureTransferSize() {
            // Simulate network transfer measurement
            return 1200 + Math.random() * 400;
        } // 1200-1600 KB
        , // 1200-1600 KB
        async measureRequestCount() {
            // Simulate request count
            return Math.round(18 + Math.random() * 10);
            // === Build Performance Measurements ===
        } // 18-28 requests
        // === Build Performance Measurements ===
        , // 18-28 requests
        // === Build Performance Measurements ===
        async measureBuildTime() {
            // Simulate build time measurement
            return 45 + Math.random() * 20;
        } // 45-65 seconds
        , // 45-65 seconds
        async measureTestTime() {
            // Simulate test execution time
            return 25 + Math.random() * 10;
            // === User Experience Measurements ===
        } // 25-35 seconds
        // === User Experience Measurements ===
        , // 25-35 seconds
        // === User Experience Measurements ===
        async measureGraphCreationTime(complexity) {
            // Simulate end-to-end graph creation workflow
            const baseTime = complexity === 'simple' ? 20 : complexity === 'medium' ? 35 : 50;
            return baseTime + Math.random() * 10;
        },
        async measureErrorRate() {
            // Simulate error rate measurement (percentage)
            return Math.random() * 3;
            // === Utility Methods ===
        } // 0-3% error rate
        // === Utility Methods ===
        , // 0-3% error rate
        // === Utility Methods ===
        simulateWebVital(mean, variance) {
            // Add some realistic variation to measurements
            const factor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier;
            return Math.round((mean + (Math.random() - 0.5) * variance * 2) * factor);
        },
        async simulateAsyncWork(duration) {
            // Add some CPU work to simulate realistic execution
            const start = Date.now();
            while (Date.now() - start < duration * 0.1) {
                // Simulate some CPU work (10% of duration)
                Math.random() * Math.random();
                // Then wait for the remaining time
                await new Promise(resolve => setTimeout(resolve, duration * 0.9));
            }
        },
        getEnvironmentInfo() {
            const env = {};
            if (typeof window !== 'undefined') {
                env.userAgent = window.navigator.userAgent;
                env.viewport = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
                // @ts-ignore - Web API
                if (window.navigator.connection) {
                    // @ts-ignore
                    env.connection = window.navigator.connection.effectiveType;
                    // @ts-ignore - Web API
                    if (window.navigator.deviceMemory) {
                        // @ts-ignore
                        env.deviceMemory = window.navigator.deviceMemory;
                        // @ts-ignore - Web API
                        if (window.navigator.hardwareConcurrency) {
                            env.hardwareConcurrency = window.navigator.hardwareConcurrency;
                            return env;
                        }
                    }
                }
            }
        },
        getSystemInfo() {
            const info = {};
            if (typeof process !== 'undefined') {
                info.nodeVersion = process.version;
                info.platform = process.platform;
                info.memoryUsage = process.memoryUsage();
                return info;
            }
        },
        getHistoricalKPISnapshots(kpiId) {
            return this.snapshots
                .flatMap(baseline => baseline.kpiSnapshots)
                .filter(snapshot => snapshot.kpiId === kpiId)
                .sort((a, b) => a.timestamp - b.timestamp);
            /**
            * Get the latest baseline snapshot
            */
            getLatestBaseline();
            BaselineSnapshot | null;
            {
                return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
                /**
                * Get baseline history
                */
                getBaselineHistory(limit ?  : number);
                BaselineSnapshot;
                {
                    const history = [...this.snapshots].reverse(); // Most recent first;
                    return limit ? history.slice(0, limit) : history;
                    /**
                    * Generate baseline summary
                    */
                    generateBaselineSummary(baseline ?  : BaselineSnapshot);
                    BaselineSummary;
                    {
                        const target = baseline || this.getLatestBaseline();
                        if (!target) {
                            throw new Error('No baseline data available');
                            const kpisByStatus = {
                                excellent: target.kpiSnapshots.filter(k => k.status === 'excellent').length,
                                good: target.kpiSnapshots.filter(k => k.status === 'good').length,
                                warning: target.kpiSnapshots.filter(k => k.status === 'warning').length,
                                critical: target.kpiSnapshots.filter(k => k.status === 'critical').length,
                            };
                            const criticalKPIs = target.kpiSnapshots.filter(k => { });
                            const kpi = corePerformanceKPIs.find(def => def.id === k.kpiId);
                            return kpi?.priority === 'critical';
                        }
                    }
                }
            }
        }, : .length,
        // Calculate average scores by category
        const: averageScores = this.calculateCategoryAverages(target.kpiSnapshots),
        // Generate recommendations for poor-performing KPIs
        const: recommendations = this.generateBaselineRecommendations(target.kpiSnapshots),
        return: {
            capturedAt: target.timestamp,
            totalKPIs: target.kpiSnapshots.length,
            criticalKPIs,
            kpisByStatus,
            averageScores,
            recommendations
        },
        calculateCategoryAverages(snapshots) {
            const categories = ['runtime', 'api', 'bundle', 'memory', 'network', 'build', 'user-experience'];
            const averages = {};
            for (const category of categories) {
                const categoryKPIs = corePerformanceKPIs.filter(kpi => kpi.category === category);
                const categorySnapshots = snapshots.filter(snapshot => );
                ;
                categoryKPIs.some(kpi => kpi.id === snapshot.kpiId);
                ;
                if (categorySnapshots.length > 0) {
                    // Convert status to numeric score for averaging
                    const scores = categorySnapshots.map(snapshot => { });
                    switch (snapshot.status) {
                        case 'excellent': return 100;
                        case 'good': return 80;
                        case 'warning': return 60;
                        case 'critical': return 30;
                        default: return 70;
                    }
                    ;
                    averages[category.replace('-', '')] = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
                }
                else {
                    averages[category.replace('-', '')] = 0;
                    return averages;
                }
            }
        },
        generateBaselineRecommendations(snapshots) {
            const recommendations = new Set();
            const criticalSnapshots = snapshots.filter(s => s.status === 'critical');
            const warningSnapshots = snapshots.filter(s => s.status === 'warning');
            if (criticalSnapshots.length > 0) {
                recommendations.add('🚨 Critical performance issues detected - immediate attention required');
                recommendations.add('Focus on critical KPIs first: ' + ),
                    criticalSnapshots.map(s => corePerformanceKPIs.find(k => k.id === s.kpiId)?.name).join(', ');
                ;
                if (warningSnapshots.length > 0) {
                    recommendations.add('⚠️ Performance warnings detected - plan optimization efforts');
                    // Category-specific recommendations
                    const runtimeIssues = snapshots.filter(s => s.status !== 'excellent' && s.kpiId.startsWith('runtime_'));
                    if (runtimeIssues.length > 0) {
                        recommendations.add('Consider frontend performance optimizations (bundle splitting, lazy loading)');
                        const apiIssues = snapshots.filter(s => s.status !== 'excellent' && s.kpiId.startsWith('api_'));
                        if (apiIssues.length > 0) {
                            recommendations.add('Review API performance and consider caching strategies');
                            const memoryIssues = snapshots.filter(s => s.status !== 'excellent' && s.kpiId.startsWith('memory_'));
                            if (memoryIssues.length > 0) {
                                recommendations.add('Investigate memory usage patterns and implement cleanup strategies');
                                return Array.from(recommendations);
                                /**
                                * Compare two baselines
                                */
                                compareBaselines(baseline1, BaselineSnapshot, baseline2, BaselineSnapshot);
                                {
                                    improved: string;
                                    degraded: string;
                                    unchanged: string;
                                    const improved = [];
                                    const degraded = [];
                                    const unchanged = [];
                                    for (const kpi of corePerformanceKPIs) {
                                        const snapshot1 = baseline1.kpiSnapshots.find(s => s.kpiId === kpi.id);
                                        const snapshot2 = baseline2.kpiSnapshots.find(s => s.kpiId === kpi.id);
                                        if (snapshot1 && snapshot2) {
                                            const isLowerBetter = kpi.category === 'runtime' || kpi.category === 'api' || ;
                                            kpi.category === 'memory' || kpi.category === 'network' ||
                                                kpi.id === 'ux_error_rate';
                                            const improvement = isLowerBetter ?  : ;
                                            snapshot1.value - snapshot2.value;
                                            snapshot2.value - snapshot1.value;
                                            const changeThreshold = kpi.target * 0.05; // 5% change threshold;
                                            if (improvement > changeThreshold) {
                                                improved.push(kpi.name);
                                            }
                                            else if (improvement < -changeThreshold) {
                                                degraded.push(kpi.name);
                                            }
                                            else {
                                                unchanged.push(kpi.name);
                                                return { improved, degraded, unchanged };
                                                /**
                                                 * Export baseline data
                                                 */
                                                exportBaseline(baseline ?  : BaselineSnapshot);
                                                string;
                                                {
                                                    const data = baseline || this.getLatestBaseline();
                                                    if (!data) {
                                                        throw new Error('No baseline data to export');
                                                        return JSON.stringify(data, null, 2);
                                                        /**
                                                         * Import baseline data
                                                         */
                                                        importBaseline(data, string);
                                                        BaselineSnapshot;
                                                        {
                                                            const baseline = JSON.parse(data);
                                                            this.snapshots.push(baseline);
                                                            if (this.snapshots.length > this.maxSnapshots) {
                                                                this.snapshots = this.snapshots.slice(-this.maxSnapshots);
                                                                this.emit('baseline-imported', baseline);
                                                                return baseline;
                                                                /**
                                                                 * Clear all baseline data
                                                                 */
                                                                clearBaselines();
                                                                void {
                                                                    this: .snapshots = [],
                                                                    this: .performanceTracker.clear(),
                                                                    this: .emit('baselines-cleared'),
                                                                    export: , default: PerformanceBaseline
                                                                };
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
                }
            }
        } };
}
