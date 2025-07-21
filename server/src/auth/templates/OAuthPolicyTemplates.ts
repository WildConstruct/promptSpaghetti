/**
 * OAuth Policy Templates Library
 * 
 * Comprehensive collection of OAuth policy templates for different client types,
 * security levels, environments, and compliance frameworks.
 * 
 * Task: T-1752989143998-507 - Create OAuth policies
 */

import { 
  OAuthPolicyTemplate, 
  ClientType, 
  SecurityLevel, 
  EnvironmentType, 
  ComplianceFramework,
  PolicyDocument,
  PolicySection,
  PolicyRequirement,
  ValidationRule,
  EnforcementMechanism 
} from '../services/OAuthPolicyService';

// OAuth Policy Template Categories
export 
// Client Type Configurations
export 
// Security Level Configurations
export 
// Environment-Specific Configurations
export 
// Compliance Framework Templates
export 
/**
 * OAuth Client Registration Policy Templates
 */
export const CLIENT_REGISTRATION_TEMPLATES: Record<string, OAuthPolicyTemplate> = {
  
  WEB_APPLICATION: {
    templateId: 'OAUTH-CLIENT-WEB-001',
    policyType: 'OAUTH_CLIENT_REGISTRATION',
    title: 'Web Application OAuth Client Registration Policy',
    description: 'Policy requirements for registering server-side web application OAuth clients',
    version: '1.0',
    frameworks: ['OAuth2.1', 'GDPR', 'SOX'],
    targetEnvironments: ['PRODUCTION', 'STAGING'],
    template: {
      title: 'Web Application OAuth Client Standards',
      description: 'Security and compliance requirements for web application OAuth clients',
      sections: [
        {
          sectionId: 'client-configuration',
          title: 'Client Configuration Requirements',
          content: 'Web applications must be configured as confidential clients with proper authentication',
          mandatory: true,
          variables: [
            {
              name: 'clientType',
              type: 'SELECT',
              description: 'OAuth client type (must be CONFIDENTIAL)',
              required: true,
              defaultValue: 'CONFIDENTIAL',
              options: ['CONFIDENTIAL']
            },
            {
              name: 'redirectUris',
              type: 'LIST',
              description: 'Allowed redirect URIs (HTTPS required)',
              required: true,
              validation: {
                pattern: '^https://.*',
                minLength: 1
              }
            },
            {
              name: 'scopes',
              type: 'MULTI_SELECT',
              description: 'Requested OAuth scopes',
              required: true,
              options: ['openid', 'profile', 'email', 'read:user', 'write:user']
            }
          ],
          validations: [
            {
              ruleId: 'HTTPS-REDIRECT-REQUIRED',
              expression: 'redirectUris.every(uri => uri.startsWith("https://"))',
              errorMessage: 'All redirect URIs must use HTTPS',
              severity: 'ERROR'
            },
            {
              ruleId: 'CLIENT-SECRET-REQUIRED',
              expression: 'clientType === "CONFIDENTIAL"',
              errorMessage: 'Web applications must use confidential client type',
              severity: 'ERROR'
            }
          ]
        },
        {
          sectionId: 'security-requirements',
          title: 'Security Requirements',
          content: 'Additional security measures for web applications',
          mandatory: true,
          variables: [
            {
              name: 'certificatePinning',
              type: 'BOOLEAN',
              description: 'Enable certificate pinning for OAuth provider connections',
              required: false,
              defaultValue: false
            },
            {
              name: 'tokenBinding',
              type: 'BOOLEAN',
              description: 'Enable token binding for high-security scenarios',
              required: false,
              defaultValue: false
            }
          ],
          validations: []
        }
      ],
      requirements: [
        {
          requirementId: 'WEB-CLIENT-001',
          title: 'Confidential Client Type Required',
          description: 'Web applications must be registered as confidential clients',
          mandatory: true,
          complianceFrameworks: ['OAuth2.1'],
          enforcementAction: 'BLOCK'
        },
        {
          requirementId: 'WEB-CLIENT-002',
          title: 'HTTPS Redirect URIs Required',
          description: 'All redirect URIs must use HTTPS protocol',
          mandatory: true,
          complianceFrameworks: ['OAuth2.1'],
          enforcementAction: 'BLOCK'
        },
        {
          requirementId: 'WEB-CLIENT-003',
          title: 'Client Authentication Required',
          description: 'Web applications must authenticate using client credentials',
          mandatory: true,
          complianceFrameworks: ['OAuth2.1'],
          enforcementAction: 'BLOCK'
        }
      ],
      exceptions: [
        {
          exceptionId: 'DEV-HTTP-EXCEPTION',
          title: 'Development Environment HTTP Exception',
          description: 'Allow HTTP redirect URIs for localhost development',
          conditions: [
            {
              field: 'environment',
              operator: 'EQUALS',
              value: 'DEVELOPMENT'
            },
            {
              field: 'redirectUri',
              operator: 'CONTAINS',
              value: 'localhost'
            }
          ],
          approvalRequired: false
        }
      ],
      reviewSchedule: 'QUARTERLY',
      approvalRequired: false
    },
    validationRules: [
      {
        ruleId: 'WEB-VALIDATION-001',
        name: 'Client Type Validation',
        description: 'Validate client type is CONFIDENTIAL',
        expression: 'clientType === "CONFIDENTIAL"',
        action: 'DENY',
        priority: 100,
        enabled: true
      }
    ],
    enforcementMechanisms: [
      {
        mechanismId: 'WEB-CLIENT-VALIDATION',
        name: 'Web Client Configuration Validation',
        trigger: 'ON_CLIENT_REGISTRATION',
        action: 'validateWebClientConfiguration',
        escalation: 'BLOCK',
        automated: true
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  SINGLE_PAGE_APPLICATION: {
    templateId: 'OAUTH-CLIENT-SPA-001',
    policyType: 'OAUTH_CLIENT_REGISTRATION',
    title: 'Single Page Application OAuth Client Registration Policy',
    description: 'Policy requirements for registering SPA OAuth clients with PKCE',
    version: '1.0',
    frameworks: ['OAuth2.1', 'GDPR'],
    targetEnvironments: ['PRODUCTION', 'STAGING', 'DEVELOPMENT'],
    template: {
      title: 'Single Page Application OAuth Client Standards',
      description: 'Security requirements for SPA OAuth clients including mandatory PKCE',
      sections: [
        {
          sectionId: 'spa-configuration',
          title: 'SPA Client Configuration',
          content: 'Single page applications must be configured as public clients with PKCE',
          mandatory: true,
          variables: [
            {
              name: 'clientType',
              type: 'SELECT',
              description: 'OAuth client type (must be PUBLIC)',
              required: true,
              defaultValue: 'PUBLIC',
              options: ['PUBLIC']
            },
            {
              name: 'pkceRequired',
              type: 'BOOLEAN',
              description: 'PKCE requirement (mandatory for SPAs)',
              required: true,
              defaultValue: true
            },
            {
              name: 'allowedOrigins',
              type: 'LIST',
              description: 'Allowed CORS origins for the application',
              required: true,
              validation: {
                minLength: 1
              }
            }
          ],
          validations: [
            {
              ruleId: 'SPA-PKCE-REQUIRED',
              expression: 'pkceRequired === true',
              errorMessage: 'PKCE is mandatory for single page applications',
              severity: 'ERROR'
            },
            {
              ruleId: 'SPA-NO-SECRET',
              expression: 'clientType === "PUBLIC"',
              errorMessage: 'SPAs must be registered as public clients',
              severity: 'ERROR'
            }
          ]
        }
      ],
      requirements: [
        {
          requirementId: 'SPA-CLIENT-001',
          title: 'PKCE Required for SPAs',
          description: 'All single page applications must implement PKCE',
          mandatory: true,
          complianceFrameworks: ['OAuth2.1'],
          enforcementAction: 'BLOCK'
        },
        {
          requirementId: 'SPA-CLIENT-002',
          title: 'Public Client Type Required',
          description: 'SPAs must be registered as public clients without client secrets',
          mandatory: true,
          complianceFrameworks: ['OAuth2.1'],
          enforcementAction: 'BLOCK'
        }
      ],
      exceptions: [],
      reviewSchedule: 'QUARTERLY',
      approvalRequired: false
    },
    validationRules: [
      {
        ruleId: 'SPA-PKCE-VALIDATION',
        name: 'PKCE Requirement Validation',
        description: 'Ensure PKCE is enabled for SPA clients',
        expression: 'clientType === "PUBLIC" && pkceRequired === true',
        action: 'DENY',
        priority: 100,
        enabled: true
      }
    ],
    enforcementMechanisms: [
      {
        mechanismId: 'SPA-CLIENT-VALIDATION',
        name: 'SPA Client Configuration Validation',
        trigger: 'ON_CLIENT_REGISTRATION',
        action: 'validateSPAClientConfiguration',
        escalation: 'BLOCK',
        automated: true
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  MOBILE_APPLICATION: {
    templateId: 'OAUTH-CLIENT-MOBILE-001',
    policyType: 'OAUTH_CLIENT_REGISTRATION',
    title: 'Mobile Application OAuth Client Registration Policy',
    description: 'Policy requirements for registering mobile app OAuth clients',
    version: '1.0',
    frameworks: ['OAuth2.1', 'GDPR', 'CCPA'],
    targetEnvironments: ['PRODUCTION', 'STAGING'],
    template: {
      title: 'Mobile Application OAuth Client Standards',
      description: 'Security requirements for mobile OAuth clients with app attestation',
      sections: [
        {
          sectionId: 'mobile-configuration',
          title: 'Mobile Client Configuration',
          content: 'Mobile applications require enhanced security measures',
          mandatory: true,
          variables: [
            {
              name: 'clientType',
              type: 'SELECT',
              description: 'OAuth client type (must be PUBLIC)',
              required: true,
              defaultValue: 'PUBLIC',
              options: ['PUBLIC']
            },
            {
              name: 'appAttestationEnabled',
              type: 'BOOLEAN',
              description: 'Enable app attestation for mobile security',
              required: true,
              defaultValue: true
            },
            {
              name: 'customUriSchemes',
              type: 'LIST',
              description: 'Custom URI schemes for mobile app redirects',
              required: true
            }
          ],
          validations: [
            {
              ruleId: 'MOBILE-ATTESTATION-REQUIRED',
              expression: 'appAttestationEnabled === true',
              errorMessage: 'App attestation is required for mobile applications',
              severity: 'ERROR'
            }
          ]
        }
      ],
      requirements: [
        {
          requirementId: 'MOBILE-CLIENT-001',
          title: 'App Attestation Required',
          description: 'Mobile applications must implement app attestation',
          mandatory: true,
          complianceFrameworks: ['OAuth2.1'],
          enforcementAction: 'REQUIRE_APPROVAL'
        }
      ],
      exceptions: [],
      reviewSchedule: 'QUARTERLY',
      approvalRequired: true
    },
    validationRules: [],
    enforcementMechanisms: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

/**
 * OAuth Token Lifecycle Policy Templates
 */
export const TOKEN_LIFECYCLE_TEMPLATES: Record<string, OAuthPolicyTemplate> = {
  
  HIGH_SECURITY_TOKENS: {
    templateId: 'OAUTH-TOKEN-HIGH-001',
    policyType: 'OAUTH_TOKEN_LIFECYCLE',
    title: 'High Security Token Lifecycle Policy',
    description: 'Strict token lifecycle requirements for high-security applications',
    version: '1.0',
    frameworks: ['OAuth2.1', 'PCI_DSS', 'SOX'],
    targetEnvironments: ['PRODUCTION'],
    template: {
      title: 'High Security Token Management Standards',
      description: 'Stringent token lifecycle controls for sensitive applications',
      sections: [
        {
          sectionId: 'token-lifetime',
          title: 'Token Lifetime Configuration',
          content: 'Short-lived tokens with mandatory rotation',
          mandatory: true,
          variables: [
            {
              name: 'accessTokenTTL',
              type: 'NUMBER',
              description: 'Access token lifetime in seconds (max 900)',
              required: true,
              defaultValue: 900,
              validation: {
                max: 900
              }
            },
            {
              name: 'refreshTokenTTL',
              type: 'NUMBER',
              description: 'Refresh token lifetime in seconds (max 3600)',
              required: true,
              defaultValue: 3600,
              validation: {
                max: 3600
              }
            },
            {
              name: 'tokenBindingRequired',
              type: 'BOOLEAN',
              description: 'Require token binding to client/device',
              required: true,
              defaultValue: true
            }
          ],
          validations: [
            {
              ruleId: 'HIGH-SEC-TOKEN-TTL',
              expression: 'accessTokenTTL <= 900 && refreshTokenTTL <= 3600',
              errorMessage: 'Token lifetimes exceed high security limits',
              severity: 'ERROR'
            }
          ]
        }
      ],
      requirements: [
        {
          requirementId: 'HIGH-SEC-TOKEN-001',
          title: 'Short Token Lifetime Required',
          description: 'Access tokens must not exceed 15 minutes lifetime',
          mandatory: true,
          complianceFrameworks: ['PCI_DSS'],
          enforcementAction: 'BLOCK'
        }
      ],
      exceptions: [],
      reviewSchedule: 'MONTHLY',
      approvalRequired: true
    },
    validationRules: [],
    enforcementMechanisms: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

/**
 * OAuth Provider Management Policy Templates
 */
export const PROVIDER_MANAGEMENT_TEMPLATES: Record<string, OAuthPolicyTemplate> = {
  
  ENTERPRISE_PROVIDER: {
    templateId: 'OAUTH-PROVIDER-ENT-001',
    policyType: 'OAUTH_PROVIDER_MANAGEMENT',
    title: 'Enterprise OAuth Provider Management Policy',
    description: 'Comprehensive requirements for enterprise OAuth provider management',
    version: '1.0',
    frameworks: ['OAuth2.1', 'SOX', 'ISO27001'],
    targetEnvironments: ['PRODUCTION'],
    template: {
      title: 'Enterprise OAuth Provider Standards',
      description: 'Rigorous provider management for enterprise environments',
      sections: [
        {
          sectionId: 'provider-approval',
          title: 'Provider Approval Process',
          content: 'All OAuth providers require security assessment and approval',
          mandatory: true,
          variables: [
            {
              name: 'securityAssessmentRequired',
              type: 'BOOLEAN',
              description: 'Require security assessment before approval',
              required: true,
              defaultValue: true
            },
            {
              name: 'businessJustificationRequired',
              type: 'BOOLEAN',
              description: 'Require business justification for provider',
              required: true,
              defaultValue: true
            }
          ],
          validations: []
        }
      ],
      requirements: [
        {
          requirementId: 'ENT-PROVIDER-001',
          title: 'Security Assessment Required',
          description: 'All providers must undergo security assessment',
          mandatory: true,
          complianceFrameworks: ['SOX', 'ISO27001'],
          enforcementAction: 'REQUIRE_APPROVAL'
        }
      ],
      exceptions: [],
      reviewSchedule: 'QUARTERLY',
      approvalRequired: true
    },
    validationRules: [],
    enforcementMechanisms: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

/**
 * OAuth Consent Management Policy Templates
 */
export const CONSENT_MANAGEMENT_TEMPLATES: Record<string, OAuthPolicyTemplate> = {
  
  GDPR_CONSENT: {
    templateId: 'OAUTH-CONSENT-GDPR-001',
    policyType: 'OAUTH_CONSENT_MANAGEMENT',
    title: 'GDPR Compliant OAuth Consent Policy',
    description: 'GDPR-compliant consent management for OAuth flows',
    version: '1.0',
    frameworks: ['GDPR', 'OAuth2.1'],
    targetEnvironments: ['PRODUCTION', 'STAGING'],
    template: {
      title: 'GDPR OAuth Consent Management Standards',
      description: 'Comprehensive consent management aligned with GDPR requirements',
      sections: [
        {
          sectionId: 'consent-collection',
          title: 'Consent Collection Requirements',
          content: 'Explicit, granular consent collection for OAuth scopes',
          mandatory: true,
          variables: [
            {
              name: 'explicitConsentRequired',
              type: 'BOOLEAN',
              description: 'Require explicit consent for each scope',
              required: true,
              defaultValue: true
            },
            {
              name: 'granularScopeConsent',
              type: 'BOOLEAN',
              description: 'Allow individual scope consent selection',
              required: true,
              defaultValue: true
            },
            {
              name: 'consentWithdrawalEnabled',
              type: 'BOOLEAN',
              description: 'Enable consent withdrawal mechanism',
              required: true,
              defaultValue: true
            }
          ],
          validations: [
            {
              ruleId: 'GDPR-EXPLICIT-CONSENT',
              expression: 'explicitConsentRequired === true && granularScopeConsent === true',
              errorMessage: 'GDPR requires explicit and granular consent',
              severity: 'ERROR'
            }
          ]
        }
      ],
      requirements: [
        {
          requirementId: 'GDPR-CONSENT-001',
          title: 'Explicit Consent Required',
          description: 'Users must provide explicit consent for data processing',
          mandatory: true,
          complianceFrameworks: ['GDPR'],
          enforcementAction: 'BLOCK'
        },
        {
          requirementId: 'GDPR-CONSENT-002',
          title: 'Consent Withdrawal Support',
          description: 'Users must be able to withdraw consent easily',
          mandatory: true,
          complianceFrameworks: ['GDPR'],
          enforcementAction: 'REQUIRE_APPROVAL'
        }
      ],
      exceptions: [],
      reviewSchedule: 'QUARTERLY',
      approvalRequired: false
    },
    validationRules: [],
    enforcementMechanisms: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

/**
 * Combined OAuth Policy Templates Library
 */
export const OAUTH_POLICY_TEMPLATES_LIBRARY = {
  CLIENT_REGISTRATION: CLIENT_REGISTRATION_TEMPLATES,
  TOKEN_LIFECYCLE: TOKEN_LIFECYCLE_TEMPLATES,
  PROVIDER_MANAGEMENT: PROVIDER_MANAGEMENT_TEMPLATES,
  CONSENT_MANAGEMENT: CONSENT_MANAGEMENT_TEMPLATES
} as const;

/**
 * Helper function to get policy template by ID
 */
export function getOAuthPolicyTemplate(templateId: string): OAuthPolicyTemplate | null {
  for (const category of Object.values(OAUTH_POLICY_TEMPLATES_LIBRARY)) {
    for (const template of Object.values(category)) {
      if (template.templateId === templateId) {
        return template;
      }
    }
  }
  return null;
}

/**
 * Helper function to get templates by policy type
 */
export function getTemplatesByType(policyType: string): OAuthPolicyTemplate[] {
  const templates: OAuthPolicyTemplate[] = [];
  
  for (const category of Object.values(OAUTH_POLICY_TEMPLATES_LIBRARY)) {
    for (const template of Object.values(category)) {
      if (template.policyType === policyType) {
        templates.push(template);
      }
    }
  }
  
  return templates;
}

/**
 * Helper function to get templates by compliance framework
 */
export function getTemplatesByFramework(framework: ComplianceFramework): OAuthPolicyTemplate[] {
  const templates: OAuthPolicyTemplate[] = [];
  
  for (const category of Object.values(OAUTH_POLICY_TEMPLATES_LIBRARY)) {
    for (const template of Object.values(category)) {
      if (template.frameworks.includes(framework)) {
        templates.push(template);
      }
    }
  }
  
  return templates;
}

/**
 * Helper function to get templates by target environment
 */
export function getTemplatesByEnvironment(environment: EnvironmentType): OAuthPolicyTemplate[] {
  const templates: OAuthPolicyTemplate[] = [];
  
  for (const category of Object.values(OAUTH_POLICY_TEMPLATES_LIBRARY)) {
    for (const template of Object.values(category)) {
      if (template.targetEnvironments.includes(environment)) {
        templates.push(template);
      }
    }
  }
  
  return templates;
}