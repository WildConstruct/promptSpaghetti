/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// Epic 17.1.5 - Recurrence Editor Component
import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Alert
 from '@mui/material';
import {
  DatePicker
 from '@mui/x-date-pickers/DatePicker';
import {
  Repeat as RepeatIcon
 from '@mui/icons-material';


export interface RecurrenceData {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';,
  interval: number;
  daysOfWeek?: number; // 0-6 (Sunday-Saturday),
  daysOfMonth?: number; // 1-31,
  monthsOfYear?: number; // 1-12,
  cronExpression?: string;
  maxOccurrences?: number;
  endDate?: Date;



interface RecurrenceEditorProps {
  value?: RecurrenceData;
  onChange: (recurrence: RecurrenceData | undefined) => void;
  error?: string;
  const RECURRENCE_TYPES = [


  { value: 'daily', label: 'Daily', description: 'Repeat every day(s)' },
  { value: 'weekly', label: 'Weekly', description: 'Repeat every week(s)' },
  { value: 'monthly', label: 'Monthly', description: 'Repeat every month(s)' },
  { value: 'yearly', label: 'Yearly', description: 'Repeat every year(s)' },
  { value: 'custom', label: 'Custom', description: 'Use cron expression' }
];
const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' }
];
const MONTHS_OF_YEAR = [
  { value: 1, label: 'Jan', fullLabel: 'January' },
  { value: 2, label: 'Feb', fullLabel: 'February' },
  { value: 3, label: 'Mar', fullLabel: 'March' },
  { value: 4, label: 'Apr', fullLabel: 'April' },
  { value: 5, label: 'May', fullLabel: 'May' },
  { value: 6, label: 'Jun', fullLabel: 'June' },
  { value: 7, label: 'Jul', fullLabel: 'July' },
  { value: 8, label: 'Aug', fullLabel: 'August' },
  { value: 9, label: 'Sep', fullLabel: 'September' },
  { value: 10, label: 'Oct', fullLabel: 'October' },
  { value: 11, label: 'Nov', fullLabel: 'November' },
  { value: 12, label: 'Dec', fullLabel: 'December' }
];
  const [endType, setEndType] = useState<'never' | 'after' | 'on'>()
    value?.maxOccurrences ? 'after' : value?.endDate ? 'on' : 'never'
  );
  useEffect(() => {
  if (value) {
  setRecurrenceData(value);
  setEndType();
  value.maxOccurrences ? 'after' : value.endDate ? 'on' : 'never');
}, [value]);
  const handleChange = (updates: Partial<RecurrenceData>) => {
    const newData = { ...recurrenceData, ...updates };
    setRecurrenceData(newData);
    onChange(newData);
  };
  const handleEndTypeChange = (type: 'never' | 'after' | 'on') => {
    setEndType(type);
    const updates: Partial<RecurrenceData> = {};
    if (type === 'never') {
      updates.maxOccurrences = undefined;
      updates.endDate = undefined;
 else if (type === 'after') {
      updates.endDate = undefined;
      if (!recurrenceData.maxOccurrences) {
        updates.maxOccurrences = 10;
 else if (type === 'on') {
      updates.maxOccurrences = undefined;
      if (!recurrenceData.endDate) {
        updates.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    handleChange(updates);
  };
  const handleDayOfWeekToggle = (day: number) => {
    const current = recurrenceData.daysOfWeek || [];
    const updated = current.includes(day);
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    handleChange({ daysOfWeek: updated });
  };
  const handleDayOfMonthToggle = (day: number) => {
    const current = recurrenceData.daysOfMonth || [];
    const updated = current.includes(day);
      ? current.filter(d => d !== day)
      : [...current, day].sort();
    handleChange({ daysOfMonth: updated });
  };
  const handleMonthToggle = (month: number) => {
    const current = recurrenceData.monthsOfYear || [];
    const updated = current.includes(month);
      ? current.filter(m => m !== month)
      : [...current, month].sort();
    handleChange({ monthsOfYear: updated });
  };
  // Generate recurrence description
  const getRecurrenceDescription = (): string => {
    const { type, interval, daysOfWeek, daysOfMonth, monthsOfYear } = recurrenceData;
    let description = '';
    switch (type) {
    case 'daily':
      description = interval === 1 ? 'Every day' : `Every ${interval} days`;}
      break;
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        const dayNames = daysOfWeek.map(d => DAYS_OF_WEEK[d].label).join(', ');
        description = interval === 1 
          ? `Every week on ${dayNames}` }
          : `Every ${interval} weeks on ${dayNames}`;}
 else {
        description = interval === 1 ? 'Every week' : `Every ${interval} weeks`;}
      break;
    case 'monthly':
      if (daysOfMonth && daysOfMonth.length > 0) {
        const dayList = daysOfMonth.join(', ');
        description = interval === 1 
          ? `Every month on day ${dayList}` }
          : `Every ${interval} months on day ${dayList}`;}
 else {
        description = interval === 1 ? 'Every month' : `Every ${interval} months`;}
      break;
    case 'yearly':
      if (monthsOfYear && monthsOfYear.length > 0) {
        const monthNames = monthsOfYear.map(m => MONTHS_OF_YEAR[m - 1].label).join(', ');
        description = interval === 1 
          ? `Every year in ${monthNames}` }
          : `Every ${interval} years in ${monthNames}`;}
 else {
        description = interval === 1 ? 'Every year' : `Every ${interval} years`;}
      break;
    case 'custom':
      description = recurrenceData.cronExpression || 'Custom schedule';
      break;
    // Add end condition
    if (endType === 'after' && recurrenceData.maxOccurrences) {
      description += `, ${recurrenceData.maxOccurrences} times total`;}
 else if (endType === 'on' && recurrenceData.endDate) {
      description += `, until ${recurrenceData.endDate.toLocaleDateString()}`;}
    return description;
  };
  return;
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={3}>
        {/* Recurrence Type */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Recurrence Type</InputLabel>
            <Select
              value={recurrenceData.type}
              onChange={(e) => handleChange({ type: e.target.value as RecurrenceData['type'] })}
              label="Recurrence Type"
            >
              {RECURRENCE_TYPES.map(type => ()
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
        {/* Interval */}
        {recurrenceData.type !== 'custom' && ()
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={`Repeat every (${recurrenceData.type.slice(0, -2)}s)`}
              type="number"
              value={recurrenceData.interval}
              onChange={(e) => handleChange({ interval: Math.max(1, parseInt(e.target.value) || 1) })}
              inputProps={{ min: 1, max: 365 }}
            />
          </Grid>
        )}
        {/* Days of Week (for weekly) */}
        {recurrenceData.type === 'weekly' && ()
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Days of Week
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {DAYS_OF_WEEK.map(day => ()
                <ToggleButton
                  key={day.value}
                  value={day.value}
                  selected={(recurrenceData.daysOfWeek || []).includes(day.value)}
                  onChange={() => handleDayOfWeekToggle(day.value)}
                  size="small"
                  sx={{ minWidth: 45 }}
                >
                  {day.label}
                </ToggleButton>
              ))}
            </Box>
            {recurrenceData.daysOfWeek && recurrenceData.daysOfWeek.length === 0 && ()
              <Typography variant="caption" color="text.secondary">
                No days selected (will use the day of the start time)
              </Typography>
            )}
          </Grid>
        )}
        {/* Days of Month (for monthly) */}
        {recurrenceData.type === 'monthly' && ()
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Days of Month
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap" maxWidth="100%">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => ()
                <ToggleButton
                  key={day}
                  value={day}
                  selected={(recurrenceData.daysOfMonth || []).includes(day)}
                  onChange={() => handleDayOfMonthToggle(day)}
                  size="small"
                  sx={{ minWidth: 35, fontSize: '0.75rem' }}
                >
                  {day}
                </ToggleButton>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Leave empty to use the day from the start time
            </Typography>
          </Grid>
        )}
        {/* Months of Year (for yearly) */}
        {recurrenceData.type === 'yearly' && ()
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Months
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {MONTHS_OF_YEAR.map(month => ()
                <ToggleButton
                  key={month.value}
                  value={month.value}
                  selected={(recurrenceData.monthsOfYear || []).includes(month.value)}
                  onChange={() => handleMonthToggle(month.value)}
                  size="small"
                  sx={{ minWidth: 45 }}
                >
                  {month.label}
                </ToggleButton>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Leave empty to use the month from the start time
            </Typography>
          </Grid>
        )}
        {/* Cron Expression (for custom) */}
        {recurrenceData.type === 'custom' && ()
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Cron Expression"
              value={recurrenceData.cronExpression || ''}
              onChange={(e) => handleChange({ cronExpression: e.target.value })}
              placeholder="0 0 * * *"
              helperText="Format: minute hour day month day-of-week (e.g., '0 9 * * 1-5' for weekdays at 9 AM)"
            />
            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                Examples:
                <br />• <code>0 9 * * 1-5</code> - Weekdays at 9 AM
                <br />• <code>0 0 1 * *</code> - First day of every month
                <br />• <code>0 12 * * 0</code> - Every Sunday at noon
              </Typography>
            </Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Divider />
        </Grid>
        {/* End Condition */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            End Condition
          </Typography>
          <ToggleButtonGroup
            value={endType}
            exclusive
            onChange={(_, value) => value && handleEndTypeChange(value)}
            size="small"
          >
            <ToggleButton value="never">Never</ToggleButton>
            <ToggleButton value="after">After</ToggleButton>
            <ToggleButton value="on">On Date</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        {endType === 'after' && ()
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Max Occurrences"
              type="number"
              value={recurrenceData.maxOccurrences || ''}
              onChange={(e) => handleChange({ maxOccurrences: parseInt(e.target.value) || undefined })}
              inputProps={{ min: 1 }}
              helperText="Number of times to execute"
            />
          </Grid>
        )}
        {endType === 'on' && ()
          <Grid item xs={6}>
            <DatePicker
              label="End Date"
              value={recurrenceData.endDate || null}
              onChange={(date) => handleChange({ endDate: date || undefined })}
              slotProps={{
                textField: { fullWidth: true }
}
            />
          </Grid>
        )}
        {/* Preview */}
        <Grid item xs={12}>
          <Box 
            p={2} 
            bgcolor="action.hover" 
            borderRadius={1}
            display="flex"
            alignItems="center"
            gap={1}
          >
            <RepeatIcon color="primary" />
            <Box>
              <Typography variant="subtitle2" color="primary">
                Schedule Preview
              </Typography>
              <Typography variant="body2">
                {getRecurrenceDescription()}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
