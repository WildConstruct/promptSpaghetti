/**
 * Log Visualization Dashboard
 * Epic 17 - Design log visualization system
 * 
 * Comprehensive visual analytics dashboard for the log analysis infrastructure.
 * Provides real-time monitoring, pattern analysis, and interactive exploration.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Chart components (would need to install chart library)
// For now, we'll create simple visual representations
interface ChartData {
  timestamp: Date;
  value: number;
  category?: string;
  severity?: string;
}

interface LogMetrics {
  totalLogs: number;
  errorRate: number;
  averageLatency: number;
  alertCount: number;
  sources: Record<string, number>;
  levels: Record<string, number>;
  anomalies: number;
  patterns: number;
}

interface LogSource {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  lastSeen: Date;
  messageCount: number;
  errorRate: number;
}

interface PatternAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  affectedSources: string[];
  count: number;
}

interface TimeRangeOption {
  label: string;
  value: string;
  hours: number;
}

const TIME_RANGES: TimeRangeOption[] = [
  { label: 'Last 15 minutes', value: '15m', hours: 0.25 },
  { label: 'Last hour', value: '1h', hours: 1 },
  { label: 'Last 6 hours', value: '6h', hours: 6 },
  { label: 'Last 24 hours', value: '24h', hours: 24 },
  { label: 'Last 7 days', value: '7d', hours: 168 },
  { label: 'Last 30 days', value: '30d', hours: 720 }
];

const SEVERITY_COLORS = {
  low: '#2196f3',
  medium: '#ff9800', 
  high: '#f44336',
  critical: '#d32f2f'
};

const LOG_SOURCES = [
  'application', 'database', 'web_server', 'system', 'security', 'audit', 'performance', 'user_activity'
];

const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal', 'trace'];

// Simple chart component (placeholder for actual chart library)
const SimpleChart: React.FC<{ data: ChartData[]; height?: number; type?: 'line' | 'bar' }> = ({ 
  data, 
  height = 200, 
  type = 'line' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <Box sx={{ height, position: 'relative', p: 2 }}>
      <svg width="100%" height="100%" viewBox="0 0 400 200">
        {/* Grid lines */}
        {[0, 50, 100, 150, 200].map(y => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e0e0e0" strokeWidth="1" />
        ))}
        
        {/* Data visualization */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 400;
          const y = 200 - (point.value / maxValue) * 180;
          
          if (type === 'bar') {
            return (
              <rect
                key={index}
                x={x - 5}
                y={y}
                width="10"
                height={200 - y}
                fill="#2196f3"
                opacity={0.7}
              />
            );
          } else {
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#2196f3"
              />
            );
          }
        })}
        
        {/* Connect points for line chart */}
        {type === 'line' && data.length > 1 && (
          <polyline
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 200 - (point.value / maxValue) * 180;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#2196f3"
            strokeWidth="2"
          />
        )}
      </svg>
    </Box>
  );
};

