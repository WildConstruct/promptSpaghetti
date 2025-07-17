// Epic 16.2.1 Template Submission Service
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Pool } from 'pg';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { 
  TemplateSubmission, 
  SubmissionData, 
  ValidationResult, 
  UploadedFile, 
  SubmissionReview,
  SubmissionStatus,
  ValidationSeverity,
  FileType,
  CreateSubmissionSchema,
  UpdateSubmissionSchema,
  SubmissionReviewSchema,
  FileUploadSchema,
  SubmissionDataSchema
} from './submission.types';
import { TemplateStatus } from './types';
import { MarketplaceDAO } from './dao';

@Injectable()
export class SubmissionService {
  private dao: MarketplaceDAO;

  constructor(private pool: Pool) {
    this.dao = new MarketplaceDAO(pool);
  }

  // Create new submission
  async createSubmission(userId: string, data: any): Promise<TemplateSubmission> {
    const validated = CreateSubmissionSchema.parse(data);
    
    // Validate submission data
    const validationResults = await this.validateSubmissionData(validated.submission_data);
    
    // Check if user has permission to create submissions
    if (!(await this.canUserSubmit(userId))) {
      throw new ForbiddenException('User does not have permission to submit templates');
    }

    const submissionId = uuidv4();
    
    // Create or update template if template_id is provided
    let templateId: string;
    if (validated.template_id) {
      // Updating existing template
      const template = await this.dao.getTemplate(validated.template_id);
      if (!template) {
        throw new NotFoundException('Template not found');
      }
      if (template.owner_id !== userId) {
        throw new ForbiddenException('Not authorized to update this template');
      }
      templateId = validated.template_id;
    } else {
      // Creating new template
      const template = await this.dao.createTemplate({
        owner_id: userId,
        title: validated.submission_data.title,
        description: validated.submission_data.description,
        tags: validated.submission_data.tags,
        price_cents: validated.submission_data.price_cents,
        is_ai_generated: validated.submission_data.is_ai_generated,
        claude_compat: validated.submission_data.claude_compat,
        status: TemplateStatus.DRAFT
      });
      templateId = template.id;
    }

    // Get next version number
    const versions = await this.dao.getTemplateVersions(templateId);
    const nextVersionNumber = versions.length + 1;

    // Create submission record
    const submission = await this.pool.query(`
      INSERT INTO template_submissions (
        id, template_id, submitter_id, version_number, status, 
        submission_data, validation_results, submitted_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
      RETURNING *
    `, [
      submissionId,
      templateId,
      userId,
      nextVersionNumber,
      SubmissionStatus.DRAFT,
      JSON.stringify(validated.submission_data),
      JSON.stringify(validationResults)
    ]);

    return this.mapSubmissionResult(submission.rows[0]);
  }

  // Get submission by ID
  async getSubmission(id: string, userId?: string): Promise<TemplateSubmission | null> {
    const result = await this.pool.query(`
      SELECT s.*, t.owner_id, t.title as template_title
      FROM template_submissions s
      JOIN marketplace_templates t ON s.template_id = t.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const submission = result.rows[0];
    
    // Check permissions
    if (userId && submission.submitter_id !== userId && submission.owner_id !== userId) {
      // Only submitter, template owner, or admin can view
      if (!(await this.isUserAdmin(userId))) {
        throw new ForbiddenException('Not authorized to view this submission');
      }
    }

    return this.mapSubmissionResult(submission);
  }

  // Update submission
  async updateSubmission(id: string, userId: string, updates: any): Promise<TemplateSubmission> {
    const validated = UpdateSubmissionSchema.parse(updates);
    
    const submission = await this.getSubmission(id, userId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.submitter_id !== userId) {
      throw new ForbiddenException('Not authorized to update this submission');
    }

    if (submission.status === SubmissionStatus.APPROVED || submission.status === SubmissionStatus.REJECTED) {
      throw new BadRequestException('Cannot update submission after final review');
    }

    // Merge submission data if provided
    let updatedData = submission.submission_data;
    if (validated.submission_data) {
      updatedData = { ...updatedData, ...validated.submission_data };
    }

    // Re-validate if submission data changed
    let validationResults = submission.validation_results;
    if (validated.submission_data) {
      validationResults = await this.validateSubmissionData(updatedData);
    }

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (validated.submission_data) {
      updateFields.push(`submission_data = $${paramIndex++}`);
      updateValues.push(JSON.stringify(updatedData));
      updateFields.push(`validation_results = $${paramIndex++}`);
      updateValues.push(JSON.stringify(validationResults));
    }

    if (validated.status) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(validated.status);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const result = await this.pool.query(`
      UPDATE template_submissions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, updateValues);

    return this.mapSubmissionResult(result.rows[0]);
  }

