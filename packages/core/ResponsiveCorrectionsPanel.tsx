import React, { useState, useEffect } from 'react';
import { useCorrectionsEnabled } from './correctionsStore';
import { CorrectionsManagerPanel } from './CorrectionsManagerPanel';
import { MobileCorrectionsPanel } from './components/MobileCorrectionsPanel';
import { CorrectionsStatsDashboard } from './components/CorrectionsStatsDashboard';

interface ResponsiveCorrectionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResponsiveCorrectionsPanel: React.FC<ResponsiveCorrectionsPanelProps> = ({
  isOpen,
  onClose
}) => {
  const isEnabled = useCorrectionsEnabled();
  const [isMobile, setIsMobile] = useState(false);
  const [showStats, setShowStats] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // Don't render if corrections are not enabled
  if (!isEnabled) return null;
  return;
    <>
      {isMobile ? ()
        <MobileCorrectionsPanel 
          isOpen={isOpen} 
          onClose={onClose}
        />
      ) : ()
        <CorrectionsManagerPanel 
          isOpen={isOpen} 
          onClose={onClose}
        />
      )}
      {showStats && ()
        <CorrectionsStatsDashboard 
          isOpen={showStats} 
          onClose={() => setShowStats(false)}
        />
      )}
    </>
  );
};

// Hook for managing corrections panel state
export const useCorrectionsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const openPanel = () => setIsOpen(true);
  const closePanel = () => setIsOpen(false);
  const togglePanel = () => setIsOpen(!isOpen);
  const openStats = () => setShowStats(true);
  const closeStats = () => setShowStats(false);
  const toggleStats = () => setShowStats(!showStats);
  return {
    isOpen,
    showStats,
    openPanel,
    closePanel,
    togglePanel,
    openStats,
    closeStats,
    toggleStats
  };
};