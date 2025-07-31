/**
 * ConsentPreferenceCenter Component - Epic 19
 *
 * Comprehensive consent preference management center with detailed controls,
 * history tracking, data subject rights, and compliance features.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React from 'react';
}
interface ConsentPreferenceCenterProps {
    userId?: string;
    onConsentUpdate?: (consents: ConsentSettings) => void;
    onDataRequest?: (requestType: DataRequestType) => void;
    showDataRights?: boolean;
    showHistory?: boolean;
    jurisdiction?: string;
}
interface ConsentSettings {
    categories: Record<string, CategoryConsent>;
    communications: CommunicationPreferences;
    dataProcessing: DataProcessingPreferences;
    retention: RetentionPreferences;
    sharing: SharingPreferences;
    lastUpdated: Date;
}
interface CategoryConsent {
    enabled: boolean;
    granularChoices: Record<string, boolean>;
    lastModified: Date;
    expiresAt?: Date;
    source: string;
}
interface CommunicationPreferences {
    email: ChannelPreference;
    sms: ChannelPreference;
    push: ChannelPreference;
    phone: ChannelPreference;
    post: ChannelPreference;
}
interface ChannelPreference {
    enabled: boolean;
    frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NEVER';
    topics: string[];
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
        timezone: string;
}
    };
}
interface DataProcessingPreferences {
    analytics: ProcessingConsent;
    personalization: ProcessingConsent;
    marketing: ProcessingConsent;
    research: ProcessingConsent;
    aiProcessing: ProcessingConsent;
}
interface ProcessingConsent {
    enabled: boolean;
    allowAutomatedDecisions: boolean;
    allowProfiling: boolean;
    allowSharing: boolean;
    allowInternationalTransfers: boolean;
    retentionPeriod: number;
}
interface RetentionPreferences {
    minimumRetention: boolean;
    autoDelete: boolean;
    customRetentionPeriods: Record<string, number>;
    deleteInactiveData: boolean;
    inactivityThreshold: number;
}
interface SharingPreferences {
    internal: SharingConsent;
    partners: SharingConsent;
    vendors: SharingConsent;
    research: SharingConsent;
    legal: SharingConsent;
}
interface SharingConsent {
    enabled: boolean;
    purposes: string[];
    recipientTypes: string[];
    geographicRestrictions: string[];
    requiresNotification: boolean;
type DataRequestType = 'ACCESS' | 'PORTABILITY' | 'RECTIFICATION' | 'ERASURE' | 'RESTRICTION' | 'OBJECTION';
declare const ConsentPreferenceCenter: React.FC<ConsentPreferenceCenterProps>;
export default ConsentPreferenceCenter;
//# sourceMappingURL=ConsentPreferenceCenter.d.ts.map
}