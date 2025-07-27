import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export const [isMobile, setIsMobile] = useState(false);
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
if (!isEnabled)
    return null;
return (_jsxs(_Fragment, { children: [isMobile ? (_jsx(MobileCorrectionsPanel, { isOpen: isOpen, onClose: onClose })) : (_jsx(CorrectionsManagerPanel, { isOpen: isOpen, onClose: onClose })), showStats && (_jsx(CorrectionsStatsDashboard, { isOpen: showStats, onClose: () => setShowStats(false) }))] }));
;
// Hook for opening the corrections panel with stats
export const [showStats, setShowStats] = useState(false);
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
;
