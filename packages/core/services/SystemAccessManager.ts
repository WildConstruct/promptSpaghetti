/**
 * System Access Management Service - Epic 17
 * 
 * Comprehensive system access management service providing role-based access control,
 * permission management, system-level access controls, and administrative oversight.
 * 
 * Features:
 * - Role-based access control (RBAC)
 * - Fine-grained permission management
 * - System-level access controls
 * - User lifecycle management
 * - Access audit and compliance
 * - Emergency access controls
 * - Session management
 * - Resource-based permissions
 */

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  // Account status
  status: UserStatus;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  // Profile information
  profile: UserProfile;
  // Access control
  roles: UserRole;
  permissions: DirectPermission;
  systemAccess: SystemAccessLevel;
  // Security
  mfaEnabled: boolean;
  securityClearance: SecurityClearance;
  accessRestrictions?: AccessRestriction;
  // Lifecycle
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
  // Compliance
  termsAccepted?: Date;
  privacyPolicyAccepted?: Date;
  dataRetentionConsent?: boolean;
}
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  department?: string;
  jobTitle?: string;
  location?: string;
  timezone: string;
  language: string;
  phoneNumber?: string;
  organization?: string;
  manager?: string;
}
export interface UserRole {
  id: string;
  roleId: string;
  roleName: string;
  roleDescription?: string;
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
  scope: RoleScope;
  context?: Record<string, any>;
}
export interface DirectPermission {
  id: string;
  permission: string;
  resource?: string;
  resourceId?: string;
  action: string;
  granted: boolean;
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
  conditions?: PermissionCondition;
}
export interface PermissionCondition {
  type: 'time' | 'location' | 'device' | 'mfa' | 'approval';
  constraint: Record<string, any>;
  description: string;
}
export interface SystemRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: RoleType;
  level: number; // Hierarchy level (1-10, 10 = highest),
  // Permissions
  permissions: RolePermission;
  systemAccess: SystemAccessLevel;
  // Constraints
  maxUsers?: number;
  requiresApproval: boolean;
  canDelegate: boolean;
  // Lifecycle
  isActive: boolean;
  isSystem: boolean; // Cannot be deleted,
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
export interface RolePermission {
  permission: string;
  resource: string;
  actions: string;
  scope: PermissionScope;
  conditions?: PermissionCondition;
}
export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  type: AccessRequestType;
  // Request details
  targetUserId?: string;
  roleId?: string;
  permissions?: string;
  resource?: string;
  duration?: number; // hours,
  // Business justification
  businessJustification: string;
  urgency: AccessUrgency;
  // Approval workflow
  status: AccessRequestStatus;
  approvers: AccessApprover;
  currentApprover?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  // Timing
  requestedAt: Date;
  respondedAt?: Date;
  expiresAt?: Date;
  // Audit
  auditTrail: AccessAuditEntry;
}
export interface AccessApprover {
  userId: string;
  displayName: string;
  order: number;
  required: boolean;
  status: ApprovalStatus;
  respondedAt?: Date;
  comments?: string;
}
export interface AccessAuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  performedBy: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
export interface AccessRestriction {
  type: RestrictionType;
  description: string;
  startDate?: Date;
  endDate?: Date;
  conditions: Record<string, any>;
  appliedBy: string;
  appliedAt: Date;
}
export interface SystemAccess {
  id: string;
  userId: string;
  level: SystemAccessLevel;
  grantedAt: Date;
  grantedBy: string;
  lastUsed?: Date;
  restrictions: SystemRestriction;
}
export interface SystemRestriction {
  type: 'ip_whitelist' | 'time_window' | 'mfa_required' | 'approval_required' | 'read_only';
  configuration: Record<string, any>;
  description: string;
  // Enums and Types
}
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'locked' | 'pending' | 'deactivated';
export type SystemAccessLevel = 'none' | 'basic' | 'advanced' | 'admin' | 'super_admin' | 'system';
export type SecurityClearance = 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
export type RoleScope = 'global' | 'organization' | 'team' | 'project' | 'resource';
export type RoleType = 'system' | 'organizational' | 'project' | 'custom' | 'temporary';
export type PermissionScope = 'global' | 'organization' | 'project' | 'resource' | 'own';
export type AccessRequestType = 'role_assignment' | 'permission_grant' | 'access_elevation' | 'resource_access';
export type AccessUrgency = 'low' | 'medium' | 'high' | 'critical';
export type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'withdrawn';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'delegated';
export type RestrictionType = 'time' | 'location' | 'device' | 'resource' | 'action' | 'network';

