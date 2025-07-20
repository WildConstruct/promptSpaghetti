import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Alert, AlertDescription } from '../ui/Alert';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
import { Download, FileText, Table, Image, Calendar, Settings } from 'lucide-react';

/**
 * Export configuration interface
 */
interface ExportConfig {
  format: 'json' | 'csv' | 'html' | 'pdf';
  includeHeatMap: boolean;
  includeCostAnalysis: boolean;
  includePatterns: boolean;
  includeRecommendations: boolean;
  dateRange: {
    startTime: number;
    endTime: number;
  };
  customName?: string;
}

/**
 * Export options props
 */
export interface ExportOptionsProps {
  analyticsClient: AnalyticsClient;
  timeRange: { startTime: number; endTime: number };
  className?: string;
}

/**
 * Export options component
 */
export const ExportOptions: React.FC<ExportOptionsProps> = ({
  analyticsClient,
  timeRange,
  className = ''
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'json',
    includeHeatMap: false,
    includeCostAnalysis: true,
    includePatterns: true,
    includeRecommendations: true,
    dateRange: timeRange,
    customName: ''
  });

  /**
   * Handle export configuration change
   */
  const handleConfigChange = useCallback((key: keyof ExportConfig, value: any) => {
    setExportConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  /**
   * Handle date range change
   */
  const handleDateRangeChange = useCallback((field: 'startTime' | 'endTime', value: string) => {
    const timestamp = new Date(value).getTime();
    setExportConfig(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: timestamp
      }
    }));
  }, []);

  /**
   * Generate filename
   */
  const generateFilename = useCallback((format: string) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const customName = exportConfig.customName || 'analytics_report';
    return `${customName}_${timestamp}.${format}`;
  }, [exportConfig.customName]);

  /**
   * Handle export
   */
  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      const reportConfig = {
        startTime: exportConfig.dateRange.startTime,
        endTime: exportConfig.dateRange.endTime,
        format: exportConfig.format,
        includeHeatMap: exportConfig.includeHeatMap,
        includeCostAnalysis: exportConfig.includeCostAnalysis,
        includePatterns: exportConfig.includePatterns
      };

      const reportData = await analyticsClient.generateReport(reportConfig);

      // Create blob and download
      const blob = new Blob([reportData], {
        type: exportConfig.format === 'json' ? 'application/json' :
          exportConfig.format === 'csv' ? 'text/csv' :
            exportConfig.format === 'html' ? 'text/html' :
              'application/pdf'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFilename(exportConfig.format);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [analyticsClient, exportConfig, generateFilename]);

  /**
   * Handle quick export
   */
  const handleQuickExport = useCallback(async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true);
      const data = await analyticsClient.exportData(timeRange, format);
      
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_data_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Quick export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [analyticsClient, timeRange]);

  /**
   * Format date for input
   */
  const formatDateForInput = (timestamp: number) => {
    return new Date(timestamp).toISOString().slice(0, 16);
  };

  /**
   * Get format icon
   */
  const getFormatIcon = (format: string) => {
    switch (format) {
    case 'json':
      return <FileText className="w-4 h-4" />;
    case 'csv':
      return <Table className="w-4 h-4" />;
    case 'html':
      return <Image className="w-4 h-4" />;
    case 'pdf':
      return <FileText className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
    }
  };

  /**
   * Get format description
   */
  const getFormatDescription = (format: string) => {
    switch (format) {
    case 'json':
      return 'Raw data in JSON format for programmatic access';
    case 'csv':
      return 'Tabular data for spreadsheet applications';
    case 'html':
      return 'Interactive dashboard for viewing and sharing';
    case 'pdf':
      return 'Professional report format for presentations';
    default:
      return '';
    }
  };

  return (
    <div className={`export-options ${className}`}>
      <div className="flex items-center gap-2">
        {/* Quick Export Buttons */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickExport('json')}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          JSON
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickExport('csv')}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          CSV
        </Button>

        {/* Advanced Export Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Advanced Export
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Export Analytics Report</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Export Format Selection */}
              <div className="space-y-3">
                <Label>Export Format</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['json', 'csv', 'html', 'pdf'] as const).map((format) => (
                    <div
                      key={format}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        exportConfig.format === format
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleConfigChange('format', format)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getFormatIcon(format)}
                        <span className="font-medium uppercase">{format}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {getFormatDescription(format)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range Selection */}
              <div className="space-y-3">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formatDateForInput(exportConfig.dateRange.startTime)}
                      onChange={(e) => handleDateRangeChange('startTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-sm">End Date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formatDateForInput(exportConfig.dateRange.endTime)}
                      onChange={(e) => handleDateRangeChange('endTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Content Options */}
              <div className="space-y-3">
                <Label>Include in Export</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCostAnalysis"
                      checked={exportConfig.includeCostAnalysis}
                      onCheckedChange={(checked) => handleConfigChange('includeCostAnalysis', checked)}
                    />
                    <Label htmlFor="includeCostAnalysis" className="text-sm">
                      Cost Analysis & Budget Data
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includePatterns"
                      checked={exportConfig.includePatterns}
                      onCheckedChange={(checked) => handleConfigChange('includePatterns', checked)}
                    />
                    <Label htmlFor="includePatterns" className="text-sm">
                      Usage Patterns & Trends
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeHeatMap"
                      checked={exportConfig.includeHeatMap}
                      onCheckedChange={(checked) => handleConfigChange('includeHeatMap', checked)}
                    />
                    <Label htmlFor="includeHeatMap" className="text-sm">
                      Heat Map Data
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeRecommendations"
                      checked={exportConfig.includeRecommendations}
                      onCheckedChange={(checked) => handleConfigChange('includeRecommendations', checked)}
                    />
                    <Label htmlFor="includeRecommendations" className="text-sm">
                      Recommendations & Insights
                    </Label>
                  </div>
                </div>
              </div>

              {/* Custom Filename */}
              <div className="space-y-2">
                <Label htmlFor="customName">Custom Filename (optional)</Label>
                <Input
                  id="customName"
                  placeholder="analytics_report"
                  value={exportConfig.customName}
                  onChange={(e) => handleConfigChange('customName', e.target.value)}
                />
                <div className="text-sm text-gray-600">
                  Preview: {generateFilename(exportConfig.format)}
                </div>
              </div>

              {/* Export Error */}
              {exportError && (
                <Alert variant="destructive">
                  <AlertDescription>{exportError}</AlertDescription>
                </Alert>
              )}

              {/* Export Button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Export will include data from {new Date(exportConfig.dateRange.startTime).toLocaleDateString()} to {new Date(exportConfig.dateRange.endTime).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

/**
 * Export options styles
 */
const styles = `
  .export-options {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .export-options button {
    transition: all 0.2s ease-in-out;
  }

  .export-options button:hover {
    transform: translateY(-1px);
  }

  .export-options button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    .export-options {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ExportOptions;