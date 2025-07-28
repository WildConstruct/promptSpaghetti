/**
 * Epic 16 Ticket Integration - Main Component
 *
 * Main integration component that brings together all Epic 16 ticket
 * management functionality including dashboard, details view, and service integration.
 */
import React from 'react';
import { TicketIntegrationConfig } from '../../services/Epic16TicketIntegrationService';

interface Epic16TicketIntegrationProps {
    userId: string;
    userRole: 'user' | 'agent' | 'admin';
    config?: Partial<TicketIntegrationConfig>;
    onConfigChange?: (config: TicketIntegrationConfig) => void;

export declare const Epic16TicketIntegration: React.FC<Epic16TicketIntegrationProps>;
export default Epic16TicketIntegration;
//# sourceMappingURL=Epic16TicketIntegration.d.ts.map