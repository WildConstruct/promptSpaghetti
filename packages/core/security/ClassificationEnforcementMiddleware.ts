/**
 * Classification Enforcement Middleware
 * 
 * Express middleware that integrates with the Classification Enforcer
 * Epic 19 Task T-1752989143998-694: Build classification enforcement
 * 
 * This middleware provides:
 * - Automatic classification detection from requests
 * - Real-time enforcement of classification policies
 * - Integration with existing authentication systems
 * - Audit logging and compliance reporting
 */
import { Request, Response, NextFunction } from 'express';
import {
  ClassificationEnforcer,
  createClassificationEnforcer,
  type EnforcementResult,
  type AccessDecision
} from './ClassificationEnforcer';
import {
  DataClassificationLevel,
  type OperationContext,
  type ClassificationAuditEvent
} from '../types/DataClassification';
import { DataClassificationHelpers } from './DataClassificationHelpers';
/**
 * Extended request with classification information
 */

export interface ClassificationAwareRequest extends Request {
  classification?: {,
  level: DataClassificationLevel;
  dataId?: string;
  enforcement?: EnforcementResult;
  accessDecision?: AccessDecision;
};
  user?: {
  id: string;
  roles?: string;
  authLevel?: string;
};
/**
 * Middleware configuration
 */

export interface ClassificationEnforcementMiddlewareConfig {
  /** Environment preset for the enforcer */
  environment: 'development' | 'staging' | 'production';
  /** Function to extract classification from request */
  classificationExtractor?: (req: Request) => Promise<DataClassificationLevel | null>;
  /** Function to extract current security controls */
  controlsExtractor?: (req: Request) => string;
  /** Routes to exclude from enforcement */
  excludedRoutes?: string;
  /** Custom error handler */
  errorHandler?: (error: Error, req: Request, res: Response) => void;
  /** Enable detailed error responses (only in development) */
  detailedErrors?: boolean;
  /** Audit event handler */
  auditHandler?: (event: ClassificationAuditEvent) => Promise<void>;
  /**
  * Default configuration
  */
  const DEFAULT_CONFIG: ClassificationEnforcementMiddlewareConfig = {,
  environment: 'production',
  excludedRoutes: ['/health', '/metrics', '/favicon.ico'],
  detailedErrors: false,
};
/**
 * Operation mapping from HTTP methods
 */
const HTTP_METHOD_TO_OPERATION: Record<string, OperationContext['operation']> = {
  GET: 'read',
  POST: 'write',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};
/**
 * Create classification enforcement middleware
 */
}
export function createClassificationEnforcementMiddleware(config: Partial<ClassificationEnforcementMiddlewareConfig> = {})
): (req: ClassificationAwareRequest, res: Response, next: NextFunction) => Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const enforcer = createClassificationEnforcer(finalConfig.environment);
  return async (req: ClassificationAwareRequest, res: Response, next: NextFunction) => {
    try {
      // Skip excluded routes
      if (finalConfig.excludedRoutes?.some(route => req.path.startsWith(route))) {
        return next();
      // Extract classification level
      const classificationLevel = await extractClassification(req, finalConfig);
      if (!classificationLevel) {
        // No classification detected, proceed without enforcement
        return next();
      // Store classification in request
      req.classification = { level: classificationLevel };
      // Build operation context
      const operationContext = buildOperationContext(req);
      // Extract current security controls
      const currentControls = extractCurrentControls(req, finalConfig);
      // Enforce classification policies
      const enforcementResult = await enforcer.enforceClassification(;);
        classificationLevel,
        operationContext,
        currentControls
      );
      // Store enforcement result
      req.classification.enforcement = enforcementResult;
      // Handle enforcement decision
      if (!enforcementResult.allowed) {
        return handleEnforcementDenial(req, res, enforcementResult, finalConfig);
      // Add required controls to response headers
      res.setHeader('X-Required-Controls', enforcementResult.requiredControls.join(','));
      res.setHeader('X-Classification-Level', classificationLevel);
      res.setHeader('X-Risk-Score', enforcementResult.riskScore.toString());
      // Set up response monitoring
      setupResponseMonitoring(req, res, enforcementResult);
      next();
    } catch (error) {
      handleMiddlewareError(error as Error, req, res, finalConfig);
  };
/**
 * Create access control middleware for specific operations
 */
export function createAccessControlMiddleware(operation: OperationContext['operation']): (req: ClassificationAwareRequest, res: Response, next: NextFunction) => Promise<void> {
  const enforcer = new ClassificationEnforcer();
  return async (req: ClassificationAwareRequest, res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      // Get classification from previous middleware or extract
      const classification = req.classification?.level || ;
        await extractClassificationFromPath(req);
      if (!classification) {
        return res.status(400).json({ error: 'Classification level required' });
      // Get data ID from request
      const dataId = req.params.id || req.body?.id || 'unknown';
      // Make access decision
      const decision = await enforcer.makeAccessDecision(;);
        req.user.id,
        dataId,
        classification,
        operation,
        {
  sessionId: req.sessionID || 'unknown',
  purpose: req.headers['x-purpose'] as string || 'unspecified',
  environment: process.env.NODE_ENV || 'production',
  source: req.headers['x-source'] as string || 'api',
  requestId: req.headers['x-request-id'] as string || generateRequestId());
  // Store decision in request
  if (req.classification) {
  req.classification.accessDecision = decision;
} else {
  req.classification = {
  level: classification,
  accessDecision: decision,
};
      // Handle access decision
      if (!decision.granted) {
  return res.status(403).json({)
  error: 'Access denied',
  reason: decision.reason,
  requiredAuthentication: decision.requiredAuthentication,
  requiredAuthorization: decision.requiredAuthorization,
});
      // Add access conditions to response
      if (decision.conditions && decision.conditions.length > 0) {
        res.setHeader('X-Access-Conditions', decision.conditions.join('; '));
      if (decision.expiresAt) {
        res.setHeader('X-Access-Expires', decision.expiresAt.toISOString());
      next();
    } catch (error) {
      res.status(500).json({ error: 'Access control error' });
  };
/**
 * Create operation validation middleware
 */
export function createOperationValidationMiddleware(): 
  (req: ClassificationAwareRequest, res: Response, next: NextFunction) => Promise<void> {
  const enforcer = new ClassificationEnforcer();
  return async (req: ClassificationAwareRequest, res: Response, next: NextFunction) => {
    try {
      // Get classification and operation
      const classification = req.classification?.level;
      if (!classification) {
        return next(); // No classification to validate against
      const operationContext = buildOperationContext(req);
      const dataElement = req.body || { id: req.params.id };
      // Validate operation
      const validation = await enforcer.validateOperation(;);
        operationContext,
        classification,
        dataElement
      );
      if (!validation.valid) {
  return res.status(400).json({)
  error: 'Operation validation failed',
  issues: validation.issues,
  requiredControls: validation.controls,
});
      // Add required controls header
      if (validation.controls.length > 0) {
        res.setHeader('X-Required-Controls', validation.controls.join(','));
      next();
    } catch (error) {
      res.status(500).json({ error: 'Operation validation error' });
  };
/**
 * Extract classification from request
 */
async function extractClassification(()
    req: ClassificationAwareRequest,
    config: ClassificationEnforcementMiddlewareConfig,
  ): Promise<DataClassificationLevel | null> {
  // Use custom extractor if provided
  if (config.classificationExtractor) {
    return await config.classificationExtractor(req);
  // Check headers
  const headerClassification = req.headers['x-data-classification'] as string;
  if (headerClassification && isValidClassification(headerClassification)) {
    return headerClassification as DataClassificationLevel;
  // Check route parameters
  if (req.params.classification && isValidClassification(req.params.classification)) {
    return req.params.classification as DataClassificationLevel;
  // Auto-detect from request data
  if (req.body) {
    const detectedLevel = await detectClassificationFromData(req.body);
    if (detectedLevel) {
      return detectedLevel;
  return null;
/**
 * Extract classification from path pattern
 */
async function extractClassificationFromPath(req: Request): Promise<DataClassificationLevel | null> {
  // Common patterns
  const patterns: Array<{ pattern: RegExp; level: DataClassificationLevel }> = [
    { pattern: /\/api\/v\d+\/public\//, level: 'PUBLIC' },
    { pattern: /\/api\/v\d+\/internal\//, level: 'INTERNAL' },
    { pattern: /\/api\/v\d+\/confidential\//, level: 'CONFIDENTIAL' },
    { pattern: /\/api\/v\d+\/restricted\//, level: 'RESTRICTED' },
    { pattern: /\/users\/\w+\/profile/, level: 'RESTRICTED' },
    { pattern: /\/financial\//, level: 'CONFIDENTIAL' },
    { pattern: /\/auth\//, level: 'RESTRICTED' }
  ];
  for (const { pattern, level } of patterns) {
  if (pattern.test(req.path)) {
  return level;
  return null;
  /**
  * Build operation context from request
  */
  function buildOperationContext(req: ClassificationAwareRequest): OperationContext {,
  const operation = HTTP_METHOD_TO_OPERATION[req.method] || 'read';
  // Handle special cases
  let finalOperation = operation;
  if (req.path.includes('/export')) {
  finalOperation = 'export';
} else if (req.path.includes('/share')) {
  finalOperation = 'share';
  return {
  operation: finalOperation,
  userId: req.user?.id || 'anonymous',
  sessionId: req.sessionID || 'unknown',
  purpose: (req.headers['x-purpose'] as string) || 'unspecified',
  environment: process.env.NODE_ENV || 'production',
  timestamp: new Date(),
  source: (req.headers['x-source'] as string) || 'api',
  requestId: (req.headers['x-request-id'] as string) || generateRequestId(),
};
/**
 * Extract current security controls
 */
function extractCurrentControls(()
    req: ClassificationAwareRequest,
    config: ClassificationEnforcementMiddlewareConfig,
  ): string {
  // Use custom extractor if provided
  if (config.controlsExtractor) {
    return config.controlsExtractor(req);
  const controls: string = [];
  // Authentication level
  if (req.user) {
    const authLevel = req.user.authLevel || 'standard';
    controls.push(`auth-${authLevel.toLowerCase()}`);}
    if (req.headers['x-mfa-verified'] === 'true') {
  controls.push('auth-mfa');
  // Authorization
  if (req.user?.roles && req.user.roles.length > 0) {
  controls.push('authorization');
  // Encryption
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
  controls.push('encryption-in-transit');
  // Audit logging (assume basic by default)
  controls.push('audit-standard');
  // Add any controls from headers
  const headerControls = req.headers['x-security-controls'] as string;
  if (headerControls) {
  controls.push(...headerControls.split(',').map(c => c.trim()));
  return [...new Set(controls)]; // Remove duplicates
  /**
  * Handle enforcement denial
  */
  function handleEnforcementDenial(req: ClassificationAwareRequest,)
  res: Response,
  result: EnforcementResult,
  config: ClassificationEnforcementMiddlewareConfig): void {,
  const statusCode = result.riskScore > 80 ? 403 : 401;
  const response: any = {,
  error: 'Classification policy violation',
  classification: result.classification,
  riskScore: result.riskScore,
};
  if (config.detailedErrors || config.environment === 'development') {
  response.violations = result.violations;
  response.requiredControls = result.requiredControls;
  response.recommendations = result.recommendations;
  res.status(statusCode).json(response);
  /**
  * Setup response monitoring
  */
  function setupResponseMonitoring(req: ClassificationAwareRequest,)
  res: Response,
  result: EnforcementResult): void {,
  const originalSend = res.send;
  const startTime = Date.now();
  res.send = function(data) {
  const duration = Date.now() - startTime;
  // Log access metrics
  console.log('Classification access:', {,)
  classification: result.classification,
  userId: req.user?.id || 'anonymous',
  operation: req.method,
  path: req.path,
  allowed: result.allowed,
  riskScore: result.riskScore,
  duration,
  timestamp: new Date().toISOString(),
});
    return originalSend.call(this, data);
  };
/**
 * Handle middleware errors
 */
function handleMiddlewareError(error: Error,)
  req: Request,
  res: Response,
  config: ClassificationEnforcementMiddlewareConfig): void {,
  console.error('Classification enforcement middleware error:', error);
  if (config.errorHandler) {
  config.errorHandler(error, req, res);
} else {
  res.status(500).json({)
  error: 'Classification enforcement error',
  message: config.detailedErrors ? error.message : 'Internal server error',
});
/**
 * Validate classification level
 */
function isValidClassification(value: string): boolean {
  return ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].includes(value);
/**
 * Detect classification from data
 */
async function detectClassificationFromData(data: any): Promise<DataClassificationLevel | null> {
  if (!data || typeof data !== 'object') {
    return null;
  // Check for explicit classification field
  if (data.classification && isValidClassification(data.classification)) {
    return data.classification as DataClassificationLevel;
  // Use DataClassificationHelpers to detect
  try {
    const element = {
      id: 'detect-' + Date.now(),
      fieldName: 'request-data',
      value: JSON.stringify(data),
      dataType: 'object',
      context: {},
      source: 'request',
      timestamp: new Date();
  };
    const enhanced = DataClassificationHelpers.enhanceDataElement(element);
    if (enhanced.sensitivityLevel) {
  // Map sensitivity level to classification level
  const mapping: Record<string, DataClassificationLevel> = {,
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  RESTRICTED: 'RESTRICTED',
};
      return mapping[enhanced.sensitivityLevel];
  } catch (error) {
    console.error('Error detecting classification:', error);
  return null;
/**
 * Generate request ID
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;}
/**
 * Route-specific enforcement configuration
 */
export function enforceClassification()
  classification: DataClassificationLevel,
  options: {,
  allowedOperations?: OperationContext['operation'][];
  requiredControls?: string;
  customValidation?: (req: Request) => boolean;
} = {}
): (req: ClassificationAwareRequest, res: Response, next: NextFunction) => void {
  return (req: ClassificationAwareRequest, res: Response, next: NextFunction) => {
    // Set classification for the route
    req.classification = { level: classification };
    // Check allowed operations
    if (options.allowedOperations) {
  const operation = HTTP_METHOD_TO_OPERATION[req.method] || 'read';
  if (!options.allowedOperations.includes(operation)) {
  return res.status(405).json({)
  error: 'Method not allowed for this classification',
  classification,
  allowedOperations: options.allowedOperations,
});
    // Check required controls
    if (options.requiredControls) {
  const currentControls = extractCurrentControls(req, DEFAULT_CONFIG);
  const missingControls = options.requiredControls.filter(;);
  control => !currentControls.includes(control)
  );
  if (missingControls.length > 0) {
  return res.status(403).json({)
  error: 'Missing required security controls',
  missingControls,
  classification
});
    // Run custom validation
    if (options.customValidation && !options.customValidation(req)) {
  return res.status(403).json({)
  error: 'Custom validation failed',
  classification
});
    next();
  };
/**
 * Export middleware factories
 */
export {
  createClassificationEnforcementMiddleware as classificationEnforcement,
  createAccessControlMiddleware as accessControl,
  createOperationValidationMiddleware as operationValidation
};