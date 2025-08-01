/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * MFA Management Hook
 * 
 * Custom React hook for managing multi-factor authentication state and operations.
 * Provides a clean API for components to interact with MFA services and state.
 * 
 * Features:
 * - MFA method management (enable/disable/configure)
 * - Backup codes generation and management
 * - Trusted device management
 * - Security event tracking
 * - Real-time status updates
 * - Error handling and loading states
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { verificationCodeManager } from '../VerificationCodeManager';
import { passwordResetTokenManager } from '../PasswordResetTokenManager';
import { mfaRetryHandler, MFAOperation, OperationResult } from '../services/MFARetryHandler';

// Types


export interface MFAMethod { id: string;
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


export interface BackupCode { id: string;
  code: string;
  used: boolean;
  usedAt?: Date }



export interface TrustedDevice { id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' }
  browser: string;
  location: string;
  addedAt: Date;
  lastAccess: Date;
  current: boolean;




export interface SecurityEvent { id: string;
  type: 'login' | 'mfa_enabled' | 'mfa_disabled' | 'device_added' | 'device_removed' | 'backup_used';
  description: string;
  timestamp: Date;
  ipAddress: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high' }




export interface MFASettings { requireMFA: boolean;
  allowBackupCodes: boolean;
  trustedDeviceExpiry: number;
  maxTrustedDevices: number;
  sessionTimeout: number;
  emailNotifications: boolean;
  smsNotifications: boolean }



export interface MFAStatus { enabled: boolean;
  methodsConfigured: number;
  primaryMethod?: string;
  backupCodesRemaining: number;
  trustedDevicesCount: number;
  lastSecurityEvent?: SecurityEvent }



export interface UseMFAManagementOptions { userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (status: MFAStatus) => void;
  onSecurityEvent?: (event: SecurityEvent) => void;
  onError?: (error: Error) => void;
  enableRetryHandling?: boolean;
  maxRetryAttempts?: number;
  retryTimeoutMs?: number }



export interface UseMFAManagementReturn { // State
  mfaMethods: MFAMethod;
  backupCodes: BackupCode;
  trustedDevices: TrustedDevice;
  securityEvents: SecurityEvent;
  settings: MFASettings;
  status: MFAStatus;
  loading: boolean;
  error: Error | null;
  // Retry and timeout state
  retryCount: number;
  isRetrying: boolean;
  lastRetryError: Error | null;
  operationTimeout: boolean;
  // MFA Method Management
  enableMethod: (methodId: string) => Promise<void> }
  disableMethod: (methodId: string) => Promise<void>;


