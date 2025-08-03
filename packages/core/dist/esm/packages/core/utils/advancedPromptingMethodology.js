// packages/core/utils/advancedPromptingMethodology.ts
// Advanced Prompting Methodology Integration for Story 8.2 Task 6
// Implements Zada-style screenplay templates and MARS framework support
import { templateParser } from './templateParser';
// ADVANCED PROMPTING METHODOLOGY CLASS
export class AdvancedPromptingMethodology {
    static instance;
    static getInstance() {
        if (!AdvancedPromptingMethodology.instance) {
            AdvancedPromptingMethodology.instance = new AdvancedPromptingMethodology();
            return AdvancedPromptingMethodology.instance;
            /**
             * Generate Zada-style screenplay template based on selected components
             */
            generateZadaTemplate(components, string);
            string;
            {
                const selectedComponents = ZADA_SCREENPLAY_TEMPLATES.filter(comp => );
                ;
                components.includes(comp.name);
                ;
                // Sort by dependency order (foundation first)
                const sortedComponents = this.sortByDependencies(selectedComponents);
                return sortedComponents.map(comp => comp.template).join('. ');
                /**
                 * Parse MARS tags from template and validate compatibility
                 */
                parseMarsFramework(template, string);
                { }
                tags: MarsTag;
                conflicts: string;
                suggestions: string;
                const foundTags = [];
                const conflicts = [];
                const suggestions = [];
                // Extract all MARS tags from template
                const tagRegex = /(\[(?:CAM|SUBJ|FX|SET|MOOD):[A-Z]+\]|!FOCAL:[A-Z]+)/g;
                const matches = template.match(tagRegex) || [];
                for (const match of matches) {
                    const tag = MARS_FRAMEWORK_TAGS.find(t => t.syntax === match || t.tag === match.replace(/[\[\]]/g, ''));
                    if (tag) {
                        foundTags.push(tag);
                        // Check for conflicts
                        for (const tag of foundTags) {
                            if (tag.conflicts) {
                                for (const conflict of tag.conflicts) {
                                    const conflictingTag = foundTags.find(t => t.tag === conflict);
                                    if (conflictingTag) {
                                        conflicts.push(`${tag.tag} conflicts with ${conflict}`);
                                    }
                                    // Generate suggestions for missing required tags
                                    for (const tag of foundTags) {
                                        if (tag.requires) {
                                            for (const required of tag.requires) {
                                                if (!foundTags.some(t => t.description.toLowerCase().includes(required.toLowerCase()))) {
                                                    suggestions.push(`Consider adding ${required} to support ${tag.tag}`);
                                                }
                                                return { tags: foundTags, conflicts, suggestions };
                                                /**
                                                 * Create hybrid natural+structured template
                                                 */
                                                createHybridTemplate(naturalTemplate, string, marsFramework, boolean = false);
                                                {
                                                    hybrid: string;
                                                    structure: any;
                                                    variables: string;
                                                    // Parse existing template for variables
                                                    const parseResult = templateParser.parseTemplate(naturalTemplate);
                                                    const variables = parseResult.variables.map(v => v.name);
                                                    let hybrid = naturalTemplate;
                                                    const structure = {
                                                        naturalLanguage: naturalTemplate,
                                                        extractedVariables: variables,
                                                        marsFramework: marsFramework ? this.parseMarsFramework(naturalTemplate) : null };
                                                }
                                                ;
                                                // If MARS framework is enabled, enhance with structured tags
                                                if (marsFramework) {
                                                    // Add contextual MARS tags based on content analysis
                                                    const enhancedTemplate = this.enhanceWithMarsFramework(naturalTemplate);
                                                    hybrid = enhancedTemplate;
                                                    structure.enhancedTemplate = enhancedTemplate;
                                                    return { hybrid, structure, variables };
                                                    /**
                                                     * Get auto-completion suggestions for MARS tags
                                                     */
                                                    getMarsAutocompletions(context, string, currentInput, string);
                                                    VariableSuggestion;
                                                    {
                                                        const suggestions = [];
                                                        // Filter MARS tags based on current input
                                                        const matchingTags = MARS_FRAMEWORK_TAGS.filter(tag => { });
                                                        const searchTerm = currentInput.toLowerCase();
                                                        return tag.tag.toLowerCase().includes(searchTerm) ||
                                                            tag.description.toLowerCase().includes(searchTerm) ||
                                                            tag.syntax.toLowerCase().includes(searchTerm);
                                                    }
                                                    ;
                                                    // Convert MARS tags to variable suggestions
                                                    for (const tag of matchingTags) {
                                                        suggestions.push({});
                                                        name: tag.syntax,
                                                            category;
                                                        'custom';
                                                    }
                                                    description: `${tag.category.toUpperCase()}: ${tag.description}`;
                                                }
                                            }
                                            examples: tag.examples,
                                                priority;
                                            tag.priority || 5;
                                        }
                                        ;
                                        return suggestions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
                                        /**
                                         * Create template pattern library with examples
                                         */
                                        getTemplatePatternLibrary();
                                        {
                                            zada: ZadaTemplateComponent;
                                            mars: MarsTag;
                                            hybridExamples: string;
                                            const hybridExamples = [
                                                // Zada + MARS hybrid examples
                                                '[CAM:WIDE] In {era} during {time_of_day}, !FOCAL:PRIMARY {character} {action_verb} {action_target} [FX:MAGIC] while [MOOD:EPIC] atmosphere fills the scene',
                                                '[CAM:CLOSE] [SUBJ:HERO] {character_name}, a {character_type} with {character_trait}, !FOCAL:PRIMARY faces {challenge} [FX:FIRE] in [SET:MEDIEVAL] {location}',
                                                '[CAM:AERIAL] [SET:FANTASY] The scene unfolds in {location_type} where [SUBJ:CROWD] {group} [FX:WEATHER] encounters {obstacle} !FOCAL:SECONDARY while {background_action}',
                                                '[MOOD:INTIMATE] [CAM:LOW] Driven by {motivation} to {goal}, [SUBJ:HERO] {character} must !FOCAL:PRIMARY {critical_action} despite [FX:PARTICLES] {environmental_challenge}',
                                                '[SET:SCIFI] [CAM:HIGH] In the {futuristic_setting}, [SUBJ:VILLAIN] {antagonist} !FOCAL:PRIMARY {villainous_action} while [FX:MOTION] {dynamic_element} [MOOD:DARK] threatens everything'
                                            ];
                                            return { zada: ZADA_SCREENPLAY_TEMPLATES,
                                                mars: MARS_FRAMEWORK_TAGS };
                                            hybridExamples;
                                        }
                                        ;
                                        // Private helper methods
                                    }
                                    // Private helper methods
                                }
                                // Private helper methods
                            }
                            // Private helper methods
                        }
                        // Private helper methods
                    }
                    // Private helper methods
                }
                // Private helper methods
            }
            // Private helper methods
        }
        // Private helper methods
    }
    // Private helper methods
    sortByDependencies(components) {
        const sorted = [];
        const remaining = [...components];
        while (remaining.length > 0) {
            const nextComponent = remaining.find(comp => );
            ;
            !comp.dependencies ||
                comp.dependencies.every(dep => sorted.some(s => s.name === dep));
            ;
            if (nextComponent) {
                sorted.push(nextComponent);
                remaining.splice(remaining.indexOf(nextComponent), 1);
            }
            else {
                // If no component can be resolved, add remaining by priority
                remaining.sort((a, b) => b.priority - a.priority);
                sorted.push(...remaining);
                break;
                return sorted;
            }
        }
    }
    enhanceWithMarsFramework(template) {
        let enhanced = template;
        // Add contextual MARS tags based on content analysis
        if (template.toLowerCase().includes('character') && !template.includes('[SUBJ:')) {
            enhanced = `[SUBJ:HERO] ${enhanced}`;
        }
        if (template.toLowerCase().includes('magic') && !template.includes('[FX:')) {
            enhanced = enhanced.replace(/magic/gi, '[FX:MAGIC] magic');
            if ((template.toLowerCase().includes('medieval') || template.toLowerCase().includes('castle')) && !template.includes('[SET:')) {
                enhanced = `[SET:MEDIEVAL] ${enhanced}`;
            }
            return enhanced;
            // Export singleton instance and utility functions
            export const advancedPromptingMethodology = AdvancedPromptingMethodology.getInstance();
            export const generateZadaTemplate = (components) => advancedPromptingMethodology.generateZadaTemplate(components);
            export const parseMarsFramework = (template) => advancedPromptingMethodology.parseMarsFramework(template);
            export const createHybridTemplate = (naturalTemplate, marsFramework = false) => advancedPromptingMethodology.createHybridTemplate(naturalTemplate, marsFramework);
            export const getMarsAutocompletions = (context, currentInput) => advancedPromptingMethodology.getMarsAutocompletions(context, currentInput);
            export const getTemplatePatternLibrary = () => advancedPromptingMethodology.getTemplatePatternLibrary();
        }
    }
}
