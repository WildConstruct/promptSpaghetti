/**
 * Consent Storage Type Definitions
 * TypeScript interfaces for the consent management database schema
 * Part of Epic 19 - Security & Compliance Framework
 * Task: E19-1753114711826-03C121 - Create schema for consent storage
 */
;
referrer ?  : string;
page_url ?  : string;
device_info ?  : { device_type: string,
    browser: string,
    browser_version: string,
    os: string,
    os_version: string,
    screen_resolution: string,
    timezone: string };
campaign_info ?  : { source: string,
    medium: string,
    campaign: string,
    content: string,
    term: string };
;
phone ?  : string;
website ?  : string;
legal_representative ?  : { name: string,
    email: string,
    phone: string };
sharing_status: 'active' | 'paused' | 'terminated';
// Legal Framework
legal_mechanism ?  : string;
international_transfer: boolean;
adequacy_assessment: boolean;
// Temporal
sharing_started_at: Date;
sharing_ends_at ?  : Date;
last_shared_at ?  : Date;
created_at: Date;
updated_at: Date;
customizable: boolean;
;
canToggle: boolean;
purposes: string;
legalBasis: LegalBasis;
dependencies ?  : string;
conflicts ?  : string;
theme: 'light' | 'dark' | 'auto';
showLogo ?  : boolean;
showRejectAll: boolean;
showAcceptAll: boolean;
showCustomize: boolean;
showMoreInfo: boolean;
moreInfoUrl ?  : string;
animation ?  : 'none' | 'fade-in' | 'slide-up' | 'slide-down';
overlay ?  : boolean;
dismissible: boolean;
respectDNT: boolean;
layout: 'horizontal' | 'vertical' | 'compact';
// Styling
primaryColor ?  : string;
textColor ?  : string;
backgroundColor ?  : string;
borderColor ?  : string;
buttonStyle ?  : 'rounded' | 'square' | 'pill';
fontSize ?  : string;
padding ?  : string;
borderRadius ?  : string;
boxShadow ?  : string;
zIndex ?  : number;
responsive ?  : boolean;
// Localization
languages ?  : Record;
consentProof: boolean;
dataPortability: boolean;
rightToErasure: boolean;
ageVerification: boolean;
minimumAge ?  : number;
parentalConsent: boolean;
jurisdictionDetection: boolean;
defaultJurisdiction: string;
auditLogging: boolean;
complianceMonitoring: boolean;
;
purposes: string;
legal_basis: LegalBasis;
compliance_frameworks: string;
collection_context: ConsentCollectionContext;
metadata ?  : Record;
// ===================================================================
// Export Types
// ===================================================================
export * from './consent'; // Re-export existing consent types for compatibility
