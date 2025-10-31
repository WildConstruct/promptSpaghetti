import React, { createContext, useEffect, useRef } from 'react';
import { useAssetBrowserStore } from '../stores/assetBrowserStore';

interface KeyboardNavigatorContextValue {
  toggleOpen: () => void;
  isWithinBounds: () => boolean;
}

export const KeyboardNavigatorContext =
  createContext<KeyboardNavigatorContextValue>({
    toggleOpen: () => {},
    isWithinBounds: () => false
  });

export function KeyboardNavigatorProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const open = useAssetBrowserStore(s => s.detailsOpen);
  const setOpen = useAssetBrowserStore(s => s.setDetailsOpen);
  const moveSelection = useAssetBrowserStore(s => s.moveSelection);
  const toggleOpen = () => setOpen(!open);

  const isWithinBounds = () => {
    if (!containerRef.current) return false;
    const activeElement = document.activeElement;
    return containerRef.current.contains(activeElement);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Only handle keyboard events when focus is within the asset browser
      if (!isWithinBounds()) return;

      // Check if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Handle navigation keys with preventDefault for arrows
      let handled = true;

      if (['ArrowUp', 'k'].includes(e.key)) {
        moveSelection('up');
      } else if (['ArrowDown', 'j'].includes(e.key)) {
        moveSelection('down');
      } else if (['ArrowLeft', 'h'].includes(e.key)) {
        moveSelection('left');
      } else if (['ArrowRight', 'l'].includes(e.key)) {
        moveSelection('right');
      } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      } else {
        handled = false;
      }

      // Prevent default browser behavior for handled keys
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moveSelection, setOpen]);

  return (
    <div ref={containerRef}>
      <KeyboardNavigatorContext.Provider value={{ toggleOpen, isWithinBounds }}>
        {children}
      </KeyboardNavigatorContext.Provider>
    </div>
  );
}
