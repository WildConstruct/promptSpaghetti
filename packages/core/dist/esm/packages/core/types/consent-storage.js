/**
 * Consent Storage Type Definitions
 * TypeScript interfaces for the consent management database schema
 * Part of Epic 19 - Security & Compliance Framework
 * Task: E19-1753114711826-03C121 - Create schema for consent storage
 */
;
referrer ?  : string;
page_url ?  : string;
device_info ?  : {
    device_type: string,
    browser: string,
    browser_version: string,
    os: string,
    os_version: string,
    screen_resolution: string,
    timezone: string
};
campaign_info ?  : {
    source: string,
    medium: string,
    campaign: string,
    content: string,
    term: string
};
;
phone ?  : string;
website ?  : string;
legal_representative ?  : {
    name: string,
    email: string,
    phone: string
};
;
;
export * from './consent'; // Re-export existing consent types for compatibility
