/**
 * Policy Version Service - E17-1753114397372-E7CDD1
 * 
 * Business logic service for policy versioning system.
 * Handles workflows, validation, and complex operations.
 */

import { PolicyVersionDAO } from '../database/policy-version-dao';
import {
  Policy,
  PolicyVersion,
  PolicyVersionComparison,
  PolicyVersionDiff,
  CreatePolicyRequest,
  CreatePolicyVersionRequest,
  UpdatePolicyVersionRequest,
  PublishPolicyVersionRequest,
  PolicyVersionSearchQuery,
  PolicyVersionListResponse,
  PolicyStatus,
  ChangeType,
  PolicyVersionValidation,
  ValidationError,
  ValidationWarning,
  PolicyWorkflowState,
  WorkflowBlocker,
  PolicyVersionAnalytics,
  DiffType,
  DiffImpact
} from '../../packages/core/types/PolicyVersionTypes';

export class PolicyVersionService {
  constructor(private policyVersionDAO: PolicyVersionDAO) {}

  // ============================================================================
  // Policy Management
  // ============================================================================

  async createPolicy(request: CreatePolicyRequest, createdBy: string): Promise<Policy> {
    // Validate policy key uniqueness
    const existingPolicy = await this.policyVersionDAO.getPolicyByKey(request.policyKey);
    if (existingPolicy) {
      throw new Error(`Policy with key '${request.policyKey}' already exists`);
    }

    // Validate policy key format
    if (!this.isValidPolicyKey(request.policyKey)) {
      throw new Error('Policy key must contain only lowercase letters, numbers, hyphens, and underscores');
    }

    return this.policyVersionDAO.createPolicy(request, createdBy);
  }

  async getPolicy(policyId: string): Promise<Policy> {
    const policy = await this.policyVersionDAO.getPolicyById(policyId);
    if (!policy) {
      throw new Error(`Policy with ID ${policyId} not found`);
    }
    return policy;
  }

  async getPolicyByKey(policyKey: string): Promise<Policy> {
    const policy = await this.policyVersionDAO.getPolicyByKey(policyKey);
    if (!policy) {
      throw new Error(`Policy with key '${policyKey}' not found`);
    }
    return policy;
  }

  // ============================================================================
  // Policy Version Management
  // ============================================================================

  async createPolicyVersion(
    policyId: string,
    request: CreatePolicyVersionRequest,
    createdBy: string
  ): Promise<PolicyVersion> {
    // Validate policy exists
    await this.getPolicy(policyId);

    // Validate the request
    const validation = await this.validatePolicyVersionRequest(request);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Create the version
    const version = await this.policyVersionDAO.createPolicyVersion(policyId, request, createdBy);

    // Record initial creation change
    await this.policyVersionDAO.recordVersionChange(
      version.id,
      'create',
      'version',
      null,
      version.version,
      request.changeSummary || 'Initial version creation',
      createdBy
    );

    return version;
  }

  async getPolicyVersion(versionId: string): Promise<PolicyVersion> {
    const version = await this.policyVersionDAO.getPolicyVersionById(versionId);
    if (!version) {
      throw new Error(`Policy version with ID ${versionId} not found`);
    }
    return version;
  }

  async getPolicyVersionByNumber(policyId: string, versionNumber: string): Promise<PolicyVersion> {
    const version = await this.policyVersionDAO.getPolicyVersionByNumber(policyId, versionNumber);
    if (!version) {
      throw new Error(`Policy version ${versionNumber} not found for policy ${policyId}`);
    }
    return version;
  }

  async updatePolicyVersion(
    versionId: string,
    request: UpdatePolicyVersionRequest,
    updatedBy: string
  ): Promise<PolicyVersion> {
    // Get current version
    const currentVersion = await this.getPolicyVersion(versionId);

    // Check if version is in a modifiable state
    if (!this.isVersionModifiable(currentVersion.status)) {
      throw new Error(`Cannot modify policy version in '${currentVersion.status}' status`);
    }

    // Validate the request
    if (request.content) {
      const validation = await this.validatePolicyVersionRequest({ 
        title: request.title || currentVersion.title,
        content: request.content,
        contentType: request.contentType,
        changeType: 'update'
      });
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }
    }

