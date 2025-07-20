/**
 * Extension Search Filter - Epic 8.4 Story 8.4.5
 * Search and filter controls for extension manager
 */
import React from 'react';
export interface FilterOptions {
    status: 'all' | 'enabled' | 'disabled';
    type: 'all' | 'node' | 'ui' | 'transform' | 'storage';
    sortBy: 'name' | 'version' | 'lastUpdated' | 'size';
}
export interface ExtensionSearchFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filterOptions: FilterOptions;
    onFilterChange: (options: FilterOptions) => void;
    viewMode: 'installed' | 'marketplace';
}
export declare const ExtensionSearchFilter: React.FC<ExtensionSearchFilterProps>;
export default ExtensionSearchFilter;
//# sourceMappingURL=ExtensionSearchFilter.d.ts.map