/**
 * Smart Tooltip - Advanced tooltip with arrow and collision detection
 */

import React, { useRef, useEffect, useState } from 'react';

interface SmartTooltipProps {
  target: HTMLElement | null;
  visible: boolean;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  children: React.ReactNode;
  offset?: number;
  arrow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface Position {
  top: number;
  left: number;
  arrowPosition: 'top' | 'right' | 'bottom' | 'left';
  arrowOffset: number;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  target,
  visible,
  position = 'auto',
  children,
  offset = 12,
  arrow = true,
  className = '',
  style = {},
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [calculatedPosition, setCalculatedPosition] = useState<Position>({
    top: 0,
    left: 0,
    arrowPosition: 'bottom',
    arrowOffset: 50,
  });

  useEffect(() => {
    if (!visible || !target || !tooltipRef.current) return;

    const calculatePosition = () => {
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipRef.current!.getBoundingClientRect();
      
      // Calculate available space in each direction
      const space = {
        top: targetRect.top,
        right: window.innerWidth - targetRect.right,
        bottom: window.innerHeight - targetRect.bottom,
        left: targetRect.left,
      };

      // Determine best position
      let bestPosition = position;
      if (position === 'auto') {
        const positions: Array<'top' | 'right' | 'bottom' | 'left'> = ['bottom', 'right', 'top', 'left'];
        bestPosition = positions.reduce((best, pos) => {
          const requiredSpace = pos === 'top' || pos === 'bottom' 
            ? tooltipRect.height + offset
            : tooltipRect.width + offset;
          
          return space[pos] >= requiredSpace && space[pos] > space[best] ? pos : best;
        }, positions[0]);
      }

      // Calculate position based on best placement
      let top = 0;
      let left = 0;
      let arrowPosition: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
      let arrowOffset = 50; // percentage

      switch (bestPosition) {
        case 'top':
          top = targetRect.top - tooltipRect.height - offset;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          arrowPosition = 'bottom';
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.right + offset;
          arrowPosition = 'left';
          break;
        case 'bottom':
          top = targetRect.bottom + offset;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          arrowPosition = 'top';
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.left - tooltipRect.width - offset;
          arrowPosition = 'right';
          break;
      }

      // Adjust for viewport boundaries
      const margin = 8;
      
      if (left < margin) {
        const shift = margin - left;
        left = margin;
        if (arrowPosition === 'top' || arrowPosition === 'bottom') {
          arrowOffset = Math.max(20, Math.min(80, ((targetRect.left + targetRect.width / 2 - margin) / tooltipRect.width) * 100));
        }
      } else if (left + tooltipRect.width > window.innerWidth - margin) {
        const shift = left + tooltipRect.width - (window.innerWidth - margin);
        left = window.innerWidth - tooltipRect.width - margin;
        if (arrowPosition === 'top' || arrowPosition === 'bottom') {
          arrowOffset = Math.max(20, Math.min(80, ((targetRect.left + targetRect.width / 2 - left) / tooltipRect.width) * 100));
        }
      }

      if (top < margin) {
        const shift = margin - top;
        top = margin;
        if (arrowPosition === 'left' || arrowPosition === 'right') {
          arrowOffset = Math.max(20, Math.min(80, ((targetRect.top + targetRect.height / 2 - margin) / tooltipRect.height) * 100));
        }
      } else if (top + tooltipRect.height > window.innerHeight - margin) {
        const shift = top + tooltipRect.height - (window.innerHeight - margin);
        top = window.innerHeight - tooltipRect.height - margin;
        if (arrowPosition === 'left' || arrowPosition === 'right') {
          arrowOffset = Math.max(20, Math.min(80, ((targetRect.top + targetRect.height / 2 - top) / tooltipRect.height) * 100));
        }
      }

      setCalculatedPosition({ top, left, arrowPosition, arrowOffset });
    };

    // Initial calculation
    calculatePosition();

    // Recalculate on window resize or scroll
    const handleReposition = () => calculatePosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [visible, target, position, offset]);

  if (!visible || !target) return null;

  const getArrowStyles = (): React.CSSProperties => {
    const size = 8;
    const color = 'white';
    const shadowColor = 'rgba(0, 0, 0, 0.1)';

    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (calculatedPosition.arrowPosition) {
      case 'top':
        return {
          ...baseStyles,
          top: -size,
          left: `${calculatedPosition.arrowOffset}%`,
          transform: 'translateX(-50%)',
          borderWidth: `0 ${size}px ${size}px ${size}px`,
          borderColor: `transparent transparent ${color} transparent`,
          filter: `drop-shadow(0 -2px 2px ${shadowColor})`,
        };
      case 'right':
        return {
          ...baseStyles,
          right: -size,
          top: `${calculatedPosition.arrowOffset}%`,
          transform: 'translateY(-50%)',
          borderWidth: `${size}px 0 ${size}px ${size}px`,
          borderColor: `transparent transparent transparent ${color}`,
          filter: `drop-shadow(2px 0 2px ${shadowColor})`,
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: -size,
          left: `${calculatedPosition.arrowOffset}%`,
          transform: 'translateX(-50%)',
          borderWidth: `${size}px ${size}px 0 ${size}px`,
          borderColor: `${color} transparent transparent transparent`,
          filter: `drop-shadow(0 2px 2px ${shadowColor})`,
        };
      case 'left':
        return {
          ...baseStyles,
          left: -size,
          top: `${calculatedPosition.arrowOffset}%`,
          transform: 'translateY(-50%)',
          borderWidth: `${size}px ${size}px ${size}px 0`,
          borderColor: `transparent ${color} transparent transparent`,
          filter: `drop-shadow(-2px 0 2px ${shadowColor})`,
        };
    }
  };

  return (
    <div
      ref={tooltipRef}
      className={`smart-tooltip ${className}`}
      style={{
        position: 'fixed',
        top: calculatedPosition.top,
        left: calculatedPosition.left,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 10000,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
        ...style,
      }}
    >
      {children}
      
      {arrow && (
        <div
          className="tooltip-arrow"
          style={getArrowStyles()}
        />
      )}
    </div>
  );
};

// Tooltip wrapper component
export const TooltipWrapper: React.FC<{
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  delay?: number;
  arrow?: boolean;
  disabled?: boolean;
}> = ({
  content,
  children,
  position = 'auto',
  delay = 500,
  arrow = true,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    
    setTarget(e.currentTarget);
    clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
    setTarget(null);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const childElement = React.cloneElement(children, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  return (
    <>
      {childElement}
      <SmartTooltip
        target={target}
        visible={visible}
        position={position}
        arrow={arrow}
      >
        {content}
      </SmartTooltip>
    </>
  );
};