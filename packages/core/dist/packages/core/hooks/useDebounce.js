import { useCallback, useRef } from 'react';
/**
 * useDebounce hook for Epic 8.5 Task 6: Real-Time Weight Integration
 * Provides debounced execution to prevent excessive preview regeneration
 * when weight controls change rapidly.
 */
export function useDebounce(callback, delay) {
    const timeoutRef = useRef(null);
    const debouncedCallback = useCallback((...args) => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
    return debouncedCallback;
}
/**
 * useWeightChangeDebounce - Specialized debounce for weight control changes
 * Epic 8.5 Task 6: Optimized for preview system integration
 */
export function useWeightChangeDebounce(onWeightChange, delay = 300) {
    const debouncedWeightChange = useDebounce(onWeightChange, delay);
    const handleWeightChange = useCallback((newWeights) => {
        // Log for Epic 8.5 debugging
        console.log('[Epic 8.5 Task 6] Debounced weight change:', newWeights.length, 'options');
        debouncedWeightChange(newWeights);
    }, [debouncedWeightChange]);
    return handleWeightChange;
}
