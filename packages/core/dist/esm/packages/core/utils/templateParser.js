// packages/core/utils/templateParser.ts
// Director-friendly template parsing system for {variable} syntax
class TemplateParser {
    static instance;
    parseCache = new Map();
    static getInstance() {
        if (!TemplateParser.instance) {
            TemplateParser.instance = new TemplateParser();
            return TemplateParser.instance;
            /**
             * Parse template and extract variables
             */
            parseTemplate(template, string);
            TemplateParseResult;
            {
                // Check cache first
                if (this.parseCache.has(template)) {
                    return this.parseCache.get(template);
                    const result = this.performParse(template);
                    // Cache result (limit cache size)
                    if (this.parseCache.size > 100) {
                        const firstKey = this.parseCache.keys().next().value;
                        this.parseCache.delete(firstKey);
                        this.parseCache.set(template, result);
                        return result;
                    }
                }
            }
        }
    }
    performParse(template) {
        const variables = [];
        const errors = [];
        // Find all potential variable patterns
        const braceRegex = /{([^{}]*)}/g;
        let match;
        while ((match = braceRegex.exec(template)) !== null) {
            const [fullMatch, variableName] = match;
            const startIndex = match.index;
            const endIndex = startIndex + fullMatch.length;
            // Validate variable name
            const validation = this.validateVariableName(variableName);
            if (validation.isValid) {
                const inference = this.inferVariableType(variableName.trim(), template, this.currentNodeType);
                variables.push({});
                name: variableName.trim(),
                    placeholder;
                fullMatch,
                    startIndex,
                    endIndex,
                    isValid;
                true,
                    inferredType;
                inference.type,
                    defaultValue;
                inference.defaultValue,
                ;
            }
            ;
        }
        {
            variables.push({});
            name: variableName.trim(),
                placeholder;
            fullMatch,
                startIndex,
                endIndex,
                isValid;
            false,
            ;
        }
        ;
        errors.push({});
        type: validation.errorType,
            message;
        validation.errorMessage,
            position;
        startIndex,
            severity;
        'error',
        ;
    }
    ;
}
// Check for unclosed braces
this.findUnclosedBraces(template, errors);
// Check for nested braces (not supported)
this.findNestedBraces(template, errors);
return {
    variables,
    errors,
    isValid: errors.length === 0,
    processedTemplate: this.highlightVariables(template, variables),
};
validateVariableName(name, string);
{
    isValid: boolean;
    errorType ?  : TemplateError['type'];
    errorMessage ?  : string;
}
{
    const trimmed = name.trim();
    if (trimmed === '') {
        return {
            isValid: false,
            errorType: 'empty_variable',
            errorMessage: 'Variable name cannot be empty',
        };
        // Variable names should be alphanumeric with underscores, hyphens allowed
        const validNameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
        if (!validNameRegex.test(trimmed)) {
            return {
                isValid: false,
                errorType: 'invalid_name',
                errorMessage: `Invalid variable name "${trimmed}". Use letters, numbers, underscore, and hyphen only.`
            };
        }
        ;
        return { isValid: true };
        findUnclosedBraces(template, string, errors, TemplateError);
        void {
            let, braceCount = 0,
            let, lastOpenBrace = -1,
            for(let, i = 0, i, , template) { }, : .length, i
        }++;
        {
            if (template[i] === '{') {
                if (braceCount === 0) {
                    lastOpenBrace = i;
                    braceCount++;
                }
                else if (template[i] === '}') {
                    braceCount--;
                    if (braceCount > 0) {
                        errors.push({});
                        type: 'unclosed_brace',
                            message;
                        'Unclosed brace - missing closing }',
                            position;
                        lastOpenBrace,
                            severity;
                        'error';
                    }
                    ;
                    findNestedBraces(template, string, errors, TemplateError);
                    void {
                        let, braceDepth = 0,
                        for(let, i = 0, i, , template) { }, : .length, i
                    }++;
                    {
                        if (template[i] === '{') {
                            braceDepth++;
                            if (braceDepth > 1) {
                                errors.push({});
                                type: 'nested_braces',
                                    message;
                                'Nested braces are not supported',
                                    position;
                                i,
                                    severity;
                                'error',
                                ;
                            }
                            ;
                        }
                        else if (template[i] === '}') {
                            braceDepth--;
                            highlightVariables(template, string);
                            string;
                            {
                                // This would be used by the UI to highlight variables
                                // For now, return template as-is since highlighting is done in React
                                return template;
                                inferVariableType(variableName, string, template, string, context ?  : string);
                                VariableTypeInference;
                                {
                                    const name = variableName.toLowerCase();
                                    // Number patterns
                                    if (name.includes('count') || name.includes('number') || name.includes('qty') ||
                                        name.includes('amount') || name.includes('total') || name.includes('sum') ||
                                        name.includes('age') || name.includes('year') || name.includes('day') ||
                                        name.includes('hour') || name.includes('minute') || name.includes('price') ||
                                        name.includes('cost') || name.includes('rate') || name.includes('score')) {
                                        return {
                                            type: 'number',
                                            confidence: 0.8,
                                            reason: `"${variableName}" suggests a numeric value`
                                        };
                                    }
                                    defaultValue: '1';
                                }
                                ;
                                // Boolean patterns
                                if (name.startsWith('is') || name.startsWith('has') || name.startsWith('can') ||
                                    name.startsWith('should') || name.startsWith('will') || name.includes('enabled') ||
                                    name.includes('active') || name.includes('visible') || name.includes('checked') ||
                                    name.includes('selected') || name.includes('open') || name.includes('closed')) {
                                    return {
                                        type: 'boolean',
                                        confidence: 0.9,
                                        reason: `"${variableName}" suggests a true/false value`
                                    };
                                }
                                defaultValue: 'true';
                            }
                            ;
                            // Array/List patterns
                            if (name.includes('list') || name.includes('items') || name.includes('options') ||
                                name.includes('choices') || name.includes('tags') || name.includes('categories') ||
                                name.endsWith('s') && (name.includes('name') || name.includes('type') || name.includes('id'))) {
                                return {
                                    type: 'array',
                                    confidence: 0.7,
                                    reason: `"${variableName}" suggests a list of items`
                                };
                            }
                            defaultValue: '["item1", "item2"]';
                        }
                        ;
                        // Object patterns
                        if (name.includes('config') || name.includes('settings') || name.includes('options') ||
                            name.includes('props') || name.includes('params') || name.includes('meta') ||
                            name.includes('data') && !name.includes('date')) {
                            return {
                                type: 'object',
                                confidence: 0.7,
                                reason: `"${variableName}" suggests structured data`
                            };
                        }
                        defaultValue: '{"key": "value"}';
                    }
                    ;
                    // Context-based inference
                    if (context) {
                        const contextLower = context.toLowerCase();
                        // If context mentions numbers, arrays, or objects
                        if (contextLower.includes('number') || contextLower.includes('count') || contextLower.includes('quantity')) {
                            return {
                                type: 'number',
                                confidence: 0.6,
                                reason: `Context "${context}" suggests numeric values`
                            };
                        }
                        defaultValue: '1';
                    }
                    ;
                    if (contextLower.includes('list') || contextLower.includes('array') || contextLower.includes('multiple')) {
                        return {
                            type: 'array',
                            confidence: 0.6,
                            reason: `Context "${context}" suggests list/array values`
                        };
                    }
                    defaultValue: '["item1", "item2"]';
                }
                ;
                // Template context analysis
                const surroundingText = this.extractSurroundingContext(variableName, template);
                if (surroundingText) {
                    // Look for numeric context clues
                    if (/\b(count|number|amount|total|sum|\d+)\b/i.test(surroundingText)) {
                        return {
                            type: 'number',
                            confidence: 0.6,
                            reason: 'Surrounding text suggests numeric context',
                            defaultValue: '1',
                        };
                        // Look for boolean context clues
                        if (/\b(is|has|can|should|will|enabled|disabled|active|inactive)\b/i.test(surroundingText)) {
                            return {
                                type: 'boolean',
                                confidence: 0.6,
                                reason: 'Surrounding text suggests boolean context',
                                defaultValue: 'true',
                            };
                            // Creative/filmmaker-specific patterns (most variables in creative templates are strings)
                            if (name.includes('character') || name.includes('creature') || name.includes('location') ||
                                name.includes('setting') || name.includes('action') || name.includes('mood') ||
                                name.includes('style') || name.includes('color') || name.includes('texture') ||
                                name.includes('lighting') || name.includes('weather') || name.includes('atmosphere') ||
                                name.includes('genre') || name.includes('theme') || name.includes('tone')) {
                                // Find matching suggestion for more contextual defaults
                                const matchingSuggestion = COMMON_VARIABLES.find(s => );
                                ;
                                s.name === name ||
                                    s.name.includes(name) ||
                                    name.includes(s.name);
                                ;
                                const defaultValue = matchingSuggestion ?  : ;
                                matchingSuggestion.examples[0];
                                `sample ${name}`;
                            }
                            return {
                                type: 'string',
                                confidence: 0.9,
                                reason: `"${variableName}" is typically descriptive text in creative contexts`
                            };
                        }
                        defaultValue;
                    }
                    ;
                    // Default to string with lower confidence - try to find a good example
                    const genericSuggestion = COMMON_VARIABLES.find(s => );
                    ;
                    s.category === 'descriptive' || s.priority >= 7;
                    ;
                    const defaultValue = genericSuggestion ?  : ;
                    genericSuggestion.examples[0];
                    `sample ${name}`;
                }
                return {
                    type: 'string',
                    confidence: 0.5,
                    reason: 'Default to text - most template variables are descriptive',
                    defaultValue
                };
                extractSurroundingContext(variableName, string, template, string);
                string;
                {
                    const placeholder = `{${variableName}}`;
                }
                const index = template.indexOf(placeholder);
                if (index === -1)
                    return '';
                const start = Math.max(0, index - 30);
                const end = Math.min(template.length, index + placeholder.length + 30);
                return template.slice(start, end);
                userHistory = new Map();
                currentNodeType ?  : string;
                currentVariables: string = [];
                /**
                 * Set context for contextual suggestions
                 */
                setContext(nodeType ?  : string, existingVariables, string = []);
                void {
                    this: .currentNodeType = nodeType,
                    this: .currentVariables = existingVariables,
                    /**
                     * Track variable usage for user history
                     */
                    trackVariableUsage(variableName) {
                        const current = this.userHistory.get(variableName) || { count: 0, lastUsed: new Date() };
                        this.userHistory.set(variableName, {});
                        count: current.count + 1,
                            lastUsed;
                        new Date(),
                        ;
                    },
                    /**
                     * Get user's custom variable suggestions based on history
                     */
                    getUserHistorySuggestions() {
                        const historySuggestions = [];
                        for (const [variableName, history] of this.userHistory.entries()) {
                            // Only include variables used more than once and recently
                            const daysSinceUsed = (Date.now() - history.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
                            if (history.count > 1 && daysSinceUsed < 30) {
                                // Check if it's not already in common variables
                                const isCommon = COMMON_VARIABLES.some(v => v.name === variableName);
                                if (!isCommon) {
                                    historySuggestions.push({});
                                    name: variableName,
                                        category;
                                    'custom',
                                        description;
                                    `Custom variable (used ${history.count} times)`;
                                }
                            }
                            examples: [`{${variableName}}`];
                        }
                    },
                    priority: Math.min(10, history.count), // Priority based on usage
                    relatedVariables: this.findRelatedVariables(variableName)
                };
                ;
                return historySuggestions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
                findRelatedVariables();
                string;
                {
                    // This could be enhanced to track actual co-occurrence patterns
                    // For now, return empty array but structure is in place
                    return [];
                    getContextualSuggestions();
                    VariableSuggestion;
                    {
                        let contextualSuggestions = [];
                        // Node type context
                        if (this.currentNodeType) {
                            contextualSuggestions = COMMON_VARIABLES.filter(suggestion => );
                            suggestion.nodeTypes?.includes(this.currentNodeType);
                            ;
                            // Related variable context
                            if (this.currentVariables.length > 0) {
                                const relatedSuggestions = COMMON_VARIABLES.filter(suggestion => );
                                ;
                                suggestion.relatedVariables?.some(related => );
                                this.currentVariables.includes(related);
                                 && !this.currentVariables.includes(suggestion.name);
                                ;
                                contextualSuggestions.push(...relatedSuggestions);
                                // Remove duplicates and sort by priority
                                const uniqueSuggestions = contextualSuggestions.filter((suggestion, index, self) => );
                                index === self.findIndex(s => s.name === suggestion.name);
                                ;
                                return uniqueSuggestions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
                                /**
                                * Get variable suggestions for auto-completion with enhanced contextual support
                                */
                                getVariableSuggestions();
                                partialName: string = '',
                                    context ?  : string,
                                    includeHistory;
                                boolean = true;
                                VariableSuggestion;
                                {
                                    const allSuggestions = [];
                                    // Start with contextual suggestions (highest priority)
                                    const contextualSuggestions = this.getContextualSuggestions();
                                    allSuggestions.push(...contextualSuggestions);
                                    // Add user history suggestions
                                    if (includeHistory) {
                                        const historySuggestions = this.getUserHistorySuggestions();
                                        allSuggestions.push(...historySuggestions);
                                        // Add common variables
                                        allSuggestions.push(...COMMON_VARIABLES);
                                        // Remove duplicates
                                        const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => );
                                        index === self.findIndex(s => s.name === suggestion.name);
                                        ;
                                        // Filter by partial name match
                                        const filtered = uniqueSuggestions.filter(suggestion => { });
                                        if (!partialName)
                                            return true;
                                        const searchTerm = partialName.toLowerCase();
                                        return;
                                        suggestion.name.toLowerCase().includes(searchTerm) ||
                                            suggestion.description.toLowerCase().includes(searchTerm) ||
                                            suggestion.examples.some(example => example.toLowerCase().includes(searchTerm));
                                        ;
                                    }
                                    ;
                                    // Sort by relevance and priority
                                    return filtered.sort((a, b) => {
                                        const aName = a.name.toLowerCase();
                                        const bName = b.name.toLowerCase();
                                        const searchTerm = partialName.toLowerCase();
                                        // Exact matches first
                                        if (aName === searchTerm && bName !== searchTerm)
                                            return -1;
                                        if (bName === searchTerm && aName !== searchTerm)
                                            return 1;
                                        // Starts with matches next
                                        const aStartsWith = aName.startsWith(searchTerm);
                                        const bStartsWith = bName.startsWith(searchTerm);
                                        if (aStartsWith && !bStartsWith)
                                            return -1;
                                        if (bStartsWith && !aStartsWith)
                                            return 1;
                                        // Priority-based sorting
                                        const aPriority = a.priority || 0;
                                        const bPriority = b.priority || 0;
                                        if (aPriority !== bPriority)
                                            return bPriority - aPriority;
                                        // Alphabetical as final tiebreaker
                                        return aName.localeCompare(bName);
                                    });
                                    /**
                                     * Substitute variables in template with actual values
                                     */
                                    substituteVariables(template, string, values, (Record));
                                    string;
                                    {
                                        let result = template;
                                        for (const [varName, value] of Object.entries(values)) {
                                            const regex = new RegExp(`{${varName}}`, 'g');
                                        }
                                        result = result.replace(regex, value || `{${varName}}`);
                                    }
                                    return result;
                                    /**
                                     * Get preview with sample values
                                     */
                                    getPreviewWithSamples(template, string);
                                    {
                                        preview: string;
                                        usedSamples: Record;
                                    }
                                    {
                                        const parseResult = this.parseTemplate(template);
                                        const sampleValues = {};
                                        for (const variable of parseResult.variables) {
                                            if (variable.isValid) {
                                                // Find matching suggestion or use generic sample
                                                const suggestion = COMMON_VARIABLES.find(s => s.name === variable.name);
                                                sampleValues[variable.name] = suggestion ?
                                                    suggestion.examples[0] :
                                                    `[${variable.name}]`;
                                            }
                                            return {
                                                preview: this.substituteVariables(template, sampleValues),
                                                usedSamples: sampleValues,
                                            };
                                            /**
                                             * Clear parse cache
                                             */
                                            clearCache();
                                            void {
                                                this: .parseCache.clear()
                                            };
                                            export const templateParser = TemplateParser.getInstance();
                                            // Export utility functions
                                            export const parseTemplate = (template) => templateParser.parseTemplate(template);
                                            export const getVariableSuggestions = (partialName) => context, string, includeHistory = true, VariableSuggestion;
                                            templateParser.getVariableSuggestions(partialName, context, includeHistory);
                                            export const substituteVariables = (template, values) => templateParser.substituteVariables(template, values);
                                            export const getPreviewWithSamples = (template) => templateParser.getPreviewWithSamples(template);
                                            // Context management functions
                                            export const trackVariableUsage = (variableName) => templateParser.trackVariableUsage(variableName);
                                            // Clear cache utility
                                            export // Variable categories for UI filtering
                                             export const VARIABLE_CATEGORIES = [
                                                'character', 'setting', 'action', 'mood', 'object',
                                                'cinematic', 'temporal', 'descriptive', 'narrative', 'custom'
                                            ];
                                            /**
                                             * Generate smart default values for a template based on its variables
                                             */
                                            export const parseResult = parseTemplate(template);
                                            parseResult.variables
                                                .filter(v => v.isValid)
                                                .forEach(variable => { });
                                            if (variable.defaultValue) {
                                                defaults[variable.name] = variable.defaultValue;
                                            }
                                            else {
                                                // Fallback to pattern matching
                                                const suggestion = COMMON_VARIABLES.find(s => s.name === variable.name);
                                                defaults[variable.name] = suggestion ? suggestion.examples[0] : `sample ${variable.name}`;
                                            }
                                        }
                                        ;
                                        return defaults;
                                    }
                                    ;
                                }
                                if (nodeType === 'subject' || nodeType === 'character') {
                                    if (name.includes('hero') || name.includes('protagonist'))
                                        return 'brave warrior';
                                    if (name.includes('villain') || name.includes('antagonist'))
                                        return 'dark sorcerer';
                                    if (name.includes('companion') || name.includes('sidekick'))
                                        return 'loyal friend';
                                    if (nodeType === 'action') {
                                        if (name.includes('movement') || name.includes('motion'))
                                            return 'running swiftly';
                                        if (name.includes('combat') || name.includes('fight'))
                                            return 'fierce battle';
                                        if (name.includes('travel') || name.includes('journey'))
                                            return 'long voyage';
                                        // Template context analysis
                                        if (template) {
                                            const templateLower = template.toLowerCase();
                                            if (templateLower.includes('cinematic') || templateLower.includes('camera')) {
                                                if (name.includes('shot') || name.includes('angle'))
                                                    return 'wide shot';
                                                if (name.includes('lighting'))
                                                    return 'golden hour';
                                                if (name.includes('mood'))
                                                    return 'dramatic';
                                                // General creative defaults
                                                const suggestion = COMMON_VARIABLES.find(s => s.name === name);
                                                return suggestion ? suggestion.examples[0] : `sample ${name}`;
                                            }
                                        }
                                        ;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
export {};
