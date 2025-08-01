/**
 * API Permission Assignment Service - Epic 17.4.4 Implementation
 * Task: E17-1753114397222-C2B01B - Create permission assignment
 * 
 * Comprehensive API permission management system that extends the existing RBAC
 * infrastructure with API-specific permissions, scopes, and assignment capabilities
 * for the Backstage Admin Controls system.
 */

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from './AuditService';
import { RBACService } from './RBACService';
import { UsageControlService } from '../../admin/UsageControlService';

// =============================================================================
// Types and Interfaces
// =============================================================================

export enum ApiPermissionType {
  API_KEY_MANAGEMENT = 'api_key_management',
  ENDPOINT_ACCESS = 'endpoint_access',
  USAGE_CONTROL = 'usage_control',
  RATE_LIMITING = 'rate_limiting',
  MONITORING = 'monitoring',
  ADMIN_OVERRIDE = 'admin_override'


export enum ApiPermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  REVOKE = 'revoke',
  ROTATE = 'rotate',
  OVERRIDE = 'override',
  MONITOR = 'monitor',
  MANAGE = 'manage',
  ASSIGN = 'assign'


export enum ApiPermissionScope {
  GLOBAL = 'global',
  ORGANIZATION = 'organization',
  TEAM = 'team',
  USER = 'user',
  API_KEY = 'api_key'




export interface ApiPermission {
  permissionId: string;
  name: string;
  description: string;
  type: ApiPermissionType;
  action: ApiPermissionAction;
  scope: ApiPermissionScope;
  resource: string;
  conditions?: ApiPermissionCondition[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    version: number;
    tags: string[];



  };




export interface ApiPermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'regex' | 'exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';







export interface ApiPermissionAssignment {
  assignmentId: string;
  userId: string;
  permissionId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'suspended' | 'expired' | 'revoked';
  scope: ApiPermissionScope;
  scopeContext: {
    organizationId?: string;
    teamId?: string;
    apiKeyId?: string;
    resourceId?: string;



  };
  conditions?: ApiPermissionCondition[];
  metadata: {
    reason: string;
    approvedBy?: string;
    approvedAt?: Date;
    tags: string[];
  };




export interface ApiRole {
  roleId: string;
  name: string;
  description: string;
  category: 'api_admin' | 'api_manager' | 'api_user' | 'api_viewer' | 'custom';
  permissions: string[]; // Permission IDs
  isSystemRole: boolean;
  scope: ApiPermissionScope;
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    assignmentCount: number;
    tags: string[];



  };




export interface PermissionTemplate {
  templateId: string;
  name: string;
  description: string;
  category: string;
  permissions: Omit<ApiPermission, 'permissionId' | 'metadata'>[];
  defaultScope: ApiPermissionScope;
  isBuiltIn: boolean;







export interface PermissionCheck {
  userId: string;
  type: ApiPermissionType;
  action: ApiPermissionAction;
  resource: string;
  scope?: ApiPermissionScope;
  context?: {
    organizationId?: string;
    teamId?: string;
    apiKeyId?: string;
    resourceId?: string;
    metadata?: Record<string, any>;



  };




export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  matchingPermissions: ApiPermission[];
  appliedConditions: ApiPermissionCondition[];
  warnings: string[];
  suggestions: string[];







export interface PermissionAnalytics {
  summary: {
    totalPermissions: number;
    activeAssignments: number;
    uniqueUsers: number;



    mostUsedPermissions: { permissionId: string; usage: number }[];
    recentActivity: PermissionActivity[];
  };
  breakdown: {
    byType: Record<ApiPermissionType, number>;
    byAction: Record<ApiPermissionAction, number>;
    byScope: Record<ApiPermissionScope, number>;
  };
  security: {
    overPrivilegedUsers: string[];
    unusedPermissions: string[];
    expiringAssignments: ApiPermissionAssignment[];
    suspiciousActivity: PermissionActivity[];
  };
  recommendations: PermissionRecommendation[];




export interface PermissionActivity {
  activityId: string;
  userId: string;
  action: 'granted' | 'revoked' | 'used' | 'denied';
  permissionId: string;
  resource: string;
  timestamp: Date;
  result: 'success' | 'failure' | 'warning';
  details: Record<string, any>;







export interface PermissionRecommendation {
  type: 'cleanup' | 'security' | 'optimization' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedUsers: string[];
  suggestedActions: string[];





// =============================================================================
// API Permission Assignment Service Implementation
// =============================================================================

export class ApiPermissionAssignmentService {
  private permissions: Map<string, ApiPermission> = new Map();
  private assignments: Map<string, ApiPermissionAssignment> = new Map();
  private roles: Map<string, ApiRole> = new Map();
  private templates: Map<string, PermissionTemplate> = new Map();
  private activities: PermissionActivity[] = [];

