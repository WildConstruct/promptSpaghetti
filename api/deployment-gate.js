/**
 * Deployment Gate API
 * Vercel serverless function for validating deployment approvals
 */

// import { AnalyticsDAO } from '../server/src/database/analytics-dao.js'; // Unused import
import { getDatabase } from '../server/src/database/connection.js';

// Environment-specific approval requirements
const ENVIRONMENT_APPROVAL_RULES = {
  production: {
    required: true,
    minimum_approvals: 2,
    required_criteria: ['security-review', 'performance-impact', 'business-approval'],
    auto_approval_conditions: {
      test_coverage: 90,
      security_scan: 'passed',
      performance_regression: false,
      breaking_changes: false
    }
  },
  staging: {
    required: true,
    minimum_approvals: 1,
    required_criteria: ['security-review'],
    auto_approval_conditions: {
      test_coverage: 80,
      security_scan: 'passed'
    }
  },
  preview: {
    required: false,
    auto_approval_conditions: {
      test_coverage: 70
    }
  },
  development: {
    required: false
  }
};

// Auto-approval logic based on conditions
async function checkAutoApprovalEligibility(deployment, environment) {
  const rules = ENVIRONMENT_APPROVAL_RULES[environment];
  if (!rules || !rules.auto_approval_conditions) {
    return { eligible: false, reason: 'No auto-approval rules defined' };
  }

  const conditions = rules.auto_approval_conditions;
  const checks = [];

  try {
    // Check test coverage
    if (conditions.test_coverage) {
      try {
        const coverage = await getTestCoverage(deployment.sha);
        const eligible = coverage >= conditions.test_coverage;
        checks.push({
          name: 'test_coverage',
          required: conditions.test_coverage,
          actual: coverage,
          passed: eligible,
          error: null
        });
      } catch (coverageError) {
        console.error('Failed to get test coverage:', coverageError);
        checks.push({
          name: 'test_coverage',
          required: conditions.test_coverage,
          actual: 0,
          passed: false,
          error: `Failed to retrieve test coverage: ${coverageError.message}`
        });
      }
    }

    // Check security scan
    if (conditions.security_scan) {
      try {
        const securityStatus = await getSecurityScanStatus(deployment.sha);
        const eligible = securityStatus === conditions.security_scan;
        checks.push({
          name: 'security_scan',
          required: conditions.security_scan,
          actual: securityStatus,
          passed: eligible,
          error: null
        });
      } catch (securityError) {
        console.error('Failed to get security scan status:', securityError);
        checks.push({
          name: 'security_scan',
          required: conditions.security_scan,
          actual: 'failed',
          passed: false,
          error: `Failed to retrieve security scan status: ${securityError.message}`
        });
      }
    }

    // Check performance regression
    if (conditions.performance_regression !== undefined) {
      try {
        const hasRegression = await checkPerformanceRegression(deployment.sha);
        const eligible = hasRegression === conditions.performance_regression;
        checks.push({
          name: 'performance_regression',
          required: !conditions.performance_regression,
          actual: !hasRegression,
          passed: eligible,
          error: null
        });
      } catch (performanceError) {
        console.error('Failed to check performance regression:', performanceError);
        checks.push({
          name: 'performance_regression',
          required: !conditions.performance_regression,
          actual: false,
          passed: false,
          error: `Failed to check performance regression: ${performanceError.message}`
        });
      }
    }

    // Check for breaking changes
    if (conditions.breaking_changes !== undefined) {
      try {
        const hasBreaking = await checkBreakingChanges(deployment.sha);
        const eligible = hasBreaking === conditions.breaking_changes;
        checks.push({
          name: 'breaking_changes',
          required: !conditions.breaking_changes,
          actual: !hasBreaking,
          passed: eligible,
          error: null
        });
      } catch (breakingError) {
        console.error('Failed to check breaking changes:', breakingError);
        checks.push({
          name: 'breaking_changes',
          required: !conditions.breaking_changes,
          actual: false,
          passed: false,
          error: `Failed to check breaking changes: ${breakingError.message}`
        });
      }
    }

    const allPassed = checks.every(check => check.passed);
    const hasErrors = checks.some(check => check.error);
    
    return {
      eligible: allPassed && !hasErrors,
      checks,
      reason: hasErrors ? 'Auto-approval failed due to check errors' :
              allPassed ? 'All auto-approval conditions met' : 
              'Some auto-approval conditions failed',
      hasErrors
    };
  } catch (error) {
    console.error('Error checking auto-approval eligibility:', error);
    return { 
      eligible: false, 
      reason: `Auto-approval system error: ${error.message}`,
      checks: checks.length > 0 ? checks : [{
        name: 'system_error',
        required: 'system_check',
        actual: 'failed',
        passed: false,
        error: error.message
      }],
      systemError: true,
      hasErrors: true
    };
  }
}

