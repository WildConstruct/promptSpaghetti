/**
 * Deployment Approval Rules Configuration
 * Defines approval criteria and rules for different deployment environments
 */

export interface DeploymentApprovalRule {
  environment: string;
  required: boolean;
  minimumApprovals: number;
  requiredCriteria: DeploymentCriterion[];
  autoApprovalConditions?: AutoApprovalConditions;
  escalationRules?: EscalationRule[];
  reviewerAssignment: ReviewerAssignmentRule;
  timeouts: TimeoutConfiguration;
}

export interface DeploymentCriterion {
  type: 'security-review' | 'performance-impact' | 'business-approval' | 'technical-review' | 'compliance-check';
  weight: number;
  required: boolean;
  description: string;
  reviewerRoles: string[];
  validationSteps?: ValidationStep[];
}

export interface AutoApprovalConditions {
  testCoverage: {
    minimum: number;
    required: boolean;
  };
  securityScan: {
    status: 'passed' | 'warning' | 'failed';
    maxCriticalIssues: number;
    maxHighIssues: number;
  };
  performanceRegression: {
    maxRegressionPercent: number;
    checkEndpoints: string[];
  };
  breakingChanges: {
    allowed: boolean;
    requiresManualApproval: boolean;
  };
  deploymentSize: {
    maxChangedFiles: number;
    maxLinesChanged: number;
  };
  businessHours: {
    required: boolean;
    timezone: string;
    allowedHours: { start: number; end: number };
    allowedDays: number[]; // 0-6 (Sunday-Saturday)
  };
}

