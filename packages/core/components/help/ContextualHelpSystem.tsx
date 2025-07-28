// packages/core/components/Help/ContextualHelpSystem.tsx
// Contextual Help System for Story 8.4 Task 4
// Provides tooltip system explaining advanced feature usage and progressive onboarding
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUISettingsStore } from '../../stores/uiSettingsStore';

export interface HelpContent {
  id: string;,
  title: string;
  description: string;,
  category: 'basic' | 'advanced' | 'debug' | 'onboarding';
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  showOnDisclosureLevel?: ('basic' | 'advanced' | 'debug')[];
  learnMoreUrl?: string;
  examples?: string;
  shortcut?: string;
  relatedFeatures?: string;
  priority?: 'high' | 'medium' | 'low';
}
export interface ContextualTooltipProps {
  content: HelpContent;,
  children: React.ReactNode;
  disabled?: boolean;
  delay?: number;
  className?: string;
}
export interface HelpSystemProps {
  helpContent: HelpContent;
  showOnboarding?: boolean;
  onboardingStep?: number;
  onOnboardingComplete?: () => void;
  className?: string;
  // Built-in help content for common components
  // Individual tooltip component
}
export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({)
  content,
  children,
  disabled = false,
  delay = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [calculatedPosition, setCalculatedPosition] = useState<string>('top');
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { complexityLevel } = useUISettingsStore();
  // Check if tooltip should be shown based on current disclosure level
  const shouldShow = content.showOnDisclosureLevel ;
    ? content.showOnDisclosureLevel.includes(complexityLevel)
    : true;
  const showTooltip = useCallback((event?: React.MouseEvent) => {
    if (disabled || !shouldShow) return;
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    // Calculate position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      let x = rect.left + scrollX + rect.width / 2;
      let y = rect.top + scrollY;
      // Auto-position if needed
      let pos = content.position || 'auto';
      if (pos === 'auto') {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        if (rect.top < viewportHeight / 2) {
          pos = 'bottom';
          y = rect.bottom + scrollY;
        } else {
          pos = 'top';
          y = rect.top + scrollY;
        if (rect.left < viewportWidth / 2) {
          x = rect.left + scrollX;
        } else {
          x = rect.right + scrollX;
      setPosition({ x, y });
      setCalculatedPosition(pos);
    // Show with delay
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [disabled, shouldShow, content.position, delay]);
  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    setIsVisible(false);
  }, []);
  // Event handlers based on trigger type
  const getEventHandlers = () => {
  const trigger = content.trigger || 'hover';
  switch (trigger) {
  case 'hover':,
  return {
  onMouseEnter: showTooltip,
  onMouseLeave: hideTooltip,
};
      case 'focus':
        return {
  onFocus: showTooltip,
  onBlur: hideTooltip,
};
      case 'click':
        return {
  onClick: (e: React.MouseEvent) => {,
  e.preventDefault();
  if (isVisible) {
  hideTooltip();
} else {
              showTooltip(e);
        };
      default:
        return {};
  };
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    };
  }, []);
  return;
    <div
      ref={containerRef}
      className={`contextual-tooltip-container ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
      {...getEventHandlers()}
    >
      {children}
      {isVisible && shouldShow && ()
        <div
          ref={tooltipRef}
          className="contextual-tooltip"
          style={{
  position: 'fixed',
  left: position.x,
  top: position.y,
  zIndex: 1000,
  pointerEvents: 'none',
  transform: getTooltipTransform(calculatedPosition),
}}
        >
          <div
            style={{
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 6,
  padding: 12,
  maxWidth: 300,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  color: '#e2e8f0',
  fontSize: 12,
  lineHeight: 1.4,
}}
          >
            {/* Title */}
            <div style={{
  fontWeight: 600,
  marginBottom: 6,
  color: getContentColor(content.category),
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}}>
              {getCategoryIcon(content.category)}
              {content.title}
              {content.priority === 'high' && ()
                <span style={{ fontSize: 10, color: '#f6ad55' }}>⭐</span>
              )}
            </div>
            {/* Description */}
            <div style={{ marginBottom: 8 }}>
              {content.description}
            </div>
            {/* Examples */}
            {content.examples && content.examples.length > 0 && ()
              <div style={{ marginBottom: 8 }}>
                <div style={{
  fontSize: 10,
  fontWeight: 600,
  color: '#a0aec0',
  marginBottom: 4,
}}>
                  Examples:
                </div>
                {content.examples.map((example, index) => ()
                  <div
                    key={index}
                    style={{
  fontSize: 10,
  color: '#68d391',
  fontFamily: 'monospace',
  background: 'rgba(72, 187, 120, 0.1)',
  padding: '2px 4px',
  borderRadius: 2,
  marginBottom: 2,
}}
                  >
                    {example}
                  </div>
                ))}
              </div>
            )}
            {/* Shortcut */}
            {content.shortcut && ()
              <div style={{
  fontSize: 10,
  color: '#a0aec0',
  marginBottom: 4,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}}>
                <span>⌨️</span>
                <span style={{
  background: '#2d3748',
  padding: '1px 4px',
  borderRadius: 2,
  fontFamily: 'monospace',
}}>
                  {content.shortcut}
                </span>
              </div>
            )}
            {/* Related Features */}
            {content.relatedFeatures && content.relatedFeatures.length > 0 && ()
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #4a5568' }}>
                <div style={{
  fontSize: 10,
  color: '#a0aec0',
  marginBottom: 4,
}}>
                  Related: {content.relatedFeatures.join(', ')}
                </div>
              </div>
            )}
            {/* Learn More Link */}
            {content.learnMoreUrl && ()
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #4a5568' }}>
                <a
                  href={content.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
  fontSize: 10,
  color: '#4299e1',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}}
                >
                  📖 Learn More
                </a>
              </div>
            )}
            {/* Tooltip Arrow */}
            <div
              style={{
  position: 'absolute',
  ...getArrowStyle(calculatedPosition)
}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Progressive onboarding system
interface ProgressiveOnboardingProps {
  steps: any;,
  currentStep: number;
  onNext: () => void;,
  onPrevious: () => void;
  onSkip: () => void;,
  onComplete: () => void;
  if (!currentContent) return null;
  return;
  <div
  style={{
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 2000,
  background: '#1a202c',
  border: '2px solid #4299e1',
  borderRadius: 8,
  padding: 20,
  maxWidth: 400,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
}}
    >
      {/* Step Indicator */}
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
}}>
        <div style={{
  fontSize: 12,
  color: '#a0aec0',
}}>
          Step {currentStep + 1} of {steps.length}
        </div>
        <div style={{
  display: 'flex',
  gap: 4,
}}>
          {steps.map((_, index) => ()
            <div
              key={index}
              style={{
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: index === currentStep ? '#4299e1' : '#4a5568',
}}
            />
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{
  color: '#e2e8f0',
  marginBottom: 20,
}}>
        <h3 style={{
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 8,
  color: '#4299e1',
}}>
          {currentContent.title}
        </h3>
        <p style={{
  fontSize: 14,
  lineHeight: 1.5,
  marginBottom: 12,
}}>
          {currentContent.description}
        </p>
        {/* Examples */}
        {currentContent.examples && ()
          <div style={{ marginBottom: 12 }}>
            {currentContent.examples.map((example, index) => ()
              <div
                key={index}
                style={{
  fontSize: 12,
  color: '#68d391',
  fontFamily: 'monospace',
  background: 'rgba(72, 187, 120, 0.1)',
  padding: '4px 8px',
  borderRadius: 4,
  marginBottom: 4,
}}
              >
                {example}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Navigation */}
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
}}>
        <div style={{ display: 'flex', gap: 8 }}>
          {currentStep > 0 && ()
            <button
              onClick={onPrevious}
              style={{
  padding: '6px 12px',
  background: '#4a5568',
  border: 'none',
  borderRadius: 4,
  color: '#e2e8f0',
  cursor: 'pointer',
  fontSize: 12,
}}
            >
              ← Previous
            </button>
          )}
          <button
            onClick={onSkip}
            style={{
  padding: '6px 12px',
  background: 'transparent',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#a0aec0',
  cursor: 'pointer',
  fontSize: 12,
}}
          >
            Skip Tour
          </button>
        </div>
        <div>
          {currentStep < steps.length - 1 ? ()
            <button
              onClick={onNext}
              style={{
  padding: '6px 12px',
  background: '#4299e1',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
}}
            >
              Next →
            </button>
          ) : ()
            <button
              onClick={onComplete}
              style={{
  padding: '6px 12px',
  background: '#38b2ac',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
}}
            >
              Get Started! 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getTooltipTransform(position: string): string {
  switch (position) {
  case 'top':,
  return 'translate(-50%, -100%) translateY(-8px)';
  case 'bottom':,
  return 'translate(-50%, 0) translateY(8px)';
  case 'left':,
  return 'translate(-100%, -50%) translateX(-8px)';
  case 'right':,
  return 'translate(0, -50%) translateX(8px)';
  default:,
  return 'translate(-50%, -100%) translateY(-8px)';
  function getArrowStyle(position: string): React.CSSProperties {,
  const baseStyle = {
  width: 0,
  height: 0,
  border: '6px solid transparent',
};
  switch (position) {
  case 'top':,
  return {
  ...baseStyle,
  bottom: -12,
  left: '50%',
  marginLeft: -6,
  borderTopColor: '#1a202c',
};
    case 'bottom':
      return {
  ...baseStyle,
  top: -12,
  left: '50%',
  marginLeft: -6,
  borderBottomColor: '#1a202c',
};
    case 'left':
      return {
  ...baseStyle,
  right: -12,
  top: '50%',
  marginTop: -6,
  borderLeftColor: '#1a202c',
};
    case 'right':
      return {
  ...baseStyle,
  left: -12,
  top: '50%',
  marginTop: -6,
  borderRightColor: '#1a202c',
};
    default:
      return {
  ...baseStyle,
  bottom: -12,
  left: '50%',
  marginLeft: -6,
  borderTopColor: '#1a202c',
};
function getContentColor(category: string): string {
  switch (category) {
    case 'basic':
      return '#68d391';      // Green
    case 'advanced':
      return '#4299e1';      // Blue
    case 'debug':
      return '#9f7aea';      // Purple
    case 'onboarding':
      return '#f6ad55';      // Orange
    default:
      return '#e2e8f0';      // Default gray
function getCategoryIcon(category: string): string {
  switch (category) {
    case 'basic':
      return '🎯';
    case 'advanced':
      return '⚙️';
    case 'debug':
      return '🔧';
    case 'onboarding':
      return '🌟';
    default:
      return '💡';

export default ContextualTooltip;