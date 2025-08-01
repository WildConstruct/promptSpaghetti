/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Advanced DateTime Controls - Epic 17
 *
 * Comprehensive date and time controls for scheduling with timezone support,
 * business hours, conflict detection, and smart scheduling features.
 *
 * Task: E17-1753114396815-A5C08F - Create datetime controls
 * Epic: 17 - Backstage Admin Controls
 */
import React from 'react';

}
}
interface DateTimeSelection { date: Date;
    time: string;
    timezone: string;
    businessHoursOnly?: boolean;
    avoidWeekends?: boolean;
    smartSuggestion?: boolean }
}
}
interface BusinessHours { enabled: boolean;
    workdays: number[];
    startTime: string;
    endTime: string;
    timezone: string }
}
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

export declare const AdvancedDateTimeControls: React.FC<AdvancedDateTimeControlsProps>;
export default AdvancedDateTimeControls;
//# sourceMappingURL=AdvancedDateTimeControls.d.ts.map
}
}