/**
 * useEditTransitions Hook
 * Manages animation states for smooth edit mode transitions
 */
import { useState, useEffect, useCallback, useRef } from 'react';
export function useEditTransitions({ isEditing, isFocused = false, hasError = false }) {
    const [transitionState, setTransitionState] = useState({
        isEnteringEdit: false,
        isExitingEdit: false,
        isValueConfirmed: false,
        isValueCancelled: false,
        hasTabFocus: false,
        hasError: false,
        animationClass: ''
    });
    const previousEditingRef = useRef(isEditing);
    const previousFocusRef = useRef(isFocused);
    const animationTimeoutRef = useRef();
    // Clear animation timeout on unmount
    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);
    // Handle edit mode transitions
    useEffect(() => {
        const wasEditing = previousEditingRef.current;
        previousEditingRef.current = isEditing;
        // Entering edit mode
        if (!wasEditing && isEditing) {
            setTransitionState(prev => ({
                ...prev,
                isEnteringEdit: true,
                isExitingEdit: false,
                animationClass: 'entering-edit'
            }));
            animationTimeoutRef.current = setTimeout(() => {
                setTransitionState(prev => ({
                    ...prev,
                    isEnteringEdit: false,
                    animationClass: ''
                }));
            }, 300);
        }
        // Exiting edit mode
        if (wasEditing && !isEditing) {
            setTransitionState(prev => ({
                ...prev,
                isExitingEdit: true,
                isEnteringEdit: false,
                animationClass: 'exiting-edit'
            }));
            animationTimeoutRef.current = setTimeout(() => {
                setTransitionState(prev => ({
                    ...prev,
                    isExitingEdit: false,
                    animationClass: ''
                }));
            }, 250);
        }
    }, [isEditing]);
    // Handle focus transitions
    useEffect(() => {
        const wasFocused = previousFocusRef.current;
        previousFocusRef.current = isFocused;
        if (!wasFocused && isFocused) {
            setTransitionState(prev => ({
                ...prev,
                hasTabFocus: true
            }));
        }
        else if (wasFocused && !isFocused) {
            setTransitionState(prev => ({
                ...prev,
                hasTabFocus: false
            }));
        }
    }, [isFocused]);
    // Handle error state
    useEffect(() => {
        setTransitionState(prev => ({
            ...prev,
            hasError
        }));
    }, [hasError]);
    // Trigger value confirmed animation
    const triggerValueConfirmed = useCallback(() => {
        setTransitionState(prev => ({
            ...prev,
            isValueConfirmed: true,
            isValueCancelled: false
        }));
        animationTimeoutRef.current = setTimeout(() => {
            setTransitionState(prev => ({
                ...prev,
                isValueConfirmed: false
            }));
        }, 400);
    }, []);
    // Trigger value cancelled animation
    const triggerValueCancelled = useCallback(() => {
        setTransitionState(prev => ({
            ...prev,
            isValueCancelled: true,
            isValueConfirmed: false
        }));
        animationTimeoutRef.current = setTimeout(() => {
            setTransitionState(prev => ({
                ...prev,
                isValueCancelled: false
            }));
        }, 300);
    }, []);
    // Get combined CSS classes
    const getAnimationClasses = useCallback(() => {
        const classes = [];
        if (transitionState.animationClass) {
            classes.push(`epic1-${transitionState.animationClass}`);
        }
        if (transitionState.isValueConfirmed) {
            classes.push('epic1-value-confirmed');
        }
        if (transitionState.isValueCancelled) {
            classes.push('epic1-value-cancelled');
        }
        if (transitionState.hasTabFocus) {
            classes.push('epic1-tab-focus');
        }
        else if (previousFocusRef.current) {
            classes.push('epic1-tab-blur');
        }
        if (transitionState.hasError) {
            classes.push('epic1-input-error');
        }
        return classes.join(' ');
    }, [transitionState]);
    return {
        transitionState,
        triggerValueConfirmed,
        triggerValueCancelled,
        animationClasses: getAnimationClasses()
    };
}
// Hook for managing weighted choice option animations
export function useWeightedOptionTransitions() {
    const [animatingOptions, setAnimatingOptions] = useState(new Set());
    const animateOptionAdd = useCallback((index) => {
        setAnimatingOptions(prev => new Set(prev).add(index));
        setTimeout(() => {
            setAnimatingOptions(prev => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
        }, 300);
    }, []);
    const animateOptionRemove = useCallback((index, onComplete) => {
        setAnimatingOptions(prev => new Set(prev).add(index));
        setTimeout(() => {
            onComplete();
            setAnimatingOptions(prev => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
        }, 200);
    }, []);
    const getOptionClass = useCallback((index, isRemoving) => {
        if (!animatingOptions.has(index))
            return '';
        return isRemoving ? 'epic1-weighted-option-exiting' : 'epic1-weighted-option-entering';
    }, [animatingOptions]);
    return {
        animateOptionAdd,
        animateOptionRemove,
        getOptionClass
    };
}