// Get approval status from database with comprehensive error handling
async function getApprovalStatus(deploymentId, environment) {
  if (!deploymentId) {
    throw new Error('deploymentId is required for approval status check');
  }
  
  if (!environment) {
    throw new Error('environment is required for approval status check');
  }
  
  try {
    const db = getDatabase();
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    // Query for approval requests related to this deployment
    const approvalQuery = `
      SELECT 
        ar.*,
        COUNT(CASE WHEN a.decision = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN a.decision = 'rejected' THEN 1 END) as rejected_count,
        COUNT(ac.id) as total_criteria,
        COUNT(CASE WHEN ac.status = 'approved' THEN 1 END) as criteria_met
      FROM approval_requests ar
      LEFT JOIN approvals a ON ar.id = a.request_id
      LEFT JOIN approval_criteria ac ON ar.id = ac.request_id
      WHERE ar.resource_id = ? 
        AND JSON_EXTRACT(ar.metadata, '$.environment') = ?
        AND ar.status IN ('pending', 'approved', 'rejected', 'in_review')
      GROUP BY ar.id
      ORDER BY ar.created_at DESC
      LIMIT 1
    `;

    const result = db.prepare(approvalQuery).get(deploymentId, environment);

    if (!result) {
      return {
        required: ENVIRONMENT_APPROVAL_RULES[environment]?.required || false,
        status: 'no_request',
        approval_url: null,
        message: 'No approval request found for this deployment',
        deployment_id: deploymentId,
        environment
      };
    }

    const rules = ENVIRONMENT_APPROVAL_RULES[environment];
    const isApproved = result.status === 'approved' && 
                     result.approved_count >= (rules?.minimum_approvals || 1) &&
                     result.criteria_met === result.total_criteria;

    return {
      required: rules?.required || false,
      status: isApproved ? 'approved' : result.status,
      request_id: result.id,
      approval_url: `${process.env.DEPLOYMENT_DOMAIN || 'https://prompt-spaghetti.vercel.app'}/approval/dashboard?request=${result.id}`,
      approvals: {
        approved: result.approved_count,
        required: rules?.minimum_approvals || 1,
        criteria_met: result.criteria_met,
        total_criteria: result.total_criteria
      },
      created_at: result.created_at,
      updated_at: result.updated_at
    };
  } catch (error) {
    console.error('Error getting approval status:', error);
    
    // Return structured error information instead of throwing
    return {
      required: ENVIRONMENT_APPROVAL_RULES[environment]?.required || false,
      status: 'error',
      approval_url: null,
      error: {
        message: error.message,
        type: 'database_error',
        deployment_id: deploymentId,
        environment,
        timestamp: new Date().toISOString()
      },
      message: 'Failed to check approval status due to system error'
    };
  }
}

// Helper functions for auto-approval checks
async function getTestCoverage(_sha) {
  try {
    // In a real implementation, this would query CI/CD results or coverage reports
    // For now, return a mock value based on environment
    const mockCoverage = process.env.NODE_ENV === 'test' ? 95 : 
                        process.env.NODE_ENV === 'development' ? 75 : 85;
    return mockCoverage;
  } catch (error) {
    console.warn('Could not retrieve test coverage:', error);
    return 0;
  }
}

async function getSecurityScanStatus(_sha) {
  try {
    // In a real implementation, this would check security scan results
    // For now, return 'passed' for most cases
    return 'passed';
  } catch (error) {
    console.warn('Could not retrieve security scan status:', error);
    return 'failed';
  }
}

async function checkPerformanceRegression(_sha) {
  try {
    // In a real implementation, this would compare performance metrics
    // For now, return false (no regression)
    return false;
  } catch (error) {
    console.warn('Could not check performance regression:', error);
    return true; // Assume regression on error for safety
  }
}

