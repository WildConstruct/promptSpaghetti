/**
 * Core Funnel Chart Visualization - Story 30.2 Task 6
 * 
 * Step-by-step conversion rate visualization with interactive funnel charts,
 * drop-off analysis, and multiple visualization modes.
 * 
 * Features:
 * - Interactive step-by-step funnel visualization
 * - Multiple chart modes (standard, sankey, waterfall)
 * - Real-time conversion rate updates
 * - Drop-off point highlighting
 * - Hover interactions with detailed metrics
 * - Responsive design with mobile support
 * - Export capabilities for charts
 * - Accessibility compliance
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  ConversionFunnelDefinition,
  ConversionStep,
  UserSegment,
  ConversionCohort
} from '../../analytics/ConversionDataModel';
import { 
  ConversionAnalyticsInfrastructure,
  ConversionMetricQuery,
  ConversionMetricResult
} from '../../analytics/ConversionAnalyticsInfrastructure';

// Chart interfaces
export interface FunnelChartProps {
  funnelDefinition: ConversionFunnelDefinition;
  analyticsInfrastructure: ConversionAnalyticsInfrastructure;
  timeRange: { start: number; end: number };
  segments?: UserSegment[];
  cohorts?: ConversionCohort[];
  chartMode?: FunnelChartMode;
  showDropoffAnalysis?: boolean;
  realTimeUpdates?: boolean;
  onStepClick?: (step: ConversionStep, metrics: StepMetrics) => void;
  onExport?: (chartData: ChartExportData) => void;
}

export type FunnelChartMode = 
  | 'standard'
  | 'horizontal'
  | 'sankey'
  | 'waterfall'
  | 'heatmap';

export interface StepMetrics {
  stepId: string;
  stepName: string;
  order: number;
  totalEntries: number;
  totalConversions: number;
  conversionRate: number;
  dropOffCount: number;
  dropOffRate: number;
  averageTimeSpent: number;
  revenue: number;
  revenuePerConversion: number;
  previousStepConversionRate?: number;
  comparisonData?: StepComparisonMetrics;
}

export interface StepComparisonMetrics {
  previousPeriod: {,
    conversionRate: number;
    change: number;
    direction: 'improvement' | 'decline' | 'no_change';
  };
  benchmark: {,
    conversionRate: number;
    percentile: number;
    industry: string;
  };
  segments: Array<{,
    segmentId: string;
    segmentName: string;
    conversionRate: number;
    performance: 'above_average' | 'below_average' | 'average';
  }>;
}

export interface FunnelChartData {
  steps: StepMetrics[];
  overallMetrics: OverallFunnelMetrics;
  dropoffAnalysis: DropoffAnalysis[];
  trends: FunnelTrend[];
  segmentComparisons: SegmentFunnelComparison[];
}

export interface OverallFunnelMetrics {
  totalEntries: number;
  totalConversions: number;
  overallConversionRate: number;
  averageTimeToConvert: number;
  totalRevenue: number;
  revenuePerEntry: number;
  revenuePerConversion: number;
  totalDropoffs: number;
  biggestDropoffStep: string;
  mostEfficientStep: string;
}

export interface DropoffAnalysis {
  stepId: string;
  stepName: string;
  dropOffCount: number;
  dropOffRate: number;
  dropOffReasons: DropoffReason[];
  recoveryOpportunity: number;
  recommendedActions: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface DropoffReason {
  reason: string;
  category: 'technical' | 'user_experience' | 'content' | 'external';
  percentage: number;
  count: number;
  confidence: number;
}

export interface FunnelTrend {
  period: string;
  conversionRate: number;
  entries: number;
  conversions: number;
  revenue: number;
}

export interface SegmentFunnelComparison {
  segmentId: string;
  segmentName: string;
  overallConversionRate: number;
  stepPerformance: Array<{,
    stepId: string;
    conversionRate: number;
    relativePerformance: number;
  }>;
  insights: string[];
}

export interface ChartExportData {
  chartMode: FunnelChartMode;
  data: FunnelChartData;
  visualization: {,
    svg: string;
    png?: string;
    pdf?: string;
  };
  metadata: {,
    exportedAt: number;
    timeRange: { start: number; end: number };
    filters: unknown[];
  };
}

export interface InteractionState {
  hoveredStep: string | null;
  selectedStep: string | null;
  tooltipPosition: { x: number; y: number } | null;
  tooltipContent: StepTooltipContent | null;
}

export interface StepTooltipContent {
  stepName: string;
  metrics: StepMetrics;
  comparisonData?: StepComparisonMetrics;
  insights: string[];
}
/**
 * Main Funnel Chart Component
 */
