// Epic 16.1.5 - License Management Service
import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import {
  TemplateLicense,
  LicenseTransfer,
  LicenseType,
  LicenseStatus
} from './transaction.types.js';
import { DatabaseService } from '../database/database.service.js';

export class LicenseService {
  private db: DatabaseService;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.db = fastify.db;
  }

  // =============================================
  // License Generation and Management
  // =============================================

  async generateLicense(
    purchaseId: string,
    templateId: string,
    versionId: string,
    buyerId: string,
    licenseType: LicenseType
  ): Promise<TemplateLicense> {
    const licenseId = crypto.randomUUID();
    const licenseKey = this.generateLicenseKey(templateId, buyerId);
    
    const license: TemplateLicense = {
      id: licenseId,
      purchase_id: purchaseId,
      template_id: templateId,
      version_id: versionId,
      buyer_id: buyerId,
      license_type: licenseType,
      license_key: licenseKey,
      status: LicenseStatus.ACTIVE,
      usage_limit: this.getLicenseUsageLimit(licenseType),
      usage_count: 0,
      valid_from: new Date(),
      valid_until: this.getLicenseExpiration(licenseType),
      transfer_count: 0,
      max_transfers: this.getMaxTransfers(licenseType),
      restrictions: this.getLicenseRestrictions(licenseType),
      metadata: this.getLicenseMetadata(licenseType),
      created_at: new Date(),
      updated_at: new Date()
    };

    await this.saveLicense(license);
    return license;
  }

  async validateLicense(
    licenseKey: string,
    templateId: string,
    userId: string,
    incrementUsage: boolean = true
  ): Promise<{
    valid: boolean;
    license?: TemplateLicense;
    reason?: string;
  }> {
    try {
      const result = await this.db.query(
        `SELECT * FROM template_licenses 
         WHERE license_key = ? AND template_id = ? AND buyer_id = ?`,
        [licenseKey, templateId, userId]
      );

      if (result.length === 0) {
        return { valid: false, reason: 'License not found' };
      }

      const license = this.parseLicense(result[0]);

      // Check license status
      if (license.status !== LicenseStatus.ACTIVE) {
        return { 
          valid: false, 
          reason: `License is ${license.status}`,
          license 
        };
      }

      // Check expiration
      if (license.valid_until && new Date() > license.valid_until) {
        await this.expireLicense(license.id);
        return { 
          valid: false, 
          reason: 'License has expired',
          license 
        };
      }

      // Check usage limits
      if (license.usage_limit && license.usage_count >= license.usage_limit) {
        return { 
          valid: false, 
          reason: 'Usage limit exceeded',
          license 
        };
      }

      // Increment usage if requested
      if (incrementUsage) {
        await this.incrementUsage(license.id);
        license.usage_count += 1;
        license.last_used_at = new Date();
      }

      return { valid: true, license };

    } catch (error) {
      this.fastify.log.error('License validation error:', error);
      return { valid: false, reason: 'Validation failed' };
    }
  }

  async getLicensesByUser(
    userId: string,
    filters: {
      templateId?: string;
      status?: LicenseStatus;
      licenseType?: LicenseType;
      expiring?: boolean; // Expiring in next 30 days
    } = {},
    pagination: {
      page: number;
      limit: number;
    } = { page: 1, limit: 20 }
  ): Promise<{
    licenses: TemplateLicense[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    let whereClause = 'buyer_id = ?';
    const params = [userId];

    if (filters.templateId) {
      whereClause += ' AND template_id = ?';
      params.push(filters.templateId);
    }

    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.licenseType) {
      whereClause += ' AND license_type = ?';
      params.push(filters.licenseType);
    }

    if (filters.expiring) {
      whereClause += ' AND valid_until IS NOT NULL AND valid_until <= datetime("now", "+30 days")';
    }

    const offset = (pagination.page - 1) * pagination.limit;

    const licenses = await this.db.query(
      `SELECT * FROM template_licenses 
       WHERE ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, pagination.limit, offset]
    );

    const totalResult = await this.db.query(
      `SELECT COUNT(*) as count FROM template_licenses WHERE ${whereClause}`,
      params
    );

    const total = totalResult[0].count;
    const hasMore = offset + pagination.limit < total;

    return {
      licenses: licenses.map(this.parseLicense),
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasMore
    };
  }

  // =============================================
  // License Transfer Management
  // =============================================

  async createTransferRequest(
    licenseId: string,
    fromUserId: string,
    toUserEmail: string,
    reason: string
  ): Promise<LicenseTransfer> {
    // Verify license ownership and transfer eligibility
    const license = await this.getLicenseById(licenseId);
    if (!license || license.buyer_id !== fromUserId) {
      throw new Error('License not found or not owned by user');
    }

    if (license.transfer_count >= license.max_transfers) {
      throw new Error('Maximum transfers exceeded for this license');
    }

    if (license.status !== LicenseStatus.ACTIVE) {
      throw new Error('Only active licenses can be transferred');
    }

    // Find target user
    const userResult = await this.db.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [toUserEmail]
    );

    if (userResult.length === 0) {
      throw new Error('Target user not found');
    }

    const toUser = userResult[0];
    const transferId = crypto.randomUUID();

    const transfer: LicenseTransfer = {
      id: transferId,
      license_id: licenseId,
      from_user_id: fromUserId,
      to_user_id: toUser.id,
      reason,
      created_at: new Date()
    };

    await this.db.query(
      `INSERT INTO license_transfers 
       (id, license_id, from_user_id, to_user_id, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        transferId, licenseId, fromUserId, toUser.id, reason, transfer.created_at
      ]
    );

    // Send notification to target user (placeholder)
    this.fastify.log.info(`License transfer request created: ${transferId}`);

    return transfer;
  }

  async approveTransfer(
    transferId: string,
    adminUserId: string
  ): Promise<void> {
    const transfer = await this.getTransferById(transferId);
    if (!transfer) {
      throw new Error('Transfer request not found');
    }

    if (transfer.approved_at) {
      throw new Error('Transfer already processed');
    }

    const license = await this.getLicenseById(transfer.license_id);
    if (!license) {
      throw new Error('License not found');
    }

    // Update transfer record
    await this.db.query(
      `UPDATE license_transfers 
       SET approved_by = ?, approved_at = datetime('now')
       WHERE id = ?`,
      [adminUserId, transferId]
    );

    // Transfer the license
    await this.db.query(
      `UPDATE template_licenses 
       SET buyer_id = ?, transfer_count = transfer_count + 1, updated_at = datetime('now')
       WHERE id = ?`,
      [transfer.to_user_id, transfer.license_id]
    );

    this.fastify.log.info(`License transferred: ${transfer.license_id} from ${transfer.from_user_id} to ${transfer.to_user_id}`);
  }

  // =============================================
  // License Status Management
  // =============================================

  async suspendLicense(
    licenseId: string,
    reason: string,
    adminUserId?: string
  ): Promise<void> {
    await this.updateLicenseStatus(licenseId, LicenseStatus.SUSPENDED, {
      suspension_reason: reason,
      suspended_by: adminUserId,
      suspended_at: new Date().toISOString()
    });
  }

  async revokeLicense(
    licenseId: string,
    reason: string,
    adminUserId?: string
  ): Promise<void> {
    await this.updateLicenseStatus(licenseId, LicenseStatus.REVOKED, {
      revocation_reason: reason,
      revoked_by: adminUserId,
      revoked_at: new Date().toISOString()
    });
  }

  async reactivateLicense(
    licenseId: string,
    adminUserId?: string
  ): Promise<void> {
    const license = await this.getLicenseById(licenseId);
    if (!license) {
      throw new Error('License not found');
    }

    // Check if license is still valid (not expired)
    if (license.valid_until && new Date() > license.valid_until) {
      throw new Error('Cannot reactivate expired license');
    }

    await this.updateLicenseStatus(licenseId, LicenseStatus.ACTIVE, {
      reactivated_by: adminUserId,
      reactivated_at: new Date().toISOString()
    });
  }

  // =============================================
  // License Analytics and Reporting
  // =============================================

  async getLicenseAnalytics(
    templateId?: string,
    period: string = '30d'
  ): Promise<{
    totalLicenses: number;
    activeLicenses: number;
    licensesByType: Record<LicenseType, number>;
    usageStats: {
      totalUsage: number;
      averageUsage: number;
      topUsers: Array<{ userId: string; usage: number }>;
    };
    transferStats: {
      totalTransfers: number;
      pendingTransfers: number;
    };
  }> {
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const daysBack = periodDays[period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    let whereClause = 'created_at >= ?';
    const params = [startDate.toISOString()];

    if (templateId) {
      whereClause += ' AND template_id = ?';
      params.push(templateId);
    }

    // Get license counts
    const licenseCounts = await this.db.query(
      `SELECT 
         COUNT(*) as total_licenses,
         COUNT(CASE WHEN status = 'active' THEN 1 END) as active_licenses
       FROM template_licenses 
       WHERE ${whereClause}`,
      params
    );

    // Get licenses by type
    const licensesByType = await this.db.query(
      `SELECT license_type, COUNT(*) as count 
       FROM template_licenses 
       WHERE ${whereClause}
       GROUP BY license_type`,
      params
    );

    // Get usage statistics
    const usageStats = await this.db.query(
      `SELECT 
         SUM(usage_count) as total_usage,
         AVG(usage_count) as average_usage
       FROM template_licenses 
       WHERE ${whereClause}`,
      params
    );

    // Get top users by usage
    const topUsers = await this.db.query(
      `SELECT buyer_id as userId, SUM(usage_count) as usage
       FROM template_licenses 
       WHERE ${whereClause}
       GROUP BY buyer_id 
       ORDER BY usage DESC 
       LIMIT 10`,
      params
    );

    // Get transfer statistics
    const transferStats = await this.db.query(
      `SELECT 
         COUNT(*) as total_transfers,
         COUNT(CASE WHEN approved_at IS NULL THEN 1 END) as pending_transfers
       FROM license_transfers lt
       JOIN template_licenses tl ON lt.license_id = tl.id
       WHERE tl.created_at >= ?`,
      [startDate.toISOString()]
    );

    return {
      totalLicenses: licenseCounts[0]?.total_licenses || 0,
      activeLicenses: licenseCounts[0]?.active_licenses || 0,
      licensesByType: licensesByType.reduce((acc, row) => ({
        ...acc,
        [row.license_type]: row.count
      }), {} as Record<LicenseType, number>),
      usageStats: {
        totalUsage: usageStats[0]?.total_usage || 0,
        averageUsage: Math.round(usageStats[0]?.average_usage || 0),
        topUsers: topUsers || []
      },
      transferStats: {
        totalTransfers: transferStats[0]?.total_transfers || 0,
        pendingTransfers: transferStats[0]?.pending_transfers || 0
      }
    };
  }

  // =============================================
  // Helper Methods
  // =============================================

  private generateLicenseKey(templateId: string, userId: string): string {
    const timestamp = Date.now().toString(36);
    const templateHash = crypto
      .createHash('md5')
      .update(templateId)
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();
    const userHash = crypto
      .createHash('md5')
      .update(userId)
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();

    return `${templateHash}-${userHash}-${timestamp.toUpperCase()}-${random}`;
  }

  private getLicenseUsageLimit(licenseType: LicenseType): number | undefined {
    const limits = {
      [LicenseType.PERSONAL]: 100,
      [LicenseType.COMMERCIAL]: 1000,
      [LicenseType.ENTERPRISE]: 10000,
      [LicenseType.EDUCATIONAL]: 50,
      [LicenseType.UNLIMITED]: undefined
    };
    return limits[licenseType];
  }

  private getLicenseExpiration(licenseType: LicenseType): Date | undefined {
    if (licenseType === LicenseType.UNLIMITED) return undefined;
    
    const now = new Date();
    const expiration = new Date(now);
    
    // Different license types have different validity periods
    switch (licenseType) {
    case LicenseType.EDUCATIONAL:
      expiration.setFullYear(now.getFullYear() + 1); // 1 year for educational
      break;
    default:
      expiration.setFullYear(now.getFullYear() + 5); // 5 years for others
      break;
    }
    
    return expiration;
  }

  private getMaxTransfers(licenseType: LicenseType): number {
    const transfers = {
      [LicenseType.PERSONAL]: 1,
      [LicenseType.COMMERCIAL]: 3,
      [LicenseType.ENTERPRISE]: 10,
      [LicenseType.EDUCATIONAL]: 1,
      [LicenseType.UNLIMITED]: 5
    };
    return transfers[licenseType] || 1;
  }

  private getLicenseRestrictions(licenseType: LicenseType): Record<string, any> {
    const restrictions = {
      [LicenseType.PERSONAL]: {
        commercial_use: false,
        redistribution: false,
        modification: true,
        attribution_required: false
      },
      [LicenseType.COMMERCIAL]: {
        commercial_use: true,
        redistribution: false,
        modification: true,
        attribution_required: false
      },
      [LicenseType.ENTERPRISE]: {
        commercial_use: true,
        redistribution: true,
        modification: true,
        white_label: true,
        attribution_required: false
      },
      [LicenseType.EDUCATIONAL]: {
        commercial_use: false,
        redistribution: false,
        modification: true,
        educational_only: true,
        attribution_required: true
      },
      [LicenseType.UNLIMITED]: {
        commercial_use: true,
        redistribution: true,
        modification: true,
        white_label: true,
        attribution_required: false
      }
    };
    return restrictions[licenseType] || {};
  }

  private getLicenseMetadata(licenseType: LicenseType): Record<string, any> {
    return {
      license_version: '1.0',
      generated_by: 'system',
      license_terms_url: `/legal/license-terms/${licenseType}`,
      support_level: licenseType === LicenseType.ENTERPRISE ? 'premium' : 'standard'
    };
  }

  private async saveLicense(license: TemplateLicense): Promise<void> {
    await this.db.query(
      `INSERT INTO template_licenses 
       (id, purchase_id, template_id, version_id, buyer_id, license_type, license_key, 
        status, usage_limit, usage_count, valid_from, valid_until, transfer_count, 
        max_transfers, restrictions, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        license.id, license.purchase_id, license.template_id, license.version_id,
        license.buyer_id, license.license_type, license.license_key, license.status,
        license.usage_limit, license.usage_count, license.valid_from, license.valid_until,
        license.transfer_count, license.max_transfers, JSON.stringify(license.restrictions),
        JSON.stringify(license.metadata), license.created_at, license.updated_at
      ]
    );
  }

  private async incrementUsage(licenseId: string): Promise<void> {
    await this.db.query(
      `UPDATE template_licenses 
       SET usage_count = usage_count + 1, last_used_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ?`,
      [licenseId]
    );
  }

  private async expireLicense(licenseId: string): Promise<void> {
    await this.updateLicenseStatus(licenseId, LicenseStatus.EXPIRED);
  }

  private async updateLicenseStatus(
    licenseId: string, 
    status: LicenseStatus,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const license = await this.getLicenseById(licenseId);
    if (!license) {
      throw new Error('License not found');
    }

    const updatedMetadata = { ...license.metadata, ...metadata };

    await this.db.query(
      `UPDATE template_licenses 
       SET status = ?, metadata = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [status, JSON.stringify(updatedMetadata), licenseId]
    );
  }

  private async getLicenseById(licenseId: string): Promise<TemplateLicense | null> {
    const result = await this.db.query(
      'SELECT * FROM template_licenses WHERE id = ?',
      [licenseId]
    );
    
    return result.length > 0 ? this.parseLicense(result[0]) : null;
  }

  private async getTransferById(transferId: string): Promise<LicenseTransfer | null> {
    const result = await this.db.query(
      'SELECT * FROM license_transfers WHERE id = ?',
      [transferId]
    );
    
    return result.length > 0 ? result[0] : null;
  }

  private parseLicense(row: any): TemplateLicense {
    return {
      ...row,
      restrictions: JSON.parse(row.restrictions || '{}'),
      metadata: JSON.parse(row.metadata || '{}'),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      valid_from: new Date(row.valid_from),
      valid_until: row.valid_until ? new Date(row.valid_until) : undefined,
      last_used_at: row.last_used_at ? new Date(row.last_used_at) : undefined
    };
  }
}