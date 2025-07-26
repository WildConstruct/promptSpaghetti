/**
 * QR Code Generator - Epic 19 Implementation
 * Secure QR code generation for TOTP authenticator app enrollment with customization options
 */

import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';
import { 
  Download, 
  Copy, 
  RefreshCw, 
  Settings, 
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Palette
} from 'lucide-react';

export interface QRCodeData {
  uri: string;
  secret: string;
  issuer: string;
  accountName: string;
  algorithm: string;
  digits: number;
  period: number;
}

export interface QRCodeStyle {
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  backgroundColor: string;
  foregroundColor: string;
  logoImage?: string;
  logoSize?: number;
  borderRadius?: number;
}

interface QRCodeGeneratorProps {
  qrData: QRCodeData;
  onRegenerateSecret?: () => Promise<QRCodeData>;
  showCustomization?: boolean;
  showSecretDetails?: boolean;
  className?: string;
}

interface GeneratorState {
  style: QRCodeStyle;
  showAdvanced: boolean;
  showSecret: boolean;
  copying: boolean;
  downloading: boolean;
  regenerating: boolean;
  error: string | null;
  validationPassed: boolean;
}

const DEFAULT_STYLE: QRCodeStyle = {
  size: 256,
  margin: 4,
  errorCorrectionLevel: 'H',
  includeMargin: true,
  backgroundColor: '#FFFFFF',
  foregroundColor: '#000000'
};

const ERROR_CORRECTION_LEVELS = {
  L: { label: 'Low (~7%)', description: 'Basic error recovery' },
  M: { label: 'Medium (~15%)', description: 'Standard error recovery' },
  Q: { label: 'Quartile (~25%)', description: 'Good error recovery' },
  H: { label: 'High (~30%)', description: 'Best error recovery (recommended)' }
};

const PRESET_STYLES = {
  standard: {
    name: 'Standard',
    style: { ...DEFAULT_STYLE }
  },
  large: {
    name: 'Large',
    style: { ...DEFAULT_STYLE, size: 384, margin: 6 }
  },
  minimal: {
    name: 'Minimal',
    style: { ...DEFAULT_STYLE, size: 200, margin: 2 }
  },
  highContrast: {
    name: 'High Contrast',
    style: { ...DEFAULT_STYLE, foregroundColor: '#000000', backgroundColor: '#FFFFFF' }
  },
  darkMode: {
    name: 'Dark Mode',
    style: { ...DEFAULT_STYLE, foregroundColor: '#FFFFFF', backgroundColor: '#1a1a1a' }
  }
};

