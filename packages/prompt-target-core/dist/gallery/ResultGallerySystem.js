/**
 * Comprehensive result gallery system for managing generated images
 */
export class ResultGallerySystem {
    constructor() {
        this.items = new Map();
        this.collections = new Map();
        this.exports = new Map();
        this.maxItems = 10000;
        this.maxCollections = 100;
        this.initializeDefaultCollections();
    }
    /**
     * Add a result to the gallery
     */
    async addResult(result, title) {
        if (!result.images || result.images.length === 0) {
            throw new Error('No images in result to add to gallery');
        }
        const galleryItems = [];
        for (let i = 0; i < result.images.length; i++) {
            const image = result.images[i];
            const itemId = this.generateItemId();
            const galleryItem = {
                id: itemId,
                title: title || `Generated Image ${i + 1}`,
                image,
                originalGraph: result.prompt.metadata.originalGraphId
                    ? await this.getGraphById(result.prompt.metadata.originalGraphId)
                    : this.createEmptyGraph(),
                platform: result.platform,
                prompt: result.prompt.content,
                parameters: result.prompt.parameters,
                metadata: {
                    created: new Date(),
                    modified: new Date(),
                    generationTime: image.generationTime,
                    cost: this.estimateCost(result.platform, image),
                    quality: result.metadata.quality,
                    downloads: 0,
                    views: 0,
                    shares: 0,
                    sourceRequestId: result.id,
                },
                tags: this.extractTags(result.prompt.content),
                isFavorite: false,
                collections: ['recent'],
            };
            // Check storage limits
            if (this.items.size >= this.maxItems) {
                await this.cleanOldItems();
            }
            this.items.set(itemId, galleryItem);
            galleryItems.push(itemId);
            // Update collection counts
            this.updateCollectionCounts(['recent']);
        }
        return galleryItems[0]; // Return first item ID
    }
    /**
     * Get gallery item by ID
     */
    getItem(itemId) {
        const item = this.items.get(itemId);
        if (item) {
            // Increment view count
            item.metadata.views++;
            item.metadata.modified = new Date();
        }
        return item || null;
    }
    /**
     * Update gallery item
     */
    updateItem(itemId, updates) {
        const item = this.items.get(itemId);
        if (!item)
            return false;
        const oldCollections = [...item.collections];
        Object.assign(item, updates);
        item.metadata.modified = new Date();
        // Update collection counts if collections changed
        if (updates.collections && JSON.stringify(oldCollections) !== JSON.stringify(updates.collections)) {
            this.updateCollectionCounts(oldCollections, -1);
            this.updateCollectionCounts(updates.collections, 1);
        }
        return true;
    }
    /**
     * Delete gallery item
     */
    deleteItem(itemId) {
        const item = this.items.get(itemId);
        if (!item)
            return false;
        // Update collection counts
        this.updateCollectionCounts(item.collections, -1);
        this.items.delete(itemId);
        return true;
    }
    /**
     * Search and filter gallery items
     */
    searchItems(filter = {}) {
        let items = Array.from(this.items.values());
        // Apply filters
        if (filter.platforms?.length) {
            items = items.filter(item => filter.platforms.includes(item.platform));
        }
        if (filter.tags?.length) {
            items = items.filter(item => filter.tags.some(tag => item.tags.includes(tag)));
        }
        if (filter.collections?.length) {
            items = items.filter(item => filter.collections.some(collection => item.collections.includes(collection)));
        }
        if (filter.dateRange) {
            items = items.filter(item => item.metadata.created >= filter.dateRange.start && item.metadata.created <= filter.dateRange.end);
        }
        if (filter.rating) {
            items = items.filter(item => item.rating !== undefined && item.rating >= filter.rating.min && item.rating <= filter.rating.max);
        }
        if (filter.favorites === true) {
            items = items.filter(item => item.isFavorite);
        }
        if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            items = items.filter(item => item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.prompt.toLowerCase().includes(query) ||
                item.tags.some(tag => tag.toLowerCase().includes(query)));
        }
        // Sort items
        const sortBy = filter.sortBy || 'created';
        const sortOrder = filter.sortOrder || 'desc';
        items.sort((a, b) => {
            let aVal;
            let bVal;
            switch (sortBy) {
                case 'created':
                    aVal = a.metadata.created.getTime();
                    bVal = b.metadata.created.getTime();
                    break;
                case 'modified':
                    aVal = a.metadata.modified.getTime();
                    bVal = b.metadata.modified.getTime();
                    break;
                case 'rating':
                    aVal = a.rating || 0;
                    bVal = b.rating || 0;
                    break;
                case 'views':
                    aVal = a.metadata.views;
                    bVal = b.metadata.views;
                    break;
                case 'quality':
                    aVal = a.metadata.quality || 0;
                    bVal = b.metadata.quality || 0;
                    break;
                default:
                    aVal = a.metadata.created.getTime();
                    bVal = b.metadata.created.getTime();
            }
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        // Apply pagination
        if (filter.offset || filter.limit) {
            const start = filter.offset || 0;
            const end = filter.limit ? start + filter.limit : undefined;
            items = items.slice(start, end);
        }
        return items;
    }
    /**
     * Create a new collection
     */
    createCollection(name, description, color, isPublic = false) {
        if (this.collections.size >= this.maxCollections) {
            throw new Error('Maximum number of collections reached');
        }
        const collectionId = this.generateCollectionId();
        const collection = {
            id: collectionId,
            name,
            description,
            color,
            itemCount: 0,
            created: new Date(),
            modified: new Date(),
            isPublic,
            tags: [],
        };
        this.collections.set(collectionId, collection);
        return collectionId;
    }
    /**
     * Get collection by ID
     */
    getCollection(collectionId) {
        return this.collections.get(collectionId) || null;
    }
    /**
     * Get all collections
     */
    getCollections() {
        return Array.from(this.collections.values());
    }
    /**
     * Update collection
     */
    updateCollection(collectionId, updates) {
        const collection = this.collections.get(collectionId);
        if (!collection)
            return false;
        Object.assign(collection, updates);
        collection.modified = new Date();
        return true;
    }
    /**
     * Delete collection
     */
    deleteCollection(collectionId) {
        // Cannot delete default collections
        if (['recent', 'favorites', 'top-rated'].includes(collectionId)) {
            return false;
        }
        // Remove collection from all items
        for (const item of this.items.values()) {
            const index = item.collections.indexOf(collectionId);
            if (index >= 0) {
                item.collections.splice(index, 1);
            }
        }
        this.collections.delete(collectionId);
        return true;
    }
    /**
     * Add items to collection
     */
    addToCollection(itemIds, collectionId) {
        let added = 0;
        for (const itemId of itemIds) {
            const item = this.items.get(itemId);
            if (item && !item.collections.includes(collectionId)) {
                item.collections.push(collectionId);
                item.metadata.modified = new Date();
                added++;
            }
        }
        if (added > 0) {
            this.updateCollectionCounts([collectionId], added);
        }
        return added;
    }
    /**
     * Remove items from collection
     */
    removeFromCollection(itemIds, collectionId) {
        let removed = 0;
        for (const itemId of itemIds) {
            const item = this.items.get(itemId);
            if (item) {
                const index = item.collections.indexOf(collectionId);
                if (index >= 0) {
                    item.collections.splice(index, 1);
                    item.metadata.modified = new Date();
                    removed++;
                }
            }
        }
        if (removed > 0) {
            this.updateCollectionCounts([collectionId], -removed);
        }
        return removed;
    }
    /**
     * Get gallery statistics
     */
    getStats() {
        const items = Array.from(this.items.values());
        // Platform breakdown
        const platformBreakdown = {};
        items.forEach(item => {
            platformBreakdown[item.platform] = (platformBreakdown[item.platform] || 0) + 1;
        });
        // Average rating
        const ratedItems = items.filter(item => item.rating !== undefined);
        const averageRating = ratedItems.length > 0 ? ratedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedItems.length : 0;
        // Top tags
        const tagCounts = {};
        items.forEach(item => {
            item.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        const topTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
        // Recent activity (simplified)
        const recentActivity = items
            .sort((a, b) => b.metadata.modified.getTime() - a.metadata.modified.getTime())
            .slice(0, 10)
            .map(item => ({
            type: 'created',
            itemId: item.id,
            timestamp: item.metadata.created,
        }));
        return {
            totalItems: items.length,
            totalCollections: this.collections.size,
            platformBreakdown,
            averageRating,
            totalGenerated: items.length,
            totalCost: items.reduce((sum, item) => sum + (item.metadata.cost || 0), 0),
            topTags,
            recentActivity,
        };
    }
    /**
     * Export gallery data
     */
    async exportGallery(itemIds, options) {
        const exportId = this.generateExportId();
        const exportResult = {
            id: exportId,
            status: 'pending',
            format: options.format,
            itemCount: itemIds.length,
            created: new Date(),
        };
        this.exports.set(exportId, exportResult);
        // Start export process (async)
        this.processExport(exportId, itemIds, options);
        return exportId;
    }
    /**
     * Get export result
     */
    getExportResult(exportId) {
        return this.exports.get(exportId) || null;
    }
    /**
     * Initialize default collections
     */
    initializeDefaultCollections() {
        this.collections.set('recent', {
            id: 'recent',
            name: 'Recent',
            description: 'Recently generated images',
            color: '#3b82f6',
            itemCount: 0,
            created: new Date(),
            modified: new Date(),
            isPublic: false,
            tags: [],
        });
        this.collections.set('favorites', {
            id: 'favorites',
            name: 'Favorites',
            description: 'Your favorite images',
            color: '#ef4444',
            itemCount: 0,
            created: new Date(),
            modified: new Date(),
            isPublic: false,
            tags: [],
        });
        this.collections.set('top-rated', {
            id: 'top-rated',
            name: 'Top Rated',
            description: 'Highest rated images',
            color: '#f59e0b',
            itemCount: 0,
            created: new Date(),
            modified: new Date(),
            isPublic: false,
            tags: [],
        });
    }
    /**
     * Update collection item counts
     */
    updateCollectionCounts(collectionIds, delta = 1) {
        for (const collectionId of collectionIds) {
            const collection = this.collections.get(collectionId);
            if (collection) {
                collection.itemCount = Math.max(0, collection.itemCount + delta);
                collection.modified = new Date();
            }
        }
    }
    /**
     * Extract tags from prompt content
     */
    extractTags(content) {
        const tags = [];
        // Extract style-related keywords
        const styleKeywords = [
            'photorealistic',
            'artistic',
            'abstract',
            'minimalist',
            'vintage',
            'modern',
            'cyberpunk',
            'fantasy',
            'sci-fi',
        ];
        const contentLower = content.toLowerCase();
        styleKeywords.forEach(keyword => {
            if (contentLower.includes(keyword)) {
                tags.push(keyword);
            }
        });
        // Extract subject matter
        if (contentLower.includes('person') || contentLower.includes('human')) {
            tags.push('portrait');
        }
        if (contentLower.includes('landscape') || contentLower.includes('scenery')) {
            tags.push('landscape');
        }
        if (contentLower.includes('animal')) {
            tags.push('animal');
        }
        if (contentLower.includes('building') || contentLower.includes('architecture')) {
            tags.push('architecture');
        }
        return tags;
    }
    /**
     * Estimate generation cost
     */
    estimateCost(platform, image) {
        // Simplified cost estimation
        const baseCosts = {
            'openai-dalle': 0.02,
            midjourney: 0.01,
            'stable-diffusion': 0.005,
            'openai-gpt': 0,
            claude: 0,
            custom: 0,
        };
        let cost = baseCosts[platform] || 0;
        // Adjust for resolution
        if (image.width * image.height > 1024 * 1024) {
            cost *= 2; // HD pricing
        }
        return cost;
    }
    /**
     * Clean old items when approaching storage limit
     */
    async cleanOldItems() {
        const items = Array.from(this.items.values());
        // Sort by creation date (oldest first)
        items.sort((a, b) => a.metadata.created.getTime() - b.metadata.created.getTime());
        // Remove oldest 10% of items
        const toRemove = Math.floor(items.length * 0.1);
        for (let i = 0; i < toRemove; i++) {
            this.deleteItem(items[i].id);
        }
    }
    /**
     * Process export (mock implementation)
     */
    async processExport(exportId, itemIds, options) {
        const exportResult = this.exports.get(exportId);
        if (!exportResult)
            return;
        exportResult.status = 'processing';
        try {
            // Simulate export processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            exportResult.status = 'completed';
            exportResult.url = `https://example.com/exports/${exportId}.${options.format}`;
            exportResult.size = itemIds.length * 1024 * 1024; // 1MB per item
            exportResult.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        }
        catch (error) {
            exportResult.status = 'failed';
            exportResult.error = error instanceof Error ? error.message : 'Export failed';
        }
    }
    /**
     * Get graph by ID (mock implementation)
     */
    async getGraphById(graphId) {
        // In real implementation, this would fetch from storage
        return this.createEmptyGraph();
    }
    /**
     * Create empty graph
     */
    createEmptyGraph() {
        return {
            id: 'empty',
            nodes: [],
            edges: [],
            metadata: {
                created: new Date(),
                modified: new Date(),
                version: '1.0.0',
            },
            version: '1.0.0',
        };
    }
    /**
     * Generate unique item ID
     */
    generateItemId() {
        return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate unique collection ID
     */
    generateCollectionId() {
        return `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate unique export ID
     */
    generateExportId() {
        return `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
/**
 * Global result gallery system instance
 */
export const resultGallerySystem = new ResultGallerySystem();
