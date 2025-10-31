/**
 * Gated feature components with authentication checks
 */

import React from 'react';

import {
  FeatureTooltip,
  InlineUpgradePrompt,
  PremiumBadge
} from '../upgrade/UpgradePrompt';
import {
  useFeatureAvailability,
  useFeatureGate
} from '../../hooks/useFeatureGate';

// Extract styles to constants for better maintainability
const DISABLED_BUTTON_STYLE = {
  padding: '10px 20px',
  backgroundColor: '#e5e7eb',
  color: '#9ca3af',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'not-allowed',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px'
};

const PRIMARY_BUTTON_STYLE = {
  padding: '10px 20px',
  backgroundColor: '#0284c7',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px'
};

const SECONDARY_BUTTON_STYLE = {
  padding: '10px 20px',
  backgroundColor: 'white',
  color: '#0284c7',
  border: '1px solid #0284c7',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px'
};

/**
 * Props for gated save/load buttons
 */
interface GatedButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

/**
 * Cloud save button with auth gate
 */
export function CloudSaveButton({
  onClick,
  disabled,
  children
}: GatedButtonProps) {
  const { Gate } = useFeatureGate({
    requireAuth: true,
    requireSupabase: true
  });

  return (
    <Gate
      fallback={
        <FeatureTooltip content="Sign in to save to cloud">
          <button disabled style={DISABLED_BUTTON_STYLE}>
            ☁️ {children}
            <PremiumBadge />
          </button>
        </FeatureTooltip>
      }
    >
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...PRIMARY_BUTTON_STYLE,
          backgroundColor: disabled ? '#e5e7eb' : PRIMARY_BUTTON_STYLE.backgroundColor,
          color: disabled ? '#9ca3af' : PRIMARY_BUTTON_STYLE.color,
          cursor: disabled ? 'not-allowed' : PRIMARY_BUTTON_STYLE.cursor
        }}
        onMouseEnter={e => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#0369a1';
          }
        }}
        onMouseLeave={e => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = PRIMARY_BUTTON_STYLE.backgroundColor;
          }
        }}
      >
        ☁️ {children}
      </button>
    </Gate>
  );
}

/**
 * Cloud load button with auth gate
 */
export function CloudLoadButton({
  onClick,
  disabled,
  children
}: GatedButtonProps) {
  const { Gate } = useFeatureGate({
    requireAuth: true,
    requireSupabase: true
  });

  return (
    <Gate
      fallback={
        <FeatureTooltip content="Sign in to load from cloud">
          <button disabled style={DISABLED_BUTTON_STYLE}>
            ☁️ {children}
            <PremiumBadge />
          </button>
        </FeatureTooltip>
      }
    >
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...SECONDARY_BUTTON_STYLE,
          color: disabled ? '#9ca3af' : SECONDARY_BUTTON_STYLE.color,
          border: `1px solid ${disabled ? '#d1d5db' : '#0284c7'}`,
          cursor: disabled ? 'not-allowed' : SECONDARY_BUTTON_STYLE.cursor
        }}
        onMouseEnter={e => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#f0f9ff';
          }
        }}
        onMouseLeave={e => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'white';
          }
        }}
      >
        ☁️ {children}
      </button>
    </Gate>
  );
}

/**
 * Local save button (always available)
 */
export function LocalSaveButton({
  onClick,
  disabled,
  children
}: GatedButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 20px',
        backgroundColor: 'white',
        color: disabled ? '#9ca3af' : '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'white';
        }
      }}
    >
      💾 {children}
    </button>
  );
}

/**
 * Feature availability indicator
 */
interface FeatureIndicatorProps {
  showPremium?: boolean;
}

export function FeatureAvailabilityIndicator({
  showPremium = true
}: FeatureIndicatorProps) {
  const cloudSaveAvailable = useFeatureAvailability('premium.cloudSaveLoad');
  const crossDeviceAvailable = useFeatureAvailability(
    'premium.crossDeviceSync'
  );

  const features = [
    { name: 'Create & Edit Graphs', available: true },
    { name: 'Local Save/Load', available: true },
    { name: 'Export/Import', available: true },
    { name: 'Cloud Storage', available: cloudSaveAvailable, premium: true },
    {
      name: 'Cross-Device Sync',
      available: crossDeviceAvailable,
      premium: true
    }
  ];

  if (!showPremium) {
    return null;
  }

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        fontSize: '13px'
      }}
    >
      <h4
        style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#111827'
        }}
      >
        Feature Availability
      </h4>

      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none'
        }}
      >
        {features.map((feature, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom:
                index < features.length - 1 ? '1px solid #e5e7eb' : 'none'
            }}
          >
            <span style={{ color: feature.available ? '#374151' : '#9ca3af' }}>
              {feature.available ? '✅' : '🔒'} {feature.name}
            </span>
            {feature.premium && !feature.available && (
              <PremiumBadge size="small" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Gated feature section wrapper
 */
interface GatedSectionProps {
  feature: string;
  benefits: string[];
  onUpgrade: () => void;
  children: React.ReactNode;
}

export function GatedSection({
  feature,
  benefits,
  onUpgrade,
  children
}: GatedSectionProps) {
  const { Gate } = useFeatureGate({
    requireAuth: true,
    requireSupabase: true
  });

  return (
    <Gate
      fallback={
        <InlineUpgradePrompt
          feature={feature}
          benefits={benefits}
          onUpgrade={onUpgrade}
        />
      }
    >
      {children}
    </Gate>
  );
}
