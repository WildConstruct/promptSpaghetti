// packages/core/utils/advancedPromptingMethodology.ts
// Advanced Prompting Methodology Integration for Story 8.2 Task 6
// Implements Zada-style screenplay templates and MARS framework support
import { VariableSuggestion, templateParser } from './templateParser';

// ZADA-STYLE SCREENPLAY TEMPLATE SYSTEM
// Based on screenplay structure: time/setting → actions → locations → characters → cinematography;


export interface ZadaTemplateComponent {
  category: 'time_setting' | 'actions' | 'locations' | 'characters' | 'cinematography';
  name: string;
  description: string;
  template: string;
  variables: string[];
  examples: string[];
  priority: number;
  dependencies?: string[]; // Other components this depends on
}


export const ZADA_SCREENPLAY_TEMPLATES: ZadaTemplateComponent[] = [
  // Time/Setting Foundation
  {
    category: 'time_setting',
    name: 'temporal_foundation',
    description: 'Establishes when and where the scene takes place',
    template: 'In {era} during {time_of_day}, at {location}',
    variables: ['era', 'time_of_day', 'location'],
    examples: [
      'In medieval times during dawn, at a castle courtyard',
      'In the far future during midnight, at a space station',
      'In Victorian era during sunset, at a fog-covered street'
    ],
    priority: 10
  },
  {
    category: 'time_setting',
    name: 'atmospheric_setting',
    description: 'Creates mood and atmosphere for the scene',
    template: 'The {weather} creates a {mood} atmosphere, with {lighting} casting {shadow_type} shadows',
    variables: ['weather', 'mood', 'lighting', 'shadow_type'],
    examples: [
      'The storm creates a tense atmosphere, with lightning casting dramatic shadows',
      'The gentle rain creates a melancholic atmosphere, with soft light casting long shadows'
    ],
    priority: 8
  },
  // Actions (Core Story Events)
  {
    category: 'actions',
    name: 'character_action',
    description: 'Primary character action driving the scene',
    template: '{character} {action_verb} {action_target} {action_manner}',
    variables: ['character', 'action_verb', 'action_target', 'action_manner'],
    examples: [
      'The knight charges toward the dragon with unwavering determination',
      'The detective examines the evidence with careful attention'
    ],
    priority: 10,
    dependencies: ['time_setting']
  },
  {
    category: 'actions',
    name: 'conflict_action',
    description: 'Conflict or tension-building action',
    template: 'As {obstacle} {obstacle_action}, {protagonist} must {response_action} or face {consequence}',
    variables: ['obstacle', 'obstacle_action', 'protagonist', 'response_action', 'consequence'],
    examples: [
      'As the enemy advances, the hero must stand firm or face defeat',
      'As time runs out, the scientist must complete the formula or face disaster'
    ],
    priority: 9,
    dependencies: ['character_action']
  },
  // Locations (Spatial Context)
  {
    category: 'locations',
    name: 'primary_location',
    description: 'Main location where action takes place',
    template: 'The scene unfolds in {location_type}, characterized by {location_features} and {location_mood}',
    variables: ['location_type', 'location_features', 'location_mood'],
    examples: [
      'The scene unfolds in an ancient library, characterized by towering bookshelves and mystical atmosphere',
      'The scene unfolds in a cyberpunk alley, characterized by neon lights and dangerous mood'
    ],
    priority: 8,
    dependencies: ['time_setting']
  },
  {
    category: 'locations',
    name: 'location_details',
    description: 'Specific environmental details',
    template: 'Surrounding details include {detail_1}, {detail_2}, and {detail_3} that {impact_on_scene}',
    variables: ['detail_1', 'detail_2', 'detail_3', 'impact_on_scene'],
    examples: [
      'Surrounding details include flickering torches, stone carvings, and echoing footsteps that heighten the tension',
      'Surrounding details include floating debris, alien sounds, and distant explosions that create urgency'
    ],
    priority: 6
  },
  // Characters (Who is involved)
  {
    category: 'characters',
    name: 'primary_character',
    description: 'Main character focus and description',
    template: '{character_name}, a {character_type} with {character_trait_1} and {character_trait_2}',
    variables: ['character_name', 'character_type', 'character_trait_1', 'character_trait_2'],
    examples: [
      'Aria, a skilled warrior with fierce determination and hidden vulnerability',
      'Dr. Chen, a brilliant scientist with innovative thinking and moral conviction'
    ],
    priority: 9,
    dependencies: ['actions']
  },
  {
    category: 'characters',
    name: 'character_motivation',
    description: 'What drives the character in this scene',
    template: 'Driven by {motivation} to {goal}, despite {internal_conflict}',
    variables: ['motivation', 'goal', 'internal_conflict'],
    examples: [
      'Driven by love to save the kingdom, despite fear of failure',
      'Driven by duty to solve the mystery, despite personal cost'
    ],
    priority: 7,
    dependencies: ['primary_character']
  },
  // Cinematography (Visual presentation)
  {
    category: 'cinematography',
    name: 'camera_direction',
    description: 'Camera angle and movement for cinematic feel',
    template: 'Shot with {camera_angle} using {camera_movement}, emphasizing {visual_focus}',
    variables: ['camera_angle', 'camera_movement', 'visual_focus'],
    examples: [
      'Shot with low angle using slow zoom, emphasizing the character\'s determination',
      'Shot with overhead view using smooth pan, emphasizing the vast landscape'
    ],
    priority: 7,
    dependencies: ['primary_location', 'primary_character']
  },
  {
    category: 'cinematography',
    name: 'lighting_design',
    description: 'Lighting setup for mood and visual impact',
    template: 'Lit with {lighting_style} creating {lighting_effect} that {emotional_impact}',
    variables: ['lighting_style', 'lighting_effect', 'emotional_impact'],
    examples: [
      'Lit with dramatic chiaroscuro creating stark contrasts that heighten tension',
      'Lit with soft golden hour creating warm glow that evokes nostalgia'
    ],
    priority: 6,
    dependencies: ['camera_direction']
  }
];

