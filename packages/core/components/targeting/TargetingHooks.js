/**
 * Targeting UI Hooks (Epic 17)
 *
 * DEPLOYMENT BLOCKER FIX: React hooks for targeting UI components
 * providing state management, data fetching, and interaction logic.
 */
import { useState, useCallback, useEffect, useMemo } from 'react';
// Hook for managing targeting conditions
export const useTargetingConditions = (initialConditions = []) => {
    const [conditions, setConditions] = useState(initialConditions);
    const [isDirty, setIsDirty] = useState(false);
    const addCondition = useCallback((condition) => {
        const newCondition = {
            ...condition,
            id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            logicalOperator: conditions.length > 0 ? 'AND' : undefined
        };
        setConditions(prev => [...prev, newCondition]);
        setIsDirty(true);
    }, [conditions.length]);
    const updateCondition = useCallback((id, updates) => {
        setConditions(prev => prev.map(condition => condition.id === id ? { ...condition, ...updates } : condition));
        setIsDirty(true);
    }, []);
    const removeCondition = useCallback((id) => {
        setConditions(prev => {
            const filtered = prev.filter(c => c.id !== id);
            // Remove logical operator from first condition if needed
            if (filtered.length > 0 && filtered[0].logicalOperator) {
                filtered[0] = { ...filtered[0], logicalOperator: undefined };
            }
            return filtered;
        });
        setIsDirty(true);
    }, []);
    const reorderConditions = useCallback((fromIndex, toIndex) => {
        setConditions(prev => {
            const reordered = [...prev];
            const [removed] = reordered.splice(fromIndex, 1);
            reordered.splice(toIndex, 0, removed);
            return reordered;
        });
        setIsDirty(true);
    }, []);
    const clearConditions = useCallback(() => {
        setConditions([]);
        setIsDirty(true);
    }, []);
    const resetToInitial = useCallback(() => {
        setConditions(initialConditions);
        setIsDirty(false);
    }, [initialConditions]);
    const activeConditions = useMemo(() => conditions.filter(c => c.isEnabled), [conditions]);
    const conditionsByType = useMemo(() => {
        const grouped = {};
        conditions.forEach(condition => {
            if (!grouped[condition.type]) {
                grouped[condition.type] = [];
            }
            grouped[condition.type].push(condition);
        });
        return grouped;
    }, [conditions]);
    return {
        conditions,
        activeConditions,
        conditionsByType,
        isDirty,
        addCondition,
        updateCondition,
        removeCondition,
        reorderConditions,
        clearConditions,
        resetToInitial,
        setConditions
    };
};
// Hook for managing user segments
export const useUserSegments = () => {
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchSegments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch('/api/user-segments');
            if (!response.ok) {
                throw new Error('Failed to fetch segments');
            }
            const data = await response.json();
            setSegments(data.segments || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch segments');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const createSegment = useCallback(async (segment) => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch('/api/user-segments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(segment)
            });
            if (!response.ok) {
                throw new Error('Failed to create segment');
            }
            const newSegment = await response.json();
            setSegments(prev => [...prev, newSegment]);
            return newSegment;
        }
        catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to create segment';
            setError(error);
            throw new Error(error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const updateSegment = useCallback(async (id, updates) => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch(`/api/user-segments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) {
                throw new Error('Failed to update segment');
            }
            const updatedSegment = await response.json();
            setSegments(prev => prev.map(segment => segment.id === id ? { ...segment, ...updatedSegment } : segment));
            return updatedSegment;
        }
        catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to update segment';
            setError(error);
            throw new Error(error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const deleteSegment = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch(`/api/user-segments/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete segment');
            }
            setSegments(prev => prev.filter(segment => segment.id !== id));
        }
        catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to delete segment';
            setError(error);
            throw new Error(error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const duplicateSegment = useCallback(async (id) => {
        const originalSegment = segments.find(s => s.id === id);
        if (!originalSegment) {
            throw new Error('Segment not found');
        }
        return createSegment({
            ...originalSegment,
            name: `${originalSegment.name} (Copy)`,
            isActive: false
        });
    }, [segments, createSegment]);
    // Load segments on mount
    useEffect(() => {
        fetchSegments();
    }, [fetchSegments]);
    const activeSegments = useMemo(() => segments.filter(s => s.isActive), [segments]);
    const segmentsByTag = useMemo(() => {
        const grouped = {};
        segments.forEach(segment => {
            segment.tags.forEach(tag => {
                if (!grouped[tag]) {
                    grouped[tag] = [];
                }
                grouped[tag].push(segment);
            });
        });
        return grouped;
    }, [segments]);
    return {
        segments,
        activeSegments,
        segmentsByTag,
        loading,
        error,
        fetchSegments,
        createSegment,
        updateSegment,
        deleteSegment,
        duplicateSegment
    };
};
// Hook for targeting preview functionality
export const useTargetingPreview = () => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const generatePreview = useCallback(async (conditions) => {
        if (conditions.length === 0) {
            setPreview(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch('/api/targeting/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conditions })
            });
            if (!response.ok) {
                throw new Error('Failed to generate preview');
            }
            const previewData = await response.json();
            setPreview(previewData);
            return previewData;
        }
        catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to generate preview';
            setError(error);
            throw new Error(error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const clearPreview = useCallback(() => {
        setPreview(null);
        setError(null);
    }, []);
    return {
        preview,
        loading,
        error,
        generatePreview,
        clearPreview
    };
};
// Hook for audience management
export const useAudienceManagement = () => {
    const [audiences, setAudiences] = useState([]);
    const [selectedAudience, setSelectedAudience] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchAudiences = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch('/api/targeting/audiences');
            if (!response.ok) {
                throw new Error('Failed to fetch audiences');
            }
            const data = await response.json();
            setAudiences(data.audiences || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch audiences');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const createAudience = useCallback(async (audience) => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch('/api/targeting/audiences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(audience)
            });
            if (!response.ok) {
                throw new Error('Failed to create audience');
            }
            const newAudience = await response.json();
            setAudiences(prev => [...prev, newAudience]);
            return newAudience;
        }
        catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to create audience';
            setError(error);
            throw new Error(error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const updateAudience = useCallback(async (id, updates) => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch(`/api/targeting/audiences/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) {
                throw new Error('Failed to update audience');
            }
            const updatedAudience = await response.json();
            setAudiences(prev => prev.map(audience => audience.id === id ? { ...audience, ...updatedAudience } : audience));
            if (selectedAudience?.id === id) {
                setSelectedAudience({ ...selectedAudience, ...updatedAudience });
            }
            return updatedAudience;
        }
        catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to update audience';
            setError(error);
            throw new Error(error);
        }
        finally {
            setLoading(false);
        }
    }, [selectedAudience]);
    const deleteAudience = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            // Mock API call - replace with actual implementation
            const response = await fetch(`/api/targeting/audiences/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete audience');
            }
            setAudiences(prev => prev.filter(audience => audience.id !== id));
            if (selectedAudience?.id === id) {
                setSelectedAudience(null);
            }
        }
        catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to delete audience';
            setError(error);
            throw new Error(error);
        }
        finally {
            setLoading(false);
        }
    }, [selectedAudience]);
    const selectAudience = useCallback((audience) => {
        setSelectedAudience(audience);
    }, []);
    // Load audiences on mount
    useEffect(() => {
        fetchAudiences();
    }, [fetchAudiences]);
    const activeAudiences = useMemo(() => audiences.filter(a => a.isActive), [audiences]);
    return {
        audiences,
        activeAudiences,
        selectedAudience,
        loading,
        error,
        fetchAudiences,
        createAudience,
        updateAudience,
        deleteAudience,
        selectAudience
    };
};
// Hook for geographic targeting
export const useGeographicTargeting = () => {
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const [excludeMode, setExcludeMode] = useState(false);
    const [availableLocations, setAvailableLocations] = useState({
        countries: [],
        regions: [],
        cities: []
    });
    const toggleCountry = useCallback((countryCode) => {
        setSelectedCountries(prev => prev.includes(countryCode)
            ? prev.filter(c => c !== countryCode)
            : [...prev, countryCode]);
    }, []);
    const toggleRegion = useCallback((regionCode) => {
        setSelectedRegions(prev => prev.includes(regionCode)
            ? prev.filter(r => r !== regionCode)
            : [...prev, regionCode]);
    }, []);
    const toggleCity = useCallback((cityCode) => {
        setSelectedCities(prev => prev.includes(cityCode)
            ? prev.filter(c => c !== cityCode)
            : [...prev, cityCode]);
    }, []);
    const clearSelection = useCallback(() => {
        setSelectedCountries([]);
        setSelectedRegions([]);
        setSelectedCities([]);
    }, []);
    const getTargetingConfig = useCallback(() => {
        return {
            countries: selectedCountries,
            regions: selectedRegions,
            cities: selectedCities,
            excludeMode
        };
    }, [selectedCountries, selectedRegions, selectedCities, excludeMode]);
    const loadFromConfig = useCallback((config) => {
        setSelectedCountries(config.countries || []);
        setSelectedRegions(config.regions || []);
        setSelectedCities(config.cities || []);
        setExcludeMode(config.excludeMode || false);
    }, []);
    return {
        selectedCountries,
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
        getTargetingConfig,
        loadFromConfig
    };
};
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
            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }
            const data = await response.json();
            setAnalytics(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const changeTimeRange = useCallback((range) => {
        setTimeRange(range);
        fetchAnalytics(range);
    }, [fetchAnalytics]);
    // Load analytics on mount and when time range changes
    useEffect(() => {
        fetchAnalytics(timeRange);
    }, [fetchAnalytics, timeRange]);
    return {
        analytics,
        timeRange,
        loading,
        error,
        changeTimeRange,
        fetchAnalytics
    };
};
// Utility hook for debounced values
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};
