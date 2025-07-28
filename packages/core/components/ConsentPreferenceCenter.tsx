/**
 * ConsentPreferenceCenter Component - Epic 19
 * 
 * Comprehensive consent preference management center with detailed controls,
 * history tracking, data subject rights, and compliance features.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, Shield, Eye, Target, MessageSquare, Cookie, Download, 
  Trash2, Edit, History, AlertCircle, CheckCircle, Clock, 
  FileText, ExternalLink, RefreshCw, User, Globe, Calendar 
} from 'lucide-react';
interface ConsentPreferenceCenterProps {
  userId?: string;
  onConsentUpdate?: (consents: ConsentSettings) => void;
  onDataRequest?: (requestType: DataRequestType) => void;
  showDataRights?: boolean;
  showHistory?: boolean;
  jurisdiction?: string;
}
interface ConsentSettings {
  categories: Record<string, CategoryConsent>;
  communications: CommunicationPreferences;
  dataProcessing: DataProcessingPreferences;
  retention: RetentionPreferences;
  sharing: SharingPreferences;
  lastUpdated: Date;
}
interface CategoryConsent {
  enabled: boolean;
  granularChoices: Record<string, boolean>;
  lastModified: Date;
  expiresAt?: Date;
  source: string;
}
interface CommunicationPreferences {
  email: ChannelPreference;
  sms: ChannelPreference;
  push: ChannelPreference;
  phone: ChannelPreference;
  post: ChannelPreference;
}
interface ChannelPreference {
  enabled: boolean;
  frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NEVER';
  topics: string[];
  quietHours: {,
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}
interface DataProcessingPreferences {
  analytics: ProcessingConsent;
  personalization: ProcessingConsent;
  marketing: ProcessingConsent;
  research: ProcessingConsent;
  aiProcessing: ProcessingConsent;
}
interface ProcessingConsent {
  enabled: boolean;
  allowAutomatedDecisions: boolean;
  allowProfiling: boolean;
  allowSharing: boolean;
  allowInternationalTransfers: boolean;
  retentionPeriod: number; // days
}
interface RetentionPreferences {
  minimumRetention: boolean;
  autoDelete: boolean;
  customRetentionPeriods: Record<string, number>;
  deleteInactiveData: boolean;
  inactivityThreshold: number; // days
}
interface SharingPreferences {
  internal: SharingConsent;
  partners: SharingConsent;
  vendors: SharingConsent;
  research: SharingConsent;
  legal: SharingConsent;
}
interface SharingConsent {
  enabled: boolean;
  purposes: string[];
  recipientTypes: string[];
  geographicRestrictions: string[];
  requiresNotification: boolean;
}
interface ConsentHistoryEntry {
  id: string;
  timestamp: Date;
  action: 'GRANTED' | 'WITHDRAWN' | 'MODIFIED' | 'EXPIRED' | 'RENEWED';
  category: string;
  details: string;
  method: string;
  ipAddress: string;
  userAgent: string;
}
interface DataRightRequest {
  id: string;
  type: DataRequestType;
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  submittedAt: Date;
  completedAt?: Date;
  description: string;
}
type DataRequestType = 'ACCESS' | 'PORTABILITY' | 'RECTIFICATION' | 'ERASURE' | 'RESTRICTION' | 'OBJECTION';
const ConsentPreferenceCenter: React.FC<ConsentPreferenceCenterProps> = ({)
  userId,
  onConsentUpdate,
  onDataRequest,
  showDataRights = true,
  showHistory = true,
  jurisdiction = 'US'
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [settings, setSettings] = useState<ConsentSettings>({)
    categories: {,
      essential: {,
        enabled: true,
        granularChoices: {},
        lastModified: new Date(),
        source: 'SYSTEM',
      },
      functional: {,
        enabled: false,
        granularChoices: {},
        lastModified: new Date(),
        source: 'USER',
      },
      analytics: {,
        enabled: false,
        granularChoices: {},
        lastModified: new Date(),
        source: 'USER',
      },
      marketing: {,
        enabled: false,
        granularChoices: {},
        lastModified: new Date(),
        source: 'USER',
      }
    },
    communications: {,
      email: {,
        enabled: true,
        frequency: 'WEEKLY',
        topics: ['product_updates'],
        quietHours: {,
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC',
        }
      },
      sms: {,
        enabled: false,
        frequency: 'NEVER',
        topics: [],
        quietHours: {,
          enabled: true,
          start: '21:00',
          end: '09:00',
          timezone: 'UTC',
        }
      },
      push: {,
        enabled: true,
        frequency: 'IMMEDIATE',
        topics: ['security_alerts'],
        quietHours: {,
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'UTC',
        }
      },
      phone: {,
        enabled: false,
        frequency: 'NEVER',
        topics: [],
        quietHours: {,
          enabled: true,
          start: '20:00',
          end: '09:00',
          timezone: 'UTC',
        }
      },
      post: {,
        enabled: false,
        frequency: 'NEVER',
        topics: [],
        quietHours: {,
          enabled: false,
          start: '00:00',
          end: '00:00',
          timezone: 'UTC',
        }
      }
    },
    dataProcessing: {,
      analytics: {,
        enabled: false,
        allowAutomatedDecisions: false,
        allowProfiling: false,
        allowSharing: false,
        allowInternationalTransfers: false,
        retentionPeriod: 365,
      },
      personalization: {,
        enabled: false,
        allowAutomatedDecisions: true,
        allowProfiling: true,
        allowSharing: false,
        allowInternationalTransfers: false,
        retentionPeriod: 730,
      },
      marketing: {,
        enabled: false,
        allowAutomatedDecisions: false,
        allowProfiling: false,
        allowSharing: false,
        allowInternationalTransfers: false,
        retentionPeriod: 365,
      },
      research: {,
        enabled: false,
        allowAutomatedDecisions: false,
        allowProfiling: false,
        allowSharing: true,
        allowInternationalTransfers: false,
        retentionPeriod: 1825,
      },
      aiProcessing: {,
        enabled: false,
        allowAutomatedDecisions: false,
        allowProfiling: false,
        allowSharing: false,
        allowInternationalTransfers: false,
        retentionPeriod: 365,
      }
    },
    retention: {,
      minimumRetention: true,
      autoDelete: true,
      customRetentionPeriods: {},
      deleteInactiveData: true,
      inactivityThreshold: 1095 // 3 years
    },
    sharing: {,
      internal: {,
        enabled: true,
        purposes: ['service_provision'],
        recipientTypes: ['subsidiaries'],
        geographicRestrictions: [],
        requiresNotification: false,
      },
      partners: {,
        enabled: false,
        purposes: [],
        recipientTypes: [],
        geographicRestrictions: ['EU', 'US'],
        requiresNotification: true,
      },
      vendors: {,
        enabled: false,
        purposes: [],
        recipientTypes: [],
        geographicRestrictions: ['EU', 'US'],
        requiresNotification: true,
      },
      research: {,
        enabled: false,
        purposes: [],
        recipientTypes: [],
        geographicRestrictions: [],
        requiresNotification: true,
      },
      legal: {,
        enabled: true,
        purposes: ['legal_compliance'],
        recipientTypes: ['authorities'],
        geographicRestrictions: [],
        requiresNotification: false,
      }
    },
    lastUpdated: new Date()
  });
  const [consentHistory, setConsentHistory] = useState<ConsentHistoryEntry[]>([)
    {
      id: 'HIST-001',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      action: 'GRANTED',
      category: 'Essential',
      details: 'Initial consent granted for essential cookies',
      method: 'Banner',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
    },
    {
      id: 'HIST-002',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      action: 'MODIFIED',
      category: 'Analytics',
      details: 'Enabled analytics cookies for better user experience',
      method: 'Preference Center',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
    }
  ]);
  const [dataRequests, setDataRequests] = useState<DataRightRequest[]>([)
    {
      id: 'REQ-001',
      type: 'ACCESS',
      status: 'COMPLETED',
      submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      description: 'Request for copy of personal data'
    }
  ]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isGDPRApplicable = ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI', 'IE', 'PT', 'LU'].includes(jurisdiction);
  const isCCPAApplicable = jurisdiction === 'CA' || jurisdiction === 'US';
  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date()
      };
      setSettings(updatedSettings);
      setLastSaved(new Date());
      onConsentUpdate?.(updatedSettings);
      // Add to history
      const historyEntry: ConsentHistoryEntry = {
        id: `HIST-${Date.now()}`,}
        timestamp: new Date(),
        action: 'MODIFIED',
        category: 'Multiple',
        details: 'Updated consent preferences via Preference Center',
        method: 'Preference Center',
        ipAddress: '192.168.1.1',
        userAgent: navigator.userAgent,
      };
      setConsentHistory(prev => [historyEntry, ...prev]);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  }, [settings, onConsentUpdate]);
  const handleDataRightRequest = useCallback(async (requestType: DataRequestType) => {
    const request: DataRightRequest = {
      id: `REQ-${Date.now()}`,}
      type: requestType,
      status: 'SUBMITTED',
      submittedAt: new Date(),
      description: getRequestDescription(requestType),
    };
    setDataRequests(prev => [request, ...prev]);
    onDataRequest?.(requestType);
  }, [onDataRequest]);
  const getRequestDescription = (type: DataRequestType): string => {
    switch (type) {
    case 'ACCESS': return 'Request for access to personal data';
    case 'PORTABILITY': return 'Request for data portability';
    case 'RECTIFICATION': return 'Request to correct personal data';
    case 'ERASURE': return 'Request to delete personal data';
    case 'RESTRICTION': return 'Request to restrict processing';
    case 'OBJECTION': return 'Objection to data processing';
    default: return 'Data subject rights request';
    }
  };
  const updateCategoryConsent = (category: string, enabled: boolean) => {
    if (category === 'essential' && !enabled) return; // Cannot disable essential
    setSettings(prev => ({)
      ...prev,
      categories: {,
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          enabled,
          lastModified: new Date()
        }
      }
    }));
  };
  const updateCommunicationPreference = (;)
    channel: keyof CommunicationPreferences,
    updates: Partial<ChannelPreference>,
  ) => {
    setSettings(prev => ({)
      ...prev,
      communications: {,
        ...prev.communications,
        [channel]: {
          ...prev.communications[channel],
          ...updates
        }
      }
    }));
  };
  const getSectionIcon = (section: string) => {
    switch (section) {
    case 'overview': return <Settings className="w-5 h-5" />;
    case 'categories': return <Cookie className="w-5 h-5" />;
    case 'communications': return <MessageSquare className="w-5 h-5" />;
    case 'processing': return <Eye className="w-5 h-5" />;
    case 'retention': return <Clock className="w-5 h-5" />;
    case 'sharing': return <Globe className="w-5 h-5" />;
    case 'rights': return <Shield className="w-5 h-5" />;
    case 'history': return <History className="w-5 h-5" />;
    default: return <Settings className="w-5 h-5" />;
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
    case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'IN_PROGRESS': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
    case 'SUBMITTED': return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'REJECTED': return <AlertCircle className="w-4 h-4 text-red-600" />;
    default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };
  return ()
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Preferences</h1>
        <p className="text-gray-600">
          Manage your consent preferences and exercise your data protection rights.
          {isGDPRApplicable && ' You have comprehensive rights under GDPR.'}
          {isCCPAApplicable && ' California residents have additional privacy rights under CCPA.'}
        </p>
        {lastSaved && ()
          <div className="mt-2 flex items-center text-sm text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            Last saved: {lastSaved.toLocaleString()}
          </div>
        )}
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 space-y-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'categories', label: 'Cookie Categories' },
            { id: 'communications', label: 'Communications' },
            { id: 'processing', label: 'Data Processing' },
            { id: 'retention', label: 'Data Retention' },
            { id: 'sharing', label: 'Data Sharing' },
            ...(showDataRights ? [{ id: 'rights', label: 'Your Rights' }] : []),
            ...(showHistory ? [{ id: 'history', label: 'Consent History' }] : [])
          ].map((section) => ()
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {getSectionIcon(section.id)}
              <span className="ml-2">{section.label}</span>
            </button>
          ))}
        </div>
        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {activeSection === 'overview' && ()
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Privacy Overview</h2>
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-medium">Data Protection</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                    <p className="text-sm text-gray-600">All essential protections enabled</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Cookie className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-medium">Cookie Consent</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {Object.values(settings.categories).filter(c => c.enabled).length}
                    </p>
                    <p className="text-sm text-gray-600">Categories enabled</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="font-medium">Communications</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {Object.values(settings.communications).filter(c => c.enabled).length}
                    </p>
                    <p className="text-sm text-gray-600">Channels active</p>
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveSection('categories')}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                    >
                      <Cookie className="w-5 h-5 text-blue-600 mb-2" />
                      <div className="font-medium">Manage Cookies</div>
                      <div className="text-sm text-gray-600">Control cookie categories and preferences</div>
                    </button>
                    <button
                      onClick={() => setActiveSection('rights')}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                    >
                      <Shield className="w-5 h-5 text-green-600 mb-2" />
                      <div className="font-medium">Exercise Rights</div>
                      <div className="text-sm text-gray-600">Access, download, or delete your data</div>
                    </button>
                    <button
                      onClick={() => setActiveSection('communications')}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                    >
                      <MessageSquare className="w-5 h-5 text-purple-600 mb-2" />
                      <div className="font-medium">Communication Settings</div>
                      <div className="text-sm text-gray-600">Manage how we contact you</div>
                    </button>
                    <button
                      onClick={() => setActiveSection('history')}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                    >
                      <History className="w-5 h-5 text-orange-600 mb-2" />
                      <div className="font-medium">View History</div>
                      <div className="text-sm text-gray-600">See your consent and request history</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeSection === 'categories' && ()
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Cookie Categories</h2>
                {Object.entries(settings.categories).map(([category, consent]) => ()
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Cookie className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="font-medium capitalize">{category} Cookies</h3>
                        {category === 'essential' && ()
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Required</span>
                        )}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent.enabled}
                          onChange={(e) => updateCategoryConsent(category, e.target.checked)}
                          disabled={category === 'essential'}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Last modified: {consent.lastModified.toLocaleDateString()}
                    </p>
                    {consent.expiresAt && ()
                      <p className="text-sm text-gray-600">
                        Expires: {consent.expiresAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {activeSection === 'communications' && ()
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Communication Preferences</h2>
                {Object.entries(settings.communications).map(([channel, preference]) => ()
                  <div key={channel} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="font-medium capitalize">{channel}</h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preference.enabled}
                          onChange={(e) => updateCommunicationPreference(channel as keyof CommunicationPreferences, { enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {preference.enabled && ()
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                          <select
                            value={preference.frequency}
                            onChange={(e) => updateCommunicationPreference(channel as keyof CommunicationPreferences, { frequency: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="IMMEDIATE">Immediate</option>
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="NEVER">Never</option>
                          </select>
                        </div>
                        {preference.quietHours.enabled && ()
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quiet Hours Start</label>
                              <input
                                type="time"
                                value={preference.quietHours.start}
                                onChange={(e) => updateCommunicationPreference(channel as keyof CommunicationPreferences, {)
                                  quietHours: { ...preference.quietHours, start: e.target.value }
                                })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quiet Hours End</label>
                              <input
                                type="time"
                                value={preference.quietHours.end}
                                onChange={(e) => updateCommunicationPreference(channel as keyof CommunicationPreferences, {)
                                  quietHours: { ...preference.quietHours, end: e.target.value }
                                })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {activeSection === 'rights' && showDataRights && ()
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Your Data Rights</h2>
                {isGDPRApplicable && ()
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                    <h3 className="font-medium text-blue-900 mb-2">GDPR Rights</h3>
                    <p className="text-sm text-blue-800">
                      Under GDPR, you have comprehensive rights including access, rectification, erasure, 
                      restriction, portability, and objection to processing.
                    </p>
                  </div>
                )}
                {isCCPAApplicable && ()
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                    <h3 className="font-medium text-yellow-900 mb-2">CCPA Rights</h3>
                    <p className="text-sm text-yellow-800">
                      California residents have the right to know, delete, opt-out of sale, 
                      and non-discrimination for exercising privacy rights.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleDataRightRequest('ACCESS')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <Download className="w-6 h-6 text-blue-600 mb-2" />
                    <h3 className="font-medium mb-1">Access My Data</h3>
                    <p className="text-sm text-gray-600">Download a copy of your personal data</p>
                  </button>
                  <button
                    onClick={() => handleDataRightRequest('PORTABILITY')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <FileText className="w-6 h-6 text-green-600 mb-2" />
                    <h3 className="font-medium mb-1">Data Portability</h3>
                    <p className="text-sm text-gray-600">Export data in a machine-readable format</p>
                  </button>
                  <button
                    onClick={() => handleDataRightRequest('RECTIFICATION')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <Edit className="w-6 h-6 text-orange-600 mb-2" />
                    <h3 className="font-medium mb-1">Correct My Data</h3>
                    <p className="text-sm text-gray-600">Request correction of inaccurate data</p>
                  </button>
                  <button
                    onClick={() => handleDataRightRequest('ERASURE')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <Trash2 className="w-6 h-6 text-red-600 mb-2" />
                    <h3 className="font-medium mb-1">Delete My Data</h3>
                    <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                  </button>
                  <button
                    onClick={() => handleDataRightRequest('RESTRICTION')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <Shield className="w-6 h-6 text-purple-600 mb-2" />
                    <h3 className="font-medium mb-1">Restrict Processing</h3>
                    <p className="text-sm text-gray-600">Limit how we process your data</p>
                  </button>
                  <button
                    onClick={() => handleDataRightRequest('OBJECTION')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <AlertCircle className="w-6 h-6 text-gray-600 mb-2" />
                    <h3 className="font-medium mb-1">Object to Processing</h3>
                    <p className="text-sm text-gray-600">Object to certain types of processing</p>
                  </button>
                </div>
                {/* Recent Requests */}
                {dataRequests.length > 0 && ()
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium mb-4">Recent Requests</h3>
                    <div className="space-y-3">
                      {dataRequests.map((request) => ()
                        <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                          <div className="flex items-center">
                            {getStatusIcon(request.status)}
                            <div className="ml-3">
                              <div className="font-medium">{request.type}</div>
                              <div className="text-sm text-gray-600">{request.description}</div>
                              <div className="text-xs text-gray-500">
                                Submitted: {request.submittedAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                request.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeSection === 'history' && showHistory && ()
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Consent History</h2>
                <div className="space-y-3">
                  {consentHistory.map((entry) => ()
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <History className="w-4 h-4 text-gray-600 mr-2" />
                            <span className="font-medium">{entry.action}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{entry.category}</span>
                          </div>
                          <p className="text-sm text-gray-800 mb-2">{entry.details}</p>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span>Method: {entry.method}</span>
                            <span>IP: {entry.ipAddress}</span>
                            <span>{entry.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className={`px-6 py-3 rounded-lg shadow-lg font-medium transition-all ${
            saving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
          }`}
        >
          {saving ? ()
            <div className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </div>
          ) : ()
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );
};

export default ConsentPreferenceCenter;