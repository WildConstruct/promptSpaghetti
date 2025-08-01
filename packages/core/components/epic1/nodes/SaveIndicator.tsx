import React, { useEffect, useState } from 'react';

interface SaveIndicatorProps {
  trigger: number; // Increment to trigger animation
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ trigger }) => {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (trigger > 0) {
      setShowCheck(true);
      const timer = setTimeout(() => {
        setShowCheck(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!showCheck) return null;

  return <div className="epic1-complete-animation">✓</div>;
};