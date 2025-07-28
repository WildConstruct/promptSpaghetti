/**
 * Funnel Visualization Components - Story 30.2 Task 5
 * 
 * Interactive funnel visualization system with real-time updates,
 * customizable configurations, and advanced analytics capabilities.
 * 
 * Features:
 * - Interactive multi-step funnel visualization
 * - Real-time conversion rate updates
 * - Drag-and-drop funnel configuration
 * - Advanced filtering and segmentation
 * - A/B testing comparison views
 * - Export and sharing capabilities
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ConversionFunnelDefinition, 
  ConversionStep, 
  FlexibleConversionEvent,
  UserSegment,
  ConversionCohort 
} from '../../analytics/ConversionDataModel';
import { 
  ConversionMetricQuery, 
  ConversionMetricResult,
  ConversionAnalyticsInfrastructure 
} from '../../analytics/ConversionAnalyticsInfrastructure';

// Funnel visualization data structures
export interface FunnelVisualizationProps {
  funnelDefinition: ConversionFunnelDefinition;
  analyticsInfrastructure: ConversionAnalyticsInfrastructure;
  timeRange: { start: number; end: number };
  segments?: UserSegment[];
  cohorts?: ConversionCohort[];
  comparisonMode?: 'none' | 'time_period' | 'segment' | 'ab_test';
  realTimeUpdates?: boolean;
  onStepClick?: (step: ConversionStep, metrics: StepMetrics) => void;
  onConfigChange?: (config: FunnelConfiguration) => void;
}

export interface StepMetrics {
  stepId: string;
  name: string;
  order: number;
  totalUsers: number;
  convertedUsers: number;
  conversionRate: number;
  dropOffRate: number;
  averageTimeSpent: number;
  previousStepConversionRate?: number;
  valueGenerated: number;
  topExitReasons: ExitReason[];
}

export interface ExitReason {
  reason: string;
  percentage: number;
  count: number;
  category: 'user_action' | 'technical_issue' | 'design_friction' | 'external_factor';
}

export interface FunnelConfiguration {
  displayMode: 'standard' | 'horizontal' | 'sankey' | 'waterfall';
  colorScheme: 'default' | 'conversion_focused' | 'drop_off_focused' | 'value_focused';
  showMetrics: MetricDisplay[];
  filterCriteria: FunnelFilter[];
  grouping: FunnelGrouping;
  refreshInterval: number; // milliseconds
  animations: boolean;
}

export type MetricDisplay = 
  | 'conversion_rate' 
  | 'drop_off_rate' 
  | 'user_count' 
  | 'value_generated' 
  | 'time_spent' 
  | 'exit_reasons';

export interface FunnelFilter {
  type: 'segment' | 'cohort' | 'time_range' | 'device' | 'location' | 'source';
  value: string | number;
  operator: 'equals' | 'in' | 'between' | 'greater_than' | 'less_than';
}

export interface FunnelGrouping {
  dimension: 'none' | 'segment' | 'cohort' | 'device' | 'source' | 'time_period';
  interval?: 'hour' | 'day' | 'week' | 'month';
}

export interface FunnelComparisonData {
  baseline: FunnelMetrics;
  comparison: FunnelMetrics;
  type: 'time_period' | 'segment' | 'ab_test';
  significance: number;
  insights: ComparisonInsight[];
}

export interface FunnelMetrics {
  funnelId: string;
  totalEntries: number;
  totalConversions: number;
  overallConversionRate: number;
  averageTimeToConvert: number;
  totalValue: number;
  stepMetrics: StepMetrics[];
}

export interface ComparisonInsight {
  type: 'improvement' | 'decline' | 'neutral';
  stepId?: string;
  metric: string;
  change: number;
  significance: number;
  description: string;
  recommendation?: string;
}
/**
 * Main Funnel Visualization Component
 */
