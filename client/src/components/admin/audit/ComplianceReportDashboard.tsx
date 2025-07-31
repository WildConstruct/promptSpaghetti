// Epic 17.1.6 - Compliance Reporting Dashboard
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  GetApp as GetAppIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Create as CreateIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Types
}
interface ComplianceReport {
  id: string;,
  reportType: 'access_report' | 'change_report' | 'security_report' | 'retention_report';
  standard: 'soc2' | 'iso27001' | 'gdpr' | 'hipaa' | 'pci_dss' | 'ccpa' | 'sox';,
  startDate: Date;
  endDate: Date;,
  summary: {
  totalEvents: number;,
  uniqueUsers: number;
  criticalEvents: number;,
  securityIncidents: number;
  complianceViolations: number;
}
};
  violations: Array<{
  eventId: string;
  violationType: string;,
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  remediation?: string;
}>;
  generatedBy: string;,
  generatedAt: Date;
  format: 'json' | 'pdf' | 'csv' | 'xml';,
  status: 'pending' | 'generating' | 'completed' | 'failed';
}
interface ReportTemplate {
  id: string;,
  name: string;
  description: string;,
  standard: string;
  reportType: string;,
  defaultScope: Record<string, unknown>;
  schedule?: {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';,
  enabled: boolean;
}
};
}
interface ComplianceMetrics {
  complianceScore: number;,
  totalReports: number;
  violationsThisMonth: number;,
  averageResolutionTime: number;
  byStandard: Record<string, {,
  score: number;,
  violations: number;
  lastReport: Date;
}
}>;
const COMPLIANCE_STANDARDS = [;
  { value: 'soc2', label: 'SOC 2', description: 'Service Organization Control 2' },
  { value: 'iso27001', label: 'ISO 27001', description: 'Information Security Management' },
  { value: 'gdpr', label: 'GDPR', description: 'General Data Protection Regulation' },
  { value: 'hipaa', label: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
  { value: 'pci_dss', label: 'PCI DSS', description: 'Payment Card Industry Data Security Standard' },
  { value: 'ccpa', label: 'CCPA', description: 'California Consumer Privacy Act' },
  { value: 'sox', label: 'SOX', description: 'Sarbanes-Oxley Act' }
];
const REPORT_TYPES = [;
  { value: 'access_report', label: 'Access Report', description: 'User access and authorization events' },
  { value: 'change_report', label: 'Change Report', description: 'Data modification and configuration changes' },
  { value: 'security_report', label: 'Security Report', description: 'Security incidents and authentication events' },
  { value: 'retention_report', label: 'Retention Report', description: 'Data retention and archival compliance' }
];
const VIOLATION_SEVERITIES = {
  low: { color: 'info', icon: CheckCircleIcon },
  medium: { color: 'warning', icon: WarningIcon },
  high: { color: 'error', icon: ErrorIcon },
  critical: { color: 'error', icon: SecurityIcon }
};

export const ComplianceReportDashboard: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReport>([]);
  const [templates, setTemplates] = useState<ReportTemplate>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Report Generation
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({)
  reportType: 'access_report',
    standard: 'soc2',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
    format: 'pdf',
    scope: {}
  });
  // Report Details
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const loadReports = useCallback(async () => {
  setLoading(true);
  try {
  // Mock data - replace with actual API
  const mockReports: ComplianceReport = [
  {
  id: 'report_1',
  reportType: 'security_report',
  standard: 'soc2',
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
  summary: {
  totalEvents: 1543,
  uniqueUsers: 45,
  criticalEvents: 12,
  securityIncidents: 3,
  complianceViolations: 5,
},
  violations: [,
            {
  eventId: 'audit_123',
  violationType: 'unauthorized_access',
  description: 'User attempted to access restricted resource without proper authorization',
  severity: 'high',
  remediation: 'Review user permissions and access controls',
}
            {
  eventId: 'audit_456',
  violationType: 'failed_authentication',
  description: 'Multiple failed login attempts from suspicious IP address',
  severity: 'medium',
  remediation: 'Monitor IP address and consider blocking if pattern continues'],
  generatedBy: 'admin@example.com',
  generatedAt: new Date(Date.now() - 60 * 60 * 1000),
  format: 'pdf',
  status: 'completed',
}
        {
  id: 'report_2',
  reportType: 'change_report',
  standard: 'gdpr',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
  summary: {
  totalEvents: 234,
  uniqueUsers: 18,
  criticalEvents: 2,
  securityIncidents: 0,
  complianceViolations: 1,
},
  violations: [,
            {
  eventId: 'audit_789',
  violationType: 'data_retention_violation',
  description: 'Personal data retained beyond specified retention period',
  severity: 'medium',
  remediation: 'Implement automated data purging for expired records'],
  generatedBy: 'compliance@example.com',
  generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  format: 'pdf',
  status: 'completed'];
  setReports(mockReports);
} catch (error) {
  console.error('Failed to load reports:', error);
} finally {
      setLoading(false);
  }, []);
  const loadTemplates = useCallback(async () => {
  try {
  // Mock templates
  const mockTemplates: ReportTemplate = [
  {
  id: 'template_1',
  name: 'Monthly SOC 2 Security Report',
  description: 'Comprehensive security assessment for SOC 2 compliance',
  standard: 'soc2',
  reportType: 'security_report',
  defaultScope: {
  eventTypes: ['login_failed', 'unauthorized_access', 'security_breach_detected'],
},
  schedule: {
  frequency: 'monthly',
  enabled: true,
}
        {
  id: 'template_2',
  name: 'Weekly GDPR Data Changes',
  description: 'Data modification tracking for GDPR compliance',
  standard: 'gdpr',
  reportType: 'change_report',
  defaultScope: {
  eventTypes: ['data_exported', 'data_purged', 'user_created', 'user_deleted'],
},
  schedule: {
  frequency: 'weekly',
  enabled: true];
  setTemplates(mockTemplates);
} catch (error) {
  console.error('Failed to load templates:', error);
}, []);
  const loadMetrics = useCallback(async () => {
    try {
      // Mock metrics
      const mockMetrics: ComplianceMetrics = {,
  complianceScore: 87.5,
        totalReports: 42,
        violationsThisMonth: 8,
        averageResolutionTime: 2.5, // days
        byStandard: {
  soc2: { score: 92, violations: 3, lastReport: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          gdpr: { score: 89, violations: 2, lastReport: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          iso27001: { score: 85, violations: 3, lastReport: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      };
      setMetrics(mockMetrics);
    } catch (error) {
  console.error('Failed to load metrics:', error);
}, []);
  const handleGenerateReport = useCallback(async () => {
    try {
      setLoading(true);
      // Mock report generation
      // Close dialog and refresh reports
      setGenerateDialogOpen(false);
      await loadReports();
    } catch (error) {
  console.error('Failed to generate report:', error);
} finally {
      setLoading(false);
  }, [loadReports]);
  const handleViewReport = useCallback((report: ComplianceReport) => {
    setSelectedReport(report);
    setDetailsDialogOpen(true);
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownloadReport = useCallback(async (_reportId: string, _format: string) => {
    try {
      // Mock download
    } catch (error) {
  console.error('Download failed:', error);
}, []);
  const getComplianceScoreColor = useCallback((score: number): string => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'error';
  }, []);
  useEffect(() => {
    loadReports();
    loadTemplates();
    loadMetrics();
  }, [loadReports, loadTemplates, loadMetrics]);
  const renderMetricsCards = () => {
    if (!metrics) return null;
    return;
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Compliance Score
                  </Typography>
                  <Typography variant="h4" color={`${getComplianceScoreColor(metrics.complianceScore)}.main`}>}
                    {metrics.complianceScore.toFixed(1)}%
                  </Typography>
                </Box>
                <VerifiedIcon color={getComplianceScoreColor(metrics.complianceScore) as 'success' | 'warning' | 'error'} fontSize="large" />
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
                    Total Reports
                  </Typography>
                  <Typography variant="h4">
                    {metrics.totalReports}
                  </Typography>
                </Box>
                <AssessmentIcon color="primary" fontSize="large" />
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
                    Violations This Month
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {metrics.violationsThisMonth}
                  </Typography>
                </Box>
                <WarningIcon color="warning" fontSize="large" />
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
                    Avg Resolution Time
                  </Typography>
                  <Typography variant="h4">
                    {metrics.averageResolutionTime} days
                  </Typography>
                </Box>
                <TimelineIcon color="info" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  const renderReportsTable = () => (;);
    <Paper elevation={1}>
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Compliance Reports</Typography>
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          onClick={() => setGenerateDialogOpen(true)}
        >
          Generate Report
        </Button>
      </Box>
      {loading && <LinearProgress />}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report Type</TableCell>
              <TableCell>Standard</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Violations</TableCell>
              <TableCell>Generated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((report: ComplianceReport) => {
                const reportType = REPORT_TYPES.find(rt => rt.value === report.reportType);
                const standard = COMPLIANCE_STANDARDS.find(cs => cs.value === report.standard);
                return;
                  <TableRow key={report.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {reportType?.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reportType?.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={standard?.label} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {report.startDate.toLocaleDateString()} - {report.endDate.toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.ceil((report.endDate.getTime() - report.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.status}
                        size="small"
                        color={report.status === 'completed' ? 'success' : report.status === 'failed' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {report.violations.length > 0 ? ()
                        <Badge badgeContent={report.violations.length} color="error">
                          <WarningIcon color="warning" />
                        </Badge>
                      ) : ()
                        <CheckCircleIcon color="success" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {report.generatedAt.toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {report.generatedBy}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewReport(report)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadReport(report.id, report.format)}
                          >
                            <GetAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
        count={reports.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage)}
        onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
  const renderGenerateReportDialog = () => (;);
    <Dialog
      open={generateDialogOpen}
      onClose={() => setGenerateDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Generate Compliance Report</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={newReport.reportType}
                onChange={(e) => setNewReport(prev => ({ ...prev, reportType: e.target.value as 'access_report' | 'change_report' | 'security_report' | 'retention_report' }))}
                label="Report Type"
              >
                {REPORT_TYPES.map(type => ()
                  <MenuItem key={type.value} value={type.value}>
                    <Box>
                      <Typography variant="body1">{type.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Compliance Standard</InputLabel>
              <Select
                value={newReport.standard}
                onChange={(e) => setNewReport(prev => ({ ...prev, standard: e.target.value as string }))}
                label="Compliance Standard"
              >
                {COMPLIANCE_STANDARDS.map(standard => ()
                  <MenuItem key={standard.value} value={standard.value}>
                    <Box>
                      <Typography variant="body1">{standard.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {standard.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Date"
                value={newReport.startDate}
                onChange={(date) => setNewReport(prev => ({ ...prev, startDate: date || new Date() }))}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="End Date"
                value={newReport.endDate}
                onChange={(date) => setNewReport(prev => ({ ...prev, endDate: date || new Date() }))}
                slotProps={{
                  textField: { fullWidth: true }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={newReport.format}
                onChange={(e) => setNewReport(prev => ({ ...prev, format: e.target.value as 'pdf' | 'json' | 'csv' | 'xml' }))}
                label="Format"
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleGenerateReport} variant="contained" disabled={loading}>
          Generate Report
        </Button>
      </DialogActions>
    </Dialog>
  );
  const renderReportDetails = () => (;);
    <Dialog
      open={detailsDialogOpen}
      onClose={() => setDetailsDialogOpen(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Report Details</DialogTitle>
      <DialogContent>
        {selectedReport && ()
          <Box>
            {/* Report Summary */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Total Events</Typography>
                    <Typography variant="h6">{selectedReport.summary.totalEvents}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Unique Users</Typography>
                    <Typography variant="h6">{selectedReport.summary.uniqueUsers}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Critical Events</Typography>
                    <Typography variant="h6" color="error.main">{selectedReport.summary.criticalEvents}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Violations</Typography>
                    <Typography variant="h6" color="warning.main">{selectedReport.summary.complianceViolations}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {/* Violations */}
            {selectedReport.violations.length > 0 && ()
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Compliance Violations</Typography>
                  <List>
                    {selectedReport.violations.map((violation, index) => {
                      const severityConfig = VIOLATION_SEVERITIES[violation.severity];
                      const SeverityIcon = severityConfig.icon;
                      return;
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemIcon>
                              <SeverityIcon color={severityConfig.color as 'info' | 'warning' | 'error'} />
                            </ListItemIcon>
                            <ListItemText
                              primary={violation.violationType.replace('_', ' ').toUpperCase()}
                              secondary={
                                <Box>
                                  <Typography variant="body2" gutterBottom>
                                    {violation.description}
                                  </Typography>
                                  {violation.remediation && ()
                                    <Alert severity="info" sx={{ mt: 1 }}>
                                      <Typography variant="body2">
                                        <strong>Remediation:</strong> {violation.remediation}
                                      </Typography>
                                    </Alert>
                                  )}
                                </Box>
                            />
                          </ListItem>
                          {index < selectedReport.violations.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        {selectedReport && ()
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadReport(selectedReport.id, selectedReport.format)}
          >
            Download Report
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
  return;
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Compliance Reporting
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadReports();
              loadMetrics();
            }}
          >
            Refresh
          </Button>
        </Box>
        {/* Metrics Cards */}
        {renderMetricsCards()}
        {/* Reports Table */}
        {renderReportsTable()}
        {/* Dialogs */}
        {renderGenerateReportDialog()}
        {renderReportDetails()}
      </Box>
    </LocalizationProvider>
  );
};