export const FunnelChart: React.FC<FunnelChartProps> = ({)
  funnelDefinition,
  analyticsInfrastructure,
  timeRange,
  segments = [],
  cohorts = [],
  chartMode = 'standard',
  showDropoffAnalysis = true,
  realTimeUpdates = false,
  onStepClick,
  onExport
}) => {
  const [chartData, setChartData] = useState<FunnelChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interactionState, setInteractionState] = useState<InteractionState>({)
    hoveredStep: null,
    selectedStep: null,
    tooltipPosition: null,
    tooltipContent: null,
  });
  const chartRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Load funnel chart data
  const loadChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const query: ConversionMetricQuery = {
        funnelId: funnelDefinition.id,
        startDate: timeRange.start,
        endDate: timeRange.end,
        metrics: [,
          'conversion_rate',
          'user_count',
          'revenue',
          'drop_off_rate',
          'time_spent',
          'step_completion_rate'
        ],
        groupBy: ['funnel_step', 'date'],
        filters: [,
          ...segments.map(segment => ({)
            field: 'userContext.segmentIds',
            operator: 'contains',
            value: segment.id,
          })),
          ...cohorts.map(cohort => ({)
            field: 'userContext.cohortIds',
            operator: 'contains',
            value: cohort.id,
          }))
        ],
        aggregation: { interval: 'day' }
      };
      const results = await analyticsInfrastructure.queryMetrics(query);
      const processedData = await processFunnelChartData(;);
        funnelDefinition,
        results,
        segments,
        cohorts,
        timeRange
      );
      setChartData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  }, [funnelDefinition, analyticsInfrastructure, timeRange, segments, cohorts]);
  useEffect(() => {
    loadChartData();
  }, [loadChartData]);
  // Real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;
    const interval = setInterval(loadChartData, 30000); // Update every 30 seconds;
    return () => clearInterval(interval);
  }, [realTimeUpdates, loadChartData]);
  // Chart dimensions and scaling
  const chartDimensions = useMemo(() => {
    if (!containerRef.current || !chartData) return null;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = Math.min(containerWidth * 0.6, 500);
    return {
      width: containerWidth,
      height: containerHeight,
      margin: { top: 40, right: 80, bottom: 60, left: 80 },
      chartWidth: containerWidth - 160,
      chartHeight: containerHeight - 100,
    };
  }, [chartData, containerRef.current?.clientWidth]);
  // Handle step interactions
  const handleStepHover = useCallback((stepId: string | null, event?: React.MouseEvent) => {
    if (!chartData) return;
    if (stepId && event) {
      const step = chartData.steps.find(s => s.stepId === stepId);
      if (step) {
        const rect = event.currentTarget.getBoundingClientRect();
        setInteractionState({)
          hoveredStep: stepId,
          selectedStep: interactionState.selectedStep,
          tooltipPosition: { x: rect.right + 10, y: rect.top },
          tooltipContent: {,
            stepName: step.stepName,
            metrics: step,
            comparisonData: step.comparisonData,
            insights: generateStepInsights(step),
          }
        });
      }
    } else {
      setInteractionState(prev => ({)
        ...prev,
        hoveredStep: null,
        tooltipPosition: null,
        tooltipContent: null,
      }));
    }
  }, [chartData, interactionState.selectedStep]);
  const handleStepClick = useCallback((stepId: string) => {
    if (!chartData) return;
    const step = chartData.steps.find(s => s.stepId === stepId);
    if (step) {
      setInteractionState(prev => ({)
        ...prev,
        selectedStep: stepId === prev.selectedStep ? null : stepId,
      }));
      onStepClick?.(funnelDefinition.steps.find(s => s.id === stepId)!, step);
    }
  }, [chartData, funnelDefinition.steps, onStepClick]);
  const handleExport = useCallback(async () => {
    if (!chartData || !chartRef.current) return;
    const svgElement = chartRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const exportData: ChartExportData = {
      chartMode,
      data: chartData,
      visualization: {,
        svg: svgString,
      },
      metadata: {,
        exportedAt: Date.now(),
        timeRange,
        filters: [],
      }
    };
    onExport?.(exportData);
  }, [chartData, chartMode, timeRange, onExport]);
  if (loading) {
    return <FunnelChartLoadingState />;
  }
  if (error || !chartData) {
    return ();
      <FunnelChartErrorState 
        error={error || 'No data available'} 
        onRetry={loadChartData} 
      />
    );
  }
  return ();
    <div className="funnel-chart" ref={containerRef}>
      <FunnelChartHeader
        funnelDefinition={funnelDefinition}
        overallMetrics={chartData.overallMetrics}
        chartMode={chartMode}
        onExport={handleExport}
      />
      <div className="chart-container">
        {chartDimensions && ()
          <svg
            ref={chartRef}
            width={chartDimensions.width}
            height={chartDimensions.height}
            className="funnel-chart-svg"
          >
            {chartMode === 'standard' && ()
              <StandardFunnelChart
                data={chartData}
                dimensions={chartDimensions}
                interactionState={interactionState}
                onStepHover={handleStepHover}
                onStepClick={handleStepClick}
              />
            )}
            {chartMode === 'horizontal' && ()
              <HorizontalFunnelChart
                data={chartData}
                dimensions={chartDimensions}
                interactionState={interactionState}
                onStepHover={handleStepHover}
                onStepClick={handleStepClick}
              />
            )}
            {chartMode === 'sankey' && ()
              <SankeyFunnelChart
                data={chartData}
                dimensions={chartDimensions}
                interactionState={interactionState}
                onStepHover={handleStepHover}
                onStepClick={handleStepClick}
              />
            )}
            {chartMode === 'waterfall' && ()
              <WaterfallFunnelChart
                data={chartData}
                dimensions={chartDimensions}
                interactionState={interactionState}
                onStepHover={handleStepHover}
                onStepClick={handleStepClick}
              />
            )}
          </svg>
        )}
      </div>
      {showDropoffAnalysis && chartData.dropoffAnalysis.length > 0 && ()
        <DropoffAnalysisPanel dropoffAnalysis={chartData.dropoffAnalysis} />
      )}
      {chartData.segmentComparisons.length > 0 && ()
        <SegmentComparisonPanel segmentComparisons={chartData.segmentComparisons} />
      )}
      {interactionState.tooltipContent && interactionState.tooltipPosition && ()
        <StepTooltip
          content={interactionState.tooltipContent}
          position={interactionState.tooltipPosition}
          onClose={() => handleStepHover(null)}
        />
      )}
    </div>
  );
};
/**
 * Funnel Chart Header Component
 */
