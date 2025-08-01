import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Advanced DateTime Controls - Epic 17
 *
 * Comprehensive date and time controls for scheduling with timezone support,
 * business hours, conflict detection, and smart scheduling features.
 *
 * Task: E17-1753114396815-A5C08F - Create datetime controls
 * Epic: 17 - Backstage Admin Controls
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Calendar, Clock, Globe, AlertTriangle, CheckCircle, Zap, Building, Eye } from 'lucide-react';
const TIMEZONE_GROUPS = {
    'Popular': []
};
{
    value: 'UTC', label;
    'UTC (Coordinated Universal Time)', offset;
    '+00:00';
}
{
    value: 'America/New_York', label;
    'Eastern Time (US & Canada)', offset;
    '-05:00';
}
{
    value: 'America/Los_Angeles', label;
    'Pacific Time (US & Canada)', offset;
    '-08:00';
}
{
    value: 'Europe/London', label;
    'London (GMT/BST)', offset;
    '+00:00';
}
{
    value: 'Asia/Tokyo', label;
    'Tokyo (JST)', offset;
    '+09:00';
}
'Americas';
[
    { value: 'America/New_York', label: 'New York (EST/EDT)', offset: '-05:00' },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: '-06:00' },
    { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: '-07:00' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: '-08:00' },
    { value: 'America/Toronto', label: 'Toronto (EST/EDT)', offset: '-05:00' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: '-03:00' }
],
    'Europe';
[
    { value: 'Europe/London', label: 'London (GMT/BST)', offset: '+00:00' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: '+01:00' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: '+01:00' },
    { value: 'Europe/Rome', label: 'Rome (CET/CEST)', offset: '+01:00' },
    { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', offset: '+01:00' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)', offset: '+01:00' }
],
    'Asia';
