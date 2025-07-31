/**
 * Epic 16 Learning Paths Integration
 *
 * Main integration component that brings together the learning path
 * dashboard, viewer, and service components for Epic 16 Marketplace
 * & Community learning system.
 */
import React from 'react';

}
interface Epic16LearningPathsProps {
    userId: string;
    userRole: 'user' | 'creator' | 'admin';
    userTier: 'free' | 'premium' | 'enterprise';
    onAnalytics?: (analytics: unknown) => void;
    onCertification?: (certification: unknown) => void;

export declare const Epic16LearningPaths: React.FC<Epic16LearningPathsProps>;
export default Epic16LearningPaths;
//# sourceMappingURL=Epic16LearningPaths.d.ts.map
}