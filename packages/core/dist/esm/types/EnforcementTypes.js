/**
 * Enforcement Action Types - Epic 17
 *
 * Comprehensive type definitions for marketplace enforcement actions,
 * violation management, and automated moderation systems.
 *
 * Task: E17-1753114397379-11939C - Create enforcement actions
 * Epic: 17 - Backstage Admin Controls
 */
automatedDetection: boolean;
communityReported: boolean;
tags: string;
externalReferences: string;
publicVisibility: boolean;
legalImplications: boolean;
specificRequest: string;
justification: string;
reasoning: string;
evidenceConsidered: string;
policyReferences: string;
precedentCases ?  : string;
// Modifications if partially approved
modifiedActions ?  : Partial < EnforcementAction > [];
// Implementation timeline
implementationDeadline ?  : Date;
monitoringRequired ?  : boolean;
timeline: string;
successMetrics: string;
generatedAt: Date;
export {};
