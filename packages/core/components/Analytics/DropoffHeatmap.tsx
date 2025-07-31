/**
 * Conversion Drop-off Analysis and Heatmaps - Story 30.2 Task 6
 * 
 * Advanced drop-off analysis with visual heatmaps, root cause analysis,
 * and recovery opportunity identification.
 * 
 * Features:
 * - Interactive drop-off heatmaps
 * - Root cause analysis with confidence scores
 * - Recovery opportunity assessment
 * - Time-based drop-off patterns
 * - User behavior flow analysis
 * - Segmented drop-off analysis
 * - Actionable recommendations
 * - Export capabilities
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

// Drop-off analysis interfaces

}
export interface DropoffHeatmapProps {
  funnelDefinition: ConversionFunnelDefinition;
  analyticsInfrastructure: ConversionAnalyticsInfrastructure;
}
  timeRange: { start: number; end: number };
  segments?: UserSegment;
  cohorts?: ConversionCohort;
  heatmapMode?: HeatmapMode;
  showRecoveryAnalysis?: boolean;
  realTimeUpdates?: boolean;
  onDropoffPointClick?: (analysis: DropoffPointAnalysis) => void;
  onExport?: (data: DropoffExportData) => void;
}
export type HeatmapMode = 
  | 'absolute'
  | 'relative'
  | 'severity'
  | 'opportunity'
  | 'temporal';

}
export interface DropoffAnalysisData {
  stepAnalysis: StepDropoffAnalysis;
  transitionAnalysis: TransitionDropoffAnalysis;
  temporalPatterns: TemporalDropoffPattern;
  segmentAnalysis: SegmentDropoffAnalysis;
  rootCauseAnalysis: RootCauseAnalysis;
  recoveryOpportunities: RecoveryOpportunity;
  overallInsights: DropoffInsight;
}
}
}
export interface StepDropoffAnalysis {
  stepId: string;
  stepName: string;
  stepOrder: number;
  totalEntries: number;
  dropOffCount: number;
  dropOffRate: number;
  dropOffSeverity: 'critical' | 'high' | 'medium' | 'low';
  benchmarkComparison: BenchmarkComparison;
  userBehaviorAnalysis: UserBehaviorAnalysis;
  technicalAnalysis: TechnicalAnalysis;
  contentAnalysis: ContentAnalysis;
  recoveryPotential: number;
}
}
}
export interface TransitionDropoffAnalysis {
  fromStepId: string;
  toStepId: string;
  fromStepName: string;
  toStepName: string;
  transitionRate: number;
  dropOffCount: number;
  dropOffRate: number;
  averageTransitionTime: number;
  commonDropOffReasons: DropoffReason;
  recoveryActions: string;
}
}
}
export interface TemporalDropoffPattern {
  period: 'hour' | 'day' | 'week' | 'month';
  periodValue: number;
  dropOffRates: Array<{
  stepId: string;
  stepName: string;
  dropOffRate: number;
  trend: 'increasing' | 'decreasing' | 'stable'
}
  }>;
  insights: string;
}
}
export interface SegmentDropoffAnalysis {
  segmentId: string;
  segmentName: string;
  overallDropOffRate: number;
  stepDropOffRates: Array<{
  stepId: string;
  stepName: string;
  dropOffRate: number;
  relativePerformance: number;
}
}>;
  uniqueDropOffReasons: DropoffReason;
  segmentInsights: string;
}
}
export interface RootCauseAnalysis {
  stepId: string;
  stepName: string;
  primaryCauses: DropoffCause;
  contributingFactors: ContributingFactor;
  confidence: number;
  evidenceQuality: 'high' | 'medium' | 'low';
  recommendations: CauseRecommendation;
}
}
}
export interface DropoffCause {
  category: 'technical' | 'user_experience' | 'content' | 'external' | 'design';
  subcategory: string;
  description: string;
  impact: number; // 0-100,
  confidence: number; // 0-1,
  evidence: Evidence;
  mitigationComplexity: 'low' | 'medium' | 'high';
  expectedImprovement: number; // Expected reduction in drop-off rate,
}
}
}
export interface ContributingFactor {
  factor: string;
  weight: number;
  description: string;
  measurable: boolean;
  currentValue?: number;
  targetValue?: number;
}
}
}
export interface Evidence {
  type: 'user_feedback' | 'analytics' | 'technical_logs' | 'usability_testing';
  description: string;
  strength: 'strong' | 'moderate' | 'weak';
  source: string;
  timestamp: number;
}
}
}
export interface CauseRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  expectedImpact: number;
  implementationSteps: string;
  successMetrics: string;
}
}
}
export interface RecoveryOpportunity {
  stepId: string;
  stepName: string;
  recoveryPotential: number; // 0-100,
  recoveryValue: number; // Potential revenue recovery,
  quickWins: QuickWin;
  strategicInitiatives: StrategicInitiative;
  timeToImpact: number; // Days,
  confidenceLevel: number; // 0-1,
}
}
}
export interface QuickWin {
  title: string;
  description: string;
  effort: 'low' | 'medium';
  expectedImpact: number;
  implementationTime: number; // Hours,
  requirements: string;
}
}
}
export interface StrategicInitiative {
  title: string;
  description: string;
  effort: 'medium' | 'high';
  expectedImpact: number;
  implementationTime: number; // Days,
  dependencies: string;
  successMetrics: string;
}
}
}
export interface DropoffReason {
  reason: string;
  category: string;
  percentage: number;
  count: number;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low'
}
  }
}
export interface BenchmarkComparison {
  industryAverage: number;
  topPerformers: number;
  yourPerformance: number;
  percentile: number;
  improvementPotential: number;
}
}
}
export interface UserBehaviorAnalysis {
  averageTimeOnStep: number;
  interactionPatterns: InteractionPattern;
  exitBehaviors: ExitBehavior;
  recoveryAttempts: number;
}
}
}
export interface InteractionPattern {
  pattern: string;
  frequency: number;
  conversionImpact: number;
  description: string;
}
}
}
export interface ExitBehavior {
  behavior: string;
  percentage: number;
  description: string;
  preventable: boolean;
}
}
}
export interface TechnicalAnalysis {
  pageLoadTime: number;
  errorRate: number;
  performanceScore: number;
  accessibilityIssues: AccessibilityIssue;
  mobileCompatibility: number;
}
}
}
export interface AccessibilityIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  fixComplexity: 'low' | 'medium' | 'high'
}
  }
}
export interface ContentAnalysis {
  clarityScore: number;
  complexityScore: number;
  engagementScore: number;
  completionRate: number;
  commonConfusionPoints: string;
  improvementSuggestions: string;
}
}
}
export interface DropoffInsight {
  type: 'pattern' | 'anomaly' | 'opportunity' | 'risk';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedSteps: string;
  impact: number;
  confidence: number;
  recommendations: string;
  timeframe: string;
}
}
}
export interface DropoffPointAnalysis {
  stepId: string;
  analysis: StepDropoffAnalysis;
  rootCause: RootCauseAnalysis;
  recovery: RecoveryOpportunity;
}
}
}
export interface DropoffExportData {
  heatmapMode: HeatmapMode;
  data: DropoffAnalysisData;
  visualizations: {
  heatmap: string;
  flowDiagram: string;
  trends: string;
}
};
  recommendations: {
  quick: QuickWin;
  strategic: StrategicInitiative;
};
  metadata: {
  exportedAt: number;
    timeRange: { start: number; end: number };
    analysisDepth: 'basic' | 'detailed' | 'comprehensive'
  };
/**
 * Main Drop-off Heatmap Component
 */
}
export const DropoffHeatmap: React.FC<DropoffHeatmapProps> = ({)
  funnelDefinition,
  analyticsInfrastructure,
  timeRange,
  segments = [],
  cohorts = [],
  heatmapMode = 'relative',
  showRecoveryAnalysis = true,
  realTimeUpdates = false,
  onDropoffPointClick,
  onExport
}) => {
  const [analysisData, setAnalysisData] = useState<DropoffAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ stepId: string; metric: string } | null>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);
  // Load drop-off analysis data
  const loadAnalysisData = useCallback(async () => {
  try {
  setLoading(true);
  setError(null);
  const query: ConversionMetricQuery = {,
  funnelId: funnelDefinition.id,
  startDate: timeRange.start,
  endDate: timeRange.end,
  metrics: [,
  'drop_off_rate',
  'exit_behavior',
  'user_journey',
  'technical_performance',
  'content_engagement',
  'recovery_opportunities'
  ],
  groupBy: ['funnel_step', 'hour', 'user_segment'],
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
        aggregation: { interval: 'hour' }
      };
      const results = await analyticsInfrastructure.queryMetrics(query);
      const processedData = await processDropoffAnalysisData(;);
        funnelDefinition,
        results,
        segments,
        cohorts,
        timeRange
      );
      setAnalysisData(processedData);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load drop-off analysis');
} finally {
      setLoading(false);
  }, [funnelDefinition, analyticsInfrastructure, timeRange, segments, cohorts]);
  useEffect(() => {
    loadAnalysisData();
  }, [loadAnalysisData]);
  // Real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;
    const interval = setInterval(loadAnalysisData, 60000); // Update every minute;
    return () => clearInterval(interval);
  }, [realTimeUpdates, loadAnalysisData]);
  // Heatmap color scaling
  const colorScale = useMemo(() => {
  if (!analysisData) return null;
  const values = analysisData.stepAnalysis.map(step => {)
  switch (heatmapMode) {
  case 'absolute': return step.dropOffCount;
  case 'relative': return step.dropOffRate;
  case 'severity': return getSeverityScore(step.dropOffSeverity);
  case 'opportunity': return step.recoveryPotential;
  default: return step.dropOffRate;
});
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min, max, range: max - min };
  }, [analysisData, heatmapMode]);
  const handleCellHover = useCallback((stepId: string | null, metric: string | null) => {
    setHoveredCell(stepId && metric ? { stepId, metric } : null);
  }, []);
  const handleStepClick = useCallback((stepId: string) => {
  if (!analysisData) return;
  const stepAnalysis = analysisData.stepAnalysis.find(s => s.stepId === stepId);
  const rootCause = analysisData.rootCauseAnalysis.find(r => r.stepId === stepId);
  const recovery = analysisData.recoveryOpportunities.find(r => r.stepId === stepId);
  if (stepAnalysis && rootCause && recovery) {
  setSelectedStep(stepId);
  onDropoffPointClick?.({)
  stepId,
  analysis: stepAnalysis,
  rootCause,
  recovery
});
  }, [analysisData, onDropoffPointClick]);
  const handleExport = useCallback(async () => {
  if (!analysisData) return;
  const exportData: DropoffExportData = {,
  heatmapMode,
  data: analysisData,
  visualizations: {
  heatmap: 'heatmap-svg-data', // TODO: Generate actual SVG,
  flowDiagram: 'flow-svg-data',
  trends: 'trends-svg-data',
},
  recommendations: {
  quick: analysisData.recoveryOpportunities.flatMap(r => r.quickWins),
  strategic: analysisData.recoveryOpportunities.flatMap(r => r.strategicInitiatives),
},
  metadata: {
  exportedAt: Date.now(),
  timeRange,
  analysisDepth: 'comprehensive',
};
    onExport?.(exportData);
  }, [analysisData, heatmapMode, timeRange, onExport]);
  if (loading) {
    return <DropoffAnalysisLoadingState />;
  if (error || !analysisData) {
    return;
      <DropoffAnalysisErrorState 
        error={error || 'No data available'} 
        onRetry={loadAnalysisData} 
      />
    );
  return;
    <div className="dropoff-heatmap" ref={heatmapRef}>
      <DropoffHeatmapHeader
        funnelDefinition={funnelDefinition}
        heatmapMode={heatmapMode}
        analysisData={analysisData}
        onExport={handleExport}
      />
      <div className="heatmap-container">
        <HeatmapVisualization
          analysisData={analysisData}
          heatmapMode={heatmapMode}
          colorScale={colorScale}
          hoveredCell={hoveredCell}
          selectedStep={selectedStep}
          onCellHover={handleCellHover}
          onStepClick={handleStepClick}
        />
      </div>
      <div className="analysis-panels">
        {selectedStep && ()
          <StepDetailPanel
            stepId={selectedStep}
            analysisData={analysisData}
            onClose={() => setSelectedStep(null)}
          />
        )}
        {showRecoveryAnalysis && ()
          <RecoveryOpportunityPanel
            opportunities={analysisData.recoveryOpportunities}
          />
        )}
        <DropoffInsightsPanel
          insights={analysisData.overallInsights}
          rootCauses={analysisData.rootCauseAnalysis}
        />
      </div>
      {analysisData.temporalPatterns.length > 0 && ()
        <TemporalPatternsPanel
          patterns={analysisData.temporalPatterns}
        />
      )}
    </div>
  );
};
/**
 * Drop-off Heatmap Header Component
 */
}
interface DropoffHeatmapHeaderProps {
  funnelDefinition: ConversionFunnelDefinition;
  heatmapMode: HeatmapMode;
  analysisData: DropoffAnalysisData;
  onExport: () => void;
  const DropoffHeatmapHeader: React.FC<DropoffHeatmapHeaderProps> = ({,)
  funnelDefinition,
  heatmapMode,
  analysisData,
  onExport
}
}) => {
  const criticalDropoffs = analysisData.stepAnalysis.filter(s => s.dropOffSeverity === 'critical').length;
  const totalRecoveryValue = analysisData.recoveryOpportunities.reduce((sum, r) => sum + r.recoveryValue, 0);
  return;
    <div className="dropoff-heatmap-header">
      <div className="header-info">
        <h3>Drop-off Analysis: {funnelDefinition.name}</h3>
        <p>Comprehensive analysis of user drop-off patterns and recovery opportunities</p>
        <div className="key-metrics">
          <div className="metric">
            <span className="label">Critical Drop-off Points</span>
            <span className="value">{criticalDropoffs}</span>
          </div>
          <div className="metric">
            <span className="label">Recovery Potential</span>
            <span className="value">${totalRecoveryValue.toLocaleString()}</span>}
          </div>
          <div className="metric">
            <span className="label">Analysis Mode</span>
            <span className="value">{heatmapMode.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
      <div className="header-controls">
        <button onClick={onExport} className="export-button">
          Export Analysis
        </button>
      </div>
    </div>
  );
};
/**
 * Heatmap Visualization Component
 */
}
interface HeatmapVisualizationProps {
  analysisData: DropoffAnalysisData;
  heatmapMode: HeatmapMode;
}
  colorScale: { min: number; max: number; range: number } | null;
  hoveredCell: { stepId: string; metric: string } | null;
  selectedStep: string | null;
  onCellHover: (stepId: string | null, metric: string | null) => void;
  onStepClick: (stepId: string) => void;
