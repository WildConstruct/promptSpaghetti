/**
 * Granular Consent Options Interface
 * 
 * Provides comprehensive UI for users to manage detailed consent preferences
 * with category-based granular controls and compliance transparency.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-297
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ConsentCategory, ConsentOption, ConsentPreference } from '../../types/consent';
interface GranularConsentInterfaceProps {
  userId: string;,
  onSave: (preferences: ConsentPreference) => Promise<void>;
  onCancel?: () => void;
  initialPreferences?: ConsentPreference;
  readOnly?: boolean;
  complianceMode?: 'GDPR' | 'CCPA' | 'LGPD' | 'PIPEDA';
interface CategoryState {
  expanded: boolean;,
  allEnabled: boolean;
  someEnabled: boolean;

export const [categories, setCategories] = useState<ConsentCategory>([]);
  const [categoryStates, setCategoryStates] = useState<Record<string, CategoryState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  useEffect(() => {
    loadConsentCategories();
  }, [complianceMode, loadConsentCategories]);
  useEffect(() => {
    updateCategoryStates();
  }, [preferences, categories, updateCategoryStates]);
  const loadConsentCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/consent/categories?compliance=${complianceMode}`);}
      if (!response.ok) throw new Error('Failed to load consent categories');
      const data = await response.json();
      setCategories(data.categories);
      // Initialize preferences if empty
      if (preferences.length === 0) {
  const defaultPreferences = data.categories.flatMap((cat: ConsentCategory) =>;
  cat.options.map((opt: ConsentOption) => ({,)
  userId,
  optionId: opt.id,
  categoryId: cat.id,
  granted: opt.required || opt.defaultValue,
  timestamp: new Date(),
  source: 'user_interface',
  ipAddress: '',
  userAgent: navigator.userAgent,
}))
        );
        setPreferences(defaultPreferences);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load categories');
} finally {
      setLoading(false);
  }, [complianceMode, userId, preferences]);
  const updateCategoryStates = useCallback(() => {
    const newStates: Record<string, CategoryState> = {};
    categories.forEach(category => {)
  const categoryPrefs = preferences.filter(p => p.categoryId === category.id);
  const enabledCount = categoryPrefs.filter(p => p.granted).length;
  const totalCount = category.options.length;
  newStates[category.id] = {
  expanded: categoryStates[category.id]?.expanded ?? false,
  allEnabled: enabledCount === totalCount && totalCount > 0,
  someEnabled: enabledCount > 0 && enabledCount < totalCount,
};
    });
    setCategoryStates(newStates);
  }, [categories, preferences, categoryStates]);
  const handleOptionChange = (optionId: string, categoryId: string, granted: boolean) => {
    if (readOnly) return;
    setPreferences(prev => {)
  const existing = prev.find(p => p.optionId === optionId);
      if (existing) {
        return prev.map(p => )
          p.optionId === optionId 
            ? { ...p, granted, timestamp: new Date() }
            : p
        );
      } else {
  return [...prev, {
  userId,
  optionId,
  categoryId,
  granted,
  timestamp: new Date(),
  source: 'user_interface',
  ipAddress: '',
  userAgent: navigator.userAgent,
}];
    });
    setHasChanges(true);
  };
  const handleCategoryToggle = (categoryId: string, enable: boolean) => {
    if (readOnly) return;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    category.options.forEach(option => {)
  if (!option.required) { // Don't change required options
        handleOptionChange(option.id, categoryId, enable);
    });
  };
  const toggleCategoryExpansion = (categoryId: string) => {
  setCategoryStates(prev => ({)
  ...prev,
  [categoryId]: {,
  ...prev[categoryId],
  expanded: !prev[categoryId]?.expanded,
}));
  };
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave(preferences);
      setHasChanges(false);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to save preferences');
} finally {
      setSaving(false);
  };
  const getPreferenceForOption = (optionId: string): boolean => {
    return preferences.find(p => p.optionId === optionId)?.granted ?? false;
  };
  const getComplianceInfo = () => {
  switch (complianceMode) {
  case 'GDPR':,
  return {
  title: 'GDPR Compliance',
  description: 'Under GDPR, you have the right to withdraw consent at any time.',
  legalBasis: 'Article 6(1)(a) and Article 7',
};
    case 'CCPA':
      return {
  title: 'CCPA Compliance',
  description: 'You have the right to opt-out of the sale of your personal information.',
  legalBasis: 'California Civil Code Section 1798.120',
};
    case 'LGPD':
      return {
  title: 'LGPD Compliance',
  description: 'You may revoke consent at any time.',
  legalBasis: 'Article 8, Lei Geral de Proteção de Dados',
};
    case 'PIPEDA':
      return {
  title: 'PIPEDA Compliance',
  description: 'You may withdraw consent for collection, use or disclosure.',
  legalBasis: 'Personal Information Protection and Electronic Documents Act',
};
    default:
      return {,
  title: 'Privacy Compliance',
  description: 'You can control how your data is used.',
  legalBasis: 'Privacy Policy',
};
  };
  if (loading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading consent options...</span>
      </div>
    );
  const complianceInfo = getComplianceInfo();
  return;
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Privacy Preferences</h2>
        <p className="text-gray-600 mt-2">
          Control how your personal data is collected, used, and shared. You can change these settings at any time.
        </p>
        {/* Compliance Info */}
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <h3 className="font-semibold text-blue-900">{complianceInfo.title}</h3>
          <p className="text-blue-800 text-sm mt-1">{complianceInfo.description}</p>
          <p className="text-blue-700 text-xs mt-1">Legal basis: {complianceInfo.legalBasis}</p>
        </div>
      </div>
      {/* Error Display */}
      {error && ()
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      {/* Consent Categories */}
      <div className="space-y-6">
        {categories.map(category => {)
  const categoryState = categoryStates[category.id] || { expanded: false, allEnabled: false, someEnabled: false };
          return;
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleCategoryExpansion(category.id)}
                        className="mr-3 p-1 hover:bg-gray-200 rounded"
                        aria-label={`${categoryState.expanded ? 'Collapse' : 'Expand'} ${category.name}`}
                      >
                        <svg 
                          className={`w-5 h-5 transform transition-transform ${categoryState.expanded ? 'rotate-90' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        {category.legalBasis && ()
                          <p className="text-xs text-gray-500 mt-1">Legal basis: {category.legalBasis}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Category Toggle */}
                  {!readOnly && ()
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryState.allEnabled}
                          ref={input => {
                            if (input) input.indeterminate = categoryState.someEnabled && !categoryState.allEnabled;
                          }}
                          onChange={(e) => handleCategoryToggle(category.id, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`
                          relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out
                          ${categoryState.allEnabled }
                      ? 'bg-blue-600' 
                      : categoryState.someEnabled 
                        ? 'bg-yellow-400' 
                        : 'bg-gray-300'
                        `}>
                          <div className={`
                            absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out
                            ${categoryState.allEnabled ? 'transform translate-x-6' : ''}
                          `}></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {categoryState.allEnabled ? 'All enabled' : 
                            categoryState.someEnabled ? 'Partially enabled' : 'All disabled'}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              {/* Category Options */}
              {categoryState.expanded && ()
                <div className="p-4 space-y-4">
                  {category.options.map(option => {)
  const isGranted = getPreferenceForOption(option.id);
                    const isDisabled = readOnly || option.required;
                    return;
                      <div key={option.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              disabled={isDisabled}
                              onChange={(e) => handleOptionChange(option.id, category.id, e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`
                              relative w-5 h-5 rounded border-2 transition-colors duration-200
                              ${isGranted }
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-gray-300'
                              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}>
                              {isGranted && ()
                                <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </label>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-gray-900">{option.name}</h4>
                            {option.required && ()
                              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                Required
                              </span>
                            )}
                            {option.sensitive && ()
                              <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                Sensitive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          {option.purposes && option.purposes.length > 0 && ()
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Used for:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {option.purposes.map(purpose => ()
                                  <span key={purpose} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                    {purpose}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {option.retentionPeriod && ()
                            <p className="text-xs text-gray-500 mt-1">
                              Data retained for: {option.retentionPeriod}
                            </p>
                          )}
                          {option.legalBasis && ()
                            <p className="text-xs text-gray-500 mt-1">
                              Legal basis: {option.legalBasis}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Action Buttons */}
      {!readOnly && ()
        <div className="mt-8 flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-500">
            {hasChanges && ()
              <span className="text-orange-600">You have unsaved changes</span>
            )}
          </div>
          <div className="flex space-x-3">
            {onCancel && ()
              <button
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? ()
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></div>
                  Saving...
                </>
              ) : ()
                'Save Preferences'
              )}
            </button>
          </div>
        </div>
      )}
      {/* Footer Information */}
      <div className="mt-6 pt-4 border-t text-sm text-gray-500">
        <p>
          Your privacy choices are important to us. For more information about how we handle your data, 
          please review our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </p>
        <p className="mt-2">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};