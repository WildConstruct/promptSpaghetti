/**
 * Epic 17 Incident Playbooks Types - Epic 17
 *
 * Comprehensive type definitions for incident playbooks specifically designed
 * for Epic 17 Backstage Admin Controls. Extends existing incident response
 * infrastructure with admin system-specific playbooks and automation.
 *
 * Task: E17-1753114397260-08F809 - Create incident playbooks
 * Epic: 17 - Backstage Admin Controls
 */
description: string;
enabled: boolean;
priority: number;
scope: string;
required: boolean;
fallbackOptions: string;
expression: string;
description: string;
required: boolean;
retryConditions: RetryCondition;
description: string;
validationMethod: string;
required: boolean;
description: string;
automaticExecution: boolean;
credentials: CredentialReference;
refreshPolicy: RefreshPolicy;
key: string;
fallbackKeys: string;
description: string;
configuration: any;
automaticActivation: boolean;
configuration: any;
enabled: boolean;
priority: number;
configuration: any;
enabled: boolean;
condition: string;
required: boolean;
frequency: number;
averageSeverity: ActionSeverity;
commonTriggers: string;
lastUpdated: Date;
identifier: string;
contactMethods: ContactMethod;
availability: AvailabilitySchedule;
address: string;
priority: number;
availability: AvailabilityWindow;
export {};