[
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: '+08:00' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: '+08:00' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: '+08:00' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: '+09:00' },
    { value: 'Asia/Kolkata', label: 'Mumbai/Kolkata (IST)', offset: '+05:30' }
];
;
const COMMON_BUSINESS_HOURS = [
    { name: 'Standard (9 AM - 5 PM)', start: '09:00', end: '17:00', workdays: [1, 2, 3, 4, 5] },
    { name: 'Extended (8 AM - 6 PM)', start: '08:00', end: '18:00', workdays: [1, 2, 3, 4, 5] },
    { name: 'Early (7 AM - 3 PM)', start: '07:00', end: '15:00', workdays: [1, 2, 3, 4, 5] },
    { name: '24/7 Operations', start: '00:00', end: '23:59', workdays: [0, 1, 2, 3, 4, 5, 6] },
    { name: 'Weekend Only', start: '09:00', end: '17:00', workdays: [0, 6] }
];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const AdvancedDateTimeControls = ({
    value,
    onChange,
    businessHours,
    onBusinessHoursChange,
    conflictDetection = true,
    smartSuggestions = true,
    allowPastDates = false,
    className = ''
});
{
    const [currentTab, setCurrentTab] = useState('datetime');
    const [selectedDate, setSelectedDate] = useState(value?.date || new Date());
    const [selectedTime, setSelectedTime] = useState(value?.time || '09:00');
    const [selectedTimezone, setSelectedTimezone] = useState(value?.timezone || 'UTC');
    const [_____showTimezoneSearch, _____setShowTimezoneSearch] = useState(false);
    const [timezoneSearchQuery, setTimezoneSearchQuery] = useState('');
    const [currentBusinessHours, setCurrentBusinessHours] = useState();
    businessHours || {
        enabled: true,
        workdays: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        // Calculate current date/time in selected timezone
        const: dateTimeInTimezone = useMemo(() => {
            const combined = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':');
            combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return combined;
        }, [selectedDate, selectedTime]),
        // Check for conflicts
        const: conflictInfo, ConflictInfo = useMemo(() => {
            if (!conflictDetection) {
                return { hasConflict: false, type: 'other', description: '', severity: 'low' };
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
                            suggestion: `Consider scheduling during workdays: ${currentBusinessHours.workdays.map(d => WEEKDAY_SHORT[d]).join(', ')}`
                        };
                    }
                    ;
                    if (timeValue < currentBusinessHours.startTime || timeValue > currentBusinessHours.endTime) {
                        return {
                            hasConflict: true,
                            type: 'business_hours',
                            description: `Selected time is outside business hours (${currentBusinessHours.startTime} - ${currentBusinessHours.endTime})`
                        };
                    }
                    severity: 'medium',
                        suggestion;
                    `Consider scheduling between ${currentBusinessHours.startTime} and ${currentBusinessHours.endTime}`;
                }
            }
            ;
            // Check for past dates
            if (!allowPastDates && dateTimeInTimezone < new Date()) {
                return {
                    hasConflict: true,
                    type: 'other',
                    description: 'Selected time is in the past',
                    severity: 'high',
                    suggestion: 'Please select a future date and time',
                };
                return { hasConflict: false, type: 'other', description: '', severity: 'low' };
            }
            [dateTimeInTimezone, selectedTime, currentBusinessHours, allowPastDates, conflictDetection];
        }),
        // Smart time suggestions
        const: smartTimeSuggestions = useMemo(() => {
            if (!smartSuggestions)
                return [];
            const suggestions = [];
            const baseDate = new Date(selectedDate);
            // Suggest optimal times based on business hours
            if (currentBusinessHours.enabled) {
                const [startHour, startMin] = currentBusinessHours.startTime.split(':').map(Number);
                const [endHour, _____endMin] = currentBusinessHours.endTime.split(':').map(Number);
                // Suggest start of business day
                const startOfDay = new Date(baseDate);
                startOfDay.setHours(startHour, startMin, 0, 0);
                if (startOfDay > new Date())
                    suggestions.push(startOfDay);
                // Suggest mid-morning
                const midMorning = new Date(baseDate);
                midMorning.setHours(startHour + 1, 0, 0, 0);
                if (midMorning > new Date())
                    suggestions.push(midMorning);
                // Suggest lunch break end
                const postLunch = new Date(baseDate);
                postLunch.setHours(13, 0, 0, 0);
                if (postLunch > new Date() && postLunch.getHours() <= endHour)
                    suggestions.push(postLunch);
                // Suggest late afternoon
                const lateAfternoon = new Date(baseDate);
                lateAfternoon.setHours(Math.min(15, endHour - 1), 0, 0, 0);
                if (lateAfternoon > new Date())
                    suggestions.push(lateAfternoon);
                return suggestions.slice(0, 4);
            }
            [selectedDate, currentBusinessHours, smartSuggestions];
        }),
        // Handle date change
        const: handleDateChange = (date) => {
            setSelectedDate(date);
            updateSelection({ date, time: selectedTime, timezone: selectedTimezone });
        },
        // Handle time change
        const: handleTimeChange = (time) => {
            setSelectedTime(time);
            updateSelection({ date: selectedDate, time, timezone: selectedTimezone });
        },
        // Handle timezone change
        const: handleTimezoneChange = (timezone) => {
            setSelectedTimezone(timezone);
            updateSelection({ date: selectedDate, time: selectedTime, timezone });
        },
        // Update parent component
        const: updateSelection = (partial) => {
            const newSelection = {
                date: selectedDate,
                time: selectedTime,
                timezone: selectedTimezone,
                businessHoursOnly: currentBusinessHours.enabled,
                ...partial
            };
            onChange(newSelection);
        },
        // Business hours preset handler
        const: applyBusinessHoursPreset = (preset) => {
            const newBusinessHours = {
                ...currentBusinessHours,
                startTime: preset.start,
                endTime: preset.end,
                workdays: preset.workdays,
            };
            setCurrentBusinessHours(newBusinessHours);
            onBusinessHoursChange?.(newBusinessHours);
        },
        // Format date for display
        const: formatDisplayDate = (date) => {
            return new Intl.DateTimeFormat('en-US', {});
            weekday: 'long',
                year;
            'numeric',
                month;
            'long',
                day;
            'numeric',
            ;
        }, : .format(date)
    };
    // Format time for display
    const formatDisplayTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    };
}
;
// Generate time options
const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }
        options.push(timeStr);
        return options;
    }
    [];
});
// Filter timezones based on search
const filteredTimezones = useMemo(() => {
    if (!timezoneSearchQuery)
        return TIMEZONE_GROUPS;
    const query = timezoneSearchQuery.toLowerCase();
    const filtered = {};
    Object.entries(TIMEZONE_GROUPS).forEach(([group, timezones]) => {
        const matchingTimezones = timezones.filter(tz => );
    });
    tz.label.toLowerCase().includes(query) ||
        tz.value.toLowerCase().includes(query);
});
if (matchingTimezones.length > 0) {
    filtered[group] = matchingTimezones;
}
;
return filtered;
[timezoneSearchQuery];
;
return;
_jsxs("div", { className: `space-y-4 ${className}`, children: ["}", _jsxs(Tabs, { value: currentTab, onValueChange: setCurrentTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "datetime", children: "Date & Time" }), _jsx(TabsTrigger, { value: "timezone", children: "Timezone" }), _jsx(TabsTrigger, { value: "business", children: "Business Hours" }), _jsx(TabsTrigger, { value: "preview", children: "Preview" })] }), _jsx(TabsContent, { value: "datetime", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4" }), "Select Date"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsx(Input, { type: "date", value: selectedDate.toISOString().split('T')[0], onChange: (e) => handleDateChange(new Date(e.target.value)), min: allowPastDates ? undefined : new Date().toISOString().split('T')[0] }), _jsx("p", { className: "text-sm text-gray-600", children: formatDisplayDate(selectedDate) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4" }), "Select Time"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-3", children: [_jsx(Select, { value: selectedTime, onValueChange: handleTimeChange, children: timeOptions.map(time => ()
                                                            < option, key = { time }, value = { time } >
                                                            {}) }), "))}"] }), _jsx("p", { className: "text-sm text-gray-600", children: formatDisplayTime(selectedTime) })] })] })] }) }), smartTimeSuggestions.length > 0 && ()
                    < Card >
                    (_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4" }), "Smart Suggestions"] }) })
                        ,
                            _jsxs(CardContent, { children: [_jsxs("div", { className: "flex flex-wrap gap-2", children: [smartTimeSuggestions.map((suggestion, index) => ()
                                                < Button, key = { index }, variant = "outline", size = "sm", onClick = {}()), " => ", setSelectedDate(suggestion), "; setSelectedTime(); `$", suggestion.getHours().toString().padStart(2, '0'), ":$", suggestion.getMinutes().toString().padStart(2, '0'), "`} ); }} >", formatDisplayTime(`${suggestion.getHours().toString().padStart(2, '0')}:${suggestion.getMinutes().toString().padStart(2, '0')}`)] }), "))}"] }))] })] });
{ /* Conflict Detection */ }
{
    conflictDetection && ()
        < Card >
        (_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [conflictInfo.hasConflict ? ()
                        < AlertTriangle : , " className=\"h-4 w-4 text-orange-600\" /> ) : ()", _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), ")} Conflict Detection"] }) })
            ,
                _jsxs(CardContent, { children: [conflictInfo.hasConflict ? ()
                            < div : , " className=\"space-y-2\">", _jsxs(Badge, { variant: conflictInfo.severity === 'high' ? 'destructive' : 'default', children: [conflictInfo.severity, " priority"] }), _jsx("p", { className: "text-gray-900", children: conflictInfo.description }), conflictInfo.suggestion && ()
                            < p, " className=\"text-sm text-blue-600\">", conflictInfo.suggestion] }));
}
div >
;
()
    < p;
