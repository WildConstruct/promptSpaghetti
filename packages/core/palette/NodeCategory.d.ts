import React from 'react';
/**
 * Node category metadata
 */

}
}
export interface NodeCategory { id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ }
        size?: number;
        color?: string;
}
}
    }>;
    color: string;
    order: number;
    collapsible: boolean;
    defaultExpanded: boolean;
    metadata?: {
        keywords?: string[];
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
        usage?: 'common' | 'specialized' | 'experimental'
  };
/**
 * Special category IDs for system categories
 */
export declare const SPECIAL_CATEGORIES: {
    readonly FAVORITES: "favorites";
    readonly SEARCH_RESULTS: "search-results";
    readonly ALL: "all"
  };
/**
 * Core node categories definition
 */
export declare const NODE_CATEGORIES: Record<string, NodeCategory>;
/**
 * Node to category mapping
 */
export declare const NODE_CATEGORY_MAPPING: Record<string, string[]>;
/**
 * Get categories for a node type
 */
export declare function getNodeCategories(nodeId: string): string[];
/**
 * Get category metadata by ID
 */
export declare function getCategoryById(categoryId: string): NodeCategory | undefined;
/**
 * Get all categories sorted by order
 */
export declare function getAllCategories(): NodeCategory[];
/**
 * Get categories filtered by difficulty level
 */
export declare function getCategoriesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): NodeCategory[];
/**
 * Search categories by keyword
 */
export declare function searchCategories(query: string): NodeCategory[];
/**
 * Get category color with opacity
 */
export declare function getCategoryColor(categoryId: string, opacity?: number): string;
/**
 * Category filter options
 */

}
}
export interface CategoryFilterOptions {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    usage?: 'common' | 'specialized' | 'experimental';
    expanded?: boolean;
/**
 * Filter categories by options
 */
export declare function filterCategories(options: CategoryFilterOptions): NodeCategory[];
//# sourceMappingURL=NodeCategory.d.ts.map
}
}