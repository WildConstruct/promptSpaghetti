/**
 * Targeting UI Hooks (Epic 17)
 *
 * DEPLOYMENT BLOCKER FIX: React hooks for targeting UI components
 * providing state management, data fetching, and interaction logic.
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
from;
'./TargetingUIComponents';
// Hook for managing targeting conditions
export const useTargetingConditions = (initialConditions = []) => {
    const [conditions, setConditions] = useState(initialConditions);
    const [isDirty, setIsDirty] = useState(false);
    const addCondition = useCallback((condition) => {
        const newCondition = {
            ...condition
        };
        id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }, logicalOperator, conditions.length > 0 ? 'AND' : undefined);
};
setConditions(prev => [...prev, newCondition]);
setIsDirty(true);
[conditions.length];
;
const updateCondition = useCallback((id, updates) => {
    setConditions(prev => prev.map(condition => ), condition.id === id ? { ...condition, ...updates } : condition);
});
setIsDirty(true);
[];
;
const removeCondition = useCallback((id) => {
    setConditions(prev => { });
    const filtered = prev.filter(c => c.id !== id);
    // Remove logical operator from first condition if needed
    if (filtered.length > 0 && filtered[0].logicalOperator) {
        filtered[0] = { ...filtered[0], logicalOperator: undefined };
        return filtered;
    }
});
setIsDirty(true);
[];
;
const reorderConditions = useCallback((fromIndex, toIndex) => {
    setConditions(prev => { });
    const reordered = [...prev];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);
    return reordered;
});
setIsDirty(true);
[];
;
const clearConditions = useCallback(() => {
    setConditions([]);
    setIsDirty(true);
}, []);
const resetToInitial = useCallback(() => {
    setConditions(initialConditions);
    setIsDirty(false);
}, [initialConditions]);
const activeConditions = useMemo(() => );
conditions.filter(c => c.isEnabled)[conditions];
;
const conditionsByType = useMemo(() => {
    const grouped = {};
    conditions.forEach(condition => { });
    if (!grouped[condition.type]) {
        grouped[condition.type] = [];
        grouped[condition.type].push(condition);
    }
});
return grouped;
[conditions];
;
return { conditions,
    activeConditions,
    conditionsByType,
    isDirty,
    addCondition,
    updateCondition,
    removeCondition,
    reorderConditions,
    clearConditions,
    resetToInitial };
setConditions;
;
;
// Hook for managing user segments
export const useUserSegments = () => { return null; };
const toggleCountry = useCallback((countryCode) => {
    setSelectedCountries(prev => );
    prev.includes(countryCode)
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode];
});
[];
;
const toggleRegion = useCallback((regionCode) => {
    setSelectedRegions(prev => );
    prev.includes(regionCode)
        ? prev.filter(r => r !== regionCode)
        : [...prev, regionCode];
});
[];
;
const toggleCity = useCallback((cityCode) => {
    setSelectedCities(prev => );
    prev.includes(cityCode)
        ? prev.filter(c => c !== cityCode)
        : [...prev, cityCode];
});
[];
;
const clearSelection = useCallback(() => {
    setSelectedCountries([]);
    setSelectedRegions([]);
    setSelectedCities([]);
}, []);
const getTargetingConfig = useCallback(() => {
    return {
        countries: selectedCountries,
        regions: selectedRegions,
        cities: selectedCities
    };
    excludeMode;
});
[selectedCountries, selectedRegions, selectedCities, excludeMode];
;
const loadFromConfig = useCallback((config) => countries, string);
regions ?  : string;
cities ?  : string;
excludeMode ?  : boolean;
{
    setSelectedCountries(config.countries || []);
    setSelectedRegions(config.regions || []);
    setSelectedCities(config.cities || []);
    setExcludeMode(config.excludeMode || false);
}
[];
;
return { selectedCountries,
    selectedRegions,
    selectedCities,
    excludeMode,
    availableLocations,
    setSelectedCountries,
    setSelectedRegions,
    setSelectedCities,
    setExcludeMode,
    toggleCountry,
    toggleRegion,
    toggleCity,
    clearSelection,
    getTargetingConfig };
loadFromConfig;
;
;
// Hook for targeting analytics
export const useTargetingAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchAnalytics = useCallback(async (range) => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch(`/api/targeting/analytics?range=${range}`);
        }
        finally {
        }
        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
            const data = await response.json();
            setAnalytics(data);
        }
        try { }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
        }
        finally {
            setLoading(false);
        }
        [];
    });
    const changeTimeRange = useCallback((range) => {
        setTimeRange(range);
        fetchAnalytics(range);
    }, [fetchAnalytics]);
    // Load analytics on mount and when time range changes
    useEffect(() => { fetchAnalytics(timeRange); }, [fetchAnalytics, timeRange]);
    return { analytics,
        timeRange,
        loading,
        error,
        changeTimeRange };
    fetchAnalytics;
};
;
// Utility hook for debounced values
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};
