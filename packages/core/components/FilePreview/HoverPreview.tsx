/**
 * HoverPreview - Component for displaying file previews on hover
 * 
 * Shows file preview modal positioned relative to the hovered element
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FilePreview, FilePreviewData } from './FilePreview';

interface HoverPreviewProps {
  /** File data to preview */
  file: FilePreviewData;
  
  /** Whether the preview is visible */
  visible: boolean;
  
  /** Mouse position for positioning */
  mousePosition: { x: number; y: number };
  
  /** Delay before showing preview (ms) */
  delay?: number;
  
  /** Callback when preview is clicked */
  onClick?: (file: FilePreviewData) => void;
  
  /** Callback when preview should close */
  onClose?: () => void;
}

export const HoverPreview: React.FC<HoverPreviewProps> = ({
  file,
  visible,
  mousePosition,
  delay = 500,
  onClick,
  onClose
}) => {
  const [isShowing, setIsShowing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Calculate optimal position for the preview
  const calculatePosition = useCallback((mouseX: number, mouseY: number) => {
    const padding = 12;
    const previewWidth = 400;
    const previewHeight = 300;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x = mouseX + padding;
    let y = mouseY + padding;
    
    // Adjust if preview would go off-screen horizontally
    if (x + previewWidth > viewportWidth) {
      x = mouseX - previewWidth - padding;
    }
    
    // Adjust if preview would go off-screen vertically
    if (y + previewHeight > viewportHeight) {
      y = mouseY - previewHeight - padding;
    }
    
    // Ensure preview stays within bounds
    x = Math.max(padding, Math.min(x, viewportWidth - previewWidth - padding));
    y = Math.max(padding, Math.min(y, viewportHeight - previewHeight - padding));
    
    return { x, y };
  }, []);

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set position and show after delay
      timeoutRef.current = setTimeout(() => {
        const pos = calculatePosition(mousePosition.x, mousePosition.y);
        setPosition(pos);
        setIsShowing(true);
      }, delay);
    } else {
      // Clear timeout and hide immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsShowing(false);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, mousePosition, delay, calculatePosition]);

  // Handle click
  const handleClick = useCallback(() => {
    onClick?.(file);
    onClose?.();
  }, [onClick, file, onClose]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    if (isShowing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isShowing, onClose]);

  if (!isShowing) {
    return null;
  }

  return (
    <div
      ref={previewRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 10000,
        backgroundColor: 'white',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        border: '1px solid #ddd',
        maxWidth: '400px',
        animation: 'fadeIn 0.2s ease-out',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
    >
      <FilePreview
        file={file}
        mode="full"
        isHover={true}
      />
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Hook for managing hover preview state
 */
export const useHoverPreview = () => {
  const [hoveredFile, setHoveredFile] = useState<FilePreviewData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const showPreview = useCallback((file: FilePreviewData, event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
    setHoveredFile(file);
    setIsVisible(true);
  }, []);

  const hidePreview = useCallback(() => {
    setIsVisible(false);
    // Keep file data for a moment to allow for smooth transitions
    setTimeout(() => {
      if (!isVisible) {
        setHoveredFile(null);
      }
    }, 200);
  }, [isVisible]);

  const updateMousePosition = useCallback((event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  return {
    hoveredFile,
    mousePosition,
    isVisible,
    showPreview,
    hidePreview,
    updateMousePosition
  };
};

export default HoverPreview;