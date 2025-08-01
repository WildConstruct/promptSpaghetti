/**
 * Export History Panel Component
 * 
 * Displays export history, scheduled exports, and management controls
 * for the report export system.
 * 
 * Task: T-1752989143998-788 - Add report export options
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// Alert and AlertDescription components were removed as unused
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
 from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
 from '../ui/dropdown-menu';
import {
  History,
  Clock,
  Download,
  Mail,
  Webhook,
  FileText,
  MoreHorizontal,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Play,
  Pause,
  Calendar
 from 'lucide-react';

// Types


interface ExportHistoryItem {
  id: string;,
  success: boolean;,
  format: string;,
  delivery: string;,
  filename: string;,
  size: number;,
  generatedAt: string;
  deliveredAt?: string;
  error?: string;
  downloadUrl?: string;
  metadata: {,
  recordCount: number;,
  processingTime: number;
  compressionRatio?: number;


};


interface ScheduledExport {
  id: string;,
  name: string;,
  description: string;,
  exportConfig: {,
  format: string;,
  delivery: string;


};
  schedule: {,
  frequency: string;
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
};
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  createdBy: string;


interface ExportStatistics {
  totalExports: number;,
  successfulExports: number;,
  failedExports: number;,
  averageProcessingTime: number;,
  formatBreakdown: Record<string, number>;
  deliveryBreakdown: Record<string, number>;
  export const ExportHistoryPanel: React.FC = () => {,
  const [activeTab, setActiveTab] = useState('history');
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem>([]);
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport>([]);
  const [statistics, setStatistics] = useState<ExportStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  // Load data on component mount
  useEffect(() => {
  loadExportData();


}, [loadExportData]);
  const loadExportData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await Promise.all([)
        loadExportHistory(),
        loadScheduledExports(),
        loadExportStatistics();
      ]);
 catch (error: unknown) {
  console.error('Failed to load export data:', error);
 finally {
      setIsLoading(false);
  }, [loadExportHistory, loadScheduledExports, loadExportStatistics]);
  const loadExportHistory = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`/api/reports/history?limit=100&format=${formatFilter !== 'all' ? formatFilter : ''}&delivery=${deliveryFilter !== 'all' ? deliveryFilter : ''}`);}
      const data = await response.json();
      if (data.success) {
        setExportHistory(data.data);
 catch (error: unknown) {
  console.error('Failed to load export history:', error);
}, [formatFilter, deliveryFilter]);
  const loadScheduledExports = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/reports/schedules');
      const data = await response.json();
      if (data.success) {
        setScheduledExports(data.data);
 catch (error: unknown) {
  console.error('Failed to load scheduled exports:', error);
}, []);
  const loadExportStatistics = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/reports/statistics');
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
 catch (error: unknown) {
  console.error('Failed to load export statistics:', error);
}, []);
  // Handle download
  const handleDownload = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };
  // Handle scheduled export toggle
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleScheduledExport = async (scheduleId: string, enabled: boolean): Promise<void> => {
    try {
      // This would be implemented with a PATCH endpoint
      // Reload data after update
      await loadScheduledExports();
 catch (error: unknown) {
  console.error('Failed to toggle scheduled export:', error);
};
  // Handle scheduled export deletion
  const deleteScheduledExport = async (scheduleId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/reports/schedules/${scheduleId}`, {)}
  },
  method: 'DELETE';
  });
      if (response.ok) {
        await loadScheduledExports();
 catch (error: unknown) {
  console.error('Failed to delete scheduled export:', error);
};
  // Filter export history based on search and filters
  const filteredHistory = exportHistory.filter(item => {)
  const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||;
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = formatFilter === 'all' || item.format === formatFilter;
    const matchesDelivery = deliveryFilter === 'all' || item.delivery === deliveryFilter;
    return matchesSearch && matchesFormat && matchesDelivery;
  });
  // Get format icon
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getFormatIcon = (_format: string) => {
    return <FileText className="w-4 h-4" />;
  };
  // Get delivery icon
  const getDeliveryIcon = (delivery: string) => {
  switch (delivery) {
  case 'email': return <Mail className="w-4 h-4" />;
  case 'webhook': return <Webhook className="w-4 h-4" />;
  default: return <Download className="w-4 h-4" />;
};
  // Get status badge
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusBadge = (success: boolean, _error?: string) => {
    if (success) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
 else {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
  };
  // Format file size
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };
  // Get day name for weekly schedules
  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };
  return;
    <div className="space-y-6">
      {/* Statistics Overview */}
      {statistics && ()
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Exports</p>
                  <p className="text-2xl font-bold">{statistics.totalExports}</p>
                </div>
                <History className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {statistics.totalExports > 0 
                      ? Math.round((statistics.successfulExports / statistics.totalExports) * 100)
                      : 0
%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Processing</p>
                  <p className="text-2xl font-bold">{Math.round(statistics.averageProcessingTime)}ms</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed Exports</p>
                  <p className="text-2xl font-bold">{statistics.failedExports}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Export History
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Scheduled Exports
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={loadExportData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />}
            Refresh
          </Button>
        </div>
        <TabsContent value="history" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search exports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Delivery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Delivery</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Export History Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? ()
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No export history found
                      </TableCell>
                    </TableRow>
                  ) : ()
                    filteredHistory.map((item) => ()
                      <TableRow key={item.id}>
                        <TableCell>
                          {getStatusBadge(item.success, item.error)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.filename}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFormatIcon(item.format)}
                            {item.format.toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeliveryIcon(item.delivery)}
                            {item.delivery}
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(item.size)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(item.generatedAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {item.success && item.downloadUrl && ()
                                <DropdownMenuItem onClick={() => handleDownload(item.downloadUrl!)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <FileText className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scheduled" className="space-y-4">
          {/* Scheduled Exports */}
          <div className="grid gap-4">
            {scheduledExports.length === 0 ? ()
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Scheduled Exports</h3>
                  <p className="text-muted-foreground">
                    Create your first scheduled export to automatically generate reports.
                  </p>
                </CardContent>
              </Card>
            ) : ()
              scheduledExports.map((schedule) => ()
                <Card key={schedule.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{schedule.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {schedule.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                          {schedule.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleScheduledExport(schedule.id, !schedule.enabled)}>
                              {schedule.enabled ? ()
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Disable
                                </>
                              ) : ()
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteScheduledExport(schedule.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Schedule</p>
                        <p className="text-muted-foreground">
                          {schedule.schedule.frequency === 'weekly' 
                            ? `${getDayName(schedule.schedule.dayOfWeek || 1)} at ${schedule.schedule.time}`}
                            : `${schedule.schedule.frequency} at ${schedule.schedule.time}`}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Format</p>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {getFormatIcon(schedule.exportConfig.format)}
                          {schedule.exportConfig.format.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Delivery</p>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {getDeliveryIcon(schedule.exportConfig.delivery)}
                          {schedule.exportConfig.delivery}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Next Run</p>
                        <p className="text-muted-foreground">
                          {schedule.nextRun ? formatDate(schedule.nextRun) : 'Not scheduled'}
                        </p>
                      </div>
                    </div>
                    {schedule.lastRun && ()
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          Last run: {formatDate(schedule.lastRun)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExportHistoryPanel;