/**
 * Report Export Panel Component
 * 
 * Main panel that combines export modal, history panel, and provides
 * export functionality integration with existing reports.
 * 
 * Task: T-1752989143998-788 - Add report export options
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import ReportExportModal from './ReportExportModal';
import ExportHistoryPanel from './ExportHistoryPanel';
import { useReportExport } from '../../hooks/useReportExport';
import {
  FileExport,
  Download,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  Zap
} from 'lucide-react';

// Sample report data generator
const generateSampleReportData = () => ({)
  metadata: {,
    title: 'Performance Analysis Report',
    description: 'Comprehensive analysis of system performance metrics',
    generatedAt: new Date(),
    generatedBy: 'System Administrator',
    version: '1.0.0',
  },
  summary: {,
    totalRequests: 156789,
    averageResponseTime: 245.7,
    successRate: 98.3,
    errorCount: 2674,
    peakConcurrency: 342,
    dataProcessed: '1.2TB',
  },
  data: Array.from({ length: 100 }, (_, i) => ({)
    id: i + 1,
    timestamp: new Date(Date.now() - (100 - i) * 3600000).toISOString(),
    requests: Math.floor(Math.random() * 1000) + 500,
    responseTime: Math.floor(Math.random() * 500) + 100,
    errorRate: Math.random() * 5,
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    status: Math.random() > 0.1 ? 'healthy' : 'warning',
  })),
  charts: [,
    {
      type: 'line' as const,
      title: 'Response Time Trend',
      data: Array.from({ length: 24 }, (_, i) => ({)
        hour: i,
        responseTime: Math.floor(Math.random() * 300) + 100,
      }))
    },
    {
      type: 'bar' as const,
      title: 'Error Distribution',
      data: [,
        { category: '4xx Errors', count: 156 },
        { category: '5xx Errors', count: 23 },
        { category: 'Timeouts', count: 45 },
        { category: 'Connection Errors', count: 12 }
      ]
    }
  ],
  customSections: [,
    {
      title: 'Executive Summary',
      content: 'System performance remains stable with 98.3% success rate. Minor increase in response time during peak hours requires attention.',
      type: 'text' as const,
    },
    {
      title: 'Recommendations',
      content: '<ul><li>Scale up server resources during 2-4 PM peak hours</li><li>Optimize database queries showing slow performance</li><li>Implement caching for frequently accessed endpoints</li></ul>',
      type: 'html' as const,
    }
  ]
});
interface ReportExportPanelProps {
  // Optional props for customization
  title?: string;
  showQuickExport?: boolean;
  showSampleData?: boolean;
  allowScheduling?: boolean;
  customReportData?: unknown;
}

export const ReportExportPanel: React.FC<ReportExportPanelProps> = ({)
  title = 'Report Export System',
  showQuickExport = true,
  showSampleData = true,
  allowScheduling = true,
  customReportData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<unknown>(null);
  const [statistics, setStatistics] = useState<unknown>(null);
  const {
    isExporting,
    exportHistory,
    scheduledExports,
    exportFormats,
    testExport,
    loadExportHistory,
    loadScheduledExports,
    loadExportFormats,
    getExportStatistics
  } = useReportExport();
  const loadInitialData = useCallback(async () => {
    try {
      await Promise.all([)
        loadExportHistory(20),
        loadScheduledExports(),
        loadExportFormats(),
        loadStatistics();
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, [loadExportHistory, loadScheduledExports, loadExportFormats, loadStatistics]);
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  const loadStatistics = useCallback(async () => {
    const stats = await getExportStatistics();
    setStatistics(stats);
  }, [getExportStatistics]);
  // Handle quick export with sample data
  const handleQuickExport = () => {
    const reportData = customReportData || generateSampleReportData();
    setCurrentReportData(reportData);
    setExportModalOpen(true);
  };
  // Handle test export
  const handleTestExport = async (format: string) => {
    try {
      await testExport(format, 'file');
      await loadExportHistory(20); // Refresh history
    } catch (error) {
      console.error('Test export failed:', error);
    }
  };
  // Get recent export stats
  const recentExports = exportHistory.slice(0, 5);
  const recentSchedules = scheduledExports.filter(s => s.enabled).slice(0, 3);
  return ()
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">
            Export reports in multiple formats with scheduling and delivery options
          </p>
        </div>
        {showQuickExport && ()
          <div className="flex gap-2">
            <Button
              onClick={() => handleQuickExport()}
              disabled={isExporting}
            >
              <FileExport className="w-4 h-4 mr-2" />
              Quick Export
            </Button>
            <Button
              variant="outline"
              onClick={() => loadInitialData()}
            >
              <Settings className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}
      </div>
      {/* Overview Cards */}
      {statistics && ()
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Exports</p>
                  <p className="text-2xl font-bold">{statistics.totalExports}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {statistics.successfulExports} successful
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {statistics.totalExports > 0
                      ? Math.round((statistics.successfulExports / statistics.totalExports) * 100)
                      : 0
                    }%
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {statistics.failedExports} failures
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Processing</p>
                  <p className="text-2xl font-bold">{Math.round(statistics.averageProcessingTime)}ms</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    per export
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold">{scheduledExports.filter(s => s.enabled).length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    active schedules
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Exports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Exports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentExports.length === 0 ? ()
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-muted-foreground">No recent exports</p>
                    <Button 
                      className="mt-4"
                      onClick={() => handleQuickExport()}
                    >
                      Create Your First Export
                    </Button>
                  </div>
                ) : ()
                  <div className="space-y-3">
                    {recentExports.map((export_) => ()
                      <div key={export_.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={export_.success ? 'default' : 'destructive'}>
                              {export_.format.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium">{export_.filename}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(export_.generatedAt).toLocaleDateString()} • 
                            {Math.round(export_.size / 1024)} KB
                          </p>
                        </div>
                        {export_.success && export_.downloadUrl && ()
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Active Schedules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Active Schedules
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSchedules.length === 0 ? ()
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-muted-foreground">No active schedules</p>
                    {allowScheduling && ()
                      <Button 
                        className="mt-4"
                        variant="outline"
                        onClick={() => {
                          setCurrentReportData(generateSampleReportData());
                          setExportModalOpen(true);
                        }}
                      >
                        Schedule Export
                      </Button>
                    )}
                  </div>
                ) : ()
                  <div className="space-y-3">
                    {recentSchedules.map((schedule) => ()
                      <div key={schedule.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{schedule.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {schedule.schedule.frequency} at {schedule.schedule.time}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {schedule.exportConfig.format.toUpperCase()}
                          </Badge>
                        </div>
                        {schedule.nextRun && ()
                          <p className="text-xs text-muted-foreground mt-2">
                            Next: {new Date(schedule.nextRun).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="quick-actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quick Export Buttons */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleQuickExport()}>
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 mx-auto mb-3 text-red-500" />
                <h3 className="font-semibold">Export as PDF</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Professional document format
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleQuickExport()}>
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold">Export as Excel</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Spreadsheet with data analysis
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleQuickExport()}>
              <CardContent className="p-6 text-center">
                <FileExport className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                <h3 className="font-semibold">Export as CSV</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Raw data for analysis
                </p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleQuickExport()}>
              <CardContent className="p-6 text-center">
                <Settings className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold">Export as JSON</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Structured data format
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Test Exports */}
          {showSampleData && ()
            <Card>
              <CardHeader>
                <CardTitle>Test Exports</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Try out different export formats with sample data
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {exportFormats?.formats.map((format) => ()
                    <Button
                      key={format}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestExport(format)}
                      disabled={isExporting}
                    >
                      Test {format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="history" className="space-y-6">
          <ExportHistoryPanel />
        </TabsContent>
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Formats */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                {exportFormats ? ()
                  <div className="space-y-2">
                    {exportFormats.formats.map((format) => ()
                      <div key={format} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{format.toUpperCase()}</span>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                    ))}
                  </div>
                ) : ()
                  <div className="animate-pulse space-y-2">
                    {[...Array(6)].map((_, i) => ()
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* System Features */}
            <Card>
              <CardHeader>
                <CardTitle>System Features</CardTitle>
              </CardHeader>
              <CardContent>
                {exportFormats?.supportedFeatures ? ()
                  <div className="space-y-3">
                    {Object.entries(exportFormats.supportedFeatures).map(([feature, enabled]) => ()
                      <div key={feature} className="flex items-center justify-between">
                        <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                        <Badge variant={enabled ? 'default' : 'secondary'}>
                          {enabled ? ()
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Enabled
                            </>
                          ) : ()
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Disabled
                            </>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : ()
                  <div className="animate-pulse space-y-3">
                    {[...Array(8)].map((_, i) => ()
                      <div key={i} className="h-6 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* System Info */}
          <Alert>
            <Settings className="w-4 h-4" />
            <AlertDescription>
              The export system supports multiple formats, delivery methods, and scheduling options. 
              Configure export settings in the export modal for customized report generation.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
      {/* Export Modal */}
      <ReportExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        reportData={currentReportData}
        title="Export Report"
      />
    </div>
  );
};

export default ReportExportPanel;