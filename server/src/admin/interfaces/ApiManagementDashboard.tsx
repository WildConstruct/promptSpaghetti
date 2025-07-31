/**
 * API Management Dashboard - Epic 17.4.4 API Management System Design
 * 
 * Comprehensive admin interface for managing API keys, monitoring usage,
 * and controlling access across the Wild Construct platform.
 * 
 * Task: E17-1753114397211-324330 - Design API management system
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Visibility,
  Security,
  Timeline,
  Warning,
  CheckCircle,
  Block,
  Speed,
  Analytics,
  Download,
  Refresh,
  FilterList,
  Search
} from '@mui/icons-material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

}
}
interface ApiKey {
  keyId: string;
  keyPrefix: string;
  name: string;
  description?: string;
  scopes: string[];
  status: 'active' | 'revoked' | 'expired' | 'suspended';
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
}
}
  };
  userName: string;
  userEmail: string;
  metadata: {
    totalCalls: number;
    lastMonth: number;
    errorCount: number;
    rotationCount: number;
    purpose: string;
  };
}

}
}
interface SecurityAlert {
  id: string;
  type: 'rate_limit' | 'error_spike' | 'unusual_activity' | 'security_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  keyId?: string;
  resolved: boolean;
}
}
}

}
}
interface UsageMetrics {
  [keyId: string]: {
    keyId: string;
    name: string;
    userEmail: string;
    calls24H: number;
    errorRate: number;
    averageResponseTime: number;
    rateLimitHits: number;
    topEndpoints: Array<{
      endpoint: string;
      calls: number;
      errorRate: number;
}
}
    }>;
  };
}

const ApiManagementDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<UsageMetrics>({});
  const [statistics, setStatistics] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');

  // Fetch API keys with pagination and filtering
  const fetchApiKeys = useCallback(async (params: {
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      
      if (params.status && params.status !== 'all') {
        query.append('status', params.status);
      }
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.offset) query.append('offset', params.offset.toString());
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);

      const response = await fetch(`/api/api-keys/admin/all?${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      
      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch security alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/api-keys/admin/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.warn('Failed to fetch security alerts:', err);
    }
  }, []);

  // Fetch usage metrics
  const fetchMetrics = useCallback(async (timeRange: '1h' | '24h' | '7d' | '30d' = '24h') => {
    try {
      const response = await fetch(`/api/api-keys/admin/metrics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics || {});
      }
    } catch (err) {
      console.warn('Failed to fetch usage metrics:', err);
    }
  }, []);

  // Fetch global statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/api-keys/admin/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.globalStatistics || {});
      }
    } catch (err) {
      console.warn('Failed to fetch statistics:', err);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchApiKeys({ limit: 100 });
    fetchAlerts();
    fetchMetrics();
    fetchStatistics();
  }, [fetchApiKeys, fetchAlerts, fetchMetrics, fetchStatistics]);

  // Auto-refresh alerts and metrics
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlerts();
      fetchMetrics();
      fetchStatistics();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [fetchAlerts, fetchMetrics, fetchStatistics]);

  // Filter API keys based on search and filters
  const filteredApiKeys = apiKeys.filter(key => {
    const matchesSearch = searchQuery === '' || 
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
    
    const matchesScope = scopeFilter === 'all' || 
      key.scopes.some(scope => scope.includes(scopeFilter));

    return matchesSearch && matchesStatus && matchesScope;
  });

  // Handle API key operations
  const handleRevokeKey = async (keyId: string, reason: string = 'Admin revocation') => {
    try {
      const response = await fetch('/api/api-keys/admin/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, reason })
      });

      if (response.ok) {
        await fetchApiKeys({ status: statusFilter !== 'all' ? statusFilter : undefined });
        setError(null);
      } else {
        throw new Error('Failed to revoke API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleSuspendKey = async (keyId: string, reason: string, duration: string = '24h') => {
    try {
      const response = await fetch('/api/api-keys/admin/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, reason, duration })
      });

      if (response.ok) {
        await fetchApiKeys({ status: statusFilter !== 'all' ? statusFilter : undefined });
        setError(null);
      } else {
        throw new Error('Failed to suspend API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUpdateRateLimits = async (keyId: string, rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  }) => {
    try {
      const response = await fetch('/api/api-keys/admin/rate-limits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, rateLimits })
      });

      if (response.ok) {
        await fetchApiKeys({ status: statusFilter !== 'all' ? statusFilter : undefined });
        setError(null);
      } else {
        throw new Error('Failed to update rate limits');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Get status color
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
    case 'active': return 'success';
    case 'suspended': return 'warning';
    case 'revoked': return 'error';
    case 'expired': return 'secondary';
    default: return 'default';
    }
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (severity) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'default';
    default: return 'default';
    }
  };

  // Render overview dashboard
  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Key Statistics Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" color="primary">Total Keys</Typography>
              <Security color="primary" />
            </Box>
            <Typography variant="h4">{statistics.totalKeys || 0}</Typography>
            <Typography variant="body2" color="textSecondary">
              {statistics.activeKeys || 0} active
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" color="success.main">Active Usage</Typography>
              <Timeline color="success" />
            </Box>
            <Typography variant="h4">{statistics.keysUsedLast24Hours || 0}</Typography>
            <Typography variant="body2" color="textSecondary">
              Last 24 hours
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" color="warning.main">Alerts</Typography>
              <Badge badgeContent={alerts.filter(a => !a.resolved).length} color="error">
                <Warning color="warning" />
              </Badge>
            </Box>
            <Typography variant="h4">{alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length}</Typography>
            <Typography variant="body2" color="textSecondary">
              High/Critical
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" color="info.main">Avg Key Age</Typography>
              <Analytics color="info" />
            </Box>
            <Typography variant="h4">{statistics.averageKeyAge || 0}</Typography>
            <Typography variant="body2" color="textSecondary">
              Days
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Usage Chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Usage Over Time
            </Typography>
            {/* Placeholder for usage chart */}
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Typography color="textSecondary">
                Usage chart would be rendered here with real-time data
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Security Alerts */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Security Alerts
            </Typography>
            <Box maxHeight={300} overflow="auto">
              {alerts.slice(0, 5).map((alert) => (
                <Alert
                  key={alert.id}
                  severity={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    {alert.type.replace('_', ' ').toUpperCase()}
                  </Typography>
                  <Typography variant="caption">
                    {alert.message}
                  </Typography>
                </Alert>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Scopes Usage */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Popular API Scopes
            </Typography>
            {statistics.topScopes?.slice(0, 5).map((scope: any, index: number) => (
              <Box key={scope.scope} display="flex" alignItems="center" mb={1}>
                <Typography variant="body2" sx={{ minWidth: 120 }}>
                  {scope.scope}
                </Typography>
                <Box flexGrow={1} mx={2}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(scope.count / (statistics.topScopes?.[0]?.count || 1)) * 100}
                  />
                </Box>
                <Typography variant="caption">
                  {scope.count}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Key Status Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Status Distribution
            </Typography>
            <Box height={200} display="flex" alignItems="center" justifyContent="center">
              {/* Placeholder for doughnut chart */}
              <Typography color="textSecondary">
                Status distribution chart would be rendered here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render API keys management
  const renderKeysManagement = () => (
    <Box>
      {/* Controls */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="revoked">Revoked</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Scope</InputLabel>
            <Select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}>
              <MenuItem value="all">All Scopes</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="write">Write</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Button
            startIcon={<Refresh />}
            onClick={() => fetchApiKeys({ status: statusFilter !== 'all' ? statusFilter : undefined })}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
          >
            Create Key
          </Button>
        </Box>
      </Box>

      {/* Keys Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Scopes</TableCell>
              <TableCell>Usage (24h)</TableCell>
              <TableCell>Last Used</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredApiKeys.map((key) => (
              <TableRow key={key.keyId}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {key.keyPrefix}...
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {key.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{key.userName}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {key.userEmail}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={key.status.toUpperCase()} 
                    size="small" 
                    color={getStatusColor(key.status)}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    {key.scopes.slice(0, 2).map((scope) => (
                      <Chip key={scope} label={scope} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                    {key.scopes.length > 2 && (
                      <Chip label={`+${key.scopes.length - 2}`} size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {metrics[key.keyId]?.calls24H || 0} calls
                  </Typography>
                  <Typography variant="caption" color={
                    (metrics[key.keyId]?.errorRate || 0) > 0.1 ? 'error' : 'textSecondary'
                  }>
                    {((metrics[key.keyId]?.errorRate || 0) * 100).toFixed(1)}% errors
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {key.lastUsedAt 
                      ? format(new Date(key.lastUsedAt), 'MMM dd, HH:mm')
                      : 'Never'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => {
                      setSelectedKey(key);
                      setShowKeyDialog(true);
                    }}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Suspend">
                    <IconButton 
                      size="small" 
                      onClick={() => handleSuspendKey(key.keyId, 'Admin suspension')}
                      disabled={key.status !== 'active'}
                    >
                      <Block />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Revoke">
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleRevokeKey(key.keyId)}
                      disabled={key.status === 'revoked'}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  // Render analytics
  const renderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Usage Analytics
            </Typography>
            <Typography color="textSecondary">
              Comprehensive analytics dashboard would be implemented here with:
            </Typography>
            <Box component="ul" mt={2}>
              <li>Real-time API call monitoring</li>
              <li>Performance metrics and response time analysis</li>
              <li>Error rate tracking and alerting</li>
              <li>Usage patterns and trends</li>
              <li>Rate limit compliance monitoring</li>
              <li>Geographical usage distribution</li>
              <li>Cost allocation and billing integration</li>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render security monitoring
  const renderSecurity = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Monitoring & Alerts
            </Typography>
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'}
                sx={{ mb: 2 }}
                action={
                  <Button size="small">
                    Investigate
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight="medium">
                  {alert.type.replace('_', ' ').toUpperCase()} - {alert.severity.toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  {alert.message}
                </Typography>
                <Typography variant="caption">
                  {format(alert.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                  {alert.keyId && ` - Key: ${alert.keyId.slice(0, 8)}...`}
                </Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        API Management Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Comprehensive management and monitoring of API keys, usage, and security
      </Typography>

      <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="API Keys" />
        <Tab label="Analytics" />
        <Tab label="Security" />
      </Tabs>

      {currentTab === 0 && renderOverview()}
      {currentTab === 1 && renderKeysManagement()}
      {currentTab === 2 && renderAnalytics()}
      {currentTab === 3 && renderSecurity()}

      {/* Key Details Dialog */}
      <Dialog open={showKeyDialog} onClose={() => setShowKeyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>API Key Details</DialogTitle>
        <DialogContent>
          {selectedKey && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Key ID</Typography>
                  <Typography variant="body1" fontFamily="monospace">{selectedKey.keyId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Prefix</Typography>
                  <Typography variant="body1" fontFamily="monospace">{selectedKey.keyPrefix}...</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{selectedKey.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Status</Typography>
                  <Chip label={selectedKey.status} color={getStatusColor(selectedKey.status)} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Scopes</Typography>
                  <Box>
                    {selectedKey.scopes.map((scope) => (
                      <Chip key={scope} label={scope} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Created</Typography>
                  <Typography variant="body1">
                    {format(selectedKey.createdAt, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Last Used</Typography>
                  <Typography variant="body1">
                    {selectedKey.lastUsedAt 
                      ? format(selectedKey.lastUsedAt, 'MMM dd, yyyy HH:mm')
                      : 'Never'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Usage Stats</Typography>
                  <Typography variant="body1">
                    Total Calls: {selectedKey.metadata.totalCalls} | 
                    Last Month: {selectedKey.metadata.lastMonth} | 
                    Errors: {selectedKey.metadata.errorCount}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowKeyDialog(false)}>Close</Button>
          {selectedKey && selectedKey.status === 'active' && (
            <>
              <Button color="warning" onClick={() => {
                if (selectedKey) {
                  handleSuspendKey(selectedKey.keyId, 'Admin suspension');
                  setShowKeyDialog(false);
                }
              }}>
                Suspend
              </Button>
              <Button color="error" onClick={() => {
                if (selectedKey) {
                  handleRevokeKey(selectedKey.keyId);
                  setShowKeyDialog(false);
                }
              }}>
                Revoke
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiManagementDashboard;