/**
 * Trust Score Manager - E17-1753114397393-BA8A32
 *
 * Administrative interface for managing and adjusting user trust scores
 * Part of Epic 17.5.5 - Verification System
 */
import React from 'react';
import type { TrustScore } from '../../types/TrustTypes';
export interface UserTrustData {
    userId: string;
    userName: string;
    email: string;
    userType: 'creator' | 'buyer' | 'both';
    trustScore: TrustScore;
    verificationStatus: {
        email: boolean;
        phone: boolean;
        identity: boolean;
        professional: boolean;
    };
    accountStatus: 'active' | 'suspended' | 'under_review';
    lastActivity: Date;
    joinDate: Date;
    riskFlags: string[];
}
export interface TrustScoreAdjustment {
    userId: string;
    adjustmentType: 'manual_override' | 'penalty' | 'bonus' | 'reset';
    scoreChange: number;
    reason: string;
    adminId: string;
    timestamp: Date;
    expiresAt?: Date;
}
export interface TrustScoreManagerProps {
    className?: string;
}
export declare const TrustScoreManager: React.FC<TrustScoreManagerProps>;
export default TrustScoreManager;
//# sourceMappingURL=TrustScoreManager.d.ts.map