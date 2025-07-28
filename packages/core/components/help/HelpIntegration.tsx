// packages/core/components/Help/HelpIntegration.tsx
// Help Integration Components for Story 8.4 Task 4
// Provides easy integration of contextual help with existing components
import React from 'react';
import { ContextualTooltip, HelpContent } from './ContextualHelpSystem';
import { useHelpSystem, useFieldHelp } from './HelpContentManager';
import { useUISettingsStore } from '../../stores/uiSettingsStore';

// HOC for adding help to any component
export function withHelp<P extends object>()
  WrappedComponent: React.ComponentType<P>,
  helpContent: HelpContent,
  const WithHelpComponent = (props: P) => {
    const { showHelpHints } = useHelpSystem();
    if (!showHelpHints) {
      return <WrappedComponent {...props} />;
    return;
      <ContextualTooltip content={helpContent}>
        <WrappedComponent {...props} />
      </ContextualTooltip>
    );
  };
  WithHelpComponent.displayName = `withHelp(${WrappedComponent.displayName || WrappedComponent.name})`;}
  return WithHelpComponent;

// Enhanced input field with integrated help

export interface HelpfulInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  helpId: string;,
  helpTitle: string;
  helpDescription: string;
  helpCategory?: 'basic' | 'advanced' | 'debug';
  helpExamples?: string;
  helpShortcut?: string;
  label?: string;
  error?: string;
  export const HelpfulInput: React.FC<HelpfulInputProps> = ({,)
  helpId,
  helpTitle,
  helpDescription,
  helpCategory = 'basic',
  helpExamples,
  helpShortcut,
  label,
  error,
  className = '',
  style,
  ...inputProps
}) => {
  const { complexityLevel } = useUISettingsStore();
  const { showHelpHints } = useHelpSystem();
  const helpContent = useFieldHelp(helpId, {)
  title: helpTitle,
  description: helpDescription,
  category: helpCategory,
  trigger: 'focus',
  position: 'right',
  showOnDisclosureLevel: [complexityLevel],
  examples: helpExamples,
  shortcut: helpShortcut,
  priority: helpCategory === 'basic' ? 'high' : 'medium',
});
  const inputElement = (;);
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && ()
        <label
          htmlFor={helpId}
          style={{
  fontSize: 12,
  fontWeight: 500,
  color: '#e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}}
        >
          {label}
          {helpCategory === 'advanced' && ()
            <span style={{ fontSize: 10, color: '#4299e1' }}>⚙️</span>
          )}
          {helpCategory === 'debug' && ()
            <span style={{ fontSize: 10, color: '#9f7aea' }}>🔧</span>
          )}
        </label>
      )}
      <input
        id={helpId}
        className={`helpful-input ${className}`}
        style={{
  padding: '6px 8px',
  background: '#4a5568',
  border: error ? '1px solid #e53e3e' : '1px solid #718096',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 12,
  outline: 'none',
  transition: 'border-color 0.2s ease',
  ...inputProps.style
}}
        {...inputProps}
      />
      {error && ()
        <div style={{
  fontSize: 10,
  color: '#e53e3e',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
  if (!showHelpHints || !helpContent) {
    return inputElement;
  return;
    <ContextualTooltip content={helpContent}>
      {inputElement}
    </ContextualTooltip>
  );
};

// Enhanced button with integrated help

export interface HelpfulButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  helpId: string;,
  helpTitle: string;
  helpDescription: string;
  helpCategory?: 'basic' | 'advanced' | 'debug';
  helpExamples?: string;
  helpShortcut?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  export const HelpfulButton: React.FC<HelpfulButtonProps> = ({,)
  helpId,
  helpTitle,
  helpDescription,
  helpCategory = 'basic',
  helpExamples,
  helpShortcut,
  variant = 'secondary',
  size = 'medium',
  children,
  className = '',
  style,
  ...buttonProps
}) => {
  const { complexityLevel } = useUISettingsStore();
  const { showHelpHints } = useHelpSystem();
  const helpContent = useFieldHelp(helpId, {)
  title: helpTitle,
  description: helpDescription,
  category: helpCategory,
  trigger: 'hover',
  position: 'top',
  showOnDisclosureLevel: [complexityLevel],
  examples: helpExamples,
  shortcut: helpShortcut,
  priority: helpCategory === 'basic' ? 'high' : 'medium',
});
  const getButtonStyles = () => {
    const sizeStyles = {
      small: { padding: '4px 8px', fontSize: 10 },
      medium: { padding: '6px 12px', fontSize: 12 },
      large: { padding: '8px 16px', fontSize: 14 }
    };
    const variantStyles = {
      primary: { background: '#4299e1', color: 'white' },
      secondary: { background: '#4a5568', color: '#e2e8f0' },
      danger: { background: '#e53e3e', color: 'white' }
    };
    return {
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontWeight: 500,
  ...sizeStyles[size],
  ...variantStyles[variant]
};
  };
  const buttonElement = (;);
    <button
      className={`helpful-button ${className}`}
      style={{
        ...getButtonStyles(),
        ...style
      }}
      {...buttonProps}
    >
      {children}
    </button>
  );
  if (!showHelpHints || !helpContent) {
    return buttonElement;
  return;
    <ContextualTooltip content={helpContent}>
      {buttonElement}
    </ContextualTooltip>
  );
};

