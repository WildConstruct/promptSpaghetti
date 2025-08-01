/**
 * Epic 16 Ticket Details View
 *
 * Comprehensive ticket detail view with comments, attachments, status updates,
 * and SLA tracking. Provides full ticket management capabilities.
 */
import React from 'react';
import { MarketplaceTicket, Epic16TicketIntegrationService } from '../../services/Epic16TicketIntegrationService';

}
}
interface TicketDetailsViewProps {
    ticket: MarketplaceTicket;
    ticketService: Epic16TicketIntegrationService;
    userId: string;
    userRole: 'user' | 'agent' | 'admin';
    onClose?: () => void;
    onTicketUpdate?: (ticket: MarketplaceTicket) => void;

export declare const TicketDetailsView: React.FC<TicketDetailsViewProps>;
export default TicketDetailsView;
//# sourceMappingURL=TicketDetailsView.d.ts.map
}
}