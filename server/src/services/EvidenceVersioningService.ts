/**
 * Evidence Versioning Service
 * 
 * Manages version control and history tracking for audit evidence,
 * supporting immutable evidence chains, integrity verification,
 * and compliance-grade audit trails.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { EvidenceClassificationService, DataClassification } from './EvidenceClassificationService';
import * as crypto from 'crypto';
import { promisify } from 'util';

// =============================================================================
// Evidence Versioning Interfaces
// =============================================================================



export interface EvidenceVersionConfig {
  enabled: boolean;
  immutableHistory: boolean;
  maxVersionsPerEvidence: number;
  compressionEnabled: boolean;
  integrityChecking: {
    enabled: boolean;
    algorithm: 'sha256' | 'sha512' | 'blake2b';
    chainValidation: boolean;



  };
  retention: {
    enabled: boolean;
    retentionPeriodDays: number;
    archivalEnabled: boolean;
    compressionAfterDays: number;
  };
  synchronization: {
    enabled: boolean;
    conflictResolution: 'last_writer_wins' | 'merge' | 'manual';
    distributedNodes: string[];
  };




export interface EvidenceVersion {
  id: string;
  evidenceId: string;
  version: number;
  parentVersion?: number;
  branchName?: string;
  
  // Content and metadata
  content: string;
  metadata: Record<string, any>;
  classification: DataClassification;
  filename?: string;
  mimeType?: string;
  size: number;
  
  // Integrity and security
  contentHash: string;
  previousVersionHash?: string;
  chainHash: string; // Hash of entire version chain up to this point
  signature?: string;
  encrypted: boolean;
  
  // Lifecycle information
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
  
  // Version-specific metadata
  changeType: VersionChangeType;
  changeDescription: string;
  changeReason: string;
  tags: string[];
  
  // Compliance and audit
  retentionExpiry?: Date;
  legalHold: boolean;
  complianceFrameworks: string[];
  auditRequirements: string[];
  
  // Storage information
  storageLocation: string;
  compressionType?: 'gzip' | 'brotli' | 'lz4';
  archivalStatus: 'active' | 'compressed' | 'archived' | 'deleted';







export interface EvidenceVersionDiff {
  fromVersion: number;
  toVersion: number;
  changeType: VersionChangeType;
  changes: {
    content?: {
      added: string[];
      removed: string[];
      modified: string[];



    };
    metadata?: {
      added: Record<string, any>;
      removed: string[];
      modified: Record<string, { from: unknown; to: unknown }>;
    };
    classification?: {
      from: DataClassification;
      to: DataClassification;
      reason?: string;
    };
  };
  statistics: {
    contentSizeChange: number;
    metadataFieldsChanged: number;
    significanceScore: number; // 0-1 indicating how significant the change is
  };




export interface EvidenceVersionChain {
  evidenceId: string;
  versions: EvidenceVersion[];
  branches: EvidenceVersionBranch[];
  integrityStatus: {
    valid: boolean;
    brokenLinks: number[];
    hashMismatches: number[];
    lastVerified: Date;



  };
  statistics: {
    totalVersions: number;
    totalSize: number;
    oldestVersion: Date;
    newestVersion: Date;
    averageVersionSize: number;
  };




export interface EvidenceVersionBranch {
  name: string;
  baseVersion: number;
  headVersion: number;
  description: string;
  createdBy: string;
  createdAt: Date;
  status: 'active' | 'merged' | 'abandoned';







export interface VersionConflict {
  evidenceId: string;
  conflictType: 'concurrent_modification' | 'classification_mismatch' | 'integrity_failure';
  localVersion: EvidenceVersion;
  remoteVersion: EvidenceVersion;
  conflictDetails: Record<string, any>;
  resolutionSuggestions: string[];
  timestamp: Date;







export interface VersionMergeResult {
  success: boolean;
  mergedVersion?: EvidenceVersion;
  conflicts: VersionConflict[];
  warnings: string[];
  changes: EvidenceVersionDiff;





export type VersionChangeType = 
  | 'initial_creation'
  | 'content_update' 
  | 'metadata_update'
  | 'classification_change'
  | 'compliance_update'
  | 'merge'
  | 'rollback'
  | 'archive'
  | 'legal_hold'
  | 'retention_update';

// =============================================================================
// Main Service Class
// =============================================================================

export class EvidenceVersioningService {
  private config: EvidenceVersionConfig;
  private classificationService: EvidenceClassificationService;
  
  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
    private auditService: AuditService
  ) {
    this.config = this.getDefaultConfig();
    this.classificationService = new EvidenceClassificationService(
      databaseService, redisService, auditService
    );
    
    this.initializeService();


  // =============================================================================
  // Core Versioning Operations
  // =============================================================================

  /**
   * Create initial version of evidence
   */
  async createEvidence(
    evidenceId: string,
    content: string,
    metadata: Record<string, any>,
    createdBy: string,
    options?: {
      classification?: DataClassification;
      filename?: string;
      mimeType?: string;
      tags?: string[];
      complianceFrameworks?: string[];
    }
  ): Promise<EvidenceVersion> {

    try {
      // Auto-classify if not provided
      let classification = options?.classification;
      if (!classification) {
        const classificationResult = await this.classificationService.classifyEvidence({
          id: evidenceId,
          type: 'document', // Default type
          content,
          metadata,
          filename: options?.filename,
          size: Buffer.byteLength(content, 'utf8'),
          source: 'evidence_versioning_service'
        });
        classification = classificationResult.classification;


      const version: EvidenceVersion = {
        id: this.generateVersionId(),
        evidenceId,
        version: 1,
        content,
        metadata,
        classification,
        filename: options?.filename,
        mimeType: options?.mimeType || 'text/plain',
        size: Buffer.byteLength(content, 'utf8'),
        
        // Generate integrity hashes
        contentHash: this.generateContentHash(content),
        chainHash: '', // Will be set after hash calculation
        encrypted: classification === 'confidential' || classification === 'restricted',
        
        // Lifecycle
        createdAt: new Date(),
        createdBy,
        modifiedAt: new Date(),
        modifiedBy: createdBy,
        
        // Version info
        changeType: 'initial_creation',
        changeDescription: 'Initial evidence creation',
        changeReason: 'Evidence uploaded to system',
        tags: options?.tags || [],
        
        // Compliance
        legalHold: false,
        complianceFrameworks: options?.complianceFrameworks || [],
        auditRequirements: [],
        
        // Storage
        storageLocation: this.generateStorageLocation(evidenceId, 1),
        archivalStatus: 'active'
      };

      // Generate chain hash (for first version, it's just the content hash)
      version.chainHash = this.generateChainHash(version.contentHash, undefined);

      // Encrypt content if required
      if (version.encrypted) {
        version.content = await this.encryptContent(content);
        version.signature = await this.signContent(version.content, createdBy);


      // Store version
      await this.storeVersion(version);
      
      // Log audit event
      await this.auditService.logActivity({
        type: 'evidence_version_created',
        details: {
          evidenceId,
          version: version.version,
          createdBy,
          classification,
          size: version.size

      });

      return version;
 catch (error) {
      throw new Error(`Failed to create evidence: ${error instanceof Error ? error.message : String(error)}`);



  /**
   * Create new version of existing evidence
   */
  async updateEvidence(
    evidenceId: string,
    updates: {
      content?: string;
      metadata?: Record<string, any>;
      classification?: DataClassification;
      filename?: string;

    modifiedBy: string,
    changeReason: string,
    options?: {
      branchName?: string;
      tags?: string[];
      forceVersion?: number;
    }
  ): Promise<EvidenceVersion> {

    try {
      // Get latest version
      const currentVersion = await this.getLatestVersion(evidenceId, options?.branchName);
      if (!currentVersion) {
        throw new Error(`Evidence not found: ${evidenceId}`);


      // Determine what changed
      const hasContentChange = updates.content !== undefined && updates.content !== currentVersion.content;
      const hasMetadataChange = updates.metadata !== undefined && 
        JSON.stringify(updates.metadata) !== JSON.stringify(currentVersion.metadata);
      const hasClassificationChange = updates.classification !== undefined && 
        updates.classification !== currentVersion.classification;

      if (!hasContentChange && !hasMetadataChange && !hasClassificationChange) {
        throw new Error('No changes detected - version not created');


      // Create new version
      const newVersionNumber = options?.forceVersion || (currentVersion.version + 1);
      const newContent = updates.content !== undefined ? updates.content : currentVersion.content;
      const newMetadata = updates.metadata !== undefined ? updates.metadata : currentVersion.metadata;
      
      let newClassification = updates.classification;
      if (!newClassification && hasContentChange) {
        // Auto-classify if content changed
        const classificationResult = await this.classificationService.classifyEvidence({
          id: evidenceId,
          type: 'document',
          content: newContent,
          metadata: newMetadata,
          filename: updates.filename || currentVersion.filename,
          size: Buffer.byteLength(newContent, 'utf8'),
          source: 'evidence_versioning_service'
        });
        newClassification = classificationResult.classification;
 else if (!newClassification) {
        newClassification = currentVersion.classification;


      const newVersion: EvidenceVersion = {
        id: this.generateVersionId(),
        evidenceId,
        version: newVersionNumber,
        parentVersion: currentVersion.version,
        branchName: options?.branchName,
        
        content: newContent,
        metadata: newMetadata,
        classification: newClassification,
        filename: updates.filename || currentVersion.filename,
        mimeType: currentVersion.mimeType,
        size: Buffer.byteLength(newContent, 'utf8'),
        
        // Generate integrity hashes
        contentHash: this.generateContentHash(newContent),
        previousVersionHash: currentVersion.chainHash,
        chainHash: '', // Will be set after calculation
        encrypted: newClassification === 'confidential' || newClassification === 'restricted',
        
        // Lifecycle
        createdAt: new Date(),
        createdBy: modifiedBy,
        modifiedAt: new Date(),
        modifiedBy,
        
        // Version info
        changeType: this.determineChangeType(hasContentChange, hasMetadataChange, hasClassificationChange),
        changeDescription: this.generateChangeDescription(currentVersion, newContent, newMetadata, newClassification),
        changeReason,
        tags: options?.tags || currentVersion.tags,
        
        // Compliance (inherit from previous)
        legalHold: currentVersion.legalHold,
        complianceFrameworks: currentVersion.complianceFrameworks,
        auditRequirements: currentVersion.auditRequirements,
        
        // Storage
        storageLocation: this.generateStorageLocation(evidenceId, newVersionNumber),
        archivalStatus: 'active'
      };

      // Generate chain hash
      newVersion.chainHash = this.generateChainHash(newVersion.contentHash, currentVersion.chainHash);

      // Encrypt if required
      if (newVersion.encrypted) {
        newVersion.content = await this.encryptContent(newContent);
        newVersion.signature = await this.signContent(newVersion.content, modifiedBy);


      // Store new version
      await this.storeVersion(newVersion);
      
      // Log audit event
      await this.auditService.logActivity({
        type: 'evidence_version_updated',
        details: {
          evidenceId,
          fromVersion: currentVersion.version,
          toVersion: newVersion.version,
          modifiedBy,
          changeType: newVersion.changeType,
          sizeChange: newVersion.size - currentVersion.size

      });

      return newVersion;
 catch (error) {
      throw new Error(`Failed to update evidence: ${error instanceof Error ? error.message : String(error)}`);



  /**
   * Get specific version of evidence
   */
  async getVersion(evidenceId: string, version: number): Promise<EvidenceVersion | null> {

    try {
      const result = await this.databaseService.query(`
        SELECT * FROM evidence_versions 
        WHERE evidence_id = ? AND version = ?
      `, [evidenceId, version]);

      if (result.length === 0) {
        return null;


      const versionData = this.deserializeVersion(result[0]);
      
      // Decrypt content if encrypted
      if (versionData.encrypted) {
        versionData.content = await this.decryptContent(versionData.content);


      return versionData;
 catch (error) {
      throw new Error(`Failed to get evidence version: ${error instanceof Error ? error.message : String(error)}`);



  /**
   * Get latest version of evidence
   */
  async getLatestVersion(evidenceId: string, branchName?: string): Promise<EvidenceVersion | null> {

    try {
      const query = branchName 
        ? 'SELECT * FROM evidence_versions WHERE evidence_id = ? AND (branch_name = ? OR branch_name IS NULL) ORDER BY version DESC LIMIT 1'
        : 'SELECT * FROM evidence_versions WHERE evidence_id = ? AND branch_name IS NULL ORDER BY version DESC LIMIT 1';
      
      const params = branchName ? [evidenceId, branchName] : [evidenceId];
      const result = await this.databaseService.query(query, params);

      if (result.length === 0) {
        return null;


      const versionData = this.deserializeVersion(result[0]);
      
      if (versionData.encrypted) {
        versionData.content = await this.decryptContent(versionData.content);


      return versionData;
 catch (error) {
      throw new Error(`Failed to get latest evidence version: ${error instanceof Error ? error.message : String(error)}`);



  /**
   * Get complete version history for evidence
   */
  async getVersionHistory(evidenceId: string, options?: {
    includeBranches?: boolean;
    includeContent?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<EvidenceVersion[]> {

    try {
      let query = 'SELECT * FROM evidence_versions WHERE evidence_id = ?';
      const params = [evidenceId];

      if (!options?.includeBranches) {
        query += ' AND branch_name IS NULL';


      query += ' ORDER BY version DESC';

      if (options?.limit) {
        query += ' LIMIT ?';
        params.push(options.limit);
        
        if (options?.offset) {
          query += ' OFFSET ?';
          params.push(options.offset);



      const result = await this.databaseService.query(query, params);
      const versions: EvidenceVersion[] = [];

      for (const row of result) {
        const versionData = this.deserializeVersion(row);
        
        // Optionally exclude content for performance
        if (!options?.includeContent) {
          versionData.content = '';
 else if (versionData.encrypted) {
          versionData.content = await this.decryptContent(versionData.content);

        
        versions.push(versionData);


      return versions;
 catch (error) {
      throw new Error(`Failed to get version history: ${error instanceof Error ? error.message : String(error)}`);



  /**
   * Generate diff between two versions
   */
  async generateDiff(evidenceId: string, fromVersion: number, toVersion: number): Promise<EvidenceVersionDiff> {

    try {
      const [from, to] = await Promise.all([
        this.getVersion(evidenceId, fromVersion),
        this.getVersion(evidenceId, toVersion)
      ]);

      if (!from || !to) {
        throw new Error('One or both versions not found');


      return this.computeVersionDiff(from, to);
 catch (error) {
      throw new Error(`Failed to generate diff: ${error instanceof Error ? error.message : String(error)}`);



  /**
   * Verify integrity of version chain
   */
  async verifyIntegrity(evidenceId: string): Promise<{
    valid: boolean;
    issues: string[];
    brokenLinks: number[];
    hashMismatches: number[];
> {

    try {
      const versions = await this.getVersionHistory(evidenceId, { 
        includeBranches: false, 
        includeContent: true 
      });

      const issues: string[] = [];
      const brokenLinks: number[] = [];
      const hashMismatches: number[] = [];

      // Sort by version number
      versions.sort((a, b) => a.version - b.version);

      for (let i = 0; i < versions.length; i++) {
        const version = versions[i];
        
        // Verify content hash
        const expectedContentHash = this.generateContentHash(version.content);
        if (version.contentHash !== expectedContentHash) {
          hashMismatches.push(version.version);
          issues.push(`Version ${version.version}: Content hash mismatch`);


        // Verify chain linkage
        if (i > 0) {
          const previousVersion = versions[i - 1];
          if (version.previousVersionHash !== previousVersion.chainHash) {
            brokenLinks.push(version.version);
            issues.push(`Version ${version.version}: Broken link to previous version`);



        // Verify chain hash
        const expectedChainHash = this.generateChainHash(
          version.contentHash, 
          i > 0 ? versions[i - 1].chainHash : undefined
        );
        if (version.chainHash !== expectedChainHash) {
          hashMismatches.push(version.version);
          issues.push(`Version ${version.version}: Chain hash mismatch`);



      return {
        valid: issues.length === 0,
        issues,
        brokenLinks,
        hashMismatches
      };
 catch (error) {
      throw new Error(`Failed to verify integrity: ${error instanceof Error ? error.message : String(error)}`);



  /**
   * Create branch from specific version
   */
  async createBranch(
    evidenceId: string, 
    baseVersion: number, 
    branchName: string,
    description: string,
    createdBy: string
  ): Promise<EvidenceVersionBranch> {

    try {
      // Verify base version exists
      const baseVersionData = await this.getVersion(evidenceId, baseVersion);
      if (!baseVersionData) {
        throw new Error(`Base version ${baseVersion} not found`);


      // Check if branch name already exists
      const existingBranch = await this.getBranch(evidenceId, branchName);
      if (existingBranch) {
        throw new Error(`Branch '${branchName}' already exists`);


      const branch: EvidenceVersionBranch = {
        name: branchName,
        baseVersion,
        headVersion: baseVersion,
        description,
        createdBy,
        createdAt: new Date(),
        status: 'active'
      };

      await this.storeBranch(evidenceId, branch);

      await this.auditService.logActivity({
        type: 'evidence_branch_created',
        details: {
          evidenceId,
          branchName,
          baseVersion,
          createdBy

      });

      return branch;
 catch (error) {
      throw new Error(`Failed to create branch: ${error instanceof Error ? error.message : String(error)}`);



  /**
   * Rollback to previous version
   */
  async rollback(
    evidenceId: string,
    targetVersion: number,
    rolledBackBy: string,
    reason: string
  ): Promise<EvidenceVersion> {

    try {
      const targetVersionData = await this.getVersion(evidenceId, targetVersion);
      if (!targetVersionData) {
        throw new Error(`Target version ${targetVersion} not found`);


      // Create new version that's a copy of the target version
      const rollbackVersion = await this.updateEvidence(
        evidenceId,
        {
          content: targetVersionData.content,
          metadata: targetVersionData.metadata,
          classification: targetVersionData.classification,
          filename: targetVersionData.filename

        rolledBackBy,
        `Rollback to version ${targetVersion}: ${reason}`
      );

      // Update change type to indicate rollback
      rollbackVersion.changeType = 'rollback';
      await this.updateVersionMetadata(rollbackVersion.id, { changeType: 'rollback' });

      return rollbackVersion;
 catch (error) {
      throw new Error(`Failed to rollback: ${error instanceof Error ? error.message : String(error)}`);



  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async storeVersion(version: EvidenceVersion): Promise<void> {

    await this.databaseService.query(`
      INSERT INTO evidence_versions (
        id, evidence_id, version, parent_version, branch_name,
        content, metadata, classification, filename, mime_type, size,
        content_hash, previous_version_hash, chain_hash, signature, encrypted,
        created_at, created_by, modified_at, modified_by,
        change_type, change_description, change_reason, tags,
        retention_expiry, legal_hold, compliance_frameworks, audit_requirements,
        storage_location, compression_type, archival_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      version.id, version.evidenceId, version.version, version.parentVersion, version.branchName,
      version.content, JSON.stringify(version.metadata), version.classification, version.filename, version.mimeType, version.size,
      version.contentHash, version.previousVersionHash, version.chainHash, version.signature, version.encrypted,
      version.createdAt.toISOString(), version.createdBy, version.modifiedAt.toISOString(), version.modifiedBy,
      version.changeType, version.changeDescription, version.changeReason, JSON.stringify(version.tags),
      version.retentionExpiry?.toISOString(), version.legalHold, JSON.stringify(version.complianceFrameworks), JSON.stringify(version.auditRequirements),
      version.storageLocation, version.compressionType, version.archivalStatus
    ]);


  private async storeBranch(evidenceId: string, branch: EvidenceVersionBranch): Promise<void> {

    await this.databaseService.query(`
      INSERT INTO evidence_version_branches (
        evidence_id, name, base_version, head_version, description, created_by, created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      evidenceId, branch.name, branch.baseVersion, branch.headVersion, 
      branch.description, branch.createdBy, branch.createdAt.toISOString(), branch.status
    ]);


  private async getBranch(evidenceId: string, branchName: string): Promise<EvidenceVersionBranch | null> {

    const result = await this.databaseService.query(`
      SELECT * FROM evidence_version_branches WHERE evidence_id = ? AND name = ?
    `, [evidenceId, branchName]);

    return result.length > 0 ? this.deserializeBranch(result[0]) : null;


  private deserializeVersion(row: unknown): EvidenceVersion {
    return {
      id: row.id,
      evidenceId: row.evidence_id,
      version: row.version,
      parentVersion: row.parent_version,
      branchName: row.branch_name,
      content: row.content,
      metadata: JSON.parse(row.metadata || '{}'),
      classification: row.classification,
      filename: row.filename,
      mimeType: row.mime_type,
      size: row.size,
      contentHash: row.content_hash,
      previousVersionHash: row.previous_version_hash,
      chainHash: row.chain_hash,
      signature: row.signature,
      encrypted: row.encrypted,
      createdAt: new Date(row.created_at),
      createdBy: row.created_by,
      modifiedAt: new Date(row.modified_at),
      modifiedBy: row.modified_by,
      changeType: row.change_type,
      changeDescription: row.change_description,
      changeReason: row.change_reason,
      tags: JSON.parse(row.tags || '[]'),
      retentionExpiry: row.retention_expiry ? new Date(row.retention_expiry) : undefined,
      legalHold: row.legal_hold,
      complianceFrameworks: JSON.parse(row.compliance_frameworks || '[]'),
      auditRequirements: JSON.parse(row.audit_requirements || '[]'),
      storageLocation: row.storage_location,
      compressionType: row.compression_type,
      archivalStatus: row.archival_status
    };


  private deserializeBranch(row: unknown): EvidenceVersionBranch {
    return {
      name: row.name,
      baseVersion: row.base_version,
      headVersion: row.head_version,
      description: row.description,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      status: row.status
    };


  private generateVersionId(): string {
    return `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


  private generateContentHash(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');


  private generateChainHash(contentHash: string, previousChainHash?: string): string {
    const data = previousChainHash ? `${contentHash}:${previousChainHash}` : contentHash;
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');


  private generateStorageLocation(evidenceId: string, version: number): string {
    const hash = crypto.createHash('md5').update(evidenceId).digest('hex');
    return `/evidence/${hash.substr(0, 2)}/${hash.substr(2, 2)}/${evidenceId}/v${version}`;


  private async encryptContent(content: string): Promise<string> {

    // Simplified encryption - in production, use proper encryption service
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM('aes-256-gcm', key);
    cipher.setAAD(Buffer.from('evidence-content', 'utf8'));
    
    let encrypted = cipher.update(content, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      key: key.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64')
    });


  private async decryptContent(encryptedContent: string): Promise<string> {

    try {
      const data = JSON.parse(encryptedContent);
      const key = Buffer.from(data.key, 'base64');
      const __iv = Buffer.from(data.__iv, 'base64');
      const authTag = Buffer.from(data.authTag, 'base64');
      
      const decipher = crypto.createDecipherGCM('aes-256-gcm', key);
      decipher.setAAD(Buffer.from('evidence-content', 'utf8'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(data.encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
 catch (error) {
      throw new Error('Failed to decrypt content');



  private async signContent(content: string, signedBy: string): Promise<string> {

    const hash = crypto.createHash('sha256').update(content + signedBy).digest('hex');
    return `signature_${hash.substr(0, 16)}`;


  private determineChangeType(
    hasContentChange: boolean, 
    hasMetadataChange: boolean, 
    hasClassificationChange: boolean
  ): VersionChangeType {
    if (hasClassificationChange) return 'classification_change';
    if (hasContentChange) return 'content_update';
    if (hasMetadataChange) return 'metadata_update';
    return 'content_update';


  private generateChangeDescription(
    previousVersion: EvidenceVersion,
    newContent: string,
    newMetadata: Record<string, any>,
    newClassification: DataClassification
  ): string {
    const changes: string[] = [];
    
    if (newContent !== previousVersion.content) {
      const sizeDiff = Buffer.byteLength(newContent, 'utf8') - previousVersion.size;
      changes.push(`Content updated (${sizeDiff > 0 ? '+' : ''}${sizeDiff} bytes)`);

    
    if (JSON.stringify(newMetadata) !== JSON.stringify(previousVersion.metadata)) {
      const addedFields = Object.keys(newMetadata).filter(k => !previousVersion.metadata.hasOwnProperty(k));
      const removedFields = Object.keys(previousVersion.metadata).filter(k => !newMetadata.hasOwnProperty(k));
      if (addedFields.length > 0) changes.push(`Added metadata: ${addedFields.join(', ')}`);
      if (removedFields.length > 0) changes.push(`Removed metadata: ${removedFields.join(', ')}`);

    
    if (newClassification !== previousVersion.classification) {
      changes.push(`Classification: ${previousVersion.classification} → ${newClassification}`);

    
    return changes.join('; ') || 'No changes detected';


  private computeVersionDiff(from: EvidenceVersion, to: EvidenceVersion): EvidenceVersionDiff {
    const diff: EvidenceVersionDiff = {
      fromVersion: from.version,
      toVersion: to.version,
      changeType: to.changeType,
      changes: {},
      statistics: {
        contentSizeChange: to.size - from.size,
        metadataFieldsChanged: 0,
        significanceScore: 0

    };

    // Content changes (simplified - in practice, would use proper diff algorithm)
    if (from.content !== to.content) {
      diff.changes.content = {
        added: [],
        removed: [],
        modified: ['Content modified'] // Simplified
      };


    // Metadata changes
    const fromMetaKeys = Object.keys(from.metadata);
    const toMetaKeys = Object.keys(to.metadata);
    
    const addedKeys = toMetaKeys.filter(k => !fromMetaKeys.includes(k));
    const removedKeys = fromMetaKeys.filter(k => !toMetaKeys.includes(k));
    const commonKeys = fromMetaKeys.filter(k => toMetaKeys.includes(k));
    const modifiedKeys = commonKeys.filter(k => 
      JSON.stringify(from.metadata[k]) !== JSON.stringify(to.metadata[k])
    );

    if (addedKeys.length > 0 || removedKeys.length > 0 || modifiedKeys.length > 0) {
      diff.changes.metadata = {
        added: addedKeys.reduce((acc, key) => ({ ...acc, [key]: to.metadata[key] }), {}),
        removed: removedKeys,
        modified: modifiedKeys.reduce((acc, key) => ({ 
          ...acc, 
          [key]: { from: from.metadata[key], to: to.metadata[key] }
        }), {})
      };
      
      diff.statistics.metadataFieldsChanged = addedKeys.length + removedKeys.length + modifiedKeys.length;


    // Classification changes
    if (from.classification !== to.classification) {
      diff.changes.classification = {
        from: from.classification,
        to: to.classification
      };


    // Calculate significance score (0-1)
    let significance = 0;
    if (diff.changes.content) significance += 0.5;
    if (diff.changes.metadata) significance += 0.3;
    if (diff.changes.classification) significance += 0.4;
    if (Math.abs(diff.statistics.contentSizeChange) > 1000) significance += 0.2;
    
    diff.statistics.significanceScore = Math.min(significance, 1.0);

    return diff;


  private async updateVersionMetadata(versionId: string, updates: Partial<EvidenceVersion>): Promise<void> {

    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    
    if (updates.changeType !== undefined) {
      updateFields.push('change_type = ?');
      updateValues.push(updates.changeType);

    
    if (updateFields.length > 0) {
      updateValues.push(versionId);
      await this.databaseService.query(`
        UPDATE evidence_versions SET ${updateFields.join(', ')} WHERE id = ?
      `, updateValues);



  private getDefaultConfig(): EvidenceVersionConfig {
    return {
      enabled: true,
      immutableHistory: true,
      maxVersionsPerEvidence: 100,
      compressionEnabled: true,
      integrityChecking: {
        enabled: true,
        algorithm: 'sha256',
        chainValidation: true

      retention: {
        enabled: true,
        retentionPeriodDays: 2555, // 7 years
        archivalEnabled: true,
        compressionAfterDays: 365

      synchronization: {
        enabled: false,
        conflictResolution: 'last_writer_wins',
        distributedNodes: []

    };


  private initializeService(): void {
    // Initialize database tables if needed
    this.initializeDatabase().catch(error => {
      console.warn('Failed to initialize evidence versioning database:', error);
    });


  private async initializeDatabase(): Promise<void> {

    // Create evidence_versions table
    await this.databaseService.query(`
      CREATE TABLE IF NOT EXISTS evidence_versions (
        id VARCHAR(255) PRIMARY KEY,
        evidence_id VARCHAR(255) NOT NULL,
        version INTEGER NOT NULL,
        parent_version INTEGER,
        branch_name VARCHAR(255),
        content TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        classification VARCHAR(50) NOT NULL,
        filename VARCHAR(255),
        mime_type VARCHAR(255),
        size INTEGER NOT NULL,
        content_hash VARCHAR(255) NOT NULL,
        previous_version_hash VARCHAR(255),
        chain_hash VARCHAR(255) NOT NULL,
        signature VARCHAR(255),
        encrypted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL,
        created_by VARCHAR(255) NOT NULL,
        modified_at TIMESTAMP NOT NULL,
        modified_by VARCHAR(255) NOT NULL,
        change_type VARCHAR(50) NOT NULL,
        change_description TEXT,
        change_reason TEXT,
        tags TEXT DEFAULT '[]',
        retention_expiry TIMESTAMP,
        legal_hold BOOLEAN DEFAULT FALSE,
        compliance_frameworks TEXT DEFAULT '[]',
        audit_requirements TEXT DEFAULT '[]',
        storage_location VARCHAR(500) NOT NULL,
        compression_type VARCHAR(50),
        archival_status VARCHAR(50) DEFAULT 'active',
        UNIQUE(evidence_id, version, branch_name)

    `);

    // Create evidence_version_branches table
    await this.databaseService.query(`
      CREATE TABLE IF NOT EXISTS evidence_version_branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        evidence_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        base_version INTEGER NOT NULL,
        head_version INTEGER NOT NULL,
        description TEXT,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(evidence_id, name)

    `);

    // Create indexes
    await this.databaseService.query(`
      CREATE INDEX IF NOT EXISTS idx_evidence_versions_evidence_id ON evidence_versions(evidence_id)
    `);
    await this.databaseService.query(`
      CREATE INDEX IF NOT EXISTS idx_evidence_versions_version ON evidence_versions(evidence_id, version)
    `);
    await this.databaseService.query(`
      CREATE INDEX IF NOT EXISTS idx_evidence_versions_created_at ON evidence_versions(created_at)
    `);



export default EvidenceVersioningService;