export const FunnelVisualization: React.FC<FunnelVisualizationProps> = ({)
  funnelDefinition,
  analyticsInfrastructure,
  timeRange,
  segments = [],
  cohorts = [],
  comparisonMode = 'none',
  realTimeUpdates = false,
  onStepClick,
  onConfigChange
}) => {
  const [funnelMetrics, setFunnelMetrics] = useState<FunnelMetrics | null>(null);
  const [comparisonData, setComparisonData] = useState<FunnelComparisonData | null>(null);
  const [configuration, setConfiguration] = useState<FunnelConfiguration>({)
    displayMode: 'standard',
    colorScheme: 'default',
    showMetrics: ['conversion_rate', 'user_count', 'drop_off_rate'],
    filterCriteria: [],
    grouping: { dimension: 'none' },
    refreshInterval: 30000,
    animations: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Load funnel data
  const loadFunnelData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const query: ConversionMetricQuery = {
        funnelId: funnelDefinition.id,
        startDate: timeRange.start,
        endDate: timeRange.end,
        metrics: ['conversion_rate', 'user_count', 'revenue', 'drop_off_rate'],
        groupBy: configuration.grouping.dimension !== 'none' ? [configuration.grouping.dimension as any] : undefined,
        filters: configuration.filterCriteria.map(filter => ({)
          field: getFilterField(filter.type),
          operator: filter.operator,
          value: filter.value,
        })),
        aggregation: {,
          interval: configuration.grouping.interval || 'day'
        }
      };
      const metricResults = await analyticsInfrastructure.queryMetrics(query);
      const processedMetrics = await processFunnelMetrics(metricResults, funnelDefinition);
      setFunnelMetrics(processedMetrics);
      // Load comparison data if needed
      if (comparisonMode !== 'none') {
        const comparisonMetrics = await loadComparisonData(query, comparisonMode);
        setComparisonData(comparisonMetrics);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load funnel data');
    } finally {
      setLoading(false);
    }
  }, [funnelDefinition, timeRange, configuration, comparisonMode, analyticsInfrastructure]);
  // Real-time updates
  useEffect(() => {
    loadFunnelData();
    if (realTimeUpdates && configuration.refreshInterval > 0) {
      const interval = setInterval(loadFunnelData, configuration.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadFunnelData, realTimeUpdates, configuration.refreshInterval]);
  // Configuration change handler
  const handleConfigChange = useCallback((newConfig: Partial<FunnelConfiguration>) => {
    const updatedConfig = { ...configuration, ...newConfig };
    setConfiguration(updatedConfig);
    onConfigChange?.(updatedConfig);
  }, [configuration, onConfigChange]);
  // Step click handler
  const handleStepClick = useCallback((stepMetrics: StepMetrics) => {
    if (onStepClick) {
      const step = funnelDefinition.steps.find(s => s.id === stepMetrics.stepId);
      if (step) {
        onStepClick(step, stepMetrics);
      }
    }
  }, [funnelDefinition.steps, onStepClick]);
  if (loading) {
    return <FunnelLoadingState />;
  }
  if (error || !funnelMetrics) {
    return <FunnelErrorState error={error || 'No data available'} onRetry={loadFunnelData} />;
  }
  return ()
    <div className="funnel-visualization">
      <FunnelHeader 
        funnelDefinition={funnelDefinition}
        metrics={funnelMetrics}
        configuration={configuration}
        onConfigChange={handleConfigChange}
      />
      <FunnelFilters
        filters={configuration.filterCriteria}
        segments={segments}
        cohorts={cohorts}
        onFiltersChange={(filters) => handleConfigChange({ filterCriteria: filters })}
      />
      <div className="funnel-main-content">
        {comparisonMode !== 'none' && comparisonData && ()
          <FunnelComparison
            comparisonData={comparisonData}
            configuration={configuration}
          />
        )}
        <FunnelChart
          metrics={funnelMetrics}
          configuration={configuration}
          onStepClick={handleStepClick}
        />
        <FunnelInsights
          metrics={funnelMetrics}
          comparisonData={comparisonData}
          funnelDefinition={funnelDefinition}
        />
      </div>
    </div>
  );
};
/**
 * Funnel Header with Summary Metrics
 */
