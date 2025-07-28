import React from 'react';
/**
 * Node category metadata
 */
export interface NodeCategory {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{
        size?: number;
        color?: string;
    }>;
    color: string;
    order: number;
    collapsible: boolean;
    defaultExpanded: boolean;
    metadata?: {
        keywords?: string;
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        usage?: 'common' | 'specialized' | 'experimental';
    };
}
export declare const SPECIAL_CATEGORIES: {
    readonly FAVORITES: "favorites";
    readonly SEARCH_RESULTS: "search-results";
    readonly ALL: "all";
};
/**
 * Core node categories definition
 */
export declare const NODE_CATEGORIES: Record<string, NodeCategory>, SPECIAL_CATEGORIES: any, FAVORITES: any, : any, : any, : any, : any, FiStar: any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, : any, SPECIAL_CATEGORIES: any, SEARCH_RESULTS: any, : any, : any, : any, : any, FiSearch: any, : any, : any, : any;
//# sourceMappingURL=NodeCategory.d.ts.map