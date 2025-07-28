/**
 * Advanced DateTime Controls - Epic 17
 * 
 * Comprehensive date and time controls for scheduling with timezone support,
 * business hours, conflict detection, and smart scheduling features.
 * 
 * Task: E17-1753114396815-A5C08F - Create datetime controls
 * Epic: 17 - Backstage Admin Controls
 */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Calendar,
  Clock,
  Globe,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Sun,
  Moon,
  Users,
  Building,
  Timer,
  RefreshCw,
  Settings,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
interface DateTimeSelection {
  date: Date;
  time: string; // HH:MM format
  timezone: string;
  businessHoursOnly?: boolean;
  avoidWeekends?: boolean;
  smartSuggestion?: boolean;
}
interface BusinessHours {
  enabled: boolean;
  workdays: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
}
interface ConflictInfo {
  hasConflict: boolean;
  type: 'business_hours' | 'weekend' | 'holiday' | 'maintenance' | 'high_traffic' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
  alternativeTimes?: Date[];
}
interface AdvancedDateTimeControlsProps {
  value?: DateTimeSelection;
  onChange: (selection: DateTimeSelection) => void;
  businessHours?: BusinessHours;
  onBusinessHoursChange?: (businessHours: BusinessHours) => void;
  conflictDetection?: boolean;
  smartSuggestions?: boolean;
  allowPastDates?: boolean;
  className?: string;
}
const TIMEZONE_GROUPS = {
  'Popular': [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)', offset: '-05:00' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', offset: '-08:00' },
    { value: 'Europe/London', label: 'London (GMT/BST)', offset: '+00:00' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00' }
  ],
  'Americas': [
    { value: 'America/New_York', label: 'New York (EST/EDT)', offset: '-05:00' },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: '-06:00' },
    { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: '-07:00' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: '-08:00' },
    { value: 'America/Toronto', label: 'Toronto (EST/EDT)', offset: '-05:00' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: '-03:00' }
  ],
  'Europe': [
    { value: 'Europe/London', label: 'London (GMT/BST)', offset: '+00:00' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: '+01:00' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: '+01:00' },
    { value: 'Europe/Rome', label: 'Rome (CET/CEST)', offset: '+01:00' },
    { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', offset: '+01:00' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)', offset: '+01:00' }
  ],
  'Asia': [
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: '+08:00' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: '+08:00' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: '+08:00' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: '+09:00' },
    { value: 'Asia/Kolkata', label: 'Mumbai/Kolkata (IST)', offset: '+05:30' }
  ]
};
const COMMON_BUSINESS_HOURS = [;
  { name: 'Standard (9 AM - 5 PM)', start: '09:00', end: '17:00', workdays: [1, 2, 3, 4, 5] },
  { name: 'Extended (8 AM - 6 PM)', start: '08:00', end: '18:00', workdays: [1, 2, 3, 4, 5] },
  { name: 'Early (7 AM - 3 PM)', start: '07:00', end: '15:00', workdays: [1, 2, 3, 4, 5] },
  { name: '24/7 Operations', start: '00:00', end: '23:59', workdays: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Weekend Only', start: '09:00', end: '17:00', workdays: [0, 6] }
];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AdvancedDateTimeControls: React.FC<AdvancedDateTimeControlsProps> = ({)
  value,
  onChange,
  businessHours,
  onBusinessHoursChange,
  conflictDetection = true,
  smartSuggestions = true,
  allowPastDates = false,
  className = ''
}) => {
  const [currentTab, setCurrentTab] = useState('datetime');
  const [selectedDate, setSelectedDate] = useState<Date>(value?.date || new Date());
  const [selectedTime, setSelectedTime] = useState<string>(value?.time || '09:00');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(value?.timezone || 'UTC');
  const [_____showTimezoneSearch, _____setShowTimezoneSearch] = useState(false);
  const [timezoneSearchQuery, setTimezoneSearchQuery] = useState('');
  const [currentBusinessHours, setCurrentBusinessHours] = useState<BusinessHours>()
    businessHours || {
      enabled: true,
      workdays: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'UTC',
    }
  );
  // Calculate current date/time in selected timezone
  const dateTimeInTimezone = useMemo(() => {
    const combined = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined;
  }, [selectedDate, selectedTime]);
  // Check for conflicts
  const conflictInfo: ConflictInfo = useMemo(() => {
    if (!conflictDetection) {
      return { hasConflict: false, type: 'other', description: '', severity: 'low' };
    }
    const dayOfWeek = dateTimeInTimezone.getDay();
    const timeValue = selectedTime;
    // Check business hours
    if (currentBusinessHours.enabled) {
      if (!currentBusinessHours.workdays.includes(dayOfWeek)) {
        return {
          hasConflict: true,
          type: 'weekend',
          description: 'Selected time is outside business workdays',
          severity: 'medium',
          suggestion: `Consider scheduling during workdays: ${currentBusinessHours.workdays.map(d => WEEKDAY_SHORT[d]).join(', ')}`}
        };
      }
      if (timeValue < currentBusinessHours.startTime || timeValue > currentBusinessHours.endTime) {
        return {
          hasConflict: true,
          type: 'business_hours',
          description: `Selected time is outside business hours (${currentBusinessHours.startTime} - ${currentBusinessHours.endTime})`,}
          severity: 'medium',
          suggestion: `Consider scheduling between ${currentBusinessHours.startTime} and ${currentBusinessHours.endTime}`}
        };
      }
    }
    // Check for past dates
    if (!allowPastDates && dateTimeInTimezone < new Date()) {
      return {
        hasConflict: true,
        type: 'other',
        description: 'Selected time is in the past',
        severity: 'high',
        suggestion: 'Please select a future date and time',
      };
    }
    return { hasConflict: false, type: 'other', description: '', severity: 'low' };
  }, [dateTimeInTimezone, selectedTime, currentBusinessHours, allowPastDates, conflictDetection]);
  // Smart time suggestions
  const smartTimeSuggestions = useMemo(() => {
    if (!smartSuggestions) return [];
    const suggestions: Date[] = [];
    const baseDate = new Date(selectedDate);
    // Suggest optimal times based on business hours
    if (currentBusinessHours.enabled) {
      const [startHour, startMin] = currentBusinessHours.startTime.split(':').map(Number);
      const [endHour, _____endMin] = currentBusinessHours.endTime.split(':').map(Number);
      // Suggest start of business day
      const startOfDay = new Date(baseDate);
      startOfDay.setHours(startHour, startMin, 0, 0);
      if (startOfDay > new Date()) suggestions.push(startOfDay);
      // Suggest mid-morning
      const midMorning = new Date(baseDate);
      midMorning.setHours(startHour + 1, 0, 0, 0);
      if (midMorning > new Date()) suggestions.push(midMorning);
      // Suggest lunch break end
      const postLunch = new Date(baseDate);
      postLunch.setHours(13, 0, 0, 0);
      if (postLunch > new Date() && postLunch.getHours() <= endHour) suggestions.push(postLunch);
      // Suggest late afternoon
      const lateAfternoon = new Date(baseDate);
      lateAfternoon.setHours(Math.min(15, endHour - 1), 0, 0, 0);
      if (lateAfternoon > new Date()) suggestions.push(lateAfternoon);
    }
    return suggestions.slice(0, 4);
  }, [selectedDate, currentBusinessHours, smartSuggestions]);
  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    updateSelection({ date, time: selectedTime, timezone: selectedTimezone });
  };
  // Handle time change
  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    updateSelection({ date: selectedDate, time, timezone: selectedTimezone });
  };
  // Handle timezone change
  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    updateSelection({ date: selectedDate, time: selectedTime, timezone });
  };
  // Update parent component
  const updateSelection = (partial: Partial<DateTimeSelection>) => {
    const newSelection: DateTimeSelection = {
      date: selectedDate,
      time: selectedTime,
      timezone: selectedTimezone,
      businessHoursOnly: currentBusinessHours.enabled,
      ...partial
    };
    onChange(newSelection);
  };
  // Business hours preset handler
  const applyBusinessHoursPreset = (preset: typeof COMMON_BUSINESS_HOURS[0]) => {
    const newBusinessHours: BusinessHours = {
      ...currentBusinessHours,
      startTime: preset.start,
      endTime: preset.end,
      workdays: preset.workdays,
    };
    setCurrentBusinessHours(newBusinessHours);
    onBusinessHoursChange?.(newBusinessHours);
  };
  // Format date for display
  const formatDisplayDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {)
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  // Format time for display
  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;}
  };
  // Generate time options
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;}
        options.push(timeStr);
      }
    }
    return options;
  }, []);
  // Filter timezones based on search
  const filteredTimezones = useMemo(() => {
    if (!timezoneSearchQuery) return TIMEZONE_GROUPS;
    const query = timezoneSearchQuery.toLowerCase();
    const filtered: typeof TIMEZONE_GROUPS = {};
    Object.entries(TIMEZONE_GROUPS).forEach(([group, timezones]) => {
      const matchingTimezones = timezones.filter(tz => ;);
        tz.label.toLowerCase().includes(query) || 
        tz.value.toLowerCase().includes(query)
      );
      if (matchingTimezones.length > 0) {
        filtered[group] = matchingTimezones;
      }
    });
    return filtered;
  }, [timezoneSearchQuery]);
  return ();
    <div className={`space-y-4 ${className}`}>}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="datetime">Date & Time</TabsTrigger>
          <TabsTrigger value="timezone">Timezone</TabsTrigger>
          <TabsTrigger value="business">Business Hours</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        {/* Date & Time Tab */}
        <TabsContent value="datetime" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                    min={allowPastDates ? undefined : new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-gray-600">
                    {formatDisplayDate(selectedDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Select Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select value={selectedTime} onValueChange={handleTimeChange}>
                    {timeOptions.map(time => ()
                      <option key={time} value={time}>
                        {formatDisplayTime(time)}
                      </option>
                    ))}
                  </Select>
                  <p className="text-sm text-gray-600">
                    {formatDisplayTime(selectedTime)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Smart Suggestions */}
          {smartTimeSuggestions.length > 0 && ()
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Smart Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {smartTimeSuggestions.map((suggestion, index) => ()
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDate(suggestion);
                        setSelectedTime();
                          `${suggestion.getHours().toString().padStart(2, '0')}:${suggestion.getMinutes().toString().padStart(2, '0')}`}
                        );
                      }}
                    >
                      {formatDisplayTime(`${suggestion.getHours().toString().padStart(2, '0')}:${suggestion.getMinutes().toString().padStart(2, '0')}`)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Conflict Detection */}
          {conflictDetection && ()
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {conflictInfo.hasConflict ? ()
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  ) : ()
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  Conflict Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conflictInfo.hasConflict ? ()
                  <div className="space-y-2">
                    <Badge
                      variant={conflictInfo.severity === 'high' ? 'destructive' : 'default'}
                    >
                      {conflictInfo.severity} priority
                    </Badge>
                    <p className="text-gray-900">{conflictInfo.description}</p>
                    {conflictInfo.suggestion && ()
                      <p className="text-sm text-blue-600">{conflictInfo.suggestion}</p>
                    )}
                  </div>
                ) : ()
                  <p className="text-green-600">No conflicts detected</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Timezone Tab */}
        <TabsContent value="timezone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Select Timezone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Input
                    placeholder="Search timezones..."
                    value={timezoneSearchQuery}
                    onChange={(e) => setTimezoneSearchQuery(e.target.value)}
                  />
                </div>
                {/* Current Selection */}
                <div className="p-3 border rounded-lg bg-blue-50">
                  <p className="font-medium">Current: {selectedTimezone}</p>
                  <p className="text-sm text-gray-600">
                    {TIMEZONE_GROUPS.Popular.find(tz => tz.value === selectedTimezone)?.label}
                  </p>
                </div>
                {/* Timezone Groups */}
                <div className="space-y-3">
                  {Object.entries(filteredTimezones).map(([group, timezones]) => ()
                    <div key={group}>
                      <h4 className="font-medium text-gray-900 mb-2">{group}</h4>
                      <div className="space-y-1">
                        {timezones.map((timezone) => ()
                          <button
                            key={timezone.value}
                            className={`w-full text-left p-2 rounded border hover:bg-gray-50 ${
                              selectedTimezone === timezone.value ? 'bg-blue-50 border-blue-300' : ''
                            }`}
                            onClick={() => handleTimezoneChange(timezone.value)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{timezone.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {timezone.offset}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Business Hours Tab */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Business Hours Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enable/Disable */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="businessHoursEnabled"
                  checked={currentBusinessHours.enabled}
                  onChange={(e) => {
                    const newBusinessHours = { ...currentBusinessHours, enabled: e.target.checked };
                    setCurrentBusinessHours(newBusinessHours);
                    onBusinessHoursChange?.(newBusinessHours);
                  }}
                />
                <label htmlFor="businessHoursEnabled" className="font-medium">
                  Enable business hours restrictions
                </label>
              </div>
              {currentBusinessHours.enabled && ()
                <>
                  {/* Presets */}
                  <div>
                    <h4 className="font-medium mb-2">Quick Presets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {COMMON_BUSINESS_HOURS.map((preset, index) => ()
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => applyBusinessHoursPreset(preset)}
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {/* Working Hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <Select
                        value={currentBusinessHours.startTime}
                        onValueChange={(time) => {
                          const newBusinessHours = { ...currentBusinessHours, startTime: time };
                          setCurrentBusinessHours(newBusinessHours);
                          onBusinessHoursChange?.(newBusinessHours);
                        }}
                      >
                        {timeOptions.filter((_, index) => index % 4 === 0).map(time => ()
                          <option key={time} value={time}>
                            {formatDisplayTime(time)}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <Select
                        value={currentBusinessHours.endTime}
                        onValueChange={(time) => {
                          const newBusinessHours = { ...currentBusinessHours, endTime: time };
                          setCurrentBusinessHours(newBusinessHours);
                          onBusinessHoursChange?.(newBusinessHours);
                        }}
                      >
                        {timeOptions.filter((_, index) => index % 4 === 0).map(time => ()
                          <option key={time} value={time}>
                            {formatDisplayTime(time)}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  {/* Working Days */}
                  <div>
                    <h4 className="font-medium mb-2">Working Days</h4>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAY_NAMES.map((day, index) => ()
                        <label key={index} className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentBusinessHours.workdays.includes(index)}
                            onChange={(e) => {
                              const newWorkdays = e.target.checked;
                                ? [...currentBusinessHours.workdays, index]
                                : currentBusinessHours.workdays.filter(d => d !== index);
                              const newBusinessHours = { ...currentBusinessHours, workdays: newWorkdays.sort() };
                              setCurrentBusinessHours(newBusinessHours);
                              onBusinessHoursChange?.(newBusinessHours);
                            }}
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Schedule Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected DateTime */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">Selected Date & Time</h4>
                <div className="space-y-2">
                  <p><strong>Date:</strong> {formatDisplayDate(selectedDate)}</p>
                  <p><strong>Time:</strong> {formatDisplayTime(selectedTime)}</p>
                  <p><strong>Timezone:</strong> {selectedTimezone}</p>
                  <p><strong>Full DateTime:</strong> {dateTimeInTimezone.toISOString()}</p>
                </div>
              </div>
              {/* Time in Other Zones */}
              <div>
                <h4 className="font-medium mb-2">Time in Other Zones</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TIMEZONE_GROUPS.Popular.slice(0, 4).map((tz) => {
                    const timeInZone = new Intl.DateTimeFormat('en-US', {)
                      timeZone: tz.value,
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(dateTimeInTimezone);
                    return ();
                      <div key={tz.value} className="p-2 border rounded text-sm">
                        <p className="font-medium">{tz.value}</p>
                        <p className="text-gray-600">{timeInZone}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Business Hours Status */}
              {currentBusinessHours.enabled && ()
                <div>
                  <h4 className="font-medium mb-2">Business Hours Status</h4>
                  <div className="p-3 border rounded-lg">
                    {conflictInfo.hasConflict ? ()
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Outside business hours</span>
                      </div>
                    ) : ()
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Within business hours</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDateTimeControls;