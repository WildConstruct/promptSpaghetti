// Virtual List Component - Story 2.7
// Performance-optimized virtual scrolling for large lists

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VirtualList.css';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of items to render outside visible area
  className?: string;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  const totalHeight = items.length * itemHeight;
  const containerHeight = Math.min(height, totalHeight);
  
  // Calculate which items should be visible
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!scrollElementRef.current) return;
    
    const scrollElement = scrollElementRef.current;
    let newScrollTop = scrollTop;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newScrollTop = Math.min(scrollTop + itemHeight, totalHeight - containerHeight);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newScrollTop = Math.max(scrollTop - itemHeight, 0);
        break;
      case 'PageDown':
        e.preventDefault();
        newScrollTop = Math.min(scrollTop + containerHeight, totalHeight - containerHeight);
        break;
      case 'PageUp':
        e.preventDefault();
        newScrollTop = Math.max(scrollTop - containerHeight, 0);
        break;
      case 'Home':
        e.preventDefault();
        newScrollTop = 0;
        break;
      case 'End':
        e.preventDefault();
        newScrollTop = totalHeight - containerHeight;
        break;
    }
    
    if (newScrollTop !== scrollTop) {
      scrollElement.scrollTop = newScrollTop;
    }
  }, [scrollTop, itemHeight, totalHeight, containerHeight]);
  
  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (!scrollElementRef.current) return;
    
    const targetScrollTop = index * itemHeight;
    scrollElementRef.current.scrollTop = targetScrollTop;
  }, [itemHeight]);
  
  // Expose scroll function via ref
  useEffect(() => {
    const element = scrollElementRef.current;
    if (element) {
      (element as any).scrollToItem = scrollToItem;
    }
  }, [scrollToItem]);
  
  if (items.length === 0) {
    return (
      <div className={`virtual-list empty ${className}`} style={{ height: containerHeight }}>
        <div className="empty-message">No items to display</div>
      </div>
    );
  }
  
  return (
    <div
      ref={scrollElementRef}
      className={`virtual-list ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
      aria-label="Virtual scrollable list"
    >
      <div
        className="virtual-list-content"
        style={{ height: totalHeight, position: 'relative' }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={actualIndex}
              className="virtual-list-item"
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
              role="option"
              aria-posinset={actualIndex + 1}
              aria-setsize={items.length}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
      
      {/* Accessibility helper - screen reader only */}
      <div className="sr-only" aria-live="polite">
        Showing items {startIndex + 1} to {endIndex + 1} of {items.length}
      </div>
    </div>
  );
}

export default VirtualList;