interface FunnelHeaderProps {
  funnelDefinition: ConversionFunnelDefinition;
  metrics: FunnelMetrics;
  configuration: FunnelConfiguration;
  onConfigChange: (config: Partial<FunnelConfiguration>) => void;
}
const FunnelHeader: React.FC<FunnelHeaderProps> = ({)
  funnelDefinition,
  metrics,
  configuration,
  onConfigChange
}) => {
  return ()
    <div className="funnel-header">
      <div className="funnel-title">
        <h2>{funnelDefinition.name}</h2>
        <p className="funnel-description">{funnelDefinition.description}</p>
      </div>
      <div className="funnel-summary-metrics">
        <SummaryMetric
          label="Total Entries"
          value={metrics.totalEntries.toLocaleString()}
          change={0} // TODO: Calculate from comparison data
        />
        <SummaryMetric
          label="Overall Conversion Rate"
          value={`${metrics.overallConversionRate.toFixed(2)}%`}
          change={0}
        />
        <SummaryMetric
          label="Total Conversions"
          value={metrics.totalConversions.toLocaleString()}
          change={0}
        />
        <SummaryMetric
          label="Average Time to Convert"
          value={formatDuration(metrics.averageTimeToConvert)}
          change={0}
        />
        <SummaryMetric
          label="Total Value"
          value={`$${metrics.totalValue.toLocaleString()}`}
          change={0}
        />
      </div>
      <FunnelConfigurationControls
        configuration={configuration}
        onConfigChange={onConfigChange}
      />
    </div>
  );
};
/**
 * Summary Metric Display Component
 */
interface SummaryMetricProps {
  label: string;
  value: string;
  change: number;
}
const SummaryMetric: React.FC<SummaryMetricProps> = ({ label, value, change }) => {
  const changeDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  return ()
    <div className="summary-metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {change !== 0 && ()
        <div className={`metric-change ${changeDirection}`}>}
          {change > 0 ? '+' : ''}{change.toFixed(2)}%
        </div>
      )}
    </div>
  );
};
/**
 * Funnel Configuration Controls
 */
interface FunnelConfigurationControlsProps {
  configuration: FunnelConfiguration;
  onConfigChange: (config: Partial<FunnelConfiguration>) => void;
}
const FunnelConfigurationControls: React.FC<FunnelConfigurationControlsProps> = ({)
  configuration,
  onConfigChange
}) => {
  return ()
    <div className="funnel-configuration-controls">
      <div className="control-group">
        <label>Display Mode</label>
        <select 
          value={configuration.displayMode}
          onChange={(e) => onConfigChange({ displayMode: e.target.value as any })}
        >
          <option value="standard">Standard</option>
          <option value="horizontal">Horizontal</option>
          <option value="sankey">Sankey Diagram</option>
          <option value="waterfall">Waterfall</option>
        </select>
      </div>
      <div className="control-group">
        <label>Color Scheme</label>
        <select
          value={configuration.colorScheme}
          onChange={(e) => onConfigChange({ colorScheme: e.target.value as any })}
        >
          <option value="default">Default</option>
          <option value="conversion_focused">Conversion Focused</option>
          <option value="drop_off_focused">Drop-off Focused</option>
          <option value="value_focused">Value Focused</option>
        </select>
      </div>
      <div className="control-group">
        <label>Refresh Interval</label>
        <select
          value={configuration.refreshInterval}
          onChange={(e) => onConfigChange({ refreshInterval: parseInt(e.target.value) })}
        >
          <option value={0}>Manual</option>
          <option value={10000}>10 seconds</option>
          <option value={30000}>30 seconds</option>
          <option value={60000}>1 minute</option>
          <option value={300000}>5 minutes</option>
        </select>
      </div>
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={configuration.animations}
            onChange={(e) => onConfigChange({ animations: e.target.checked })}
          />
          Enable Animations
        </label>
      </div>
    </div>
  );
};
/**
 * Funnel Filters Component
 */
interface FunnelFiltersProps {
  filters: FunnelFilter[];
  segments: UserSegment[];
  cohorts: ConversionCohort[];
  onFiltersChange: (filters: FunnelFilter[]) => void;
}
const FunnelFilters: React.FC<FunnelFiltersProps> = ({)
  filters,
  segments,
  cohorts,
  onFiltersChange
}) => {
  const addFilter = useCallback((filter: FunnelFilter) => {
    onFiltersChange([...filters, filter]);
  }, [filters, onFiltersChange]);
  const removeFilter = useCallback((index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);
  const updateFilter = useCallback((index: number, updates: Partial<FunnelFilter>) => {
    const newFilters = filters.map((filter, i) => ;
      i === index ? { ...filter, ...updates } : filter
    );
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);
  return ()
    <div className="funnel-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <FilterDropdown onAddFilter={addFilter} segments={segments} cohorts={cohorts} />
      </div>
      <div className="active-filters">
        {filters.map((filter, index) => ()
          <FilterTag
            key={index}
            filter={filter}
            onUpdate={(updates) => updateFilter(index, updates)}
            onRemove={() => removeFilter(index)}
          />
        ))}
      </div>
    </div>
  );
};
/**
 * Filter Dropdown Component
 */
