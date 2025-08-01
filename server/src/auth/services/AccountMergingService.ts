/**
 * Account Merging Service
 * 
 * Comprehensive user account merging functionality that allows users
 * to merge multiple accounts while preserving data integrity and maintaining
 * proper audit trails.
 * 
 * Features:
 * - Merge user profiles, preferences, and data
 * - Handle OAuth account consolidation
 * - Preserve audit trails and permissions
 * - Conflict resolution for duplicate data
 * - Rollback capability for failed merges
 */

import { Database } from '../database/DatabaseService';
import { AuditService } from './AuditService';
import { DataRetentionService } from './DataRetentionService';



export interface MergeRequest {
  id: string;
  primaryAccountId: string;
  secondaryAccountId: string;
  requestedBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  mergeStrategy: MergeStrategy;
  conflictResolutions: ConflictResolution[];
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;







export interface MergeStrategy {
  profileMerge: 'keep_primary' | 'keep_secondary' | 'merge_fields' | 'manual';
  preferenceMerge: 'keep_primary' | 'keep_secondary' | 'merge_categories';
  projectDataMerge: 'keep_all' | 'keep_primary' | 'keep_secondary';
  oauthAccountMerge: 'merge_all' | 'keep_primary' | 'manual';
  sessionHandling: 'transfer_all' | 'invalidate_secondary' | 'keep_separate';
  preserveAuditTrail: boolean;







export interface ConflictResolution {
  field: string;
  primaryValue: any;
  secondaryValue: any;
  resolution: 'keep_primary' | 'keep_secondary' | 'merge' | 'manual';
  resolvedValue?: any;
  reason?: string;







export interface MergeSummary {
  mergeRequestId: string;
  primaryAccountId: string;
  secondaryAccountId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'success' | 'failed' | 'partial';
  itemsMerged: {
    profiles: number;
    preferences: number;
    projects: number;
    oauthAccounts: number;
    sessions: number;
    uploads: number;



  };
  conflictsResolved: number;
  errors: string[];
  rollbackPlan?: RollbackPlan;




export interface RollbackPlan {
  id: string;
  mergeRequestId: string;
  actions: RollbackAction[];
  createdAt: Date;
  expiresAt: Date;







export interface RollbackAction {
  type: 'restore_record' | 'delete_record' | 'update_field' | 'restore_relationship';
  table: string;
  recordId: string;
  originalData: any;
  currentData: any;







export interface AccountMergePreview {
  primaryAccount: {
    id: string;
    email: string;
    profileData: any;
    projectCount: number;
    lastLoginAt: Date;
    createdAt: Date;



  };
  secondaryAccount: {
    id: string;
    email: string;
    profileData: any;
    projectCount: number;
    lastLoginAt: Date;
    createdAt: Date;
  };
  conflicts: ConflictResolution[];
  recommendedStrategy: MergeStrategy;
  estimatedDuration: number;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  };


export class AccountMergingService {
  private db: Database;
  private auditService: AuditService;
  private retentionService: DataRetentionService;
  private rollbackPlans: Map<string, RollbackPlan> = new Map();