export interface AccessFilter {
  userIds?: string;
  roles?: string;
  statuses?: UserStatus;
  accessLevels?: SystemAccessLevel;
  departments?: string;
  organizations?: string;
  lastActivityBefore?: Date;
  lastActivityAfter?: Date;
  searchQuery?: string;
  includeInactive?: boolean;
  securityClearance?: SecurityClearance;
}
export interface AccessStats {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
  expiredAccesses: number;
  byStatus: Record<UserStatus, number>;
  byAccessLevel: Record<SystemAccessLevel, number>;
  bySecurityClearance: Record<SecurityClearance, number>;
  recentActivity: {
  newUsers: number;
  accessGranted: number;
  accessRevoked: number;
  loginAttempts: number;
  failedLogins: number;
};
  compliance: {
  mfaEnabled: number;
  termsAccepted: number;
  overdueCertifications: number;
  pendingReviews: number;
};
/**
 * System Access Management Service
 */
}
export class SystemAccessManager {
  private static instance: SystemAccessManager;
  private users: Map<string, SystemUser> = new Map();
  private roles: Map<string, SystemRole> = new Map();
  private accessRequests: Map<string, AccessRequest> = new Map();
  private auditLog: AccessAuditEntry = [];
  private constructor() {
  this.initializeSystemRoles();
  this.startMaintenanceTasks();
  static getInstance(): SystemAccessManager {,
  if (!SystemAccessManager.instance) {
  SystemAccessManager.instance = new SystemAccessManager();
  return SystemAccessManager.instance;
  /**
  * User Management
  */
  async createUser(userData: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>)
  createdBy: string): Promise<SystemUser> {,
  const user: SystemUser = {,
  ...userData,
  id: this.generateUserId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy
};
    // Validate user data
    this.validateUserData(user);
    // Apply default settings
    if (!user.systemAccess) {
  user.systemAccess = 'basic';
  this.users.set(user.id, user);
  this.auditAction('user_created', createdBy, {)
  userId: user.id,
  username: user.username,
  email: user.email,
});
    return user;
  async updateUser(userId: string)
    updates: Partial<SystemUser>,
    updatedBy: string): Promise<SystemUser | null> {,
    const user = this.users.get(userId);
    if (!user) return null;
    const oldData = { ...user };
    const updatedUser: SystemUser = {
  ...user,
  ...updates,
  id: userId, // Ensure ID cannot be changed,
  updatedAt: new Date(),
  lastModifiedBy: updatedBy,
};
    this.validateUserData(updatedUser);
    this.users.set(userId, updatedUser);
    this.auditAction('user_updated', updatedBy, {)
  userId,
  changes: this.calculateChanges(oldData, updatedUser),
});
    return updatedUser;
  async deleteUser(userId: string, deletedBy: string): Promise<boolean> {
  const user = this.users.get(userId);
  if (!user) return false;
  // Deactivate instead of hard delete for audit purposes
  const deactivatedUser: SystemUser = {,
  ...user,
  status: 'deactivated',
  isActive: false,
  updatedAt: new Date(),
  lastModifiedBy: deletedBy,
};
    this.users.set(userId, deactivatedUser);
    this.auditAction('user_deactivated', deletedBy, {)
  userId,
  username: user.username,
});
    return true;
  /**
   * Role Management
   */
  async assignRole(userId: string)
    roleId: string,
    assignedBy: string,
    options?: {
  expiresAt?: Date;
  scope?: RoleScope;
  context?: Record<string, any>;
  ): Promise<boolean> {,
  const user = this.users.get(userId);
  const role = this.roles.get(roleId);
  if (!user || !role) return false;
  // Check if user already has this role
  const existingRole = user.roles.find(r => r.roleId === roleId);
  if (existingRole) return false;
  // Check if role requires approval
  if (role.requiresApproval && !this.hasApprovalPermission(assignedBy, role.level)) {
  await this.createAccessRequest({)
  requesterId: assignedBy,
  requesterName: 'System',
  type: 'role_assignment',
  targetUserId: userId,
  roleId,
  businessJustification: 'Role assignment request',
  urgency: 'medium',
});
      return true; // Request created, not immediately assigned
    const userRole: UserRole = {,
  id: this.generateId('role'),
  roleId,
  roleName: role.name,
  roleDescription: role.description,
  assignedAt: new Date(),
  assignedBy,
  expiresAt: options?.expiresAt,
  scope: options?.scope || 'global',
  context: options?.context,
};
    user.roles.push(userRole);
    user.updatedAt = new Date();
    user.lastModifiedBy = assignedBy;
    this.users.set(userId, user);
    this.auditAction('role_assigned', assignedBy, {)
  userId,
  roleId,
  roleName: role.name,
  expiresAt: options?.expiresAt,
});
    return true;
  async revokeRole(userId: string, roleId: string, revokedBy: string): Promise<boolean> {
  const user = this.users.get(userId);
  if (!user) return false;
  const roleIndex = user.roles.findIndex(r => r.roleId === roleId);
  if (roleIndex === -1) return false;
  const removedRole = user.roles[roleIndex];
  user.roles.splice(roleIndex, 1);
  user.updatedAt = new Date();
  user.lastModifiedBy = revokedBy;
  this.users.set(userId, user);
  this.auditAction('role_revoked', revokedBy, {)
  userId,
  roleId,
  roleName: removedRole.roleName,
});
    return true;
  /**
   * Permission Management
   */
  async grantPermission(userId: string)
    permission: string,
    resource: string,
    action: string,
    grantedBy: string,
    options?: {
  resourceId?: string;
  expiresAt?: Date;
  conditions?: PermissionCondition;
  ): Promise<boolean> {,
  const user = this.users.get(userId);
  if (!user) return false;
  const directPermission: DirectPermission = {,
  id: this.generateId('permission'),
  permission,
  resource,
  resourceId: options?.resourceId,
  action,
  granted: true,
  grantedAt: new Date(),
  grantedBy,
  expiresAt: options?.expiresAt,
  conditions: options?.conditions,
};
    user.permissions.push(directPermission);
    user.updatedAt = new Date();
    user.lastModifiedBy = grantedBy;
    this.users.set(userId, user);
    this.auditAction('permission_granted', grantedBy, {)
  userId,
      permission,
      resource,
      action
    });
    return true;
  async revokePermission(userId: string, permissionId: string, revokedBy: string): Promise<boolean> {
  const user = this.users.get(userId);
  if (!user) return false;
  const permissionIndex = user.permissions.findIndex(p => p.id === permissionId);
  if (permissionIndex === -1) return false;
  const removedPermission = user.permissions[permissionIndex];
  user.permissions.splice(permissionIndex, 1);
  user.updatedAt = new Date();
  user.lastModifiedBy = revokedBy;
  this.users.set(userId, user);
  this.auditAction('permission_revoked', revokedBy, {)
  userId,
  permission: removedPermission.permission,
  resource: removedPermission.resource,
});
    return true;
  /**
   * Access Request Management
   */
  async createAccessRequest(requestData: Omit<AccessRequest, 'id' | 'requestedAt' | 'status' | 'auditTrail'>)
  ): Promise<AccessRequest> {
    const request: AccessRequest = {
      ...requestData,
      id: this.generateId('request'),
      requestedAt: new Date(),
      status: 'pending',
      approvers: this.determineApprovers(requestData),
      auditTrail: [{,
  id: this.generateId('audit'),
        timestamp: new Date(),
        action: 'request_created',
        performedBy: requestData.requesterId,
        details: { type: requestData.type }
      }]
    };
    this.accessRequests.set(request.id, request);
    this.auditAction('access_request_created', requestData.requesterId, {)
  requestId: request.id,
  type: requestData.type,
  urgency: requestData.urgency,
});
    // Notify approvers
    await this.notifyApprovers(request);
    return request;
  async approveAccessRequest(requestId: string)
    approverId: string,
    comments?: string
  ): Promise<boolean> {
    const request = this.accessRequests.get(requestId);
    if (!request || request.status !== 'pending') return false;
    // Find approver
    const approver = request.approvers.find(a => a.userId === approverId);
    if (!approver) return false;
    // Mark as approved
    approver.status = 'approved';
    approver.respondedAt = new Date();
    approver.comments = comments;
    // Check if all required approvers have approved
    const allApproved = request.approvers;
      .filter(a => a.required)
      .every(a => a.status === 'approved');
    if (allApproved) {
      request.status = 'approved';
      request.approvedBy = request.approvers
        .filter(a => a.status === 'approved')
        .map(a => a.userId);
      request.respondedAt = new Date();
      // Execute the access request
      await this.executeAccessRequest(request);
    request.auditTrail.push({)
  id: this.generateId('audit'),
      timestamp: new Date(),
      action: 'request_approved',
      performedBy: approverId,
      details: { comments }
    });
    this.accessRequests.set(requestId, request);
    this.auditAction('access_request_approved', approverId, {)
  requestId,
  finalStatus: request.status,
});
    return true;
  /**
   * Access Control Queries
   */
  hasPermission(userId: string, permission: string, resource?: string, action?: string): boolean {
    const user = this.users.get(userId);
    if (!user || !user.isActive) return false;
    // Check direct permissions
    const hasDirectPermission = user.permissions.some(p => {)
  if (p.permission !== permission) return false;
      if (resource && p.resource && p.resource !== resource) return false;
      if (action && p.action !== action) return false;
      if (p.expiresAt && p.expiresAt < new Date()) return false;
      return p.granted;
    });
    if (hasDirectPermission) return true;
    // Check role-based permissions
    const hasRolePermission = user.roles.some(userRole => {)
  if (userRole.expiresAt && userRole.expiresAt < new Date()) return false;
      const role = this.roles.get(userRole.roleId);
      if (!role || !role.isActive) return false;
      return role.permissions.some(rolePermission => {)
  if (rolePermission.permission !== permission) return false;
        if (resource && rolePermission.resource !== resource) return false;
        if (action && !rolePermission.actions.includes(action)) return false;
        return true;
      });
    });
    return hasRolePermission;
  hasSystemAccess(userId: string, requiredLevel: SystemAccessLevel): boolean {
  const user = this.users.get(userId);
  if (!user || !user.isActive) return false;
  const accessLevels: SystemAccessLevel = ['none', 'basic', 'advanced', 'admin', 'super_admin', 'system'];
  const userLevelIndex = accessLevels.indexOf(user.systemAccess);
  const requiredLevelIndex = accessLevels.indexOf(requiredLevel);
  return userLevelIndex >= requiredLevelIndex;
  /**
  * Data Retrieval
  */
  getUsers(filter?: AccessFilter): SystemUser {,
  let users = Array.from(this.users.values());
  if (!filter) return users;
  if (filter.userIds?.length) {
  users = users.filter(u => filter.userIds!.includes(u.id));
  if (filter.statuses?.length) {
  users = users.filter(u => filter.statuses!.includes(u.status));
  if (filter.accessLevels?.length) {
  users = users.filter(u => filter.accessLevels!.includes(u.systemAccess));
  if (!filter.includeInactive) {
  users = users.filter(u => u.isActive);
  if (filter.searchQuery) {
  const query = filter.searchQuery.toLowerCase();
  users = users.filter(u => )
  u.username.toLowerCase().includes(query) ||
  u.email.toLowerCase().includes(query) ||
  u.displayName.toLowerCase().includes(query)
  );
  return users.sort((a, b) => b.lastActivityAt?.getTime() || 0 - (a.lastActivityAt?.getTime() || 0));
  getAccessStats(): AccessStats {,
  const users = Array.from(this.users.values());
  const requests = Array.from(this.accessRequests.values());
  return {
  totalUsers: users.length,
  activeUsers: users.filter(u => u.isActive).length,
  pendingRequests: requests.filter(r => r.status === 'pending').length,
  expiredAccesses: users.filter(u => ),
  u.roles.some(r => r.expiresAt && r.expiresAt < new Date())
  ).length,
  byStatus: this.groupBy(users, 'status'),
  byAccessLevel: this.groupBy(users, 'systemAccess'),
  bySecurityClearance: this.groupBy(users, 'securityClearance'),
  recentActivity: {
  newUsers: users.filter(u => ),
  u.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length,
  accessGranted: this.auditLog.filter(entry => ),
  entry.action === 'role_assigned' &&
  entry.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length,
  accessRevoked: this.auditLog.filter(entry => ),
  entry.action === 'role_revoked' &&
  entry.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length,
  loginAttempts: 0, // Would be populated from auth logs,
  failedLogins: 0   // Would be populated from auth logs,
},
  compliance: {
  mfaEnabled: users.filter(u => u.mfaEnabled).length,
  termsAccepted: users.filter(u => u.termsAccepted).length,
  overdueCertifications: 0, // Would be calculated based on certification requirements,
  pendingReviews: requests.filter(r => r.status === 'pending').length,
};
  // Private methods
  private validateUserData(user: SystemUser): void {
    if (!user.username || !user.email) {
      throw new Error('Username and email are required');
    if (!this.isValidEmail(user.email)) {
      throw new Error('Invalid email format');
    if (!user.profile.timezone) {
      user.profile.timezone = 'UTC';
    if (!user.profile.language) {
      user.profile.language = 'en';
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private calculateChanges(oldData: any, newData: any): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};
    Object.keys(newData).forEach(key => {)
  if (oldData[key] !== newData[key]) {
        changes[key] = { from: oldData[key], to: newData[key] };
    });
    return changes;
  private hasApprovalPermission(userId: string, roleLevel: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    return user.roles.some(userRole => {)
  const role = this.roles.get(userRole.roleId);
      return role && role.level >= roleLevel;
    });
  private determineApprovers(requestData: Partial<AccessRequest>): AccessApprover {
  // Default approval logic - would be more sophisticated in practice
  return [
  {
  userId: 'admin_001',
  displayName: 'System Administrator',
  order: 1,
  required: true,
  status: 'pending'];
  private async notifyApprovers(request: AccessRequest): Promise<void> {,
  // Integration point for notifications
  console.debug('Notifying approvers for request:', request.id);
  private async executeAccessRequest(request: AccessRequest): Promise<void> {,
  switch (request.type) {
  case 'role_assignment':,
  if (request.targetUserId && request.roleId) {
  await this.assignRole(request.targetUserId, request.roleId, 'system', {)
  expiresAt: request.expiresAt,
});
      break;
    case 'permission_grant':
      // Handle permission grants
      break;
    default:
      console.warn('Unknown access request type:', request.type);
  private auditAction(action: string, performedBy: string, details: Record<string, any>): void {
  const entry: AccessAuditEntry = {,
  id: this.generateId('audit'),
  timestamp: new Date(),
  action,
  performedBy,
  details
};
    this.auditLog.push(entry);
    // Keep last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
  private groupBy<T extends Record<string, any>, K extends keyof T>(()
    items: T,
    field: K,
  ): Record<string, number> {
    const grouped: Record<string, number> = {};
    items.forEach(item => {)
  const key = String(item[field]);
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return grouped;
  private initializeSystemRoles(): void {
  const systemRoles: SystemRole = [
  {
  id: 'super_admin',
  name: 'super_admin',
  displayName: 'Super Administrator',
  description: 'Full system access with all permissions',
  type: 'system',
  level: 10,
  permissions: [{,
  permission: '*',
  resource: '*',
  actions: ['*'],
  scope: 'global',
}],
        systemAccess: 'super_admin',
        requiresApproval: true,
        canDelegate: true,
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
  }
      {
  id: 'admin',
  name: 'admin',
  displayName: 'Administrator',
  description: 'Administrative access to most system functions',
  type: 'system',
  level: 8,
  permissions: [{,
  permission: 'admin',
  resource: 'system',
  actions: ['read', 'write', 'manage'],
  scope: 'global',
}],
        systemAccess: 'admin',
        requiresApproval: true,
        canDelegate: false,
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
  }
      {
  id: 'user',
  name: 'user',
  displayName: 'Standard User',
  description: 'Basic user access to application features',
  type: 'system',
  level: 1,
  permissions: [{,
  permission: 'user',
  resource: 'application',
  actions: ['read', 'write'],
  scope: 'own',
}],
        systemAccess: 'basic',
        requiresApproval: false,
        canDelegate: false,
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'];
    systemRoles.forEach(role => {)
  this.roles.set(role.id, role);
    });
  private startMaintenanceTasks(): void {
    // Clean up expired access every hour
    setInterval(() => {
      this.cleanupExpiredAccess();
    }, 60 * 60 * 1000);
    // Process pending requests every 10 minutes
    setInterval(() => {
      this.processExpiredRequests();
    }, 10 * 60 * 1000);
  private cleanupExpiredAccess(): void {
  const users = Array.from(this.users.values());
  let cleanedCount = 0;
  users.forEach(user => {)
  const expiredRoles = user.roles.filter(role => ;);
  role.expiresAt && role.expiresAt < new Date()
  );
  if (expiredRoles.length > 0) {
  user.roles = user.roles.filter(role => )
  !role.expiresAt || role.expiresAt >= new Date()
  );
  user.updatedAt = new Date();
  this.users.set(user.id, user);
  cleanedCount++;
  expiredRoles.forEach(role => {)
  this.auditAction('role_expired', 'system', {)
  userId: user.id,
  roleId: role.roleId,
  roleName: role.roleName,
});
        });
    });
    if (cleanedCount > 0) {
      console.debug(`Cleaned up expired access for ${cleanedCount} users`);}
  private processExpiredRequests(): void {
    const now = new Date();
    const expiredRequests = Array.from(this.accessRequests.values());
      .filter(request => )
        request.status === 'pending' && 
        request.expiresAt && 
        request.expiresAt < now
      );
    expiredRequests.forEach(request => {)
  request.status = 'expired';
      request.respondedAt = now;
      request.auditTrail.push({)
  id: this.generateId('audit'),
        timestamp: now,
        action: 'request_expired',
        performedBy: 'system',
        details: { reason: 'Request expired without approval' }
      });
      this.accessRequests.set(request.id, request);
      this.auditAction('access_request_expired', 'system', {)
  requestId: request.id,
  type: request.type,
});
    });
    if (expiredRequests.length > 0) {
      console.debug(`Expired ${expiredRequests.length} pending access requests`);}

// Export singleton instance
export const systemAccessManager = SystemAccessManager.getInstance();

// Convenience functions
export const createUser = (userData: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string) =>
  systemAccessManager.createUser(userData, createdBy);

export const assignRole = (userId: string, roleId: string, assignedBy: string, options?: any) =>
  systemAccessManager.assignRole(userId, roleId, assignedBy, options);

export const hasPermission = (userId: string, permission: string, resource?: string, action?: string) =>
  systemAccessManager.hasPermission(userId, permission, resource, action);

export const getUsers = (filter?: AccessFilter) => systemAccessManager.getUsers(filter);

export const getAccessStats = () => systemAccessManager.getAccessStats();