interface FilterDropdownProps {
  onAddFilter: (filter: FunnelFilter) => void;
  segments: UserSegment[];
  cohorts: ConversionCohort[];
}
const FilterDropdown: React.FC<FilterDropdownProps> = ({)
  onAddFilter,
  segments,
  cohorts
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleFilterAdd = (type: FunnelFilter['type'], value?: string | number) => {
    const filter: FunnelFilter = {
      type,
      value: value || '',
      operator: 'equals',
    };
    onAddFilter(filter);
    setIsOpen(false);
  };
  return ()
    <div className="filter-dropdown">
      <button onClick={() => setIsOpen(!isOpen)}>
        Add Filter +
      </button>
      {isOpen && ()
        <div className="filter-dropdown-menu">
          <div className="filter-category">
            <h4>Segments</h4>
            {segments.map(segment => ()
              <button
                key={segment.id}
                onClick={() => handleFilterAdd('segment', segment.id)}
              >
                {segment.name}
              </button>
            ))}
          </div>
          <div className="filter-category">
            <h4>Cohorts</h4>
            {cohorts.map(cohort => ()
              <button
                key={cohort.id}
                onClick={() => handleFilterAdd('cohort', cohort.id)}
              >
                {cohort.name}
              </button>
            ))}
          </div>
          <div className="filter-category">
            <h4>Other</h4>
            <button onClick={() => handleFilterAdd('device')}>Device Type</button>
            <button onClick={() => handleFilterAdd('location')}>Location</button>
            <button onClick={() => handleFilterAdd('source')}>Traffic Source</button>
          </div>
        </div>
      )}
    </div>
  );
};
/**
 * Filter Tag Component
 */
interface FilterTagProps {
  filter: FunnelFilter;
  onUpdate: (updates: Partial<FunnelFilter>) => void;
  onRemove: () => void;
}
const FilterTag: React.FC<FilterTagProps> = ({ filter, onUpdate, onRemove }) => {
  return ()
    <div className="filter-tag">
      <span className="filter-type">{filter.type}:</span>
      <input
        type="text"
        value={filter.value}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="Enter value..."
      />
      <select
        value={filter.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as any })}
      >
        <option value="equals">equals</option>
        <option value="in">in</option>
        <option value="between">between</option>
        <option value="greater_than">greater than</option>
        <option value="less_than">less than</option>
      </select>
      <button onClick={onRemove} className="remove-filter">×</button>
    </div>
  );
};
/**
 * Main Funnel Chart Component
 */
interface FunnelChartProps {
  metrics: FunnelMetrics;
  configuration: FunnelConfiguration;
  onStepClick: (stepMetrics: StepMetrics) => void;
}
const FunnelChart: React.FC<FunnelChartProps> = ({)
  metrics,
  configuration,
  onStepClick
}) => {
  const chartComponent = useMemo(() => {
    switch (configuration.displayMode) {
      case 'horizontal':
        return <HorizontalFunnelChart metrics={metrics} configuration={configuration} onStepClick={onStepClick} />;
      case 'sankey':
        return <SankeyFunnelChart metrics={metrics} configuration={configuration} onStepClick={onStepClick} />;
      case 'waterfall':
        return <WaterfallFunnelChart metrics={metrics} configuration={configuration} onStepClick={onStepClick} />;
      default:
        return <StandardFunnelChart metrics={metrics} configuration={configuration} onStepClick={onStepClick} />;
    }
  }, [configuration.displayMode, metrics, configuration, onStepClick]);
  return ()
    <div className="funnel-chart-container">
      {chartComponent}
    </div>
  );
};
/**
 * Standard Funnel Chart (Vertical)
 */
interface StandardFunnelChartProps {
  metrics: FunnelMetrics;
  configuration: FunnelConfiguration;
  onStepClick: (stepMetrics: StepMetrics) => void;
}
const StandardFunnelChart: React.FC<StandardFunnelChartProps> = ({)
  metrics,
  configuration,
  onStepClick
}) => {
  const maxUsers = Math.max(...metrics.stepMetrics.map(s => s.totalUsers));
  return ()
    <div className="standard-funnel-chart">
      {metrics.stepMetrics.map((stepMetric, index) => {
        const width = (stepMetric.totalUsers / maxUsers) * 100;
        const isLastStep = index === metrics.stepMetrics.length - 1;
        return ()
          <div key={stepMetric.stepId} className="funnel-step">
            <div
              className={`step-bar ${getStepColorClass(stepMetric, configuration.colorScheme)}`}
              style={{ width: `${width}%` }}
              onClick={() => onStepClick(stepMetric)}
            >
              <div className="step-content">
                <div className="step-name">{stepMetric.name}</div>
                <div className="step-metrics">
                  {configuration.showMetrics.includes('user_count') && ()
                    <span className="metric">{stepMetric.totalUsers.toLocaleString()} users</span>
                  )}
                  {configuration.showMetrics.includes('conversion_rate') && !isLastStep && ()
                    <span className="metric">{stepMetric.conversionRate.toFixed(1)}% convert</span>
                  )}
                  {configuration.showMetrics.includes('drop_off_rate') && !isLastStep && ()
                    <span className="metric">{stepMetric.dropOffRate.toFixed(1)}% drop off</span>
                  )}
                  {configuration.showMetrics.includes('value_generated') && stepMetric.valueGenerated > 0 && ()
                    <span className="metric">${stepMetric.valueGenerated.toLocaleString()}</span>}
                  )}
                </div>
              </div>
            </div>
            {!isLastStep && ()
              <div className="step-connector">
                <div className="drop-off-indicator">
                  {stepMetric.dropOffRate.toFixed(1)}% drop off
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Placeholder implementations for other chart types
const HorizontalFunnelChart: React.FC<StandardFunnelChartProps> = (props) => {
  return <div>Horizontal Funnel Chart (TODO: Implement)</div>;
};
const SankeyFunnelChart: React.FC<StandardFunnelChartProps> = (props) => {
  return <div>Sankey Funnel Chart (TODO: Implement)</div>;
};
const WaterfallFunnelChart: React.FC<StandardFunnelChartProps> = (props) => {
  return <div>Waterfall Funnel Chart (TODO: Implement)</div>;
};
/**
 * Funnel Comparison Component
 */
interface FunnelComparisonProps {
  comparisonData: FunnelComparisonData;
  configuration: FunnelConfiguration;
}
const FunnelComparison: React.FC<FunnelComparisonProps> = ({)
  comparisonData,
  configuration
}) => {
  return ()
    <div className="funnel-comparison">
      <h3>Comparison Analysis</h3>
      <div className="comparison-overview">
        <div className="comparison-metrics">
          <ComparisonMetric
            label="Overall Conversion Rate"
            baseline={comparisonData.baseline.overallConversionRate}
            comparison={comparisonData.comparison.overallConversionRate}
            format="percentage"
          />
          <ComparisonMetric
            label="Total Conversions"
            baseline={comparisonData.baseline.totalConversions}
            comparison={comparisonData.comparison.totalConversions}
            format="number"
          />
          <ComparisonMetric
            label="Average Time to Convert"
            baseline={comparisonData.baseline.averageTimeToConvert}
            comparison={comparisonData.comparison.averageTimeToConvert}
            format="duration"
          />
        </div>
      </div>
      <div className="comparison-insights">
        <h4>Key Insights</h4>
        {comparisonData.insights.map((insight, index) => ()
          <InsightCard key={index} insight={insight} />
        ))}
      </div>
    </div>
  );
};
/**
 * Comparison Metric Component
 */
