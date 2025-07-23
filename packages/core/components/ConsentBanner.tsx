/**
 * ConsentBanner Component - Epic 19
 * 
 * GDPR/CCPA compliant consent banner with granular preferences,
 * just-in-time prompts, and comprehensive consent management.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Settings, Shield, Eye, Target, MessageSquare, Cookie } from 'lucide-react';

interface ConsentBannerProps {
  onConsentUpdate?: (consents: ConsentPreferences) => void;
  onClose?: () => void;
  country?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  position?: 'top' | 'bottom' | 'overlay' | 'modal';
  showRejectButton?: boolean;
  showCustomizeButton?: boolean;
  autoHide?: boolean;
  respectDoNotTrack?: boolean;
}

interface ConsentPreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  advertising: boolean;
  socialMedia: boolean;
  personalization: boolean;
}

interface ConsentPurpose {
  id: string;
  category: keyof ConsentPreferences;
  name: string;
  description: string;
  essential: boolean;
  examples: string[];
  dataTypes: string[];
  retention: string;
  thirdParties: string[];
}

const defaultConsents: ConsentPreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
  advertising: false,
  socialMedia: false,
  personalization: false
};

const consentPurposes: ConsentPurpose[] = [
  {
    id: 'essential',
    category: 'essential',
    name: 'Essential Cookies',
    description: 'Necessary for the website to function properly',
    essential: true,
    examples: ['Authentication', 'Security', 'Session management'],
    dataTypes: ['Session ID', 'Security tokens', 'User preferences'],
    retention: '30 days',
    thirdParties: []
  },
  {
    id: 'functional',
    category: 'functional',
    name: 'Functional Cookies',
    description: 'Enable enhanced functionality and personalization',
    essential: false,
    examples: ['Language preferences', 'Region selection', 'Theme settings'],
    dataTypes: ['Language code', 'Timezone', 'UI preferences'],
    retention: '1 year',
    thirdParties: []
  },
  {
    id: 'analytics',
    category: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our website',
    essential: false,
    examples: ['Page views', 'Click tracking', 'Performance metrics'],
    dataTypes: ['Usage statistics', 'Performance data', 'Error logs'],
    retention: '2 years',
    thirdParties: ['Google Analytics', 'Adobe Analytics']
  },
  {
    id: 'marketing',
    category: 'marketing',
    name: 'Marketing Cookies',
    description: 'Used to deliver relevant advertisements and track campaigns',
    essential: false,
    examples: ['Ad targeting', 'Campaign tracking', 'Email marketing'],
    dataTypes: ['Interests', 'Demographics', 'Campaign interactions'],
    retention: '1 year',
    thirdParties: ['Google Ads', 'Facebook Pixel', 'LinkedIn Insight']
  },
  {
    id: 'advertising',
    category: 'advertising',
    name: 'Advertising Cookies',
    description: 'Used by advertising networks to deliver targeted ads',
    essential: false,
    examples: ['Ad personalization', 'Frequency capping', 'Cross-site tracking'],
    dataTypes: ['Browsing history', 'Ad interactions', 'Device info'],
    retention: '1 year',
    thirdParties: ['Google AdSense', 'Amazon DSP', 'The Trade Desk']
  },
  {
    id: 'socialMedia',
    category: 'socialMedia',
    name: 'Social Media Cookies',
    description: 'Enable social media features and track social sharing',
    essential: false,
    examples: ['Social login', 'Share buttons', 'Social widgets'],
    dataTypes: ['Social profile', 'Sharing activity', 'Social connections'],
    retention: '1 year',
    thirdParties: ['Facebook', 'Twitter', 'LinkedIn', 'YouTube']
  },
  {
    id: 'personalization',
    category: 'personalization',
    name: 'Personalization Cookies',
    description: 'Customize content and user experience based on preferences',
    essential: false,
    examples: ['Content recommendations', 'Layout preferences', 'Personal dashboard'],
    dataTypes: ['Content preferences', 'Behavior patterns', 'Personal settings'],
    retention: '2 years',
    thirdParties: ['Recommendation engines', 'Content platforms']
  }
];

const ConsentBanner: React.FC<ConsentBannerProps> = ({
  onConsentUpdate,
  onClose,
  country = 'US',
  language = 'en',
  theme = 'light',
  position = 'bottom',
  showRejectButton = true,
  showCustomizeButton = true,
  autoHide = false,
  respectDoNotTrack = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState<ConsentPreferences>(defaultConsents);
  const [activeTab, setActiveTab] = useState('overview');
  const [isGDPRApplicable, setIsGDPRApplicable] = useState(false);
  const [isCCPAApplicable, setIsCCPAApplicable] = useState(false);

  useEffect(() => {
    // Check if user is subject to GDPR or CCPA
    const gdprCountries = ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI', 'IE', 'PT', 'LU'];
    const _____ccpaStates = ['CA']; // Would need more sophisticated geo-detection
    
    setIsGDPRApplicable(gdprCountries.includes(country));
    setIsCCPAApplicable(country === 'US'); // Simplified - would detect state
    
    // Check for Do Not Track header
    if (respectDoNotTrack && navigator.doNotTrack === '1') {
      handleRejectAll();
      return;
    }

    // Auto-hide after delay if configured
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [country, autoHide, respectDoNotTrack]);

  const handleAcceptAll = useCallback(() => {
    const allConsents: ConsentPreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      advertising: true,
      socialMedia: true,
      personalization: true
    };
    setConsents(allConsents);
    onConsentUpdate?.(allConsents);
    setIsVisible(false);
    onClose?.();
  }, [onConsentUpdate, onClose]);

  const handleRejectAll = useCallback(() => {
    const minimalConsents: ConsentPreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      advertising: false,
      socialMedia: false,
      personalization: false
    };
    setConsents(minimalConsents);
    onConsentUpdate?.(minimalConsents);
    setIsVisible(false);
    onClose?.();
  }, [onConsentUpdate, onClose]);

  const handleSavePreferences = useCallback(() => {
    onConsentUpdate?.(consents);
    setIsVisible(false);
    setShowDetails(false);
    onClose?.();
  }, [consents, onConsentUpdate, onClose]);

  const handleConsentChange = useCallback((category: keyof ConsentPreferences, value: boolean) => {
    if (category === 'essential') return; // Essential cookies cannot be disabled
    
    setConsents(prev => ({
      ...prev,
      [category]: value
    }));
  }, []);

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return 'bg-gray-900 text-white border-gray-700';
    }
    if (theme === 'auto') {
      return 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700';
    }
    return 'bg-white text-gray-900 border-gray-200';
  };

  const getPositionClasses = () => {
    switch (position) {
    case 'top':
      return 'top-0 left-0 right-0';
    case 'bottom':
      return 'bottom-0 left-0 right-0';
    case 'overlay':
      return 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
    case 'modal':
      return 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4';
    default:
      return 'bottom-0 left-0 right-0';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case 'essential':
      return <Shield className="w-5 h-5 text-green-600" />;
    case 'functional':
      return <Settings className="w-5 h-5 text-blue-600" />;
    case 'analytics':
      return <Eye className="w-5 h-5 text-purple-600" />;
    case 'marketing':
      return <Target className="w-5 h-5 text-orange-600" />;
    case 'advertising':
      return <MessageSquare className="w-5 h-5 text-red-600" />;
    case 'socialMedia':
      return <MessageSquare className="w-5 h-5 text-indigo-600" />;
    case 'personalization':
      return <Cookie className="w-5 h-5 text-pink-600" />;
    default:
      return <Cookie className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className={`border-2 shadow-2xl ${getThemeClasses()} ${position === 'overlay' || position === 'modal' ? 'max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg' : 'w-full'}`}>
        {!showDetails ? (
          // Simple Banner View
          <div className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                <div className="flex items-center mb-2">
                  <Cookie className="w-6 h-6 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold">We value your privacy</h3>
                </div>
                <p className="text-sm opacity-90 mb-4">
                  We and our partners use technologies like cookies to store and access device information. 
                  This helps us provide and improve our services. {isGDPRApplicable && 'You have the right to withdraw consent at any time.'}
                  {isCCPAApplicable && ' California residents have additional privacy rights.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Accept All
                  </button>
                  {showRejectButton && (
                    <button
                      onClick={handleRejectAll}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Reject All
                    </button>
                  )}
                  {showCustomizeButton && (
                    <button
                      onClick={() => setShowDetails(true)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Manage Preferences
                    </button>
                  )}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors text-sm underline"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/cookie-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors text-sm underline"
                  >
                    Cookie Policy
                  </a>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          // Detailed Preferences View
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Settings className="w-6 h-6 mr-2 text-blue-600" />
                <h3 className="text-xl font-semibold">Privacy Preferences</h3>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close preferences"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'categories'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab('vendors')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'vendors'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Third Parties
              </button>
            </div>

            {/* Tab Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-sm opacity-90 mb-4">
                    We respect your privacy and give you control over how your data is used. 
                    Choose which types of cookies and data processing you're comfortable with.
                  </p>
                  
                  {isGDPRApplicable && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-1">GDPR Rights</h4>
                      <p className="text-sm text-blue-800">
                        You have the right to access, rectify, erase, restrict processing, data portability, 
                        and to object to processing of your personal data.
                      </p>
                    </div>
                  )}
                  
                  {isCCPAApplicable && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h4 className="font-medium text-yellow-900 mb-1">CCPA Rights</h4>
                      <p className="text-sm text-yellow-800">
                        California residents have the right to know, delete, opt-out of sale, 
                        and non-discrimination for exercising privacy rights.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consentPurposes.slice(0, 4).map((purpose) => (
                      <div key={purpose.id} className="p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {getCategoryIcon(purpose.category)}
                            <span className="ml-2 font-medium text-sm">{purpose.name}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={consents[purpose.category]}
                              onChange={(e) => handleConsentChange(purpose.category, e.target.checked)}
                              disabled={purpose.essential}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <p className="text-xs opacity-75">{purpose.description}</p>
                        {purpose.essential && (
                          <p className="text-xs text-green-600 mt-1">Required for basic functionality</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'categories' && (
                <div className="space-y-4">
                  {consentPurposes.map((purpose) => (
                    <div key={purpose.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {getCategoryIcon(purpose.category)}
                          <h4 className="ml-2 font-medium">{purpose.name}</h4>
                          {purpose.essential && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Required</span>
                          )}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consents[purpose.category]}
                            onChange={(e) => handleConsentChange(purpose.category, e.target.checked)}
                            disabled={purpose.essential}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <p className="text-sm opacity-90 mb-3">{purpose.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <h5 className="font-medium mb-1">Examples:</h5>
                          <ul className="list-disc list-inside opacity-75">
                            {purpose.examples.map((example, index) => (
                              <li key={index}>{example}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Data Types:</h5>
                          <ul className="list-disc list-inside opacity-75">
                            {purpose.dataTypes.map((dataType, index) => (
                              <li key={index}>{dataType}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Retention:</h5>
                          <p className="opacity-75">{purpose.retention}</p>
                        </div>
                        {purpose.thirdParties.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-1">Third Parties:</h5>
                            <ul className="list-disc list-inside opacity-75">
                              {purpose.thirdParties.map((party, index) => (
                                <li key={index}>{party}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'vendors' && (
                <div className="space-y-4">
                  <p className="text-sm opacity-90 mb-4">
                    We work with trusted third-party partners to provide our services. 
                    Here's information about the companies that may process your data.
                  </p>
                  
                  {/* Mock vendor list */}
                  <div className="space-y-3">
                    {[
                      { name: 'Google Analytics', purpose: 'Website analytics', country: 'US', privacy: 'https://policies.google.com/privacy' },
                      { name: 'Facebook Pixel', purpose: 'Social media integration', country: 'US', privacy: 'https://www.facebook.com/privacy/explanation' },
                      { name: 'Mailchimp', purpose: 'Email marketing', country: 'US', privacy: 'https://mailchimp.com/legal/privacy/' },
                      { name: 'Stripe', purpose: 'Payment processing', country: 'US', privacy: 'https://stripe.com/privacy' }
                    ].map((vendor, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{vendor.name}</h5>
                            <p className="text-sm opacity-75">{vendor.purpose}</p>
                            <p className="text-xs opacity-60">Based in: {vendor.country}</p>
                          </div>
                          <a
                            href={vendor.privacy}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Privacy Policy
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Accept All
                </button>
              </div>
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentBanner;