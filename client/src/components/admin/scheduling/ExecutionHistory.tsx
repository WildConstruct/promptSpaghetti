// Epic 17.1.5 - Execution History Component
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Replay as ReplayIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  History as HistoryIcon
} from '@mui/icons-material';

}
interface ExecutionRecord {
  id: string;,
  scheduleId: string;
  toggleId: string;,
  executionTime: Date;
  status: 'scheduled' | 'running' | 'success' | 'failed' | 'skipped' | 'retrying';,
  triggeredBy: 'scheduler' | 'manual' | 'retry';
  executionContext: {
  timezone: string;,
  originalTime: Date;
  actualTime: Date;
  delay?: number;
}
};
  beforeValue?: unknown;
  afterValue?: unknown;
  affectedUsers?: number;
  error?: {
  code: string;,
  message: string;
  stack?: string;
  retryable: boolean;
};
  duration: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;

}
interface ExecutionHistoryProps {
  open: boolean;,
  onClose: () => void;
  scheduleId: string | null;

const STATUS_CONFIG = {
}
  scheduled: { color: 'info', icon: PendingIcon, label: 'Scheduled' },
  running: { color: 'warning', icon: PendingIcon, label: 'Running' },
  success: { color: 'success', icon: CheckCircleIcon, label: 'Success' },
  failed: { color: 'error', icon: ErrorIcon, label: 'Failed' },
  skipped: { color: 'default', icon: PendingIcon, label: 'Skipped' },
  retrying: { color: 'warning', icon: ReplayIcon, label: 'Retrying' }
};

