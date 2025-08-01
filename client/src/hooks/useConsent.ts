/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * useConsent Hook
 * 
 * React hook for managing consent state and operations
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { useState, useEffect, useCallback } from 'react';
import { ConsentService } from '../services/ConsentService';
import {
  ConsentType,
  ConsentPreferences,
  ConsentExport,
  UseConsentReturn
 from '../types/consent';

export const useConsent = (): UseConsentReturn => {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const consentService = ConsentService.getInstance();

  // Initialize consent service
  useEffect(() => {
    const initializeConsent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get current user ID if available (from auth context, localStorage, etc.)
        const userId = getCurrentUserId();
        
        await consentService.initialize(userId);
        const currentPreferences = consentService.getPreferences();
        setPreferences(currentPreferences);
 catch (err) {
  console.error('Failed to initialize consent service:', err);
  setError(err instanceof Error ? err.message : 'Failed to initialize consent');
 finally {
        setIsLoading(false);

    };

    initializeConsent();
  }, []);

  // Listen for consent events
  useEffect(() => {
  const handleConsentEvent = (event: any) => {,
  // Refresh preferences when consent changes
  const updatedPreferences = consentService.getPreferences();
  setPreferences(updatedPreferences);
};

    consentService.addEventListener('consent_given', handleConsentEvent);
    consentService.addEventListener('consent_withdrawn', handleConsentEvent);
    consentService.addEventListener('preferences_saved', handleConsentEvent);

    return () => {
      consentService.removeEventListener('consent_given', handleConsentEvent);
      consentService.removeEventListener('consent_withdrawn', handleConsentEvent);
      consentService.removeEventListener('preferences_saved', handleConsentEvent);
    };
  }, []);

  const hasConsent = useCallback((type: ConsentType): boolean => {
    return consentService.hasConsent(type);
  }, []);

  const grantConsent = useCallback(async (type: ConsentType): Promise<void> => {
    setError(null);
    
    try {
      await consentService.grantConsent(type, 'preferences');
      
      // Update local state
      const updatedPreferences = consentService.getPreferences();
      setPreferences(updatedPreferences);
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to grant consent';
  setError(errorMessage);
  throw err;
}, []);

  const withdrawConsent = useCallback(async (type: ConsentType): Promise<void> => {
    setError(null);
    
    try {
      await consentService.withdrawConsent(type, 'preferences');
      
      // Update local state
      const updatedPreferences = consentService.getPreferences();
      setPreferences(updatedPreferences);
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw consent';
  setError(errorMessage);
  throw err;
}, []);

  const updatePreferences = useCallback(async (updates: Partial<ConsentPreferences>): Promise<void> => {
    setError(null);
    
    try {
      await consentService.updatePreferences(updates);
      
      // Update local state
      const updatedPreferences = consentService.getPreferences();
      setPreferences(updatedPreferences);
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
  setError(errorMessage);
  throw err;
}, []);

  const exportData = useCallback(async (): Promise<ConsentExport> => {
    setError(null);
    
    try {
      return await consentService.exportData();
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
  setError(errorMessage);
  throw err;
}, []);

  const resetConsents = useCallback(async (): Promise<void> => {
    setError(null);
    
    try {
      await consentService.resetConsents();
      
      // Update local state
      const updatedPreferences = consentService.getPreferences();
      setPreferences(updatedPreferences);
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to reset consents';
  setError(errorMessage);
  throw err;
}, []);

  const refreshConfig = useCallback(async (): Promise<void> => {
    setError(null);
    
    try {
      // Re-initialize to refresh configuration
      const userId = getCurrentUserId();
      await consentService.initialize(userId);
      
      const updatedPreferences = consentService.getPreferences();
      setPreferences(updatedPreferences);
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to refresh configuration';
  setError(errorMessage);
  throw err;
}, []);

  return {
    preferences,
    isLoading,
    error,
    hasConsent,
    grantConsent,
    withdrawConsent,
    updatePreferences,
    exportData,
    resetConsents,
    refreshConfig
  };
};

// Helper function to get current user ID
// This would typically be obtained from your authentication system
function getCurrentUserId(): string | undefined {
  // Try to get from localStorage, auth context, or other sources
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user.userId;
 catch (error) {
    console.warn('Failed to get user ID from localStorage:', error);

  // Try to get from auth context if available
  // This would depend on your specific authentication implementation
  
  return undefined;