export interface EscalationRule {
  triggerAfterHours: number;
  escalateTo: string[];
  notificationChannels: string[];
  urgencyIncrease: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReviewerAssignmentRule {
  strategy: 'manual' | 'automatic' | 'round-robin' | 'load-balanced';
  reviewerPools: ReviewerPool[];
  fallbackReviewers: string[];
  excludeRequestor: boolean;
}

export interface ReviewerPool {
  name: string;
  members: string[];
  roles: string[];
  minimumRequired: number;
  expertise: string[];
}

export interface TimeoutConfiguration {
  initialTimeoutHours: number;
  escalationTimeoutHours: number;
  maxTotalTimeoutHours: number;
  businessHoursOnly: boolean;
}

export interface ValidationStep {
  name: string;
  description: string;
  automatable: boolean;
  command?: string;
  expectedResult?: any;
}

// Default deployment approval rules
export const DEPLOYMENT_APPROVAL_RULES: Record<string, DeploymentApprovalRule> = {
  production: {
    environment: 'production',
    required: true,
    minimumApprovals: 2,
    requiredCriteria: [
      {
        type: 'security-review',
        weight: 0.3,
        required: true,
        description: 'Security impact assessment and vulnerability review',
        reviewerRoles: ['security-engineer', 'security-lead'],
        validationSteps: [
          {
            name: 'Security Scan',
            description: 'Automated security vulnerability scan',
            automatable: true,
            command: 'npm audit --audit-level=high',
            expectedResult: { vulnerabilities: 0 }
          },
          {
            name: 'Dependency Review',
            description: 'Review of new or updated dependencies',
            automatable: false
          }
        ]
      },
      {
        type: 'performance-impact',
        weight: 0.2,
        required: true,
        description: 'Performance impact analysis and regression testing',
        reviewerRoles: ['performance-engineer', 'senior-developer'],
        validationSteps: [
          {
            name: 'Bundle Size Check',
            description: 'Verify bundle size increase is within limits',
            automatable: true,
            command: 'npm run bundle-analyzer',
            expectedResult: { sizeIncrease: '<5%' }
          },
          {
            name: 'Performance Tests',
            description: 'Run performance benchmarks',
            automatable: true,
            command: 'npm run perf:test',
            expectedResult: { regressionPercent: '<10%' }
          }
        ]
      },
      {
        type: 'business-approval',
        weight: 0.5,
        required: true,
        description: 'Business stakeholder approval for feature changes',
        reviewerRoles: ['product-manager', 'business-stakeholder'],
        validationSteps: [
          {
            name: 'Feature Flag Review',
            description: 'Review feature flags and rollout strategy',
            automatable: false
          },
          {
            name: 'User Impact Assessment',
            description: 'Assess impact on user experience',
            automatable: false
          }
        ]
      }
    ],
    autoApprovalConditions: {
      testCoverage: {
        minimum: 90,
        required: true
      },
      securityScan: {
        status: 'passed',
        maxCriticalIssues: 0,
        maxHighIssues: 0
      },
      performanceRegression: {
        maxRegressionPercent: 5,
        checkEndpoints: ['/api/health', '/api/preview', '/']
      },
      breakingChanges: {
        allowed: false,
        requiresManualApproval: true
      },
      deploymentSize: {
        maxChangedFiles: 10,
        maxLinesChanged: 500
      },
      businessHours: {
        required: false, // Production can be deployed anytime
        timezone: 'America/Los_Angeles',
        allowedHours: { start: 9, end: 17 },
        allowedDays: [1, 2, 3, 4, 5] // Monday-Friday
      }
    },
    escalationRules: [
      {
        triggerAfterHours: 4,
        escalateTo: ['engineering-manager', 'cto'],
        notificationChannels: ['slack:engineering', 'email:escalation'],
        urgencyIncrease: 'high'
      },
      {
        triggerAfterHours: 8,
        escalateTo: ['vp-engineering'],
        notificationChannels: ['slack:leadership', 'email:executive'],
        urgencyIncrease: 'critical'
      }
    ],
    reviewerAssignment: {
      strategy: 'load-balanced',
      reviewerPools: [
        {
          name: 'security-team',
          members: ['alice@company.com', 'bob@company.com'],
          roles: ['security-engineer', 'security-lead'],
          minimumRequired: 1,
          expertise: ['security', 'compliance', 'vulnerability-assessment']
        },
        {
          name: 'performance-team',
          members: ['charlie@company.com', 'diana@company.com'],
          roles: ['performance-engineer', 'senior-developer'],
          minimumRequired: 1,
          expertise: ['performance', 'optimization', 'monitoring']
        },
        {
          name: 'business-stakeholders',
          members: ['eve@company.com', 'frank@company.com'],
          roles: ['product-manager', 'business-stakeholder'],
          minimumRequired: 1,
          expertise: ['product', 'business-strategy', 'user-experience']
        }
      ],
      fallbackReviewers: ['engineering-manager@company.com', 'cto@company.com'],
      excludeRequestor: true
    },
    timeouts: {
      initialTimeoutHours: 24,
      escalationTimeoutHours: 4,
      maxTotalTimeoutHours: 48,
      businessHoursOnly: false
    }
  },

  staging: {
    environment: 'staging',
    required: true,
    minimumApprovals: 1,
    requiredCriteria: [
      {
        type: 'security-review',
        weight: 0.6,
        required: true,
        description: 'Basic security review for staging deployment',
        reviewerRoles: ['developer', 'senior-developer'],
        validationSteps: [
          {
            name: 'Security Scan',
            description: 'Automated security scan',
            automatable: true,
            command: 'npm audit --audit-level=moderate'
          }
        ]
      },
      {
        type: 'technical-review',
        weight: 0.4,
        required: true,
        description: 'Technical review of code changes',
        reviewerRoles: ['senior-developer', 'tech-lead'],
        validationSteps: [
          {
            name: 'Code Review',
            description: 'Review code quality and architecture',
            automatable: false
          }
        ]
      }
    ],
    autoApprovalConditions: {
      testCoverage: {
        minimum: 80,
        required: true
      },
      securityScan: {
        status: 'passed',
        maxCriticalIssues: 0,
        maxHighIssues: 2
      },
      performanceRegression: {
        maxRegressionPercent: 15,
        checkEndpoints: ['/api/health']
      },
      breakingChanges: {
        allowed: true,
        requiresManualApproval: false
      },
      deploymentSize: {
        maxChangedFiles: 50,
        maxLinesChanged: 2000
      },
      businessHours: {
        required: false,
        timezone: 'America/Los_Angeles',
        allowedHours: { start: 0, end: 23 },
        allowedDays: [0, 1, 2, 3, 4, 5, 6] // Any day
      }
    },
    escalationRules: [
      {
        triggerAfterHours: 8,
        escalateTo: ['tech-lead', 'engineering-manager'],
        notificationChannels: ['slack:engineering'],
        urgencyIncrease: 'medium'
      }
    ],
    reviewerAssignment: {
      strategy: 'round-robin',
      reviewerPools: [
        {
          name: 'development-team',
          members: ['dev1@company.com', 'dev2@company.com', 'dev3@company.com'],
          roles: ['developer', 'senior-developer'],
          minimumRequired: 1,
          expertise: ['development', 'code-review']
        }
      ],
      fallbackReviewers: ['tech-lead@company.com'],
      excludeRequestor: true
    },
    timeouts: {
      initialTimeoutHours: 8,
      escalationTimeoutHours: 4,
      maxTotalTimeoutHours: 24,
      businessHoursOnly: false
    }
  },

  preview: {
    environment: 'preview',
    required: false,
    minimumApprovals: 0,
    requiredCriteria: [],
    autoApprovalConditions: {
      testCoverage: {
        minimum: 70,
        required: false
      },
      securityScan: {
        status: 'warning', // Allow warnings for preview
        maxCriticalIssues: 1,
        maxHighIssues: 5
      },
      performanceRegression: {
        maxRegressionPercent: 25,
        checkEndpoints: []
      },
      breakingChanges: {
        allowed: true,
        requiresManualApproval: false
      },
      deploymentSize: {
        maxChangedFiles: 1000,
        maxLinesChanged: 10000
      },
      businessHours: {
        required: false,
        timezone: 'America/Los_Angeles',
        allowedHours: { start: 0, end: 23 },
        allowedDays: [0, 1, 2, 3, 4, 5, 6]
      }
    },
    reviewerAssignment: {
      strategy: 'automatic',
      reviewerPools: [],
      fallbackReviewers: [],
      excludeRequestor: false
    },
    timeouts: {
      initialTimeoutHours: 1,
      escalationTimeoutHours: 1,
      maxTotalTimeoutHours: 4,
      businessHoursOnly: false
    }
  },

  development: {
    environment: 'development',
    required: false,
    minimumApprovals: 0,
    requiredCriteria: [],
    autoApprovalConditions: {
      testCoverage: {
        minimum: 50,
        required: false
      },
      securityScan: {
        status: 'failed', // Allow even failed scans in dev
        maxCriticalIssues: 10,
        maxHighIssues: 20
      },
      performanceRegression: {
        maxRegressionPercent: 50,
        checkEndpoints: []
      },
      breakingChanges: {
        allowed: true,
        requiresManualApproval: false
      },
      deploymentSize: {
        maxChangedFiles: 9999,
        maxLinesChanged: 999999
      },
      businessHours: {
        required: false,
        timezone: 'America/Los_Angeles',
        allowedHours: { start: 0, end: 23 },
        allowedDays: [0, 1, 2, 3, 4, 5, 6]
      }
    },
    reviewerAssignment: {
      strategy: 'automatic',
      reviewerPools: [],
      fallbackReviewers: [],
      excludeRequestor: false
    },
    timeouts: {
      initialTimeoutHours: 0.5,
      escalationTimeoutHours: 0.5,
      maxTotalTimeoutHours: 2,
      businessHoursOnly: false
    }
  }
};

/**
 * Get deployment approval rules for a specific environment
 */
export function getDeploymentApprovalRules(environment: string): DeploymentApprovalRule | null {
  return DEPLOYMENT_APPROVAL_RULES[environment] || null;
}

/**
 * Validate if a deployment meets auto-approval criteria
 */
export function validateAutoApprovalCriteria(
  environment: string,
  deploymentMetrics: any
): { eligible: boolean; failedCriteria: string[]; passedCriteria: string[] } {
  const rules = getDeploymentApprovalRules(environment);
  if (!rules?.autoApprovalConditions) {
    return { eligible: false, failedCriteria: ['No auto-approval rules defined'], passedCriteria: [] };
  }

  const failedCriteria: string[] = [];
  const passedCriteria: string[] = [];
  const conditions = rules.autoApprovalConditions;

  // Check test coverage
  if (conditions.testCoverage.required) {
    const coverage = deploymentMetrics.testCoverage || 0;
    if (coverage >= conditions.testCoverage.minimum) {
      passedCriteria.push(`Test coverage: ${coverage}% >= ${conditions.testCoverage.minimum}%`);
    } else {
      failedCriteria.push(`Test coverage: ${coverage}% < ${conditions.testCoverage.minimum}%`);
    }
  }

  // Check security scan
  const securityStatus = deploymentMetrics.securityScan?.status || 'unknown';
  const criticalIssues = deploymentMetrics.securityScan?.criticalIssues || 0;
  const highIssues = deploymentMetrics.securityScan?.highIssues || 0;

  if (securityStatus === conditions.securityScan.status &&
      criticalIssues <= conditions.securityScan.maxCriticalIssues &&
      highIssues <= conditions.securityScan.maxHighIssues) {
    passedCriteria.push(`Security scan: ${securityStatus} with ${criticalIssues}/${highIssues} critical/high issues`);
  } else {
    failedCriteria.push(`Security scan: ${securityStatus} with ${criticalIssues}/${highIssues} critical/high issues`);
  }

  // Check performance regression
  const regressionPercent = deploymentMetrics.performanceRegression?.percent || 0;
  if (regressionPercent <= conditions.performanceRegression.maxRegressionPercent) {
    passedCriteria.push(`Performance regression: ${regressionPercent}% <= ${conditions.performanceRegression.maxRegressionPercent}%`);
  } else {
    failedCriteria.push(`Performance regression: ${regressionPercent}% > ${conditions.performanceRegression.maxRegressionPercent}%`);
  }

  // Check breaking changes
  const hasBreakingChanges = deploymentMetrics.breakingChanges || false;
  if (!hasBreakingChanges || conditions.breakingChanges.allowed) {
    passedCriteria.push(`Breaking changes: ${hasBreakingChanges ? 'allowed' : 'none'}`);
  } else {
    failedCriteria.push('Breaking changes detected and not allowed');
  }

  // Check deployment size
  const changedFiles = deploymentMetrics.changedFiles || 0;
  const linesChanged = deploymentMetrics.linesChanged || 0;
  if (changedFiles <= conditions.deploymentSize.maxChangedFiles &&
      linesChanged <= conditions.deploymentSize.maxLinesChanged) {
    passedCriteria.push(`Deployment size: ${changedFiles} files, ${linesChanged} lines`);
  } else {
    failedCriteria.push(`Deployment size too large: ${changedFiles} files, ${linesChanged} lines`);
  }

  // Check business hours (if required)
  if (conditions.businessHours.required) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    const inAllowedHours = currentHour >= conditions.businessHours.allowedHours.start &&
                          currentHour <= conditions.businessHours.allowedHours.end;
    const inAllowedDays = conditions.businessHours.allowedDays.includes(currentDay);
    
    if (inAllowedHours && inAllowedDays) {
      passedCriteria.push('Business hours: deployment during allowed time');
    } else {
      failedCriteria.push('Business hours: deployment outside allowed time window');
    }
  }

