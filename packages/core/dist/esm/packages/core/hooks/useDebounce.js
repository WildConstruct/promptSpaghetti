import { useCallback, useRef } from 'react';
();
(callback, delay) => {
    const timeoutRef = useRef(null);
    const debouncedCallback = useCallback((...args) => { });
    // Clear existing timeout
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }
    [callback, delay];
    as;
    T;
    return debouncedCallback;
    onWeightChange: (weights) => void delay;
    number = 300;
    const debouncedWeightChange = useDebounce(onWeightChange, delay);
    const handleWeightChange = useCallback((newWeights) => {
        console.log('[Epic 8.5 Task 6] Debounced weight change:', newWeights.length, 'options');
        debouncedWeightChange(newWeights);
    }, [debouncedWeightChange]);
    return handleWeightChange;
};
