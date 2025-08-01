/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Classification Enforcement Examples
 * 
 * Demonstrates how to use the Classification Enforcer system
 * for securing data access based on classification levels
 */
import express, { Request, Response } from 'express';
import { ClassificationEnforcer }
  createClassificationEnforcer
 from '../ClassificationEnforcer';
import { createClassificationEnforcementMiddleware,
  createAccessControlMiddleware,
  createOperationValidationMiddleware,
  enforceClassification }
  type ClassificationAwareRequest
 from '../ClassificationEnforcementMiddleware';

// Create Express app
const app = express();

// Initialize enforcer with production settings
const enforcer = createClassificationEnforcer('production');

// Global classification enforcement middleware
app.use(createClassificationEnforcementMiddleware({ )
  environment: 'production',
  detailedErrors: false,
  classificationExtractor: async (req) => { }
  // Custom logic to extract classification from request
  // e.g., from database based on resource ID
  if (req.params.id) { // In real app, query database for classification
  return 'CONFIDENTIAL';
  return null },
  controlsExtractor: (req) => { ,
    const controls = [];
    // Check for MFA
    if (req.headers['x-mfa-verified'] === 'true') {
      controls.push('auth-mfa');
    // Check for encryption
    if (req.secure) {
      controls.push('encryption-in-transit');
    return controls }));

// Example 1: Public data endpoint
app.get('/api/public/news')
  enforceClassification('PUBLIC'),
  (req: Request, res: Response) => {
    res.json({)
  articles: [
        { title: 'Company Announces New Product', content: '...' }
      ]
    });
);

// Example 2: Internal data with specific controls
app.get('/api/internal/reports/:id')
  enforceClassification('INTERNAL', { )
  requiredControls: ['auth-standard', 'audit-standard'] }
}),
  (req: Request, res: Response) => { res.json({)
  report: {,
  id: req.params.id,
        title: 'Monthly Sales Report' }
        data: { /* ... */ }
    });
);

// Example 3: Confidential data with access control
app.get('/api/confidential/customer/:id')
  enforceClassification('CONFIDENTIAL'),
  createAccessControlMiddleware('read'),
  async (req: ClassificationAwareRequest, res: Response) => { // Access decision is available in request
  const decision = req.classification?.accessDecision;
  if (decision?.conditions) {
  console.log('Access granted with conditions:', decision.conditions);
  res.json({)
  customer: {,
  id: req.params.id,
  name: 'ACME Corp',
  revenue: 1000000 }
});
);

// Example 4: Restricted data with full validation
app.post('/api/restricted/financial-data')
  enforceClassification('RESTRICTED', { )
  allowedOperations: ['write'],
  requiredControls: ['auth-strong_mfa', 'encryption', 'approval-workflow'] }
}),
  createOperationValidationMiddleware(),
  async (req: ClassificationAwareRequest, res: Response) => { // Enforcement result is available
  const enforcement = req.classification?.enforcement;
  if (enforcement) {
  console.log('Risk score:', enforcement.riskScore);
  console.log('Applied controls:', enforcement.appliedControls);
  // Process the financial data
  res.json({)
  success: true,
  id: 'fin-' + Date.now(),
  message: 'Financial data securely stored' }
});
);

// Example 5: Export operation with special handling
app.post('/api/data/:id/export')
  async (req: ClassificationAwareRequest, res: Response) => { const dataId = req.params.id;
  // Get data classification (in real app, from database)
  const classification = 'CONFIDENTIAL';
  // Validate export operation
  const validation = await enforcer.validateOperation(;);
  {
  operation: 'export',
  userId: req.user?.id || 'anonymous',
  sessionId: req.sessionID || 'unknown',
  purpose: req.body.purpose || 'unspecified',
  environment: process.env.NODE_ENV || 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: req.headers['x-request-id'] as string || 'req-' + Date.now() }

      classification,
      { id: dataId }
    );
    if (!validation.valid) { return res.status(403).json({)
  error: 'Export not allowed',
  issues: validation.issues,
  requiredControls: validation.controls }
});
    // Perform export with required controls
    res.json({ )
  exportUrl: '/exports/' + dataId,
  controls: validation.controls,
  expiresIn: '15 minutes' }
});
);

