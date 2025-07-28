/**
 * Epic 16 Help Request Form
 *
 * Intelligent help request submission form with auto-suggestions,
 * knowledge base integration, and smart categorization.
 */
import React from 'react';
import { HelpRequest, Epic16HelpRequestService, RequestContext } from '../../services/Epic16HelpRequestService';

interface HelpRequestFormProps {
    helpService: Epic16HelpRequestService;
    userId: string;
    userType: 'guest' | 'user' | 'seller' | 'buyer' | 'admin';
    userTier: 'free' | 'premium' | 'enterprise';
    context?: Partial<RequestContext>;
    onSubmitted?: (request: HelpRequest) => void;
    onCancel?: () => void;

export declare const HelpRequestForm: React.FC<HelpRequestFormProps>;
export default HelpRequestForm;
//# sourceMappingURL=HelpRequestForm.d.ts.map