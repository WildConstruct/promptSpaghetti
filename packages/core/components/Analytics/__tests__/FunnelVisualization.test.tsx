/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Tests for Funnel Visualization Components - Story 30.2 Task 5
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FunnelVisualization } from '../FunnelVisualization';
import { FunnelConfiguration } from '../FunnelConfiguration';
import { FunnelComparison } from '../FunnelComparison';
import { FunnelSegmentation } from '../FunnelSegmentation';
import { ConversionFunnelDefinition,
  ConversionStep,
  UserSegment }
  ConversionCohort
 from '../../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../../analytics/ConversionAnalyticsInfrastructure';

// Mock analytics infrastructure
const mockAnalyticsInfrastructure = { processConversionEvent: jest.fn().mockResolvedValue([]) }
  processBatch: jest.fn().mockResolvedValue({ totalEvents: 0, processedCount: 0, errorCount: 0, duration: 0, stageResults: [] }),
  queryMetrics: jest.fn().mockResolvedValue([]),
  getRealTimeMetrics: jest.fn().mockResolvedValue({ );
  funnelId: 'test-funnel',
  timestamp: Date.now(),
  metrics: {,
  activeUsers: 100,
  conversionsLastHour: 15,
  conversionRate: 15.0,
  averageTimeToConvert: 3600000,
  topDropOffStep: 'step-2' }
}),
  exportData: jest.fn().mockResolvedValue({ );
  exportId: 'export-123',
  status: 'pending' }
}),
  getHealthStatus: jest.fn().mockResolvedValue({);
  processing: { healthy: true, uptime: Date.now(), metrics: { errorRate: 0, averageLatency: 0 } },
    metrics: { healthy: true, uptime: Date.now(), metrics: { errorRate: 0, averageLatency: 0 } },
    dataWarehouse: { healthy: true, uptime: Date.now(), metrics: { errorRate: 0, averageLatency: 0 } },
    api: { healthy: true, uptime: Date.now(), metrics: { errorRate: 0, averageLatency: 0 } }

 as jest.Mocked<ConversionAnalyticsInfrastructure>;

// Mock funnel definition
const mockFunnelDefinition: ConversionFunnelDefinition = { 
  id: 'test-funnel'
  name: 'Test Marketplace Funnel'
  description: 'Test funnel for marketplace conversion'
  category: 'acquisition'
  version: '1.0.0'
  configuration: {
  timeWindow: 86400000
  allowBacktracking: false
  requireSequentialSteps: true
  enableParallelPaths: false
  dropOffGracePeriod: 300000 }

  steps: [
    { id: 'step-1'
  name: 'Landing Page'
  description: 'User lands on marketplace'
  order: 1
  type: 'entry_point'
  isRequired: true
  isTerminal: false
  eventCriteria: {
  eventType: 'page_view'
  propertyMatchers: [] }

  conditions: []
      timeConstraints: {}
      successMetrics: { 
  expectedCompletionRate: 90
  averageTimeToComplete: 30000
  criticalSuccessFactors: [] }

  branches: []
      metadata: { 
  businessValue: 1
  complexity: 'low'
  dependencies: []
  optimizationOpportunities: [] }

    { id: 'step-2'
  name: 'Template Browse'
  description: 'User browses templates'
  order: 2
  type: 'engagement'
  isRequired: true
  isTerminal: false
  eventCriteria: {
  eventType: 'template_browse'
  propertyMatchers: [] }

  conditions: []
      timeConstraints: {}
      successMetrics: { 
  expectedCompletionRate: 70
  averageTimeToComplete: 120000
  criticalSuccessFactors: [] }

  branches: []
      metadata: { 
  businessValue: 2
  complexity: 'medium'
  dependencies: []
  optimizationOpportunities: [] }

    { id: 'step-3'
  name: 'Template Purchase'
  description: 'User purchases template'
  order: 3
  type: 'conversion'
  isRequired: true
  isTerminal: true
  eventCriteria: {
  eventType: 'template_purchased'
  propertyMatchers: [] }

  conditions: []
      timeConstraints: {}
      successMetrics: { 
  expectedCompletionRate: 15
  averageTimeToComplete: 300000
  criticalSuccessFactors: [] }

  branches: []
      metadata: { 
  businessValue: 10
        complexity: 'high'
        dependencies: []
        optimizationOpportunities: []]
  conditionalPaths: []
  successCriteria: {
  primary: {;
  stepId: 'step-3' }
      requirements: { operator: 'AND', conditions: [] }
      weight: 1.0

  secondary: []
    scoreCalculation: { method: 'weighted' }

  analytics: { 
  enableRealTimeTracking: true
  retentionPeriod: 90
  cohortTrackingEnabled: true
  segmentationRules: [] }

  metadata: { 
  createdAt: Date.now()
  updatedAt: Date.now()
  createdBy: 'test-user'
  tags: ['marketplace', 'conversion']
  businessContext: 'Test marketplace conversion funnel'
  expectedConversionRate: 15 }
};

// Mock segments and cohorts
const mockSegments: UserSegment = [
  { id: 'segment-1'
  name: 'Premium Users'
  description: 'Users with premium accounts'
  definition: {
  rules: []
  operator: 'AND'
  updateFrequency: 'daily'
  isStatic: false }

  state: { 
  currentSize: 1500
  lastUpdated: Date.now()
  growthRate: 5.2
  churnRate: 2.1
  status: 'active' }

  performance: { 
  averageConversionRate: 25.8
  averageTimeToConvert: 72000000
  averageLifetimeValue: 1250
  engagementScore: 8.5
  retentionRate: 92.3
  behaviorPatterns: [] }

  funnelMetrics: new Map()
    metadata: { 
  businessValue: 'high'
      targetingPriority: 10 }
      customAttributes: {}
];
const mockCohorts: ConversionCohort = [
  { id: 'cohort-1'
    name: 'January 2024 Cohort'
    description: 'Users who joined in January 2024'
    definition: {
  criteriaEvent: 'user_registered' }
      criteriaConditions: { operator: 'AND', conditions: [] }
      timeWindow: 2592000000

  analysis: { 
  retentionPeriods: [7, 14, 30, 60, 90]
  analysisWindow: 90
  metricCalculations: [] }

  state: { 
  currentSize: 2500
  creationDate: Date.now() - 5184000000
  lastAnalysisDate: Date.now()
  status: 'active'
  completionRate: 18.5 }

  performance: { 
  conversionRates: []
  retentionRates: []
  averageTimeToConvert: 86400000
  topDropOffPoints: []
  valueMetrics: {
  totalRevenue: 125000
  averageOrderValue: 50
  lifetimeValue: 85
  revenuePerUser: 50
  costPerAcquisition: 25
  returnOnInvestment: 2.0 }

  metadata: { 
  businessContext: 'First cohort of 2024'
      hypothesis: 'New year users have higher conversion intent'
      expectedOutcome: 'Higher than average conversion rate'
      tags: ['2024', 'new-year']
      owner: 'test-user'];
describe('FunnelVisualization', () => {
  const defaultProps = {
    funnelDefinition: mockFunnelDefinition
    analyticsInfrastructure: mockAnalyticsInfrastructure }
    timeRange: { start: Date.now() - 86400000, end: Date.now() }
    segments: mockSegments
    cohorts: mockCohorts;
  };
  beforeEach(() => { jest.clearAllMocks() });
  describe('Component Rendering', () => {
    it('should render funnel visualization with proper structure', async () => {
      render(<FunnelVisualization {...defaultProps} />);
      await waitFor(() => { expect(screen.getByText('Test Marketplace Funnel')).toBeInTheDocument();
        expect(screen.getByText('Test funnel for marketplace conversion')).toBeInTheDocument() });
    });
    it('should display loading state initially', () => {
      render(<FunnelVisualization {...defaultProps} />);
      expect(screen.getByText('Loading funnel data...')).toBeInTheDocument();
    });
    it('should render funnel steps correctly', async () => {
      render(<FunnelVisualization {...defaultProps} />);
      await waitFor(() => { expect(screen.getByText('Landing Page')).toBeInTheDocument();
        expect(screen.getByText('Template Browse')).toBeInTheDocument();
        expect(screen.getByText('Template Purchase')).toBeInTheDocument() });
    });
    it('should display summary metrics', async () => {
      render(<FunnelVisualization {...defaultProps} />);
      await waitFor(() => { expect(screen.getByText('Total Entries')).toBeInTheDocument();
        expect(screen.getByText('Overall Conversion Rate')).toBeInTheDocument();
        expect(screen.getByText('Total Conversions')).toBeInTheDocument();
        expect(screen.getByText('Average Time to Convert')).toBeInTheDocument();
        expect(screen.getByText('Total Value')).toBeInTheDocument() });
    });
  });
  describe('Configuration Controls', () => {
    it('should render configuration controls', async () => {
      render(<FunnelVisualization {...defaultProps} />);
      await waitFor(() => { expect(screen.getByLabelText('Display Mode')).toBeInTheDocument();
        expect(screen.getByLabelText('Color Scheme')).toBeInTheDocument();
        expect(screen.getByLabelText('Refresh Interval')).toBeInTheDocument();
        expect(screen.getByLabelText('Enable Animations')).toBeInTheDocument() });
    });
    it('should handle display mode changes', async () => {
      const onConfigChange = jest.fn();
      render();
        <FunnelVisualization 
          {...defaultProps} 
          onConfigChange={onConfigChange}
        />
      );
      await waitFor(() => {
        const displayModeSelect = screen.getByLabelText('Display Mode');
        fireEvent.change(displayModeSelect, { target: { value: 'horizontal' } });
        expect(onConfigChange).toHaveBeenCalledWith()
          expect.objectContaining({ displayMode: 'horizontal' })
        );
      });
    });
    it('should handle color scheme changes', async () => {
      const onConfigChange = jest.fn();
      render();
        <FunnelVisualization 
          {...defaultProps} 
          onConfigChange={onConfigChange}
        />
      );
      await waitFor(() => {
        const colorSchemeSelect = screen.getByLabelText('Color Scheme');
        fireEvent.change(colorSchemeSelect, { target: { value: 'conversion_focused' } });
        expect(onConfigChange).toHaveBeenCalledWith()
          expect.objectContaining({ colorScheme: 'conversion_focused' })
        );
      });
    });
  });
  describe('Filters', () => {
    it('should render filter controls', async () => {
      render(<FunnelVisualization {...defaultProps} />);
      await waitFor(() => { expect(screen.getByText('Filters')).toBeInTheDocument();
        expect(screen.getByText('Add Filter +')).toBeInTheDocument() });
    });
    it('should allow adding segment filters', async () => {
      render(<FunnelVisualization {...defaultProps} />);
      await waitFor(() => { const addFilterButton = screen.getByText('Add Filter +');
        fireEvent.click(addFilterButton);
        expect(screen.getByText('Segments')).toBeInTheDocument();
        expect(screen.getByText('Premium Users')).toBeInTheDocument() });
    });
    it('should allow adding cohort filters', async () => {
      render(<FunnelVisualization {...defaultProps} />);
      await waitFor(() => { const addFilterButton = screen.getByText('Add Filter +');
        fireEvent.click(addFilterButton);
        expect(screen.getByText('Cohorts')).toBeInTheDocument();
        expect(screen.getByText('January 2024 Cohort')).toBeInTheDocument() });
    });
  });
  describe('Step Interactions', () => {
    it('should handle step clicks', async () => {
      const onStepClick = jest.fn();
      render();
        <FunnelVisualization 
          {...defaultProps} 
          onStepClick={onStepClick}
        />
      );
      await waitFor(() => { const stepElement = screen.getByText('Landing Page').closest('.step-bar');
        if (stepElement) {
          fireEvent.click(stepElement);
          expect(onStepClick).toHaveBeenCalled() });
    });
  });
  describe('Real-time Updates', () => {
    it('should handle real-time updates when enabled', async () => {
      jest.useFakeTimers();
      render();
        <FunnelVisualization 
          {...defaultProps} 
          realTimeUpdates={true}
        />
      );
      await waitFor(() => { expect(mockAnalyticsInfrastructure.queryMetrics).toHaveBeenCalledTimes(1) });
      // Fast-forward time to trigger update
      jest.advanceTimersByTime(30000);
      await waitFor(() => { expect(mockAnalyticsInfrastructure.queryMetrics).toHaveBeenCalledTimes(2) });
      jest.useRealTimers();
    });
  });
  describe('Error Handling', () => { it('should handle analytics infrastructure errors', async () => {
  const errorInfrastructure = {
  ...mockAnalyticsInfrastructure
  queryMetrics: jest.fn().mockRejectedValue(new Error('Network error')) }
};
      render();
        <FunnelVisualization 
          {...defaultProps} 
          analyticsInfrastructure={errorInfrastructure}
        />
      );
      await waitFor(() => { expect(screen.getByText('Error Loading Funnel')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument() });
    });
    it('should allow retrying after error', async () => { const errorInfrastructure = {
  ...mockAnalyticsInfrastructure
  queryMetrics: jest.fn() }
  .mockRejectedValueOnce(new Error('Network error'))
  .mockResolvedValue([])
};
      render();
        <FunnelVisualization 
          {...defaultProps} 
          analyticsInfrastructure={errorInfrastructure}
        />
      );
      await waitFor(() => { expect(screen.getByText('Retry')).toBeInTheDocument() });
      fireEvent.click(screen.getByText('Retry'));
      await waitFor(() => { expect(errorInfrastructure.queryMetrics).toHaveBeenCalledTimes(2) });
    });
  });
  describe('Comparison Mode', () => {
    it('should render comparison view when enabled', async () => {
      render();
        <FunnelVisualization 
          {...defaultProps} 
          comparisonMode="time_period"
        />
      );
      await waitFor(() => { expect(screen.getByText('Comparison Analysis')).toBeInTheDocument() });
    });
  });
  describe('Insights Generation', () => {
    it('should display insights when available', async () => {
      render(<FunnelVisualization {...defaultProps} />);
      await waitFor(() => { expect(screen.getByText('Funnel Insights')).toBeInTheDocument();
        expect(screen.getByText('Biggest Drop-off Points')).toBeInTheDocument();
        expect(screen.getByText('Conversion Opportunities')).toBeInTheDocument();
        expect(screen.getByText('Performance Trends')).toBeInTheDocument() });
    });
  });
});
describe('FunnelConfiguration', () => { const configProps = {
  initialFunnel: {
  name: 'Test Funnel'
  description: 'Test Description'
  category: 'acquisition' as const }

  templates: []
    availableEvents: []
    availableProperties: [];
  };
  describe('Basic Configuration', () => {
    it('should render configuration form', () => {
      render(<FunnelConfiguration {...configProps} />);
      expect(screen.getByText('Funnel Configuration')).toBeInTheDocument();
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Steps')).toBeInTheDocument();
      expect(screen.getByText('Conditions')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
    it('should handle basic information changes', () => {
      const onSave = jest.fn();
      render(<FunnelConfiguration {...configProps} onSave={onSave} />);
      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'Updated Funnel Name' } });
      expect(nameInput).toHaveValue('Updated Funnel Name');
    });
    it('should validate required fields', () => {
      render(<FunnelConfiguration {...configProps} />);
      // Clear the name field
      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: '' } });
      expect(screen.getByText('Funnel name is required')).toBeInTheDocument();
    });
    it('should handle category selection', () => {
      render(<FunnelConfiguration {...configProps} />);
      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'monetization' } });
      expect(categorySelect).toHaveValue('monetization');
    });
  });
  describe('Steps Configuration', () => {
    it('should allow adding steps', () => {
      render(<FunnelConfiguration {...configProps} />);
      // Navigate to Steps tab
      fireEvent.click(screen.getByText('Steps'));
      const addStepButton = screen.getByText('Add Step');
      fireEvent.click(addStepButton);
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });
    it('should handle step deletion', () => {
      render(<FunnelConfiguration {...configProps} />);
      // Navigate to Steps tab
      fireEvent.click(screen.getByText('Steps'));
      // Add a step first
      const addStepButton = screen.getByText('Add Step');
      fireEvent.click(addStepButton);
      // Find and click delete button
      const deleteButton = screen.getByText('×');
      fireEvent.click(deleteButton);
      expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
    });
  });
  describe('Validation', () => {
    it('should show validation errors', () => {
      render(<FunnelConfiguration {...configProps} />);
      // Clear required fields to trigger validation
      const nameInput = screen.getByLabelText('Name *');
      const descriptionInput = screen.getByLabelText('Description *');
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.change(descriptionInput, { target: { value: '' } });
      expect(screen.getByText('Validation Results')).toBeInTheDocument();
      expect(screen.getByText('Funnel name is required')).toBeInTheDocument();
      expect(screen.getByText('Funnel description is required')).toBeInTheDocument();
    });
    it('should disable save button when validation fails', () => {
      render(<FunnelConfiguration {...configProps} />);
      // Clear required field
      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: '' } });
      const saveButton = screen.getByText('Save Funnel');
      expect(saveButton).toBeDisabled();
    });
  });
  describe('Template Usage', () => {
    it('should show template selection modal', () => {
      render(<FunnelConfiguration {...configProps} />);
      const templateButton = screen.getByText('Use Template');
      fireEvent.click(templateButton);
      expect(screen.getByText('Choose Funnel Template')).toBeInTheDocument();
    });
  });
});
describe('FunnelComparison', () => { const comparisonProps = {
  analyticsInfrastructure: mockAnalyticsInfrastructure
  primaryFunnel: mockFunnelDefinition
  comparisonMode: 'time_period' as const
  comparisonConfig: {
  mode: 'time_period' as const
  baseline: {
  id: 'baseline'
  name: 'Last Month'
  description: 'Previous month performance' }

  comparison: { 
  id: 'comparison'
  name: 'This Month'
  description: 'Current month performance' }

  timeRange: { start: Date.now() - 2592000000, end: Date.now() }
      significanceLevel: 0.05
      minimumSampleSize: 100
      includeStatisticalTests: true
      autoGenerateInsights: true;
  };
  describe('Component Rendering', () => {
    it('should render comparison interface', async () => {
      render(<FunnelComparison {...comparisonProps} />);
      await waitFor(() => { expect(screen.getByText('Funnel Comparison')).toBeInTheDocument();
        expect(screen.getByText('Last Month vs This Month')).toBeInTheDocument() });
    });
    it('should display comparison summary metrics', async () => {
      render(<FunnelComparison {...comparisonProps} />);
      await waitFor(() => { expect(screen.getByText('Overall Conversion Rate')).toBeInTheDocument();
        expect(screen.getByText('Total Conversions')).toBeInTheDocument();
        expect(screen.getByText('Average Time to Convert')).toBeInTheDocument();
        expect(screen.getByText('Total Value')).toBeInTheDocument() });
    });
    it('should show view mode controls', async () => {
      render(<FunnelComparison {...comparisonProps} />);
      await waitFor(() => { expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Detailed')).toBeInTheDocument();
        expect(screen.getByText('Statistical')).toBeInTheDocument() });
    });
  });
  describe('View Modes', () => {
    it('should switch between view modes', async () => {
      render(<FunnelComparison {...comparisonProps} />);
      await waitFor(() => { const detailedButton = screen.getByText('Detailed');
        fireEvent.click(detailedButton);
        expect(detailedButton).toHaveClass('active') });
    });
  });
  describe('Insights', () => {
    it('should display generated insights', async () => {
      render(<FunnelComparison {...comparisonProps} />);
      await waitFor(() => { expect(screen.getByText('Key Insights')).toBeInTheDocument() });
    });
  });
  describe('Export Functionality', () => {
    it('should handle export requests', async () => {
      const onExportRequest = jest.fn();
      render();
        <FunnelComparison 
          {...comparisonProps} 
          onExportRequest={onExportRequest}
        />
      );
      await waitFor(() => { const exportButton = screen.getByText('Export Report');
        fireEvent.click(exportButton);
        expect(onExportRequest).toHaveBeenCalled() });
    });
  });
});
describe('FunnelSegmentation', () => { const segmentationProps = {
    analyticsInfrastructure: mockAnalyticsInfrastructure
    funnelId: 'test-funnel' }
    timeRange: { start: Date.now() - 86400000, end: Date.now() }
    availableSegments: mockSegments
    availableCohorts: mockCohorts;
  };
  describe('Component Rendering', () => {
    it('should render segmentation interface', () => {
      render(<FunnelSegmentation {...segmentationProps} />);
      expect(screen.getByText('Funnel Segmentation')).toBeInTheDocument();
      expect(screen.getByText('Analyze funnel performance across different user segments')).toBeInTheDocument();
    });
    it('should display view mode tabs', () => {
      render(<FunnelSegmentation {...segmentationProps} />);
      expect(screen.getByText('Segments')).toBeInTheDocument();
      expect(screen.getByText('Cohorts')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
    it('should show create custom segment button', () => {
      render(<FunnelSegmentation {...segmentationProps} />);
      expect(screen.getByText('Create Custom Segment')).toBeInTheDocument();
    });
  });
  describe('Segment Selection', () => {
    it('should display available segments', () => {
      render(<FunnelSegmentation {...segmentationProps} />);
      expect(screen.getByText('Available Segments')).toBeInTheDocument();
      expect(screen.getByText('Premium Users')).toBeInTheDocument();
      expect(screen.getByText('Users with premium accounts')).toBeInTheDocument();
    });
    it('should allow toggling segments', () => {
      render(<FunnelSegmentation {...segmentationProps} />);
      const segmentCard = screen.getByText('Premium Users').closest('.segment-card');
      if (segmentCard) { fireEvent.click(segmentCard);
        expect(segmentCard).toHaveClass('active') });
  });
  describe('Cohort Selection', () => {
    it('should switch to cohort view', () => {
      render(<FunnelSegmentation {...segmentationProps} />);
      const cohortsTab = screen.getByText('Cohorts');
      fireEvent.click(cohortsTab);
      expect(screen.getByText('Available Cohorts')).toBeInTheDocument();
      expect(screen.getByText('January 2024 Cohort')).toBeInTheDocument();
    });
  });
  describe('Custom Segments', () => {
    it('should switch to custom segment builder', () => {
      render(<FunnelSegmentation {...segmentationProps} />);
      const customTab = screen.getByText('Custom');
      fireEvent.click(customTab);
      expect(screen.getByText('Custom Segment Builder')).toBeInTheDocument();
      expect(screen.getByText('Quick Templates')).toBeInTheDocument();
      expect(screen.getByText('Manual Rule Builder')).toBeInTheDocument();
    });
    it('should display segment templates', () => {
      render(<FunnelSegmentation {...segmentationProps} />);
      const customTab = screen.getByText('Custom');
      fireEvent.click(customTab);
      expect(screen.getByText('High Value Users')).toBeInTheDocument();
      expect(screen.getByText('Mobile Users')).toBeInTheDocument();
    });
  });
  describe('Active Filters', () => {
    it('should display active filters panel when filters are added', () => {
      render(<FunnelSegmentation {...segmentationProps} />);
      // Add a segment filter
      const segmentCard = screen.getByText('Premium Users').closest('.segment-card');
      if (segmentCard) { fireEvent.click(segmentCard);
        expect(screen.getByText('Active Filters')).toBeInTheDocument();
        expect(screen.getByText('Premium Users')).toBeInTheDocument() });
  });
  describe('Segment Analysis', () => {
    it('should call analytics infrastructure when segments are active', async () => {
      const onSegmentAnalysis = jest.fn();
      render();
        <FunnelSegmentation 
          {...segmentationProps} 
          onSegmentAnalysis={onSegmentAnalysis}
        />
      );
      // Add a segment filter
      const segmentCard = screen.getByText('Premium Users').closest('.segment-card');
      if (segmentCard) { fireEvent.click(segmentCard);
        await waitFor(() => {
          expect(mockAnalyticsInfrastructure.queryMetrics).toHaveBeenCalled() });
    });
  });
});
describe('Integration Tests', () => {
  it('should integrate funnel visualization with configuration', async () => {
    const onConfigChange = jest.fn();
    render();
      <FunnelVisualization 
        funnelDefinition={mockFunnelDefinition}
        analyticsInfrastructure={mockAnalyticsInfrastructure}
        timeRange={{ start: Date.now() - 86400000, end: Date.now() }}
        onConfigChange={onConfigChange}
      />
    );
    await waitFor(() => {
      const displayModeSelect = screen.getByLabelText('Display Mode');
      fireEvent.change(displayModeSelect, { target: { value: 'horizontal' } });
      expect(onConfigChange).toHaveBeenCalledWith()
        expect.objectContaining({ displayMode: 'horizontal' })
      );
    });
  });
  it('should integrate segmentation with analytics queries', async () => {
    render();
      <FunnelSegmentation 
        analyticsInfrastructure={mockAnalyticsInfrastructure}
        funnelId="test-funnel"
        timeRange={{ start: Date.now() - 86400000, end: Date.now() }}
        availableSegments={mockSegments}
      />
    );
    // Add a segment filter
    const segmentCard = screen.getByText('Premium Users').closest('.segment-card');
    if (segmentCard) { fireEvent.click(segmentCard);
  await waitFor(() => {
  expect(mockAnalyticsInfrastructure.queryMetrics).toHaveBeenCalledWith()
  expect.objectContaining({)
  funnelId: 'test-funnel'
  metrics: expect.arrayContaining(['conversion_rate', 'user_count', 'revenue'])
  filters: expect.arrayContaining([)
  expect.objectContaining({)
  field: 'userContext.segmentIds'
  operator: 'contains'
  value: 'segment-1' }

            ])

        );
      });
  });
});