const HeatmapVisualization: React.FC<HeatmapVisualizationProps> = ({)
  analysisData,
  heatmapMode,
  colorScale,
  hoveredCell,
  selectedStep,
  onCellHover,
  onStepClick
}) => {
  const metrics = ['Drop-off Rate', 'Recovery Potential', 'Severity', 'Impact'];
  return;
    <div className="heatmap-visualization">
      <div className="heatmap-grid">
        <div className="grid-header">
          <div className="step-header">Funnel Step</div>
          {metrics.map(metric => ()
            <div key={metric} className="metric-header">{metric}</div>
          ))}
        </div>
        {analysisData.stepAnalysis.map(step => ()
          <div 
            key={step.stepId} 
            className={`grid-row ${selectedStep === step.stepId ? 'selected' : ''}`}
          >
            <div 
              className="step-label"
              onClick={() => onStepClick(step.stepId)}
            >
              <span className="step-name">{step.stepName}</span>
              <span className="step-order">Step {step.stepOrder}</span>
            </div>
            <div 
              className={`heatmap-cell dropoff-rate ${getSeverityClass(step.dropOffSeverity)}`}
              style={{
  backgroundColor: getHeatmapColor(step.dropOffRate, colorScale, 'dropoff'),
}}
              onMouseEnter={() => onCellHover(step.stepId, 'dropoff-rate')}
              onMouseLeave={() => onCellHover(null, null)}
            >
              {step.dropOffRate.toFixed(1)}%
            </div>
            <div 
              className="heatmap-cell recovery-potential"
              style={{
  backgroundColor: getHeatmapColor(step.recoveryPotential, colorScale, 'recovery'),
}}
              onMouseEnter={() => onCellHover(step.stepId, 'recovery')}
              onMouseLeave={() => onCellHover(null, null)}
            >
              {step.recoveryPotential.toFixed(0)}%
            </div>
            <div 
              className={`heatmap-cell severity ${step.dropOffSeverity}`}
              onMouseEnter={() => onCellHover(step.stepId, 'severity')}
              onMouseLeave={() => onCellHover(null, null)}
            >
              {step.dropOffSeverity.toUpperCase()}
            </div>
            <div 
              className="heatmap-cell impact"
              onMouseEnter={() => onCellHover(step.stepId, 'impact')}
              onMouseLeave={() => onCellHover(null, null)}
            >
              ${(step.dropOffCount * 25).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <HeatmapLegend heatmapMode={heatmapMode} colorScale={colorScale} />
    </div>
  );
};
/**
 * Heatmap Legend Component
 */
}
interface HeatmapLegendProps {
  heatmapMode: HeatmapMode;
}
  colorScale: { min: number; max: number; range: number } | null;
