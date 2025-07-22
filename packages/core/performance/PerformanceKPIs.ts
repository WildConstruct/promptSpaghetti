/**
 * Performance Key Performance Indicators (KPIs) for Epic 18
 * Defines measurable performance metrics and targets for the prompt graph system
 */

export interface KPIDefinition {
  id: string;
  name: string;
  description: string;
  category: 'runtime' | 'api' | 'bundle' | 'memory' | 'network' | 'build' | 'user-experience';
  unit: string;
  target: number;
  warning: number;
  critical: number;
  measurement: {
    method: string;
    frequency: 'realtime' | 'interval' | 'on-demand';
    source: string;
  };
  businessImpact: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface KPISnapshot {
  kpiId: string;
  value: number;
  timestamp: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
  metadata?: Record<string, any>;
}

export interface KPIThresholds {
  excellent: { min: number; max?: number };
  good: { min: number; max: number };
  warning: { min: number; max: number };
  critical: { min?: number; max: number };
}

/**
 * Core Performance KPIs for the Prompt Graph System
 */
export const corePerformanceKPIs: KPIDefinition[] = [
  // === RUNTIME PERFORMANCE KPIs ===
  {
    id: 'runtime_fcp',
    name: 'First Contentful Paint',
    description: 'Time from navigation start until the first content is painted to the screen',
    category: 'runtime',
    unit: 'milliseconds',
    target: 1200,
    warning: 1500,
    critical: 2000,
    measurement: {
      method: 'Web Vitals API / Performance Observer',
      frequency: 'realtime',
      source: 'client-side measurement'
    },
    businessImpact: 'Affects perceived performance and user engagement',
    priority: 'critical'
  },
  {
    id: 'runtime_lcp',
    name: 'Largest Contentful Paint',
    description: 'Time until the largest content element is rendered',
    category: 'runtime',
    unit: 'milliseconds',
    target: 2000,
    warning: 2500,
    critical: 3000,
    measurement: {
      method: 'Web Vitals API / Performance Observer',
      frequency: 'realtime',
      source: 'client-side measurement'
    },
    businessImpact: 'Indicates when main content is available to users',
    priority: 'critical'
  },
  {
    id: 'runtime_fid',
    name: 'First Input Delay',
    description: 'Time from user interaction to browser response',
    category: 'runtime',
    unit: 'milliseconds',
    target: 50,
    warning: 100,
    critical: 200,
    measurement: {
      method: 'Web Vitals API / Performance Observer',
      frequency: 'realtime',
      source: 'client-side measurement'
    },
    businessImpact: 'Affects user experience and interaction responsiveness',
    priority: 'critical'
  },
  {
    id: 'runtime_cls',
    name: 'Cumulative Layout Shift',
    description: 'Measure of visual stability during page load',
    category: 'runtime',
    unit: 'score',
    target: 0.05,
    warning: 0.1,
    critical: 0.25,
    measurement: {
      method: 'Web Vitals API / Performance Observer',
      frequency: 'realtime',
      source: 'client-side measurement'
    },
    businessImpact: 'Affects visual stability and user experience quality',
    priority: 'high'
  },
  {
    id: 'runtime_tti',
    name: 'Time to Interactive',
    description: 'Time until page is fully interactive and responsive',
    category: 'runtime',
    unit: 'milliseconds',
    target: 2500,
    warning: 3000,
    critical: 4000,
    measurement: {
      method: 'Lighthouse / Performance monitoring',
      frequency: 'interval',
      source: 'client-side measurement'
    },
    businessImpact: 'Indicates when users can fully interact with the application',
    priority: 'high'
  },

  // === API PERFORMANCE KPIs ===
  {
    id: 'api_graph_execution',
    name: 'Graph Execution Time',
    description: 'Time to execute prompt graph from start to completion',
    category: 'api',
    unit: 'milliseconds',
    target: 800,
    warning: 1000,
    critical: 1500,
    measurement: {
      method: 'Server-side execution timing',
      frequency: 'realtime',
      source: 'server-side measurement'
    },
    businessImpact: 'Core workflow performance affecting user productivity',
    priority: 'critical'
  },
  {
    id: 'api_preview_generation',
    name: 'Preview Generation Time',
    description: 'Time to generate preview results for graph execution',
    category: 'api',
    unit: 'milliseconds',
    target: 400,
    warning: 500,
    critical: 800,
    measurement: {
      method: 'Server-side execution timing',
      frequency: 'realtime',
      source: 'server-side measurement'
    },
    businessImpact: 'Affects iteration speed and user workflow efficiency',
    priority: 'high'
  },
  {
    id: 'api_validation',
    name: 'Graph Validation Time',
    description: 'Time to validate graph structure and connections',
    category: 'api',
    unit: 'milliseconds',
    target: 50,
    warning: 100,
    critical: 200,
    measurement: {
      method: 'Server-side validation timing',
      frequency: 'realtime',
      source: 'server-side measurement'
    },
    businessImpact: 'Affects real-time feedback and editing responsiveness',
    priority: 'medium'
  },
  {
    id: 'api_throughput',
    name: 'API Request Throughput',
    description: 'Number of API requests processed per second',
    category: 'api',
    unit: 'requests/second',
    target: 100,
    warning: 75,
    critical: 50,
    measurement: {
      method: 'Server request counting',
      frequency: 'interval',
      source: 'server-side monitoring'
    },
    businessImpact: 'System scalability and concurrent user support',
    priority: 'high'
  },

  // === BUNDLE SIZE KPIs ===
  {
    id: 'bundle_main_size',
    name: 'Main Bundle Size',
    description: 'Size of the main application bundle',
    category: 'bundle',
    unit: 'kilobytes',
    target: 200,
    warning: 250,
    critical: 350,
    measurement: {
      method: 'Build-time bundle analysis',
      frequency: 'on-demand',
      source: 'build system'
    },
    businessImpact: 'Affects initial load time and user experience',
    priority: 'high'
  },
  {
    id: 'bundle_total_size',
    name: 'Total Bundle Size',
    description: 'Combined size of all application bundles',
    category: 'bundle',
    unit: 'kilobytes',
    target: 800,
    warning: 1000,
    critical: 1400,
    measurement: {
      method: 'Build-time bundle analysis',
      frequency: 'on-demand',
      source: 'build system'
    },
    businessImpact: 'Overall application loading performance',
    priority: 'medium'
  },

  // === MEMORY KPIs ===
  {
    id: 'memory_peak_usage',
    name: 'Peak Memory Usage',
    description: 'Maximum memory consumption during typical usage',
    category: 'memory',
    unit: 'megabytes',
    target: 100,
    warning: 150,
    critical: 200,
    measurement: {
      method: 'Runtime memory monitoring',
      frequency: 'realtime',
      source: 'client-side measurement'
    },
    businessImpact: 'Browser stability and user experience on low-end devices',
    priority: 'medium'
  },
  {
    id: 'memory_leak_rate',
    name: 'Memory Leak Rate',
    description: 'Rate of memory growth indicating potential leaks',
    category: 'memory',
    unit: 'megabytes/hour',
    target: 2,
    warning: 5,
    critical: 10,
    measurement: {
      method: 'Memory trend analysis',
      frequency: 'interval',
      source: 'client-side monitoring'
    },
    businessImpact: 'Long-term application stability and performance',
    priority: 'high'
  },

  // === NETWORK KPIs ===
  {
    id: 'network_transfer_size',
    name: 'Total Transfer Size',
    description: 'Total bytes transferred for initial page load',
    category: 'network',
    unit: 'kilobytes',
    target: 1200,
    warning: 1500,
    critical: 2000,
    measurement: {
      method: 'Network monitoring',
      frequency: 'realtime',
      source: 'client-side measurement'
    },
    businessImpact: 'Load time on slower connections and mobile devices',
    priority: 'medium'
  },
  {
    id: 'network_request_count',
    name: 'Initial Request Count',
    description: 'Number of network requests for initial page load',
    category: 'network',
    unit: 'requests',
    target: 20,
    warning: 25,
    critical: 35,
    measurement: {
      method: 'Network monitoring',
      frequency: 'realtime',
      source: 'client-side measurement'
    },
    businessImpact: 'Initial load performance and server load',
    priority: 'medium'
  },

  // === BUILD PERFORMANCE KPIs ===
  {
    id: 'build_time',
    name: 'Build Time',
    description: 'Time for complete application build',
    category: 'build',
    unit: 'seconds',
    target: 45,
    warning: 60,
    critical: 90,
    measurement: {
      method: 'Build system timing',
      frequency: 'on-demand',
      source: 'build system'
    },
    businessImpact: 'Developer productivity and deployment speed',
    priority: 'medium'
  },
  {
    id: 'build_test_time',
    name: 'Test Execution Time',
    description: 'Time to run complete test suite',
    category: 'build',
    unit: 'seconds',
    target: 25,
    warning: 30,
    critical: 45,
    measurement: {
      method: 'Test runner timing',
      frequency: 'on-demand',
      source: 'test system'
    },
    businessImpact: 'Developer productivity and CI/CD pipeline efficiency',
    priority: 'low'
  },

  // === USER EXPERIENCE KPIs ===
  {
    id: 'ux_graph_creation_time',
    name: 'Graph Creation Flow Time',
    description: 'End-to-end time to create and test a new graph',
    category: 'user-experience',
    unit: 'seconds',
    target: 30,
    warning: 45,
    critical: 60,
    measurement: {
      method: 'User flow tracking',
      frequency: 'on-demand',
      source: 'client-side analytics'
    },
    businessImpact: 'User productivity and workflow efficiency',
    priority: 'high'
  },
  {
    id: 'ux_error_rate',
    name: 'User-Facing Error Rate',
    description: 'Percentage of user actions resulting in errors',
    category: 'user-experience',
    unit: 'percentage',
    target: 1,
    warning: 3,
    critical: 5,
    measurement: {
      method: 'Error tracking and analytics',
      frequency: 'realtime',
      source: 'client-side monitoring'
    },
    businessImpact: 'User satisfaction and application reliability',
    priority: 'critical'
  }
];

/**
 * KPI threshold definitions for status calculation
 */
export const kpiThresholds: Record<string, KPIThresholds> = {
  // Runtime KPIs (lower is better)
  runtime_fcp: {
    excellent: { min: 0, max: 1000 },
    good: { min: 1000, max: 1200 },
    warning: { min: 1200, max: 1500 },
    critical: { min: 1500, max: Infinity }
  },
  runtime_lcp: {
    excellent: { min: 0, max: 1500 },
    good: { min: 1500, max: 2000 },
    warning: { min: 2000, max: 2500 },
    critical: { min: 2500, max: Infinity }
  },
  runtime_fid: {
    excellent: { min: 0, max: 50 },
    good: { min: 50, max: 100 },
    warning: { min: 100, max: 200 },
    critical: { min: 200, max: Infinity }
  },
  runtime_cls: {
    excellent: { min: 0, max: 0.05 },
    good: { min: 0.05, max: 0.1 },
    warning: { min: 0.1, max: 0.25 },
    critical: { min: 0.25, max: Infinity }
  },

  // API KPIs (lower is better except throughput)
  api_graph_execution: {
    excellent: { min: 0, max: 600 },
    good: { min: 600, max: 800 },
    warning: { min: 800, max: 1000 },
    critical: { min: 1000, max: Infinity }
  },
  api_throughput: {
    excellent: { min: 100, max: Infinity },
    good: { min: 75, max: 100 },
    warning: { min: 50, max: 75 },
    critical: { min: 0, max: 50 }
  },

  // Memory KPIs (lower is better)
  memory_peak_usage: {
    excellent: { min: 0, max: 80 },
    good: { min: 80, max: 100 },
    warning: { min: 100, max: 150 },
    critical: { min: 150, max: Infinity }
  },

  // User Experience KPIs
  ux_error_rate: {
    excellent: { min: 0, max: 0.5 },
    good: { min: 0.5, max: 1 },
    warning: { min: 1, max: 3 },
    critical: { min: 3, max: Infinity }
  }
};

/**
 * Calculate KPI status based on current value and thresholds
 */
export function calculateKPIStatus(kpiId: string, value: number): 'excellent' | 'good' | 'warning' | 'critical' {
  const thresholds = kpiThresholds[kpiId];
  if (!thresholds) return 'good'; // Default if no thresholds defined

  if (value >= thresholds.excellent.min && value <= (thresholds.excellent.max || Infinity)) {
    return 'excellent';
  }
  if (value >= thresholds.good.min && value <= thresholds.good.max) {
    return 'good';
  }
  if (value >= thresholds.warning.min && value <= thresholds.warning.max) {
    return 'warning';
  }
  return 'critical';
}

/**
 * Calculate KPI trend based on historical values
 */
export function calculateKPITrend(snapshots: KPISnapshot[]): 'improving' | 'stable' | 'degrading' {
  if (snapshots.length < 3) return 'stable';

  const recent = snapshots.slice(-5); // Last 5 snapshots
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
  const isLowerBetter = kpi?.category === 'runtime' || kpi?.category === 'api' || 
                       kpi?.category === 'memory' || kpi?.category === 'network' ||
                       kpi?.id === 'ux_error_rate';
  
  const threshold = 0.05; // 5% change threshold
  if (Math.abs(slope) < threshold) return 'stable';
  
  if (isLowerBetter) {
    return slope < 0 ? 'improving' : 'degrading';
  } else {
    return slope > 0 ? 'improving' : 'degrading';
  }
}

/**
 * Generate KPI recommendations based on current status
 */
export function generateKPIRecommendations(kpiId: string, value: number, status: string): string[] {
  const recommendations: string[] = [];
  
  if (status === 'critical' || status === 'warning') {
    switch (kpiId) {
      case 'runtime_fcp':
      case 'runtime_lcp':
        recommendations.push(
          'Optimize critical rendering path',
          'Minimize render-blocking resources',
          'Enable resource preloading for critical assets',
          'Consider server-side rendering or static generation'
        );
        break;
        
      case 'runtime_fid':
        recommendations.push(
          'Reduce JavaScript execution time during initial load',
          'Break up long-running tasks with setTimeout or scheduler',
          'Use web workers for heavy computations',
          'Implement code splitting to reduce main thread work'
        );
        break;
        
      case 'api_graph_execution':
        recommendations.push(
          'Implement caching for repeated graph operations',
          'Optimize graph traversal algorithms',
          'Consider parallel processing for independent nodes',
          'Add graph complexity limits and validation'
        );
        break;
        
      case 'memory_peak_usage':
        recommendations.push(
          'Implement object pooling for frequently created objects',
          'Add proper cleanup in component unmounting',
          'Use virtualization for large lists',
          'Profile memory usage to identify leaks'
        );
        break;
        
      case 'bundle_main_size':
      case 'bundle_total_size':
        recommendations.push(
          'Enable code splitting for route-based loading',
          'Remove unused dependencies and dead code',
          'Use dynamic imports for non-critical features',
          'Optimize third-party library usage'
        );
        break;
        
      default:
        recommendations.push(
          'Monitor this metric closely for trends',
          'Consider performance optimization strategies',
          'Review related system components'
        );
    }
  }
  
  return recommendations;
}

/**
 * Get KPI by ID
 */
export function getKPIDefinition(kpiId: string): KPIDefinition | undefined {
  return corePerformanceKPIs.find(kpi => kpi.id === kpiId);
}

/**
 * Get KPIs by category
 */
export function getKPIsByCategory(category: string): KPIDefinition[] {
  return corePerformanceKPIs.filter(kpi => kpi.category === category);
}

/**
 * Get high-priority KPIs
 */
export function getCriticalKPIs(): KPIDefinition[] {
  return corePerformanceKPIs.filter(kpi => kpi.priority === 'critical');
}

export default {
  corePerformanceKPIs,
  kpiThresholds,
  calculateKPIStatus,
  calculateKPITrend,
  generateKPIRecommendations,
  getKPIDefinition,
  getKPIsByCategory,
  getCriticalKPIs
};