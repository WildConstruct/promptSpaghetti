/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * MFA Status Indicators - Epic 19 Implementation
 * Real-time security status indicators for displaying MFA protection level across the application
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/Alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  AlertTriangle,
  CheckCircle,
  // Clock, // Unused
  Settings,
  Zap,
  Eye
  // Lock // Unused
 from 'lucide-react';
import type { 
  MFAMethodType, 
  UserMFAProfile
  // MFAVerificationResult // Unused
 from '../../types/MFATypes';

export type MFASecurityLevel = 
  | 'none'
  | 'basic'
  | 'standard'
  | 'high'
  | 'maximum';

export type MFAIndicatorVariant = 
  | 'compact'
  | 'detailed'
  | 'badge'
  | 'header';


interface MFAStatusIndicatorProps {
  userId: string;
  variant?: MFAIndicatorVariant;
  showActions?: boolean;
  onSecurityAction?: (action: string) => void;
  className?: string;
  interface SecurityStatus {
  level: MFASecurityLevel;,
  profile: UserMFAProfile | null;,
  isLoading: boolean;,
  lastCheck: Date | null;,
  recentActivity: {,
  lastSuccess?: Date;
  lastFailure?: Date;
  suspiciousActivity: boolean;,
  breachDetected: boolean;


};
  recommendations: string;
const SECURITY_LEVEL_CONFIG = {
  ['none']: {,
  icon: ShieldX,
  color: 'red',
  label: 'No Protection',
  description: 'MFA is not enabled',
  bgColor: 'bg-red-50',
  borderColor: 'border-red-200',
  textColor: 'text-red-700',

  ['basic']: {
  icon: ShieldAlert,
  color: 'yellow',
  label: 'Basic Protection',
  description: 'Single MFA method configured',
  bgColor: 'bg-yellow-50',
  borderColor: 'border-yellow-200',
  textColor: 'text-yellow-700',

  ['standard']: {
  icon: Shield,
  color: 'blue',
  label: 'Standard Protection',
  description: 'Multiple methods with backup codes',
  bgColor: 'bg-blue-50',
  borderColor: 'border-blue-200',
  textColor: 'text-blue-700',

  ['high']: {
  icon: ShieldCheck,
  color: 'green',
  label: 'High Protection',
  description: 'TOTP primary with backup methods',
  bgColor: 'bg-green-50',
  borderColor: 'border-green-200',
  textColor: 'text-green-700',

  ['maximum']: {
  icon: ShieldCheck,
  color: 'purple',
  label: 'Maximum Protection',
  description: 'Hardware keys + multiple backup methods',
  bgColor: 'bg-purple-50',
  borderColor: 'border-purple-200',
  textColor: 'text-purple-700',
};

export function MFAStatusIndicator({ )
  userId, 
  variant = 'compact',
  showActions = false,
  onSecurityAction,
  className = ''
: MFAStatusIndicatorProps) {
  const [status, setStatus] = useState<SecurityStatus>({)
  level: 'none',
  profile: null,
  isLoading: true,
  lastCheck: null,
  recentActivity: {,
  suspiciousActivity: false,
  breachDetected: false,
},
  recommendations: [];
  });
  const loadSecurityStatus = useCallback(async () => {
    try {
      const [profileResponse, activityResponse] = await Promise.all([)
        fetch(`/api/mfa/profile/${userId}`, {)}
  },
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/security/activity/${userId}`, {)}
  },
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

      ]);
      if (!profileResponse.ok) throw new Error('Failed to load profile');
      const profile: UserMFAProfile = await profileResponse.json();
      const activity = activityResponse.ok ? await activityResponse.json() : {};
      const securityLevel = calculateSecurityLevel(profile);
      const recommendations = generateRecommendations(profile, activity);
      setStatus({)
  level: securityLevel,
  profile,
  isLoading: false,
  lastCheck: new Date(),
  recentActivity: {,
  lastSuccess: activity.lastSuccess ? new Date(activity.lastSuccess) : undefined,
  lastFailure: activity.lastFailure ? new Date(activity.lastFailure) : undefined,
  suspiciousActivity: activity.suspiciousActivity || false,
  breachDetected: activity.breachDetected || false,

        recommendations
      });
 catch (error) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  console.error('MFA status check failed:', error);
  setStatus(prev => ({ )
  ...prev,
  isLoading: false,
  lastCheck: new Date(),
}));
  }, [userId]);
  useEffect(() => {
    loadSecurityStatus();
    const interval = setInterval(loadSecurityStatus, 30000); // Check every 30 seconds;
    return () => clearInterval(interval);
  }, [loadSecurityStatus]);
  const calculateSecurityLevel = (profile: UserMFAProfile): MFASecurityLevel => {
    if (!profile.isEnabled) return 'none';
    const methodCount = profile.configuredMethods.length;
    const hasTOTP = profile.configuredMethods.includes(MFAMethodType.TOTP);
    const hasBackup = profile.preferences.backupMethodEnabled;
    if (methodCount >= 3 && hasTOTP && hasBackup) {
      return 'maximum';
 else if (methodCount >= 2 && hasTOTP && hasBackup) {
      return 'high';
 else if (methodCount >= 2 || hasBackup) {
      return 'standard';
 else if (methodCount >= 1) {
      return 'basic';
    return 'none';
  };
  const generateRecommendations = (profile: UserMFAProfile, activity: unknown): string => {
  const recommendations: string = [];
  if (!profile.isEnabled) {
  recommendations.push('Enable multi-factor authentication');
 else {
      if (!profile.configuredMethods.includes(MFAMethodType.TOTP)) {
        recommendations.push('Add authenticator app for better security');
      if (profile.configuredMethods.length === 1) {
        recommendations.push('Add backup authentication method');
      if (!profile.preferences.backupMethodEnabled) {
        recommendations.push('Enable backup codes');
    if (activity.suspiciousActivity) {
      recommendations.push('Review recent security activity');
    if (activity.breachDetected) {
      recommendations.push('Change password and review account access');
    return recommendations;
  };
  const config = SECURITY_LEVEL_CONFIG[status.level];
  const Icon = config.icon;
  // Badge-only variant
  if (variant === 'badge') {
    return;
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="outline" 
              className={`${config.textColor} ${config.borderColor} ${className}`}
            >
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
            {status.lastCheck && ()
              <p className="text-xs text-gray-500">
                Last checked: {status.lastCheck.toLocaleTimeString()}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  // Compact variant
  if (variant === 'compact') {
    return;
      <div className={`flex items-center gap-2 ${className}`}>}
        <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${config.bgColor} ${config.borderColor} border`}>}
          <Icon className={`h-4 w-4 ${config.textColor}`} />}
          <span className={`text-sm font-medium ${config.textColor}`}>}
            {config.label}
          </span>
          {status.recentActivity.suspiciousActivity && ()
            <AlertTriangle className="h-3 w-3 text-red-500" />
          )}
          {status.recentActivity.breachDetected && ()
            <Eye className="h-3 w-3 text-red-600" />
          )}
        </div>
        {showActions && status.recommendations.length > 0 && ()
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSecurityAction?.('improve')}
          >
            <Zap className="h-3 w-3 mr-1" />
            Improve
          </Button>
        )}
      </div>
    );
  // Header variant
  if (variant === 'header') {
    return;
      <div className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor} ${config.borderColor} border ${className}`}>}
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.textColor}`} />}
          <div>
            <div className={`font-medium ${config.textColor}`}>}
              {config.label}
            </div>
            <div className="text-sm text-gray-600">
              {status.profile?.configuredMethods.length || 0} method(s) configured
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status.recentActivity.breachDetected && ()
            <Badge variant="destructive" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Breach Detected
            </Badge>
          )}
          {status.recentActivity.suspiciousActivity && ()
            <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Suspicious Activity
            </Badge>
          )}
          {showActions && ()
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSecurityAction?.('settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  // Detailed variant
  return;
    <div className={`space-y-4 ${className}`}>}
      <div className={`p-4 rounded-lg ${config.bgColor} ${config.borderColor} border`}>}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className={`h-6 w-6 mt-1 ${config.textColor}`} />}
            <div>
              <h3 className={`font-semibold ${config.textColor}`}>}
                {config.label}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {config.description}
              </p>
              {status.profile && ()
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Methods: {status.profile.configuredMethods.join(', ').toUpperCase()}</div>
                  {status.profile.lastUsed && ()
                    <div>
                      Last used: {new Date(status.profile.lastUsed.timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {showActions && ()
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSecurityAction?.('settings')}
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
          )}
        </div>
      </div>
      {/* Security Alerts */}
      {(status.recentActivity.breachDetected || status.recentActivity.suspiciousActivity) && ()
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {status.recentActivity.breachDetected && 
              'Security breach detected. Please review your account immediately.'}
            {status.recentActivity.suspiciousActivity && !status.recentActivity.breachDetected &&
              'Suspicious activity detected. Please verify recent account access.'}
          </AlertDescription>
        </Alert>
      )}
      {/* Recommendations */}
      {status.recommendations.length > 0 && ()
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Security Recommendations</h4>
          <ul className="space-y-1">
            {status.recommendations.map((rec, index) => ()
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-3 w-3 text-blue-500" />
                {rec}
              </li>
            ))}
          </ul>
          {showActions && ()
            <Button 
              size="sm"
              onClick={() => onSecurityAction?.('improve')}
              className="mt-2"
            >
              <Zap className="h-4 w-4 mr-1" />
              Improve Security
            </Button>
          )}
        </div>
      )}
      {/* Status Footer */}
      {status.lastCheck && ()
        <div className="text-xs text-gray-500">
          Last updated: {status.lastCheck.toLocaleString()}
        </div>
      )}
    </div>
  );

// Export additional components for specific use cases
export function MFAHeaderIndicator(props: Omit<MFAStatusIndicatorProps, 'variant'>) {
  return <MFAStatusIndicator {...props} variant={'header'} />;

export function MFABadgeIndicator(props: Omit<MFAStatusIndicatorProps, 'variant'>) {
  return <MFAStatusIndicator {...props} variant={'badge'} />;

export function MFACompactIndicator(props: Omit<MFAStatusIndicatorProps, 'variant'>) {
  return <MFAStatusIndicator {...props} variant={'compact'} />;