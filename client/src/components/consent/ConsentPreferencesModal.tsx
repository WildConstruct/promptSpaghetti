/**
 * Consent Preferences Modal Component
 * 
 * Detailed consent management modal with granular controls
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import React, { useState, useEffect } from 'react';
import {
  ConsentType,
  ConsentPreferences,
  ConsentConfiguration,
  ConsentTypeConfig
} from '../../types/consent';
import { useConsent } from '../../hooks/useConsent';
import './ConsentPreferencesModal.css';

interface ConsentPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: ConsentPreferences) => Promise<void>;
  preferences: ConsentPreferences | null;
  config: ConsentConfiguration | null;
}

export const ConsentPreferencesModal: React.FC<ConsentPreferencesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  preferences,
  config
}) => {
  const { hasConsent, grantConsent, withdrawConsent } = useConsent();
  const [localPreferences, setLocalPreferences] = useState<Record<ConsentType, boolean>>(
    {} as Record<ConsentType,
    boolean>
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'consents' | 'privacy' | 'communication'>('consents');

  useEffect(() => {
    if (isOpen && config && preferences) {
      // Initialize local state from current preferences
      const initialState: Record<ConsentType, boolean> = {} as Record<ConsentType, boolean>;
      
      config.consentTypes.forEach(typeConfig => {
        initialState[typeConfig.type] = hasConsent(typeConfig.type);
      });
      
      setLocalPreferences(initialState);
      setError(null);
    }
  }, [isOpen, config, preferences, hasConsent]);

  const handleConsentToggle = (consentType: ConsentType, granted: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      [consentType]: granted
    }));
  };

  const handleSave = async () => {
    if (!preferences || !config) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Apply consent changes
      for (const [consentType, granted] of Object.entries(localPreferences)) {
        const currentStatus = hasConsent(consentType as ConsentType);
        
        if (granted && !currentStatus) {
          await grantConsent(consentType as ConsentType, 'preferences');
        } else if (!granted && currentStatus) {
          await withdrawConsent(consentType as ConsentType, 'preferences');
        }
      }
      
      // Call parent save handler
      await onSave(preferences);
      
    } catch (error) {
      console.error('Failed to save consent preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset local state
    if (config && preferences) {
      const resetState: Record<ConsentType, boolean> = {} as Record<ConsentType, boolean>;
      config.consentTypes.forEach(typeConfig => {
        resetState[typeConfig.type] = hasConsent(typeConfig.type);
      });
      setLocalPreferences(resetState);
    }
    setError(null);
    onClose();
  };

  const renderConsentTypeCard = (typeConfig: ConsentTypeConfig) => {
    const isEssential = typeConfig.isEssential;
    const isGranted = localPreferences[typeConfig.type];
    
    return (
      <div key={typeConfig.type} className="consent-card">
        <div className="consent-card__header">
          <div className="consent-card__info">
            <h3 className="consent-card__title">
              {typeConfig.name}
              {isEssential && <span className="consent-card__badge">Essential</span>}
            </h3>
            <p className="consent-card__description">{typeConfig.description}</p>
            <p className="consent-card__purpose">
              <strong>Purpose:</strong> {typeConfig.purpose}
            </p>
          </div>
          
          <div className="consent-card__toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isGranted}
                onChange={(e) => handleConsentToggle(typeConfig.type, e.target.checked)}
                disabled={isEssential || isLoading}
                aria-labelledby={`consent-${typeConfig.type}-label`}
              />
              <span className="toggle-switch__slider"></span>
            </label>
            <span id={`consent-${typeConfig.type}-label`} className="sr-only">
              {isGranted ? 'Disable' : 'Enable'} {typeConfig.name} cookies
            </span>
          </div>
        </div>
        
        {typeConfig.dataCategories.length > 0 && (
          <div className="consent-card__details">
            <h4 className="consent-card__details-title">Data Categories:</h4>
            <ul className="consent-card__list">
              {typeConfig.dataCategories.map((category, index) => (
                <li key={index}>
                  <strong>{category.name}:</strong> {category.description}
                  {category.examples.length > 0 && (
                    <div className="consent-card__examples">
                      Examples: {category.examples.join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {typeConfig.thirdParties.length > 0 && (
          <div className="consent-card__details">
            <h4 className="consent-card__details-title">Third Parties:</h4>
            <ul className="consent-card__list">
              {typeConfig.thirdParties.map((party, index) => (
                <li key={index}>
                  <strong>{party.name}</strong> ({party.domain})
                  <div>Purpose: {party.purpose}</div>
                  <div>Data shared: {party.dataShared.join(', ')}</div>
                  <a 
                    href={party.privacyPolicy} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="consent-card__link"
                  >
                    Privacy Policy
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {typeConfig.cookies.length > 0 && (
          <details className="consent-card__cookies">
            <summary>Cookie Details ({typeConfig.cookies.length})</summary>
            <div className="consent-card__cookies-list">
              {typeConfig.cookies.map((cookie, index) => (
                <div key={index} className="cookie-item">
                  <div className="cookie-item__name">{cookie.name}</div>
                  <div className="cookie-item__details">
                    <div>Purpose: {cookie.purpose}</div>
                    <div>Type: {cookie.type}</div>
                    {cookie.duration && <div>Duration: {cookie.duration} days</div>}
                    <div>Domain: {cookie.domain}</div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  };

  const renderPrivacySettings = () => {
    if (!preferences) return null;
    
    const privacySettings = preferences.userPreferences.privacySettings;
    
    return (
      <div className="privacy-settings">
        <h3>Privacy Settings</h3>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={!privacySettings.dataProcessingOptOut}
              onChange={(e) => {
                // Handle privacy setting change
                console.log('Data processing opt-out changed:', !e.target.checked);
              }}
            />
            Allow data processing for service improvement
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            Profile Visibility:
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) => {
                // Handle profile visibility change
                console.log('Profile visibility changed:', e.target.value);
              }}
            >
              <option value="public">Public</option>
              <option value="limited">Limited</option>
              <option value="private">Private</option>
            </select>
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={!privacySettings.trackingOptOut}
              onChange={(e) => {
                console.log('Tracking opt-out changed:', !e.target.checked);
              }}
            />
            Allow cross-site tracking
          </label>
        </div>
      </div>
    );
  };

  const renderCommunicationSettings = () => {
    if (!preferences) return null;
    
    const commSettings = preferences.userPreferences.communicationPreferences;
    
    return (
      <div className="communication-settings">
        <h3>Communication Preferences</h3>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={commSettings.emailNotifications}
              onChange={(e) => {
                console.log('Email notifications changed:', e.target.checked);
              }}
            />
            Email notifications
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={commSettings.marketingEmails}
              onChange={(e) => {
                console.log('Marketing emails changed:', e.target.checked);
              }}
            />
            Marketing emails
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={commSettings.productUpdates}
              onChange={(e) => {
                console.log('Product updates changed:', e.target.checked);
              }}
            />
            Product updates
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={commSettings.securityAlerts}
              onChange={(e) => {
                console.log('Security alerts changed:', e.target.checked);
              }}
              disabled
            />
            Security alerts (required)
          </label>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="consent-modal-overlay" onClick={onClose}>
      <div 
        className="consent-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="consent-modal-title"
        aria-modal="true"
      >
        <div className="consent-modal__header">
          <h2 id="consent-modal-title">Privacy Preferences</h2>
          <button 
            className="consent-modal__close"
            onClick={onClose}
            aria-label="Close preferences modal"
          >
            ×
          </button>
        </div>
        
        <div className="consent-modal__tabs">
          <button
            className={`consent-modal__tab ${activeTab === 'consents' ? 'active' : ''}`}
            onClick={() => setActiveTab('consents')}
          >
            Cookie Consents
          </button>
          <button
            className={`consent-modal__tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Settings
          </button>
          <button
            className={`consent-modal__tab ${activeTab === 'communication' ? 'active' : ''}`}
            onClick={() => setActiveTab('communication')}
          >
            Communications
          </button>
        </div>
        
        <div className="consent-modal__content">
          {error && (
            <div className="consent-modal__error" role="alert">
              {error}
            </div>
          )}
          
          {activeTab === 'consents' && config && (
            <div className="consent-types">
              <p className="consent-modal__description">
                Manage your cookie and data processing preferences. Essential cookies are required 
                for the website to function and cannot be disabled.
              </p>
              
              {config.consentTypes.map(typeConfig => renderConsentTypeCard(typeConfig))}
            </div>
          )}
          
          {activeTab === 'privacy' && renderPrivacySettings()}
          {activeTab === 'communication' && renderCommunicationSettings()}
        </div>
        
        <div className="consent-modal__footer">
          <button
            className="consent-modal__button consent-modal__button--secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="consent-modal__button consent-modal__button--primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentPreferencesModal;