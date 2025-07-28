/**
 * Recovery Code Service - Epic 19 Implementation
 * Secure generation, storage, and management of MFA backup recovery codes
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

}
export interface RecoveryCode {
  id: string;
  userId: string;
  code: string; // Plaintext for display, hashed for storage
  hashedCode: string;
  used: boolean;
  usedAt?: Date;
  usedFromIP?: string;
  createdAt: Date;
  expiresAt?: Date;
}
}

}
export interface RecoveryCodeSet {
  id: string;
  userId: string;
  codes: RecoveryCode[];
  createdAt: Date;
  generatedBy: string; // user action, admin, or system
  metadata: {
    generationReason: string;
    replacedSetId?: string;
    deviceFingerprint?: string;
}
  };
}

}
export interface RecoveryCodeUsage {
  codeId: string;
  userId: string;
  usedAt: Date;
  sourceIP: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
}
}

}
export interface RecoveryCodeGenerationOptions {
  count?: number;
  length?: number;
  includeNumbers?: boolean;
  includeLetters?: boolean;
  excludeSimilar?: boolean;
  expirationDays?: number;
  generatedBy: string;
  reason: string;
  deviceFingerprint?: string;
}
}

export class RecoveryCodeService {
  private readonly defaultCodeCount = 10;
  private readonly defaultCodeLength = 8;
  private readonly saltRounds = 12;
  
  // Characters that could be confused (0, O, 1, l, I)
  private readonly similarChars = '01OlI';
  private readonly numberChars = '23456789';
  private readonly letterChars = 'ABCDEFGHJKMNPQRSTUVWXYZ';

  /**
   * Generate a new set of recovery codes for a user
   */
  async generateRecoveryCodes(
    userId: string, 
    options: RecoveryCodeGenerationOptions
  ): Promise<{ codes: string[]; setId: string }> {

    const {
      count = this.defaultCodeCount,
      length = this.defaultCodeLength,
      includeNumbers = true,
      includeLetters = true,
      excludeSimilar = true,
      expirationDays,
      generatedBy,
      reason,
      deviceFingerprint
    } = options;

    // Validate inputs
    if (count < 5 || count > 20) {
      throw new Error('Recovery code count must be between 5 and 20');
    }
    if (length < 6 || length > 12) {
      throw new Error('Recovery code length must be between 6 and 12');
    }

    // Build character set
    let charset = '';
    if (includeNumbers) charset += excludeSimilar ? this.numberChars : '0123456789';
    if (includeLetters) charset += excludeSimilar ? this.letterChars : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    if (!charset) {
      throw new Error('At least one character type must be included');
    }

    // Generate unique codes
    const codes: string[] = [];
    const codeSet = new Set<string>();

    while (codes.length < count) {
      const code = this.generateSingleCode(length, charset);
      if (!codeSet.has(code)) {
        codes.push(code);
        codeSet.add(code);
      }
    }

    // Hash codes for storage
    const hashedCodes = await Promise.all(
      codes.map(async (code, index) => {
        const hashedCode = await bcrypt.hash(code, this.saltRounds);
        return {
          id: this.generateCodeId(),
          userId,
          code, // Will be removed before storage
          hashedCode,
          used: false,
          createdAt: new Date(),
          expiresAt: expirationDays ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000) : undefined
        } as RecoveryCode;
  }
    );

    // Create recovery code set
    const setId = this.generateSetId();
    const recoverySet: RecoveryCodeSet = {
      id: setId,
      userId,
      codes: hashedCodes.map(c => ({ ...c, code: '[REDACTED]' })) as RecoveryCode[], // Remove plaintext
      createdAt: new Date(),
      generatedBy,
      metadata: {
        generationReason: reason,
        deviceFingerprint
      }
    };

    // Store recovery set (implementation would persist to database)
    await this.storeRecoverySet(recoverySet);

    // Invalidate previous recovery codes
    await this.invalidatePreviousRecoveryCodes(userId, setId);

    // Log generation event
    await this.logRecoveryCodeEvent({
      userId,
      action: 'codes_generated',
      setId,
      metadata: { count, generatedBy, reason }
    });

    return { codes, setId };
  }

  /**
   * Verify and use a recovery code
   */
  async useRecoveryCode(
    userId: string, 
    code: string, 
    sourceIP: string, 
    userAgent: string
  ): Promise<{ success: boolean; remainingCodes: number; message: string }> {

    // Get active recovery codes for user
    const activeCodes = await this.getActiveRecoveryCodes(userId);
    
    if (activeCodes.length === 0) {
      await this.logRecoveryCodeUsage({
        codeId: 'none',
        userId,
        usedAt: new Date(),
        sourceIP,
        userAgent,
        success: false,
        failureReason: 'no_active_codes'
      });
      
      return {
        success: false,
        remainingCodes: 0,
        message: 'No active recovery codes found. Please generate new codes.'
      };
    }

    // Try to match the provided code
    for (const recoveryCode of activeCodes) {
      if (recoveryCode.used) continue;

      // Check if code has expired
      if (recoveryCode.expiresAt && recoveryCode.expiresAt < new Date()) {
        continue;
      }

      // Verify code
      const isMatch = await bcrypt.compare(code, recoveryCode.hashedCode);
      
      if (isMatch) {
        // Mark code as used
        await this.markCodeAsUsed(recoveryCode.id, sourceIP, userAgent);
        
        // Count remaining codes
        const remainingCodes = activeCodes.filter(c => 
          !c.used && c.id !== recoveryCode.id && 
          (!c.expiresAt || c.expiresAt > new Date())
        ).length;

        // Log successful usage
        await this.logRecoveryCodeUsage({
          codeId: recoveryCode.id,
          userId,
          usedAt: new Date(),
          sourceIP,
          userAgent,
          success: true
        });

        // Warn if running low on codes
        let message = 'Recovery code verified successfully.';
        if (remainingCodes <= 2) {
          message += ` Warning: Only ${remainingCodes} recovery codes remaining. Consider generating new codes.`;
        }

        return {
          success: true,
          remainingCodes,
          message
        };
      }
    }

    // No matching code found
    await this.logRecoveryCodeUsage({
      codeId: 'invalid',
      userId,
      usedAt: new Date(),
      sourceIP,
      userAgent,
      success: false,
      failureReason: 'invalid_code'
    });

    return {
      success: false,
      remainingCodes: activeCodes.filter(c => 
        !c.used && (!c.expiresAt || c.expiresAt > new Date())
      ).length,
      message: 'Invalid recovery code. Please check the code and try again.'
    };
  }

  /**
   * Get recovery code status for a user
   */
  async getRecoveryCodeStatus(userId: string): Promise<{
    hasActiveCodes: boolean;
    totalCodes: number;
    usedCodes: number;
    remainingCodes: number;
    expiringCodes: number;
    lastGenerated?: Date;
    lastUsed?: Date;
  }> {

    const activeCodes = await this.getActiveRecoveryCodes(userId);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const usedCodes = activeCodes.filter(c => c.used).length;
    const remainingCodes = activeCodes.filter(c => 
      !c.used && (!c.expiresAt || c.expiresAt > now)
    ).length;
    const expiringCodes = activeCodes.filter(c => 
      !c.used && c.expiresAt && c.expiresAt <= thirtyDaysFromNow && c.expiresAt > now
    ).length;

    const lastGenerated = activeCodes.length > 0 ? 
      Math.max(...activeCodes.map(c => c.createdAt.getTime())) : undefined;
    
    const usedCodeDates = activeCodes.filter(c => c.usedAt).map(c => c.usedAt!.getTime());
    const lastUsed = usedCodeDates.length > 0 ? Math.max(...usedCodeDates) : undefined;

    return {
      hasActiveCodes: remainingCodes > 0,
      totalCodes: activeCodes.length,
      usedCodes,
      remainingCodes,
      expiringCodes,
      lastGenerated: lastGenerated ? new Date(lastGenerated) : undefined,
      lastUsed: lastUsed ? new Date(lastUsed) : undefined
    };
  }

  /**
   * Download recovery codes as formatted text
   */
  generateDownloadableRecoveryCodes(codes: string[], userId: string): string {
    const timestamp = new Date().toISOString();
    
    return [
      'PromptScape Multi-Factor Authentication',
      'Recovery Codes',
      '=' .repeat(50),
      '',
      `Generated: ${timestamp}`,
      `User ID: ${userId}`,
      '',
      'IMPORTANT SECURITY INFORMATION:',
      '• Save these codes in a secure location',
      '• Each code can only be used once',
      '• Use these codes if you lose access to your primary MFA device',
      '• Do not share these codes with anyone',
      '• Generate new codes if you suspect these have been compromised',
      '',
      'Recovery Codes:',
      '-' .repeat(20),
      ...codes.map((code, index) => `${String(index + 1).padStart(2, ' ')}. ${this.formatCodeForDisplay(code)}`),
      '',
      'To use a recovery code:',
      '1. Go to the login page',
      '2. Enter your username and password',
      '3. When prompted for MFA, click "Use recovery code"',
      '4. Enter one of the codes above',
      '',
      'If you run out of recovery codes, generate new ones from your',
      'account security settings.',
      '',
      `Generated by PromptScape Security System - ${timestamp}`
    ].join('\n');
  }

  // Private helper methods

  private generateSingleCode(length: number, charset: string): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      code += charset[randomIndex];
    }
    return code;
  }

  private formatCodeForDisplay(code: string): string {
    // Insert hyphen every 4 characters for readability
    return code.replace(/(.{4})/g, '$1-').slice(0, -1);
  }

  private generateCodeId(): string {
    return `RC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  private generateSetId(): string {
    return `RCS-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  }

  private async storeRecoverySet(recoverySet: RecoveryCodeSet): Promise<void> {

    // Implementation would persist to database
    console.log(`Storing recovery code set ${recoverySet.id} for user ${recoverySet.userId}`);
  }

  private async getActiveRecoveryCodes(userId: string): Promise<RecoveryCode[]> {

    // Implementation would query database
    // For now, return empty array
    return [];
  }

  private async invalidatePreviousRecoveryCodes(userId: string, currentSetId: string): Promise<void> {

    // Implementation would mark previous codes as inactive
    console.log(`Invalidating previous recovery codes for user ${userId}, keeping set ${currentSetId}`);
  }

  private async markCodeAsUsed(codeId: string, sourceIP: string, userAgent: string): Promise<void> {

    // Implementation would update database record
    console.log(`Marking recovery code ${codeId} as used from IP ${sourceIP}`);
  }

  private async logRecoveryCodeEvent(event: {
    userId: string;
    action: string;
    setId?: string;
    codeId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {

    // Implementation would log to audit system
    console.log(`Recovery code event: ${event.action} for user ${event.userId}`);
  }

  private async logRecoveryCodeUsage(usage: RecoveryCodeUsage): Promise<void> {

    // Implementation would persist usage record
    console.log(`Recovery code usage: ${usage.success ? 'success' : 'failure'} for user ${usage.userId}`);
  }

  /**
   * Validate recovery code format
   */
  validateRecoveryCodeFormat(code: string): { valid: boolean; message?: string } {
    // Remove any hyphens or spaces for validation
    const cleanCode = code.replace(/[-\s]/g, '');
    
    if (cleanCode.length < 6 || cleanCode.length > 12) {
      return {
        valid: false,
        message: 'Recovery code must be between 6 and 12 characters'
      };
    }

    // Check for valid characters (letters and numbers only)
    if (!/^[A-Z0-9]+$/i.test(cleanCode)) {
      return {
        valid: false,
        message: 'Recovery code can only contain letters and numbers'
      };
    }

    return { valid: true };
  }

  /**
   * Generate emergency recovery codes (admin function)
   */
  async generateEmergencyRecoveryCodes(
    userId: string, 
    adminId: string, 
    reason: string
  ): Promise<{ codes: string[]; setId: string }> {

    const result = await this.generateRecoveryCodes(userId, {
      count: 5, // Fewer codes for emergency use
      length: 8,
      generatedBy: adminId,
      reason: `emergency_generation: ${reason}`,
      expirationDays: 7 // Short expiration for emergency codes
    });

    // Log emergency generation
    await this.logRecoveryCodeEvent({
      userId,
      action: 'emergency_codes_generated',
      setId: result.setId,
      metadata: { adminId, reason }
    });

    return result;
  }

  /**
   * Bulk invalidate all recovery codes for a user (security incident response)
   */
  async invalidateAllRecoveryCodes(
    userId: string, 
    reason: string, 
    performedBy: string
  ): Promise<void> {

    // Implementation would mark all active codes as inactive
    console.log(`Invalidating ALL recovery codes for user ${userId} - Reason: ${reason}`);
    
    await this.logRecoveryCodeEvent({
      userId,
      action: 'all_codes_invalidated',
      metadata: { reason, performedBy }
    });
  }
}