import React, { useState, useEffect, useCallback } from 'react';
import {
  CustomReport,
  AnalyticsQuery,
  MetricType,
  TimeRange,
  AggregationType,
  DashboardLayout
} from '../../../types/analytics';
import { QueryBuilder } from './QueryBuilder';
import { VisualizationConfig } from './VisualizationConfig';
import { ScheduleConfig } from './ScheduleConfig';
import { ReportPreview } from './ReportPreview';
import { analyticsService } from '../../../services/analyticsService';
import './ReportBuilder.css';

interface ReportBuilderProps {
  creatorId: string;
  existingReport?: CustomReport;
  onSave?: (report: CustomReport) => void;
  onCancel?: () => void;
  className?: string;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  creatorId,
  existingReport,
  onSave,
  onCancel,
  className = ''
}) => {
  const [step, setStep] = useState<'query' | 'visualization' | 'schedule' | 'preview'>('query');
  const [reportName, setReportName] = useState(existingReport?.name || '');
  const [reportDescription, setReportDescription] = useState(existingReport?.description || '');
  const [query, setQuery] = useState<AnalyticsQuery>(
    existingReport?.configuration.query || {
      metric_types: [MetricType.VIEWS],
      time_range: TimeRange.LAST_30D,
      aggregation: AggregationType.COUNT,
      limit: 100,
      offset: 0
    }
  );
  const [visualization, setVisualization] = useState(
    existingReport?.configuration.visualization || {
      chart_type: 'line',
      layout: DashboardLayout.GRID,
      show_legend: true,
      show_grid: true,
      color_scheme: 'default'
    }
  );
  const [scheduling, setScheduling] = useState({
    is_scheduled: existingReport?.is_scheduled || false,
    schedule: existingReport?.schedule || {
      frequency: 'weekly' as const,
      time: '09:00',
      recipients: []
    }
  });
  const [previewData, setPreviewData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load preview data when query changes
  const loadPreviewData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await analyticsService.queryAnalytics({
        ...query,
        creator_id: creatorId,
        limit: 10 // Limit preview data
      });
      
      setPreviewData(data);
    } catch (err) {
      console.error('Failed to load preview data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preview data');
    } finally {
      setLoading(false);
    }
  }, [query, creatorId]);

  // Load preview data when entering preview step
  useEffect(() => {
    if (step === 'preview') {
      loadPreviewData();
    }
  }, [step, loadPreviewData]);

  // Validate current step
  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
    case 'query':
      if (!reportName.trim()) {
        errors.reportName = 'Report name is required';
      }
      if (reportName.length > 255) {
        errors.reportName = 'Report name must be less than 255 characters';
      }
      if (reportDescription && reportDescription.length > 1000) {
        errors.reportDescription = 'Description must be less than 1000 characters';
      }
      if (query.metric_types.length === 0) {
        errors.metrics = 'At least one metric must be selected';
      }
      break;
        
    case 'visualization':
      // Visualization validation if needed
      break;
        
    case 'schedule':
      if (scheduling.is_scheduled) {
        if (!scheduling.schedule.frequency) {
          errors.frequency = 'Frequency is required for scheduled reports';
        }
        if (!scheduling.schedule.time) {
          errors.time = 'Time is required for scheduled reports';
        }
        if (scheduling.schedule.recipients.length === 0) {
          errors.recipients = 'At least one recipient is required for scheduled reports';
        }
      }
      break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle step navigation
  const handleNext = () => {
    if (!validateStep()) return;

    const steps = ['query', 'visualization', 'schedule', 'preview'] as const;
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps = ['query', 'visualization', 'schedule', 'preview'] as const;
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  // Handle save report
  const handleSave = async () => {
    if (!validateStep()) return;

    try {
      setSaving(true);
      setError(null);

      const reportData: Partial<CustomReport> = {
        name: reportName,
        description: reportDescription || undefined,
        configuration: {
          query: {
            ...query,
            creator_id: creatorId
          },
          visualization,
          refresh_interval: visualization.chart_type === 'table' ? undefined : 300 // 5 minutes
        },
        is_scheduled: scheduling.is_scheduled,
        schedule: scheduling.is_scheduled ? scheduling.schedule : undefined
      };

      let savedReport: CustomReport;
      
      if (existingReport) {
        savedReport = await analyticsService.updateCustomReport(existingReport.id, reportData);
      } else {
        savedReport = await analyticsService.createCustomReport(reportData);
      }

      onSave?.(savedReport);
    } catch (err) {
      console.error('Failed to save report:', err);
      setError(err instanceof Error ? err.message : 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch (step) {
    case 'query': return 'Configure Data Query';
    case 'visualization': return 'Choose Visualization';
    case 'schedule': return 'Set Schedule';
    case 'preview': return 'Preview Report';
    default: return 'Build Report';
    }
  };

  return (
    <div className={`report-builder ${className}`}>
      <div className="report-builder-header">
        <div className="header-content">
          <h2>{existingReport ? 'Edit Report' : 'Create New Report'}</h2>
          <p>{getStepTitle()}</p>
        </div>
        
        <div className="header-actions">
          <button
            className="cancel-button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          
          {step === 'preview' && (
            <button
              className="save-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : existingReport ? 'Update Report' : 'Save Report'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${step === 'query' ? 'active' : ''} ${['visualization', 'schedule', 'preview'].includes(step) ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Query</div>
        </div>
        
        <div className="step-connector"></div>
        
        <div className={`step ${step === 'visualization' ? 'active' : ''} ${['schedule', 'preview'].includes(step) ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Visualization</div>
        </div>
        
        <div className="step-connector"></div>
        
        <div className={`step ${step === 'schedule' ? 'active' : ''} ${step === 'preview' ? 'completed' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Schedule</div>
        </div>
        
        <div className="step-connector"></div>
        
        <div className={`step ${step === 'preview' ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Preview</div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="report-builder-content">
        {step === 'query' && (
          <div className="step-content">
            {/* Basic Information */}
            <div className="basic-info-section">
              <h3>Report Information</h3>
              
              <div className="form-group">
                <label htmlFor="reportName">Report Name *</label>
                <input
                  id="reportName"
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                  className={validationErrors.reportName ? 'error' : ''}
                />
                {validationErrors.reportName && (
                  <div className="field-error">{validationErrors.reportName}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="reportDescription">Description</label>
                <textarea
                  id="reportDescription"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Optional description for this report"
                  rows={3}
                  className={validationErrors.reportDescription ? 'error' : ''}
                />
                {validationErrors.reportDescription && (
                  <div className="field-error">{validationErrors.reportDescription}</div>
                )}
              </div>
            </div>
            
            {/* Query Builder */}
            <QueryBuilder
              query={query}
              onChange={setQuery}
              validationErrors={validationErrors}
            />
          </div>
        )}

        {step === 'visualization' && (
          <div className="step-content">
            <VisualizationConfig
              config={visualization}
              onChange={setVisualization}
              metrics={query.metric_types}
            />
          </div>
        )}

        {step === 'schedule' && (
          <div className="step-content">
            <ScheduleConfig
              config={scheduling}
              onChange={setScheduling}
              validationErrors={validationErrors}
            />
          </div>
        )}

        {step === 'preview' && (
          <div className="step-content">
            <ReportPreview
              reportName={reportName}
              reportDescription={reportDescription}
              query={query}
              visualization={visualization}
              scheduling={scheduling}
              previewData={previewData}
              loading={loading}
              onRefreshPreview={loadPreviewData}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="report-builder-footer">
        <div className="navigation-buttons">
          <button
            className="previous-button"
            onClick={handlePrevious}
            disabled={step === 'query' || saving}
          >
            Previous
          </button>
          
          {step !== 'preview' && (
            <button
              className="next-button"
              onClick={handleNext}
              disabled={saving}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};