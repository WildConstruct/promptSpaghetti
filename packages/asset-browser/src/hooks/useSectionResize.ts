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

// Throttle function to limit update frequency
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      // Schedule the final call
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(
        () => {
          lastCall = Date.now();
          func(...args);
        },
        delay - (now - lastCall)
      );
    }
  };
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

  const [sectionStates, setSectionStates] =
    useState<Record<string, SectionState>>(getSavedHeights);
  const [resizingSection, setResizingSection] = useState<string | null>(null);
  const [tempHeight, setTempHeight] = useState<number | null>(null);

  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(0);
  const dragTargetSectionRef = useRef<string>('');
  const rafRef = useRef<number>();

  // Save heights to localStorage
  const saveHeights = useCallback(
    (states: Record<string, SectionState>) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(states));
      }
    },
    [storageKey]
  );

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, sectionId: string) => {
      e.preventDefault();
      e.stopPropagation();

      setResizingSection(sectionId);
      dragStartYRef.current = e.clientY;
      dragStartHeightRef.current = sectionStates[sectionId]?.height || 200;
      dragTargetSectionRef.current = sectionId;
      setTempHeight(dragStartHeightRef.current);

      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      // Prevent text selection during drag
      document.body.style.webkitUserSelect = 'none';
      (document.body.style as any).msUserSelect = 'none';
    },
    [sectionStates]
  );

  // Throttled height update for visual feedback
  const updateTempHeight = useCallback(
    throttle((sectionId: string, height: number) => {
      setTempHeight(height);
    }, 16), // ~60fps
    []
  );

  // Handle resize move with RAF for smooth performance
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingSection) return;

      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const section = sections.find(s => s.id === resizingSection);
        if (!section) return;

        const deltaY = e.clientY - dragStartYRef.current;
        const newHeight = Math.max(
          dragStartHeightRef.current + deltaY,
          section.minHeight
        );

        // Update temporary height for visual feedback
        updateTempHeight(resizingSection, newHeight);
      });
    },
    [resizingSection, sections, updateTempHeight]
  );

  // Handle resize end
  const handleMouseUp = useCallback(() => {
    if (!resizingSection || tempHeight === null) return;

    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Commit the final height
    setSectionStates(prev => {
      const newStates = {
        ...prev,
        [resizingSection]: {
          ...prev[resizingSection],
          height: tempHeight
        }
      };
      saveHeights(newStates);
      return newStates;
    });

    onHeightChange?.(resizingSection, tempHeight);

    // Clean up
    setResizingSection(null);
    setTempHeight(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    (document.body.style as any).msUserSelect = '';
  }, [resizingSection, tempHeight, saveHeights, onHeightChange]);

  // Toggle section collapse
  const toggleCollapse = useCallback(
    (sectionId: string) => {
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
    },
    [saveHeights]
  );

  // Get section height - use temp height during resize for smooth updates
  const getSectionHeight = useCallback(
    (sectionId: string): number => {
      const state = sectionStates[sectionId];
      if (state?.collapsed) return 30; // Collapsed header height

      // Use temp height during resize for smooth visual feedback
      if (resizingSection === sectionId && tempHeight !== null) {
        return tempHeight;
      }

      return (
        state?.height ||
        sections.find(s => s.id === sectionId)?.defaultHeight ||
        200
      );
    },
    [sectionStates, sections, resizingSection, tempHeight]
  );

  // Check if section is collapsed
  const isSectionCollapsed = useCallback(
    (sectionId: string): boolean => {
      return sectionStates[sectionId]?.collapsed || false;
    },
    [sectionStates]
  );

  // Set up global mouse listeners with passive option for better performance
  useEffect(() => {
    if (resizingSection) {
      // Use passive: false for mousemove to allow preventDefault if needed
      const moveOptions = { passive: false, capture: true };
      const upOptions = { passive: true, capture: true };

      document.addEventListener('mousemove', handleMouseMove, moveOptions);
      document.addEventListener('mouseup', handleMouseUp, upOptions);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove, moveOptions);
        document.removeEventListener('mouseup', handleMouseUp, upOptions);

        // Clean up any pending RAF
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
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
