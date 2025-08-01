/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Admin Incident Dashboard - Epic 17
 *
 * Specialized incident management dashboard for Epic 17 Backstage Admin Controls.
 * Provides real-time monitoring, playbook execution, and incident response
 * capabilities for all Epic 17 systems.
 *
 * Task: E17-1753114397260-08F809 - Create incident playbooks
 * Epic: 17 - Backstage Admin Controls
 */
import React from 'react';
import { PlaybookCategory, Epic17System } from '../../types/Epic17IncidentPlaybooks';
import { ActionSeverity } from '../../types/EnforcementTypes';

}
}
interface AdminIncidentDashboardProps { onPlaybookExecute?: (playbookId: string, options: ExecutionOptions) => Promise<void>;
    onIncidentCreate?: (incident: IncidentCreationData) => Promise<void>;
    className?: string }
}
}
interface ExecutionOptions { manualTrigger?: boolean;
    userId?: string;
    urgencyOverride?: ActionSeverity;
    skipApproval?: boolean;
    dryRun?: boolean }
}
}
interface IncidentCreationData {
    title: string;
    description: string;
    severity: ActionSeverity;
    affectedSystems: Epic17System[];
    category: PlaybookCategory;

export declare const AdminIncidentDashboard: React.FC<AdminIncidentDashboardProps>;
export default AdminIncidentDashboard;
//# sourceMappingURL=AdminIncidentDashboard.d.ts.map
}
}