/**
 * Epic 16 Ticket Management Dashboard
 *
 * Comprehensive React UI for managing marketplace and community tickets.
 * Provides full CRUD operations, filtering, status management, and real-time updates.
 */
import React from 'react';
import { MarketplaceTicket, Epic16TicketIntegrationService } from '../../services/Epic16TicketIntegrationService';

}
interface TicketManagementDashboardProps {
    ticketService: Epic16TicketIntegrationService;
    userId: string;
    userRole: 'user' | 'agent' | 'admin';
    onTicketSelect?: (ticket: MarketplaceTicket) => void;

export declare const TicketManagementDashboard: React.FC<TicketManagementDashboardProps>;
export default TicketManagementDashboard;
//# sourceMappingURL=TicketManagementDashboard.d.ts.map
}