export function QRCodeGenerator({ 
  qrData, 
  onRegenerateSecret,
  showCustomization = true,
  showSecretDetails = true,
  className = ''
}: QRCodeGeneratorProps) {
    const [state, setState] = useState<GeneratorState>({
    style: DEFAULT_STYLE,
    showAdvanced: false,
    showSecret: false,
    copying: false,
    downloading: false,
    regenerating: false,
    error: null,
    validationPassed: false
  });

  const validateQRData = useCallback(() => {
    const issues: string[] = [];

    if (!qrData.uri || !qrData.uri.startsWith('otpauth://totp/')) {
      issues.push('Invalid TOTP URI format');
    }

    if (!qrData.secret || qrData.secret.length < 16) {
      issues.push('Secret too short (minimum 16 characters)');
    }

    if (qrData.digits !== 6 && qrData.digits !== 8) {
      issues.push('Digits must be 6 or 8');
    }

    if (qrData.period < 15 || qrData.period > 300) {
      issues.push('Period must be between 15 and 300 seconds');
    }

    const isValid = issues.length === 0;
    setState(prev => ({
      ...prev,
      validationPassed: isValid,
      error: isValid ? null : issues.join('; ')
    }));
  }, [qrData]);

  // Validate QR data on mount and when it changes
  useEffect(() => {
    validateQRData();
  }, [validateQRData]);

  const updateStyle = (updates: Partial<QRCodeStyle>) => {
    setState(prev => ({
      ...prev,
      style: { ...prev.style, ...updates }
    }));
  };

  const applyPreset = (presetKey: keyof typeof PRESET_STYLES) => {
    const preset = PRESET_STYLES[presetKey];
    updateStyle(preset.style);
  };

  const copyToClipboard = async (text: string) => {
    setState(prev => ({ ...prev, copying: true }));
    
    try {
      await navigator.clipboard.writeText(text);
      setTimeout(() => {
        setState(prev => ({ ...prev, copying: false }));
      }, 2000);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Copy failed:', error);
      setState(prev => ({ 
        ...prev, 
        copying: false,
        error: 'Failed to copy to clipboard'
      }));
    }
  };

  const downloadQRCode = (format: 'png' | 'svg' = 'png') => {
    setState(prev => ({ ...prev, downloading: true }));

    try {
      if (format === 'png') {
        // Create canvas element for PNG download
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        canvas.width = state.style.size;
        canvas.height = state.style.size;

        // Fill background
        ctx.fillStyle = state.style.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generate QR code on canvas (would need actual QR generation library)
        // For now, create a simple download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `promptscape-qr-${qrData.accountName}-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      } else {
        // SVG download
        const svgElement = document.querySelector('.qr-code-svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `promptscape-qr-${qrData.accountName}-${Date.now()}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to download QR code: ${error.message}`
      }));
    } finally {
      setState(prev => ({ ...prev, downloading: false }));
    }
  };

  const regenerateSecret = async () => {
    if (!onRegenerateSecret) return;

    setState(prev => ({ ...prev, regenerating: true, error: null }));

    try {
      await onRegenerateSecret();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to regenerate secret: ${error.message}`
      }));
    } finally {
      setState(prev => ({ ...prev, regenerating: false }));
    }
  };

  const formatSecret = (secret: string): string => {
    return secret.replace(/(.{4})/g, '$1 ').trim();
  };

  const getSecurityLevel = (): { level: string; color: string; description: string } => {
    if (qrData.secret.length >= 32 && qrData.algorithm === 'SHA256') {
      return { level: 'High', color: 'green', description: 'Excellent security' };
    } else if (qrData.secret.length >= 24) {
      return { level: 'Good', color: 'blue', description: 'Good security' };
    } else {
      return { level: 'Basic', color: 'yellow', description: 'Meets minimum requirements' };
    }
  };

  const security = getSecurityLevel();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main QR Code Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Authenticator App Setup
            <Badge variant="outline" className={`text-${security.color}-700 border-${security.color}-300`}>
              {security.level} Security
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {state.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.validationPassed && (
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-white rounded-lg shadow-sm border">
                <QRCodeSVG
                  className="qr-code-svg"
                  value={qrData.uri}
                  size={state.style.size}
                  level={state.style.errorCorrectionLevel}
                  includeMargin={state.style.includeMargin}
                  marginSize={state.style.margin}
                  fgColor={state.style.foregroundColor}
                  bgColor={state.style.backgroundColor}
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(qrData.uri)}
                  disabled={state.copying}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {state.copying ? 'Copied!' : 'Copy URI'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadQRCode('png')}
                  disabled={state.downloading}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadQRCode('svg')}
                  disabled={state.downloading}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download SVG
                </Button>
                {onRegenerateSecret && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateSecret}
                    disabled={state.regenerating}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${state.regenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Manual Entry Option */}
          {showSecretDetails && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Manual Entry</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showSecret: !prev.showSecret }))}
                >
                  {state.showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {state.showSecret ? 'Hide' : 'Show'} Secret
                </Button>
              </div>

              {state.showSecret && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Secret Key</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md font-mono text-sm break-all">
                      {formatSecret(qrData.secret)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(qrData.secret)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Secret
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Account:</span> {qrData.accountName}
                    </div>
                    <div>
                      <span className="font-medium">Issuer:</span> {qrData.issuer}
                    </div>
                    <div>
                      <span className="font-medium">Algorithm:</span> {qrData.algorithm}
                    </div>
                    <div>
                      <span className="font-medium">Digits:</span> {qrData.digits}
                    </div>
                    <div>
                      <span className="font-medium">Period:</span> {qrData.period}s
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> TOTP
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customization Panel */}
      {showCustomization && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Customization
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
              >
                <Settings className="h-4 w-4 mr-1" />
                {state.showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preset Styles */}
            <div>
              <label className="block text-sm font-medium mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESET_STYLES).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(key as keyof typeof PRESET_STYLES)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Size: {state.style.size}px
                </label>
                <Slider
                  value={[state.style.size]}
                  onValueChange={([value]) => updateStyle({ size: value })}
                  min={128}
                  max={512}
                  step={16}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Margin: {state.style.margin}
                </label>
                <Slider
                  value={[state.style.margin]}
                  onValueChange={([value]) => updateStyle({ margin: value })}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Advanced Settings */}
            {state.showAdvanced && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Error Correction Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ERROR_CORRECTION_LEVELS).map(([level, config]) => (
                      <Button
                        key={level}
                        variant={state.style.errorCorrectionLevel === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStyle({ errorCorrectionLevel: level as 'L' | 'M' | 'Q' | 'H' })}
                        className="text-left justify-start"
                      >
                        <div>
                          <div className="font-medium">{config.label}</div>
                          <div className="text-xs text-gray-500">{config.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color</label>
                    <input
                      type="color"
                      value={state.style.backgroundColor}
                      onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Foreground Color</label>
                    <input
                      type="color"
                      value={state.style.foregroundColor}
                      onChange={(e) => updateStyle({ foregroundColor: e.target.value })}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={state.style.includeMargin}
                    onCheckedChange={(checked) => updateStyle({ includeMargin: checked })}
                  />
                  <label className="text-sm font-medium">Include margin in QR code</label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Information */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Level: {security.level}</strong> - {security.description}
          <br />
          <span className="text-sm text-gray-600 mt-1 block">
            This QR code contains your secret key. Only scan it with trusted authenticator apps and never share it with others.
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}