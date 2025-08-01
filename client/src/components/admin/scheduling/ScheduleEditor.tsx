/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// Epic 17.1.5 - Schedule Editor Component
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert,
  Chip,
  Grid,
  Paper
 from '@mui/material';
import {
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  Repeat as RepeatIcon,
  Warning as WarningIcon
 from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimezoneSelect } from './TimezoneSelect';
import { RecurrenceEditor } from './RecurrenceEditor';
import { ActionConfigEditor } from './ActionConfigEditor';
import { ConflictPreview } from './ConflictPreview';


export interface ScheduleFormData {
  id?: string;
  toggleId: string;,
  name: string;
  description?: string;
  type: 'one_time' | 'recurring' | 'conditional';,
  action: 'enable' | 'disable' | 'update_value' | 'activate_rollout' | 'modify_percentage';,
  startTime: Date;
  endTime?: Date;
  timezone: string;
  recurrence?: {,
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';,
  interval: number;
  daysOfWeek?: number;
  daysOfMonth?: number;
  monthsOfYear?: number;
  cronExpression?: string;
  maxOccurrences?: number;
  endDate?: Date;


};
  actionConfig: {
  targetValue?: unknown;
  rolloutPercentage?: number;
  conditions?: Array<{,
  attribute: string;,
  operator: string;,
  value: Error;
>;
    gradualRollout?: {
  startPercentage: number;,
  endPercentage: number;,
  incrementMinutes: number;
};
  };
  priority: number;,
  conflictResolution: 'skip' | 'override' | 'merge';,
  enabled: boolean;


interface ScheduleEditorProps {
  open: boolean;,
  onClose: () => void;,
  onSave: (schedule: ScheduleFormData) => Promise<void>;
  initialData?: Partial<ScheduleFormData>;
  toggleId: string;
  toggleName?: string;
  existingSchedules?: Array<{,
  id: string;,
  name: string;,
  startTime: Date;
  endTime?: Date;
  action: string;


>;
const SCHEDULE_TYPES = [
  { value: 'one_time', label: 'One-time', description: 'Execute once at the specified time' },
  { value: 'recurring', label: 'Recurring', description: 'Execute repeatedly on a schedule' },
  { value: 'conditional', label: 'Conditional', description: 'Execute when conditions are met' }
];
const SCHEDULE_ACTIONS = [
  { value: 'enable', label: 'Enable Toggle', description: 'Turn the feature toggle on' },
  { value: 'disable', label: 'Disable Toggle', description: 'Turn the feature toggle off' },
  { value: 'update_value', label: 'Update Value', description: 'Change the toggle value' },
  { value: 'modify_percentage', label: 'Modify Percentage', description: 'Change rollout percentage' },
  { value: 'activate_rollout', label: 'Activate Rollout', description: 'Start a gradual rollout' }
];
const CONFLICT_RESOLUTIONS = [
  { value: 'skip', label: 'Skip', description: 'Skip execution if conflict detected' },
  { value: 'override', label: 'Override', description: 'Execute anyway, overriding conflicts' },
  { value: 'merge', label: 'Merge', description: 'Try to merge with conflicting schedules' }
];
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<Array<{ description: string; severity: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }));
  }, [initialData]);
  // Check for conflicts when timing or action changes
  useEffect(() => {
    if (formData.startTime && formData.action) {
      checkConflicts();
  }, [formData.startTime, formData.endTime, formData.action, formData.type, checkConflicts]);
  const checkConflicts = useCallback(() => {
    const potentialConflicts = [];
    for (const existing of existingSchedules) {
      if (existing.id === formData.id) continue; // Skip self when editing
      // Check time overlap
      const hasTimeOverlap = checkTimeOverlap(;);
        formData.startTime,
        formData.endTime,
        existing.startTime,
        existing.endTime
      );
      if (hasTimeOverlap) {
        // Check action conflict
        const hasActionConflict = checkActionConflict(formData.action, existing.action);
        if (hasActionConflict) {
          potentialConflicts.push({)
  description: `Conflicts with "${existing.name}" - both schedules perform conflicting actions during overlapping time`}
},
  severity: 'high';
  });
 else {
          potentialConflicts.push({)
  description: `Time overlap with "${existing.name}" - may cause unexpected behavior`}
},
  severity: 'medium';
  });
    setConflicts(potentialConflicts);
  }, [existingSchedules, formData, setConflicts]);
  const checkTimeOverlap = (start1: Date, end1: Date | undefined, start2: Date, end2: Date | undefined): boolean => {
    const effectiveEnd1 = end1 || new Date(start1.getTime() + 365 * 24 * 60 * 60 * 1000);
    const effectiveEnd2 = end2 || new Date(start2.getTime() + 365 * 24 * 60 * 60 * 1000);
    return start1 < effectiveEnd2 && start2 < effectiveEnd1;
  };
  const checkActionConflict = (action1: string, action2: string): boolean => {
    const conflictingPairs = [
      ['enable', 'disable'],
      ['update_value', 'update_value']
    ];
    return conflictingPairs.some(([a1, a2]) => 
      (action1 === a1 && action2 === a2) || (action1 === a2 && action2 === a1)
    );
  };
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Schedule name is required';
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
 else if (formData.startTime <= new Date()) {
      newErrors.startTime = 'Start time must be in the future';
    if (formData.endTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    if (formData.type === 'recurring' && !formData.recurrence) {
      newErrors.recurrence = 'Recurrence settings are required for recurring schedules';
    if (formData.action === 'update_value' && formData.actionConfig.targetValue === undefined) {
      newErrors.actionConfig = 'Target value is required for update_value action';
    if (formData.action === 'modify_percentage' && )
        (formData.actionConfig.rolloutPercentage === undefined || )
         formData.actionConfig.rolloutPercentage < 0 || 
         formData.actionConfig.rolloutPercentage > 100)) {
      newErrors.actionConfig = 'Valid rollout percentage (0-100) is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
 catch (error) {
  console.error('Failed to save schedule:', error);
  // Handle error (could set an error state)
 finally {
      setIsLoading(false);
  };
  const handleFieldChange = (field: keyof ScheduleFormData, value: Error) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const handleActionConfigChange = (config: ScheduleFormData['actionConfig']) => {
    handleFieldChange('actionConfig', config);
  };
  const handleRecurrenceChange = (recurrence: ScheduleFormData['recurrence']) => {
    handleFieldChange('recurrence', recurrence);
  };
  return;
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { minHeight: '70vh' }
}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon />
            <Typography variant="h6">
              {formData.id ? 'Edit Schedule' : 'Create Schedule'}
            </Typography>
            {toggleName && ()
              <Chip label={toggleName} size="small" variant="outlined" />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Conflicts Warning */}
            {conflicts.length > 0 && ()
              <Alert severity="warning" icon={<WarningIcon />}>
                <Typography variant="subtitle2" gutterBottom>
                  Potential Conflicts Detected
                </Typography>
                {conflicts.map((conflict, index) => ()
                  <Typography key={index} variant="body2">
                    • {conflict.description}
                  </Typography>
                ))}
              </Alert>
            )}
            {/* Basic Information */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Schedule Name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Schedule Type</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                      label="Schedule Type"
                    >
                      {SCHEDULE_TYPES.map(type => ()
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
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Action</InputLabel>
                    <Select
                      value={formData.action}
                      onChange={(e) => handleFieldChange('action', e.target.value)}
                      label="Action"
                    >
                      {SCHEDULE_ACTIONS.map(action => ()
                        <MenuItem key={action.value} value={action.value}>
                          <Box>
                            <Typography variant="body1">{action.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {action.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
            {/* Timing Configuration */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <TimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Timing Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DateTimePicker
                    label="Start Time"
                    value={formData.startTime}
                    onChange={(date) => handleFieldChange('startTime', date)}
                    slotProps={{
  textField: {,
  fullWidth: true,
  error: !!errors.startTime,
  helperText: errors.startTime,
}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DateTimePicker
                    label="End Time (Optional)"
                    value={formData.endTime}
                    onChange={(date) => handleFieldChange('endTime', date)}
                    slotProps={{
  textField: {,
  fullWidth: true,
  error: !!errors.endTime,
  helperText: errors.endTime,
}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TimezoneSelect
                    value={formData.timezone}
                    onChange={(timezone) => handleFieldChange('timezone', timezone)}
                  />
                </Grid>
              </Grid>
            </Paper>
            {/* Recurrence Configuration */}
            {formData.type === 'recurring' && ()
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <RepeatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recurrence Settings
                </Typography>
                <RecurrenceEditor
                  value={formData.recurrence}
                  onChange={handleRecurrenceChange}
                  error={errors.recurrence}
                />
              </Paper>
            )}
            {/* Action Configuration */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Action Configuration
              </Typography>
              <ActionConfigEditor
                action={formData.action}
                value={formData.actionConfig}
                onChange={handleActionConfigChange}
                error={errors.actionConfig}
              />
            </Paper>
            {/* Advanced Settings */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Advanced Settings
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => handleFieldChange('priority', parseInt(e.target.value))}
                    helperText="Higher numbers = higher priority"
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Conflict Resolution</InputLabel>
                    <Select
                      value={formData.conflictResolution}
                      onChange={(e) => handleFieldChange('conflictResolution', e.target.value)}
                      label="Conflict Resolution"
                    >
                      {CONFLICT_RESOLUTIONS.map(resolution => ()
                        <MenuItem key={resolution.value} value={resolution.value}>
                          <Box>
                            <Typography variant="body2">{resolution.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {resolution.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.enabled}
                        onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                      />
                    label="Enabled"
                  />
                </Grid>
              </Grid>
            </Paper>
            {/* Conflict Preview */}
            {conflicts.length > 0 && ()
              <ConflictPreview
                conflicts={conflicts}
                resolution={formData.conflictResolution}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isLoading || conflicts.some(c => c.severity === 'high') && formData.conflictResolution === 'skip'}
          >
            {isLoading ? 'Saving...' : (formData.id ? 'Update Schedule' : 'Create Schedule')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
