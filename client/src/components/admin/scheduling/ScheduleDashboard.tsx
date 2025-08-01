// Epic 17.1.5 - Schedule Dashboard Component
import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  LinearProgress
 from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  History as HistoryIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon
 from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ScheduleEditor, ScheduleFormData } from './ScheduleEditor';
import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleTimeline } from './ScheduleTimeline';
import { ExecutionHistory } from './ExecutionHistory';


interface Schedule {
  id: string;,
  toggleId: string;,
  toggleName: string;,
  name: string;
  description?: string;
  type: 'one_time' | 'recurring' | 'conditional';,
  action: string;,
  startTime: Date;
  endTime?: Date;
  timezone: string;,
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'failed' | 'paused';,
  enabled: boolean;
  nextExecution?: Date;
  lastExecution?: Date;
  executionCount: number;,
  failureCount: number;,
  priority: number;,
  createdBy: string;,
  createdAt: Date;,
  updatedAt: Date;



interface ScheduleDashboardProps {
  toggleId?: string;
  onScheduleChange?: () => void;
  const STATUS_CONFIG = {

},
  pending: { color: 'warning', icon: PendingIcon, label: 'Pending' },
  active: { color: 'success', icon: CheckCircleIcon, label: 'Active' },
  completed: { color: 'info', icon: CheckCircleIcon, label: 'Completed' },
  cancelled: { color: 'default', icon: StopIcon, label: 'Cancelled' },
  failed: { color: 'error', icon: ErrorIcon, label: 'Failed' },
  paused: { color: 'warning', icon: PauseIcon, label: 'Paused' }
};
const VIEW_MODES = [
  { value: 'table', label: 'Table', icon: ScheduleIcon },
  { value: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { value: 'timeline', label: 'Timeline', icon: TimelineIcon }
];

export const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'timeline'>('table');
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedSchedules, setSelectedSchedules] = useState<string>([]);
  // Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyScheduleId, setHistoryScheduleId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSchedule, setMenuSchedule] = useState<Schedule | null>(null);
  // Load schedules
  useEffect(() => {
    loadSchedules();
  }, [toggleId]);
  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [statusFilter, typeFilter, searchTerm, dateRangeStart, dateRangeEnd, applyFilters]);
  const loadSchedules = async () => {
  setLoading(true);
  try {
  // Simulate API call
  const mockSchedules: Schedule = [
  {
  id: 'sched_1',
  toggleId: 'toggle_1',
  toggleName: 'New UI Features',
  name: 'Weekend Rollout',
  description: 'Enable new features during weekend maintenance',
  type: 'one_time',
  action: 'enable',
  startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  timezone: 'America/New_York',
  status: 'pending',
  enabled: true,
  executionCount: 0,
  failureCount: 0,
  priority: 1,
  createdBy: 'admin@example.com',
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),

        {
  id: 'sched_2',
  toggleId: 'toggle_2',
  toggleName: 'Beta Features',
  name: 'Gradual Beta Rollout',
  description: 'Progressive rollout of beta features',
  type: 'recurring',
  action: 'modify_percentage',
  startTime: new Date(Date.now() + 60 * 60 * 1000),
  timezone: 'UTC',
  status: 'active',
  enabled: true,
  nextExecution: new Date(Date.now() + 60 * 60 * 1000),
  lastExecution: new Date(Date.now() - 60 * 60 * 1000),
  executionCount: 5,
  failureCount: 0,
  priority: 2,
  createdBy: 'devops@example.com',
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 60 * 60 * 1000)];
  setSchedules(mockSchedules);
 catch (error) {
  console.error('Failed to load schedules:', error);
 finally {
      setLoading(false);
  };
  const applyFilters = useCallback(() => {
    let filtered = [...schedules];
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === statusFilter);
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.type === typeFilter);
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(schedule =>)
        schedule.name.toLowerCase().includes(searchLower) ||
        schedule.toggleName.toLowerCase().includes(searchLower) ||
        schedule.description?.toLowerCase().includes(searchLower) ||
        schedule.action.toLowerCase().includes(searchLower)
      );
    // Date range filter
    if (dateRangeStart) {
      filtered = filtered.filter(schedule => schedule.startTime >= dateRangeStart);
    if (dateRangeEnd) {
      filtered = filtered.filter(schedule => schedule.startTime <= dateRangeEnd);
    // Filter by toggleId if provided
    if (toggleId) {
      filtered = filtered.filter(schedule => schedule.toggleId === toggleId);
    setFilteredSchedules(filtered);
    setPage(0); // Reset to first page when filters change
  }, [statusFilter, typeFilter, searchTerm, dateRangeStart, dateRangeEnd, toggleId]);
  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setEditorOpen(true);
  };
  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditorOpen(true);
    setAnchorEl(null);
  };
  const handleSaveSchedule = async (formData: ScheduleFormData) => {
  try {
  if (editingSchedule) {
  // Update existing schedule
  // TODO: Replace with actual API call,
  // await updateSchedule(editingSchedule.id, formData);
  console.log('Updating schedule:', editingSchedule.id, formData);
 else {
  // Create new schedule
  // TODO: Replace with actual API call,
  // await createSchedule(formData);
  console.log('Creating schedule:', formData);
  await loadSchedules();
  onScheduleChange?.();
 catch (error) {
  // TODO: Add proper error notification system,
  console.error('Failed to save schedule:', error);
  throw error;
};
  const handleDeleteSchedule = async (schedule: Schedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };
  const confirmDeleteSchedule = async () => {
  if (!scheduleToDelete) return;
  try {
  // TODO: Replace with actual API call,
  // await deleteSchedule(scheduleToDelete.id);
  await loadSchedules();
  onScheduleChange?.();
 catch (error) {
  // TODO: Add proper error notification system,
  console.error('Failed to delete schedule:', error);
 finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
  };
  const handleBulkAction = async (action: string) => {
  if (selectedSchedules.length === 0) return;
  try {
  // TODO: Replace with actual API call,
  // await performBulkAction(action, selectedSchedules);
  console.log('Performing bulk action:', action, 'on schedules:', selectedSchedules);
  await loadSchedules();
  setSelectedSchedules([]);
  onScheduleChange?.();
 catch (error) {
  // TODO: Add proper error notification system,
  console.error('Failed to perform bulk action:', error);
};
  const handleManualExecution = async (schedule: Schedule) => {
  try {
  // TODO: Replace with actual API call,
  // await executeSchedule(schedule.id);
  console.log('Executing schedule:', schedule.id);
  await loadSchedules();
  onScheduleChange?.();
 catch (error) {
  // TODO: Add proper error notification system,
  console.error('Failed to execute schedule:', error);
  setAnchorEl(null);
};
  const handleViewHistory = (schedule: Schedule) => {
    setHistoryScheduleId(schedule.id);
    setHistoryOpen(true);
    setAnchorEl(null);
  };
  const formatNextExecution = (schedule: Schedule): string => {
    if (!schedule.nextExecution) return 'None';
    const now = new Date();
    const next = schedule.nextExecution;
    const diffMs = next.getTime() - now.getTime();
    if (diffMs < 0) return 'Overdue';
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;}
    if (diffHours > 0) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;}
    if (diffMinutes > 0) return `In ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;}
    return 'Very soon';
  };
  const getScheduleStats = () => {
    const total = schedules.length;
    const active = schedules.filter(s => s.status === 'active').length;
    const pending = schedules.filter(s => s.status === 'pending').length;
    const failed = schedules.filter(s => s.status === 'failed').length;
    return { total, active, pending, failed };
  };
  const stats = getScheduleStats();
  const renderStatsCards = () => (;);
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Schedules
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </Box>
              <ScheduleIcon color="primary" fontSize="large" />
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
                  Active
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.active}
                </Typography>
              </Box>
              <CheckCircleIcon color="success" fontSize="large" />
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
                  Pending
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pending}
                </Typography>
              </Box>
              <PendingIcon color="warning" fontSize="large" />
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
                <Typography variant="h4" color="error.main">
                  {stats.failed}
                </Typography>
              </Box>
              <ErrorIcon color="error" fontSize="large" />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  const renderFilters = () => (;);
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search schedules"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="one_time">One-time</MenuItem>
              <MenuItem value="recurring">Recurring</MenuItem>
              <MenuItem value="conditional">Conditional</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Start Date"
              value={dateRangeStart}
              onChange={setDateRangeStart}
              slotProps={{
                textField: { size: 'small', fullWidth: true }
}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="End Date"
              value={dateRangeEnd}
              onChange={setDateRangeEnd}
              slotProps={{
                textField: { size: 'small', fullWidth: true }
}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={1}>
          <Button
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              setSearchTerm('');
              setDateRangeStart(null);
              setDateRangeEnd(null);
}
            size="small"
          >
            Clear
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
  const renderTableView = () => (;);
    <Paper elevation={1}>
      <Box p={2} display="flex" justifyContent="between" alignItems="center">
        <Typography variant="h6">Schedules</Typography>
        <Box display="flex" gap={1}>
          {selectedSchedules.length > 0 && ()
            <>
              <Button
                size="small"
                onClick={() => handleBulkAction('pause')}
                startIcon={<PauseIcon />}
              >
                Pause ({selectedSchedules.length})
              </Button>
              <Button
                size="small"
                onClick={() => handleBulkAction('cancel')}
                startIcon={<StopIcon />}
              >
                Cancel ({selectedSchedules.length})
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSchedule}
          >
            Create Schedule
          </Button>
        </Box>
      </Box>
      {loading && <LinearProgress />}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedSchedules.length > 0 && selectedSchedules.length < filteredSchedules.length}
                  checked={filteredSchedules.length > 0 && selectedSchedules.length === filteredSchedules.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSchedules(filteredSchedules.map(s => s.id));
 else {
                      setSelectedSchedules([]);
}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Toggle</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Next Execution</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSchedules
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((schedule) => {
                const statusConfig = STATUS_CONFIG[schedule.status];
                const StatusIcon = statusConfig.icon;
                return;
                  <TableRow key={schedule.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedSchedules.includes(schedule.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSchedules([...selectedSchedules, schedule.id]);
 else {
                            setSelectedSchedules(selectedSchedules.filter(id => id !== schedule.id));
}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {schedule.name}
                        </Typography>
                        {schedule.description && ()
                          <Typography variant="caption" color="text.secondary">
                            {schedule.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={schedule.toggleName} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={schedule.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={schedule.action} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <StatusIcon color={statusConfig.color as 'warning' | 'success' | 'info' | 'default' | 'error'} fontSize="small" />
                        <Typography variant="body2">
                          {statusConfig.label}
                        </Typography>
                        {!schedule.enabled && ()
                          <Chip label="Disabled" size="small" color="default" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatNextExecution(schedule)}
                      </Typography>
                      {schedule.nextExecution && ()
                        <Typography variant="caption" color="text.secondary">
                          {schedule.nextExecution.toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Executions: {schedule.executionCount}
                        </Typography>
                        {schedule.failureCount > 0 && ()
                          <Typography variant="caption" color="error.main">
                            Failures: {schedule.failureCount}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setMenuSchedule(schedule);
}
                      >
                        <MoreVertIcon />
                      </IconButton>
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
        count={filteredSchedules.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
}
      />
    </Paper>
  );
  return;
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Schedule Management
          </Typography>
          <Box display="flex" gap={1}>
            {VIEW_MODES.map((mode) => ()
              <Button
                key={mode.value}
                variant={viewMode === mode.value ? 'contained' : 'outlined'}
                startIcon={<mode.icon />}
                onClick={() => setViewMode(mode.value as 'table' | 'calendar' | 'timeline')}
                size="small"
              >
                {mode.label}
              </Button>
            ))}
          </Box>
        </Box>
        {/* Stats Cards */}
        {renderStatsCards()}
        {/* Filters */}
        {viewMode === 'table' && renderFilters()}
        {/* Main Content */}
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'calendar' && ()
          <ScheduleCalendar
            schedules={filteredSchedules}
            onScheduleClick={handleEditSchedule}
            onCreateSchedule={handleCreateSchedule}
          />
        )}
        {viewMode === 'timeline' && ()
          <ScheduleTimeline
            schedules={filteredSchedules}
            onScheduleClick={handleEditSchedule}
          />
        )}
        {/* Schedule Editor Modal */}
        <ScheduleEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          onSave={handleSaveSchedule}
          initialData={editingSchedule ? {
            id: editingSchedule.id,
            toggleId: editingSchedule.toggleId,
            name: editingSchedule.name,
            description: editingSchedule.description,
            type: editingSchedule.type,
            action: editingSchedule.action as string,
            startTime: editingSchedule.startTime,
            endTime: editingSchedule.endTime,
            timezone: editingSchedule.timezone,
            actionConfig: {},
            priority: editingSchedule.priority,
            conflictResolution: 'skip',
            enabled: editingSchedule.enabled;
 : undefined}
          toggleId={toggleId || ''}
          toggleName={editingSchedule?.toggleName}
          existingSchedules={schedules.map(s => ({)
  id: s.id,
  name: s.name,
  startTime: s.startTime,
  endTime: s.endTime,
  action: s.action,
}))}
        />
        {/* Execution History Modal */}
        <ExecutionHistory
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          scheduleId={historyScheduleId}
        />
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Schedule</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the schedule &ldquo;{scheduleToDelete?.name}&rdquo;?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDeleteSchedule} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuList>
            <MenuItemComponent onClick={() => menuSchedule && handleEditSchedule(menuSchedule)}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItemComponent>
            <MenuItemComponent onClick={() => menuSchedule && handleManualExecution(menuSchedule)}>
              <ListItemIcon><PlayArrowIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Execute Now</ListItemText>
            </MenuItemComponent>
            <MenuItemComponent onClick={() => menuSchedule && handleViewHistory(menuSchedule)}>
              <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
              <ListItemText>View History</ListItemText>
            </MenuItemComponent>
            <MenuItemComponent onClick={() => menuSchedule && handleDeleteSchedule(menuSchedule)}>
              <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItemComponent>
          </MenuList>
        </Menu>
      </Box>
    </LocalizationProvider>
  );
};