  return {
    eligible: failedCriteria.length === 0,
    failedCriteria,
    passedCriteria
  };
}

/**
 * Get reviewer assignments based on rules
 */
export function getReviewerAssignments(
  environment: string,
  requestorEmail?: string
): { reviewers: string[]; pools: string[]; strategy: string } {
  const rules = getDeploymentApprovalRules(environment);
  if (!rules) {
    return { reviewers: [], pools: [], strategy: 'none' };
  }

  const assignment = rules.reviewerAssignment;
  let reviewers: string[] = [];
  const pools: string[] = [];

  switch (assignment.strategy) {
  case 'automatic':
    // Use first available reviewer from each pool
    assignment.reviewerPools.forEach(pool => {
      const availableMembers = assignment.excludeRequestor 
        ? pool.members.filter(member => member !== requestorEmail)
        : pool.members;
        
      if (availableMembers.length > 0) {
        reviewers.push(availableMembers[0]);
        pools.push(pool.name);
      }
    });
    break;

  case 'round-robin':
    // TODO: Implement round-robin logic with persistent state
    assignment.reviewerPools.forEach(pool => {
      const availableMembers = assignment.excludeRequestor 
        ? pool.members.filter(member => member !== requestorEmail)
        : pool.members;
        
      if (availableMembers.length > 0) {
        // For now, just use first member (would implement rotation logic)
        reviewers.push(availableMembers[0]);
        pools.push(pool.name);
      }
    });
    break;

  case 'load-balanced':
    // TODO: Implement load-balanced assignment based on current workload
    assignment.reviewerPools.forEach(pool => {
      const availableMembers = assignment.excludeRequestor 
        ? pool.members.filter(member => member !== requestorEmail)
        : pool.members;
        
      if (availableMembers.length > 0) {
        // For now, just use first member (would implement load balancing)
        reviewers.push(availableMembers[0]);
        pools.push(pool.name);
      }
    });
    break;

  case 'manual':
  default:
    // Manual assignment - use fallback reviewers
    reviewers = assignment.fallbackReviewers;
    pools.push('fallback');
    break;
  }

  // If no reviewers found, use fallbacks
  if (reviewers.length === 0) {
    reviewers = assignment.fallbackReviewers;
    pools.push('fallback');
  }

  return {
    reviewers,
    pools,
    strategy: assignment.strategy
  };
}

export { DEPLOYMENT_APPROVAL_RULES as default };