// Example 6: Programmatic enforcement
async function processDataOperation()
  userId: string,
  dataId: string,
  operation: 'read' | 'write' | 'delete',
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED',
  // Make access decision
  const decision = await enforcer.makeAccessDecision(;);
    userId,
    dataId,
    classification,
    operation,
    { purpose: 'data-processing' }
      environment: 'production');
  if (!decision.granted) {
    throw new Error(`Access denied: ${decision.reason}`);}
  console.log('Access granted');
  if (decision.conditions) {
    console.log('Conditions:', decision.conditions);
  if (decision.expiresAt) {
    console.log('Access expires at:', decision.expiresAt);
  // Perform the operation
  switch (operation) {
  case 'read':
    console.log(`Reading ${classification} data ${dataId}`);}
    break;
  case 'write':
    console.log(`Writing ${classification} data ${dataId}`);}
    break;
  case 'delete':
    console.log(`Deleting ${classification} data ${dataId}`);}
    break;

// Example 7: Batch classification enforcement
async function batchProcessData()
  userId: string,
  dataItems: Array<{ id: string; classification: any; value: any }>
  const results = [];
  for (const item of dataItems) { const enforcementResult = await enforcer.enforceClassification(;);
  item.classification,
  {
  operation: 'read',
  userId,
  sessionId: 'batch-' + Date.now(),
  purpose: 'batch-processing',
  environment: 'production',
  timestamp: new Date(),
  source: 'batch',
  requestId: 'batch-req-' + item.id }

      ['auth-standard', 'audit-enhanced']
    );
    if (enforcementResult.allowed) { results.push({)
  id: item.id,
  value: item.value,
  riskScore: enforcementResult.riskScore }
});
 else {
      console.warn(`Access denied for item ${item.id}:`)}
        enforcementResult.violations);
  return results;

// Example 8: Custom enforcement with overrides
function createCustomEnforcer() { return new ClassificationEnforcer({)
  strictMode: false,
  gracePeriodDays: 30,
  policyOverrides: new Map([),
  ['INTERNAL', {
  access: {,
  authenticationLevel: 'STANDARD',
  authorizationRequired: false,
  approvalWorkflow: false,
  timeRestrictions: false,
  purposeLimitation: false,
  auditLogging: 'STANDARD',
  exportRestrictions: false }
]
    ]),
    exemptions: { ,
  users: ['admin-user', 'system-user'],
  roles: ['security-admin', 'data-steward'] }
});

// Example 9: Monitoring and auditing
app.use((req: ClassificationAwareRequest, res: Response, next) => {
  // Log classification enforcement results
  res.on('finish', () => {
    if (req.classification?.enforcement) {
      const { enforcement } = req.classification;
      console.log('Classification Enforcement Audit:', { )
  timestamp: new Date().toISOString(),
  userId: req.user?.id,
  path: req.path,
  method: req.method,
  classification: enforcement.classification,
  allowed: enforcement.allowed,
  riskScore: enforcement.riskScore,
  violations: enforcement.violations.length,
  auditId: enforcement.auditId }
});
  });
  next();
});

// Example 10: Error handling
app.use((err: Error, req: ClassificationAwareRequest, res: Response, next: any) => { if (err.message.includes('Classification policy violation')) {
  // Handle classification errors specially
  const enforcement = req.classification?.enforcement;
  res.status(403).json({)
  error: 'Access denied due to data classification policies',
  classification: req.classification?.level,
  riskScore: enforcement?.riskScore,
  // Only show details in development
  ...(process.env.NODE_ENV === 'development' && {)
  violations: enforcement?.violations,
  requiredControls: enforcement?.requiredControls }

    });
 else { next(err) });

// Export for use in other modules
export { app,
  enforcer,
  processDataOperation,
  batchProcessData }
  createCustomEnforcer
};