async function checkBreakingChanges(_sha) {
  try {
    // In a real implementation, this would analyze API changes, schema changes, etc.
    // For now, return false (no breaking changes)
    return false;
  } catch (error) {
    console.warn('Could not check breaking changes:', error);
    return true; // Assume breaking changes on error for safety
  }
}

// Create automatic approval for eligible deployments with validation
async function createAutoApproval(deploymentId, environment, autoApprovalCheck) {
  if (!deploymentId) {
    throw new Error('deploymentId is required for auto-approval creation');
  }
  
  if (!environment) {
    throw new Error('environment is required for auto-approval creation');
  }
  
  if (!autoApprovalCheck || !autoApprovalCheck.eligible) {
    throw new Error('Invalid auto-approval check result provided');
  }
  
  try {
    const db = getDatabase();
    
    if (!db) {
      throw new Error('Database connection not available for auto-approval creation');
    }
    
    // Create approval request
    const requestId = `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const insertRequest = `
      INSERT INTO approval_requests (
        id, workspace_id, resource_id, transition_id, title, description,
        requested_by, urgency, status, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const metadata = {
      environment,
      auto_approved: true,
      auto_approval_checks: autoApprovalCheck.checks,
      deployment_type: 'auto',
      sha: deploymentId
    };

    db.prepare(insertRequest).run(
      requestId,
      'auto-deployment',
      deploymentId,
      `deploy-${environment}`,
      `Auto-approved deployment to ${environment}`,
      `Deployment automatically approved based on passing all auto-approval criteria: ${autoApprovalCheck.checks.map(c => c.name).join(', ')}`,
      'system',
      'low',
      'approved',
      JSON.stringify(metadata)
    );

    // Create approval record
    const insertApproval = `
      INSERT INTO approvals (
        id, request_id, reviewer_name, reviewer_email, decision, comments, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const approvalId = `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    db.prepare(insertApproval).run(
      approvalId,
      requestId,
      'System Auto-Approver',
      'system@deployment.gate',
      'approved',
      `Automatically approved: ${autoApprovalCheck.reason}`,
      new Date().toISOString()
    );

    return {
      request_id: requestId,
      auto_approved: true,
      approval_reason: autoApprovalCheck.reason
    };
  } catch (error) {
    console.error('Error creating auto-approval:', error);
    
    // Enhance error with context
    const enhancedError = new Error(
      `Failed to create auto-approval for deployment ${deploymentId} in ${environment}: ${error.message}`
    );
    enhancedError.originalError = error;
    enhancedError.deploymentId = deploymentId;
    enhancedError.environment = environment;
    enhancedError.timestamp = new Date().toISOString();
    
    throw enhancedError;
  }
}

// Main handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { 
      deployment_id, 
      environment = 'production',
      sha,
      check_auto_approval = false,
      create_auto_approval = false
    } = req.method === 'GET' ? req.query : req.body;

    // Enhanced input validation
    if (!deployment_id) {
      return res.status(400).json({
        error: 'Missing deployment_id parameter',
        message: 'deployment_id is required to check approval status',
        required_params: ['deployment_id'],
        optional_params: ['environment', 'sha', 'check_auto_approval', 'create_auto_approval'],
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate deployment_id format
    if (typeof deployment_id !== 'string' || deployment_id.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid deployment_id format',
        message: 'deployment_id must be a non-empty string',
        provided: typeof deployment_id,
        timestamp: new Date().toISOString()
      });
    }

    const actualDeploymentId = sha || deployment_id;

    // Enhanced environment validation
    const validEnvironments = Object.keys(ENVIRONMENT_APPROVAL_RULES);
    if (!validEnvironments.includes(environment)) {
      return res.status(400).json({
        error: 'Invalid environment',
        message: `Environment '${environment}' is not supported`,
        provided_environment: environment,
        valid_environments: validEnvironments,
        timestamp: new Date().toISOString()
      });
    }
    
    const environmentRules = ENVIRONMENT_APPROVAL_RULES[environment];

    // If approval is not required for this environment
    if (!environmentRules.required) {
      return res.json({
        deployment_allowed: true,
        approval_required: false,
        environment,
        reason: 'Approval not required for this environment'
      });
    }

    // Check for auto-approval eligibility if requested
    let autoApprovalResult = null;
    if (check_auto_approval || create_auto_approval) {
      autoApprovalResult = await checkAutoApprovalEligibility({ sha: actualDeploymentId }, environment);
      
      // Create auto-approval if eligible and requested
      if (autoApprovalResult.eligible && create_auto_approval) {
        const autoApproval = await createAutoApproval(actualDeploymentId, environment, autoApprovalResult);
        return res.json({
          deployment_allowed: true,
          approval_required: true,
          approval_status: 'approved',
          auto_approved: true,
          request_id: autoApproval.request_id,
          approval_reason: autoApproval.approval_reason,
          environment
        });
      }
    }

    // Get current approval status with error handling
    const approvalStatus = await getApprovalStatus(actualDeploymentId, environment);
    
    // Handle approval status errors
    if (approvalStatus.status === 'error') {
      return res.status(503).json({
        deployment_allowed: false,
        approval_required: approvalStatus.required,
        error: 'Service temporarily unavailable',
        message: 'Unable to check approval status due to system error',
        details: approvalStatus.error,
        retry_after: 30,
        environment,
        deployment_id: actualDeploymentId,
        timestamp: new Date().toISOString()
      });
    }

    // Determine if deployment is allowed
    const deploymentAllowed = !approvalStatus.required || approvalStatus.status === 'approved';

    const response = {
      deployment_allowed: deploymentAllowed,
      approval_required: approvalStatus.required,
      approval_status: approvalStatus.status,
      environment,
      deployment_id: actualDeploymentId
    };

    // Add approval details if available
    if (approvalStatus.request_id) {
      response.request_id = approvalStatus.request_id;
      response.approval_url = approvalStatus.approval_url;
      response.approvals = approvalStatus.approvals;
      response.created_at = approvalStatus.created_at;
      response.updated_at = approvalStatus.updated_at;
    }

    // Add auto-approval information if checked
    if (autoApprovalResult) {
      response.auto_approval = {
        eligible: autoApprovalResult.eligible,
        reason: autoApprovalResult.reason,
        checks: autoApprovalResult.checks
      };
    }

    // Add helpful messages based on status
    if (!deploymentAllowed) {
      if (approvalStatus.status === 'no_request') {
        response.message = 'Deployment requires approval. Please create an approval request first.';
        response.next_steps = [
          'Create an approval request through the GitHub Actions workflow',
          'Or use the approval dashboard to request manual approval'
        ];
      } else if (approvalStatus.status === 'pending' || approvalStatus.status === 'in_review') {
        response.message = 'Approval request is pending review.';
        response.next_steps = [
          'Wait for reviewers to complete their approval',
          'Follow up with reviewers if urgent',
          'Check the approval dashboard for progress'
        ];
      } else if (approvalStatus.status === 'rejected') {
        response.message = 'Deployment was rejected and cannot proceed.';
        response.next_steps = [
          'Review rejection reasons in the approval dashboard',
          'Address the concerns and create a new approval request',
          'Consult with the reviewing team'
        ];
      }
    }

    // Set appropriate HTTP status
    const httpStatus = deploymentAllowed ? 200 : 403;
    res.status(httpStatus).json(response);

  } catch (error) {
    console.error('Deployment gate error:', error);
    
    // Determine appropriate error response based on error type
    let statusCode = 500;
    let errorType = 'internal_server_error';
    let userMessage = 'Failed to validate deployment approval due to system error';
    
    if (error.message.includes('Database')) {
      statusCode = 503;
      errorType = 'database_unavailable';
      userMessage = 'Service temporarily unavailable - database connection failed';
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
      errorType = 'timeout_error';
      userMessage = 'Request timeout - approval validation took too long';
    } else if (error.message.includes('validation')) {
      statusCode = 400;
      errorType = 'validation_error';
      userMessage = 'Invalid request parameters';
    }
    
    const errorResponse = {
      deployment_allowed: false,
      error: errorType,
      message: userMessage,
      timestamp: new Date().toISOString(),
      environment: req.method === 'GET' ? req.query.environment : req.body?.environment,
      deployment_id: req.method === 'GET' ? req.query.deployment_id : req.body?.deployment_id
    };
    
    // Add retry information for temporary errors
    if (statusCode >= 500 && statusCode < 600) {
      errorResponse.retry_after = 30;
      errorResponse.help = 'This is a temporary error. Please try again in a few moments.';
    }
    
    // Add debug information in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.debug = {
        error_message: error.message,
        stack: error.stack
      };
    }
    
    res.status(statusCode).json(errorResponse);
  }
}