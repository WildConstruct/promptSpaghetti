/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * MFA Enrollment Workflow - Epic 19 Implementation
 * Secure, user-friendly multi-step enrollment process for all MFA methods
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Check, 
  AlertTriangle,
  Download,
  Copy
 from 'lucide-react';
import type { 
  MFAMethodType, 
  TOTPEnrollmentData, 
  MFAEnrollmentResponse 
 from '../../types/MFATypes';


interface MFAEnrollmentWorkflowProps {
  userId: string;,
  onComplete: (methodType: MFAMethodType, configId: string) => void;,
  onCancel: () => void;
  existingMethods?: MFAMethodType;
  type EnrollmentStep = 'select' | 'setup' | 'verify' | 'backup' | 'complete';
  interface EnrollmentState {
  step: EnrollmentStep;,
  selectedMethod: MFAMethodType | null;,
  enrollmentData: MFAEnrollmentResponse | null;,
  totpData: TOTPEnrollmentData | null;,
  verificationCode: string;,
  displayName: string;,
  emailAddress: string;,
  phoneNumber: string;,
  backupCodes: string;,
  isLoading: boolean;,
  error: string | null;,
  timeRemaining: number;
  const MFA_METHOD_CONFIG = {
  [MFAMethodType.TOTP]: {,
  title: 'Authenticator App',
  description: 'Most secure option using Google Authenticator, Authy, or similar apps',
  icon: Smartphone,
  security: 'High',
  convenience: 'High',
  recommended: true,
  requirements: ['Smartphone', 'Authenticator app installed'],



  [MFAMethodType.EMAIL]: {
  title: 'Email Verification',
  description: 'Receive verification codes via email',
  icon: Mail,
  security: 'Medium',
  convenience: 'High',
  recommended: false,
  requirements: ['Access to email account'],

  [MFAMethodType.SMS]: {
  title: 'SMS Text Message',
  description: 'Receive codes via text message (fallback option only)',
  icon: MessageSquare,
  security: 'Low',
  convenience: 'High',
  recommended: false,
  requirements: ['Mobile phone number'],
};

export function MFAEnrollmentWorkflow({ )
  userId, 
  onComplete, 
  onCancel, 
  existingMethods = [] 
: MFAEnrollmentWorkflowProps) {
  const [state, setState] = useState<EnrollmentState>({)
  step: 'select',
  selectedMethod: null,
  enrollmentData: null,
  totpData: null,
  verificationCode: '',
  displayName: '',
  emailAddress: '',
  phoneNumber: '',
  backupCodes: [],
  isLoading: false,
  error: null,
  timeRemaining: 300 // 5 minutes for enrollment,
});
  // Countdown timer for enrollment expiry
  useEffect(() => {
    if (state.timeRemaining > 0 && (state.step === 'setup' || state.step === 'verify')) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
  }, [state.timeRemaining, state.step]);
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;}
  };
  const getStepProgress = (): number => {
    const stepMap = { select: 20, setup: 40, verify: 60, backup: 80, complete: 100 };
    return stepMap[state.step];
  };
  const availableMethods = Object.keys(MFA_METHOD_CONFIG).filter(;);
    method => !existingMethods.includes(method as MFAMethodType)
  ) as MFAMethodType;
  const handleMethodSelect = (method: MFAMethodType) => {
    setState(prev => ({)
  ...prev,
      selectedMethod: method,
      displayName: `${MFA_METHOD_CONFIG[method].title} - ${new Date().toLocaleDateString()}`}
    }));
  };
  const startEnrollment = async () => {
    if (!state.selectedMethod) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const request = {
        methodType: state.selectedMethod,
        displayName: state.displayName,
        ...(state.selectedMethod === MFAMethodType.EMAIL && { emailAddress: state.emailAddress }),
        ...(state.selectedMethod === MFAMethodType.SMS && { phoneNumber: state.phoneNumber })
      };
      const response = await fetch('/api/mfa/enroll', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request);
  });
      if (!response.ok) throw new Error('Enrollment failed');
      const enrollmentData: MFAEnrollmentResponse = await response.json();
      setState(prev => ({)
  ...prev,
  step: 'setup',
  enrollmentData,
  totpData: enrollmentData.enrollmentData || null,
  isLoading: false,
  timeRemaining: 300,
}));
 catch (error) {
  setState(prev => ({)
  ...prev,
  error: error instanceof Error ? error.message : 'Operation failed',
  isLoading: false,
}));
  };
  const verifyEnrollment = async () => {
    if (!state.enrollmentData || !state.verificationCode) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/mfa/verify', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({);
  configurationId: state.enrollmentData.configurationId,
  code: state.verificationCode,

      });
      if (!response.ok) throw new Error('Verification failed');
      const result = await response.json();
      if (result.success) {
  if (state.selectedMethod === MFAMethodType.TOTP && state.totpData?.backupCodes) {
  setState(prev => ({)
  ...prev,
  step: 'backup',
  backupCodes: state.totpData?.backupCodes ?? [],
  isLoading: false,
}));
 else {
          setState(prev => ({ ...prev, step: 'complete', isLoading: false }));
 else {
  setState(prev => ({)
  ...prev,
  error: result.message || 'Invalid verification code',
  isLoading: false,
}));
 catch (error) {
  setState(prev => ({)
  ...prev,
  error: error instanceof Error ? error.message : 'Operation failed',
  isLoading: false,
}));
  };
  const downloadBackupCodes = () => {
    const content = [
      'PromptScape MFA Backup Codes',
      '================================',
      `Generated: ${new Date().toISOString()}`}

      `User: ${userId}`}

      '',
      'IMPORTANT: Save these codes in a safe place.',
      'Each code can only be used once.',
      '',
      ...state.backupCodes.map((code, i) => `${i + 1}. ${code}`)}
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptscape-backup-codes-${Date.now()}.txt`;}
    a.click();
    URL.revokeObjectURL(url);
  };
  const copyBackupCodes = async () => {
    const codes = state.backupCodes.join('\n');
    await navigator.clipboard.writeText(codes);
  };
  const completeEnrollment = () => {
    if (state.enrollmentData && state.selectedMethod) {
      onComplete(state.selectedMethod, state.enrollmentData.configurationId);
  };
  // Step 1: Method Selection
  if (state.step === 'select') {
    return;
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Set Up Multi-Factor Authentication
          </CardTitle>
          <Progress value={getStepProgress()} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-gray-600">
            Choose your preferred authentication method. We recommend starting with an authenticator app for the highest security.
          </div>
          <div className="space-y-3">
            {availableMethods.map(method => {)
  const config = MFA_METHOD_CONFIG[method];
              const Icon = config.icon;
              return;
                <div
                  key={method}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
  state.selectedMethod === method
  ? 'border-blue-500 bg-blue-50'
  : 'border-gray-200 hover:border-gray-300',
`}
                  onClick={() => handleMethodSelect(method)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-6 w-6 mt-1 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{config.title}</h3>
                        {config.recommended && ()
                          <Badge variant="default" className="text-xs">Recommended</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {config.security} Security
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                      <div className="text-xs text-gray-500">
                        Requirements: {config.requirements.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {state.selectedMethod && ()
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={state.displayName}
                  onChange={(e) => setState(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., My iPhone Authenticator"
                />
              </div>
              {state.selectedMethod === MFAMethodType.EMAIL && ()
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={state.emailAddress}
                    onChange={(e) => setState(prev => ({ ...prev, emailAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="your@email.com"
                  />
                </div>
              )}
              {state.selectedMethod === MFAMethodType.SMS && ()
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={state.phoneNumber}
                    onChange={(e) => setState(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              )}
            </div>
          )}
          {state.error && ()
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={state.isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={startEnrollment}
              disabled={!state.selectedMethod || !state.displayName || state.isLoading}
              className="flex-1"
            >
              {state.isLoading ? 'Starting...' : 'Continue Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  // Step 2: Setup Instructions
  if (state.step === 'setup') {
    const method = state.selectedMethod!;
    const config = MFA_METHOD_CONFIG[method];
    return;
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Set Up {config.title}
          </CardTitle>
          <Progress value={getStepProgress()} className="w-full" />
          <div className="text-sm text-gray-600">
            Time remaining: {formatTime(state.timeRemaining)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {method === MFAMethodType.TOTP && state.totpData && ()
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <h3 className="font-medium">Scan QR Code</h3>
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border">
                    <QRCodeSVG 
                      value={state.totpData.secret.qrCodeDataUrl}
                      size={200}
                      level="H"
                    />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Or enter this key manually:</p>
                <div className="bg-gray-50 p-3 rounded-md font-mono text-sm break-all">
                  {state.totpData.secret.manualEntryKey}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => state.totpData?.secret.manualEntryKey && navigator.clipboard.writeText(state.totpData.secret.manualEntryKey)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Key
                </Button>
              </div>
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instructions:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
                    <li>Tap &quot;Add Account&quot; or &quot;+&quot;</li>
                    <li>Scan the QR code or enter the key manually</li>
                    <li>Your app will generate a 6-digit code</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          )}
          {method === MFAMethodType.EMAIL && ()
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                We&apos;ve sent a verification code to <strong>{state.emailAddress}</strong>. 
                Check your email and enter the code below.
              </AlertDescription>
            </Alert>
          )}
          {method === MFAMethodType.SMS && ()
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                We&apos;ve sent a verification code to <strong>{state.phoneNumber}</strong>. 
                Enter the code below.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={state.verificationCode}
                onChange={(e) => setState(prev => ({ )
                  ...prev, 
                  verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-mono"
                placeholder="123456"
                maxLength={6}
              />
            </div>
          </div>
          {state.error && ()
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, step: 'select' }))}
              disabled={state.isLoading}
            >
              Back
            </Button>
            <Button 
              onClick={verifyEnrollment}
              disabled={state.verificationCode.length !== 6 || state.isLoading}
              className="flex-1"
            >
              {state.isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  // Step 3: Backup Codes (TOTP only)
  if (state.step === 'backup') {
    return;
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Save Your Backup Codes
          </CardTitle>
          <Progress value={getStepProgress()} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Save these backup codes in a safe place. 
              You can use them to access your account if you lose your authenticator device. 
              Each code can only be used once.
            </AlertDescription>
          </Alert>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {state.backupCodes.map((code, index) => ()
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <span>{index + 1}.</span>
                  <span className="font-bold">{code}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={downloadBackupCodes}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={copyBackupCodes}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="backup-saved"
              onChange={(e) => {
                if (e.target.checked) {
                  setState(prev => ({ ...prev, step: 'complete' }));
}
            />
            <label htmlFor="backup-saved" className="text-sm">
              I have saved my backup codes in a safe place
            </label>
          </div>
        </CardContent>
      </Card>
    );
  // Step 4: Complete
  if (state.step === 'complete') {
    return;
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Multi-Factor Authentication Enabled
          </CardTitle>
          <Progress value={100} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Setup Complete!</h3>
              <p className="text-gray-600">
                Your {MFA_METHOD_CONFIG[state.selectedMethod!].title} has been successfully configured.
              </p>
            </div>
          </div>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your account is now protected with multi-factor authentication. 
              You&apos;ll need to provide a verification code along with your password when signing in.
            </AlertDescription>
          </Alert>
          <Button onClick={completeEnrollment} className="w-full">
            Continue to Account Settings
          </Button>
        </CardContent>
      </Card>
    );
  return null;