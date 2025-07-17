import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/Checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Alert, AlertDescription } from '../ui/Alert';
import { Download, FileText, Table, Image, Settings } from 'lucide-react';
/**
 * Export options component
 */
export const ExportOptions = ({ analyticsClient, timeRange, className = '' }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState(null);
    const [exportConfig, setExportConfig] = useState({
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
    const handleConfigChange = useCallback((key, value) => {
        setExportConfig(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);
    /**
     * Handle date range change
     */
    const handleDateRangeChange = useCallback((field, value) => {
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
    const generateFilename = useCallback((format) => {
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
        }
        catch (error) {
            console.error('Export failed:', error);
            setExportError(error instanceof Error ? error.message : 'Export failed');
        }
        finally {
            setIsExporting(false);
        }
    }, [analyticsClient, exportConfig, generateFilename]);
    /**
     * Handle quick export
     */
    const handleQuickExport = useCallback(async (format) => {
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
        }
        catch (error) {
            console.error('Quick export failed:', error);
        }
        finally {
            setIsExporting(false);
        }
    }, [analyticsClient, timeRange]);
    /**
     * Format date for input
     */
    const formatDateForInput = (timestamp) => {
        return new Date(timestamp).toISOString().slice(0, 16);
    };
    /**
     * Get format icon
     */
    const getFormatIcon = (format) => {
        switch (format) {
            case 'json':
                return _jsx(FileText, { className: "w-4 h-4" });
            case 'csv':
                return _jsx(Table, { className: "w-4 h-4" });
            case 'html':
                return _jsx(Image, { className: "w-4 h-4" });
            case 'pdf':
                return _jsx(FileText, { className: "w-4 h-4" });
            default:
                return _jsx(FileText, { className: "w-4 h-4" });
        }
    };
    /**
     * Get format description
     */
    const getFormatDescription = (format) => {
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
    return (_jsx("div", { className: `export-options ${className}`, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleQuickExport('json'), disabled: isExporting, className: "flex items-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), "JSON"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleQuickExport('csv'), disabled: isExporting, className: "flex items-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), "CSV"] }), _jsxs(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", variant: "outline", className: "flex items-center gap-2", children: [_jsx(Settings, { className: "w-4 h-4" }), "Advanced Export"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Export Analytics Report" }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Export Format" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: ['json', 'csv', 'html', 'pdf'].map((format) => (_jsxs("div", { className: `p-3 border rounded-lg cursor-pointer transition-all ${exportConfig.format === format
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'}`, onClick: () => handleConfigChange('format', format), children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [getFormatIcon(format), _jsx("span", { className: "font-medium uppercase", children: format })] }), _jsx("div", { className: "text-sm text-gray-600", children: getFormatDescription(format) })] }, format))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Date Range" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "startDate", className: "text-sm", children: "Start Date" }), _jsx(Input, { id: "startDate", type: "datetime-local", value: formatDateForInput(exportConfig.dateRange.startTime), onChange: (e) => handleDateRangeChange('startTime', e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "endDate", className: "text-sm", children: "End Date" }), _jsx(Input, { id: "endDate", type: "datetime-local", value: formatDateForInput(exportConfig.dateRange.endTime), onChange: (e) => handleDateRangeChange('endTime', e.target.value) })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Include in Export" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "includeCostAnalysis", checked: exportConfig.includeCostAnalysis, onCheckedChange: (checked) => handleConfigChange('includeCostAnalysis', checked) }), _jsx(Label, { htmlFor: "includeCostAnalysis", className: "text-sm", children: "Cost Analysis & Budget Data" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "includePatterns", checked: exportConfig.includePatterns, onCheckedChange: (checked) => handleConfigChange('includePatterns', checked) }), _jsx(Label, { htmlFor: "includePatterns", className: "text-sm", children: "Usage Patterns & Trends" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "includeHeatMap", checked: exportConfig.includeHeatMap, onCheckedChange: (checked) => handleConfigChange('includeHeatMap', checked) }), _jsx(Label, { htmlFor: "includeHeatMap", className: "text-sm", children: "Heat Map Data" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "includeRecommendations", checked: exportConfig.includeRecommendations, onCheckedChange: (checked) => handleConfigChange('includeRecommendations', checked) }), _jsx(Label, { htmlFor: "includeRecommendations", className: "text-sm", children: "Recommendations & Insights" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "customName", children: "Custom Filename (optional)" }), _jsx(Input, { id: "customName", placeholder: "analytics_report", value: exportConfig.customName, onChange: (e) => handleConfigChange('customName', e.target.value) }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Preview: ", generateFilename(exportConfig.format)] })] }), exportError && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: exportError }) })), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Export will include data from ", new Date(exportConfig.dateRange.startTime).toLocaleDateString(), " to ", new Date(exportConfig.dateRange.endTime).toLocaleDateString()] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setIsDialogOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleExport, disabled: isExporting, className: "flex items-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), isExporting ? 'Exporting...' : 'Export'] })] })] })] })] })] })] }) }));
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