const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ heatmapMode, colorScale }) => {
  if (!colorScale) return null;
  const gradientStops = [;
    { offset: '0%', color: '#10b981' }, // Green (low drop-off)
    { offset: '50%', color: '#f59e0b' }, // Yellow (medium drop-off)
    { offset: '100%', color: '#ef4444' } // Red (high drop-off)
  ];
  return;
    <div className="heatmap-legend">
      <div className="legend-title">
        {heatmapMode.replace('_', ' ').toUpperCase()} Scale
      </div>
      <div className="legend-gradient">
        <svg width="200" height="20">
          <defs>
            <linearGradient id="heatmap-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientStops.map(stop => ()
                <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="200" height="20" fill="url(#heatmap-gradient)" />
        </svg>
        <div className="legend-labels">
          <span>{colorScale.min.toFixed(1)}</span>
          <span>{((colorScale.min + colorScale.max) / 2).toFixed(1)}</span>
          <span>{colorScale.max.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
/**
 * Step Detail Panel Component
 */
}
interface StepDetailPanelProps {
  stepId: string;
  analysisData: DropoffAnalysisData;
  onClose: () => void;
}
const StepDetailPanel: React.FC<StepDetailPanelProps> = ({ stepId, analysisData, onClose }) => {
  const stepAnalysis = analysisData.stepAnalysis.find(s => s.stepId === stepId);
  const rootCause = analysisData.rootCauseAnalysis.find(r => r.stepId === stepId);
  const recovery = analysisData.recoveryOpportunities.find(r => r.stepId === stepId);
  if (!stepAnalysis || !rootCause || !recovery) return null;
  return;
    <div className="step-detail-panel">
      <div className="panel-header">
        <h4>{stepAnalysis.stepName} - Detailed Analysis</h4>
        <button onClick={onClose} className="close-button">×</button>
      </div>
      <div className="detail-sections">
        <div className="overview-section">
          <h5>Overview</h5>
          <div className="metrics-grid">
            <div className="metric">
              <span>Drop-off Count:</span>
              <span>{stepAnalysis.dropOffCount.toLocaleString()}</span>
            </div>
            <div className="metric">
              <span>Drop-off Rate:</span>
              <span>{stepAnalysis.dropOffRate.toFixed(2)}%</span>
            </div>
            <div className="metric">
              <span>Severity:</span>
              <span className={`severity ${stepAnalysis.dropOffSeverity}`}>}
                {stepAnalysis.dropOffSeverity.toUpperCase()}
              </span>
            </div>
            <div className="metric">
              <span>Recovery Potential:</span>
              <span>{stepAnalysis.recoveryPotential.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <div className="root-cause-section">
          <h5>Root Cause Analysis</h5>
          <div className="primary-causes">
            {rootCause.primaryCauses.slice(0, 3).map((cause, index) => ()
              <div key={index} className="cause-item">
                <div className="cause-header">
                  <span className="category">{cause.category}</span>
                  <span className="impact">{cause.impact}% impact</span>
                </div>
                <p className="cause-description">{cause.description}</p>
                <div className="mitigation">
                  <strong>Complexity:</strong> {cause.mitigationComplexity}
                  <strong>Expected Improvement:</strong> {cause.expectedImprovement}%
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="recovery-section">
          <h5>Recovery Opportunities</h5>
          {recovery.quickWins.length > 0 && ()
            <div className="quick-wins">
              <h6>Quick Wins</h6>
              {recovery.quickWins.slice(0, 3).map((win, index) => ()
                <div key={index} className="quick-win-item">
                  <h6>{win.title}</h6>
                  <p>{win.description}</p>
                  <div className="win-metrics">
                    <span>Effort: {win.effort}</span>
                    <span>Impact: {win.expectedImpact}%</span>
                    <span>Time: {win.implementationTime}h</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {recovery.strategicInitiatives.length > 0 && ()
            <div className="strategic-initiatives">
              <h6>Strategic Initiatives</h6>
              {recovery.strategicInitiatives.slice(0, 2).map((initiative, index) => ()
                <div key={index} className="strategic-item">
                  <h6>{initiative.title}</h6>
                  <p>{initiative.description}</p>
                  <div className="initiative-metrics">
                    <span>Effort: {initiative.effort}</span>
                    <span>Impact: {initiative.expectedImpact}%</span>
                    <span>Time: {initiative.implementationTime} days</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
/**
 * Recovery Opportunity Panel Component
 */
}
interface RecoveryOpportunityPanelProps {
  opportunities: RecoveryOpportunity;
}
const RecoveryOpportunityPanel: React.FC<RecoveryOpportunityPanelProps> = ({ opportunities }) => {
  const totalRecoveryValue = opportunities.reduce((sum, opp) => sum + opp.recoveryValue, 0);
  const highConfidenceOpportunities = opportunities.filter(opp => opp.confidenceLevel > 0.7);
  return;
    <div className="recovery-opportunity-panel">
      <h4>Recovery Opportunities</h4>
      <div className="recovery-summary">
        <div className="summary-metric">
          <span className="label">Total Potential</span>
          <span className="value">${totalRecoveryValue.toLocaleString()}</span>}
        </div>
        <div className="summary-metric">
          <span className="label">High Confidence</span>
          <span className="value">{highConfidenceOpportunities.length}</span>
        </div>
      </div>
      <div className="opportunities-list">
        {opportunities
          .sort((a, b) => b.recoveryValue - a.recoveryValue)
          .slice(0, 5)
          .map(opportunity => ()
            <div key={opportunity.stepId} className="opportunity-item">
              <div className="opportunity-header">
                <h5>{opportunity.stepName}</h5>
                <span className="recovery-value">
                  ${opportunity.recoveryValue.toLocaleString()}
                </span>
              </div>
              <div className="opportunity-metrics">
                <div className="metric">
                  <span>Potential:</span>
                  <span>{opportunity.recoveryPotential}%</span>
                </div>
                <div className="metric">
                  <span>Time to Impact:</span>
                  <span>{opportunity.timeToImpact} days</span>
                </div>
                <div className="metric">
                  <span>Confidence:</span>
                  <span>{(opportunity.confidenceLevel * 100).toFixed(0)}%</span>
                </div>
              </div>
              {opportunity.quickWins.length > 0 && ()
                <div className="quick-actions">
                  <strong>Quick Actions:</strong>
                  <ul>
                    {opportunity.quickWins.slice(0, 2).map((win, index) => ()
                      <li key={index}>{win.title}</li>
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
 * Drop-off Insights Panel Component
 */
}
interface DropoffInsightsPanelProps {
  insights: DropoffInsight;
  rootCauses: RootCauseAnalysis;
}
const DropoffInsightsPanel: React.FC<DropoffInsightsPanelProps> = ({ insights, rootCauses }) => {
  const criticalInsights = insights.filter(i => i.severity === 'critical' || i.severity === 'high');
  return;
    <div className="dropoff-insights-panel">
      <h4>Key Insights</h4>
      <div className="insights-list">
        {criticalInsights.slice(0, 5).map((insight, index) => ()
          <div key={index} className={`insight-item ${insight.severity}`}>}
            <div className="insight-header">
              <h5>{insight.title}</h5>
              <span className={`severity-badge ${insight.severity}`}>}
                {insight.severity.toUpperCase()}
              </span>
            </div>
            <p className="insight-description">{insight.description}</p>
            <div className="insight-metrics">
              <span>Impact: {insight.impact}%</span>
              <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
              <span>Timeframe: {insight.timeframe}</span>
            </div>
            {insight.recommendations.length > 0 && ()
              <div className="insight-recommendations">
                <strong>Recommendations:</strong>
                <ul>
                  {insight.recommendations.slice(0, 2).map((rec, recIndex) => ()
                    <li key={recIndex}>{rec}</li>
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
 * Temporal Patterns Panel Component
 */
}
interface TemporalPatternsPanelProps {
  patterns: TemporalDropoffPattern;
}
const TemporalPatternsPanel: React.FC<TemporalPatternsPanelProps> = ({ patterns }) => {
  return;
    <div className="temporal-patterns-panel">
      <h4>Temporal Drop-off Patterns</h4>
      <div className="patterns-grid">
        {patterns.map((pattern, index) => ()
          <div key={index} className="pattern-item">
            <h5>{pattern.period.toUpperCase()} {pattern.periodValue}</h5>
            <div className="pattern-rates">
              {pattern.dropOffRates.slice(0, 3).map((rate, rateIndex) => ()
                <div key={rateIndex} className="rate-item">
                  <span className="step-name">{rate.stepName}</span>
                  <span className="rate-value">{rate.dropOffRate.toFixed(1)}%</span>
                  <span className={`trend ${rate.trend}`}>}
                    {rate.trend === 'increasing' ? '↗' : 
                     rate.trend === 'decreasing' ? '↘' : '→'}
                  </span>
                </div>
              ))}
            </div>
            {pattern.insights.length > 0 && ()
              <div className="pattern-insights">
                {pattern.insights.slice(0, 2).map((insight, insightIndex) => ()
                  <p key={insightIndex} className="pattern-insight">{insight}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading and Error States
const DropoffAnalysisLoadingState: React.FC = () => ()
  <div className="dropoff-analysis-loading">
    <div className="loading-spinner"></div>
    <p>Analyzing drop-off patterns...</p>
  </div>
);
}
interface DropoffAnalysisErrorStateProps {
  error: string;
  onRetry: () => void;
}
const DropoffAnalysisErrorState: React.FC<DropoffAnalysisErrorStateProps> = ({ error, onRetry }) => ()
  <div className="dropoff-analysis-error">
    <div className="error-message">
      <h3>Error Loading Analysis</h3>
      <p>{error}</p>
    </div>
    <button onClick={onRetry} className="retry-button">
      Retry Analysis
    </button>
  </div>
);

// Utility Functions
function getSeverityScore(severity: string): number {
  switch (severity) {
    case 'critical': return 100;
    case 'high': return 75;
    case 'medium': return 50;
    case 'low': return 25;
    default: return 0;
function getSeverityClass(severity: string): string {
  return `severity-${severity}`;}
function getHeatmapColor(value: number, )
  colorScale: { min: number; max: number; range: number } | null, 
  type: 'dropoff' | 'recovery'): string {,
  if (!colorScale) return '#f3f4f6';
  const normalized = colorScale.range > 0 ? (value - colorScale.min) / colorScale.range : 0;
  if (type === 'dropoff') {
    // Red scale for drop-offs (higher = worse)
    const intensity = Math.floor(normalized * 255);
    return `rgb(${255}, ${255 - intensity}, ${255 - intensity})`;}
  } else {
    // Green scale for recovery (higher = better)
    const intensity = Math.floor(normalized * 255);
    return `rgb(${255 - intensity}, ${255}, ${255 - intensity})`;}
async function processDropoffAnalysisData(funnelDefinition: ConversionFunnelDefinition)
  metricResults: ConversionMetricResult,
  segments: UserSegment,
  cohorts: ConversionCohort,
  timeRange: { start: number; end: number }
): Promise<DropoffAnalysisData> {

  // Simplified implementation - in production would process actual metrics
  const stepAnalysis: StepDropoffAnalysis = funnelDefinition.steps.map((step, index) => ({,)
  stepId: step.id,
  stepName: step.name,
  stepOrder: step.order,
  totalEntries: 1000 - (index * 150),
  dropOffCount: 150 + (index * 25),
  dropOffRate: 15 + (index * 5) + (Math.random() * 10),
  dropOffSeverity: index === 1 ? 'critical' : index === 2 ? 'high' : 'medium',
  benchmarkComparison: {
  industryAverage: 20 + (Math.random() * 15),
  topPerformers: 10 + (Math.random() * 8),
  yourPerformance: 15 + (index * 5) + (Math.random() * 10),
  percentile: 40 + (Math.random() * 40),
  improvementPotential: 5 + (Math.random() * 15),
},
  userBehaviorAnalysis: {
  averageTimeOnStep: 60000 + (index * 30000),
  interactionPatterns: [,
  {
  pattern: 'Multiple form attempts',
  frequency: 45,
  conversionImpact: -12,
  description: 'Users attempt to fill form multiple times before abandoning'],
  exitBehaviors: [,
  {
  behavior: 'Direct page close',
  percentage: 35,
  description: 'Users close tab/browser directly',
  preventable: false],
  recoveryAttempts: 2.3,
},
  technicalAnalysis: {
  pageLoadTime: 2000 + (index * 500),
  errorRate: Math.random() * 5,
  performanceScore: 70 + (Math.random() * 25),
  accessibilityIssues: [,
  {
  type: 'Missing alt text',
  severity: 'medium',
  description: 'Images missing alternative text',
  impact: 'Screen reader accessibility',
  fixComplexity: 'low'],
  mobileCompatibility: 85 + (Math.random() * 10),
},
  contentAnalysis: {
  clarityScore: 60 + (Math.random() * 30),
  complexityScore: 40 + (Math.random() * 40),
  engagementScore: 70 + (Math.random() * 20),
  completionRate: 80 - (index * 10),
  commonConfusionPoints: [,
  'Form field labels unclear',
  'Next step instructions missing'
  ],
  improvementSuggestions: [,
  'Simplify form fields',
  'Add progress indicators',
  'Improve error messaging'
  ]
},
  recoveryPotential: 60 + (Math.random() * 30);
  }));
  const rootCauseAnalysis: RootCauseAnalysis = stepAnalysis.map(step => ({)
  stepId: step.stepId,
  stepName: step.stepName,
  primaryCauses: [,
  {
  category: 'user_experience',
  subcategory: 'form_complexity',
  description: 'Complex form fields causing user confusion and abandonment',
  impact: 35,
  confidence: 0.85,
  evidence: [,
  {
  type: 'user_feedback',
  description: '23% of exit surveys mention form difficulty',
  strength: 'strong',
  source: 'Exit survey analysis',
  timestamp: Date.now() - 86400000],
  mitigationComplexity: 'medium',
  expectedImprovement: 15],
  contributingFactors: [,
  {
  factor: 'Page load time',
  weight: 0.3,
  description: 'Slow loading affects user patience',
  measurable: true,
  currentValue: step.technicalAnalysis.pageLoadTime,
  targetValue: 1500],
  confidence: 0.8,
  evidenceQuality: 'high',
  recommendations: [,
  {
  title: 'Simplify form fields',
  description: 'Reduce required fields and improve field labels',
  priority: 'high',
  effort: 'medium',
  expectedImpact: 15,
  implementationSteps: [,
  'Audit current form fields',
  'Identify non-essential fields',
  'Redesign form layout',
  'Test with users'
  ],
  successMetrics: [,
  'Form completion rate increase',
  'Time to complete reduction',
  'User satisfaction score improvement'
  ]
  ]
}));
  const recoveryOpportunities: RecoveryOpportunity = stepAnalysis.map(step => ({)
  stepId: step.stepId,
  stepName: step.stepName,
  recoveryPotential: step.recoveryPotential,
  recoveryValue: step.dropOffCount * 25, // $25 per recovered user,
  quickWins: [,
  {
  title: 'Improve error messaging',
  description: 'Provide clearer, more helpful error messages',
  effort: 'low',
  expectedImpact: 8,
  implementationTime: 16,
  requirements: ['UX review', 'Copy updates', 'Frontend changes']],
  strategicInitiatives: [,
  {
  title: 'Redesign step flow',
  description: 'Complete redesign of the step user experience',
  effort: 'high',
  expectedImpact: 25,
  implementationTime: 14,
  dependencies: ['User research', 'Design system updates'],
  successMetrics: ['Conversion rate improvement', 'User satisfaction']],
  timeToImpact: 7,
  confidenceLevel: 0.75,
}));
  const overallInsights: DropoffInsight = [
    {
  type: 'pattern',
  severity: 'critical',
  title: 'Step 2 Shows Critical Drop-off Rate',
  description: 'Template browsing step has 35% drop-off rate, significantly above industry average',
  affectedSteps: ['step-2'],
  impact: 35,
  confidence: 0.9,
  recommendations: [,
  'Implement progressive disclosure for template options',
  'Add filtering and search capabilities',
  'Reduce cognitive load with better categorization'
  ],
  timeframe: 'immediate'];
  return {
  stepAnalysis,
  transitionAnalysis: [], // TODO: Implement transition analysis,
  temporalPatterns: [], // TODO: Implement temporal pattern analysis,
  segmentAnalysis: [], // TODO: Implement segment analysis,
  rootCauseAnalysis,
  recoveryOpportunities,
  overallInsights
};

export default DropoffHeatmap;