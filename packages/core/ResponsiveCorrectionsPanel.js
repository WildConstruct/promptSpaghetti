import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useCorrectionsEnabled } from './correctionsStore';
import { CorrectionsManagerPanel } from './CorrectionsManagerPanel';
import { MobileCorrectionsPanel } from './components/MobileCorrectionsPanel';
import { CorrectionsStatsDashboard } from './components/CorrectionsStatsDashboard';
export const ResponsiveCorrectionsPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
    if (!isEnabled)
        return null;
    const handleStatsToggle = (): void => {
        setShowStats(!showStats);
    };
    return (_jsxs(_Fragment, { children: [isMobile ? (_jsx(MobileCorrectionsPanel, { isOpen: isOpen, onClose: onClose })) : (_jsx(CorrectionsManagerPanel, { isOpen: isOpen, onClose: onClose })), showStats && (_jsx(CorrectionsStatsDashboard, { isOpen: showStats, onClose: () => setShowStats(false) }))] }));
};
// Hook for opening the corrections panel with stats
export const useCorrectionsPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const openPanel = (): void => setIsOpen(true);
    const closePanel = (): void => setIsOpen(false);
    const togglePanel = (): void => setIsOpen(!isOpen);
    const openStats = (): void => setShowStats(true);
    const closeStats = (): void => setShowStats(false);
    const toggleStats = (): void => setShowStats(!showStats);
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
