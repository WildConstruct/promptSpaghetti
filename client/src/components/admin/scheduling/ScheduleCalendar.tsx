// Epic 17.1.5 - Schedule Calendar Component
import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Popover,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Badge
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon
} from '@mui/icons-material';
}
interface Schedule {
  id: string;,
  toggleId: string;
  toggleName: string;,
  name: string;
  description?: string;
  type: 'one_time' | 'recurring' | 'conditional';,
  action: string;
  startTime: Date;
  endTime?: Date;
  timezone: string;,
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'failed' | 'paused';
  enabled: boolean;
  nextExecution?: Date;
  lastExecution?: Date;
  executionCount: number;,
  failureCount: number;
  priority: number;,
  createdBy: string;
  createdAt: Date;,
  updatedAt: Date;
  interface ScheduleCalendarProps {
  schedules: Schedule;,
  onScheduleClick: (schedule: Schedule) => void;,
  onCreateSchedule: () => void;
  const STATUS_COLORS = {
  pending: '#ff9800',
  active: '#4caf50',
  completed: '#2196f3',
  cancelled: '#9e9e9e',
  failed: '#f44336',
  paused: '#ff5722',
}
};
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [;
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const [popoverSchedules, setPopoverSchedules] = useState<Schedule>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  // Get first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  // Generate calendar days
  const calendarDays: Date = [];
  const currentCalendarDate = new Date(startDate);
  for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
    calendarDays.push(new Date(currentCalendarDate));
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  }, [currentDate]);
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);
  const getSchedulesForDate = useCallback((date: Date): Schedule => {
    return schedules.filter(schedule => {)
  const scheduleDate = new Date(schedule.startTime);
      return;
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      ) || ()
        schedule.nextExecution &&
        schedule.nextExecution.getDate() === date.getDate() &&
        schedule.nextExecution.getMonth() === date.getMonth() &&
        schedule.nextExecution.getFullYear() === date.getFullYear()
      );
    });
  }, [schedules]);
  const handleDayClick = (date: Date, daySchedules: Schedule) => {
    if (daySchedules.length === 0) {
      // No schedules, potentially create new one
      return;
    if (daySchedules.length === 1) {
      onScheduleClick(daySchedules[0]);
    } else {
      // Multiple schedules, show popover
      setSelectedDate(date);
      setPopoverSchedules(daySchedules);
      // Find the day cell to anchor popover
      const dayElement = document.querySelector(`[data-date="${date.toISOString().split('T')[0]}"]`);}
      setAnchorEl(dayElement as HTMLElement);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
    setPopoverSchedules([]);
    setSelectedDate(null);
  };
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return;
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };
  const renderCalendarDay = (date: Date) => {
    const daySchedules = getSchedulesForDate(date);
    const isCurrentMonthDay = isCurrentMonth(date);
    const isTodayDate = isToday(date);
    return;
      <Box
        key={date.toISOString()}
        data-date={date.toISOString().split('T')[0]}
        sx={{
  minHeight: 120,
  p: 1,
  border: '1px solid',
  borderColor: 'divider',
  cursor: 'pointer',
  bgcolor: isTodayDate ? 'primary.50' : 'background.paper',
  opacity: isCurrentMonthDay ? 1 : 0.5,
  '&:hover': {
  bgcolor: isTodayDate ? 'primary.100' : 'action.hover',
}}
        onClick={() => handleDayClick(date, daySchedules)}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography
            variant="body2"
            fontWeight={isTodayDate ? 'bold' : 'normal'}
            color={isTodayDate ? 'primary.main' : 'text.primary'}
          >
            {date.getDate()}
          </Typography>
          {daySchedules.length > 0 && ()
            <Badge badgeContent={daySchedules.length} color="primary" max={99}>
              <ScheduleIcon fontSize="small" color="action" />
            </Badge>
          )}
        </Box>
        {/* Schedule indicators */}
        <Box display="flex" flexDirection="column" gap={0.5}>
          {daySchedules.slice(0, 3).map(schedule => ()
            <Tooltip
              key={schedule.id}
              title={`${schedule.name} - ${schedule.action} (${schedule.status})`}
            >
              <Chip
                label={schedule.name}
                size="small"
                sx={{
  fontSize: '0.7rem',
  height: 18,
  bgcolor: STATUS_COLORS[schedule.status],
  color: 'white',
  '& .MuiChip-label': {
  px: 1,
}}
              />
            </Tooltip>
          ))}
          {daySchedules.length > 3 && ()
            <Typography variant="caption" color="text.secondary" textAlign="center">
              +{daySchedules.length - 3} more
            </Typography>
          )}
        </Box>
      </Box>
    );
  };
  return;
    <Box>
      {/* Calendar Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigateMonth('prev')}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h5">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Typography>
            <IconButton onClick={() => navigateMonth('next')}>
              <ChevronRightIcon />
            </IconButton>
            <Button
              startIcon={<TodayIcon />}
              onClick={goToToday}
              size="small"
            >
              Today
            </Button>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateSchedule}
          >
            Create Schedule
          </Button>
        </Box>
      </Paper>
      {/* Calendar Grid */}
      <Paper elevation={1}>
        {/* Days of Week Header */}
        <Box display="grid" gridTemplateColumns="repeat(7, 1fr)">
          {DAYS_OF_WEEK.map(day => ()
            <Box
              key={day}
              p={2}
              bgcolor="grey.100"
              borderBottom="1px solid"
              borderColor="divider"
              textAlign="center"
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {day}
              </Typography>
            </Box>
          ))}
        </Box>
        {/* Calendar Days */}
        <Box display="grid" gridTemplateColumns="repeat(7, 1fr)">
          {calendarDays.map(date => renderCalendarDay(date))}
        </Box>
      </Paper>
      {/* Schedule Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
  vertical: 'center',
  horizontal: 'center',
}}
        transformOrigin={{
  vertical: 'top',
  horizontal: 'center',
}}
      >
        <Card sx={{ minWidth: 300, maxWidth: 400 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Schedules for {selectedDate?.toLocaleDateString()}
            </Typography>
            <List dense>
              {popoverSchedules.map(schedule => ()
                <ListItem
                  key={schedule.id}
                  button
                  onClick={() => {
                    onScheduleClick(schedule);
                    handleClosePopover();
                  }}
                  sx={{
  borderLeft: 4,
  borderLeftColor: STATUS_COLORS[schedule.status],
  mb: 1,
  borderRadius: 1,
  bgcolor: 'grey.50',
}}
                >
                  <ListItemText
                    primary={schedule.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {schedule.toggleName} • {schedule.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {schedule.startTime.toLocaleTimeString()} • {schedule.status}
                        </Typography>
                      </Box>
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Popover>
      {/* Legend */}
      <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Schedule Status Legend
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          {Object.entries(STATUS_COLORS).map(([status, color]) => ()
            <Box key={status} display="flex" alignItems="center" gap={1}>
              <Box
                width={16}
                height={16}
                bgcolor={color}
                borderRadius="50%"
              />
              <Typography variant="caption" textTransform="capitalize">
                {status}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};