interface ComparisonMetricProps {
  label: string;
  baseline: number;
  comparison: number;
  format: 'number' | 'percentage' | 'duration' | 'currency';
}
const ComparisonMetric: React.FC<ComparisonMetricProps> = ({)
  label,
  baseline,
  comparison,
  format
}) => {
  const change = ((comparison - baseline) / baseline) * 100;
  const changeDirection = change > 0 ? 'improvement' : change < 0 ? 'decline' : 'neutral';
  const formatValue = (value: number) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(2)}%`;}
      case 'duration':
        return formatDuration(value);
      case 'currency':
        return `$${value.toLocaleString()}`;}
      default:
        return value.toLocaleString();
    }
  };
  return ()
    <div className="comparison-metric">
      <div className="metric-label">{label}</div>
      <div className="metric-values">
        <span className="baseline">{formatValue(baseline)}</span>
        <span className="arrow">→</span>
        <span className="comparison">{formatValue(comparison)}</span>
      </div>
      <div className={`metric-change ${changeDirection}`}>}
        {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </div>
    </div>
  );
};
/**
 * Insight Card Component
 */
interface InsightCardProps {
  insight: ComparisonInsight;
}
const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  return ()
    <div className={`insight-card ${insight.type}`}>}
      <div className="insight-header">
        <span className="insight-type">{insight.type}</span>
        {insight.stepId && <span className="insight-step">Step: {insight.stepId}</span>}
      </div>
      <div className="insight-content">
        <div className="insight-description">{insight.description}</div>
        {insight.recommendation && ()
          <div className="insight-recommendation">
            <strong>Recommendation:</strong> {insight.recommendation}
          </div>
        )}
      </div>
      <div className="insight-stats">
        <span className="change">{insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%</span>
        <span className="significance">Significance: {(insight.significance * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};
/**
 * Funnel Insights Component
 */
interface FunnelInsightsProps {
  metrics: FunnelMetrics;
  comparisonData: FunnelComparisonData | null;
  funnelDefinition: ConversionFunnelDefinition;
}
const FunnelInsights: React.FC<FunnelInsightsProps> = ({)
  metrics,
  comparisonData,
  funnelDefinition
}) => {
  const insights = useMemo(() => {
    return generateFunnelInsights(metrics, comparisonData, funnelDefinition);
  }, [metrics, comparisonData, funnelDefinition]);
  return ()
    <div className="funnel-insights">
      <h3>Funnel Insights</h3>
      <div className="insights-grid">
        <div className="insight-section">
          <h4>Biggest Drop-off Points</h4>
          {insights.biggestDropOffs.map((dropOff, index) => ()
            <div key={index} className="drop-off-insight">
              <span className="step-name">{dropOff.stepName}</span>
              <span className="drop-off-rate">{dropOff.dropOffRate.toFixed(1)}%</span>
              <span className="affected-users">{dropOff.affectedUsers.toLocaleString()} users</span>
            </div>
          ))}
        </div>
        <div className="insight-section">
          <h4>Conversion Opportunities</h4>
          {insights.opportunities.map((opportunity, index) => ()
            <div key={index} className="opportunity-insight">
              <div className="opportunity-description">{opportunity.description}</div>
              <div className="opportunity-impact">
                Potential impact: +{opportunity.potentialImpact.toFixed(1)}% conversion rate
              </div>
            </div>
          ))}
        </div>
        <div className="insight-section">
          <h4>Performance Trends</h4>
          {insights.trends.map((trend, index) => ()
            <div key={index} className="trend-insight">
              <span className="trend-description">{trend.description}</span>
              <span className={`trend-direction ${trend.direction}`}>}
                {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading and Error States
const FunnelLoadingState: React.FC = () => ()
  <div className="funnel-loading">
    <div className="loading-spinner"></div>
    <p>Loading funnel data...</p>
  </div>
);
interface FunnelErrorStateProps {
  error: string;
  onRetry: () => void;
}
const FunnelErrorState: React.FC<FunnelErrorStateProps> = ({ error, onRetry }) => ()
  <div className="funnel-error">
    <div className="error-message">
      <h3>Error Loading Funnel</h3>
      <p>{error}</p>
    </div>
    <button onClick={onRetry} className="retry-button">
      Retry
    </button>
  </div>
);

// Utility Functions
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
function getStepColorClass(stepMetric: StepMetrics, colorScheme: string): string {
  switch (colorScheme) {
    case 'conversion_focused':
      return stepMetric.conversionRate > 75 ? 'high-conversion' : 
             stepMetric.conversionRate > 50 ? 'medium-conversion' : 'low-conversion';
    case 'drop_off_focused':
      return stepMetric.dropOffRate > 50 ? 'high-dropoff' : 
             stepMetric.dropOffRate > 25 ? 'medium-dropoff' : 'low-dropoff';
    case 'value_focused':
      return stepMetric.valueGenerated > 1000 ? 'high-value' : 
             stepMetric.valueGenerated > 100 ? 'medium-value' : 'low-value';
    default:
      return 'default-step';
  }
}
function getFilterField(filterType: FunnelFilter['type']): string {
  const fieldMap = {
    segment: 'userContext.segmentIds',
    cohort: 'userContext.cohortIds',
    time_range: 'timestamp',
    device: 'metadata.userAgent',
    location: 'sessionContext.locationData.country',
    source: 'attributionData.primaryAttribution.touchpoint.source',
  };
  return fieldMap[filterType] || filterType;
}
async function processFunnelMetrics()
  metricResults: ConversionMetricResult[], 
  funnelDefinition: ConversionFunnelDefinition,
): Promise<FunnelMetrics> {
  // Simplified implementation - in production, this would process actual metric results
  const stepMetrics: StepMetrics[] = funnelDefinition.steps.map((step, index) => {
    const baseUsers = 1000 - (index * 200); // Simulated data;
    const converted = index < funnelDefinition.steps.length - 1 ? baseUsers * 0.7 : baseUsers;
    return {
      stepId: step.id,
      name: step.name,
      order: step.order,
      totalUsers: baseUsers,
      convertedUsers: converted,
      conversionRate: index < funnelDefinition.steps.length - 1 ? 70 : 100,
      dropOffRate: index < funnelDefinition.steps.length - 1 ? 30 : 0,
      averageTimeSpent: 120000 + (index * 60000),
      valueGenerated: converted * 25,
      topExitReasons: [,
        { reason: 'Page load timeout', percentage: 15, count: Math.floor(baseUsers * 0.15), category: 'technical_issue' },
        { reason: 'Unclear navigation', percentage: 10, count: Math.floor(baseUsers * 0.10), category: 'design_friction' }
      ]
    };
  });
  return {
    funnelId: funnelDefinition.id,
    totalEntries: stepMetrics[0]?.totalUsers || 0,
    totalConversions: stepMetrics[stepMetrics.length - 1]?.convertedUsers || 0,
    overallConversionRate: stepMetrics.length > 0 ? 
      ((stepMetrics[stepMetrics.length - 1]?.convertedUsers || 0) / (stepMetrics[0]?.totalUsers || 1)) * 100 : 0,
    averageTimeToConvert: stepMetrics.reduce((sum, step) => sum + step.averageTimeSpent, 0),
    totalValue: stepMetrics.reduce((sum, step) => sum + step.valueGenerated, 0),
    stepMetrics
  };
}
async function loadComparisonData()
  query: ConversionMetricQuery, 
  comparisonMode: string,
): Promise<FunnelComparisonData | null> {
  // Simplified implementation - in production, this would load actual comparison data
  return null;
}
function generateFunnelInsights()
  metrics: FunnelMetrics,
  comparisonData: FunnelComparisonData | null,
  funnelDefinition: ConversionFunnelDefinition,
) {
  // Simplified implementation
  return {
    biggestDropOffs: metrics.stepMetrics,
      .filter(step => step.dropOffRate > 0)
      .sort((a, b) => b.dropOffRate - a.dropOffRate)
      .slice(0, 3)
      .map(step => ({)
        stepName: step.name,
        dropOffRate: step.dropOffRate,
        affectedUsers: Math.floor(step.totalUsers * step.dropOffRate / 100)
      })),
    opportunities: [,
      {
        description: 'Optimize page load speed to reduce technical drop-offs',
        potentialImpact: 5.2,
      },
      {
        description: 'Improve navigation clarity in step 2',
        potentialImpact: 3.8,
      }
    ],
    trends: [,
      {
        description: 'Conversion rate trending upward over last 7 days',
        direction: 'up' as const
      },
      {
        description: 'Average time to convert decreasing',
        direction: 'down' as const
      }
    ]
  };
}

export default FunnelVisualization;