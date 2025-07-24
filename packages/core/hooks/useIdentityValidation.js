/**
 * React Hook for Identity Validation Integration
 *
 * Provides easy-to-use React integration for the identity validation system.
 * Handles validation requests, status tracking, and trust score management.
 */
import { useEffect, useState, useCallback } from 'react';
import { identityValidationService } from '../auth/IdentityValidation.js';
export const useIdentityValidation = (config = {}) => {
    const { userId, autoLoadUserData = true, enableRealTimeUpdates = false } = config;
    const [userTrustScore, setUserTrustScore] = useState(null);
    const [userValidations, setUserValidations] = useState([]);
    const [validationSummary, setValidationSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Load user data on mount and when userId changes
    useEffect(() => {
        if (userId && autoLoadUserData) {
            loadUserData();
        }
    }, [userId, autoLoadUserData]);
    // Setup real-time updates if enabled
    useEffect(() => {
        if (enableRealTimeUpdates && userId) {
            const interval = setInterval(() => {
                loadUserData();
            }, 30000); // Update every 30 seconds
            return () => clearInterval(interval);
        }
    }, [enableRealTimeUpdates, userId]);
    const loadUserData = useCallback(async () => {
        if (!userId)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const trustScore = identityValidationService.getUserTrustScore(userId);
            const validations = identityValidationService.getUserValidations(userId);
            const summary = identityValidationService.getUserValidationSummary(userId);
            setUserTrustScore(trustScore);
            setUserValidations(validations);
            setValidationSummary(summary);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load user data');
        }
        finally {
            setIsLoading(false);
        }
    }, [userId]);
    /**
     * Submit email verification
     */
    const submitEmailVerification = useCallback(async (email) => {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }
        try {
            const result = await identityValidationService.submitValidationRequest(userId, 'email_verification', { email }, { requestSource: 'manual_request' });
            // Refresh user data
            await loadUserData();
            return {
                success: true,
                requestId: result.requestId,
                status: result.status
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Email verification failed'
            };
        }
    }, [userId, loadUserData]);
    /**
     * Submit phone verification
     */
    const submitPhoneVerification = useCallback(async (phoneNumber) => {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }
        try {
            const result = await identityValidationService.submitValidationRequest(userId, 'phone_verification', { phoneNumber }, { requestSource: 'manual_request' });
            await loadUserData();
            return {
                success: true,
                requestId: result.requestId,
                status: result.status
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Phone verification failed'
            };
        }
    }, [userId, loadUserData]);
    /**
     * Submit government ID verification
     */
    const submitGovernmentIdVerification = useCallback(async (governmentIdData) => {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }
        try {
            const result = await identityValidationService.submitValidationRequest(userId, 'government_id', { governmentId: governmentIdData }, { requestSource: 'manual_request' });
            await loadUserData();
            return {
                success: true,
                requestId: result.requestId,
                status: result.status
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Government ID verification failed'
            };
        }
    }, [userId, loadUserData]);
    /**
     * Submit professional credentials verification
     */
    const submitProfessionalCredentials = useCallback(async (professionalData) => {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }
        try {
            const result = await identityValidationService.submitValidationRequest(userId, 'professional_credentials', { professionalCredentials: professionalData }, { requestSource: 'manual_request' });
            await loadUserData();
            return {
                success: true,
                requestId: result.requestId,
                status: result.status
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Professional credentials verification failed'
            };
        }
    }, [userId, loadUserData]);
    /**
     * Submit social media verification
     */
    const submitSocialMediaVerification = useCallback(async (socialMediaData) => {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }
        try {
            const result = await identityValidationService.submitValidationRequest(userId, 'social_media_verification', { socialMediaProfiles: socialMediaData }, { requestSource: 'manual_request' });
            await loadUserData();
            return {
                success: true,
                requestId: result.requestId,
                status: result.status
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Social media verification failed'
            };
        }
    }, [userId, loadUserData]);
    /**
     * Submit portfolio verification
     */
    const submitPortfolioVerification = useCallback(async (portfolioData) => {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }
        try {
            const result = await identityValidationService.submitValidationRequest(userId, 'portfolio_verification', { professionalCredentials: { portfolio: portfolioData } }, { requestSource: 'manual_request' });
            await loadUserData();
            return {
                success: true,
                requestId: result.requestId,
                status: result.status
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Portfolio verification failed'
            };
        }
    }, [userId, loadUserData]);
    /**
     * Check validation status
     */
    const checkValidationStatus = useCallback((requestId) => {
        return identityValidationService.getValidationStatus(requestId);
    }, []);
    /**
     * Get validation result
     */
    const getValidationResult = useCallback((requestId) => {
        return identityValidationService.getValidationResult(requestId);
    }, []);
    /**
     * Get user's validation completion percentage
     */
    const getVerificationCompletionPercentage = useCallback(() => {
        if (!validationSummary)
            return 0;
        const totalPossibleValidations = 6; // Core validation types
        const completedValidations = validationSummary.completedValidations?.length || 0;
        return Math.round((completedValidations / totalPossibleValidations) * 100);
    }, [validationSummary]);
    /**
     * Get next recommended verification steps
     */
    const getRecommendedVerificationSteps = useCallback(() => {
        if (!validationSummary)
            return [];
        const steps = [];
        const missing = validationSummary.missingValidations || [];
        if (missing.includes('email_verification')) {
            steps.push({
                type: 'email_verification',
                title: 'Verify Email Address',
                description: 'Confirm your email address to enable account security features',
                priority: 'high',
                requiredFor: 'Basic verification'
            });
        }
        if (missing.includes('phone_verification')) {
            steps.push({
                type: 'phone_verification',
                title: 'Verify Phone Number',
                description: 'Add two-factor authentication and account recovery options',
                priority: 'high',
                requiredFor: 'Account security'
            });
        }
        if (missing.includes('professional_credentials')) {
            steps.push({
                type: 'professional_credentials',
                title: 'Add Professional Credentials',
                description: 'Showcase your education, certifications, and industry experience',
                priority: 'medium',
                requiredFor: 'Professional tier access'
            });
        }
        if (missing.includes('portfolio_verification')) {
            steps.push({
                type: 'portfolio_verification',
                title: 'Verify Portfolio',
                description: 'Link your professional work to build credibility',
                priority: 'medium',
                requiredFor: 'Creator marketplace'
            });
        }
        if (missing.includes('social_media_verification')) {
            steps.push({
                type: 'social_media_verification',
                title: 'Connect Social Profiles',
                description: 'Link your LinkedIn, IMDb, or other professional profiles',
                priority: 'low',
                requiredFor: 'Community features'
            });
        }
        if (missing.includes('government_id')) {
            steps.push({
                type: 'government_id',
                title: 'Government ID Verification',
                description: 'Complete identity verification for premium features',
                priority: 'medium',
                requiredFor: 'Payment processing'
            });
        }
        return steps.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }, [validationSummary]);
    /**
     * Check if user has specific verification
     */
    const hasVerification = useCallback((type) => {
        return validationSummary?.completedValidations?.includes(type) || false;
    }, [validationSummary]);
    /**
     * Get trust tier benefits
     */
    const getTrustTierBenefits = useCallback((tier) => {
        const currentTier = tier || userTrustScore?.tier || 'unverified';
        const benefits = {
            unverified: [
                'Access to free templates',
                'Basic graph creation tools'
            ],
            basic: [
                'Email support',
                'Access to premium templates (limited)',
                'Basic marketplace features'
            ],
            verified: [
                'Priority support',
                'Full marketplace access',
                'Template creation & selling',
                'Collaboration features'
            ],
            professional: [
                'Professional badge display',
                'Featured creator status',
                'Advanced analytics',
                'Custom branding options',
                'Direct industry connections'
            ],
            expert: [
                'Expert verification badge',
                'Mentorship opportunities',
                'Early access to new features',
                'Revenue sharing bonuses',
                'Industry partnership access'
            ]
        };
        return benefits[currentTier] || [];
    }, [userTrustScore]);
    return {
        // State
        userTrustScore,
        userValidations,
        validationSummary,
        isLoading,
        error,
        // Verification submissions
        submitEmailVerification,
        submitPhoneVerification,
        submitGovernmentIdVerification,
        submitProfessionalCredentials,
        submitSocialMediaVerification,
        submitPortfolioVerification,
        // Status checking
        checkValidationStatus,
        getValidationResult,
        // Helper methods
        getVerificationCompletionPercentage,
        getRecommendedVerificationSteps,
        hasVerification,
        getTrustTierBenefits,
        // Data refresh
        refreshUserData: loadUserData,
        // Utility methods
        isEmailVerified: hasVerification('email_verification'),
        isPhoneVerified: hasVerification('phone_verification'),
        isIdentityVerified: hasVerification('government_id'),
        isProfessionalVerified: hasVerification('professional_credentials'),
        isSocialVerified: hasVerification('social_media_verification'),
        isPortfolioVerified: hasVerification('portfolio_verification'),
        // Trust score utilities
        trustLevel: userTrustScore?.tier || 'unverified',
        trustPercentage: userTrustScore?.overall || 0,
        canAccessPremiumFeatures: (userTrustScore?.tier && ['verified',
            'professional',
            'expert'].includes(userTrustScore.tier)) || false,
        canSellTemplates: (userTrustScore?.tier && ['professional', 'expert'].includes(userTrustScore.tier)) || false,
        // Direct service access
        identityValidationService
    };
};
export default useIdentityValidation;
