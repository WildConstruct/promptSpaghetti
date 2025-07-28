/**
 * Report Export Modal Component
 * 
 * Comprehensive UI for exporting reports in various formats with
 * delivery options and scheduling capabilities.
 * 
 * Task: T-1752989143998-788 - Add report export options
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  FileText, 
  Download, 
  Mail, 
  Webhook, 
  Clock, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

// Types
interface ReportData {
  metadata: {,
    title: string;
    description: string;
    generatedAt: Date;
    generatedBy: string;
    version: string;
  };
  summary: Record<string, unknown>;
  data: Array<Record<string, unknown>>;
}
interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'xml' | 'html';
  delivery: 'file' | 'email' | 'webhook' | 'api';
  filename?: string;
  options?: {
    includeCharts?: boolean;
    includeRawData?: boolean;
    compression?: boolean;
    encryption?: boolean;
    password?: string;
  };
  delivery_config?: {
    email?: {
      to: string[];
      subject: string;
      message?: string;
    };
    webhook?: {
      url: string;
      headers?: Record<string, string>;
      method?: 'POST' | 'PUT';
    };
  };
}
interface ExportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  downloadUrl?: string;
}
interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData | null;
  title?: string;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({)
  isOpen,
  onClose,
  reportData,
  title = 'Export Report'
}) => {
  const [activeTab, setActiveTab] = useState('export');
  const [exportConfig, setExportConfig] = useState<ExportConfig>({)
    format: 'pdf',
    delivery: 'file',
    options: {,
      includeCharts: true,
      includeRawData: true,
      compression: false,
      encryption: false,
    }
  });
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState(1);
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setExportStatus(null);
      setIsExporting(false);
      setActiveTab('export');
    }
  }, [isOpen]);
  // Handle export configuration changes
  const updateExportConfig = (updates: Partial<ExportConfig>) => {
    setExportConfig(prev => ({)
      ...prev,
      ...updates,
      options: { ...prev.options, ...updates.options }
    }));
  };
  // Handle immediate export
  const handleExport = async () => {
    if (!reportData) return;
    setIsExporting(true);
    setExportStatus({)
      id: 'temp-' + Date.now(),
      status: 'processing',
      progress: 0,
    });
    try {
      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        setExportStatus(prev => prev ? { ...prev, progress } : null);
      }, 500);
      const response = await fetch('/api/reports/export', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({),
          reportData,
          config: exportConfig,
        })
      });
      clearInterval(progressInterval);
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);}
      }
      const result = await response.json();
      setExportStatus({)
        id: result.data.id,
        status: 'completed',
        progress: 100,
        downloadUrl: result.data.downloadUrl,
      });
    } catch (error) {
      setExportStatus({)
        id: 'error-' + Date.now(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Export failed',
      });
    } finally {
      setIsExporting(false);
    }
  };
  // Handle scheduled export
  const handleScheduleExport = async () => {
    if (!reportData) return;
    try {
      const response = await fetch('/api/reports/schedule', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({),
          name: scheduleName,
          description: scheduleDescription,
          reportQuery: 'dynamic', // Would be replaced with actual query
          exportConfig,
          schedule: {,
            frequency: scheduleFrequency,
            time: scheduleTime,
            dayOfWeek: scheduleDayOfWeek,
          },
          enabled: true,
        })
      });
      if (!response.ok) {
        throw new Error(`Scheduling failed: ${response.statusText}`);}
      }
      // Show success and switch to export tab
      setActiveTab('export');
    } catch (error) {
      console.error('Failed to schedule export:', error);
    }
  };
  // Handle download
  const handleDownload = () => {
    if (exportStatus?.downloadUrl) {
      window.open(exportStatus.downloadUrl, '_blank');
    }
  };
  const formatOptions = [;
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileText },
    { value: 'csv', label: 'CSV File', icon: FileText },
    { value: 'json', label: 'JSON Data', icon: FileText },
    { value: 'xml', label: 'XML Document', icon: FileText },
    { value: 'html', label: 'HTML Report', icon: FileText }
  ];
  const deliveryOptions = [;
    { value: 'file', label: 'File Download', icon: Download },
    { value: 'email', label: 'Email Delivery', icon: Mail },
    { value: 'webhook', label: 'Webhook', icon: Webhook }
  ];
  return ()
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Now
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule Export
            </TabsTrigger>
          </TabsList>
          <TabsContent value="export" className="space-y-6">
            {/* Export Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Format Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Export Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  {formatOptions.map((option) => ()
                    <Button
                      key={option.value}
                      variant={exportConfig.format === option.value ? 'default' : 'outline'}
                      className="justify-start h-auto p-3"
                      onClick={() => updateExportConfig({ format: option.value as 'pdf' | 'excel' | 'csv' | 'json' | 'xml' | 'html' })}
                    >
                      <option.icon className="w-4 h-4 mr-2" />
                      <span className="text-sm">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              {/* Delivery Method */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Delivery Method</Label>
                <div className="space-y-2">
                  {deliveryOptions.map((option) => ()
                    <Button
                      key={option.value}
                      variant={exportConfig.delivery === option.value ? 'default' : 'outline'}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => updateExportConfig({ delivery: option.value as 'file' | 'email' | 'webhook' | 'api' })}
                    >
                      <option.icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {/* Export Options */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Export Options</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={exportConfig.options?.includeCharts}
                    onCheckedChange={(checked) => 
                      updateExportConfig({ options: { includeCharts: !!checked } })
                    }
                  />
                  <Label>Include Charts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={exportConfig.options?.includeRawData}
                    onCheckedChange={(checked) => 
                      updateExportConfig({ options: { includeRawData: !!checked } })
                    }
                  />
                  <Label>Include Raw Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={exportConfig.options?.compression}
                    onCheckedChange={(checked) => 
                      updateExportConfig({ options: { compression: !!checked } })
                    }
                  />
                  <Label>Enable Compression</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={exportConfig.options?.encryption}
                    onCheckedChange={(checked) => 
                      updateExportConfig({ options: { encryption: !!checked } })
                    }
                  />
                  <Label>Enable Encryption</Label>
                </div>
              </div>
            </div>
            {/* Custom Filename */}
            <div className="space-y-2">
              <Label htmlFor="filename">Custom Filename (optional)</Label>
              <Input
                id="filename"
                placeholder="report-export"
                value={exportConfig.filename || ''}
                onChange={(e) => updateExportConfig({ filename: e.target.value })}
              />
            </div>
            {/* Email Configuration */}
            {exportConfig.delivery === 'email' && ()
              <div className="space-y-4 p-4 border rounded-lg">
                <Label className="text-base font-semibold">Email Configuration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-to">Recipients (comma-separated)</Label>
                    <Input
                      id="email-to"
                      placeholder="user@example.com, manager@example.com"
                      onChange={(e) => {
                        const emails = e.target.value.split(',').map(email => email.trim());
                        updateExportConfig({)
                          delivery_config: {,
                            ...exportConfig.delivery_config,
                            email: {,
                              ...exportConfig.delivery_config?.email,
                              to: emails,
                            }
                          }
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject</Label>
                    <Input
                      id="email-subject"
                      placeholder="Report Export"
                      onChange={(e) => {
                        updateExportConfig({)
                          delivery_config: {,
                            ...exportConfig.delivery_config,
                            email: {,
                              ...exportConfig.delivery_config?.email,
                              to: exportConfig.delivery_config?.email?.to || [],
                              subject: e.target.value,
                            }
                          }
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-message">Message (optional)</Label>
                  <Textarea
                    id="email-message"
                    placeholder="Please find the attached report..."
                    onChange={(e) => {
                      updateExportConfig({)
                        delivery_config: {,
                          ...exportConfig.delivery_config,
                          email: {,
                            ...exportConfig.delivery_config?.email,
                            to: exportConfig.delivery_config?.email?.to || [],
                            subject: exportConfig.delivery_config?.email?.subject || '',
                            message: e.target.value,
                          }
                        }
                      });
                    }}
                  />
                </div>
              </div>
            )}
            {/* Export Status */}
            {exportStatus && ()
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {exportStatus.status === 'processing' && ()
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Exporting report...</span>
                    </>
                  )}
                  {exportStatus.status === 'completed' && ()
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Export completed successfully!</span>
                    </>
                  )}
                  {exportStatus.status === 'failed' && ()
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Export failed</span>
                    </>
                  )}
                </div>
                {exportStatus.progress !== undefined && exportStatus.status === 'processing' && ()
                  <Progress value={exportStatus.progress} className="w-full" />
                )}
                {exportStatus.error && ()
                  <Alert variant="destructive">
                    <AlertDescription>{exportStatus.error}</AlertDescription>
                  </Alert>
                )}
                {exportStatus.status === 'completed' && exportStatus.downloadUrl && ()
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </div>
            )}
            {/* Export Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                disabled={!reportData || isExporting}
                className="flex-1"
              >
                {isExporting ? ()
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : ()
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="schedule" className="space-y-6">
            {/* Schedule Configuration */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-name">Schedule Name</Label>
                <Input
                  id="schedule-name"
                  placeholder="Weekly Performance Report"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-description">Description</Label>
                <Textarea
                  id="schedule-description"
                  placeholder="Automated weekly report for team review"
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={scheduleFrequency} onValueChange={(value: Error) => setScheduleFrequency(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
                {scheduleFrequency === 'weekly' && ()
                  <div className="space-y-2">
                    <Label>Day of Week</Label>
                    <Select value={scheduleDayOfWeek.toString()} onValueChange={(value) => setScheduleDayOfWeek(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="0">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            {/* Use same export configuration from first tab */}
            <Alert>
              <Settings className="w-4 h-4" />
              <AlertDescription>
                The scheduled export will use the same format and delivery settings configured in the Export tab.
              </AlertDescription>
            </Alert>
            {/* Schedule Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleScheduleExport}
                disabled={!scheduleName || !reportData}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-2" />
                Schedule Export
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ReportExportModal;