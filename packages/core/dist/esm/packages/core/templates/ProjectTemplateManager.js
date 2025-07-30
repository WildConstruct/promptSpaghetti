/**
 * Epic 9.2.6 - Project Templates Implementation
 * Manages project templates with versioning, categorization, and sharing capabilities
 */
export class ProjectTemplateManager {
    apiClient;
    templates = new Map();
    categories = new Map();
    analytics = new Map();
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.initializeDefaultCategories();
        // Template Management
        async;
        createTemplate(template, (Omit));
        Promise < ProjectTemplate > {
            const: newTemplate, ProjectTemplate = {
                ...template,
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                usage_count: 0,
                rating: 0,
            },
            // Validate template structure
            this: .validateTemplate(newTemplate),
            // Store template
            this: .templates.set(newTemplate.id, newTemplate),
            // Send to server
            await, this: .apiClient.post('/api/templates', newTemplate),
            return: newTemplate,
            async updateTemplate(id, updates) {
                const template = this.templates.get(id);
                if (!template) {
                    throw new Error(`Template ${id} not found`);
                }
                const updatedTemplate = {
                    ...template,
                    ...updates,
                    updated_at: new Date().toISOString(),
                };
                this.validateTemplate(updatedTemplate);
                this.templates.set(id, updatedTemplate);
                await this.apiClient.put(`/api/templates/${id}`, updatedTemplate);
            },
            return: updatedTemplate,
            async deleteTemplate(id) {
                const template = this.templates.get(id);
                if (!template) {
                    throw new Error(`Template ${id} not found`);
                }
                this.templates.delete(id);
                this.analytics.delete(id);
                await this.apiClient.delete(`/api/templates/${id}`);
            }
            // Template Discovery
            ,
            query: string,
            category: string,
            tags: string,
            complexity: string,
            author: string,
            min_rating: number,
            sort_by: 'popularity' | 'rating' | 'newest' | 'name',
            limit: number,
            offset: number };
        Promise < { templates: ProjectTemplate, total: number } > {
            let, filteredTemplates = Array.from(this.templates.values()),
            // Apply filters
            if(criteria) { }, : .query
        };
        {
            const query = criteria.query.toLowerCase();
            filteredTemplates = filteredTemplates.filter(t => );
            t.name.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query) ||
                t.tags.some(tag => tag.toLowerCase().includes(query));
            ;
            if (criteria.category) {
                filteredTemplates = filteredTemplates.filter(t => t.category === criteria.category);
                if (criteria.tags?.length) {
                    filteredTemplates = filteredTemplates.filter(t => );
                    criteria.tags.some(tag => t.tags.includes(tag));
                    ;
                    if (criteria.complexity) {
                        filteredTemplates = filteredTemplates.filter(t => t.complexity_level === criteria.complexity);
                        if (criteria.author) {
                            filteredTemplates = filteredTemplates.filter(t => t.author.id === criteria.author);
                            if (criteria.min_rating) {
                                filteredTemplates = filteredTemplates.filter(t => t.rating >= criteria.min_rating);
                                // Sort results
                                this.sortTemplates(filteredTemplates, criteria.sort_by || 'popularity');
                                // Apply pagination
                                const offset = criteria.offset || 0;
                                const limit = criteria.limit || 20;
                                const paginatedTemplates = filteredTemplates.slice(offset, offset + limit);
                                return {
                                    templates: paginatedTemplates,
                                    total: filteredTemplates.length,
                                };
                                async;
                                getFeaturedTemplates();
                                Promise < ProjectTemplate > {
                                    return: Array.from(this.templates.values())
                                        .filter(t => t.is_featured && t.is_public)
                                        .sort((a, b) => b.rating - a.rating)
                                        .slice(0, 10),
                                    async getRecommendedTemplates(userId) {
                                        // Simple recommendation based on user's previous template usage
                                        const userAnalytics = await this.getUserTemplateAnalytics(userId);
                                        const userCategories = userAnalytics.most_used_categories || [];
                                        return Array.from(this.templates.values())
                                            .filter(t => t.is_public && userCategories.includes(t.category))
                                            .sort((a, b) => b.rating - a.rating)
                                            .slice(0, 5);
                                        // Template Usage
                                        async;
                                        instantiateTemplate(templateId, string, customizations, (Record));
                                        Promise < any > {
                                            const: template = this.templates.get(templateId),
                                            if(, template) {
                                                throw new Error(`Template ${templateId} not found`);
                                            }
                                            // Clone the template graph data
                                            ,
                                            // Clone the template graph data
                                            let, graphData = JSON.parse(JSON.stringify(template.graph_data)),
                                            // Apply customizations
                                            graphData = this.applyCustomizations(graphData, template, customizations),
                                            // Record usage
                                            await: this.recordTemplateUsage(templateId),
                                            return: graphData,
                                            async previewTemplate(templateId, customizations) {
                                                const template = this.templates.get(templateId);
                                                if (!template) {
                                                    throw new Error(`Template ${templateId} not found`);
                                                }
                                                // Generate preview without recording usage
                                                const graphData = JSON.parse(JSON.stringify(template.graph_data));
                                                return this.applyCustomizations(graphData, template, customizations);
                                                // Template Import/Export
                                                async;
                                                exportTemplate(templateId, string, format, 'json' | 'yaml' | 'bundle');
                                                Promise < string > {
                                                    const: template = this.templates.get(templateId),
                                                    if(, template) {
                                                        throw new Error(`Template ${templateId} not found`);
                                                    },
                                                    switch(format) {
                                                    },
                                                    case: 'json',
                                                    return: JSON.stringify(template, null, 2),
                                                    case: 'yaml',
                                                    // Convert to YAML format
                                                    return: this.convertToYaml(template),
                                                    case: 'bundle',
                                                    // Create a complete bundle with dependencies
                                                    return: this.createTemplateBundle(template),
                                                    default: ,
                                                    throw: new Error(`Unsupported export format: ${format}`)
                                                };
                                                async;
                                                importTemplate(templateData, string, format, 'json' | 'yaml' | 'bundle');
                                                Promise < ProjectTemplate > {
                                                    let, template: ProjectTemplate,
                                                    switch(format) {
                                                    },
                                                    case: 'json',
                                                    template = JSON.parse(templateData),
                                                    break: ,
                                                    case: 'yaml',
                                                    template = this.parseYamlTemplate(templateData),
                                                    break: ,
                                                    case: 'bundle',
                                                    template = this.extractFromBundle(templateData),
                                                    break: ,
                                                    default: ,
                                                    throw: new Error(`Unsupported import format: ${format}`)
                                                };
                                                // Validate and store
                                                this.validateTemplate(template);
                                                template.id = crypto.randomUUID(); // Generate new ID
                                                template.created_at = new Date().toISOString();
                                                template.updated_at = new Date().toISOString();
                                                this.templates.set(template.id, template);
                                                await this.apiClient.post('/api/templates', template);
                                                return template;
                                                // Analytics and Ratings
                                                async;
                                                rateTemplate(templateId, string, userId, string, rating, number, review ?  : string);
                                                Promise < void  > {
                                                    if(rating, , ) { }
                                                } || rating > 5;
                                                {
                                                    throw new Error('Rating must be between 1 and 5');
                                                    await this.apiClient.post(`/api/templates/${templateId}/ratings`, {});
                                                }
                                            },
                                            user_id: userId,
                                            rating,
                                            review
                                        };
                                        ;
                                        // Update local cache
                                        await this.refreshTemplateRating(templateId);
                                        async;
                                        getTemplateAnalytics(templateId, string);
                                        Promise < TemplateUsageAnalytics > {
                                            const: analytics = this.analytics.get(templateId),
                                            if(analytics) {
                                                return analytics;
                                                // Fetch from server
                                                const response = await this.apiClient.get(`/api/templates/${templateId}/analytics`);
                                            },
                                            const: fetchedAnalytics = response.data,
                                            this: .analytics.set(templateId, fetchedAnalytics),
                                            return: fetchedAnalytics,
                                            // Category Management
                                            async createCategory(category) {
                                                const newCategory = {
                                                    ...category,
                                                    id: crypto.randomUUID(),
                                                };
                                                this.categories.set(newCategory.id, newCategory);
                                                await this.apiClient.post('/api/template-categories', newCategory);
                                                return newCategory;
                                                getCategories();
                                                TemplateCategory;
                                                {
                                                    return Array.from(this.categories.values());
                                                    getCategoryHierarchy();
                                                    TemplateCategory;
                                                    {
                                                        const categories = Array.from(this.categories.values());
                                                        const rootCategories = categories.filter(c => !c.parent_id);
                                                        // Build hierarchy recursively
                                                        return rootCategories.map(root => this.buildCategoryTree(root, categories));
                                                        // Private helper methods
                                                    }
                                                    // Private helper methods
                                                }
                                                // Private helper methods
                                            }
                                            // Private helper methods
                                            ,
                                            // Private helper methods
                                            validateTemplate(template) {
                                                if (!template.name?.trim()) {
                                                    throw new Error('Template name is required');
                                                    if (!template.graph_data) {
                                                        throw new Error('Template graph data is required');
                                                        if (!template.category) {
                                                            throw new Error('Template category is required');
                                                            // Validate variables
                                                            for (const variable of template.variables) {
                                                                if (!variable.name || !variable.type) {
                                                                    throw new Error(`Invalid variable definition: ${variable.name}`);
                                                                }
                                                                // Validate customization points
                                                                for (const point of template.customization_points) {
                                                                    if (!point.name || !point.type) {
                                                                        throw new Error(`Invalid customization point: ${point.name}`);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            applyCustomizations(graphData, template, customizations) {
                                                // Apply variable substitutions
                                                let dataStr = JSON.stringify(graphData);
                                                for (const variable of template.variables) {
                                                    const value = customizations[variable.id] ?? variable.default_value;
                                                    const placeholder = `{{${variable.name}}}`;
                                                }
                                                dataStr = dataStr.replace(new RegExp(placeholder, 'g'), String(value));
                                                graphData = JSON.parse(dataStr);
                                                // Apply customization points
                                                for (const point of template.customization_points) {
                                                    if (customizations[point.id] !== undefined) {
                                                        this.applyCustomizationPoint(graphData, point, customizations[point.id]);
                                                        return graphData;
                                                    }
                                                }
                                            },
                                            applyCustomizationPoint(graphData, point, value) {
                                                // Apply customization based on type
                                                switch (point.type) {
                                                    case 'node_properties':
                                                        this.updateNodeProperties(graphData, point.target_nodes, point.properties, value);
                                                        break;
                                                    case 'graph_structure':
                                                        this.updateGraphStructure(graphData, point, value);
                                                        break;
                                                    case 'styling':
                                                        this.updateStyling(graphData, point.target_nodes, value);
                                                        break;
                                                    case 'behavior':
                                                        this.updateBehavior(graphData, point.target_nodes, value);
                                                        break;
                                                }
                                            },
                                            updateNodeProperties(graphData, nodeIds, properties, value) {
                                                if (!graphData.nodes)
                                                    return;
                                                graphData.nodes.forEach((node) => {
                                                    if (nodeIds.includes(node.id)) {
                                                        properties.forEach(prop => { });
                                                        node[prop] = value;
                                                    }
                                                });
                                            },
                                            updateGraphStructure(graphData, point, value) {
                                                // Implementation depends on specific graph structure modifications
                                                // This would be customized based on the graph format
                                            }
                                            // Implementation depends on specific graph structure modifications
                                            // This would be customized based on the graph format
                                            ,
                                            // Implementation depends on specific graph structure modifications
                                            // This would be customized based on the graph format
                                            updateStyling(graphData, nodeIds, value) {
                                                if (!graphData.nodes)
                                                    return;
                                                graphData.nodes.forEach((node) => {
                                                    if (nodeIds.includes(node.id)) {
                                                        node.style = { ...node.style, ...value };
                                                    }
                                                });
                                            },
                                            updateBehavior(graphData, nodeIds, value) {
                                                if (!graphData.nodes)
                                                    return;
                                                graphData.nodes.forEach((node) => {
                                                    if (nodeIds.includes(node.id)) {
                                                        node.behavior = { ...node.behavior, ...value };
                                                    }
                                                });
                                            },
                                            sortTemplates(templates, sortBy) {
                                                switch (sortBy) {
                                                    case 'popularity':
                                                        templates.sort((a, b) => b.usage_count - a.usage_count);
                                                        break;
                                                    case 'rating':
                                                        templates.sort((a, b) => b.rating - a.rating);
                                                        break;
                                                    case 'newest':
                                                        templates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                                                        break;
                                                    case 'name':
                                                        templates.sort((a, b) => a.name.localeCompare(b.name));
                                                        break;
                                                }
                                            },
                                            buildCategoryTree(category, allCategories) {
                                                const children = allCategories.filter(c => c.parent_id === category.id);
                                                return {
                                                    ...category,
                                                    children: children.map(child => this.buildCategoryTree(child, allCategories)),
                                                };
                                            },
                                            async recordTemplateUsage(templateId) {
                                                await this.apiClient.post(`/api/templates/${templateId}/usage`);
                                            }
                                            // Update local cache
                                            ,
                                            // Update local cache
                                            const: template = this.templates.get(templateId),
                                            if(template) {
                                                template.usage_count++;
                                            },
                                            async refreshTemplateRating(templateId) {
                                                const response = await this.apiClient.get(`/api/templates/${templateId}/rating`);
                                            },
                                            const: template = this.templates.get(templateId),
                                            if(template) {
                                                template.rating = response.data.average_rating;
                                            },
                                            async getUserTemplateAnalytics(userId) {
                                                const response = await this.apiClient.get(`/api/users/${userId}/template-analytics`);
                                            },
                                            return: response.data,
                                            convertToYaml(template) {
                                                // Convert template to YAML format
                                                // This would use a YAML library in a real implementation
                                                return JSON.stringify(template, null, 2);
                                            } // Placeholder
                                            , // Placeholder
                                            parseYamlTemplate(yamlData) {
                                                // Parse YAML template data
                                                // This would use a YAML library in a real implementation
                                                return JSON.parse(yamlData);
                                            } // Placeholder
                                            , // Placeholder
                                            createTemplateBundle(template) {
                                                // Create a complete template bundle with all dependencies
                                                const bundle = {
                                                    template,
                                                    dependencies: this.extractDependencies(template),
                                                    metadata: {
                                                        created_at: new Date().toISOString(),
                                                        version: '1.0.0',
                                                    },
                                                    return: JSON.stringify(bundle, null, 2),
                                                    extractFromBundle(bundleData) {
                                                        const bundle = JSON.parse(bundleData);
                                                        return bundle.template;
                                                    },
                                                    extractDependencies(template) {
                                                        // Extract any dependencies needed for the template
                                                        return [];
                                                    },
                                                    initializeDefaultCategories() {
                                                        const defaultCategories = [
                                                            {
                                                                id: 'workflow',
                                                                name: 'Workflow Templates',
                                                                description: 'Pre-built workflow patterns and processes',
                                                                icon: 'workflow',
                                                                color: '#3B82F6',
                                                            },
                                                            {
                                                                id: 'data-processing',
                                                                name: 'Data Processing',
                                                                description: 'Templates for data transformation and analysis',
                                                                icon: 'database',
                                                                color: '#10B981',
                                                            },
                                                            {
                                                                id: 'automation',
                                                                name: 'Automation',
                                                                description: 'Automated task and process templates',
                                                                icon: 'robot',
                                                                color: '#F59E0B',
                                                            },
                                                            {
                                                                id: 'content',
                                                                name: 'Content Generation',
                                                                description: 'Templates for content creation and management',
                                                                icon: 'document',
                                                                color: '#8B5CF6',
                                                            },
                                                            {
                                                                id: 'analysis',
                                                                name: 'Analysis & Reporting',
                                                                description: 'Templates for analysis and reporting workflows',
                                                                icon: 'chart',
                                                                color: '#EF4444'
                                                            }
                                                        ];
                                                        defaultCategories.forEach(category => { });
                                                        this.categories.set(category.id, category);
                                                    }
                                                };
                                            }
                                        };
                                    }
                                };
                            }
                        }
                    }
                }
            }
        }
    }
}
