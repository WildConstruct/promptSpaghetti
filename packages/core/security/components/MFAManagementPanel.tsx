/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * MFA Management Panel
 * 
 * Comprehensive UI component for managing multi-factor authentication settings.
 * Allows users to enable/disable MFA methods, configure backup codes, manage
 * trusted devices, and view security history.
 * 
 * Features:
 * - TOTP setup and management
 * - SMS verification configuration
 * - Email verification settings
 * - Backup codes generation and management
 * - Trusted device management
 * - Security event history
 * - Recovery options configuration
 * - Real-time status updates
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Shield, 
  Smartphone, 
  Mail, 
  Key, 
  Download, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  Clock,
  MapPin }
  Monitor
 from 'lucide-react';

// Types for MFA management


interface MFAMethod { id: string;
  type: 'totp' | 'sms' | 'email' | 'backup_codes';
  name: string;
  enabled: boolean;
  primary: boolean;
  configuredAt: Date;
  lastUsed?: Date;
  configuration?: { }
  phoneNumber?: string;
  email?: string;
  appName?: string;
  secretKey?: string;


};


interface BackupCode { id: string;
  code: string;
  used: boolean;
  usedAt?: Date;
  interface TrustedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  addedAt: Date;
  lastAccess: Date;
  current: boolean;
  interface SecurityEvent {
  id: string;
  type: 'login' | 'mfa_enabled' | 'mfa_disabled' | 'device_added' | 'device_removed' | 'backup_used';
  description: string;
  timestamp: Date;
  ipAddress: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high';
  interface MFASettings {
  requireMFA: boolean;
  allowBackupCodes: boolean;
  trustedDeviceExpiry: number; // days;
  maxTrustedDevices: number;
  sessionTimeout: number; // minutes;
  emailNotifications: boolean;
  smsNotifications: boolean;
  interface MFAManagementProps {
  userId: string;
  onMFAStatusChange?: (enabled: boolean) => void;
  onSecurityEvent?: (event: SecurityEvent) => void;
  className?: string;
  export const MFAManagementPanel: React.FC<MFAManagementProps> = ({);
  userId;
  onMFAStatusChange;
  onSecurityEvent }
  className = ''


}) => { // State management
  const [mfaMethods, setMFAMethods] = useState<MFAMethod>([]);
  const [backupCodes, setBackupCodes] = useState<BackupCode>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent>([]);
  const [settings, setSettings] = useState<MFASettings>({)
  requireMFA: false
  allowBackupCodes: true
  trustedDeviceExpiry: 30
  maxTrustedDevices: 5
  sessionTimeout: 30
  emailNotifications: true
  smsNotifications: false }
});
  const [activeTab, setActiveTab] = useState<'methods' | 'backup' | 'devices' | 'history' | 'settings'>('methods');
  const [loading, setLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [totpQRCode, setTotpQRCode] = useState<string>('');
  const [setupMethod, setSetupMethod] = useState<string>('');
  // Load MFA data on component mount
  useEffect(() => { loadMFAData() }, [userId]);
  const loadMFAData = async () => { setLoading(true);
    try {
      // In a real implementation, these would be API calls
      await Promise.all([)
        loadMFAMethods()
        loadBackupCodes()
        loadTrustedDevices()
        loadSecurityEvents() }
        loadSettings();
      ]);
 catch (error) { console.error('Failed to load MFA data:', error) } finally { setLoading(false) };
  const loadMFAMethods = async () => { // Mock data - replace with actual API call
  const methods: MFAMethod = [
  {
  id: 'totp-1'
  type: 'totp'
  name: 'Authenticator App'
  enabled: true
  primary: true
  configuredAt: new Date('2024-01-15')
  lastUsed: new Date('2024-07-19')
  configuration: {
  appName: 'Google Authenticator' }

      { id: 'sms-1'
  type: 'sms'
  name: 'SMS Verification'
  enabled: false
  primary: false
  configuredAt: new Date('2024-02-01')
  configuration: {
  phoneNumber: '+1 (555) 123-4567' }

      { id: 'email-1'
  type: 'email'
  name: 'Email Verification'
  enabled: true
  primary: false
  configuredAt: new Date('2024-01-10')
  lastUsed: new Date('2024-07-18')
  configuration: { }
  email: 'user@example.com'];
  setMFAMethods(methods);
};
  const loadBackupCodes = async () => {
    // Mock data - replace with actual API call
    const codes: BackupCode = [
      { id: '1', code: 'ABC123DEF', used: false }
      { id: '2', code: 'GHI456JKL', used: true, usedAt: new Date('2024-06-15') }
      { id: '3', code: 'MNO789PQR', used: false }
      { id: '4', code: 'STU012VWX', used: false }
      { id: '5', code: 'YZ1234ABC', used: false }
    ];
    setBackupCodes(codes);
  };
  const loadTrustedDevices = async () => { // Mock data - replace with actual API call
  const devices: TrustedDevice = [
  {
  id: 'device-1'
  name: 'MacBook Pro'
  type: 'desktop'
  browser: 'Chrome 126'
  location: 'San Francisco, CA'
  addedAt: new Date('2024-07-01')
  lastAccess: new Date('2024-07-20')
  current: true }

      { id: 'device-2'
  name: 'iPhone 15 Pro'
  type: 'mobile'
  browser: 'Safari'
  location: 'San Francisco, CA'
  addedAt: new Date('2024-06-15')
  lastAccess: new Date('2024-07-19') }
  current: false];
  setTrustedDevices(devices);
};
  const loadSecurityEvents = async () => { // Mock data - replace with actual API call
  const events: SecurityEvent = [
  {
  id: 'event-1'
  type: 'login'
  description: 'Successful login with TOTP'
  timestamp: new Date('2024-07-20T10:30:00')
  ipAddress: '192.168.1.100'
  location: 'San Francisco, CA'
  riskLevel: 'low' }

      { id: 'event-2'
  type: 'mfa_enabled'
  description: 'Email verification enabled'
  timestamp: new Date('2024-07-19T15:45:00')
  ipAddress: '192.168.1.100'
  location: 'San Francisco, CA'
  riskLevel: 'low' }

      { id: 'event-3'
  type: 'device_added'
  description: 'New trusted device added: iPhone 15 Pro'
  timestamp: new Date('2024-06-15T09:15:00')
  ipAddress: '10.0.0.50'
  location: 'San Francisco, CA' }
  riskLevel: 'medium'];
  setSecurityEvents(events);
};
  const loadSettings = async () => { // Mock data - replace with actual API call
  const userSettings: MFASettings = {
  requireMFA: true
  allowBackupCodes: true
  trustedDeviceExpiry: 30
  maxTrustedDevices: 5
  sessionTimeout: 30
  emailNotifications: true
  smsNotifications: false }
};
    setSettings(userSettings);
  };
  // Event handlers
  const handleToggleMFAMethod = async (methodId: string, enabled: boolean) => {
    setLoading(true);
    try {
      // API call to toggle MFA method
      setMFAMethods(prev => )
        prev.map(method => )
          method.id === methodId 
            ? { ...method, enabled }
            : method
      );
      const hasEnabledMethods = mfaMethods.some(m => m.id !== methodId && m.enabled) || enabled;
      onMFAStatusChange?.(hasEnabledMethods);
 catch (error) { console.error('Failed to toggle MFA method:', error) } finally { setLoading(false) };
  const handleSetupTOTP = async () => { setLoading(true);
    try {
      // Generate TOTP secret and QR code
      const secret = generateTOTPSecret();
      const qrCode = generateQRCode(secret);
      setTotpSecret(secret);
      setTotpQRCode(qrCode);
      setSetupMethod('totp') } catch (error) { console.error('Failed to setup TOTP:', error) } finally { setLoading(false) };
  const handleSetupSMS = async (phoneNumber: string) => { setLoading(true);
    try {
      // API call to setup SMS verification
      const newMethod: MFAMethod = { }
  id: `sms-${Date.now()}`}

  type: 'sms'
        name: 'SMS Verification'
        enabled: true
        primary: false
        configuredAt: new Date()
        configuration: { phoneNumber }
      };
      setMFAMethods(prev => [...prev, newMethod]);
      setSetupMethod('');
 catch (error) { console.error('Failed to setup SMS:', error) } finally { setLoading(false) };
  const handleGenerateBackupCodes = async () => {
    setLoading(true);
    try {
      // Generate new backup codes
      const newCodes: BackupCode = Array.from({ length: 10 }, (_, i) => ({)
  id: `backup-${Date.now()}-${i}`}

  code: generateBackupCode()
        used: false;
  }));
      setBackupCodes(newCodes);
 catch (error) { console.error('Failed to generate backup codes:', error) } finally { setLoading(false) };
  const handleRemoveTrustedDevice = async (deviceId: string) => { setLoading(true);
    try {
      setTrustedDevices(prev => prev.filter(device => device.id !== deviceId)) } catch (error) { console.error('Failed to remove trusted device:', error) } finally { setLoading(false) };
  const handleUpdateSettings = async (newSettings: Partial<MFASettings>) => {
    setLoading(true);
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
 catch (error) { console.error('Failed to update settings:', error) } finally { setLoading(false) };
  // Helper functions
  const generateTOTPSecret = (): string => {
    return 'JBSWY3DPEHPK3PXP'; // Mock secret
  };
  const generateQRCode = (secret: string): string => { return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`; // Mock QR code }
};
  const generateBackupCode = (): string => { return Math.random().toString(36).substring(2, 11).toUpperCase() };
  const getSeverityColor = (riskLevel: string): string => { switch (riskLevel) {
  case 'high': return 'text-red-600';
  case 'medium': return 'text-yellow-600';
  case 'low': return 'text-green-600';
  default: return 'text-gray-600' };
  const getDeviceIcon = (type: string) => { switch (type) {
  case 'mobile': return <Smartphone className="w-4 h-4" />;
  case 'tablet': return <Smartphone className="w-4 h-4" />;
  default: return <Monitor className="w-4 h-4" /> };
  return;
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>}
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Multi-Factor Authentication</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Secure your account with additional verification methods
        </p>
      </div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'methods', label: 'Methods', icon: Key }
            { id: 'backup', label: 'Backup Codes', icon: Download }
            { id: 'devices', label: 'Trusted Devices', icon: Monitor }
            { id: 'history', label: 'Security History', icon: Clock }
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(({ id, label, icon: Icon }) => ()
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={ `flex items-center space-x-2 py-4 text-sm font-medium border-b-2 ${
  activeTab === id
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }
`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {loading && ()
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        )}
        {/* MFA Methods Tab */}
        {activeTab === 'methods' && !loading && ()
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Authentication Methods</h3>
              <button
                onClick={() => setSetupMethod('select')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Method
              </button>
            </div>
            {/* Method List */}
            <div className="space-y-4">
              {mfaMethods.map((method) => ()
                <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {method.type === 'totp' && <Smartphone className="w-5 h-5 text-blue-600" />}
                      {method.type === 'sms' && <Smartphone className="w-5 h-5 text-green-600" />}
                      {method.type === 'email' && <Mail className="w-5 h-5 text-purple-600" />}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{method.name}</h4>
                        <p className="text-xs text-gray-500">
                          {method.configuration?.phoneNumber || method.configuration?.email || method.configuration?.appName}
                        </p>
                        {method.primary && ()
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {method.lastUsed && ()
                        <span className="text-xs text-gray-500">
                          Last used: {method.lastUsed.toLocaleDateString()}
                        </span>
                      )}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={method.enabled}
                          onChange={(e) => handleToggleMFAMethod(method.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Setup Method Modal */}
            {setupMethod && ()
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {setupMethod === 'select' ? 'Choose Authentication Method' : 'Setup Authentication'}
                  </h3>
                  {setupMethod === 'select' && ()
                    <div className="space-y-3">
                      <button
                        onClick={handleSetupTOTP}
                        className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium">Authenticator App</div>
                          <div className="text-sm text-gray-500">Use Google Authenticator, Authy, etc.</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setSetupMethod('sms')}
                        className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Smartphone className="w-5 h-5 text-green-600" />
                        <div className="text-left">
                          <div className="font-medium">SMS Verification</div>
                          <div className="text-sm text-gray-500">Receive codes via text message</div>
                        </div>
                      </button>
                    </div>
                  )}
                  {setupMethod === 'totp' && ()
                    <div className="space-y-4">
                      <div className="text-center">
                        <img src={totpQRCode} alt="QR Code" className="mx-auto w-32 h-32 border" />
                        <p className="mt-2 text-sm text-gray-600">
                          Scan this QR code with your authenticator app
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-2">Or enter this code manually:</p>
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {totpSecret}
                        </code>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setSetupMethod('')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setSetupMethod('')}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Complete Setup
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Backup Codes Tab */}
        {activeTab === 'backup' && !loading && ()
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Backup Codes</h3>
                <p className="text-sm text-gray-600">
                  Use these one-time codes if you lose access to your other authentication methods
                </p>
              </div>
              <button
                onClick={handleGenerateBackupCodes}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Codes
              </button>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Save these codes in a secure location. Each code can only be used once.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">
                  {backupCodes.filter(c => !c.used).length} of {backupCodes.length} codes remaining
                </span>
                <button
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  {showBackupCodes ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showBackupCodes ? 'Hide' : 'Show'} Codes
                </button>
              </div>
              {showBackupCodes && ()
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code) => ()
                    <div
                      key={code.id}
                      className={ `p-3 rounded-lg border font-mono text-sm ${
  code.used
  ? 'bg-gray-50 border-gray-200 text-gray-400 line-through'
  : 'bg-white border-gray-300 text-gray-900' }
`}
                    >
                      {code.code}
                      {code.used && code.usedAt && ()
                        <div className="text-xs text-gray-500 mt-1">
                          Used {code.usedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Trusted Devices Tab */}
        {activeTab === 'devices' && !loading && ()
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Trusted Devices</h3>
              <p className="text-sm text-gray-600">
                Devices you've marked as trusted won't require MFA for {settings.trustedDeviceExpiry} days
              </p>
            </div>
            <div className="space-y-4">
              {trustedDevices.map((device) => ()
                <div key={device.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {device.name}
                          {device.current && ()
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Current Device
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {device.browser} • {device.location}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added {device.addedAt.toLocaleDateString()} • Last access {device.lastAccess.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!device.current && ()
                      <button
                        onClick={() => handleRemoveTrustedDevice(device.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Security History Tab */}
        {activeTab === 'history' && !loading && ()
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Security History</h3>
              <p className="text-sm text-gray-600">
                Recent security events and authentication activity
              </p>
            </div>
            <div className="space-y-4">
              {securityEvents.map((event) => ()
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={ `w-2 h-2 rounded-full mt-2 ${
  event.riskLevel === 'high' ? 'bg-red-500' :
  event.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500' }
`} />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{event.description}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.timestamp.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </span>
                          <span>{event.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                    <span className={ `text-xs font-medium px-2 py-1 rounded-full ${
  event.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
  event.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : }
  'bg-green-100 text-green-800'
`}>
                      {event.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Settings Tab */}
        {activeTab === 'settings' && !loading && ()
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">MFA Settings</h3>
              <p className="text-sm text-gray-600">
                Configure how multi-factor authentication works for your account
              </p>
            </div>
            <div className="space-y-6">
              {/* Require MFA */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Require MFA</h4>
                  <p className="text-sm text-gray-500">Always require MFA for login</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireMFA}
                    onChange={(e) => handleUpdateSettings({ requireMFA: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {/* Trusted Device Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trusted Device Expiry
                </label>
                <select
                  value={settings.trustedDeviceExpiry}
                  onChange={(e) => handleUpdateSettings({ trustedDeviceExpiry: parseInt(e.target.value) })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={365}>1 year</option>
                </select>
              </div>
              {/* Session Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout
                </label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleUpdateSettings({ sessionTimeout: parseInt(e.target.value) })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
              {/* Notifications */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Notifications</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-700">Email notifications</span>
                    <p className="text-xs text-gray-500">Receive security alerts via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleUpdateSettings({ emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-700">SMS notifications</span>
                    <p className="text-xs text-gray-500">Receive security alerts via text</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleUpdateSettings({ smsNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MFAManagementPanel;