  constructor(
    private databaseService: DatabaseService,
    private auditService: AuditService,
    private rbacService: RBACService,
    private usageControlService?: UsageControlService
  ) {
    this.initializeService();


  /**
   * Initialize the permission assignment service
   */
  private async initializeService(): Promise<void> {

    try {
      await this.initializeDatabaseSchema();
      await this.loadSystemPermissions();
      await this.loadSystemRoles();
      await this.loadBuiltInTemplates();
      await this.loadExistingAssignments();
      
      console.log('✅ API Permission Assignment Service initialized successfully');
 catch (error) {
      console.error('❌ Failed to initialize API Permission Assignment Service:', error);
      throw error;



  // =============================================================================
  // Permission Management
  // =============================================================================

  /**
   * Create a new API permission
   */
  async createPermission(
    permissionData: Omit<ApiPermission, 'permissionId' | 'metadata'>,
    createdBy: string
  ): Promise<ApiPermission> {

    const permissionId = `api_perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const permission: ApiPermission = {
      ...permissionData,
      permissionId,
      metadata: {
        createdBy,
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1,
        tags: []

    };

    // Validate permission
    await this.validatePermission(permission);

    // Store permission
    this.permissions.set(permissionId, permission);
    await this.persistPermission(permission);

    // Audit log
    await this.auditService.logAction({
      userId: createdBy,
      action: 'api_permission_created',
      resource: `api_permission:${permissionId}`,
      details: {
        permissionId,
        type: permission.type,
        action: permission.action,
        scope: permission.scope,
        resource: permission.resource

    });

    return permission;


  /**
   * Assign permission to user
   */
  async assignPermissionToUser(
    userId: string,
    permissionId: string,
    assignedBy: string,
    options: {
      expiresAt?: Date;
      scope?: ApiPermissionScope;
      scopeContext?: ApiPermissionAssignment['scopeContext'];
      conditions?: ApiPermissionCondition[];
      reason: string;
      requiresApproval?: boolean;

  ): Promise<ApiPermissionAssignment> {

    const permission = this.permissions.get(permissionId);
    if (!permission) {
      throw new Error(`Permission ${permissionId} not found`);


    const assignmentId = `api_assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const assignment: ApiPermissionAssignment = {
      assignmentId,
      userId,
      permissionId,
      assignedBy,
      assignedAt: new Date(),
      expiresAt: options.expiresAt,
      status: options.requiresApproval ? 'suspended' : 'active',
      scope: options.scope || permission.scope,
      scopeContext: options.scopeContext || {},
      conditions: options.conditions,
      metadata: {
        reason: options.reason,
        tags: []

    };

    // Validate assignment
    await this.validateAssignment(assignment);

    // Check for conflicts
    await this.checkAssignmentConflicts(assignment);

    // Store assignment
    this.assignments.set(assignmentId, assignment);
    await this.persistAssignment(assignment);

    // Log activity
    await this.logPermissionActivity('granted', userId, permissionId, permission.resource, {
      assignmentId,
      assignedBy,
      scope: assignment.scope,
      requiresApproval: options.requiresApproval
    });

    // Audit log
    await this.auditService.logAction({
      userId: assignedBy,
      action: 'api_permission_assigned',
      resource: `user:${userId}`,
      details: {
        assignmentId,
        userId,
        permissionId,
        scope: assignment.scope,
        reason: options.reason

    });

    // Integrate with existing RBAC system if needed
    if (this.shouldSyncWithRBAC(permission)) {
      await this.syncPermissionWithRBAC(assignment, 'assign');


    return assignment;


  /**
   * Revoke permission from user
   */
  async revokePermissionFromUser(
    assignmentId: string,
    revokedBy: string,
    reason: string
  ): Promise<void> {

    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);


    if (assignment.status === 'revoked') {
      throw new Error(`Assignment ${assignmentId} is already revoked`);


    // Update assignment status
    assignment.status = 'revoked';
    assignment.metadata.reason = reason;

    await this.persistAssignment(assignment);

    const permission = this.permissions.get(assignment.permissionId);

    // Log activity
    await this.logPermissionActivity('revoked', assignment.userId, assignment.permissionId, 
      permission?.resource || 'unknown', {
        assignmentId,
        revokedBy,
        reason
      });

    // Audit log
    await this.auditService.logAction({
      userId: revokedBy,
      action: 'api_permission_revoked',
      resource: `user:${assignment.userId}`,
      details: {
        assignmentId,
        userId: assignment.userId,
        permissionId: assignment.permissionId,
        reason

    });

    // Sync with RBAC system if needed
    if (permission && this.shouldSyncWithRBAC(permission)) {
      await this.syncPermissionWithRBAC(assignment, 'revoke');


    // Invalidate any related caches or sessions
    await this.invalidateUserPermissions(assignment.userId);


  /**
   * Check if user has specific permission
   */
  async checkPermission(check: PermissionCheck): Promise<PermissionCheckResult> {

    const userAssignments = Array.from(this.assignments.values())
      .filter(a => a.userId === check.userId && a.status === 'active');

    const matchingPermissions: ApiPermission[] = [];
    const appliedConditions: ApiPermissionCondition[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    for (const assignment of userAssignments) {
      const permission = this.permissions.get(assignment.permissionId);
      if (!permission) continue;

      // Check basic permission match
      if (!this.permissionMatches(permission, check)) continue;

      // Check scope
      if (!this.scopeMatches(assignment, check)) continue;

      // Check conditions
      const conditionResult = await this.evaluateConditions(
        assignment.conditions || permission.conditions || [],
        check.context || {}
      );

      if (conditionResult.passed) {
        matchingPermissions.push(permission);
        appliedConditions.push(...conditionResult.conditions);
 else {
        warnings.push(`Permission conditions not met: ${conditionResult.reason}`);



    const allowed = matchingPermissions.length > 0;
    const reason = allowed 
      ? `Permission granted via ${matchingPermissions.length} matching permission(s)`
      : 'No matching permissions found';

    // Log permission usage
    await this.logPermissionActivity(
      allowed ? 'used' : 'denied',
      check.userId,
      matchingPermissions[0]?.permissionId || 'none',
      check.resource,
      {
        type: check.type,
        action: check.action,
        matchingCount: matchingPermissions.length
      }
    );

    // Generate suggestions if permission denied
    if (!allowed) {
      suggestions.push(...this.generatePermissionSuggestions(check, userAssignments));


    return {
      allowed,
      reason,
      matchingPermissions,
      appliedConditions,
      warnings,
      suggestions
    };


  /**
   * Get user's API permissions
   */
  async getUserPermissions(userId: string, options?: {
    includeExpired?: boolean;
    scope?: ApiPermissionScope;
    type?: ApiPermissionType;
  }): Promise<{
    assignments: ApiPermissionAssignment[];
    permissions: ApiPermission[];
    roles: ApiRole[];
    summary: {
      activeCount: number;
      expiredCount: number;
      suspendedCount: number;
      totalCount: number;
    };
> {

    let assignments = Array.from(this.assignments.values())
      .filter(a => a.userId === userId);

    if (!options?.includeExpired) {
      const now = new Date();
      assignments = assignments.filter(a => 
        a.status === 'active' && 
        (!a.expiresAt || a.expiresAt > now)
      );


    if (options?.scope) {
      assignments = assignments.filter(a => a.scope === options.scope);


    const permissions: ApiPermission[] = [];
    const roles: ApiRole[] = [];

    for (const assignment of assignments) {
      const permission = this.permissions.get(assignment.permissionId);
      if (permission) {
        if (!options?.type || permission.type === options.type) {
          permissions.push(permission);




    // Get roles that contain these permissions
    for (const role of this.roles.values()) {
      const hasMatchingPermission = role.permissions.some(permId => 
        permissions.some(p => p.permissionId === permId)
      );
      if (hasMatchingPermission) {
        roles.push(role);



    const summary = {
      activeCount: assignments.filter(a => a.status === 'active').length,
      expiredCount: assignments.filter(a => a.status === 'expired').length,
      suspendedCount: assignments.filter(a => a.status === 'suspended').length,
      totalCount: assignments.length
    };

    return {
      assignments,
      permissions,
      roles,
      summary
    };


  // =============================================================================
  // Role Management
  // =============================================================================

  /**
   * Create API role with permissions
   */
  async createApiRole(
    roleData: Omit<ApiRole, 'roleId' | 'metadata'>,
    createdBy: string
  ): Promise<ApiRole> {

    const roleId = `api_role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const role: ApiRole = {
      ...roleData,
      roleId,
      metadata: {
        createdBy,
        createdAt: new Date(),
        lastModified: new Date(),
        assignmentCount: 0,
        tags: []

    };

    // Validate role
    await this.validateRole(role);

    // Store role
    this.roles.set(roleId, role);
    await this.persistRole(role);

    // Audit log
    await this.auditService.logAction({
      userId: createdBy,
      action: 'api_role_created',
      resource: `api_role:${roleId}`,
      details: {
        roleId,
        name: role.name,
        category: role.category,
        permissionCount: role.permissions.length

    });

    return role;


  /**
   * Assign role to user
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string,
    options: {
      expiresAt?: Date;
      scopeContext?: ApiPermissionAssignment['scopeContext'];
      reason: string;
    }
  ): Promise<ApiPermissionAssignment[]> {

    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);


    const assignments: ApiPermissionAssignment[] = [];

    // Assign all permissions in the role
    for (const permissionId of role.permissions) {
      try {
        const assignment = await this.assignPermissionToUser(
          userId,
          permissionId,
          assignedBy,
          {
            ...options,
            scope: role.scope,
            reason: `Role assignment: ${role.name} - ${options.reason}`
          }
        );
        assignments.push(assignment);
 catch (error) {
        console.warn(`Failed to assign permission ${permissionId} from role ${roleId}:`, error);



    // Update role assignment count
    role.metadata.assignmentCount++;
    await this.persistRole(role);

    // Audit log
    await this.auditService.logAction({
      userId: assignedBy,
      action: 'api_role_assigned',
      resource: `user:${userId}`,
      details: {
        userId,
        roleId,
        roleName: role.name,
        assignedPermissions: assignments.length,
        reason: options.reason

    });

    return assignments;


  // =============================================================================
  // Analytics and Reporting
  // =============================================================================

  /**
   * Generate permission analytics
   */
  async generateAnalytics(timeRange: { start: Date; end: Date }): Promise<PermissionAnalytics> {

    const allAssignments = Array.from(this.assignments.values());
    const activeAssignments = allAssignments.filter(a => a.status === 'active');
    const recentActivities = this.activities.filter(a => 
      a.timestamp >= timeRange.start && a.timestamp <= timeRange.end
    );

    // Calculate summary statistics
    const uniqueUsers = new Set(activeAssignments.map(a => a.userId)).size;
    const permissionUsage = this.calculatePermissionUsage(recentActivities);
    const mostUsedPermissions = Object.entries(permissionUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([permissionId, usage]) => ({ permissionId, usage }));

    // Calculate breakdowns
    const byType: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const byScope: Record<string, number> = {};

    for (const assignment of activeAssignments) {
      const permission = this.permissions.get(assignment.permissionId);
      if (permission) {
        byType[permission.type] = (byType[permission.type] || 0) + 1;
        byAction[permission.action] = (byAction[permission.action] || 0) + 1;
        byScope[assignment.scope] = (byScope[assignment.scope] || 0) + 1;



    // Security analysis
    const overPrivilegedUsers = await this.identifyOverPrivilegedUsers();
    const unusedPermissions = await this.identifyUnusedPermissions(timeRange);
    const expiringAssignments = this.getExpiringAssignments(7); // Next 7 days
    const suspiciousActivity = this.identifySuspiciousActivity(recentActivities);

    // Generate recommendations
    const recommendations = await this.generateRecommendations({
      overPrivilegedUsers,
      unusedPermissions,
      expiringAssignments,
      suspiciousActivity
    });

    return {
      summary: {
        totalPermissions: this.permissions.size,
        activeAssignments: activeAssignments.length,
        uniqueUsers,
        mostUsedPermissions,
        recentActivity: recentActivities.slice(0, 20) // Latest 20 activities

      breakdown: {
        byType: byType as Record<ApiPermissionType, number>,
        byAction: byAction as Record<ApiPermissionAction, number>,
        byScope: byScope as Record<ApiPermissionScope, number>

      security: {
        overPrivilegedUsers,
        unusedPermissions,
        expiringAssignments,
        suspiciousActivity

      recommendations
    };


  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async initializeDatabaseSchema(): Promise<void> {

    const schemas = [
      `CREATE TABLE IF NOT EXISTS api_permissions (
        permission_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        scope TEXT NOT NULL,
        resource TEXT NOT NULL,
        conditions TEXT,
        metadata TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS api_permission_assignments (
        assignment_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        permission_id TEXT NOT NULL,
        assigned_by TEXT NOT NULL,
        assigned_at DATETIME NOT NULL,
        expires_at DATETIME,
        status TEXT NOT NULL,
        scope TEXT NOT NULL,
        scope_context TEXT,
        conditions TEXT,
        metadata TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS api_roles (
        role_id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        category TEXT NOT NULL,
        permissions TEXT NOT NULL,
        is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
        scope TEXT NOT NULL,
        metadata TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
    ];

    for (const schema of schemas) {
      console.log('📋 Creating API permission database schema...');



  private async loadSystemPermissions(): Promise<void> {

    const systemPermissions = this.getSystemPermissions();
    
    for (const permissionData of systemPermissions) {
      const permission: ApiPermission = {
        ...permissionData,
        permissionId: `sys_${permissionData.type}_${permissionData.action}`,
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          version: 1,
          tags: ['system', 'built-in']

      };
      
      this.permissions.set(permission.permissionId, permission);


    console.log(`📥 Loaded ${systemPermissions.length} system permissions`);


  private getSystemPermissions(): Omit<ApiPermission, 'permissionId' | 'metadata'>[] {
    return [
      // API Key Management Permissions
      {
        name: 'Create API Keys',
        description: 'Ability to create new API keys',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.CREATE,
        scope: ApiPermissionScope.GLOBAL,
        resource: 'api_keys'

      {
        name: 'View API Keys',
        description: 'Ability to view existing API keys',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.USER,
        resource: 'api_keys'

      {
        name: 'Update API Keys',
        description: 'Ability to update API key settings',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.UPDATE,
        scope: ApiPermissionScope.USER,
        resource: 'api_keys'

      {
        name: 'Delete API Keys',
        description: 'Ability to delete API keys',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.DELETE,
        scope: ApiPermissionScope.USER,
        resource: 'api_keys'

      {
        name: 'Revoke API Keys',
        description: 'Ability to revoke active API keys',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.REVOKE,
        scope: ApiPermissionScope.GLOBAL,
        resource: 'api_keys'

      {
        name: 'Rotate API Keys',
        description: 'Ability to rotate API keys',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.ROTATE,
        scope: ApiPermissionScope.USER,
        resource: 'api_keys'

      // Usage Control Permissions
      {
        name: 'Manage Usage Limits',
        description: 'Ability to create and modify usage limits',
        type: ApiPermissionType.USAGE_CONTROL,
        action: ApiPermissionAction.MANAGE,
        scope: ApiPermissionScope.GLOBAL,
        resource: 'usage_limits'

      {
        name: 'View Usage Analytics',
        description: 'Ability to view usage statistics and analytics',
        type: ApiPermissionType.USAGE_CONTROL,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.ORGANIZATION,
        resource: 'usage_analytics'

      {
        name: 'Override Usage Limits',
        description: 'Ability to override usage limits in emergency situations',
        type: ApiPermissionType.ADMIN_OVERRIDE,
        action: ApiPermissionAction.OVERRIDE,
        scope: ApiPermissionScope.GLOBAL,
        resource: 'usage_limits'

      // Rate Limiting Permissions
      {
        name: 'Configure Rate Limits',
        description: 'Ability to configure API rate limits',
        type: ApiPermissionType.RATE_LIMITING,
        action: ApiPermissionAction.MANAGE,
        scope: ApiPermissionScope.GLOBAL,
        resource: 'rate_limits'

      // Monitoring Permissions
      {
        name: 'Monitor API Usage',
        description: 'Ability to monitor real-time API usage',
        type: ApiPermissionType.MONITORING,
        action: ApiPermissionAction.MONITOR,
        scope: ApiPermissionScope.ORGANIZATION,
        resource: 'api_monitoring'

      {
        name: 'Access API Logs',
        description: 'Ability to access detailed API access logs',
        type: ApiPermissionType.MONITORING,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.GLOBAL,
        resource: 'api_logs'

    ];


  private async loadSystemRoles(): Promise<void> {

    const systemRoles = this.getSystemRoles();
    
    for (const roleData of systemRoles) {
      const role: ApiRole = {
        ...roleData,
        roleId: `sys_role_${roleData.name.toLowerCase().replace(/\s+/g, '_')}`,
        isSystemRole: true,
        metadata: {
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date(),
          assignmentCount: 0,
          tags: ['system', 'built-in']

      };
      
      this.roles.set(role.roleId, role);


    console.log(`📥 Loaded ${systemRoles.length} system roles`);


  private getSystemRoles(): Omit<ApiRole, 'roleId' | 'isSystemRole' | 'metadata'>[] {
    return [
      {
        name: 'API Administrator',
        description: 'Full API management capabilities',
        category: 'api_admin',
        permissions: [
          'sys_api_key_management_create',
          'sys_api_key_management_read',
          'sys_api_key_management_update',
          'sys_api_key_management_delete',
          'sys_api_key_management_revoke',
          'sys_api_key_management_rotate',
          'sys_usage_control_manage',
          'sys_admin_override_override',
          'sys_rate_limiting_manage',
          'sys_monitoring_monitor',
          'sys_monitoring_read'
        ],
        scope: ApiPermissionScope.GLOBAL

      {
        name: 'API Manager',
        description: 'Manage API keys and usage for organization',
        category: 'api_manager',
        permissions: [
          'sys_api_key_management_create',
          'sys_api_key_management_read',
          'sys_api_key_management_update',
          'sys_api_key_management_rotate',
          'sys_usage_control_read',
          'sys_monitoring_monitor'
        ],
        scope: ApiPermissionScope.ORGANIZATION

      {
        name: 'API User',
        description: 'Basic API key management for own keys',
        category: 'api_user',
        permissions: [
          'sys_api_key_management_read',
          'sys_api_key_management_rotate',
          'sys_usage_control_read'
        ],
        scope: ApiPermissionScope.USER

      {
        name: 'API Viewer',
        description: 'Read-only access to API information',
        category: 'api_viewer',
        permissions: [
          'sys_api_key_management_read',
          'sys_usage_control_read'
        ],
        scope: ApiPermissionScope.USER

    ];


  private async loadBuiltInTemplates(): Promise<void> {

    // Load built-in permission templates for common use cases
    console.log('📥 Loading built-in permission templates...');


  private async loadExistingAssignments(): Promise<void> {

    // Load existing assignments from database
    console.log('📥 Loading existing permission assignments...');


  // Validation methods
  private async validatePermission(permission: ApiPermission): Promise<void> {

    if (!permission.name || permission.name.trim().length === 0) {
      throw new Error('Permission name is required');

    
    if (!Object.values(ApiPermissionType).includes(permission.type)) {
      throw new Error(`Invalid permission type: ${permission.type}`);

    
    if (!Object.values(ApiPermissionAction).includes(permission.action)) {
      throw new Error(`Invalid permission action: ${permission.action}`);



  private async validateAssignment(assignment: ApiPermissionAssignment): Promise<void> {

    if (!assignment.userId) {
      throw new Error('User ID is required for assignment');

    
    if (assignment.expiresAt && assignment.expiresAt <= new Date()) {
      throw new Error('Expiration date must be in the future');



  private async validateRole(role: ApiRole): Promise<void> {

    if (!role.name || role.name.trim().length === 0) {
      throw new Error('Role name is required');

    
    if (role.permissions.length === 0) {
      throw new Error('Role must have at least one permission');

    
    // Validate that all permissions exist
    for (const permissionId of role.permissions) {
      if (!this.permissions.has(permissionId)) {
        throw new Error(`Permission ${permissionId} does not exist`);




  // Helper methods for permission checking
  private permissionMatches(permission: ApiPermission, check: PermissionCheck): boolean {
    return permission.type === check.type &&
           permission.action === check.action &&
           permission.resource === check.resource;


  private scopeMatches(assignment: ApiPermissionAssignment, check: PermissionCheck): boolean {
    if (assignment.scope === ApiPermissionScope.GLOBAL) return true;
    if (!check.scope) return assignment.scope === ApiPermissionScope.GLOBAL;
    
    // More sophisticated scope matching logic would go here
    return assignment.scope === check.scope;


  private async evaluateConditions(
    conditions: ApiPermissionCondition[],
    context: Record<string, any>
  ): Promise<{ passed: boolean; reason?: string; conditions: ApiPermissionCondition[] }> {

    if (!conditions || conditions.length === 0) {
      return { passed: true, conditions: [] };


    // Evaluate conditions logic would go here
    // For now, return passed as a simple implementation
    return { passed: true, conditions };


  // Other helper methods...
  private async checkAssignmentConflicts(assignment: ApiPermissionAssignment): Promise<void> {

    // Check for conflicting assignments


  private shouldSyncWithRBAC(permission: ApiPermission): boolean {
    // Determine if permission should sync with main RBAC system
    return permission.scope === ApiPermissionScope.GLOBAL;


  private async syncPermissionWithRBAC(assignment: ApiPermissionAssignment, action: 'assign' | 'revoke'): Promise<void> {

    // Sync with main RBAC system if needed


  private async invalidateUserPermissions(userId: string): Promise<void> {

    // Invalidate any cached permissions for user


  private generatePermissionSuggestions(check: PermissionCheck, userAssignments: ApiPermissionAssignment[]): string[] {
    const suggestions: string[] = [];
    
    // Generate helpful suggestions based on the failed permission check
    suggestions.push('Contact your administrator to request the necessary permissions');
    
    return suggestions;


  private calculatePermissionUsage(activities: PermissionActivity[]): Record<string, number> {
    const usage: Record<string, number> = {};
    
    for (const activity of activities) {
      if (activity.action === 'used') {
        usage[activity.permissionId] = (usage[activity.permissionId] || 0) + 1;


    
    return usage;


  private async identifyOverPrivilegedUsers(): Promise<string[]> {

    // Logic to identify users with excessive permissions
    return [];


  private async identifyUnusedPermissions(timeRange: { start: Date; end: Date }): Promise<string[]> {

    // Logic to identify permissions that haven't been used
    return [];


  private getExpiringAssignments(daysAhead: number): ApiPermissionAssignment[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
    
    return Array.from(this.assignments.values()).filter(a => 
      a.expiresAt && a.expiresAt <= cutoffDate && a.status === 'active'
    );


  private identifySuspiciousActivity(activities: PermissionActivity[]): PermissionActivity[] {
    // Logic to identify suspicious permission activity
    return activities.filter(a => a.result === 'failure');


  private async generateRecommendations(data: any): Promise<PermissionRecommendation[]> {

    const recommendations: PermissionRecommendation[] = [];
    
    if (data.expiringAssignments.length > 0) {
      recommendations.push({
        type: 'compliance',
        priority: 'medium',
        title: 'Expiring Permission Assignments',
        description: `${data.expiringAssignments.length} permission assignments are expiring soon`,
        affectedUsers: data.expiringAssignments.map((a: any) => a.userId),
        suggestedActions: ['Review expiring assignments', 'Renew necessary permissions', 'Remove unused permissions']
      });

    
    return recommendations;


  private async logPermissionActivity(
    action: PermissionActivity['action'],
    userId: string,
    permissionId: string,
    resource: string,
    details: Record<string, any>
  ): Promise<void> {

    const activity: PermissionActivity = {
      activityId: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      permissionId,
      resource,
      timestamp: new Date(),
      result: 'success',
      details
    };
    
    this.activities.push(activity);
    
    // Keep only recent activities (last 1000)
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(-1000);



  // Persistence methods (placeholder - would integrate with actual database)
  private async persistPermission(permission: ApiPermission): Promise<void> {

    console.log(`💾 Persisting API permission: ${permission.permissionId}`);


  private async persistAssignment(assignment: ApiPermissionAssignment): Promise<void> {

    console.log(`💾 Persisting permission assignment: ${assignment.assignmentId}`);


  private async persistRole(role: ApiRole): Promise<void> {

    console.log(`💾 Persisting API role: ${role.roleId}`);


  // Public API methods
  async getPermissions(filters?: { type?: ApiPermissionType; scope?: ApiPermissionScope }): Promise<ApiPermission[]> {

    let permissions = Array.from(this.permissions.values());
    
    if (filters?.type) {
      permissions = permissions.filter(p => p.type === filters.type);

    
    if (filters?.scope) {
      permissions = permissions.filter(p => p.scope === filters.scope);

    
    return permissions;


  async getRoles(filters?: { category?: string; scope?: ApiPermissionScope }): Promise<ApiRole[]> {

    let roles = Array.from(this.roles.values());
    
    if (filters?.category) {
      roles = roles.filter(r => r.category === filters.category);

    
    if (filters?.scope) {
      roles = roles.filter(r => r.scope === filters.scope);

    
    return roles;


  async getTemplates(): Promise<PermissionTemplate[]> {

    return Array.from(this.templates.values());


  async getActivities(userId?: string, limit?: number): Promise<PermissionActivity[]> {

    let activities = [...this.activities];
    
    if (userId) {
      activities = activities.filter(a => a.userId === userId);

    
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (limit) {
      activities = activities.slice(0, limit);

    
    return activities;



export default ApiPermissionAssignmentService;