className = "text-green-600" > No;
conflicts;
detected;
p >
;
CardContent >
;
Card >
;
TabsContent >
    { /* Timezone Tab */}
    < TabsContent;
value = "timezone";
className = "space-y-4" >
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "h-4 w-4" }), "Select Timezone"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "relative", children: _jsx(Input, { placeholder: "Search timezones...", value: timezoneSearchQuery, onChange: (e) => setTimezoneSearchQuery(e.target.value) }) }), _jsxs("div", { className: "p-3 border rounded-lg bg-blue-50", children: [_jsxs("p", { className: "font-medium", children: ["Current: ", selectedTimezone] }), _jsx("p", { className: "text-sm text-gray-600", children: TIMEZONE_GROUPS.Popular.find(tz => tz.value === selectedTimezone)?.label })] }), _jsxs("div", { className: "space-y-3", children: [Object.entries(filteredTimezones).map(([group, timezones]) => ()
                                        < div, key = { group } >
                                        (_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: group })
                                            ,
                                                _jsxs("div", { className: "space-y-1", children: [timezones.map((timezone) => ()
                                                            < button, key = { timezone, : .value }, className = {} `w-full text-left p-2 rounded border hover:bg-gray-50 ${selectedTimezone === timezone.value ? 'bg-blue-50 border-blue-300' : '',
                                                        }`), "onClick=", () => handleTimezoneChange(timezone.value), ">", _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: timezone.label }), _jsx(Badge, { variant: "outline", className: "text-xs", children: timezone.offset })] })] }))), ")}"] })] }), "))}"] })] });
CardContent >
;
Card >
;
TabsContent >
    { /* Business Hours Tab */}
    < TabsContent;