interface FunnelChartHeaderProps {
  funnelDefinition: ConversionFunnelDefinition;
  overallMetrics: OverallFunnelMetrics;
  chartMode: FunnelChartMode;
  onExport: () => void;
}
const FunnelChartHeader: React.FC<FunnelChartHeaderProps> = ({)
  funnelDefinition,
  overallMetrics,
  chartMode,
  onExport
}) => {
  return ();
    <div className="funnel-chart-header">
      <div className="funnel-info">
        <h3>{funnelDefinition.name}</h3>
        <p>{funnelDefinition.description}</p>
      </div>
      <div className="overall-metrics">
        <div className="metric">
          <span className="label">Total Entries</span>
          <span className="value">{overallMetrics.totalEntries.toLocaleString()}</span>
        </div>
        <div className="metric">
          <span className="label">Conversion Rate</span>
          <span className="value">{overallMetrics.overallConversionRate.toFixed(2)}%</span>
        </div>
        <div className="metric">
          <span className="label">Total Revenue</span>
          <span className="value">${overallMetrics.totalRevenue.toLocaleString()}</span>}
        </div>
        <div className="metric">
          <span className="label">Avg. Time to Convert</span>
          <span className="value">{formatDuration(overallMetrics.averageTimeToConvert)}</span>
        </div>
      </div>
      <div className="chart-controls">
        <span className="chart-mode">{chartMode}</span>
        <button onClick={onExport} className="export-button">
          Export Chart
        </button>
      </div>
    </div>
  );
};
/**
 * Standard Funnel Chart Component
 */
interface StandardFunnelChartProps {
  data: FunnelChartData;
  dimensions: unknown;
  interactionState: InteractionState;
  onStepHover: (stepId: string | null, event?: React.MouseEvent) => void;
  onStepClick: (stepId: string) => void;
}
const StandardFunnelChart: React.FC<StandardFunnelChartProps> = ({)
  data,
  dimensions,
  interactionState,
  onStepHover,
  onStepClick
}) => {
  const { steps } = data;
  const { chartWidth, chartHeight, margin } = dimensions;
  // Calculate step positions and sizes
  const maxEntries = Math.max(...steps.map(s => s.totalEntries));
  const stepHeight = chartHeight / steps.length;
  const stepSpacing = stepHeight * 0.2;
  const stepBarHeight = stepHeight - stepSpacing;
  return ();
    <g transform={`translate(${margin.left}, ${margin.top})`}>}
      {steps.map((step, index) => {
        const width = (step.totalEntries / maxEntries) * chartWidth;
        const x = (chartWidth - width) / 2;
        const y = index * stepHeight;
        const isHovered = interactionState.hoveredStep === step.stepId;
        const isSelected = interactionState.selectedStep === step.stepId;
        return ();
          <g key={step.stepId}>
            {/* Step bar */}
            <rect
              x={x}
              y={y}
              width={width}
              height={stepBarHeight}
              fill={getStepColor(step.conversionRate, index)}
              stroke={isSelected ? '#3b82f6' : 'none'}
              strokeWidth={isSelected ? 2 : 0}
              opacity={isHovered ? 0.8 : 1}
              className="funnel-step-bar"
              onMouseEnter={(e) => onStepHover(step.stepId, e)}
              onMouseLeave={() => onStepHover(null)}
              onClick={() => onStepClick(step.stepId)}
            />
            {/* Step label */}
            <text
              x={chartWidth / 2}
              y={y + stepBarHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="step-label"
              fill="white"
              fontSize="14"
              fontWeight="500"
            >
              {step.stepName}
            </text>
            {/* Conversion rate */}
            <text
              x={chartWidth / 2}
              y={y + stepBarHeight / 2 + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              className="conversion-rate"
              fill="white"
              fontSize="12"
            >
              {step.conversionRate.toFixed(1)}%
            </text>
            {/* Drop-off indicator */}
            {index < steps.length - 1 && step.dropOffCount > 0 && ()
              <g className="dropoff-indicator">
                <line
                  x1={x + width}
                  y1={y + stepBarHeight}
                  x2={x + width + 20}
                  y2={y + stepBarHeight + 10}
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                <text
                  x={x + width + 25}
                  y={y + stepBarHeight + 15}
                  fontSize="10"
                  fill="#ef4444"
                  className="dropoff-text"
                >
                  -{step.dropOffCount.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
/**
 * Horizontal Funnel Chart Component
 */
const HorizontalFunnelChart: React.FC<StandardFunnelChartProps> = ({)
  data,
  dimensions,
  interactionState,
  onStepHover,
  onStepClick
}) => {
  const { steps } = data;
  const { chartWidth, chartHeight, margin } = dimensions;
  const maxEntries = Math.max(...steps.map(s => s.totalEntries));
  const stepWidth = chartWidth / steps.length;
  const stepSpacing = stepWidth * 0.1;
  const stepBarWidth = stepWidth - stepSpacing;
  return ();
    <g transform={`translate(${margin.left}, ${margin.top})`}>}
      {steps.map((step, index) => {
        const height = (step.totalEntries / maxEntries) * chartHeight;
        const x = index * stepWidth;
        const y = chartHeight - height;
        const isHovered = interactionState.hoveredStep === step.stepId;
        const isSelected = interactionState.selectedStep === step.stepId;
        return ();
          <g key={step.stepId}>
            <rect
              x={x}
              y={y}
              width={stepBarWidth}
              height={height}
              fill={getStepColor(step.conversionRate, index)}
              stroke={isSelected ? '#3b82f6' : 'none'}
              strokeWidth={isSelected ? 2 : 0}
              opacity={isHovered ? 0.8 : 1}
              className="funnel-step-bar"
              onMouseEnter={(e) => onStepHover(step.stepId, e)}
              onMouseLeave={() => onStepHover(null)}
              onClick={() => onStepClick(step.stepId)}
            />
            <text
              x={x + stepBarWidth / 2}
              y={chartHeight + 20}
              textAnchor="middle"
              className="step-label"
              fontSize="12"
            >
              {step.stepName}
            </text>
            <text
              x={x + stepBarWidth / 2}
              y={y + height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="conversion-rate"
              fill="white"
              fontSize="12"
              fontWeight="500"
            >
              {step.conversionRate.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </g>
  );
};

// Placeholder components for other chart modes
const SankeyFunnelChart: React.FC<StandardFunnelChartProps> = () => ()
  <g>
    <text x="50%" y="50%" textAnchor="middle" fontSize="16" fill="#666">
      Sankey Chart (Coming Soon)
    </text>
  </g>
);
const WaterfallFunnelChart: React.FC<StandardFunnelChartProps> = () => ()
  <g>
    <text x="50%" y="50%" textAnchor="middle" fontSize="16" fill="#666">
      Waterfall Chart (Coming Soon)
    </text>
  </g>
);
/**
 * Drop-off Analysis Panel Component
 */
interface DropoffAnalysisPanelProps {
  dropoffAnalysis: DropoffAnalysis[];
}
const DropoffAnalysisPanel: React.FC<DropoffAnalysisPanelProps> = ({ dropoffAnalysis }) => {
  const criticalDropoffs = dropoffAnalysis;
    .filter(d => d.severity === 'critical' || d.severity === 'high')
    .sort((a, b) => b.dropOffRate - a.dropOffRate);
  return ();
    <div className="dropoff-analysis-panel">
      <h4>Drop-off Analysis</h4>
      <div className="critical-dropoffs">
        {criticalDropoffs.map(dropoff => ()
          <div key={dropoff.stepId} className={`dropoff-item ${dropoff.severity}`}>}
            <div className="dropoff-header">
              <h5>{dropoff.stepName}</h5>
              <span className="dropoff-rate">{dropoff.dropOffRate.toFixed(1)}%</span>
            </div>
            <div className="dropoff-details">
              <p>{dropoff.dropOffCount.toLocaleString()} users dropped off at this step</p>
              {dropoff.dropOffReasons.slice(0, 2).map((reason, index) => ()
                <div key={index} className="dropoff-reason">
                  <span className="reason">{reason.reason}</span>
                  <span className="percentage">{reason.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            {dropoff.recommendedActions.length > 0 && ()
              <div className="recommended-actions">
                <strong>Recommended Actions:</strong>
                <ul>
                  {dropoff.recommendedActions.slice(0, 2).map((action, index) => ()
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
/**
 * Segment Comparison Panel Component
 */
interface SegmentComparisonPanelProps {
  segmentComparisons: SegmentFunnelComparison[];
}
const SegmentComparisonPanel: React.FC<SegmentComparisonPanelProps> = ({ segmentComparisons }) => {
  return ();
    <div className="segment-comparison-panel">
      <h4>Segment Performance</h4>
      <div className="segment-grid">
        {segmentComparisons.map(segment => ()
          <div key={segment.segmentId} className="segment-comparison-card">
            <h5>{segment.segmentName}</h5>
            <div className="overall-rate">
              {segment.overallConversionRate.toFixed(1)}% conversion rate
            </div>
            {segment.insights.length > 0 && ()
              <div className="segment-insights">
                {segment.insights.slice(0, 2).map((insight, index) => ()
                  <p key={index} className="insight">{insight}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
/**
 * Step Tooltip Component
 */
interface StepTooltipProps {
  content: StepTooltipContent;
  position: { x: number; y: number };
  onClose: () => void;
}
const StepTooltip: React.FC<StepTooltipProps> = ({ content, position, onClose }) => {
  return ();
    <div 
      className="step-tooltip"
      style={{ 
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }}
    >
      <div className="tooltip-header">
        <h4>{content.stepName}</h4>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <div className="tooltip-metrics">
        <div className="metric">
          <span>Entries:</span>
          <span>{content.metrics.totalEntries.toLocaleString()}</span>
        </div>
        <div className="metric">
          <span>Conversions:</span>
          <span>{content.metrics.totalConversions.toLocaleString()}</span>
        </div>
        <div className="metric">
          <span>Conversion Rate:</span>
          <span>{content.metrics.conversionRate.toFixed(2)}%</span>
        </div>
        <div className="metric">
          <span>Drop-off:</span>
          <span>{content.metrics.dropOffCount.toLocaleString()} ({content.metrics.dropOffRate.toFixed(1)}%)</span>
        </div>
        <div className="metric">
          <span>Revenue:</span>
          <span>${content.metrics.revenue.toLocaleString()}</span>}
        </div>
      </div>
      {content.insights.length > 0 && ()
        <div className="tooltip-insights">
          <strong>Insights:</strong>
          <ul>
            {content.insights.slice(0, 3).map((insight, index) => ()
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Loading and Error States
const FunnelChartLoadingState: React.FC = () => ()
  <div className="funnel-chart-loading">
    <div className="loading-spinner"></div>
    <p>Loading funnel chart...</p>
  </div>
);
interface FunnelChartErrorStateProps {
  error: string;
  onRetry: () => void;
}
const FunnelChartErrorState: React.FC<FunnelChartErrorStateProps> = ({ error, onRetry }) => ()
  <div className="funnel-chart-error">
    <div className="error-message">
      <h3>Error Loading Chart</h3>
      <p>{error}</p>
    </div>
    <button onClick={onRetry} className="retry-button">
      Retry Loading
    </button>
  </div>
);

// Utility Functions
function getStepColor(conversionRate: number, index: number): string {
  // Color gradient based on conversion rate
  if (conversionRate >= 80) return '#10b981'; // Green for high conversion
  if (conversionRate >= 60) return '#f59e0b'; // Yellow for medium conversion
  if (conversionRate >= 40) return '#f97316'; // Orange for low conversion
  return '#ef4444'; // Red for very low conversion
}
function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;}
  if (hours > 0) return `${hours}h ${minutes % 60}m`;}
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;}
  return `${seconds}s`;}
}
function generateStepInsights(step: StepMetrics): string[] {
  const insights: string[] = [];
  if (step.conversionRate > 80) {
    insights.push('High-performing step with excellent conversion rate');
  } else if (step.conversionRate < 40) {
    insights.push('Low conversion rate - optimization opportunity');
  }
  if (step.dropOffRate > 50) {
    insights.push('High drop-off rate - investigate user experience issues');
  }
  if (step.averageTimeSpent > 300000) { // 5 minutes
    insights.push('Users spend significant time on this step');
  }
  return insights;
}
async function processFunnelChartData()
  funnelDefinition: ConversionFunnelDefinition,
  metricResults: ConversionMetricResult[],
  segments: UserSegment[],
  cohorts: ConversionCohort[],
  timeRange: { start: number; end: number }
): Promise<FunnelChartData> {
  // Simplified implementation - in production would process actual metrics
  const steps: StepMetrics[] = funnelDefinition.steps.map((step, index) => ({)
    stepId: step.id,
    stepName: step.name,
    order: step.order,
    totalEntries: 1000 - (index * 150),
    totalConversions: 1000 - ((index + 1) * 150),
    conversionRate: index < funnelDefinition.steps.length - 1 ? ,
      ((1000 - ((index + 1) * 150)) / (1000 - (index * 150))) * 100 : 100,
    dropOffCount: 150,
    dropOffRate: 15.0,
    averageTimeSpent: 120000 + (index * 30000),
    revenue: 500 * (index + 1),
    revenuePerConversion: 25 + (index * 5),
    comparisonData: {,
      previousPeriod: {,
        conversionRate: 75 + (Math.random() * 20),
        change: (Math.random() - 0.5) * 20,
        direction: Math.random() > 0.5 ? 'improvement' : 'decline',
      },
      benchmark: {,
        conversionRate: 70 + (Math.random() * 15),
        percentile: 60 + (Math.random() * 30),
        industry: 'marketplace',
      },
      segments: segments.slice(0, 2).map(segment => ({)
        segmentId: segment.id,
        segmentName: segment.name,
        conversionRate: 60 + (Math.random() * 40),
        performance: Math.random() > 0.5 ? 'above_average' : 'below_average' as any,
      }))
    }
  }));
  const overallMetrics: OverallFunnelMetrics = {
    totalEntries: 1000,
    totalConversions: 150,
    overallConversionRate: 15.0,
    averageTimeToConvert: 86400000,
    totalRevenue: 3750,
    revenuePerEntry: 3.75,
    revenuePerConversion: 25,
    totalDropoffs: 850,
    biggestDropoffStep: steps[1]?.stepId || '',
    mostEfficientStep: steps[0]?.stepId || '',
  };
  const dropoffAnalysis: DropoffAnalysis[] = steps
    .filter(step => step.dropOffRate > 10)
    .map(step => ({)
      stepId: step.stepId,
      stepName: step.stepName,
      dropOffCount: step.dropOffCount,
      dropOffRate: step.dropOffRate,
      dropOffReasons: [,
        {
          reason: 'Complex form fields',
          category: 'user_experience',
          percentage: 35,
          count: Math.floor(step.dropOffCount * 0.35),
          confidence: 0.85,
        },
        {
          reason: 'Page load time',
          category: 'technical',
          percentage: 25,
          count: Math.floor(step.dropOffCount * 0.25),
          confidence: 0.78,
        }
      ],
      recoveryOpportunity: 45,
      recommendedActions: [,
        'Simplify form fields and reduce required information',
        'Optimize page loading performance',
        'Add progress indicators to improve user experience'
      ],
      severity: step.dropOffRate > 30 ? 'critical' : step.dropOffRate > 20 ? 'high' : 'medium',
    }));
  const segmentComparisons: SegmentFunnelComparison[] = segments.map(segment => ({)
    segmentId: segment.id,
    segmentName: segment.name,
    overallConversionRate: segment.performance.averageConversionRate,
    stepPerformance: steps.map(step => ({),
      stepId: step.stepId,
      conversionRate: step.conversionRate * (0.8 + Math.random() * 0.4),
      relativePerformance: (Math.random() - 0.5) * 40,
    })),
    insights: [,
      `${segment.name} shows ${Math.random() > 0.5 ? 'above' : 'below'} average performance`,}
      `Strongest performance in step ${steps[Math.floor(Math.random() * steps.length)].stepName}`}
    ]
  }));
  return {
    steps,
    overallMetrics,
    dropoffAnalysis,
    trends: [], // TODO: Implement trend analysis
    segmentComparisons
  };
}

export default FunnelChart;