    // Update the version
    const updatedVersion = await this.policyVersionDAO.updatePolicyVersion(versionId, request, updatedBy);

    // Record changes
    await this.recordChanges(currentVersion, updatedVersion, updatedBy);

    return updatedVersion;
  }

  async deletePolicyVersion(versionId: string, userId: string): Promise<void> {
    const version = await this.getPolicyVersion(versionId);
    
    if (version.status !== 'draft') {
      throw new Error('Only draft versions can be deleted');
    }

    const deleted = await this.policyVersionDAO.deletePolicyVersion(versionId);
    if (!deleted) {
      throw new Error(`Failed to delete policy version ${versionId}`);
    }
  }

  // ============================================================================
  // Version Listing and Search
  // ============================================================================

  async listPolicyVersions(
    policyId: string,
    searchQuery: Partial<PolicyVersionSearchQuery> = {}
  ): Promise<PolicyVersionListResponse> {
    // Validate policy exists
    await this.getPolicy(policyId);

    return this.policyVersionDAO.listPolicyVersions(policyId, searchQuery);
  }

  async getCurrentVersion(policyId: string): Promise<PolicyVersion | null> {
    return this.policyVersionDAO.getCurrentPolicyVersion(policyId);
  }

  async getVersionHistory(policyId: string): Promise<PolicyVersion[]> {
    // Validate policy exists
    await this.getPolicy(policyId);

    return this.policyVersionDAO.getVersionHistory(policyId);
  }

  // ============================================================================
  // Version Comparison
  // ============================================================================

  async comparePolicyVersions(
    fromVersionId: string,
    toVersionId: string
  ): Promise<PolicyVersionComparison> {
    const [fromVersion, toVersion] = await Promise.all([
      this.getPolicyVersion(fromVersionId),
      this.getPolicyVersion(toVersionId)
    ]);

    if (fromVersion.policyId !== toVersion.policyId) {
      throw new Error('Cannot compare versions from different policies');
    }

    const changes = this.generateVersionDiff(fromVersion, toVersion);
    const summary = this.summarizeChanges(changes);

    return {
      fromVersion,
      toVersion,
      changes,
      summary
    };
  }

  private generateVersionDiff(fromVersion: PolicyVersion, toVersion: PolicyVersion): PolicyVersionDiff[] {
    const changes: PolicyVersionDiff[] = [];

    // Compare title
    if (fromVersion.title !== toVersion.title) {
      changes.push({
        type: 'modified',
        path: 'title',
        description: 'Policy title changed',
        oldValue: fromVersion.title,
        newValue: toVersion.title,
        impact: 'medium'
      });
    }

    // Compare content sections
    const fromSections = fromVersion.content.sections || [];
    const toSections = toVersion.content.sections || [];

    // Create maps for easier comparison
    const fromSectionMap = new Map(fromSections.map((s, i) => [s.title || `section_${i}`, s]));
    const toSectionMap = new Map(toSections.map((s, i) => [s.title || `section_${i}`, s]));

    // Find added sections
    for (const [title, section] of toSectionMap) {
      if (!fromSectionMap.has(title)) {
        changes.push({
          type: 'added',
          path: `content.sections.${title}`,
          description: `Added section: ${title}`,
          oldValue: null,
          newValue: section.content,
          impact: this.calculateSectionImpact(section)
        });
      }
    }

    // Find removed sections
    for (const [title, section] of fromSectionMap) {
      if (!toSectionMap.has(title)) {
        changes.push({
          type: 'removed',
          path: `content.sections.${title}`,
          description: `Removed section: ${title}`,
          oldValue: section.content,
          newValue: null,
          impact: this.calculateSectionImpact(section)
        });
      }
    }

    // Find modified sections
    for (const [title, fromSection] of fromSectionMap) {
      const toSection = toSectionMap.get(title);
      if (toSection && fromSection.content !== toSection.content) {
        changes.push({
          type: 'modified',
          path: `content.sections.${title}`,
          description: `Modified section: ${title}`,
          oldValue: fromSection.content,
          newValue: toSection.content,
          impact: this.calculateSectionImpact(toSection)
        });
      }
    }

    // Compare compliance frameworks
    const fromFrameworks = new Set(fromVersion.complianceFrameworks);
    const toFrameworks = new Set(toVersion.complianceFrameworks);

    for (const framework of toFrameworks) {
      if (!fromFrameworks.has(framework)) {
        changes.push({
          type: 'added',
          path: 'complianceFrameworks',
          description: `Added compliance framework: ${framework}`,
          oldValue: null,
          newValue: framework,
          impact: 'high'
        });
      }
    }

    for (const framework of fromFrameworks) {
      if (!toFrameworks.has(framework)) {
        changes.push({
          type: 'removed',
          path: 'complianceFrameworks',
          description: `Removed compliance framework: ${framework}`,
          oldValue: framework,
          newValue: null,
          impact: 'high'
        });
      }
    }

    return changes;
  }

  private calculateSectionImpact(section: any): DiffImpact {
    const content = section.content || '';
    const hasLegalKeywords = /\b(must|shall|required|prohibited|forbidden|mandatory)\b/i.test(content);
    
    if (hasLegalKeywords) {
      return 'high';
    } else if (content.length > 500) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private summarizeChanges(changes: PolicyVersionDiff[]) {
    const summary = {
      addedSections: 0,
      removedSections: 0,
      modifiedSections: 0,
      totalChanges: changes.length
    };

    for (const change of changes) {
      if (change.path.includes('content.sections')) {
        switch (change.type) {
        case 'added':
          summary.addedSections++;
          break;
        case 'removed':
          summary.removedSections++;
          break;
        case 'modified':
          summary.modifiedSections++;
          break;
        }
      }
    }

    return summary;
  }

  // ============================================================================
  // Status and Workflow Management
  // ============================================================================

  async publishPolicyVersion(
    versionId: string,
    request: PublishPolicyVersionRequest,
    publishedBy: string
  ): Promise<PolicyVersion> {
    const version = await this.getPolicyVersion(versionId);

    // Validate current status allows publishing
    if (!this.canTransitionTo(version.status, 'published')) {
      throw new Error(`Cannot publish version from '${version.status}' status`);
    }

    // Check workflow state
    const workflowState = await this.getWorkflowState(versionId);
    if (workflowState.blockers.length > 0) {
      const blockerMessages = workflowState.blockers.map(b => b.description).join(', ');
      throw new Error(`Cannot publish due to blockers: ${blockerMessages}`);
    }

    // Update to published status
    
    // If effective date is provided, update it
    if (request.effectiveDate) {
      await this.policyVersionDAO.updatePolicyVersion(
        versionId,
        { effectiveDate: request.effectiveDate },
        publishedBy
      );
    }

    // Record publishing change
    await this.policyVersionDAO.recordVersionChange(
      versionId,
      'status_change',
      'status',
      version.status,
      'published',
      request.publishingNotes || 'Version published',
      publishedBy
    );

    return this.getPolicyVersion(versionId);
  }

  async getWorkflowState(versionId: string): Promise<PolicyWorkflowState> {
    const version = await this.getPolicyVersion(versionId);
    
    const allowedTransitions = this.getAllowedStatusTransitions(version.status);
    const blockers: WorkflowBlocker[] = [];

    // Check for various blockers
    if (version.status === 'draft') {
      // Check if content validation passes
      const validation = await this.validatePolicyVersionRequest({
        title: version.title,
        content: version.content,
        contentType: version.contentType,
        changeType: version.changeType
      });

      if (!validation.isValid) {
        blockers.push({
          type: 'content_validation_error',
          description: `Content validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          resolvable: true,
          resolveAction: 'Fix content validation errors'
        });
      }
    }

    return {
      currentStatus: version.status,
      allowedTransitions,
      requiredApprovals: this.getRequiredApprovals(version.severityLevel),
      currentApprovals: 0, // TODO: Implement approval counting
      pendingReviewers: [], // TODO: Implement reviewer tracking
      blockers
    };
  }

  private getAllowedStatusTransitions(currentStatus: PolicyStatus): PolicyStatus[] {
    const transitions: Record<PolicyStatus, PolicyStatus[]> = {
      draft: ['review', 'published', 'archived'],
      review: ['draft', 'published', 'archived'],
      published: ['deprecated', 'archived'],
      deprecated: ['archived'],
      archived: []
    };

    return transitions[currentStatus] || [];
  }

  private canTransitionTo(fromStatus: PolicyStatus, toStatus: PolicyStatus): boolean {
    const allowedTransitions = this.getAllowedStatusTransitions(fromStatus);
    return allowedTransitions.includes(toStatus);
  }

  private getRequiredApprovals(severityLevel: string): number {
    const approvalMap = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 5
    };
    return approvalMap[severityLevel] || 1;
  }

  // ============================================================================
  // Validation
  // ============================================================================

  private async validatePolicyVersionRequest(
    request: Partial<CreatePolicyVersionRequest>
  ): Promise<PolicyVersionValidation> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate title
    if (!request.title || request.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Title is required',
        code: 'TITLE_REQUIRED',
        severity: 'error'
      });
    } else if (request.title.length > 200) {
      errors.push({
        field: 'title',
        message: 'Title must be 200 characters or less',
        code: 'TITLE_TOO_LONG',
        severity: 'error'
      });
    }

    // Validate content
    if (!request.content) {
      errors.push({
        field: 'content',
        message: 'Content is required',
        code: 'CONTENT_REQUIRED',
        severity: 'error'
      });
    } else {
      if (!request.content.sections || request.content.sections.length === 0) {
        warnings.push({
          field: 'content.sections',
          message: 'Policy should have at least one section',
          code: 'NO_SECTIONS',
          suggestion: 'Add at least one content section'
        });
      }

      // Validate each section
      request.content.sections?.forEach((section, index) => {
        if (!section.title || section.title.trim().length === 0) {
          errors.push({
            field: `content.sections[${index}].title`,
            message: `Section ${index + 1} title is required`,
            code: 'SECTION_TITLE_REQUIRED',
            severity: 'error'
          });
        }

        if (!section.content || section.content.trim().length === 0) {
          errors.push({
            field: `content.sections[${index}].content`,
            message: `Section ${index + 1} content is required`,
            code: 'SECTION_CONTENT_REQUIRED',
            severity: 'error'
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complianceStatus: [] // TODO: Implement compliance validation
    };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private isValidPolicyKey(key: string): boolean {
    return /^[a-z0-9_-]+$/.test(key) && key.length >= 3 && key.length <= 50;
  }

  private isVersionModifiable(status: PolicyStatus): boolean {
    return ['draft', 'review'].includes(status);
  }

  private async recordChanges(
    oldVersion: PolicyVersion,
    newVersion: PolicyVersion,
    updatedBy: string
  ): Promise<void> {
    const changes = [
      { field: 'title', old: oldVersion.title, new: newVersion.title },
      { field: 'content', old: oldVersion.content, new: newVersion.content },
      { field: 'complianceFrameworks', old: oldVersion.complianceFrameworks, new: newVersion.complianceFrameworks },
      { field: 'tags', old: oldVersion.tags, new: newVersion.tags },
      { field: 'severityLevel', old: oldVersion.severityLevel, new: newVersion.severityLevel }
    ];

    for (const change of changes) {
      if (JSON.stringify(change.old) !== JSON.stringify(change.new)) {
        await this.policyVersionDAO.recordVersionChange(
          newVersion.id,
          'update',
          change.field,
          change.old,
          change.new,
          `Updated ${change.field}`,
          updatedBy
        );
      }
    }
  }
}