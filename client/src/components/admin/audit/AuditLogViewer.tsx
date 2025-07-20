// Epic 17.1.6 - Audit Log Viewer Component

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText
  // Badge,
  // Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  // MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  GetApp as GetAppIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Types
interface AuditEvent {
  id: string;
  eventType: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actorId?: string;
  actorEmail?: string;
  actorName?: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  action: string;
  description: string;
  outcome: 'success' | 'failure' | 'partial';
  beforeValue?: unknown;
  afterValue?: unknown;
  changedFields?: string[];
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  tags: string[];
  timestamp: Date;
  duration?: number;
  error?: {
    code: string;
    message: string;
  };
}

interface AuditFilters {
  startDate?: Date;
  endDate?: Date;
  eventTypes: string[];
  categories: string[];
  severities: string[];
  outcomes: string[];
  actorEmails: string[];
  resourceTypes: string[];
  searchTerm: string;
}

interface AuditStatistics {
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  uniqueActors: number;
  eventsToday: number;
  eventsThisWeek: number;
  securityEvents: number;
}

const EVENT_CATEGORIES = [
  'authentication',
  'authorization',
  'data_modification',
  'system_configuration',
  'security',
  'compliance',
  'performance',
  'error'
];

const SEVERITIES = ['low', 'medium', 'high', 'critical'];
// const OUTCOMES = ['success', 'failure', 'partial'];

const SEVERITY_CONFIG = {
  low: { color: 'info', icon: InfoIcon },
  medium: { color: 'warning', icon: WarningIcon },
  high: { color: 'error', icon: ErrorIcon },
  critical: { color: 'error', icon: SecurityIcon }
};

const OUTCOME_CONFIG = {
  success: { color: 'success', icon: CheckCircleIcon },
  failure: { color: 'error', icon: ErrorIcon },
  partial: { color: 'warning', icon: WarningIcon }
};

export const AuditLogViewer: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalEvents, setTotalEvents] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState<AuditFilters>({
    eventTypes: [],
    categories: [],
    severities: [],
    outcomes: [],
    actorEmails: [],
    resourceTypes: [],
    searchTerm: ''
  });

  // UI State
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  // const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadAuditEvents();
    loadStatistics();
  }, [page, rowsPerPage, filters]);

  const loadAuditEvents = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const mockEvents: AuditEvent[] = [
        {
          id: 'audit_1',
          eventType: 'toggle_created',
          category: 'data_modification',
          severity: 'medium',
          actorId: 'user_1',
          actorEmail: 'admin@example.com',
          actorName: 'Admin User',
          resourceType: 'feature_toggle',
          resourceId: 'toggle_1',
          resourceName: 'New UI Features',
          action: 'create',
          description: 'Feature toggle "New UI Features" was created',
          outcome: 'success',
          afterValue: { name: 'New UI Features', enabled: false },
          sessionId: 'session_123',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          metadata: { toggleType: 'boolean', claudeImpact: 'none' },
          tags: ['feature', 'ui'],
          timestamp: new Date(Date.now() - 60 * 60 * 1000)
        },
        {
          id: 'audit_2',
          eventType: 'login_failed',
          category: 'authentication',
          severity: 'high',
          actorEmail: 'unknown@example.com',
          resourceType: 'user',
          action: 'login',
          description: 'Failed login attempt for user unknown@example.com',
          outcome: 'failure',
          sessionId: 'session_456',
          ipAddress: '203.0.113.42',
          userAgent: 'Mozilla/5.0...',
          metadata: { loginMethod: 'password', reason: 'invalid_credentials' },
          tags: ['security', 'authentication'],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        },
        {
          id: 'audit_3',
          eventType: 'schedule_executed',
          category: 'system_configuration',
          severity: 'medium',
          actorId: 'system',
          resourceType: 'schedule',
          resourceId: 'schedule_1',
          resourceName: 'Weekend Rollout',
          action: 'execute',
          description: 'Schedule "Weekend Rollout" was executed successfully',
          outcome: 'success',
          beforeValue: { enabled: false },
          afterValue: { enabled: true },
          changedFields: ['enabled'],
          metadata: { 
            executionId: 'exec_1', 
            duration: 2500,
            affectedUsers: 1250,
            triggeredBy: 'scheduler'
          },
          tags: ['schedule', 'automation'],
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          duration: 2500
        }
      ];
      
      setEvents(mockEvents);
      setTotalEvents(mockEvents.length);
    } catch (error) {
      console.error('Failed to load audit events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Mock statistics - replace with actual API
      const mockStats: AuditStatistics = {
        totalEvents: 15423,
        eventsByCategory: {
          'data_modification': 5840,
          'authentication': 3210,
          'system_configuration': 2876,
          'security': 1843,
          'authorization': 1654
        },
        eventsBySeverity: {
          'low': 8934,
          'medium': 4521,
          'high': 1756,
          'critical': 212
        },
        uniqueActors: 156,
        eventsToday: 342,
        eventsThisWeek: 2108,
        securityEvents: 89
      };
      
      setStatistics(mockStats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleFilterChange = (field: keyof AuditFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filters change
  };

  const handleViewDetails = (event: AuditEvent) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      // Mock export - replace with actual API
      console.log(`Exporting audit logs as ${format}`);
      setExportMenuAnchor(null);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      eventTypes: [],
      categories: [],
      severities: [],
      outcomes: [],
      actorEmails: [],
      resourceTypes: [],
      searchTerm: ''
    });
  };

  // const formatDuration = (ms?: number): string => {
  //   if (!ms) return 'N/A';
  //   if (ms < 1000) return `${ms}ms`;
  //   if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  //   return `${(ms / 60000).toFixed(1)}m`;
  // };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleString();
  };

  const renderStatisticsCards = () => {
    if (!statistics) return null;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Events
                  </Typography>
                  <Typography variant="h4">
                    {statistics.totalEvents.toLocaleString()}
                  </Typography>
                </Box>
                <TimelineIcon color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Today
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {statistics.eventsToday}
                  </Typography>
                </Box>
                <InfoIcon color="info" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Security Events
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {statistics.securityEvents}
                  </Typography>
                </Box>
                <SecurityIcon color="warning" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Unique Users
                  </Typography>
                  <Typography variant="h4">
                    {statistics.uniqueActors}
                  </Typography>
                </Box>
                <AssessmentIcon color="success" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderFilters = () => (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search events"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
            size="small"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              multiple
              value={filters.categories}
              onChange={(e) => handleFilterChange('categories', e.target.value)}
              label="Category"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {EVENT_CATEGORIES.map(category => (
                <MenuItem key={category} value={category}>
                  {category.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Severity</InputLabel>
            <Select
              multiple
              value={filters.severities}
              onChange={(e) => handleFilterChange('severities', e.target.value)}
              label="Severity"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {SEVERITIES.map(severity => (
                <MenuItem key={severity} value={severity}>
                  {severity}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              slotProps={{
                textField: { size: 'small', fullWidth: true }
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              slotProps={{
                textField: { size: 'small', fullWidth: true }
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      <Box mt={2} display="flex" gap={1}>
        <Button
          size="small"
          onClick={clearFilters}
          startIcon={<FilterIcon />}
        >
          Clear Filters
        </Button>
        <Button
          size="small"
          onClick={loadAuditEvents}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
        <Button
          size="small"
          onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          startIcon={<DownloadIcon />}
        >
          Export
        </Button>
      </Box>
    </Paper>
  );

  const renderEventsTable = () => (
    <Paper elevation={1}>
      {loading && <LinearProgress />}
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Outcome</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => {
              const severityConfig = SEVERITY_CONFIG[event.severity];
              const outcomeConfig = OUTCOME_CONFIG[event.outcome];
              const SeverityIcon = severityConfig.icon;
              const OutcomeIcon = outcomeConfig.icon;

              return (
                <TableRow key={event.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTimestamp(event.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.eventType.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {event.actorEmail || event.actorId || 'System'}
                      </Typography>
                      {event.ipAddress && (
                        <Typography variant="caption" color="text.secondary">
                          {event.ipAddress}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {event.resourceName || event.resourceId || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.resourceType}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {event.action}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <OutcomeIcon 
                        color={
                          outcomeConfig.color as (
                            'inherit' | 'primary' | 'secondary' | 
                            'success' | 'error' | 'info' | 'warning'
                          )
                        } 
                        fontSize="small" 
                      />
                      <Typography variant="body2">
                        {event.outcome}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SeverityIcon 
                        color={
                          severityConfig.color as (
                            'inherit' | 'primary' | 'secondary' | 
                            'success' | 'error' | 'info' | 'warning'
                          )
                        } 
                        fontSize="small" 
                      />
                      <Typography variant="body2">
                        {event.severity}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(event)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalEvents}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );

  const renderEventDetails = () => (
    <Dialog
      open={detailsOpen}
      onClose={() => setDetailsOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Audit Event Details
      </DialogTitle>
      <DialogContent>
        {selectedEvent && (
          <Box>
            {/* Basic Information */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Basic Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Event ID</Typography>
                    <Typography variant="body2">{selectedEvent.id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Timestamp</Typography>
                    <Typography variant="body2">
                      {formatTimestamp(selectedEvent.timestamp)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Event Type</Typography>
                    <Typography variant="body2">{selectedEvent.eventType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Category</Typography>
                    <Typography variant="body2">{selectedEvent.category}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Description</Typography>
                    <Typography variant="body2">{selectedEvent.description}</Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Actor Information */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Actor Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Actor Email</Typography>
                    <Typography variant="body2">
                      {selectedEvent.actorEmail || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Actor Name</Typography>
                    <Typography variant="body2">
                      {selectedEvent.actorName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">IP Address</Typography>
                    <Typography variant="body2">
                      {selectedEvent.ipAddress || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Session ID</Typography>
                    <Typography variant="body2">
                      {selectedEvent.sessionId || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Changes */}
            {(selectedEvent.beforeValue || selectedEvent.afterValue) && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Changes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {selectedEvent.beforeValue && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">Before</Typography>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                          <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                            {JSON.stringify(selectedEvent.beforeValue, null, 2)}
                          </pre>
                        </Paper>
                      </Grid>
                    )}
                    {selectedEvent.afterValue && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2">After</Typography>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                          <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                            {JSON.stringify(selectedEvent.afterValue, null, 2)}
                          </pre>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Error Information */}
            {selectedEvent.error && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Error Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Alert severity="error">
                    <Typography variant="subtitle2">
                      {selectedEvent.error.code}
                    </Typography>
                    <Typography variant="body2">
                      {selectedEvent.error.message}
                    </Typography>
                  </Alert>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Metadata */}
            {Object.keys(selectedEvent.metadata).length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Metadata</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                    <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailsOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Typography variant="h4" gutterBottom>
          Audit Log Viewer
        </Typography>

        {/* Statistics Cards */}
        {renderStatisticsCards()}

        {/* Filters */}
        {renderFilters()}

        {/* Events Table */}
        {renderEventsTable()}

        {/* Event Details Modal */}
        {renderEventDetails()}

        {/* Export Menu */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={() => setExportMenuAnchor(null)}
        >
          <MenuList>
            <MenuItemComponent onClick={() => handleExport('json')}>
              <ListItemIcon><GetAppIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Export as JSON</ListItemText>
            </MenuItemComponent>
            <MenuItemComponent onClick={() => handleExport('csv')}>
              <ListItemIcon><GetAppIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Export as CSV</ListItemText>
            </MenuItemComponent>
            <MenuItemComponent onClick={() => handleExport('pdf')}>
              <ListItemIcon><GetAppIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Export as PDF</ListItemText>
            </MenuItemComponent>
          </MenuList>
        </Menu>
      </Box>
    </LocalizationProvider>
  );
};