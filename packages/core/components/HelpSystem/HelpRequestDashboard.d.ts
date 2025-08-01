/**
 * Epic 16 Help Request Dashboard
 *
 * Comprehensive dashboard for managing help requests with intelligent routing,
 * knowledge base integration, and real-time analytics.
 */
import React from 'react';
import { HelpRequest, Epic16HelpRequestService } from '../../services/Epic16HelpRequestService';

}
}
interface HelpRequestDashboardProps {
    helpService: Epic16HelpRequestService;
    userId: string;
    userRole: 'user' | 'agent' | 'admin';
    onRequestSelect?: (request: HelpRequest) => void;

export declare const HelpRequestDashboard: React.FC<HelpRequestDashboardProps>;
export default HelpRequestDashboard;
//# sourceMappingURL=HelpRequestDashboard.d.ts.map
}
}