  // Submit for review
  async submitForReview(id: string, userId: string): Promise<TemplateSubmission> {
    const submission = await this.getSubmission(id, userId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.submitter_id !== userId) {
      throw new ForbiddenException('Not authorized to submit this for review');
    }

    if (submission.status !== SubmissionStatus.DRAFT && submission.status !== SubmissionStatus.CHANGES_REQUESTED) {
      throw new BadRequestException('Can only submit draft or change-requested submissions');
    }

    // Check for blocking validation errors
    const hasErrors = submission.validation_results.some(r => r.severity === ValidationSeverity.ERROR);
    if (hasErrors) {
      throw new BadRequestException('Cannot submit with validation errors');
    }

    return this.updateSubmission(id, userId, { 
      status: SubmissionStatus.SUBMITTED,
      submitted_at: new Date()
    });
  }

  // Get user's submissions
  async getUserSubmissions(userId: string, limit: number = 50): Promise<TemplateSubmission[]> {
    const result = await this.pool.query(`
      SELECT s.*, t.title as template_title
      FROM template_submissions s
      JOIN marketplace_templates t ON s.template_id = t.id
      WHERE s.submitter_id = $1
      ORDER BY s.created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(this.mapSubmissionResult);
  }

  // Get submissions for review (admin only)
  async getSubmissionsForReview(userId: string, status?: SubmissionStatus, limit: number = 50): Promise<TemplateSubmission[]> {
    if (!(await this.isUserAdmin(userId))) {
      throw new ForbiddenException('Not authorized to view submissions for review');
    }

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`s.status = $${paramIndex++}`);
      params.push(status);
    } else {
      conditions.push(`s.status IN ($${paramIndex++}, $${paramIndex++})`);
      params.push(SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW);
    }

    params.push(limit);

    const result = await this.pool.query(`
      SELECT s.*, t.title as template_title, u.name as submitter_name
      FROM template_submissions s
      JOIN marketplace_templates t ON s.template_id = t.id
      JOIN users u ON s.submitter_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.submitted_at ASC
      LIMIT $${paramIndex}
    `, params);

    return result.rows.map(this.mapSubmissionResult);
  }

  // Create submission review
  async createReview(submissionId: string, reviewerId: string, reviewData: any): Promise<SubmissionReview> {
    if (!(await this.isUserAdmin(reviewerId))) {
      throw new ForbiddenException('Not authorized to review submissions');
    }

    const validated = SubmissionReviewSchema.parse(reviewData);
    
    const submission = await this.getSubmission(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.status !== SubmissionStatus.SUBMITTED && submission.status !== SubmissionStatus.UNDER_REVIEW) {
      throw new BadRequestException('Submission is not in a reviewable state');
    }

    const reviewId = uuidv4();
    
    // Create review record
    const review = await this.pool.query(`
      INSERT INTO submission_reviews (
        id, submission_id, reviewer_id, decision, score, comments, detailed_feedback, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `, [
      reviewId,
      submissionId,
      reviewerId,
      validated.decision,
      validated.score,
      validated.comments,
      JSON.stringify(validated.detailed_feedback)
    ]);

    // Update submission status
    let newStatus: SubmissionStatus;
    switch (validated.decision) {
      case 'approved':
        newStatus = SubmissionStatus.APPROVED;
        await this.publishApprovedSubmission(submissionId);
        break;
      case 'rejected':
        newStatus = SubmissionStatus.REJECTED;
        break;
      case 'changes_requested':
        newStatus = SubmissionStatus.CHANGES_REQUESTED;
        break;
    }

    await this.pool.query(`
      UPDATE template_submissions 
      SET status = $1, reviewer_id = $2, review_comments = $3, review_score = $4, reviewed_at = NOW()
      WHERE id = $5
    `, [newStatus, reviewerId, validated.comments, validated.score, submissionId]);

    return this.mapReviewResult(review.rows[0]);
  }

  // File upload handling
  async uploadFile(submissionId: string, userId: string, fileData: any): Promise<UploadedFile> {
    const submission = await this.getSubmission(submissionId, userId);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.submitter_id !== userId) {
      throw new ForbiddenException('Not authorized to upload files for this submission');
    }

    const validated = FileUploadSchema.parse(fileData);
    
    const fileId = uuidv4();
    const s3Key = `submissions/${submissionId}/files/${fileId}/${validated.filename}`;
    
    // Store file metadata
    const result = await this.pool.query(`
      INSERT INTO submission_files (
        id, submission_id, file_type, filename, file_size, mime_type, 
        s3_key, validation_status, uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
      RETURNING *
    `, [
      fileId, submissionId, validated.file_type, validated.filename, 
      validated.file_size, validated.mime_type, s3Key
    ]);

    return this.mapFileResult(result.rows[0]);
  }

  // Validate submission data
  private async validateSubmissionData(data: SubmissionData): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Validate required fields
    if (!data.title?.trim()) {
      results.push({
        id: uuidv4(),
        rule_id: 'required_title',
        severity: ValidationSeverity.ERROR,
        message: 'Title is required',
        auto_fixable: false
      });
    }

    if (!data.description?.trim() || data.description.length < 10) {
      results.push({
        id: uuidv4(),
        rule_id: 'required_description',
        severity: ValidationSeverity.ERROR,
        message: 'Description must be at least 10 characters',
        auto_fixable: false
      });
    }

    if (!data.tags?.length) {
      results.push({
        id: uuidv4(),
        rule_id: 'required_tags',
        severity: ValidationSeverity.ERROR,
        message: 'At least one tag is required',
        auto_fixable: false
      });
    }

    if (!data.categories?.length) {
      results.push({
        id: uuidv4(),
        rule_id: 'required_categories',
        severity: ValidationSeverity.ERROR,
        message: 'At least one category is required',
        auto_fixable: false
      });
    }

    // Validate graph_json structure
    if (!data.graph_json || typeof data.graph_json !== 'object') {
      results.push({
        id: uuidv4(),
        rule_id: 'invalid_graph_json',
        severity: ValidationSeverity.ERROR,
        message: 'Valid graph JSON is required',
        auto_fixable: false
      });
    }

    // Validate price
    if (data.price_cents < 0) {
      results.push({
        id: uuidv4(),
        rule_id: 'invalid_price',
        severity: ValidationSeverity.ERROR,
        message: 'Price cannot be negative',
        auto_fixable: true,
        suggested_fix: 'Set price to 0 for free template'
      });
    }

    // Validate token estimate
    if (data.token_per_run_estimate < 0) {
      results.push({
        id: uuidv4(),
        rule_id: 'invalid_token_estimate',
        severity: ValidationSeverity.WARNING,
        message: 'Token estimate should be positive',
        auto_fixable: true,
        suggested_fix: 'Set to 0 if unknown'
      });
    }

    // Validate use cases
    if (!data.intended_use_cases?.length) {
      results.push({
        id: uuidv4(),
        rule_id: 'required_use_cases',
        severity: ValidationSeverity.ERROR,
        message: 'At least one intended use case is required',
        auto_fixable: false
      });
    }

    // Validate examples
    if (!data.example_outputs?.length) {
      results.push({
        id: uuidv4(),
        rule_id: 'required_examples',
        severity: ValidationSeverity.ERROR,
        message: 'At least one example output is required',
        auto_fixable: false
      });
    }

    // Check for common issues
    if (data.title && data.title.length > 100) {
      results.push({
        id: uuidv4(),
        rule_id: 'title_too_long',
        severity: ValidationSeverity.WARNING,
        message: 'Title is very long and may be truncated',
        auto_fixable: false
      });
    }

    if (data.tags && data.tags.length > 10) {
      results.push({
        id: uuidv4(),
        rule_id: 'too_many_tags',
        severity: ValidationSeverity.WARNING,
        message: 'Too many tags may reduce discoverability',
        auto_fixable: false
      });
    }

    return results;
  }

  // Publish approved submission
  private async publishApprovedSubmission(submissionId: string): Promise<void> {
    const submission = await this.getSubmission(submissionId);
    if (!submission) return;

    const data = submission.submission_data;
    
    // Create template version
    const hashContent = JSON.stringify(data.graph_json) + (data.prompt_yaml || '');
    const hash = crypto.createHash('sha256').update(hashContent).digest('hex');

    const version = await this.dao.createVersion({
      template_id: submission.template_id,
      version_number: submission.version_number,
      claude_model: data.claude_model,
      graph_json: data.graph_json,
      prompt_yaml: data.prompt_yaml,
      changelog_md: data.changelog_md,
      hash,
      token_per_run_estimate: data.token_per_run_estimate,
      safety_score: 0.5 // Default, to be calculated
    });

    // Update template
    await this.dao.updateTemplate(submission.template_id, {
      title: data.title,
      description: data.description,
      tags: data.tags,
      price_cents: data.price_cents,
      is_ai_generated: data.is_ai_generated,
      claude_compat: data.claude_compat,
      status: TemplateStatus.LISTED,
      current_version_id: version.id
    });

    // Update category mappings
    await this.updateTemplateCategories(submission.template_id, data.categories);
  }

  // Helper methods
  private async canUserSubmit(userId: string): Promise<boolean> {
    // Check if user exists and is verified
    const result = await this.pool.query(`
      SELECT verified FROM users WHERE id = $1
    `, [userId]);
    
    return result.rows.length > 0 && result.rows[0].verified;
  }

  private async isUserAdmin(userId: string): Promise<boolean> {
    const result = await this.pool.query(`
      SELECT role FROM users WHERE id = $1
    `, [userId]);
    
    return result.rows.length > 0 && result.rows[0].role === 'admin';
  }

  private async updateTemplateCategories(templateId: string, categoryIds: string[]): Promise<void> {
    // Remove existing mappings
    await this.pool.query(`
      DELETE FROM template_category_mappings WHERE template_id = $1
    `, [templateId]);

    // Add new mappings
    for (const categoryId of categoryIds) {
      await this.pool.query(`
        INSERT INTO template_category_mappings (template_id, category_id) 
        VALUES ($1, $2)
      `, [templateId, categoryId]);
    }
  }

  private mapSubmissionResult(row: any): TemplateSubmission {
    return {
      id: row.id,
      template_id: row.template_id,
      submitter_id: row.submitter_id,
      version_number: row.version_number,
      status: row.status,
      submission_data: JSON.parse(row.submission_data),
      validation_results: JSON.parse(row.validation_results),
      reviewer_id: row.reviewer_id,
      review_comments: row.review_comments,
      review_score: row.review_score,
      submitted_at: row.submitted_at,
      reviewed_at: row.reviewed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private mapReviewResult(row: any): SubmissionReview {
    return {
      id: row.id,
      submission_id: row.submission_id,
      reviewer_id: row.reviewer_id,
      decision: row.decision,
      score: row.score,
      comments: row.comments,
      detailed_feedback: JSON.parse(row.detailed_feedback),
      created_at: row.created_at
    };
  }

  private mapFileResult(row: any): UploadedFile {
    return {
      id: row.id,
      submission_id: row.submission_id,
      file_type: row.file_type,
      filename: row.filename,
      file_size: row.file_size,
      mime_type: row.mime_type,
      s3_key: row.s3_key,
      validation_status: row.validation_status,
      validation_errors: row.validation_errors ? JSON.parse(row.validation_errors) : [],
      uploaded_at: row.uploaded_at
    };
  }
}