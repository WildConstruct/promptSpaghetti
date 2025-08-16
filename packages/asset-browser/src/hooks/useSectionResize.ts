import { useState, useCallback, useRef, useEffect } from 'react';

interface Section {
  id: string;
  minHeight: number;
  defaultHeight: number;
  collapsed?: boolean;
}

interface UseSectionResizeOptions {
  sections: Section[];
  storageKey?: string;
  onHeightChange?: (sectionId: string, height: number) => void;
}

interface SectionState {
  height: number;
  collapsed: boolean;
}

export function useSectionResize({
  sections,
  storageKey = 'assetBrowser.sectionHeights',
  onHeightChange
}: UseSectionResizeOptions) {
  // Load saved heights from localStorage
  const getSavedHeights = (): Record<string, SectionState> => {
    if (typeof window === 'undefined') return {};
    
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Invalid JSON, return empty
      }
    }
    
    // Return default heights
    const defaults: Record<string, SectionState> = {};
    sections.forEach(section => {
      defaults[section.id] = {
        height: section.defaultHeight,
        collapsed: section.collapsed || false
      };
    });
    return defaults;
  };

  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>(getSavedHeights);
  const [resizingSection, setResizingSection] = useState<string | null>(null);
  
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(0);
  const dragTargetSectionRef = useRef<string>('');

  // Save heights to localStorage
  const saveHeights = useCallback((states: Record<string, SectionState>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(states));
    }
  }, [storageKey]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setResizingSection(sectionId);
    dragStartYRef.current = e.clientY;
    dragStartHeightRef.current = sectionStates[sectionId]?.height || 200;
    dragTargetSectionRef.current = sectionId;
    
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [sectionStates]);

  // Handle resize move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingSection) return;

    const section = sections.find(s => s.id === resizingSection);
    if (!section) return;

    const deltaY = e.clientY - dragStartYRef.current;
    const newHeight = Math.max(
      dragStartHeightRef.current + deltaY,
      section.minHeight
    );

    setSectionStates(prev => ({
      ...prev,
      [resizingSection]: {
        ...prev[resizingSection],
        height: newHeight
      }
    }));

    onHeightChange?.(resizingSection, newHeight);
  }, [resizingSection, sections, onHeightChange]);

  // Handle resize end
  const handleMouseUp = useCallback(() => {
    if (!resizingSection) return;
    
    setResizingSection(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    saveHeights(sectionStates);
  }, [resizingSection, sectionStates, saveHeights]);

  // Toggle section collapse
  const toggleCollapse = useCallback((sectionId: string) => {
    setSectionStates(prev => {
      const newStates = {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          collapsed: !prev[sectionId]?.collapsed
        }
      };
      saveHeights(newStates);
      return newStates;
    });
  }, [saveHeights]);

  // Get section height
  const getSectionHeight = useCallback((sectionId: string): number => {
    const state = sectionStates[sectionId];
    if (state?.collapsed) return 30; // Collapsed header height
    return state?.height || sections.find(s => s.id === sectionId)?.defaultHeight || 200;
  }, [sectionStates, sections]);

  // Check if section is collapsed
  const isSectionCollapsed = useCallback((sectionId: string): boolean => {
    return sectionStates[sectionId]?.collapsed || false;
  }, [sectionStates]);

  // Set up global mouse listeners
  useEffect(() => {
    if (resizingSection) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingSection, handleMouseMove, handleMouseUp]);

  // Initialize states for new sections
  useEffect(() => {
    const currentIds = Object.keys(sectionStates);
    const newSections = sections.filter(s => !currentIds.includes(s.id));
    
    if (newSections.length > 0) {
      setSectionStates(prev => {
        const updated = { ...prev };
        newSections.forEach(section => {
          updated[section.id] = {
            height: section.defaultHeight,
            collapsed: section.collapsed || false
          };
        });
        return updated;
      });
    }
  }, [sections]);

  return {
    getSectionHeight,
    isSectionCollapsed,
    handleResizeStart,
    toggleCollapse,
    isResizing: resizingSection !== null,
    resizingSection
  };
}