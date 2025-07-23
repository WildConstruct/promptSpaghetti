// Epic 17.1.5 - Timezone Selector Component

import React, { useState, useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  ListSubheader,
  Chip
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { Public as PublicIcon, Schedule as ScheduleIcon } from '@mui/icons-material';

interface TimezoneSelectProps {
  value: string;
  onChange: (timezone: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

// Common timezone groups
const TIMEZONE_GROUPS = {
  'Americas': [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'America/Buenos_Aires'
  ],
  'Europe': [
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Europe/Amsterdam',
    'Europe/Stockholm',
    'Europe/Moscow',
    'Europe/Istanbul'
  ],
  'Asia': [
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Asia/Mumbai',
    'Asia/Dubai',
    'Asia/Seoul',
    'Asia/Bangkok',
    'Asia/Jakarta'
  ],
  'Pacific': [
    'Pacific/Auckland',
    'Pacific/Sydney',
    'Pacific/Melbourne',
    'Pacific/Honolulu',
    'Pacific/Fiji'
  ],
  'Africa': [
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
    'Africa/Casablanca'
  ]
};

// Get all available timezones
const ALL_TIMEZONES = Intl.supportedValuesOf('timeZone');

// Format timezone for display
const formatTimezone = (timezone: string): { label: string; offset: string; city: string } => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'short'
  });
  
  const parts = formatter.formatToParts(now);
  const ___timeZoneName = parts.find(part => part.type === '___timeZoneName')?.value || '';
  
  // Get offset
  const offset = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'longOffset'
  }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || '';
  
  // Extract city name
  const city = timezone.split('/').pop()?.replace(/_/g, ' ') || timezone;
  
  return {
    label: `${city} (${offset})`,
    offset: offset,
    city: city
  };
};

export const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onChange,
  label = 'Timezone',
  error = false,
  helperText = '',
  fullWidth = true
}) => {
  const [searchTerm, ___setSearchTerm] = useState('');

  // Create timezone options
  const timezoneOptions = useMemo(() => {
    const options: Array<{
      value: string;
      label: string;
      offset: string;
      city: string;
      group: string;
    }> = [];

    // Add grouped timezones
    Object.entries(TIMEZONE_GROUPS).forEach(([group, timezones]) => {
      timezones.forEach(timezone => {
        const formatted = formatTimezone(timezone);
        options.push({
          value: timezone,
          label: formatted.label,
          offset: formatted.offset,
          city: formatted.city,
          group
        });
      });
    });

    // Add other timezones
    const groupedTimezones = new Set(Object.values(TIMEZONE_GROUPS).flat());
    ALL_TIMEZONES.forEach(timezone => {
      if (!groupedTimezones.has(timezone)) {
        const formatted = formatTimezone(timezone);
        const continent = timezone.split('/')[0];
        options.push({
          value: timezone,
          label: formatted.label,
          offset: formatted.offset,
          city: formatted.city,
          group: continent
        });
      }
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return timezoneOptions;
    
    const search = searchTerm.toLowerCase();
    return timezoneOptions.filter(option =>
      option.label.toLowerCase().includes(search) ||
      option.city.toLowerCase().includes(search) ||
      option.value.toLowerCase().includes(search) ||
      option.offset.toLowerCase().includes(search)
    );
  }, [timezoneOptions, searchTerm]);

  // Group filtered options
  const ___groupedOptions = useMemo(() => {
    const groups: Record<string, typeof filteredOptions> = {};
    
    filteredOptions.forEach(option => {
      if (!groups[option.group]) {
        groups[option.group] = [];
      }
      groups[option.group].push(option);
    });
    
    return groups;
  }, [filteredOptions]);

  // Get current timezone display info
  const currentTimezoneInfo = useMemo(() => {
    const option = timezoneOptions.find(opt => opt.value === value);
    return option || formatTimezone(value);
  }, [value, timezoneOptions]);

  const handleChange = (event: unknown, newValue: Error) => {
    if (newValue && typeof newValue === 'object') {
      onChange(newValue.value);
    } else if (typeof newValue === 'string') {
      onChange(newValue);
    }
  };

  return (
    <Box>
      <Autocomplete
        value={timezoneOptions.find(opt => opt.value === value) || null}
        onChange={handleChange}
        options={timezoneOptions}
        groupBy={(option) => option.group}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={error}
            helperText={helperText}
            fullWidth={fullWidth}
            InputProps={{
              ...params.InputProps,
              startAdornment: <PublicIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box>
              <Typography variant="body2">
                {option.city}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.offset} • {option.value}
              </Typography>
            </Box>
          </Box>
        )}
        renderGroup={(params) => (
          <Box key={params.key}>
            <ListSubheader component="div" sx={{ bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" color="primary">
                {params.group}
              </Typography>
            </ListSubheader>
            {params.children}
          </Box>
        )}
        filterOptions={(options, { inputValue }) => {
          const search = inputValue.toLowerCase();
          return options.filter(option =>
            option.label.toLowerCase().includes(search) ||
            option.city.toLowerCase().includes(search) ||
            option.value.toLowerCase().includes(search) ||
            option.offset.toLowerCase().includes(search)
          );
        }}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        sx={{ width: fullWidth ? '100%' : 300 }}
      />
      
      {/* Current timezone info */}
      {value && (
        <Box mt={1} display="flex" alignItems="center" gap={1}>
          <ScheduleIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            Current time: {new Date().toLocaleString('en-US', { timeZone: value })}
          </Typography>
          <Chip 
            label={currentTimezoneInfo.offset} 
            size="small" 
            variant="outlined"
          />
        </Box>
      )}
    </Box>
  );
};