  setupTOTP: (userId: string) => Promise<{ secret: string; qrCode: string }>;
  setupSMS: (phoneNumber: string) => Promise<void>
  setupEmail: (email: string) => Promise<void>
  removeMethod: (methodId: string) => Promise<void>
  setPrimaryMethod: (methodId: string) => Promise<void>;
  // Backup Code Management
  generateBackupCodes: () => Promise<BackupCode>
  downloadBackupCodes: () => void;
  markBackupCodeUsed: (codeId: string) => Promise<void>;
  // Trusted Device Management
  addTrustedDevice: (device: Omit<TrustedDevice, 'id' | 'addedAt'>) => Promise<void>;
  removeTrustedDevice: (deviceId: string) => Promise<void>
  refreshDeviceAccess: (deviceId: string) => Promise<void>;
  // Settings Management
  updateSettings: (newSettings: Partial<MFASettings>) => Promise<void>
  resetSettings: () => Promise<void>;
  // Security Events
  getSecurityEvents: (limit?: number, offset?: number) => Promise<SecurityEvent>;
  clearSecurityEvents: () => Promise<void>;
  // Utility Functions
  validateMFACode: (code: string, methodType: string) => Promise<boolean>
  testNotifications: () => Promise<void>;
  exportSecurityData: () => Promise<Blob>
  refresh: () => Promise<void>;

export const useMFAManagement = (options: UseMFAManagementOptions): UseMFAManagementReturn => { const {
    userId
    autoRefresh = true
    refreshInterval = 30000, // 30 seconds
    onStatusChange
    onSecurityEvent
    onError
    enableRetryHandling = true
    maxRetryAttempts = 3 }
    retryTimeoutMs = 10000
 = options;
  // State
  const [mfaMethods, setMFAMethods] = useState<MFAMethod>([]);
  const [backupCodes, setBackupCodes] = useState<BackupCode>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent>([]);
  const [settings, setSettings] = useState<MFASettings>({ )
  requireMFA: false
  allowBackupCodes: true
  trustedDeviceExpiry: 30
  maxTrustedDevices: 5
  sessionTimeout: 30
  emailNotifications: true
  smsNotifications: false }
});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Retry and timeout state
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastRetryError, setLastRetryError] = useState<Error | null>(null);
  const [operationTimeout, setOperationTimeout] = useState(false);
  // Refs for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);
  // Computed status
  const status: MFAStatus = { 
  enabled: mfaMethods.some(method => method.enabled)
  methodsConfigured: mfaMethods.filter(method => method.enabled).length
  primaryMethod: mfaMethods.find(method => method.primary)?.name
  backupCodesRemaining: backupCodes.filter(code => !code.used).length
  trustedDevicesCount: trustedDevices.length
  lastSecurityEvent: securityEvents[0] }
};
  // Error handling helper
  const handleError = useCallback((err: Error) => { if (isMountedRef.current) {
      setError(err);
      onError?.(err) }, [onError]);
  // API simulation helpers (replace with actual API calls)
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  // Enhanced operation executor with retry handling
  const executeWithRetry = useCallback(async <T>(;);
    operation: MFAOperation
    operationFn: () => Promise<T>
    context: any = {}
  ): Promise<T> => { if (!enableRetryHandling) {
  return await operationFn();
  setRetryCount(0);
  setIsRetrying(false);
  setLastRetryError(null);
  setOperationTimeout(false);
  const result: OperationResult<T> = await mfaRetryHandler.executeWithRetry()
  operation
  operationFn
  {
  userId
  sessionId: 'current-session' }
  metadata: context);
  // Update retry state
  setRetryCount(result.attempts.length);
  setIsRetrying(false);
  setOperationTimeout(result.attempts.some(attempt => attempt.timeoutReached));
  if (!result.success) { setLastRetryError(result.error || new Error('Operation failed after retries'));
  if (result.circuitBreakerTriggered) {
  throw new Error('Service temporarily unavailable. Please try again later.');
  if (result.rateLimited) {
  throw new Error('Too many requests. Please wait before trying again.');
  throw result.error || new Error('Operation failed');
  return result.data! }, [enableRetryHandling, userId]);
  // Listen to retry handler events
  useEffect(() => { if (!enableRetryHandling) return;
  const handleOperationRetry = (data: any) => {
  if (data.context?.userId === userId) {
  onSecurityEvent?.('mfa_operation_retry', {)
  operation: data.operation
  attempt: data.context.attempt
  timestamp: new Date() }
});
    };
    const handleOperationFailure = (data: any) => { if (data.context?.userId === userId) {
        setLastRetryError(data.error);
        setIsRetrying(false) };
    const handleCircuitBreakerOpened = (data: any) => { if (data.context?.userId === userId) {
  onSecurityEvent?.('mfa_circuit_breaker_opened', {)
  operation: data.operation
  failureCount: data.failureCount
  timestamp: new Date() }
});
    };
    mfaRetryHandler.on('operationFailure', handleOperationFailure);
    mfaRetryHandler.on('circuitBreakerOpened', handleCircuitBreakerOpened);
    return () => { mfaRetryHandler.off('operationFailure', handleOperationFailure);
      mfaRetryHandler.off('circuitBreakerOpened', handleCircuitBreakerOpened) };
  }, [enableRetryHandling, userId, onSecurityEvent]);
  // Data loading functions
  const loadMFAMethods = async (): Promise<MFAMethod> => { await delay(100); // Simulate API call
    return [
      {
        id: 'totp-1'
        type: 'totp'
        name: 'Authenticator App'
        enabled: true
        primary: true
        configuredAt: new Date('2024-01-15')
        lastUsed: new Date('2024-07-19') }
        configuration: { appName: 'Google Authenticator' }

      { id: 'sms-1'
        type: 'sms'
        name: 'SMS Verification'
        enabled: false
        primary: false
        configuredAt: new Date('2024-02-01') }
        configuration: { phoneNumber: '+1 (555) 123-4567' }
    ];
  };
  const loadBackupCodes = async (): Promise<BackupCode> => {
    await delay(50);
    return [
      { id: '1', code: 'ABC123DEF', used: false }
      { id: '2', code: 'GHI456JKL', used: true, usedAt: new Date('2024-06-15') }
      { id: '3', code: 'MNO789PQR', used: false }
      { id: '4', code: 'STU012VWX', used: false }
      { id: '5', code: 'YZ1234ABC', used: false }
    ];
  };
  const loadTrustedDevices = async (): Promise<TrustedDevice> => { await delay(75);
  return [
  {
  id: 'device-1'
  name: 'MacBook Pro'
  type: 'desktop'
  browser: 'Chrome 126'
  location: 'San Francisco, CA'
  addedAt: new Date('2024-07-01')
  lastAccess: new Date() }
  current: true];
};
  const loadSecurityEvents = async (): Promise<SecurityEvent> => { await delay(100);
  return [
  {
  id: 'event-1'
  type: 'login'
  description: 'Successful login with TOTP'
  timestamp: new Date()
  ipAddress: '192.168.1.100'
  location: 'San Francisco, CA' }
  riskLevel: 'low'];
};
  const loadSettings = async (): Promise<MFASettings> => { await delay(25);
  return {
  requireMFA: true
  allowBackupCodes: true
  trustedDeviceExpiry: 30
  maxTrustedDevices: 5
  sessionTimeout: 30
  emailNotifications: true
  smsNotifications: false }
};
  };
  // Main data refresh function
  const refresh = useCallback(async () => { if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const [methods, codes, devices, events, userSettings] = await Promise.all([)
        loadMFAMethods()
        loadBackupCodes()
        loadTrustedDevices()
        loadSecurityEvents() }
        loadSettings();
      ]);
      if (isMountedRef.current) { setMFAMethods(methods);
        setBackupCodes(codes);
        setTrustedDevices(devices);
        setSecurityEvents(events);
        setSettings(userSettings) } catch (err) { handleError(err instanceof Error ? err : new Error('Failed to load MFA data')) } finally { if (isMountedRef.current) {
        setLoading(false) }, [handleError]);
  // MFA Method Management
  const enableMethod = useCallback(async (methodId: string) => { try {
      setLoading(true);
      await executeWithRetry()
        MFAOperation.METHOD_SETUP }
        async () => {
          await delay(200); // Simulate API call
          return { success: true, methodId };

        { methodId, action: 'enable' }
      );
      setMFAMethods(prev => )
        prev.map(method => )
          method.id === methodId 
            ? { ...method, enabled: true }
            : method
      );
      // Log security event
      const event: SecurityEvent = {
  id: `event-${Date.now()}`}

  type: 'mfa_enabled'
        description: `MFA method enabled: ${mfaMethods.find(m => m.id === methodId)?.name}`}

  timestamp: new Date()
        ipAddress: '192.168.1.100'
        location: 'San Francisco, CA'
        riskLevel: 'low';
  };
      setSecurityEvents(prev => [event, ...prev]);
      onSecurityEvent?.(event);
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to enable MFA method')) } finally { setLoading(false) }, [mfaMethods, handleError, onSecurityEvent, executeWithRetry]);
  const disableMethod = useCallback(async (methodId: string) => { try {
      setLoading(true);
      await executeWithRetry()
        MFAOperation.METHOD_DISABLE }
        async () => {
          await delay(200);
          return { success: true, methodId };

        { methodId, action: 'disable' }
      );
      setMFAMethods(prev => )
        prev.map(method => )
          method.id === methodId 
            ? { ...method, enabled: false, primary: false }
            : method
      );
      const event: SecurityEvent = {
  id: `event-${Date.now()}`}

  type: 'mfa_disabled'
        description: `MFA method disabled: ${mfaMethods.find(m => m.id === methodId)?.name}`}

  timestamp: new Date()
        ipAddress: '192.168.1.100'
        location: 'San Francisco, CA'
        riskLevel: 'medium';
  };
      setSecurityEvents(prev => [event, ...prev]);
      onSecurityEvent?.(event);
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to disable MFA method')) } finally { setLoading(false) }, [mfaMethods, handleError, onSecurityEvent, executeWithRetry]);
  const setupTOTP = useCallback(async (userId: string): Promise<{ secret: string; qrCode: string }> => { try {
      setLoading(true);
      const result = await executeWithRetry(;);
        MFAOperation.METHOD_SETUP }
        async () => {
          await delay(300);
          const secret = 'JBSWY3DPEHPK3PXP'; // Mock secret;
          const qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
          return { secret, qrCode };

        { userId, methodType: 'totp' }
      );
      return result;
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to setup TOTP'));
  throw err } finally { setLoading(false) }, [handleError, executeWithRetry]);
  const setupSMS = useCallback(async (phoneNumber: string) => { try {
      setLoading(true);
      await delay(300);
      const newMethod: MFAMethod = { }
  id: `sms-${Date.now()}`}
},
  type: 'sms',
        name: 'SMS Verification',
        enabled: true,
        primary: false,
        configuredAt: new Date(),
        configuration: { phoneNumber }
      };
      setMFAMethods(prev => [...prev, newMethod]);
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to setup SMS'));
  throw err } finally { setLoading(false) }, [handleError]);
  const setupEmail = useCallback(async (email: string) => { try {
      setLoading(true);
      await delay(300);
      const newMethod: MFAMethod = { }
  id: `email-${Date.now()}`}
},
  type: 'email',
        name: 'Email Verification',
        enabled: true,
        primary: false,
        configuredAt: new Date(),
        configuration: { email }
      };
      setMFAMethods(prev => [...prev, newMethod]);
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to setup email'));
  throw err } finally { setLoading(false) }, [handleError]);
  const removeMethod = useCallback(async (methodId: string) => { try {
      setLoading(true);
      await delay(200);
      setMFAMethods(prev => prev.filter(method => method.id !== methodId)) } catch (err) { handleError(err instanceof Error ? err : new Error('Failed to remove MFA method')) } finally { setLoading(false) }, [handleError]);
  const setPrimaryMethod = useCallback(async (methodId: string) => { try {
  setLoading(true);
  await delay(200);
  setMFAMethods(prev => )
  prev.map(method => ({)
  ...method,
  primary: method.id === methodId }
}))
      );
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to set primary method')) } finally { setLoading(false) }, [handleError]);
  // Backup Code Management
  const generateBackupCodes = useCallback(async (): Promise<BackupCode> => {
    try {
      setLoading(true);
      await delay(500);
      const newCodes: BackupCode = Array.from({ length: 10 }, (_, i) => ({)
  id: `backup-${Date.now()}-${i}`}

  code: Math.random().toString(36).substring(2, 11).toUpperCase()
        used: false;
  }));
      setBackupCodes(newCodes);
      return newCodes;
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to generate backup codes'));
  throw err } finally { setLoading(false) }, [handleError]);
  const downloadBackupCodes = useCallback(() => {
    const codesText = backupCodes;
      .map(code => `${code.code}${code.used ? ' (used)' : ''}`)}
      .join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [backupCodes]);
  const markBackupCodeUsed = useCallback(async (codeId: string) => {
    try {
      await delay(100);
      setBackupCodes(prev => )
        prev.map(code => )
          code.id === codeId 
            ? { ...code, used: true, usedAt: new Date() }
            : code
      );
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to mark backup code as used')) }, [handleError]);
  // Trusted Device Management
  const addTrustedDevice = useCallback(async (device: Omit<TrustedDevice, 'id' | 'addedAt'>) => { try {
      setLoading(true);
      await delay(200);
      const newDevice: TrustedDevice = {
        ...device }
        id: `device-${Date.now()}`}

  addedAt: new Date();
  };
      setTrustedDevices(prev => [...prev, newDevice]);
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to add trusted device')) } finally { setLoading(false) }, [handleError]);
  const removeTrustedDevice = useCallback(async (deviceId: string) => { try {
      setLoading(true);
      await delay(200);
      setTrustedDevices(prev => prev.filter(device => device.id !== deviceId)) } catch (err) { handleError(err instanceof Error ? err : new Error('Failed to remove trusted device')) } finally { setLoading(false) }, [handleError]);
  const refreshDeviceAccess = useCallback(async (deviceId: string) => {
    try {
      await delay(100);
      setTrustedDevices(prev => )
        prev.map(device => )
          device.id === deviceId 
            ? { ...device, lastAccess: new Date() }
            : device
      );
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to refresh device access')) }, [handleError]);
  // Settings Management
  const updateSettings = useCallback(async (newSettings: Partial<MFASettings>) => {
    try {
      setLoading(true);
      await delay(200);
      setSettings(prev => ({ ...prev, ...newSettings }));
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to update settings')) } finally { setLoading(false) }, [handleError]);
  const resetSettings = useCallback(async () => { try {
  setLoading(true);
  await delay(200);
  const defaultSettings: MFASettings = {
  requireMFA: false
  allowBackupCodes: true
  trustedDeviceExpiry: 30
  maxTrustedDevices: 5
  sessionTimeout: 30
  emailNotifications: true
  smsNotifications: false }
};
      setSettings(defaultSettings);
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to reset settings')) } finally { setLoading(false) }, [handleError]);
  // Security Events
  const getSecurityEvents = useCallback(async (limit = 50, offset = 0): Promise<SecurityEvent> => { try {
      await delay(100);
      return securityEvents.slice(offset, offset + limit) } catch (err) { handleError(err instanceof Error ? err : new Error('Failed to get security events'));
  throw err }, [securityEvents, handleError]);
  const clearSecurityEvents = useCallback(async () => { try {
      setLoading(true);
      await delay(200);
      setSecurityEvents([]) } catch (err) { handleError(err instanceof Error ? err : new Error('Failed to clear security events')) } finally { setLoading(false) }, [handleError]);
  // Utility Functions
  const validateMFACode = useCallback(async (code: string, methodType: string): Promise<boolean> => { try {
  const operation = methodType === 'totp' ? MFAOperation.TOTP_VERIFICATION :,;
  methodType === 'sms' ? MFAOperation.SMS_VERIFICATION :
  MFAOperation.EMAIL_VERIFICATION;
  const result = await executeWithRetry(;);
  operation }
  async () => { await delay(300);
  // Mock validation - in real implementation, this would call the verification service
  if (code.length < 4) {
  throw new Error('Invalid code format');
  return code.length >= 4 }
        { code, methodType }
      );
      return result;
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to validate MFA code'));
  return false }, [handleError, executeWithRetry]);
  const testNotifications = useCallback(async () => { try {
      setLoading(true);
      await delay(500);
      // Mock notification test
      const event: SecurityEvent = { }
  id: `test-${Date.now()}`}
},
  type: 'login',
        description: 'Test notification sent successfully',
        timestamp: new Date(),
        ipAddress: '192.168.1.100',
        location: 'San Francisco, CA',
        riskLevel: 'low';
  };
      setSecurityEvents(prev => [event, ...prev]);
      onSecurityEvent?.(event);
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to test notifications')) } finally { setLoading(false) }, [handleError, onSecurityEvent]);
  const exportSecurityData = useCallback(async (): Promise<Blob> => {
    try {
      const data = {
        mfaMethods: mfaMethods.map(m => ({ ...m, configuration: undefined })), // Remove sensitive data
        trustedDevices
        securityEvents
        settings
        exportedAt: new Date().toISOString();
  };
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
 catch (err) { handleError(err instanceof Error ? err : new Error('Failed to export security data'));
  throw err }, [mfaMethods, trustedDevices, securityEvents, settings, handleError]);
  // Effects
  useEffect(() => { refresh() }, [refresh]);
  useEffect(() => { onStatusChange?.(status) }, [status, onStatusChange]);
  useEffect(() => { if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(refresh, refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current) };
  }, [autoRefresh, refreshInterval, refresh]);
  useEffect(() => { return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current) };
  }, []);
  return { // State
    mfaMethods
    backupCodes
    trustedDevices
    securityEvents
    settings
    status
    loading
    error
    // Retry and timeout state
    retryCount
    isRetrying
    lastRetryError
    operationTimeout
    // MFA Method Management
    enableMethod
    disableMethod
    setupTOTP
    setupSMS
    setupEmail
    removeMethod
    setPrimaryMethod
    // Backup Code Management
    generateBackupCodes
    downloadBackupCodes
    markBackupCodeUsed
    // Trusted Device Management
    addTrustedDevice
    removeTrustedDevice
    refreshDeviceAccess
    // Settings Management
    updateSettings
    resetSettings
    // Security Events
    getSecurityEvents
    clearSecurityEvents
    // Utility Functions
    validateMFACode
    testNotifications
    exportSecurityData }
    refresh
  };
};

export default useMFAManagement;