// MARS FRAMEWORK SUPPORT
// Modular tagging system: [CAM] for camera, [SUBJ] for subject, [FX] for effects, !FOCAL for priorities


export interface MarsTag {
  tag: string;
  category: 'camera' | 'subject' | 'effects' | 'focal' | 'setting' | 'mood' | 'technical';
  description: string;
  syntax: string;
  examples: string[];
  priority?: number;
  conflicts?: string[]; // Tags that conflict with this one
  requires?: string[]; // Tags that must be present when this is used
}


export const MARS_FRAMEWORK_TAGS: MarsTag[] = [
  // Camera Tags [CAM]
  {
    tag: 'CAM:WIDE',
    category: 'camera',
    description: 'Wide shot showing full scene context',
    syntax: '[CAM:WIDE]',
    examples: ['[CAM:WIDE] establishing shot of the battlefield', '[CAM:WIDE] panoramic view of the castle'],
    priority: 8,
    conflicts: ['CAM:CLOSE', 'CAM:MACRO']
  },
  {
    tag: 'CAM:CLOSE',
    category: 'camera',
    description: 'Close-up shot focusing on details',
    syntax: '[CAM:CLOSE]',
    examples: ['[CAM:CLOSE] character\'s determined expression', '[CAM:CLOSE] intricate sword details'],
    priority: 8,
    conflicts: ['CAM:WIDE', 'CAM:AERIAL']
  },
  {
    tag: 'CAM:LOW',
    category: 'camera',
    description: 'Low angle camera for dramatic effect',
    syntax: '[CAM:LOW]',
    examples: ['[CAM:LOW] hero rising from the ground', '[CAM:LOW] towering castle walls'],
    priority: 7
  },
  {
    tag: 'CAM:HIGH',
    category: 'camera',
    description: 'High angle camera for overview or vulnerability',
    syntax: '[CAM:HIGH]',
    examples: ['[CAM:HIGH] vast landscape below', '[CAM:HIGH] character looking small'],
    priority: 7
  },
  {
    tag: 'CAM:AERIAL',
    category: 'camera',
    description: 'Aerial/drone shot from above',
    syntax: '[CAM:AERIAL]',
    examples: ['[CAM:AERIAL] birds-eye view of the battle', '[CAM:AERIAL] sweeping forest canopy'],
    priority: 6,
    conflicts: ['CAM:CLOSE', 'CAM:MACRO']
  },
  // Subject Tags [SUBJ]
  {
    tag: 'SUBJ:HERO',
    category: 'subject',
    description: 'Primary heroic character focus',
    syntax: '[SUBJ:HERO]',
    examples: ['[SUBJ:HERO] brave knight in shining armor', '[SUBJ:HERO] determined space captain'],
    priority: 10
  },
  {
    tag: 'SUBJ:VILLAIN',
    category: 'subject',
    description: 'Primary antagonist focus',
    syntax: '[SUBJ:VILLAIN]',
    examples: ['[SUBJ:VILLAIN] dark sorcerer with glowing eyes', '[SUBJ:VILLAIN] ruthless corporate executive'],
    priority: 9
  },
  {
    tag: 'SUBJ:CROWD',
    category: 'subject',
    description: 'Group or crowd of characters',
    syntax: '[SUBJ:CROWD]',
    examples: ['[SUBJ:CROWD] cheering festival attendees', '[SUBJ:CROWD] fleeing townspeople'],
    priority: 6
  },
  {
    tag: 'SUBJ:OBJECT',
    category: 'subject',
    description: 'Focus on important object or prop',
    syntax: '[SUBJ:OBJECT]',
    examples: ['[SUBJ:OBJECT] ancient magical artifact', '[SUBJ:OBJECT] mysterious locked door'],
    priority: 7
  },
  // Effects Tags [FX]
  {
    tag: 'FX:MAGIC',
    category: 'effects',
    description: 'Magical or supernatural effects',
    syntax: '[FX:MAGIC]',
    examples: ['[FX:MAGIC] glowing energy swirling around hands', '[FX:MAGIC] portal opening with mystical light'],
    priority: 8
  },
  {
    tag: 'FX:FIRE',
    category: 'effects',
    description: 'Fire, flames, or burning effects',
    syntax: '[FX:FIRE]',
    examples: ['[FX:FIRE] dragon breathing intense flames', '[FX:FIRE] torches flickering in darkness'],
    priority: 8
  },
  {
    tag: 'FX:PARTICLES',
    category: 'effects',
    description: 'Particle effects like dust, sparks, snow',
    syntax: '[FX:PARTICLES]',
    examples: ['[FX:PARTICLES] dust motes dancing in sunbeams', '[FX:PARTICLES] magical sparkles floating'],
    priority: 6
  },
  {
    tag: 'FX:WEATHER',
    category: 'effects',
    description: 'Weather effects like rain, storm, fog',
    syntax: '[FX:WEATHER]',
    examples: ['[FX:WEATHER] heavy rain creating atmosphere', '[FX:WEATHER] mysterious fog rolling in'],
    priority: 7
  },
  {
    tag: 'FX:MOTION',
    category: 'effects',
    description: 'Motion blur, speed lines, dynamic movement',
    syntax: '[FX:MOTION]',
    examples: ['[FX:MOTION] sword swinging with blur trails', '[FX:MOTION] character running at super speed'],
    priority: 7
  },
  // Focal Priority Tags !FOCAL
  {
    tag: '!FOCAL:PRIMARY',
    category: 'focal',
    description: 'Primary focus - highest importance',
    syntax: '!FOCAL:PRIMARY',
    examples: ['!FOCAL:PRIMARY the hero\'s moment of decision', '!FOCAL:PRIMARY crucial plot revelation'],
    priority: 10
  },
  {
    tag: '!FOCAL:SECONDARY',
    category: 'focal',
    description: 'Secondary focus - supporting element',
    syntax: '!FOCAL:SECONDARY',
    examples: ['!FOCAL:SECONDARY background castle architecture', '!FOCAL:SECONDARY companion\'s reaction'],
    priority: 7
  },
  {
    tag: '!FOCAL:BACKGROUND',
    category: 'focal',
    description: 'Background element - minimal focus',
    syntax: '!FOCAL:BACKGROUND',
    examples: ['!FOCAL:BACKGROUND distant mountain range', '!FOCAL:BACKGROUND crowd of extras'],
    priority: 3
  },
  // Setting Tags
  {
    tag: 'SET:MEDIEVAL',
    category: 'setting',
    description: 'Medieval time period setting',
    syntax: '[SET:MEDIEVAL]',
    examples: ['[SET:MEDIEVAL] stone castle with banners', '[SET:MEDIEVAL] village market square'],
    priority: 8,
    requires: ['appropriate time period elements']
  },
  {
    tag: 'SET:SCIFI',
    category: 'setting',
    description: 'Science fiction futuristic setting',
    syntax: '[SET:SCIFI]',
    examples: ['[SET:SCIFI] gleaming space station corridors', '[SET:SCIFI] hovering vehicles in neon city'],
    priority: 8,
    conflicts: ['SET:MEDIEVAL', 'SET:FANTASY']
  },
  {
    tag: 'SET:FANTASY',
    category: 'setting',
    description: 'Fantasy magical world setting',
    syntax: '[SET:FANTASY]',
    examples: ['[SET:FANTASY] enchanted forest with glowing mushrooms', '[SET:FANTASY] wizard tower with floating books'],
    priority: 8
  },
  // Mood Tags
  {
    tag: 'MOOD:EPIC',
    category: 'mood',
    description: 'Epic, grand, heroic atmosphere',
    syntax: '[MOOD:EPIC]',
    examples: ['[MOOD:EPIC] triumphant hero standing victorious', '[MOOD:EPIC] vast army preparing for battle'],
    priority: 8
  },
  {
    tag: 'MOOD:INTIMATE',
    category: 'mood',
    description: 'Personal, close, emotional atmosphere',
    syntax: '[MOOD:INTIMATE]',
    examples: ['[MOOD:INTIMATE] quiet conversation by firelight', '[MOOD:INTIMATE] character\'s private moment'],
    priority: 7,
    conflicts: ['MOOD:EPIC', 'CAM:WIDE']
  },
  {
    tag: 'MOOD:DARK',
    category: 'mood',
    description: 'Dark, ominous, threatening atmosphere',
    syntax: '[MOOD:DARK]',
    examples: ['[MOOD:DARK] shadows lurking in corners', '[MOOD:DARK] ominous storm clouds gathering'],
    priority: 8
  }
];

// ADVANCED PROMPTING METHODOLOGY CLASS
export class AdvancedPromptingMethodology {
  private static instance: AdvancedPromptingMethodology;
  
  static getInstance(): AdvancedPromptingMethodology {
    if (!AdvancedPromptingMethodology.instance) {
      AdvancedPromptingMethodology.instance = new AdvancedPromptingMethodology();
    }
    return AdvancedPromptingMethodology.instance;
  }
  /**
   * Generate Zada-style screenplay template based on selected components
   */
  generateZadaTemplate(components: string[]): string {
    const selectedComponents = ZADA_SCREENPLAY_TEMPLATES.filter(comp => 
      components.includes(comp.name)
    );
    // Sort by dependency order (foundation first)
    const sortedComponents = this.sortByDependencies(selectedComponents);
    return sortedComponents.map(comp => comp.template).join('. ');
  }
  /**
   * Parse MARS tags from template and validate compatibility
   */
  parseMarsFramework(template: string): {
    tags: MarsTag[];
    conflicts: string[];
    suggestions: string[];
  } {
    const foundTags: MarsTag[] = [];
    const conflicts: string[] = [];
    const suggestions: string[] = [];
    // Extract all MARS tags from template
    const tagRegex = /(\[(?:CAM|SUBJ|FX|SET|MOOD):[A-Z]+\]|!FOCAL:[A-Z]+)/g;
    const matches = template.match(tagRegex) || [];
    for (const match of matches) {
      const tag = MARS_FRAMEWORK_TAGS.find(t => t.syntax === match || t.tag === match.replace(/[\[\]]/g, ''));
      if (tag) {
        foundTags.push(tag);
      }
    }
    // Check for conflicts
    for (const tag of foundTags) {
      if (tag.conflicts) {
        for (const conflict of tag.conflicts) {
          const conflictingTag = foundTags.find(t => t.tag === conflict);
          if (conflictingTag) {
            conflicts.push(`${tag.tag} conflicts with ${conflict}`);
          }
        }
      }
    }
    // Generate suggestions for missing required tags
    for (const tag of foundTags) {
      if (tag.requires) {
        for (const required of tag.requires) {
          if (!foundTags.some(t => t.description.toLowerCase().includes(required.toLowerCase()))) {
            suggestions.push(`Consider adding ${required} to support ${tag.tag}`);
          }
        }
      }
    }
    return { tags: foundTags, conflicts, suggestions };
  }
  /**
   * Create hybrid natural+structured template
   */
  createHybridTemplate(naturalTemplate: string, marsFramework: boolean = false): {
    hybrid: string;
    structure: any;
    variables: string[];
  } {
    // Parse existing template for variables
    const parseResult = templateParser.parseTemplate(naturalTemplate);
    const variables = parseResult.variables.map(v => v.name);
    let hybrid = naturalTemplate;
    const structure: any = {
      naturalLanguage: naturalTemplate,
      extractedVariables: variables,
      marsFramework: marsFramework ? this.parseMarsFramework(naturalTemplate) : null
    };
    // If MARS framework is enabled, enhance with structured tags
    if (marsFramework) {
      // Add contextual MARS tags based on content analysis
      const enhancedTemplate = this.enhanceWithMarsFramework(naturalTemplate);
      hybrid = enhancedTemplate;
      structure.enhancedTemplate = enhancedTemplate;
    }
    return { hybrid, structure, variables };
  }
  /**
   * Get auto-completion suggestions for MARS tags
   */
  getMarsAutocompletions(context: string, currentInput: string): VariableSuggestion[] {
    const suggestions: VariableSuggestion[] = [];
    // Filter MARS tags based on current input
    const searchTerm = currentInput.toLowerCase();
    const matchingTags = MARS_FRAMEWORK_TAGS.filter(tag => 
      tag.tag.toLowerCase().includes(searchTerm) ||
      tag.description.toLowerCase().includes(searchTerm) ||
      tag.syntax.toLowerCase().includes(searchTerm)
    );
    // Convert MARS tags to variable suggestions
    for (const tag of matchingTags) {
      suggestions.push({
        name: tag.syntax,
        category: 'custom',
        description: `${tag.category.toUpperCase()}: ${tag.description}`,
        examples: tag.examples,
        priority: tag.priority || 5
      });
    }
    return suggestions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  /**
   * Create template pattern library with examples
   */
  getTemplatePatternLibrary(): {
    zada: ZadaTemplateComponent[];
    mars: MarsTag[];
    hybridExamples: string[];
  } {
    const hybridExamples = [
      // Zada + MARS hybrid examples
      '[CAM:WIDE] In {era} during {time_of_day}, !FOCAL:PRIMARY {character} {action_verb} {action_target} [FX:MAGIC] while [MOOD:EPIC] atmosphere fills the scene',
      '[CAM:CLOSE] [SUBJ:HERO] {character_name}, a {character_type} with {character_trait}, !FOCAL:PRIMARY faces {challenge} [FX:FIRE] in [SET:MEDIEVAL] {location}',
      '[CAM:AERIAL] [SET:FANTASY] The scene unfolds in {location_type} where [SUBJ:CROWD] {group} [FX:WEATHER] encounters {obstacle} !FOCAL:SECONDARY while {background_action}',
      '[MOOD:INTIMATE] [CAM:LOW] Driven by {motivation} to {goal}, [SUBJ:HERO] {character} must !FOCAL:PRIMARY {critical_action} despite [FX:PARTICLES] {environmental_challenge}',
      '[SET:SCIFI] [CAM:HIGH] In the {futuristic_setting}, [SUBJ:VILLAIN] {antagonist} !FOCAL:PRIMARY {villainous_action} while [FX:MOTION] {dynamic_element} [MOOD:DARK] threatens everything'
    ];
    return {
      zada: ZADA_SCREENPLAY_TEMPLATES,
      mars: MARS_FRAMEWORK_TAGS,
      hybridExamples
    };
  }
  // Private helper methods
  private sortByDependencies(components: ZadaTemplateComponent[]): ZadaTemplateComponent[] {
    const sorted: ZadaTemplateComponent[] = [];
    const remaining = [...components];
    while (remaining.length > 0) {
      const nextComponent = remaining.find(comp => 
        !comp.dependencies ||
        comp.dependencies.every(dep => sorted.some(s => s.name === dep))
      );
      if (nextComponent) {
        sorted.push(nextComponent);
        remaining.splice(remaining.indexOf(nextComponent), 1);
      } else {
        // If no component can be resolved, add remaining by priority
        remaining.sort((a, b) => b.priority - a.priority);
        sorted.push(...remaining);
        break;
      }
    }
    return sorted;
  }
  private enhanceWithMarsFramework(template: string): string {
    let enhanced = template;
    // Add contextual MARS tags based on content analysis
    if (template.toLowerCase().includes('character') && !template.includes('[SUBJ:')) {
      enhanced = `[SUBJ:HERO] ${enhanced}`;
    }
    if (template.toLowerCase().includes('magic') && !template.includes('[FX:')) {
      enhanced = enhanced.replace(/magic/gi, '[FX:MAGIC] magic');
    }
    if ((template.toLowerCase().includes('medieval') || template.toLowerCase().includes('castle')) && !template.includes('[SET:')) {
      enhanced = `[SET:MEDIEVAL] ${enhanced}`;
    }
    return enhanced;
  }
}

// Export singleton instance and utility functions
export const advancedPromptingMethodology = AdvancedPromptingMethodology.getInstance();

export const generateZadaTemplate = (components: string[]): string =>
  advancedPromptingMethodology.generateZadaTemplate(components);

export const parseMarsFramework = (template: string) =>
  advancedPromptingMethodology.parseMarsFramework(template);

export const createHybridTemplate = (naturalTemplate: string, marsFramework: boolean = false) =>
  advancedPromptingMethodology.createHybridTemplate(naturalTemplate, marsFramework);

export const getMarsAutocompletions = (context: string, currentInput: string): VariableSuggestion[] =>
  advancedPromptingMethodology.getMarsAutocompletions(context, currentInput);

export const getTemplatePatternLibrary = () =>
  advancedPromptingMethodology.getTemplatePatternLibrary();