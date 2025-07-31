// Epic 17.1.5 - Schedule Timeline Component
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tooltip,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Timeline as TimelineIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon
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
  interface ScheduleTimelineProps {
  schedules: Schedule;,
  onScheduleClick: (schedule: Schedule) => void;
  type TimeRange = '24h' | '7d' | '30d' | '90d';
  const STATUS_COLORS = {
  pending: '#ff9800',
  active: '#4caf50',
  completed: '#2196f3',
  cancelled: '#9e9e9e',
  failed: '#f44336',
  paused: '#ff5722',
}
};
const TIME_RANGES = [;
  { value: '24h', label: '24 Hours', hours: 24 },
  { value: '7d', label: '7 Days', hours: 24 * 7 },
  { value: '30d', label: '30 Days', hours: 24 * 30 },
  { value: '90d', label: '90 Days', hours: 24 * 90 }
];

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ schedules, onScheduleClick }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const timeRangeConfig = TIME_RANGES.find(tr => tr.value === timeRange)!;
  const { startTime, endTime } = useMemo(() => {
  const now = new Date();
  return {
  startTime: new Date(now.getTime() - (timeRangeConfig.hours / 2) * 60 * 60 * 1000),
  endTime: new Date(now.getTime() + (timeRangeConfig.hours / 2) * 60 * 60 * 1000),
};
  }, [timeRangeConfig.hours]);
  // Filter schedules to show only those within the time range
  const visibleSchedules = useMemo(() => {
    return schedules.filter(schedule => {)
  const scheduleStart = schedule.nextExecution || schedule.startTime;
      return scheduleStart >= startTime && scheduleStart <= endTime;
    }).sort((a, b) => {
      const aTime = a.nextExecution || a.startTime;
      const bTime = b.nextExecution || b.startTime;
      return aTime.getTime() - bTime.getTime();
    });
  }, [schedules, startTime, endTime]);
  // Group schedules by time slots for better visualization
  // TODO: Consider using timeSlots for grouped visualization in future
  /*
  const timeSlots = useMemo(() => {
    const slotDuration = timeRangeConfig.hours * 60 * 60 * 1000 / 24; // 24 slots;
    const slots: Array<{ start: Date; end: Date; schedules: Schedule }> = [];
    for (let i = 0; i < 24; i++) {
      const slotStart = new Date(startTime.getTime() + i * slotDuration);
      const slotEnd = new Date(startTime.getTime() + (i + 1) * slotDuration);
      const slotSchedules = visibleSchedules.filter(schedule => {)
  const scheduleTime = schedule.nextExecution || schedule.startTime;
        return scheduleTime >= slotStart && scheduleTime < slotEnd;
      });
      slots.push({)
  start: slotStart,
  end: slotEnd,
  schedules: slotSchedules,
});
    return slots;
  }, [visibleSchedules, startTime, endTime, timeRangeConfig.hours]);
  */
  const getTimelinePosition = (date: Date): number => {
    const totalDuration = endTime.getTime() - startTime.getTime();
    const relativeTime = date.getTime() - startTime.getTime();
    return (relativeTime / totalDuration) * 100;
  };
  const getScheduleWidth = (schedule: Schedule): number => {
  if (schedule.type === 'one_time') return 2; // Thin line for one-time events
  const duration = schedule.endTime ;
  ? schedule.endTime.getTime() - schedule.startTime.getTime()
  : 60 * 60 * 1000; // Default 1 hour for recurring without end time,
  const totalDuration = endTime.getTime() - startTime.getTime();
  return Math.max(2, (duration / totalDuration) * 100);
};
  const formatTimeLabel = (date: Date): string => {
    if (timeRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '7d') {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'active': return <PlayArrowIcon fontSize="small" />;
  case 'paused': return <PauseIcon fontSize="small" />;
  case 'cancelled': return <StopIcon fontSize="small" />;
  default: return <ScheduleIcon fontSize="small" />;
};
  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in' && zoomLevel < 3) {
      setZoomLevel(zoomLevel + 0.5);
    } else if (direction === 'out' && zoomLevel > 0.5) {
      setZoomLevel(zoomLevel - 0.5);
  };
  const renderTimeMarkers = () => {
    const markers = [];
    const markerCount = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    for (let i = 0; i <= markerCount; i++) {
      const markerTime = new Date(;);
        startTime.getTime() + (i / markerCount) * (endTime.getTime() - startTime.getTime())
      );
      const position = (i / markerCount) * 100;
      markers.push(
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: `${position}%`}
},
  top: 0,
            bottom: 0,
            borderLeft: i === markerCount / 2 ? '2px solid' : '1px solid',
            borderColor: i === markerCount / 2 ? 'primary.main' : 'divider',
            zIndex: 1;
  }}
        >
          <Typography
            variant="caption"
            sx={{
  position: 'absolute',
  top: -20,
  left: -20,
  fontSize: '0.7rem',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
}}
          >
            {formatTimeLabel(markerTime)}
          </Typography>
        </Box>
      );
    return markers;
  };
  const renderScheduleBar = (schedule: Schedule) => {
    const scheduleTime = schedule.nextExecution || schedule.startTime;
    const position = getTimelinePosition(scheduleTime);
    const width = getScheduleWidth(schedule);
    const color = STATUS_COLORS[schedule.status];
    return;
      <Tooltip
        key={schedule.id}
        title={
          <Box>
            <Typography variant="subtitle2">{schedule.name}</Typography>
            <Typography variant="caption" display="block">
              {schedule.toggleName} • {schedule.action}
            </Typography>
            <Typography variant="caption" display="block">
              {scheduleTime.toLocaleString()}
            </Typography>
            <Typography variant="caption" display="block">
              Status: {schedule.status}
            </Typography>
          </Box>
      >
        <Box
          onClick={() => onScheduleClick(schedule)}
          sx={{
            position: 'absolute',
            left: `${position}%`}
},
  width: `${width}%`}
},
  height: 24,
            bgcolor: color,
            borderRadius: 1,
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            px: 0.5,
            zIndex: 2,
            transform: `translateX(-${width/2}%)`}
}
            '&:hover': {
              opacity: 0.8,
              transform: `translateX(-${width/2}%) scale(1.05)`}
  },
  transition: 'all 0.2s ease';
  }}
        >
          <Box display="flex" alignItems="center" gap={0.5} overflow="hidden">
            {getStatusIcon(schedule.status)}
            <Typography
              variant="caption"
              sx={{
  color: 'white',
  fontWeight: 'bold',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontSize: '0.7rem',
}}
            >
              {schedule.name}
            </Typography>
          </Box>
        </Box>
      </Tooltip>
    );
  };
  const renderTimelineTrack = (trackSchedules: Schedule, trackIndex: number) => {
    return;
      <Box
        key={trackIndex}
        sx={{
  position: 'relative',
  height: 40,
  mb: 1,
  bgcolor: 'grey.50',
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
}}
      >
        {trackSchedules.map((schedule, index) => renderScheduleBar(schedule, index))}
      </Box>
    );
  };
  // Organize schedules into tracks to avoid overlaps
  const organizeTracks = (schedules: Schedule) => {
  const tracks: Schedule = [];
  schedules.forEach(schedule => {)
  const scheduleStart = schedule.nextExecution || schedule.startTime;
  const scheduleEnd = schedule.endTime || new Date(scheduleStart.getTime() + 60 * 60 * 1000);
  // Find a track where this schedule doesn't overlap
  let trackIndex = 0;
  while (trackIndex < tracks.length) {
  const hasOverlap = tracks[trackIndex].some(existingSchedule => {)
  const existingStart = existingSchedule.nextExecution || existingSchedule.startTime;
  const existingEnd = existingSchedule.endTime || new Date(existingStart.getTime() + 60 * 60 * 1000);
  return !(scheduleEnd <= existingStart || scheduleStart >= existingEnd);
});
        if (!hasOverlap) {
          tracks[trackIndex].push(schedule);
          return;
        trackIndex++;
      // Create new track if no suitable track found
      tracks.push([schedule]);
    });
    return tracks;
  };
  const tracks = organizeTracks(visibleSchedules);
  return;
    <Box>
      {/* Timeline Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <TimelineIcon color="primary" />
            <Typography variant="h6">
              Schedule Timeline
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                label="Time Range"
              >
                {TIME_RANGES.map(range => ()
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => handleZoom('out')} disabled={zoomLevel <= 0.5}>
              <ZoomOutIcon />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </Typography>
            <IconButton onClick={() => handleZoom('in')} disabled={zoomLevel >= 3}>
              <ZoomInIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
      {/* Timeline Stats */}
      <Box display="flex" gap={2} mb={2}>
        <Chip
          icon={<ScheduleIcon />}
          label={`${visibleSchedules.length} schedules in range`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`${tracks.length} parallel tracks`}
          variant="outlined"
        />
        <Chip
          label={`${visibleSchedules.filter(s => s.status === 'active').length} active`}
          color="success"
          variant="outlined"
        />
      </Box>
      {/* Timeline Container */}
      <Paper elevation={1} sx={{ p: 2, overflow: 'auto' }}>
        <Box
          sx={{
            position: 'relative',
            minHeight: Math.max(200, tracks.length * 50),
            transform: `scaleX(${zoomLevel})`}
},
  transformOrigin: 'left center',
            transition: 'transform 0.3s ease';
  }}
        >
          {/* Current Time Indicator */}
          <Box
            sx={{
  position: 'absolute',
  left: '50%',
  top: -10,
  bottom: -10,
  width: 2,
  bgcolor: 'error.main',
  zIndex: 3,
  '&::before': {
  content: '"Now"',
  position: 'absolute',
  top: -25,
  left: -15,
  fontSize: '0.7rem',
  color: 'error.main',
  fontWeight: 'bold',
}}
          />
          {/* Time Markers */}
          {renderTimeMarkers()}
          {/* Schedule Tracks */}
          <Box sx={{ pt: 2 }}>
            {tracks.length === 0 ? ()
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height={200}
                color="text.secondary"
              >
                <Box textAlign="center">
                  <ScheduleIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    No schedules in this time range
                  </Typography>
                  <Typography variant="body2">
                    Adjust the time range or create new schedules
                  </Typography>
                </Box>
              </Box>
            ) : ()
              tracks.map((trackSchedules, trackIndex) => 
                renderTimelineTrack(trackSchedules, trackIndex)
            )}
          </Box>
        </Box>
      </Paper>
      {/* Legend */}
      <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Status Legend
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          {Object.entries(STATUS_COLORS).map(([status, color]) => ()
            <Box key={status} display="flex" alignItems="center" gap={1}>
              <Box
                width={16}
                height={16}
                bgcolor={color}
                borderRadius={1}
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

export default ScheduleTimeline;