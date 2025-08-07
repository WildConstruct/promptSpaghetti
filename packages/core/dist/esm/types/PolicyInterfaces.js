/**
 * Policy Interfaces - Epic 17 Implementation
 * Task: E17-1753114397367-674DF3 - Design policy interfaces
 *
 * Comprehensive TypeScript interfaces for the unified policy management system.
 * Provides base interfaces, policy types, and management structures for all
 * policy-related functionality across the application.
 */
severity: 'low' | 'medium' | 'high' | 'critical';
automatic: boolean;
escalationPath ?  : string;
requiredFields: string;
optionalFields: string;
fieldValidations: FieldValidation;
// Usage and customization
customizable: boolean;
industrySpecific ?  : string;
complianceFrameworks: ComplianceFramework;
// Template metadata
createdAt: Date;
createdBy: string;
popularity: number;
usage_count: number;
// Versioning
parentTemplateId ?  : string;
childTemplates ?  : string;
title: string;
description: string;
impact: 'low' | 'medium' | 'high' | 'critical';
actionable: boolean;
relatedPolicies: string;
priority: 'low' | 'medium' | 'high' | 'critical';
title: string;
description: string;
expectedImpact: string;
implementationComplexity: 'low' | 'medium' | 'high';
estimatedEffort: string;
dueDate ?  : Date;
code: string;
field: string;
oldValue ?  : any;
newValue ?  : any;
path: string;
export {};
