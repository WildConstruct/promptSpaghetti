// packages/core/external-data/DataSourceManager.ts
// Epic 8.8 Task 1: External Data Integration Architecture
import { EventEmitter } from 'events';
// Main data source manager
export class DataSourceManager extends EventEmitter {
    static instance;
    dataSources = new Map();
    cache = new Map();
    rateLimiters = new Map();
    healthStatus = new Map();
    static getInstance() {
        if (!DataSourceManager.instance) {
            DataSourceManager.instance = new DataSourceManager();
            return DataSourceManager.instance;
            constructor();
            {
                super();
                this.initializeDefaultSources();
                this.startHealthChecks();
                this.startCacheCleanup();
                /**
                 * Initialize default historical data sources
                 */
            }
            /**
             * Initialize default historical data sources
             */
        }
        /**
         * Initialize default historical data sources
         */
    }
    /**
     * Initialize default historical data sources
     */
    initializeDefaultSources() {
        // Getty Research Institute
        this.registerDataSource({});
        id: 'getty-research',
            name;
        'Getty Research Institute',
            type;
        'api',
            enabled;
        true,
            endpoint;
        'https://data.getty.edu/vocab/api',
            authentication;
        {
            type: 'none',
                credentials;
            { }
        }
        caching: {
            enabled: true,
                ttl;
            3600, // 1 hour,
                strategy;
            'hybrid',
                maxSize;
            50; // 50MB,
        }
        transforms: [,
            {
                id: 'getty-normalize',
                name: 'Getty Data Normalizer',
                type: 'normalize',
                config: {},
                dateFormat: 'iso',
                textFields: ['preferred_label', 'description'],
                imageFields: ['thumbnail', 'image_url'],
            },
            enabled, true],
            rateLimit;
        {
            requests: 100,
                window;
            60,
                burst;
            10,
            ;
        }
        reliability: {
            timeout: 10000,
                retries;
            3,
                backoff;
            'exponential',
                healthCheck;
            'https://data.getty.edu/vocab/api/health',
            ;
        }
        metadata: {
            description: 'Getty Research Institute Art & Architecture Thesaurus',
                category;
            'cultural',
                tags;
            ['art', 'architecture', 'historical', 'authoritative'],
                version;
            '1.0',
            ;
        }
        ;
        // Metropolitan Museum of Art
        this.registerDataSource({});
        id: 'met-museum',
            name;
        'Metropolitan Museum API',
            type;
        'api',
            enabled;
        true,
            endpoint;
        'https://collectionapi.metmuseum.org/public/collection/v1',
            authentication;
        {
            type: 'none',
                credentials;
            { }
        }
        caching: {
            enabled: true,
                ttl;
            7200, // 2 hours,
                strategy;
            'hybrid',
                maxSize;
            100; // 100MB,
        }
        transforms: [,
            {
                id: 'met-mapper',
                name: 'Met Data Mapper',
                type: 'map',
                config: {},
                mapping: {},
                'title': 'name',
                'artistDisplayName': 'artist',
                'objectDate': 'era',
                'culture': 'region',
                'medium': 'materials',
                'primaryImageSmall': 'image',
            },
            enabled, true],
            rateLimit;
        {
            requests: 80,
                window;
            60,
            ;
        }
        reliability: {
            timeout: 15000,
                retries;
            2,
                backoff;
            'linear',
            ;
        }
        metadata: {
            description: 'Metropolitan Museum of Art Collection Database',
                category;
            'cultural',
                tags;
            ['museum', 'art', 'artifacts', 'historical'],
                version;
            '1.0',
            ;
        }
        ;
        // Medieval clothing database (demo source)
        this.registerDataSource({});
        id: 'medieval-clothing',
            name;
        'Medieval Clothing Database',
            type;
        'static',
            enabled;
        true,
            caching;
        {
            enabled: true,
                ttl;
            86400, // 24 hours,
                strategy;
            'memory',
                maxSize;
            10; // 10MB,
        }
        transforms: [,
            {
                id: 'medieval-classifier',
                name: 'Medieval Period Classifier',
                type: 'validate',
                config: {},
                eraValidation: {},
                'early-medieval': { start: 500, end: 1000 },
                'high-medieval': { start: 1000, end: 1300 },
                'late-medieval': { start: 1300, end: 1500 }
            },
            enabled, true],
            reliability;
        {
            timeout: 1000,
                retries;
            1,
                backoff;
            'linear',
            ;
        }
        metadata: {
            description: 'Curated medieval clothing and materials database',
                category;
            'historical',
                tags;
            ['medieval', 'clothing', 'materials', 'demo'],
                version;
            '1.0',
            ;
        }
        ;
        /**
         * Register a new data source
         */
        registerDataSource(source, DataSource);
        void {
            this: .dataSources.set(source.id, source),
            // Initialize rate limiter if needed
            if(source) { }, : .rateLimit
        };
        {
            this.rateLimiters.set(source.id, new RateLimiter(source.rateLimit));
            this.emit('sourceRegistered', source);
            /**
            * Query historical data from configured sources
            */
            async;
            queryHistoricalData(query, HistoricalQuery);
            sourceIds ?  : string;
            Promise < QueryResult > {
                const: results, QueryResult = [],
                const: sources = sourceIds,
                Array, : .from(this.dataSources.values()).filter(s => sourceIds.includes(s.id)),
                Array, : .from(this.dataSources.values()).filter(s => s.enabled),
                const: startTime = Date.now(),
                // Execute queries in parallel
                const: queryPromises = sources.map(async (source) => {
                    try {
                        const result = await this.executeQuery(source, query);
                        results.push(result);
                        return result;
                    }
                    catch (error) {
                        const errorResult = {
                            success: false,
                            data: [],
                            metadata: {
                                total: 0,
                                offset: query.offset || 0,
                                limit: query.limit || 50,
                                query,
                                source: source.id,
                                cached: false,
                                executionTime: Date.now() - startTime,
                            },
                            error: error instanceof Error ? error.message : 'Unknown error'
                        };
                        results.push(errorResult);
                        return errorResult;
                    }
                }),
                await, Promise, : .all(queryPromises),
                this: .emit('queryComplete', {}),
                query,
                results,
                totalTime: Date.now() - startTime, };
            ;
            return results;
            /**
             * Execute query against a specific data source
             */
        }
        /**
         * Execute query against a specific data source
         */
    }
    /**
     * Execute query against a specific data source
     */
    async executeQuery(source, query) {
        const cacheKey = this.generateCacheKey(source.id, query);
        const startTime = Date.now();
        // Check cache first
        if (source.caching.enabled) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                return {
                    success: true,
                    data: cached.data,
                    metadata: {
                        total: cached.data.length,
                        offset: query.offset || 0,
                        limit: query.limit || 50,
                        query,
                        source: source.id,
                        cached: true,
                        executionTime: Date.now() - startTime,
                    },
                    // Check rate limiting
                    const: rateLimiter = this.rateLimiters.get(source.id),
                    if(rateLimiter) { }
                } && !rateLimiter.allowRequest();
                {
                    throw new Error(`Rate limit exceeded for source: ${source.id}`);
                }
                // Execute actual query
                let data = [];
                switch (source.type) {
                    case 'api':
                        data = await this.queryAPI(source, query);
                        break;
                    case 'database':
                        data = await this.queryDatabase(source, query);
                        break;
                    case 'file':
                        data = await this.queryFile(source, query);
                        break;
                    case 'static':
                        data = await this.queryStaticData(source, query);
                        break;
                        // Apply transforms
                        data = await this.applyTransforms(data, source.transforms);
                        // Cache results
                        if (source.caching.enabled && data.length > 0) {
                            this.setCache(cacheKey, data, source.caching.ttl);
                            return {
                                success: true,
                                data,
                                metadata: {
                                    total: data.length,
                                    offset: query.offset || 0,
                                    limit: query.limit || 50,
                                    query,
                                    source: source.id,
                                    cached: false,
                                    executionTime: Date.now() - startTime,
                                },
                                /**
                                 * Query API data source
                                 */
                                async queryAPI(source, query) {
                                    if (!source.endpoint) {
                                        throw new Error(`API endpoint not configured for source: ${source.id}`);
                                    }
                                    // Build query parameters based on source
                                    const params = this.buildAPIParams(source, query);
                                    const url = new URL(source.endpoint);
                                    Object.entries(params).forEach(([key, value]) => {
                                        url.searchParams.append(key, value.toString());
                                    });
                                    // Prepare headers
                                    const headers = {
                                        'Content-Type': 'application/json',
                                        'User-Agent': 'Wild-Construct/1.0',
                                        ...source.authentication?.headers
                                    };
                                    // Add authentication
                                    if (source.authentication) {
                                        switch (source.authentication.type) {
                                            case 'api_key':
                                                headers['X-API-Key'] = source.authentication.credentials.api_key;
                                                break;
                                            case 'bearer':
                                                headers['Authorization'] = `Bearer ${source.authentication.credentials.token}`;
                                        }
                                        break;
                                    }
                                },
                                case: 'basic',
                                const: auth = btoa(`${source.authentication.credentials.username}:${source.authentication.credentials.password}`)
                            };
                            headers['Authorization'] = `Basic ${auth}`;
                        }
                        break;
                        const response = await fetch(url.toString(), {
                            method: 'GET',
                            headers,
                            signal: AbortSignal.timeout(source.reliability.timeout),
                        });
                        if (!response.ok) {
                            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                        }
                        const responseData = await response.json();
                        return this.extractDataFromAPIResponse(source, responseData);
                    /**
                     * Query static/demo data
                     */
                }
                /**
                 * Query static/demo data
                 */
            }
            /**
             * Query static/demo data
             */
        }
        /**
         * Query static/demo data
         */
    }
    /**
     * Query static/demo data
     */
    async queryStaticData(source, query) {
        // Demo medieval clothing data
        if (source.id === 'medieval-clothing') {
            return this.getMedievalClothingData(query);
            return [];
            /**
             * Get medieval clothing demo data
             */
        }
        /**
         * Get medieval clothing demo data
         */
    }
    /**
     * Get medieval clothing demo data
     */
    getMedievalClothingData(query) {
        const medievalData = [];
        {
            id: 'medieval-tunic-001',
                name;
            'Noble Tunic',
                category;
            'clothing',
                subcategory;
            'nobility',
                era;
            'high-medieval',
                period;
            {
                start: 1100, end;
                1300;
            }
            region: 'england',
                description;
            'Fine wool tunic with embroidered trim, worn by nobility',
                materials;
            ['wool', 'silk thread', 'gold thread'],
                colors;
            ['deep blue', 'crimson', 'forest green'],
                authenticity;
            0.9,
                source;
            'medieval-fashion-history',
                tags;
            ['noble', 'formal', 'embroidered', 'high-status'];
        }
        {
            id: 'medieval-hood-001',
                name;
            'Peasant Hood',
                category;
            'clothing',
                subcategory;
            'peasant',
                era;
            'high-medieval',
                period;
            {
                start: 1000, end;
                1400;
            }
            region: 'europe',
                description;
            'Simple wool hood for protection from weather',
                materials;
            ['coarse wool', 'hemp cord'],
                colors;
            ['brown', 'grey', 'undyed'],
                authenticity;
            0.95,
                source;
            'archaeological-findings',
                tags;
            ['peasant', 'practical', 'weather-protection', 'common'];
        }
        {
            id: 'medieval-surcoat-001',
                name;
            'Knight Surcoat',
                category;
            'clothing',
                subcategory;
            'military',
                era;
            'high-medieval',
                period;
            {
                start: 1150, end;
                1350;
            }
            region: 'france',
                description;
            'Sleeveless garment worn over armor with heraldic design',
                materials;
            ['linen', 'wool', 'silk'],
                colors;
            ['royal blue', 'gold', 'silver'],
                authenticity;
            0.88,
                source;
            'military-history',
                tags;
            ['knight', 'heraldic', 'armor', 'military', 'ceremonial'];
            ;
            // Filter based on query
            return medievalData.filter(item => { });
            if (query.era && !query.era.includes(item.era))
                return false;
            if (query.region && !query.region.includes(item.region))
                return false;
            if (query.category && item.category !== query.category)
                return false;
            if (query.subcategory && item.subcategory !== query.subcategory)
                return false;
            return true;
        }
        ;
        // Additional helper methods would continue here...
    }
    // Additional helper methods would continue here...
    buildAPIParams(source, query) {
        // Build API-specific parameters
        return {
            q: query.keywords?.join(' '),
            era: Array.isArray(query.era) ? query.era.join(',') : query.era,
            category: query.category,
            limit: query.limit || 50,
            offset: query.offset || 0,
        };
    }
    extractDataFromAPIResponse(source, response) {
        // Extract data based on source format
        if (source.id === 'getty-research') {
            return response.results || [];
            if (source.id === 'met-museum') {
                return response.objects || [];
                return response.data || response.results || [response];
            }
        }
    }
    async applyTransforms(data, transforms) {
        let result = data;
        for (const transform of transforms.filter(t => t.enabled)) {
            switch (transform.type) {
                case 'map':
                    result = this.applyMappingTransform(result, transform.config);
                    break;
                case 'filter':
                    result = this.applyFilterTransform(result, transform.config);
                    break;
                case 'normalize':
                    result = this.applyNormalizationTransform(result, transform.config);
                    break;
                case 'validate':
                    result = this.applyValidationTransform(result, transform.config);
                    break;
                    return result;
            }
        }
    }
    applyMappingTransform(data, config) {
        const mapping = config.mapping;
        return data.map(item => { });
        const mapped = {};
        for (const [oldKey, newKey] of Object.entries(mapping)) {
            if (item[oldKey] !== undefined) {
                mapped[newKey] = item[oldKey];
                return { ...item, ...mapped };
            }
            ;
        }
    }
    applyFilterTransform(data, config) {
        // Apply filtering logic
        return data;
    } // Placeholder
    applyNormalizationTransform(data, config) {
        // Apply normalization logic
        return data;
    } // Placeholder
    applyValidationTransform(data, config) {
        // Apply validation logic
        return data;
        // Cache management methods
    } // Placeholder
    // Cache management methods
    generateCacheKey(sourceId, query) {
        return `${sourceId}:${JSON.stringify(query)}`;
    }
    getFromCache(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl * 1000) {
            this.cache.delete(key);
            return null;
            entry.hits++;
            return entry;
        }
    }
    setCache(key, data, ttl) {
        const size = JSON.stringify(data).length;
        this.cache.set(key, {});
        data,
            timestamp;
        Date.now(),
            ttl,
            hits;
        0,
            size;
    }
    ;
    // Health check and cleanup
    startHealthChecks() {
        setInterval(() => {
            this.performHealthChecks();
        }, 60000);
    } // Every minute
    startCacheCleanup() {
        setInterval(() => {
            this.cleanupCache();
        }, 300000);
    } // Every 5 minutes
    async performHealthChecks() {
        // Perform health checks on all sources
    }
    // Perform health checks on all sources
    cleanupCache() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl * 1000) {
                this.cache.delete(key);
                // Database and file query methods
            }
            // Database and file query methods
        }
        // Database and file query methods
    }
    // Database and file query methods
    async queryDatabase(source, query) {
        // Database implementation would depend on the specific database type
        // For demo purposes, we'll simulate a database query
        if (!source.endpoint) {
            throw new Error(`Database connection string not configured for source: ${source.id}`);
        }
        // Simulate database query delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        // Mock database results based on query
        const mockDatabaseResults = this.generateMockDatabaseResults(query, source);
        return mockDatabaseResults;
    }
    async queryFile(source, query) {
        // File-based data sources (JSON, CSV, XML, etc.)
        if (!source.endpoint) {
            throw new Error(`File path not configured for source: ${source.id}`);
        }
        try {
            // In a real implementation, this would read from actual files
            // For demo purposes, we'll simulate file reading
            const fileExtension = source.endpoint.split('.').pop()?.toLowerCase();
            switch (fileExtension) {
                case 'json':
                    return await this.queryJSONFile(source, query);
                case 'csv':
                    return await this.queryCSVFile(source, query);
                case 'xml':
                    return await this.queryXMLFile(source, query);
                default:
                    throw new Error(`Unsupported file type: ${fileExtension}`);
            }
        }
        catch (error) {
            throw new Error(`Failed to read file from ${source.endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        /**
         * Generate mock database results for demo purposes
         */
    }
    /**
     * Generate mock database results for demo purposes
     */
    generateMockDatabaseResults(query, source) {
        const results = [];
        const itemCount = Math.min(query.limit || 50, 20); // Limit to 20 for demo;
        for (let i = 0; i < itemCount; i++) {
            const item = {
                id: `db-${source.id}-${Date.now()}-${i}`
            };
        }
        name: this.generateMockItemName(query.category, query.era),
            category;
        query.category,
            era;
        Array.isArray(query.era) ? query.era[0] : query.era,
            region;
        query.region || 'unknown',
            description;
        this.generateMockDescription(query.category),
            materials;
        this.generateMockMaterials(query.category),
            authenticity;
        0.7 + Math.random() * 0.3,
            source;
        `${source.id}-database`;
    }
}
timestamp: new Date().toISOString(),
    metadata;
{
    queryHash: this.generateQueryHash(query),
        extractedAt;
    new Date().toISOString(),
    ;
}
;
results.push(item);
return results;
async;
queryJSONFile(source, DataSource, query, HistoricalQuery);
Promise < any > {
    // Simulate file reading delay
    await, new: Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300)),
    // Mock JSON file data
    const: jsonData = [
        {
            id: 'json-medieval-clothing-001',
            name: 'Royal Ceremonial Robe',
            category: 'clothing',
            era: 'high-medieval',
            period: { start: 1200, end: 1350 },
            region: 'england',
            description: 'Elaborate ceremonial robe worn by English royalty',
            materials: ['silk', 'ermine', 'gold thread', 'precious stones'],
            colors: ['deep purple', 'gold', 'silver'],
            authenticity: 0.95,
            source: 'british-museum-archives',
            tags: ['royal', 'ceremonial', 'luxury', 'court']
        },
        {
            id: 'json-medieval-tools-002',
            name: 'Blacksmith Hammer',
            category: 'technology',
            era: 'high-medieval',
            period: { start: 1100, end: 1400 },
            region: 'germany',
            description: 'Heavy iron hammer used by medieval blacksmiths',
            materials: ['iron', 'oak wood', 'leather wrapping'],
            weight: '2.5kg',
            authenticity: 0.88,
            source: 'german-crafts-museum',
            tags: ['tools', 'blacksmithing', 'crafts', 'iron-working']
        }
    ],
    // Filter data based on query
    return: jsonData.filter(item => { }),
    if(query) { }, : .category && item.category !== query.category, return: false,
    if(query) { }, : .era && item.era !== query.era, return: false,
    if(query) { }, : .region && item.region !== query.region, return: false,
    return: true
};
slice(0, query.limit || 50);
async;
queryCSVFile(source, DataSource, query, HistoricalQuery);
Promise < any > {
    // Simulate file reading delay
    await, new: Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400)),
    // Mock CSV data converted to objects
    const: csvData = [
        {
            id: 'csv-architecture-001',
            name: 'Gothic Cathedral Spire',
            category: 'architecture',
            era: 'high-medieval',
            region: 'france',
            height: '95m',
            construction_start: '1194',
            construction_end: '1250',
            materials: 'limestone,oak,iron',
            style: 'gothic',
            authenticity: 0.97,
            source: 'french-heritage-database',
        },
        {
            id: 'csv-literature-002',
            name: 'Illuminated Manuscript',
            category: 'literature',
            era: 'high-medieval',
            region: 'ireland',
            pages: '340',
            language: 'latin',
            scribe: 'Brother Marcus',
            materials: 'vellum,gold leaf,mineral pigments',
            authenticity: 0.92,
            source: 'trinity-college-library'
        }],
    // Parse materials field (CSV format)
    const: parsedData = csvData.map(item => ({}), ...item, materials, item.materials ? item.materials.split(',').map(m => m.trim()) : [])
};
;
// Filter and return
return parsedData.filter(item => { });
if (query.category && item.category !== query.category)
    return false;
if (query.era && item.era !== query.era)
    return false;
if (query.region && item.region !== query.region)
    return false;
return true;
slice(0, query.limit || 50);
async;
queryXMLFile(source, DataSource, query, HistoricalQuery);
Promise < any > {
    // Simulate file reading and XML parsing delay
    await, new: Promise(resolve => setTimeout(resolve, 400 + Math.random() * 500)),
    // Mock XML data converted to objects
    const: xmlData = [
        {
            id: 'xml-artwork-001',
            name: 'Stained Glass Window',
            category: 'art',
            era: 'high-medieval',
            region: 'england',
            description: 'Religious stained glass depicting biblical scenes',
            dimensions: { width: '3.2m', height: '8.5m' },
            materials: ['colored glass', 'lead came', 'iron framework'],
            themes: ['religious', 'biblical', 'martyrs'],
            location: 'Canterbury Cathedral',
            commission_date: '1180',
            authenticity: 0.94,
            source: 'cathedral-archives-xml'
        }],
    // Filter and return
    return: xmlData.filter(item => { }),
    if(query) { }, : .category && item.category !== query.category, return: false,
    if(query) { }, : .era && item.era !== query.era, return: false,
    if(query) { }, : .region && item.region !== query.region, return: false,
    return: true
};
slice(0, query.limit || 50);
generateMockItemName(category, string, era, string | string);
string;
{
    const prefixes = {
        'clothing': ['Noble', 'Peasant', 'Royal', 'Merchant', 'Ceremonial'],
        'architecture': ['Gothic', 'Romanesque', 'Stone', 'Wooden', 'Fortified'],
        'art': ['Illuminated', 'Religious', 'Secular', 'Decorative', 'Symbolic'],
        'technology': ['Iron', 'Bronze', 'Wooden', 'Leather', 'Crafted'],
    };
    const suffixes = {
        'clothing': ['Tunic', 'Robe', 'Cloak', 'Hood', 'Shoes'],
        'architecture': ['Cathedral', 'Castle', 'Bridge', 'Tower', 'Hall'],
        'art': ['Manuscript', 'Sculpture', 'Painting', 'Tapestry', 'Jewelry'],
        'technology': ['Tool', 'Weapon', 'Instrument', 'Machine', 'Device'],
    };
    const categoryPrefixes = prefixes[category] || ['Medieval'];
    const categorySuffixes = suffixes[category] || ['Item'];
    const prefix = categoryPrefixes[Math.floor(Math.random() * categoryPrefixes.length)];
    const suffix = categorySuffixes[Math.floor(Math.random() * categorySuffixes.length)];
    return `${prefix} ${suffix}`;
}
generateMockDescription(category, string);
string;
{
    const descriptions = {
        'clothing': 'Traditional garment worn during medieval period with authentic materials and construction techniques.',
        'architecture': 'Historical building structure representing typical medieval architectural styles and methods.',
        'art': 'Artistic work from medieval period showcasing period-appropriate themes and artistic techniques.',
        'technology': 'Tool or device used during medieval times demonstrating period craftsmanship and functionality.',
    };
    return descriptions[category] || 'Historical item from medieval period.';
    generateMockMaterials(category, string);
    string;
    {
        const materials = {
            'clothing': ['wool', 'linen', 'silk', 'cotton', 'leather', 'fur'],
            'architecture': ['stone', 'wood', 'iron', 'lead', 'lime mortar', 'clay'],
            'art': ['pigments', 'gold leaf', 'vellum', 'ink', 'wood panel', 'canvas'],
            'technology': ['iron', 'steel', 'bronze', 'wood', 'leather', 'bone'],
        };
        const categoryMaterials = materials[category] || ['unknown'];
        const count = Math.floor(Math.random() * 3) + 1;
        return categoryMaterials
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
        generateQueryHash(query, HistoricalQuery);
        string;
        {
            const queryString = JSON.stringify({});
            era: query.era,
                category;
            query.category,
                region;
            query.region,
                keywords;
            query.keywords,
            ;
        }
        ;
        // Simple hash function for demo purposes
        let hash = 0;
        for (let i = 0; i < queryString.length; i++) {
            const char = queryString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
            return Math.abs(hash).toString(36);
            // Rate limiter implementation
            class RateLimiter {
                requests = [];
                config;
                constructor(config) {
                    this.config = config;
                    allowRequest();
                    boolean;
                    {
                        const now = Date.now();
                        const windowStart = now - (this.config.window * 1000);
                        // Remove old requests
                        this.requests = this.requests.filter(time => time > windowStart);
                        // Check limit
                        if (this.requests.length >= this.config.requests) {
                            return false;
                            // Add current request
                            this.requests.push(now);
                            return true;
                            // Export singleton
                            export const dataSourceManager = DataSourceManager.getInstance();
                        }
                    }
                }
            }
        }
    }
}
