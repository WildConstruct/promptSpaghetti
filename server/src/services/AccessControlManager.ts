// AccessControlManager.ts
// Comprehensive access control system for encryption keys
// Provides RBAC, conditional access, and approval workflows

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';



export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  parentRoles?: string[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;







export interface Permission {
  id: string;
  action: KeyOperation;
  resource: ResourceType;
  constraints?: PermissionConstraint[];
  scope: 'global' | 'organizational' | 'project' | 'personal';







export interface PermissionConstraint {
  type: 'time' | 'location' | 'purpose' | 'security_level' | 'data_classification' | 'approval_required';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between';
  value: Error;



  metadata?: { [key: string]: unknown };




export interface UserRole {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  conditions?: PermissionConstraint[];







export interface AccessRequest {
  id: string;
  userId: string;
  keyId: string;
  operation: KeyOperation;
  justification: string;
  requestedDuration?: number; // hours
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'denied' | 'expired' | 'revoked';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewComments?: string;
  approvalWorkflowId?: string;
  expiresAt?: Date;







export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  priority: number;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;







export interface PolicyRule {
  id: string;
  condition: PolicyCondition;
  action: 'allow' | 'deny' | 'require_approval' | 'require_mfa' | 'log_warning';



  metadata?: { [key: string]: unknown };




export interface PolicyCondition {
  type: 'user' | 'role' | 'time' | 'location' | 'device' | 'key_properties' | 'operation' | 'data_classification';
  operator: string;
  value: Error;
  logicalOperator?: 'and' | 'or';
  subConditions?: PolicyCondition[];







export interface AccessContext {
  userId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  location?: GeoLocation;
  timestamp: Date;
  mfaVerified?: boolean;
  riskScore?: number;



  additionalContext?: { [key: string]: unknown };




export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;





export type KeyOperation = 
  | 'read_metadata' 
  | 'access_key_material' 
  | 'encrypt' 
  | 'decrypt' 
  | 'sign' 
  | 'verify' 
  | 'derive' 
  | 'rotate' 
  | 'export' 
  | 'import' 
  | 'backup' 
  | 'restore' 
  | 'destroy' 
  | 'modify_acl' 
  | 'view_audit_log'
  | 'approve_access'
  | 'delegate_access';

export type ResourceType = 'key' | 'key_group' | 'backup' | 'audit_log' | 'policy' | 'role';



export interface AccessDecision {
  allowed: boolean;
  reason: string;
  requiredApprovals?: string[];
  conditionalAccess?: ConditionalAccessRequirement[];
  timeRestrictions?: TimeRestriction[];
  monitoringRequired?: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  additionalFactorsRequired?: string[];







export interface ConditionalAccessRequirement {
  type: 'mfa' | 'device_verification' | 'location_verification' | 'time_restriction' | 'approval';
  description: string;



  parameters?: { [key: string]: unknown };




export interface TimeRestriction {
  startTime: string; // HH:MM format
  endTime: string;
  daysOfWeek: number[]; // 0-6, Sunday = 0
  timezone: string;





export class AccessControlManager extends EventEmitter {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private policyCache: Map<string, AccessPolicy>;
  private roleCache: Map<string, Role>;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService
  ) {
    super();
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.policyCache = new Map();
    this.roleCache = new Map();
    
    this.initializeDefaultRoles();
    this.initializeDefaultPolicies();
    this.startPolicyCacheRefresh();


  /**
   * Main access control evaluation method
   */
  async evaluateAccess(
    keyId: string,
    operation: KeyOperation,
    context: AccessContext
  ): Promise<AccessDecision> {

    try {
      // Get user roles and permissions
      const userRoles = await this.getUserRoles(context.userId);
      const permissions = await this.getUserPermissions(context.userId);
      
      // Get applicable policies
      const policies = await this.getApplicablePolicies(keyId, operation, context);
      
      // Evaluate base permissions
      const hasBasePermission = await this.evaluateBasePermissions(
        permissions, 
        operation, 
        keyId, 
        context
      );
      
      if (!hasBasePermission) {
        await this.logAccessDecision(keyId, operation, context, {
          allowed: false,
          reason: 'Insufficient base permissions',
          riskLevel: 'medium'
        });
        
        return {
          allowed: false,
          reason: 'Insufficient base permissions for this operation',
          riskLevel: 'medium'
        };

      
      // Evaluate policies in priority order
      const policyDecision = await this.evaluatePolicies(policies, keyId, operation, context);
      
      if (policyDecision.action === 'deny') {
        await this.logAccessDecision(keyId, operation, context, {
          allowed: false,
          reason: `Policy violation: ${policyDecision.reason}`,
          riskLevel: 'high'
        });
        
        return {
          allowed: false,
          reason: `Policy violation: ${policyDecision.reason}`,
          riskLevel: 'high'
        };

      
      // Handle conditional access requirements
      const conditionalRequirements = await this.evaluateConditionalAccess(
        keyId, 
        operation, 
        context
      );
      
      // Check for approval requirements
      const approvalRequirements = await this.checkApprovalRequirements(
        keyId, 
        operation, 
        context, 
        userRoles
      );
      
      // Determine risk level
      const riskLevel = this.calculateRiskLevel(keyId, operation, context);
      
      const decision: AccessDecision = {
        allowed: policyDecision.action === 'allow',
        reason: policyDecision.reason || 'Access granted based on permissions and policies',
        requiredApprovals: approvalRequirements,
        conditionalAccess: conditionalRequirements,
        riskLevel,
        monitoringRequired: riskLevel === 'high' || riskLevel === 'critical'
      };
      
      // Add time restrictions if applicable
      const timeRestrictions = await this.getTimeRestrictions(context.userId, operation);
      if (timeRestrictions.length > 0) {
        decision.timeRestrictions = timeRestrictions;

      
      // Add additional factor requirements for high-risk operations
      if (riskLevel === 'high' || riskLevel === 'critical') {
        decision.additionalFactorsRequired = await this.getRequiredFactors(
          keyId, 
          operation, 
          context
        );

      
      await this.logAccessDecision(keyId, operation, context, decision);
      
      return decision;
 catch (error) {
      console.error('Error evaluating access:', error);
      
      const errorDecision: AccessDecision = {
        allowed: false,
        reason: 'Access evaluation failed due to system error',
        riskLevel: 'critical'
      };
      
      await this.logAccessDecision(keyId, operation, context, errorDecision);
      return errorDecision;



  /**
   * Create or update a role
   */
  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {

    try {
      const roleId = crypto.randomUUID();
      const now = new Date();
      
      const newRole: Role = {
        ...role,
        id: roleId,
        createdAt: now,
        updatedAt: now
      };
      
      await this.db.query(`
        INSERT INTO access_control_roles (
          id, name, description, permissions, parent_roles, 
          is_system_role, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        roleId,
        role.name,
        role.description,
        JSON.stringify(role.permissions),
        JSON.stringify(role.parentRoles || []),
        role.isSystemRole,
        role.isActive
      ]);
      
      // Update cache
      this.roleCache.set(roleId, newRole);
      
      await this.auditService.logEvent({
        action: 'role_created',
        details: { roleId, roleName: role.name },
        severity: 'info'
      });
      
      this.emit('role_created', newRole);
      return newRole;
 catch (error) {
      console.error('Error creating role:', error);
      throw new Error('Failed to create role');



  /**
   * Assign role to user
   */
  async assignRoleToUser(
    userId: string, 
    roleId: string, 
    assignedBy: string,
    expiresAt?: Date,
    conditions?: PermissionConstraint[]
  ): Promise<UserRole> {

    try {
      const userRole: UserRole = {
        userId,
        roleId,
        assignedBy,
        assignedAt: new Date(),
        expiresAt,
        isActive: true,
        conditions
      };
      
      await this.db.query(`
        INSERT INTO user_roles (
          user_id, role_id, assigned_by, expires_at, 
          is_active, conditions
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, role_id) 
        DO UPDATE SET 
          assigned_by = $3,
          expires_at = $4,
          is_active = $5,
          conditions = $6,
          updated_at = NOW()
      `, [
        userId,
        roleId,
        assignedBy,
        expiresAt,
        true,
        JSON.stringify(conditions || [])
      ]);
      
      // Clear user permission cache
      await this.redis.del(`user_permissions:${userId}`);
      await this.redis.del(`user_roles:${userId}`);
      
      await this.auditService.logEvent({
        userId: assignedBy,
        action: 'role_assigned',
        details: { 
          targetUserId: userId, 
          roleId, 
          expiresAt: expiresAt?.toISOString() 

        severity: 'info'
      });
      
      this.emit('role_assigned', userRole);
      return userRole;
 catch (error) {
      console.error('Error assigning role to user:', error);
      throw new Error('Failed to assign role to user');



  /**
   * Create access policy
   */
  async createPolicy(policy: Omit<AccessPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccessPolicy> {

    try {
      const policyId = crypto.randomUUID();
      const now = new Date();
      
      const newPolicy: AccessPolicy = {
        ...policy,
        id: policyId,
        createdAt: now,
        updatedAt: now
      };
      
      await this.db.query(`
        INSERT INTO access_control_policies (
          id, name, description, rules, priority, 
          is_enabled, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        policyId,
        policy.name,
        policy.description,
        JSON.stringify(policy.rules),
        policy.priority,
        policy.isEnabled,
        policy.createdBy
      ]);
      
      // Update cache
      this.policyCache.set(policyId, newPolicy);
      
      await this.auditService.logEvent({
        userId: policy.createdBy,
        action: 'policy_created',
        details: { policyId, policyName: policy.name },
        severity: 'info'
      });
      
      this.emit('policy_created', newPolicy);
      return newPolicy;
 catch (error) {
      console.error('Error creating policy:', error);
      throw new Error('Failed to create policy');



  /**
   * Submit access request for approval
   */
  async submitAccessRequest(request: Omit<AccessRequest, 'id' | 'requestedAt' | 'status'>): Promise<AccessRequest> {

    try {
      const requestId = crypto.randomUUID();
      
      const accessRequest: AccessRequest = {
        ...request,
        id: requestId,
        requestedAt: new Date(),
        status: 'pending',
        expiresAt: request.requestedDuration 
          ? new Date(Date.now() + request.requestedDuration * 60 * 60 * 1000)
          : undefined
      };
      
      await this.db.query(`
        INSERT INTO access_requests (
          id, user_id, key_id, operation, justification,
          requested_duration, urgency, status, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        requestId,
        request.userId,
        request.keyId,
        request.operation,
        request.justification,
        request.requestedDuration,
        request.urgency,
        'pending',
        accessRequest.expiresAt
      ]);
      
      await this.auditService.logEvent({
        userId: request.userId,
        action: 'access_request_submitted',
        details: { 
          requestId, 
          keyId: request.keyId, 
          operation: request.operation,
          urgency: request.urgency 

        severity: 'info'
      });
      
      this.emit('access_request_submitted', accessRequest);
      return accessRequest;
 catch (error) {
      console.error('Error submitting access request:', error);
      throw new Error('Failed to submit access request');



  // Private helper methods

  private async getUserRoles(userId: string): Promise<Role[]> {

    try {
      // Check cache first
      const cached = await this.redis.get(`user_roles:${userId}`);
      if (cached) {
        return JSON.parse(cached);

      
      const result = await this.db.query(`
        SELECT r.* FROM access_control_roles r
        JOIN user_roles ur ON ur.role_id = r.id
        WHERE ur.user_id = $1 
          AND ur.is_active = true
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
          AND r.is_active = true
      `, [userId]);
      
      const roles: Role[] = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        permissions: JSON.parse(row.permissions),
        parentRoles: JSON.parse(row.parent_roles || '[]'),
        isSystemRole: row.is_system_role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active
      }));
      
      // Cache for 5 minutes
      await this.redis.setex(`user_roles:${userId}`, 300, JSON.stringify(roles));
      
      return roles;
 catch (error) {
      console.error('Error getting user roles:', error);
      return [];



  private async getUserPermissions(userId: string): Promise<Permission[]> {

    const roles = await this.getUserRoles(userId);
    const permissions: Permission[] = [];
    
    for (const role of roles) {
      permissions.push(...role.permissions);
      
      // Add inherited permissions from parent roles
      if (role.parentRoles) {
        for (const parentRoleId of role.parentRoles) {
          const parentRole = await this.getRole(parentRoleId);
          if (parentRole) {
            permissions.push(...parentRole.permissions);




    
    // Remove duplicates
    const uniquePermissions = permissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );
    
    return uniquePermissions;


  private async getRole(roleId: string): Promise<Role | null> {

    if (this.roleCache.has(roleId)) {
      return this.roleCache.get(roleId)!;

    
    try {
      const result = await this.db.query(`
        SELECT * FROM access_control_roles WHERE id = $1
      `, [roleId]);
      
      if (result.rows.length === 0) {
        return null;

      
      const row = result.rows[0];
      const role: Role = {
        id: row.id,
        name: row.name,
        description: row.description,
        permissions: JSON.parse(row.permissions),
        parentRoles: JSON.parse(row.parent_roles || '[]'),
        isSystemRole: row.is_system_role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active
      };
      
      this.roleCache.set(roleId, role);
      return role;
 catch (error) {
      console.error('Error getting role:', error);
      return null;



  private async evaluateBasePermissions(
    permissions: Permission[],
    operation: KeyOperation,
    keyId: string,
    context: AccessContext
  ): Promise<boolean> {

    for (const permission of permissions) {
      if (permission.action === operation || permission.action === '*') {
        // Check constraints
        if (permission.constraints) {
          const constraintsMet = await this.evaluateConstraints(
            permission.constraints,
            keyId,
            context
          );
          if (constraintsMet) {
            return true;

 else {
          return true;



    
    return false;


  private async evaluateConstraints(
    constraints: PermissionConstraint[],
    keyId: string,
    context: AccessContext
  ): Promise<boolean> {

    for (const constraint of constraints) {
      const constraintMet = await this.evaluateConstraint(constraint, keyId, context);
      if (!constraintMet) {
        return false;


    return true;


  private async evaluateConstraint(
    constraint: PermissionConstraint,
    keyId: string,
    context: AccessContext
  ): Promise<boolean> {

    switch (constraint.type) {
    case 'time':
      return this.evaluateTimeConstraint(constraint, context);
    case 'location':
      return this.evaluateLocationConstraint(constraint, context);
    case 'security_level':
      return await this.evaluateSecurityLevelConstraint(constraint, keyId);
    default:
      return true;



  private evaluateTimeConstraint(constraint: PermissionConstraint, context: AccessContext): boolean {
    const now = context.timestamp;
    const currentHour = now.getHours();
    
    if (constraint.operator === 'between' && Array.isArray(constraint.value)) {
      const [startHour, endHour] = constraint.value;
      return currentHour >= startHour && currentHour <= endHour;

    
    return true;


  private evaluateLocationConstraint(constraint: PermissionConstraint, context: AccessContext): boolean {
    if (!context.location) {
      return false;

    
    if (constraint.operator === 'equals') {
      return context.location.country === constraint.value;

    
    if (constraint.operator === 'in' && Array.isArray(constraint.value)) {
      return constraint.value.includes(context.location.country);

    
    return true;


  private async evaluateSecurityLevelConstraint(
    constraint: PermissionConstraint,
    keyId: string
  ): Promise<boolean> {

    try {
      const result = await this.db.query(`
        SELECT security_level FROM master_keys WHERE key_id = $1
      `, [keyId]);
      
      if (result.rows.length === 0) {
        return false;

      
      const keySecurityLevel = result.rows[0].security_level;
      
      if (constraint.operator === 'equals') {
        return keySecurityLevel === constraint.value;

      
      // Define security level hierarchy
      const levels = ['standard', 'high', 'maximum', 'ultra'];
      const keyLevelIndex = levels.indexOf(keySecurityLevel);
      const constraintLevelIndex = levels.indexOf(constraint.value);
      
      if (constraint.operator === 'greater_than') {
        return keyLevelIndex > constraintLevelIndex;

      
      if (constraint.operator === 'less_than') {
        return keyLevelIndex < constraintLevelIndex;

      
      return true;
 catch (error) {
      console.error('Error evaluating security level constraint:', error);
      return false;



  private async getApplicablePolicies(
    _____keyId: string,
    _____operation: KeyOperation,
    _____context: AccessContext
  ): Promise<AccessPolicy[]> {

    // This would be expanded to filter policies based on various criteria
    return Array.from(this.policyCache.values())
      .filter(policy => policy.isEnabled)
      .sort((a, b) => b.priority - a.priority);


  private async evaluatePolicies(
    policies: AccessPolicy[],
    keyId: string,
    operation: KeyOperation,
    context: AccessContext
  ): Promise<{ action: string; reason?: string }> {

    // Evaluate policies in priority order
    for (const policy of policies) {
      for (const rule of policy.rules) {
        const conditionMet = await this.evaluatePolicyCondition(
          rule.condition,
          keyId,
          operation,
          context
        );
        
        if (conditionMet) {
          return {
            action: rule.action,
            reason: `Policy '${policy.name}' rule applied`
          };



    
    return { action: 'allow' };


  private async evaluatePolicyCondition(
    condition: PolicyCondition,
    keyId: string,
    operation: KeyOperation,
    context: AccessContext
  ): Promise<boolean> {

    // Simplified condition evaluation - would be expanded
    switch (condition.type) {
    case 'operation':
      return condition.operator === 'equals' 
        ? operation === condition.value
        : true;
    case 'time':
      const currentHour = context.timestamp.getHours();
      return condition.operator === 'between'
        ? currentHour >= condition.value[0] && currentHour <= condition.value[1]
        : true;
    default:
      return false;



  private async evaluateConditionalAccess(
    keyId: string,
    operation: KeyOperation,
    context: AccessContext
  ): Promise<ConditionalAccessRequirement[]> {

    const requirements: ConditionalAccessRequirement[] = [];
    
    // Example: Require MFA for high-risk operations
    if (['destroy', 'export', 'modify_acl'].includes(operation) && !context.mfaVerified) {
      requirements.push({
        type: 'mfa',
        description: 'Multi-factor authentication required for this operation'
      });

    
    return requirements;


  private async checkApprovalRequirements(
    keyId: string,
    operation: KeyOperation,
    _____context: AccessContext,
    _____userRoles: Role[]
  ): Promise<string[]> {

    const requiredApprovals: string[] = [];
    
    // Check if key requires approval for this operation
    try {
      const result = await this.db.query(`
        SELECT security_level, approval_required FROM master_keys WHERE key_id = $1
      `, [keyId]);
      
      if (result.rows.length > 0) {
        const { security_level, approval_required } = result.rows[0];
        
        if (approval_required || security_level === 'ultra') {
          requiredApprovals.push('key_manager_approval');

        
        if (['destroy', 'export'].includes(operation)) {
          requiredApprovals.push('security_officer_approval');


 catch (error) {
      console.error('Error checking approval requirements:', error);

    
    return requiredApprovals;


  private calculateRiskLevel(
    keyId: string,
    operation: KeyOperation,
    context: AccessContext
  ): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;
    
    // Operation risk
    if (['destroy', 'export'].includes(operation)) {
      riskScore += 40;
 else if (['rotate', 'modify_acl'].includes(operation)) {
      riskScore += 25;
 else if (['decrypt', 'sign'].includes(operation)) {
      riskScore += 15;

    
    // Context risk
    if (context.riskScore) {
      riskScore += context.riskScore;

    
    // Time-based risk (outside business hours)
    const hour = context.timestamp.getHours();
    if (hour < 8 || hour > 18) {
      riskScore += 10;

    
    if (riskScore >= 70) return 'critical';
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';


  private async getTimeRestrictions(_____userId: string, _____operation: KeyOperation): Promise<TimeRestriction[]> {

    // This would query user-specific or role-specific time restrictions
    return [];


  private async getRequiredFactors(
    keyId: string,
    operation: KeyOperation,
    _____context: AccessContext
  ): Promise<string[]> {

    const factors: string[] = [];
    
    if (['destroy', 'export'].includes(operation)) {
      factors.push('hardware_token');
      factors.push('biometric_verification');

    
    return factors;


  private async logAccessDecision(
    keyId: string,
    operation: KeyOperation,
    context: AccessContext,
    decision: AccessDecision
  ): Promise<void> {

    try {
      await this.auditService.logEvent({
        userId: context.userId,
        action: 'access_control_decision',
        details: {
          keyId,
          operation,
          decision: decision.allowed,
          reason: decision.reason,
          riskLevel: decision.riskLevel,
          sessionId: context.sessionId,
          ipAddress: context.ipAddress

        severity: decision.allowed ? 'info' : 'warning',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      });
 catch (error) {
      console.error('Error logging access decision:', error);



  private async initializeDefaultRoles(): Promise<void> {

    // Initialize system roles
    const defaultRoles = [
      {
        name: 'key_administrator',
        description: 'Full key management privileges',
        permissions: [
          { id: 'admin_all', action: '*' as KeyOperation, resource: 'key' as ResourceType, scope: 'global' as const }
        ],
        isSystemRole: true,
        isActive: true

      {
        name: 'key_operator',
        description: 'Standard key operations',
        permissions: [
          { id: 'op_encrypt', action: 'encrypt' as KeyOperation, resource: 'key' as ResourceType, scope: 'organizational' as const },
          { id: 'op_decrypt', action: 'decrypt' as KeyOperation, resource: 'key' as ResourceType, scope: 'organizational' as const },
          { id: 'op_sign', action: 'sign' as KeyOperation, resource: 'key' as ResourceType, scope: 'organizational' as const },
          { id: 'op_verify', action: 'verify' as KeyOperation, resource: 'key' as ResourceType, scope: 'organizational' as const }
        ],
        isSystemRole: true,
        isActive: true

      {
        name: 'key_viewer',
        description: 'Read-only key metadata access',
        permissions: [
          { id: 'view_metadata', action: 'read_metadata' as KeyOperation, resource: 'key' as ResourceType, scope: 'personal' as const }
        ],
        isSystemRole: true,
        isActive: true

    ];

    for (const roleData of defaultRoles) {
      try {
        const existing = await this.db.query(`
          SELECT id FROM access_control_roles WHERE name = $1
        `, [roleData.name]);
        
        if (existing.rows.length === 0) {
          await this.createRole(roleData);

 catch (error) {
        console.error(`Error creating default role ${roleData.name}:`, error);




  private async initializeDefaultPolicies(): Promise<void> {

    // Initialize default security policies
    const defaultPolicies = [
      {
        name: 'high_risk_operations_policy',
        description: 'Requires additional verification for high-risk operations',
        rules: [
          {
            id: 'high_risk_mfa',
            condition: {
              type: 'operation' as const,
              operator: 'in',
              value: ['destroy', 'export', 'modify_acl']

            action: 'require_mfa' as const

        ],
        priority: 100,
        isEnabled: true,
        createdBy: 'system'

      {
        name: 'business_hours_policy',
        description: 'Restricts sensitive operations to business hours',
        rules: [
          {
            id: 'business_hours_only',
            condition: {
              type: 'time' as const,
              operator: 'between',
              value: [8, 18] // 8 AM to 6 PM

            action: 'allow' as const

        ],
        priority: 90,
        isEnabled: true,
        createdBy: 'system'

    ];

    for (const policyData of defaultPolicies) {
      try {
        const existing = await this.db.query(`
          SELECT id FROM access_control_policies WHERE name = $1
        `, [policyData.name]);
        
        if (existing.rows.length === 0) {
          await this.createPolicy(policyData);

 catch (error) {
        console.error(`Error creating default policy ${policyData.name}:`, error);




  private startPolicyCacheRefresh(): void {
    // Refresh policy cache every 5 minutes
    setInterval(async () => {
      try {
        const result = await this.db.query(`
          SELECT * FROM access_control_policies WHERE is_enabled = true
        `);
        
        this.policyCache.clear();
        
        for (const row of result.rows) {
          const policy: AccessPolicy = {
            id: row.id,
            name: row.name,
            description: row.description,
            rules: JSON.parse(row.rules),
            priority: row.priority,
            isEnabled: row.is_enabled,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by
          };
          
          this.policyCache.set(policy.id, policy);

 catch (error) {
        console.error('Error refreshing policy cache:', error);

    }, 5 * 60 * 1000);