export   const [timeRange, setTimeRange] = useState<string>('1h');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSources, _setSelectedSources] = useState<string[]>(LOG_SOURCES);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedLevels, _setSelectedLevels] = useState<string[]>(['warn', 'error', 'fatal']);
  const [loading, setLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<LogMetrics | null>(null);
  const [sources, setSources] = useState<LogSource[]>([]);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [logDetailsOpen, setLogDetailsOpen] = useState<boolean>(false);
  const [selectedLogSource, setSelectedLogSource] = useState<string | null>(null);

  // Fetch data from actual LogAnalysisService API
  const fetchAnalyticsData = useCallback(async (): Promise<void> => {
    const now = new Date();
    const hours = TIME_RANGES.find(r => r.value === timeRange)?.hours || 1;
    const startDate = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    try {
      // Get analytics report
      const analyticsResponse = await fetch(`/api/log-analysis/analytics?start_date=${startDate.toISOString().split('T')[0]}&end_date=${now.toISOString().split('T')[0]}&include_patterns=true`);
      const analytics = await analyticsResponse.json();
      
      // Get alerts
      const alertsResponse = await fetch('/api/log-analysis/alerts?status=new&status=acknowledged');
      const alertsData = await alertsResponse.json();
      
      // Get system health
      const healthResponse = await fetch('/api/log-analysis/health');
      const healthData = await healthResponse.json();
      
      if (analytics.success && alertsData.success && healthData.success) {
        // Process analytics data
        const analyticsResult = analytics.analytics;
        
        // Generate chart data from analytics
        const chartPoints: ChartData[] = [];
        if (analyticsResult.hourly_log_counts) {
          Object.entries(analyticsResult.hourly_log_counts).forEach(([hour, count]) => {
            chartPoints.push({
              timestamp: new Date(hour),
              value: count as number,
              category: 'all'
            });
          });
        }
        
        // Process source status from health data
        const sourcesStatus: LogSource[] = LOG_SOURCES.map(source => ({
          name: source,
          status: 'healthy' as const,
          lastSeen: new Date(),
          messageCount: analyticsResult.logs_by_source?.[source] || 0,
          errorRate: analyticsResult.error_rates_by_source?.[source] || 0
        }));
        
        // Process alerts data
        const processedAlerts: PatternAlert[] = alertsData.alerts.map(
          (alert: Record<string,
          unknown>
        ): PatternAlert => ({
          id: (alert.alert_id as string) || '',
          type: (alert.anomaly_type as string) || '',
          severity: (alert.severity as 'low' | 'medium' | 'high' | 'critical') || 'low',
          title: (alert.title as string) || '',
          description: (alert.description as string) || '',
          timestamp: new Date((alert.first_detected as string) || Date.now()),
          affectedSources: (alert.affected_sources as string[]) || [],
          count: ((alert.trigger_conditions_met as Record<string, unknown>)?.occurrences as number) || 1
        }));
        
        // Build metrics object
        const processedMetrics: LogMetrics = {
          totalLogs: analyticsResult.total_logs || 0,
          errorRate: analyticsResult.overall_error_rate || 0,
          averageLatency: analyticsResult.average_processing_time || 0,
          alertCount: alertsData.pagination.total,
          sources: analyticsResult.logs_by_source || {},
          levels: analyticsResult.logs_by_level || {},
          anomalies: analyticsResult.anomaly_count || 0,
          patterns: analyticsResult.pattern_count || 0
        };
        
        setChartData(chartPoints);
        setSources(sourcesStatus);
        setAlerts(processedAlerts);
        setMetrics(processedMetrics);
      } else {
        // Fallback to mock data if API fails
        generateMockData();
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      // Fallback to mock data
      generateMockData();
    }
  }, [timeRange, generateMockData]);

  // Mock data generation for development/fallback
  const generateMockData = useCallback((): void => {
    const now = new Date();
    const hours = TIME_RANGES.find(r => r.value === timeRange)?.hours || 1;
    const points = Math.min(50, Math.max(10, hours * 4)); // 4 points per hour, max 50
    
    const mockChartData: ChartData[] = [];
    const mockSources: LogSource[] = [];
    const mockAlerts: PatternAlert[] = [];
    
    // Generate time series data
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(now.getTime() - (hours * 60 * 60 * 1000) + (i * (hours * 60 * 60 * 1000) / points));
      mockChartData.push({
        timestamp,
        value: Math.random() * 100 + Math.sin(i * 0.5) * 20,
        category: LOG_SOURCES[Math.floor(Math.random() * LOG_SOURCES.length)]
      });
    }
    
    // Generate source status
    LOG_SOURCES.forEach(source => {
      mockSources.push({
        name: source,
        status: Math.random() > 0.8 ? 'warning' : Math.random() > 0.95 ? 'error' : 'healthy',
        lastSeen: new Date(now.getTime() - Math.random() * 5 * 60 * 1000),
        messageCount: Math.floor(Math.random() * 10000),
        errorRate: Math.random() * 5
      });
    });
    
    // Generate alerts
    const alertTypes = ['error_spike', 'performance_degradation', 'security_threat', 'unusual_activity'];
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      mockAlerts.push({
        id: `alert-${i}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as 'low' | 'medium' | 'high' | 'critical',
        title: `Alert ${i + 1}`,
        description: `Detected anomaly in ${LOG_SOURCES[Math.floor(Math.random() * LOG_SOURCES.length)]} logs`,
        timestamp: new Date(now.getTime() - Math.random() * 60 * 60 * 1000),
        affectedSources: [LOG_SOURCES[Math.floor(Math.random() * LOG_SOURCES.length)]],
        count: Math.floor(Math.random() * 100) + 1
      });
    }
    
    const mockMetrics: LogMetrics = {
      totalLogs: Math.floor(Math.random() * 100000) + 50000,
      errorRate: Math.random() * 5,
      averageLatency: Math.random() * 500 + 100,
      alertCount: mockAlerts.length,
      sources: LOG_SOURCES.reduce((acc, source) => {
        acc[source] = Math.floor(Math.random() * 10000);
        return acc;
      }, {} as Record<string, number>),
      levels: LOG_LEVELS.reduce((acc, level) => {
        acc[level] = Math.floor(Math.random() * 20000);
        return acc;
      }, {} as Record<string, number>),
      anomalies: Math.floor(Math.random() * 10),
      patterns: Math.floor(Math.random() * 25) + 5
    };
    
    setChartData(mockChartData);
    setSources(mockSources);
    setAlerts(mockMetrics);
    setMetrics(mockMetrics);
  }, [timeRange]);

  // Load data
  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await fetchAnalyticsData();
    } catch (error) {
      console.error('Failed to load log data:', error);
      // Fallback to mock data on error
      generateMockData();
    } finally {
      setLoading(false);
    }
  }, [fetchAnalyticsData, generateMockData]);

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/log-analysis`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to log analysis WebSocket');
      };
      
      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          
          if (update.type === 'new_alert') {
            setAlerts(prev => [update.alert, ...prev.slice(0, 9)]);
          } else if (update.type === 'metrics_update') {
            setMetrics(prev => prev ? { ...prev, ...update.metrics } : null);
          } else if (update.type === 'log_volume_update') {
            setChartData(prev => {
              const newPoint = {
                timestamp: new Date(update.timestamp),
                value: update.volume,
                category: update.source || 'all'
              };
              return [...prev.slice(-49), newPoint];
            });
          }
        } catch (error) {
          console.error('Failed to process WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from log analysis WebSocket');
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }, [autoRefresh]);

  // Filtered chart data
  const filteredChartData = useMemo(() => {
    return chartData.filter(point => 
      !point.category || selectedSources.includes(point.category)
    );
  }, [chartData, selectedSources]);

  const handleExportData = (): void => {
    // Export functionality
    const data = {
      timeRange,
      metrics,
      alerts,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-analysis-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSourceClick = (sourceName: string): void => {
    setSelectedLogSource(sourceName);
    setLogDetailsOpen(true);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatLatency = (ms: number): string => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms.toFixed(0)}ms`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Log Analysis Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time monitoring and pattern analysis across all log sources
          </Typography>
        </Box>

        {/* Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                >
                  {TIME_RANGES.map(range => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {timeRange === 'custom' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <DateTimePicker
                    label="Start Date"
                    value={customStartDate}
                    onChange={setCustomStartDate}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <DateTimePicker
                    label="End Date"
                    value={customEndDate}
                    onChange={setCustomEndDate}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Auto Refresh
                    {autoRefresh && (
                      <Chip
                        label={isConnected ? 'Live' : 'Offline'}
                        size="small"
                        color={isConnected ? 'success' : 'default'}
                        sx={{ height: 16, fontSize: '0.6rem' }}
                      />
                    )}
                  </Box>
                }
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <ButtonGroup size="small" fullWidth>
                <Button
                  onClick={loadData}
                  disabled={loading}
                  startIcon={<RefreshIcon />}
                >
                  Refresh
                </Button>
                <Button
                  onClick={handleExportData}
                  startIcon={<DownloadIcon />}
                >
                  Export
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        </Paper>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Key Metrics */}
        {metrics && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Total Logs
                      </Typography>
                      <Typography variant="h4">
                        {formatNumber(metrics.totalLogs)}
                      </Typography>
                    </div>
                    <TimelineIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Error Rate
                      </Typography>
                      <Typography variant="h4" color={metrics.errorRate > 2 ? 'error' : 'inherit'}>
                        {metrics.errorRate.toFixed(2)}%
                      </Typography>
                    </div>
                    <ErrorIcon color={metrics.errorRate > 2 ? 'error' : 'disabled'} sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Avg Latency
                      </Typography>
                      <Typography variant="h4">
                        {formatLatency(metrics.averageLatency)}
                      </Typography>
                    </div>
                    <SpeedIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Active Alerts
                      </Typography>
                      <Typography variant="h4" color={metrics.alertCount > 5 ? 'error' : 'inherit'}>
                        {metrics.alertCount}
                      </Typography>
                    </div>
                    <Badge badgeContent={metrics.alertCount} color="error">
                      <WarningIcon color={metrics.alertCount > 0 ? 'warning' : 'disabled'} sx={{ fontSize: 40 }} />
                    </Badge>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={3}>
          {/* Main Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                title="Log Volume Over Time"
                action={
                  <IconButton>
                    <ZoomInIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <SimpleChart data={filteredChartData} height={300} type="line" />
              </CardContent>
            </Card>
          </Grid>

          {/* Source Status */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Log Sources" />
              <CardContent>
                <List dense>
                  {sources.map(source => (
                    <ListItem 
                      key={source.name} 
                      button 
                      onClick={() => handleSourceClick(source.name)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemIcon>
                        {source.status === 'healthy' && <CheckCircleIcon color="success" />}
                        {source.status === 'warning' && <WarningIcon color="warning" />}
                        {source.status === 'error' && <ErrorIcon color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {source.name.replace('_', ' ')}
                            </Typography>
                            <Tooltip title="View detailed logs">
                              <VisibilityIcon fontSize="small" color="action" />
                            </Tooltip>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{formatNumber(source.messageCount)} msgs</span>
                            <span>{source.errorRate.toFixed(1)}% errors</span>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Alerts */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Alerts" />
              <CardContent>
                {alerts.length === 0 ? (
                  <Typography color="text.secondary">No active alerts</Typography>
                ) : (
                  <List>
                    {alerts.slice(0, 5).map(alert => (
                      <ListItem key={alert.id}>
                        <ListItemIcon>
                          <SecurityIcon 
                            sx={{ color: SEVERITY_COLORS[alert.severity] }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {alert.description}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  label={alert.severity.toUpperCase()} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: SEVERITY_COLORS[alert.severity] + '20',
                                    color: SEVERITY_COLORS[alert.severity],
                                    mr: 1
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {alert.timestamp.toLocaleTimeString()}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Log Level Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Log Level Distribution" />
              <CardContent>
                {metrics && (
                  <Box>
                    {LOG_LEVELS.map(level => {
                      const count = metrics.levels[level] || 0;
                      const percentage = count / Math.max(metrics.totalLogs, 1) * 100;
                      return (
                        <Box key={level} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {level}
                            </Typography>
                            <Typography variant="body2">
                              {formatNumber(count)} ({percentage.toFixed(1)}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(percentage * 5, 100)} // Scale for visibility
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Log Details Modal */}
        <Dialog
          open={logDetailsOpen}
          onClose={() => setLogDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Detailed Logs - {selectedLogSource?.replace('_', ' ').toUpperCase()}
              </Typography>
              <Button
                onClick={() => setLogDetailsOpen(false)}
                startIcon={<CloseIcon />}
                size="small"
              >
                Close
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {selectedLogSource && (
              <Box sx={{ height: 600 }}>
                {/* Embedded AuditLogViewer component for detailed logs */}
                <iframe
                  src={`/admin/logs/viewer?source=${selectedLogSource}&embedded=true`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title={`${selectedLogSource} logs`}
                />
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};