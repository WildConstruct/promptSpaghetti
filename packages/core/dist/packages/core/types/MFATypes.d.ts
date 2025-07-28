/**
 * MFA Data Models - Epic 19 Implementation
 * Comprehensive TypeScript types for Multi-Factor Authentication system
 */
import { z } from 'zod';
export declare enum MFAMethodType {
    TOTP = "totp",
    EMAIL = "email",
    SMS = "sms",
    export,
    enum,
    MFAMethodStatus
}
export declare const EmailConfigurationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SMSConfigurationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const MFAVerificationAttemptSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare function isTOTPConfiguration(config: BaseMFAConfiguration): config is TOTPConfiguration;
//# sourceMappingURL=MFATypes.d.ts.map