  constructor(
    db: Database, 
    auditService: AuditService,
    retentionService: DataRetentionService
  ) {
    this.db = db;
    this.auditService = auditService;
    this.retentionService = retentionService;


  /**
   * Preview an account merge to show conflicts and recommended strategy
   */
  async previewMerge(
    primaryAccountId: string, 
    secondaryAccountId: string,
    requestedBy: string
  ): Promise<AccountMergePreview> {

    // Validate accounts exist and are different
    if (primaryAccountId === secondaryAccountId) {
      throw new Error('Cannot merge an account with itself');


    const [primaryAccount, secondaryAccount] = await Promise.all([
      this.getAccountDetails(primaryAccountId),
      this.getAccountDetails(secondaryAccountId)
    ]);

    if (!primaryAccount) {
      throw new Error(`Primary account ${primaryAccountId} not found`);

    if (!secondaryAccount) {
      throw new Error(`Secondary account ${secondaryAccountId} not found`);


    // Detect conflicts
    const conflicts = await this.detectConflicts(primaryAccount, secondaryAccount);

    // Generate recommended strategy
    const recommendedStrategy = this.generateRecommendedStrategy(
      primaryAccount, 
      secondaryAccount, 
      conflicts
    );

    // Assess risk
    const riskAssessment = this.assessMergeRisk(conflicts, primaryAccount, secondaryAccount);

    await this.auditService.logAction(requestedBy, 'account_merge', 'preview_generated', {
      primaryAccountId,
      secondaryAccountId,
      conflictCount: conflicts.length,
      riskLevel: riskAssessment.level
    });

    return {
      primaryAccount: {
        id: primaryAccount.id,
        email: primaryAccount.email,
        profileData: primaryAccount.profile,
        projectCount: primaryAccount.projectCount,
        lastLoginAt: primaryAccount.last_login_at,
        createdAt: primaryAccount.created_at

      secondaryAccount: {
        id: secondaryAccount.id,
        email: secondaryAccount.email,
        profileData: secondaryAccount.profile,
        projectCount: secondaryAccount.projectCount,
        lastLoginAt: secondaryAccount.last_login_at,
        createdAt: secondaryAccount.created_at

      conflicts,
      recommendedStrategy,
      estimatedDuration: this.estimateMergeDuration(primaryAccount, secondaryAccount),
      riskAssessment
    };


  /**
   * Create a merge request
   */
  async createMergeRequest(
    primaryAccountId: string,
    secondaryAccountId: string,
    requestedBy: string,
    strategy: MergeStrategy,
    conflictResolutions: ConflictResolution[] = []
  ): Promise<MergeRequest> {

    // Validate the merge is allowed
    await this.validateMergeRequest(primaryAccountId, secondaryAccountId, requestedBy);

    const mergeRequest: Omit<MergeRequest, 'id'> = {
      primaryAccountId,
      secondaryAccountId,
      requestedBy,
      status: 'pending',
      mergeStrategy: strategy,
      conflictResolutions,
      createdAt: new Date()
    };

    const query = `
      INSERT INTO account_merge_requests 
      (primary_account_id, secondary_account_id, requested_by, status, merge_strategy, conflict_resolutions)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      mergeRequest.primaryAccountId,
      mergeRequest.secondaryAccountId,
      mergeRequest.requestedBy,
      mergeRequest.status,
      JSON.stringify(mergeRequest.mergeStrategy),
      JSON.stringify(mergeRequest.conflictResolutions)
    ]);

    const created = result.rows[0];

    await this.auditService.logAction(requestedBy, 'account_merge', 'request_created', {
      mergeRequestId: created.id,
      primaryAccountId,
      secondaryAccountId,
      strategy: strategy
    });

    return {
      id: created.id,
      ...mergeRequest
    };


  /**
   * Process a merge request
   */
  async processMergeRequest(mergeRequestId: string): Promise<MergeSummary> {

    const startTime = new Date();
    
    // Get merge request
    const mergeRequest = await this.getMergeRequest(mergeRequestId);
    if (!mergeRequest) {
      throw new Error(`Merge request ${mergeRequestId} not found`);


    if (mergeRequest.status !== 'pending') {
      throw new Error(`Merge request ${mergeRequestId} is not in pending status`);


    try {
      // Update status to in_progress
      await this.updateMergeRequestStatus(mergeRequestId, 'in_progress');

      // Create rollback plan
      const rollbackPlan = await this.createRollbackPlan(mergeRequest);

      // Execute merge
      const summary = await this.executeMerge(mergeRequest, rollbackPlan);
      
      // Update status to completed
      await this.updateMergeRequestStatus(mergeRequestId, 'completed', null, new Date());

      summary.endTime = new Date();
      summary.duration = summary.endTime.getTime() - startTime.getTime();
      summary.status = 'success';

      await this.auditService.logAction(
        mergeRequest.requestedBy, 
        'account_merge', 
        'merge_completed', 
        summary
      );

      return summary;
 catch (error) {
      // Update status to failed
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.updateMergeRequestStatus(mergeRequestId, 'failed', errorMessage, new Date());

      await this.auditService.logAction(
        mergeRequest.requestedBy, 
        'account_merge', 
        'merge_failed', 
        {
          mergeRequestId,
          error: errorMessage
        }
      );

      throw error;



  /**
   * Execute the actual merge
   */
  private async executeMerge(
    mergeRequest: MergeRequest, 
    rollbackPlan: RollbackPlan
  ): Promise<MergeSummary> {

    const summary: MergeSummary = {
      mergeRequestId: mergeRequest.id,
      primaryAccountId: mergeRequest.primaryAccountId,
      secondaryAccountId: mergeRequest.secondaryAccountId,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      status: 'success',
      itemsMerged: {
        profiles: 0,
        preferences: 0,
        projects: 0,
        oauthAccounts: 0,
        sessions: 0,
        uploads: 0

      conflictsResolved: mergeRequest.conflictResolutions.length,
      errors: [],
      rollbackPlan
    };

    try {
      // Start transaction
      await this.db.query('BEGIN');

      // 1. Merge user profiles
      if (mergeRequest.mergeStrategy.profileMerge !== 'keep_primary') {
        const profileResult = await this.mergeUserProfiles(mergeRequest);
        summary.itemsMerged.profiles = profileResult.mergedCount;
        if (profileResult.errors.length > 0) {
          summary.errors.push(...profileResult.errors);



      // 2. Merge user preferences
      const prefResult = await this.mergeUserPreferences(mergeRequest);
      summary.itemsMerged.preferences = prefResult.mergedCount;

      // 3. Merge project data
      const projectResult = await this.mergeProjectData(mergeRequest);
      summary.itemsMerged.projects = projectResult.mergedCount;

      // 4. Merge OAuth accounts
      const oauthResult = await this.mergeOAuthAccounts(mergeRequest);
      summary.itemsMerged.oauthAccounts = oauthResult.mergedCount;

      // 5. Handle sessions
      const sessionResult = await this.handleSessions(mergeRequest);
      summary.itemsMerged.sessions = sessionResult.mergedCount;

      // 6. Merge file uploads
      const uploadsResult = await this.mergeFileUploads(mergeRequest);
      summary.itemsMerged.uploads = uploadsResult.mergedCount;

      // 7. Merge API keys
      await this.mergeApiKeys(mergeRequest);

      // 8. Update secondary account status
      await this.db.query(`
        UPDATE users 
        SET status = 'deleted', deleted_at = NOW(), 
            email = CONCAT('merged_', id, '_', email)
        WHERE id = $1
      `, [mergeRequest.secondaryAccountId]);

      // Commit transaction
      await this.db.query('COMMIT');

      return summary;
 catch (error) {
      // Rollback transaction
      await this.db.query('ROLLBACK');
      summary.errors.push(error instanceof Error ? error.message : String(error));
      summary.status = 'failed';
      throw error;



  /**
   * Merge user profiles
   */
  private async mergeUserProfiles(mergeRequest: MergeRequest): Promise<{
    mergedCount: number;
    errors: string[];
> {

    const errors: string[] = [];
    
    try {
      const strategy = mergeRequest.mergeStrategy.profileMerge;
      
      if (strategy === 'keep_secondary') {
        // Update primary account with secondary profile data
        await this.db.query(`
          UPDATE user_profiles 
          SET display_name = sp.display_name,
              first_name = sp.first_name,
              last_name = sp.last_name,
              bio = sp.bio,
              avatar_url = sp.avatar_url,
              timezone = sp.timezone,
              locale = sp.locale,
              updated_at = NOW()
          FROM user_profiles sp
          WHERE user_profiles.user_id = $1 
          AND sp.user_id = $2
        `, [mergeRequest.primaryAccountId, mergeRequest.secondaryAccountId]);
        
        return { mergedCount: 1, errors };
 else if (strategy === 'merge_fields') {
        // Apply conflict resolutions for individual fields
        for (const resolution of mergeRequest.conflictResolutions) {
          if (resolution.field.startsWith('profile.')) {
            const fieldName = resolution.field.replace('profile.', '');
            const value = resolution.resolvedValue || 
              (resolution.resolution === 'keep_primary' ? resolution.primaryValue : resolution.secondaryValue);
            
            await this.db.query(`
              UPDATE user_profiles 
              SET ${fieldName} = $1, updated_at = NOW()
              WHERE user_id = $2
            `, [value, mergeRequest.primaryAccountId]);


        
        return { mergedCount: 1, errors };


      return { mergedCount: 0, errors };
 catch (error) {
      errors.push(`Profile merge failed: ${error}`);
      return { mergedCount: 0, errors };



  /**
   * Merge user preferences
   */
  private async mergeUserPreferences(mergeRequest: MergeRequest): Promise<{
    mergedCount: number;
    errors: string[];
> {

    const errors: string[] = [];
    let mergedCount = 0;

    try {
      const strategy = mergeRequest.mergeStrategy.preferenceMerge;

      if (strategy === 'keep_secondary' || strategy === 'merge_categories') {
        // Get secondary account preferences
        const secondaryPrefs = await this.db.query(`
          SELECT category, settings 
          FROM user_preferences 
          WHERE user_id = $1
        `, [mergeRequest.secondaryAccountId]);

        for (const pref of secondaryPrefs.rows) {
          if (strategy === 'merge_categories') {
            // Merge settings within each category
            await this.db.query(`
              UPDATE user_preferences 
              SET settings = settings || $1, updated_at = NOW()
              WHERE user_id = $2 AND category = $3
            `, [pref.settings, mergeRequest.primaryAccountId, pref.category]);
 else {
            // Replace entire category
            await this.db.query(`
              INSERT INTO user_preferences (user_id, category, settings)
              VALUES ($1, $2, $3)
              ON CONFLICT (user_id, category) 
              DO UPDATE SET settings = $3, updated_at = NOW()
            `, [mergeRequest.primaryAccountId, pref.category, pref.settings]);

          mergedCount++;



      return { mergedCount, errors };
 catch (error) {
      errors.push(`Preferences merge failed: ${error}`);
      return { mergedCount: 0, errors };



  /**
   * Merge project data
   */
  private async mergeProjectData(mergeRequest: MergeRequest): Promise<{
    mergedCount: number;
    errors: string[];
> {

    const errors: string[] = [];
    let mergedCount = 0;

    try {
      const strategy = mergeRequest.mergeStrategy.projectDataMerge;

      if (strategy === 'keep_all' || strategy === 'keep_secondary') {
        // Transfer ownership of secondary account projects to primary
        const result = await this.db.query(`
          UPDATE user_projects 
          SET user_id = $1, updated_at = NOW()
          WHERE user_id = $2 AND deleted_at IS NULL
          RETURNING id
        `, [mergeRequest.primaryAccountId, mergeRequest.secondaryAccountId]);

        mergedCount = result.rowCount || 0;


      return { mergedCount, errors };
 catch (error) {
      errors.push(`Project data merge failed: ${error}`);
      return { mergedCount: 0, errors };



  /**
   * Merge OAuth accounts
   */
  private async mergeOAuthAccounts(mergeRequest: MergeRequest): Promise<{
    mergedCount: number;
    errors: string[];
> {

    const errors: string[] = [];
    let mergedCount = 0;

    try {
      const strategy = mergeRequest.mergeStrategy.oauthAccountMerge;

      if (strategy === 'merge_all') {
        // Check for duplicate providers
        const duplicates = await this.db.query(`
          SELECT sa.provider 
          FROM oauth_accounts sa
          JOIN oauth_accounts pa ON sa.provider = pa.provider
          WHERE sa.user_id = $1 AND pa.user_id = $2
        `, [mergeRequest.secondaryAccountId, mergeRequest.primaryAccountId]);

        // Delete duplicates from secondary account
        if (duplicates.rowCount && duplicates.rowCount > 0) {
          await this.db.query(`
            DELETE FROM oauth_accounts 
            WHERE user_id = $1 AND provider = ANY($2)
          `, [mergeRequest.secondaryAccountId, duplicates.rows.map(r => r.provider)]);


        // Transfer remaining OAuth accounts
        const result = await this.db.query(`
          UPDATE oauth_accounts 
          SET user_id = $1, updated_at = NOW()
          WHERE user_id = $2
          RETURNING id
        `, [mergeRequest.primaryAccountId, mergeRequest.secondaryAccountId]);

        mergedCount = result.rowCount || 0;


      return { mergedCount, errors };
 catch (error) {
      errors.push(`OAuth accounts merge failed: ${error}`);
      return { mergedCount: 0, errors };



  /**
   * Handle session merging/transfer
   */
  private async handleSessions(mergeRequest: MergeRequest): Promise<{
    mergedCount: number;
    errors: string[];
> {

    const errors: string[] = [];
    let mergedCount = 0;

    try {
      const strategy = mergeRequest.mergeStrategy.sessionHandling;

      if (strategy === 'transfer_all') {
        // Transfer active sessions to primary account
        const result = await this.db.query(`
          UPDATE user_sessions 
          SET user_id = $1
          WHERE user_id = $2 AND expires_at > NOW() AND revoked = false
          RETURNING id
        `, [mergeRequest.primaryAccountId, mergeRequest.secondaryAccountId]);

        mergedCount = result.rowCount || 0;
 else if (strategy === 'invalidate_secondary') {
        // Revoke all secondary account sessions
        await this.db.query(`
          UPDATE user_sessions 
          SET revoked = true, revoked_at = NOW()
          WHERE user_id = $1
        `, [mergeRequest.secondaryAccountId]);


      return { mergedCount, errors };
 catch (error) {
      errors.push(`Session handling failed: ${error}`);
      return { mergedCount: 0, errors };



  /**
   * Merge file uploads
   */
  private async mergeFileUploads(mergeRequest: MergeRequest): Promise<{
    mergedCount: number;
    errors: string[];
> {

    const errors: string[] = [];

    try {
      // Transfer ownership of uploads
      const result = await this.db.query(`
        UPDATE user_uploads 
        SET user_id = $1
        WHERE user_id = $2 AND deleted_at IS NULL
        RETURNING id
      `, [mergeRequest.primaryAccountId, mergeRequest.secondaryAccountId]);

      return { mergedCount: result.rowCount || 0, errors };
 catch (error) {
      errors.push(`File uploads merge failed: ${error}`);
      return { mergedCount: 0, errors };



  /**
   * Merge API keys
   */
  private async mergeApiKeys(mergeRequest: MergeRequest): Promise<void> {

    // Transfer API keys from secondary to primary account
    await this.db.query(`
      UPDATE api_keys 
      SET user_id = $1, updated_at = NOW()
      WHERE user_id = $2 AND status = 'active'
    `, [mergeRequest.primaryAccountId, mergeRequest.secondaryAccountId]);


  /**
   * Get account details for merging
   */
  private async getAccountDetails(accountId: string): Promise<any> {

    const query = `
      SELECT 
        u.*,
        p.display_name, p.first_name, p.last_name, p.bio, p.avatar_url,
        p.timezone, p.locale,
        COALESCE(project_count.count, 0) as project_count
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as count 
        FROM user_projects 
        WHERE deleted_at IS NULL 
        GROUP BY user_id
      ) project_count ON u.id = project_count.user_id
      WHERE u.id = $1 AND u.status = 'active'
    `;

    const result = await this.db.query(query, [accountId]);
    return result.rows[0] || null;


  /**
   * Detect conflicts between accounts
   */
  private async detectConflicts(
    primaryAccount: any, 
    secondaryAccount: any
  ): Promise<ConflictResolution[]> {

    const conflicts: ConflictResolution[] = [];

    // Profile conflicts
    const profileFields = ['display_name', 'first_name', 'last_name', 'bio', 'avatar_url', 'timezone', 'locale'];
    
    for (const field of profileFields) {
      if (primaryAccount[field] && secondaryAccount[field] && 
          primaryAccount[field] !== secondaryAccount[field]) {
        conflicts.push({
          field: `profile.${field}`,
          primaryValue: primaryAccount[field],
          secondaryValue: secondaryAccount[field],
          resolution: 'keep_primary' // Default resolution
        });



    // Email conflict (always exists for different accounts)
    if (primaryAccount.email !== secondaryAccount.email) {
      conflicts.push({
        field: 'email',
        primaryValue: primaryAccount.email,
        secondaryValue: secondaryAccount.email,
        resolution: 'keep_primary',
        reason: 'Primary account email takes precedence'
      });


    return conflicts;


  /**
   * Generate recommended merge strategy
   */
  private generateRecommendedStrategy(
    primaryAccount: any,
    secondaryAccount: any,
    conflicts: ConflictResolution[]
  ): MergeStrategy {
    // Base strategy on account age and activity
    const primaryIsNewer = new Date(primaryAccount.created_at) > new Date(secondaryAccount.created_at);
    const secondaryMoreActive = secondaryAccount.last_login_at > primaryAccount.last_login_at;

    return {
      profileMerge: conflicts.length > 0 ? 'merge_fields' : 'keep_primary',
      preferenceMerge: 'merge_categories',
      projectDataMerge: 'keep_all',
      oauthAccountMerge: 'merge_all',
      sessionHandling: 'transfer_all',
      preserveAuditTrail: true
    };


  /**
   * Assess merge risk level
   */
  private assessMergeRisk(
    conflicts: ConflictResolution[],
    primaryAccount: any,
    secondaryAccount: any
  ): {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
 {
    const factors: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;

    if (conflicts.length > 5) {
      factors.push(`High number of conflicts (${conflicts.length})`);
      recommendations.push('Review all conflicts carefully before proceeding');
      riskScore += 2;


    if (primaryAccount.project_count > 10 || secondaryAccount.project_count > 10) {
      factors.push('Large amount of project data to merge');
      recommendations.push('Consider backing up project data before merge');
      riskScore += 1;


    const accountAgeDays = Math.abs(
      new Date(primaryAccount.created_at).getTime() - 
      new Date(secondaryAccount.created_at).getTime()
    ) / (1000 * 60 * 60 * 24);

    if (accountAgeDays > 365) {
      factors.push('Accounts have significant age difference');
      recommendations.push('Verify both accounts belong to the same user');
      riskScore += 1;


    let level: 'low' | 'medium' | 'high';
    if (riskScore >= 3) {
      level = 'high';
      recommendations.push('Consider manual review or staged merge approach');
 else if (riskScore >= 1) {
      level = 'medium';
      recommendations.push('Proceed with caution and monitor merge process');
 else {
      level = 'low';
      recommendations.push('Low risk merge - can proceed automatically');


    return { level, factors, recommendations };


  /**
   * Estimate merge duration in milliseconds
   */
  private estimateMergeDuration(primaryAccount: any, secondaryAccount: any): number {
    // Base time: 30 seconds
    let estimatedMs = 30000;
    
    // Add time based on data volume
    const totalProjects = (primaryAccount.project_count || 0) + (secondaryAccount.project_count || 0);
    estimatedMs += totalProjects * 1000; // 1 second per project
    
    // Add time for conflicts
    estimatedMs += 5000; // 5 seconds base conflict resolution time
    
    return estimatedMs;


  /**
   * Create rollback plan
   */
  private async createRollbackPlan(mergeRequest: MergeRequest): Promise<RollbackPlan> {

    const rollbackPlan: RollbackPlan = {
      id: `rollback_${mergeRequest.id}`,
      mergeRequestId: mergeRequest.id,
      actions: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    // Store current state for potential rollback
    // This would capture the current state of both accounts
    // Implementation would depend on specific rollback requirements

    this.rollbackPlans.set(rollbackPlan.id, rollbackPlan);
    return rollbackPlan;


  /**
   * Additional helper methods would go here:
   * - getMergeRequest()
   * - updateMergeRequestStatus(* - validateMergeRequest(* - rollbackMerge(* etc.
   */

  private async getMergeRequest(mergeRequestId: string): Promise<MergeRequest | null> {

    const result = await this.db.query(
      'SELECT * FROM account_merge_requests WHERE id = $1',
      [mergeRequestId]
    );

    if (result.rows.length === 0) {
      return null;


    const row = result.rows[0];
    return {
      id: row.id,
      primaryAccountId: row.primary_account_id,
      secondaryAccountId: row.secondary_account_id,
      requestedBy: row.requested_by,
      status: row.status,
      mergeStrategy: JSON.parse(row.merge_strategy),
      conflictResolutions: JSON.parse(row.conflict_resolutions),
      createdAt: row.created_at,
      processedAt: row.processed_at,
      completedAt: row.completed_at,
      errorMessage: row.error_message
    };


  private async updateMergeRequestStatus(
    mergeRequestId: string,
    status: MergeRequest['status'],
    errorMessage?: string,
    completedAt?: Date
  ): Promise<void> {

    await this.db.query(`
      UPDATE account_merge_requests 
      SET status = $1, error_message = $2, completed_at = $3, updated_at = NOW()
      WHERE id = $4
    `, [status, errorMessage, completedAt, mergeRequestId]);


  private async validateMergeRequest(
    primaryAccountId: string,
    secondaryAccountId: string,
    requestedBy: string
  ): Promise<void> {

    // Check if user has permission to merge these accounts
    // Implementation would depend on permission system
    
    // Check if accounts are in valid state for merging
    const accounts = await this.db.query(`
      SELECT id, status, email FROM users WHERE id = ANY($1)
    `, [[primaryAccountId, secondaryAccountId]]);

    if (accounts.rows.length !== 2) {
      throw new Error('One or both accounts not found');


    for (const account of accounts.rows) {
      if (account.status !== 'active') {
        throw new Error(`Account ${account.id} is not in active status`);



    // Check for existing pending merge requests
    const existingRequest = await this.db.query(`
      SELECT id FROM account_merge_requests 
      WHERE (primary_account_id = $1 OR secondary_account_id = $1 OR 
             primary_account_id = $2 OR secondary_account_id = $2)
      AND status IN ('pending', 'in_progress')
    `, [primaryAccountId, secondaryAccountId]);

    if (existingRequest.rows.length > 0) {
      throw new Error('An account merge is already in progress for one of these accounts');




export default AccountMergingService;