value = "business";
className = "space-y-4" >
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Building, { className: "h-4 w-4" }), "Business Hours Configuration"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "businessHoursEnabled", checked: currentBusinessHours.enabled, onChange: (e) => {
                                    const newBusinessHours = { ...currentBusinessHours, enabled: e.target.checked };
                                    setCurrentBusinessHours(newBusinessHours);
                                    onBusinessHoursChange?.(newBusinessHours);
                                } }), _jsx("label", { htmlFor: "businessHoursEnabled", className: "font-medium", children: "Enable business hours restrictions" })] }), currentBusinessHours.enabled && (), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Quick Presets" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: [COMMON_BUSINESS_HOURS.map((preset, index) => ()
                                        < Button, key = { index }, variant = "outline", size = "sm", onClick = {}()), " => applyBusinessHoursPreset(preset)} >", preset.name] }), "))}"] })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Time" }), _jsx(Select, { value: currentBusinessHours.startTime, onValueChange: (time) => {
                                const newBusinessHours = { ...currentBusinessHours, startTime: time };
                                setCurrentBusinessHours(newBusinessHours);
                                onBusinessHoursChange?.(newBusinessHours);
                            }, children: timeOptions.filter((_, index) => index % 4 === 0).map(time => ()
                                < option, key = { time }, value = { time } >
                                {}) }), "))}"] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Time" }), _jsx(Select, { value: currentBusinessHours.endTime, onValueChange: (time) => {
                            const newBusinessHours = { ...currentBusinessHours, endTime: time };
                            setCurrentBusinessHours(newBusinessHours);
                            onBusinessHoursChange?.(newBusinessHours);
                        }, children: timeOptions.filter((_, index) => index % 4 === 0).map(time => ()
                            < option, key = { time }, value = { time } >
                            {}) }), "))}"] })] });
div >
    { /* Working Days */}
    < div >
    (_jsx("h4", { className: "font-medium mb-2", children: "Working Days" })
        ,
            _jsxs("div", { className: "flex flex-wrap gap-2", children: [WEEKDAY_NAMES.map((day, index) => ()
                        < label, key = { index }, className = "flex items-center space-x-1 cursor-pointer" >
                        _jsx("input", { type: "checkbox", checked: currentBusinessHours.workdays.includes(index), onChange: (e) => {
                                const newWorkdays = e.target.checked;
                            } })
                        ? [...currentBusinessHours.workdays, index]
                        : currentBusinessHours.workdays.filter(d => d !== index)), "; const newBusinessHours = ", ...(currentBusinessHours, workdays), ": newWorkdays.sort() }; setCurrentBusinessHours(newBusinessHours); onBusinessHoursChange?.(newBusinessHours); }} />", _jsx("span", { className: "text-sm", children: day })] }));
div >
;
div >
;
 >
;
CardContent >
;
Card >
;
TabsContent >
    { /* Preview Tab */}
    < TabsContent;
value = "preview";
className = "space-y-4" >
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "h-4 w-4" }), "Schedule Preview"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "p-4 border rounded-lg bg-gray-50", children: [_jsx("h4", { className: "font-medium mb-2", children: "Selected Date & Time" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("p", { children: [_jsx("strong", { children: "Date:" }), " ", formatDisplayDate(selectedDate)] }), _jsxs("p", { children: [_jsx("strong", { children: "Time:" }), " ", formatDisplayTime(selectedTime)] }), _jsxs("p", { children: [_jsx("strong", { children: "Timezone:" }), " ", selectedTimezone] }), _jsxs("p", { children: [_jsx("strong", { children: "Full DateTime:" }), " ", dateTimeInTimezone.toISOString()] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Time in Other Zones" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: [TIMEZONE_GROUPS.Popular.slice(0, 4).map((tz) => {
                                        const timeInZone = new Intl.DateTimeFormat('en-US', {});
                                        timeZone: tz.value,
                                            weekday;
                                    }), ": 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', }).format(dateTimeInTimezone); return;", _jsxs("div", { className: "p-2 border rounded text-sm", children: [_jsx("p", { className: "font-medium", children: tz.value }), _jsx("p", { className: "text-gray-600", children: timeInZone })] }, tz.value), "); })}"] })] }), currentBusinessHours.enabled && ()
                        < div >
                        (_jsx("h4", { className: "font-medium mb-2", children: "Business Hours Status" })
                            ,
                                _jsxs("div", { className: "p-3 border rounded-lg", children: [conflictInfo.hasConflict ? ()
                                            < div : , " className=\"flex items-center gap-2 text-orange-600\">", _jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx("span", { children: "Outside business hours" })] })), ") : ()", _jsxs("div", { className: "flex items-center gap-2 text-green-600", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx("span", { children: "Within business hours" })] }), ")}"] })] });
CardContent >
;
Card >
;
TabsContent >
;
Tabs >
;
div >
;
;
;
export default AdvancedDateTimeControls;