export const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionRecord | null>(null);
  const loadExecutions = useCallback(async () => {
  if (!scheduleId) return;
  setLoading(true);
  try {
  // Simulate API call
  const mockExecutions: ExecutionRecord = [
  {
  id: 'exec_1',
  scheduleId: scheduleId,
  toggleId: 'toggle_1',
  executionTime: new Date(Date.now() - 60 * 60 * 1000),
  status: 'success',
  triggeredBy: 'scheduler',
  executionContext: {
  timezone: 'America/New_York',
  originalTime: new Date(Date.now() - 60 * 60 * 1000),
  actualTime: new Date(Date.now() - 60 * 60 * 1000 + 500),
  delay: 500,
},
  beforeValue: { enabled: false },
          afterValue: { enabled: true },
          affectedUsers: 1250,
          duration: 2500,
          metadata: {
  action: 'enable',
  executor: 'scheduler-v1.2',
},
  createdAt: new Date(Date.now() - 60 * 60 * 1000);
  }
        {
  id: 'exec_2',
  scheduleId: scheduleId,
  toggleId: 'toggle_1',
  executionTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
  status: 'failed',
  triggeredBy: 'scheduler',
  executionContext: {
  timezone: 'America/New_York',
  originalTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
  actualTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15000),
  delay: 15000,
},
  error: {
  code: 'TOGGLE_NOT_FOUND',
  message: 'Feature toggle not found or has been deleted',
  retryable: false,
},
  duration: 1200,
          metadata: {
  action: 'enable',
  executor: 'scheduler-v1.2',
  retryAttempt: 1,
},
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000);
  }
        {
  id: 'exec_3',
  scheduleId: scheduleId,
  toggleId: 'toggle_1',
  executionTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
  status: 'success',
  triggeredBy: 'manual',
  executionContext: {
  timezone: 'America/New_York',
  originalTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
  actualTime: new Date(Date.now() - 3 * 60 * 60 * 1000 + 200),
  delay: 200,
},
  beforeValue: { percentage: 25 },
          afterValue: { percentage: 50 },
          affectedUsers: 875,
          duration: 1800,
          metadata: {
  action: 'modify_percentage',
  executor: 'manual-admin',
  requestedBy: 'admin@example.com',
},
  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)];
      setExecutions(mockExecutions);
    } catch (error) {
  console.error('Failed to load execution history:', error);
} finally {
      setLoading(false);

  }, [scheduleId]);
  useEffect(() => {
    if (open && scheduleId) {
      loadExecutions();

  }, [open, scheduleId, loadExecutions]);
  const getExecutionStats = () => {
    const total = executions.length;
    const successful = executions.filter(e => e.status === 'success').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const avgDuration = executions.reduce((acc, e) => acc + e.duration, 0) / total || 0;
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    return { total, successful, failed, avgDuration, successRate };
  };
  const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 1000) return `${milliseconds}ms`;}
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;}
    return `${(milliseconds / 60000).toFixed(1)}m`;}
  };
  const formatDelay = (delay?: number): string => {
    if (!delay) return 'On time';
    if (delay < 0) return `${Math.abs(delay)}ms early`;}
    return `${delay}ms late`;}
  };
  const stats = getExecutionStats();
  const renderStatsCards = () => (;);
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Executions
                </Typography>
                <Typography variant="h6">
                  {stats.total}
                </Typography>
              </Box>
              <HistoryIcon color="primary" />
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
                  Success Rate
                </Typography>
                <Typography variant="h6" color="success.main">
                  {stats.successRate.toFixed(1)}%
                </Typography>
              </Box>
              <CheckCircleIcon color="success" />
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
                  Avg Duration
                </Typography>
                <Typography variant="h6">
                  {formatDuration(stats.avgDuration)}
                </Typography>
              </Box>
              <TimelineIcon color="info" />
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
                  Failed
                </Typography>
                <Typography variant="h6" color="error.main">
                  {stats.failed}
                </Typography>
              </Box>
              <ErrorIcon color="error" />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  const renderExecutionDetails = (execution: ExecutionRecord) => (;);
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">
          Execution Details
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Timing Information
            </Typography>
            <Box component="dl" sx={{ '& dt': { fontWeight: 'bold' }, '& dd': { ml: 0, mb: 1 } }}>
              <dt>Scheduled Time:</dt>
              <dd>{execution.executionContext.originalTime.toLocaleString()}</dd>
              <dt>Actual Time:</dt>
              <dd>{execution.executionContext.actualTime.toLocaleString()}</dd>
              <dt>Delay:</dt>
              <dd>{formatDelay(execution.executionContext.delay)}</dd>
              <dt>Duration:</dt>
              <dd>{formatDuration(execution.duration)}</dd>
              <dt>Timezone:</dt>
              <dd>{execution.executionContext.timezone}</dd>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Execution Context
            </Typography>
            <Box component="dl" sx={{ '& dt': { fontWeight: 'bold' }, '& dd': { ml: 0, mb: 1 } }}>
              <dt>Triggered By:</dt>
              <dd>{execution.triggeredBy}</dd>
              <dt>Status:</dt>
              <dd>
                <Chip
                  size="small"
                  color={STATUS_CONFIG[execution.status].color as 'info' | 'warning' | 'success' | 'error' | 'default'}
                  label={STATUS_CONFIG[execution.status].label}
                />
              </dd>
              {execution.affectedUsers && ()
                <>
                  <dt>Affected Users:</dt>
                  <dd>{execution.affectedUsers.toLocaleString()}</dd>
                </>
              )}
            </Box>
          </Grid>
          {execution.beforeValue && ()
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Before Value
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                  {JSON.stringify(execution.beforeValue, null, 2)}
                </pre>
              </Paper>
            </Grid>
          )}
          {execution.afterValue && ()
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                After Value
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                  {JSON.stringify(execution.afterValue, null, 2)}
                </pre>
              </Paper>
            </Grid>
          )}
          {execution.error && ()
            <Grid item xs={12}>
              <Alert severity="error">
                <Typography variant="subtitle2" gutterBottom>
                  Error Details
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Code:</strong> {execution.error.code}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Message:</strong> {execution.error.message}
                </Typography>
                <Typography variant="body2">
                  <strong>Retryable:</strong> {execution.error.retryable ? 'Yes' : 'No'}
                </Typography>
                {execution.error.stack && ()
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                      Stack Trace
                    </summary>
                    <pre style={{ fontSize: '0.7rem', overflow: 'auto', marginTop: 4 }}>
                      {execution.error.stack}
                    </pre>
                  </details>
                )}
              </Alert>
            </Grid>
          )}
          {execution.metadata && Object.keys(execution.metadata).length > 0 && ()
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Metadata
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                  {JSON.stringify(execution.metadata, null, 2)}
                </pre>
              </Paper>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
  return;
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ style: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon />
            <Typography variant="h6">
              Execution History
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {executions.length > 0 && renderStatsCards()}
        {executions.length === 0 && !loading ? ()
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height={300}
            color="text.secondary"
          >
            <Box textAlign="center">
              <HistoryIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                No execution history
              </Typography>
              <Typography variant="body2">
                This schedule hasn&apos;t been executed yet
              </Typography>
            </Box>
          </Box>
        ) : ()
          <Paper elevation={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Execution Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Triggered By</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Delay</TableCell>
                    <TableCell>Users Affected</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {executions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((execution) => {
                      const statusConfig = STATUS_CONFIG[execution.status];
                      const StatusIcon = statusConfig.icon;
                      return;
                        <TableRow key={execution.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {execution.executionTime.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {execution.executionContext.timezone}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <StatusIcon color={statusConfig.color as 'info' | 'warning' | 'success' | 'error' | 'default'} fontSize="small" />
                              <Typography variant="body2">
                                {statusConfig.label}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={execution.triggeredBy}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDuration(execution.duration)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2"
                              color={execution.executionContext.delay && execution.executionContext.delay > 1000 ? 'warning.main' : 'text.primary'}
                            >
                              {formatDelay(execution.executionContext.delay)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {execution.affectedUsers?.toLocaleString() || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => setSelectedExecution()
                                  selectedExecution?.id === execution.id ? null : execution
                                )}
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
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={executions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        )}
        {/* Execution Details */}
        {selectedExecution && ()
          <Box mt={2}>
            {renderExecutionDetails(selectedExecution)}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};