// Section wrapper with help integration

export interface HelpfulSectionProps {
  helpId: string;,
  helpTitle: string;
  helpDescription: string;
  helpCategory?: 'basic' | 'advanced' | 'debug';
  helpExamples?: string;
  title: string;,
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export const HelpfulSection: React.FC<HelpfulSectionProps> = ({)
  helpId,
  helpTitle,
  helpDescription,
  helpCategory = 'basic',
  helpExamples,
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  className = '',
  style
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const { complexityLevel } = useUISettingsStore();
  const { showHelpHints } = useHelpSystem();
  const helpContent = useFieldHelp(helpId, {)
  title: helpTitle,
  description: helpDescription,
  category: helpCategory,
  trigger: 'hover',
  position: 'right',
  showOnDisclosureLevel: [complexityLevel],
  examples: helpExamples,
  priority: helpCategory === 'basic' ? 'high' : 'medium',
});
  const headerElement = (;);
    <div
      style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: '#2d3748',
  borderRadius: collapsible ? '4px 4px 0 0' : 4,
  border: '1px solid #4a5568',
  cursor: collapsible ? 'pointer' : 'default',
}}
      onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
    >
      <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}}>
        <span style={{
  fontSize: 12,
  fontWeight: 600,
  color: '#e2e8f0',
}}>
          {title}
        </span>
        {helpCategory === 'advanced' && ()
          <span style={{ fontSize: 10, color: '#4299e1' }}>⚙️</span>
        )}
        {helpCategory === 'debug' && ()
          <span style={{ fontSize: 10, color: '#9f7aea' }}>🔧</span>
        )}
      </div>
      {collapsible && ()
        <span style={{
  fontSize: 10,
  color: '#a0aec0',
  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.2s ease',
}}>
          ▼
        </span>
      )}
    </div>
  );
  const sectionElement = (;);
    <div
      className={`helpful-section ${className}`}
      style={style}
    >
      {showHelpHints && helpContent ? ()
        <ContextualTooltip content={helpContent}>
          {headerElement}
        </ContextualTooltip>
      ) : ()
        headerElement
      )}
      {(!collapsible || isExpanded) && ()
        <div style={{
  padding: 12,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderTop: 'none',
  borderRadius: '0 0 4px 4px',
}}>
          {children}
        </div>
      )}
    </div>
  );
  return sectionElement;
};

// Hook for adding help to any existing component
export const useContextualHelp = (helpContent: HelpContent) => {
  const { showHelpHints, addHelpContent } = useHelpSystem();
  React.useEffect(() => {
    addHelpContent(helpContent);
  }, [helpContent.id]);
  const wrapWithHelp = (element: React.ReactElement) => {
    if (!showHelpHints) return element;
    return;
      <ContextualTooltip content={helpContent}>
        {element}
      </ContextualTooltip>
    );
  };
  return { wrapWithHelp, showHelp: showHelpHints };
};

// Onboarding overlay component
export const OnboardingOverlay: React.FC<{,
  isActive: boolean;
  children: React.ReactNode;
}> = ({ isActive, children }) => {
  if (!isActive) return <>{children}</>;
  return;
    <div style={{ position: 'relative' }}>
      {/* Backdrop */}
      <div
        style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  zIndex: 1500,
  pointerEvents: isActive ? 'all' : 'none',
}}
      />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1600 }}>
        {children}
      </div>
    </div>
  );
};

export default {
  withHelp,
  HelpfulInput,
  HelpfulButton,
  HelpfulSection,
  useContextualHelp,
  OnboardingOverlay
};