/**
 * Medieval Demo Database Schema and Content
 * Epic 8.8: Historical Data Integration Foundation
 * 
 * Provides historically accurate medieval content for Wild Construct demo
 */
import {
  UTDGNode,
  MedievalClothing,
  Era,
  HistoricalConstraint,
  HISTORICAL_ERAS,
  SocialClass,
  Variation
} from '../types/UTDG';
/**
 * Medieval-specific content types and constants
 */
export const MEDIEVAL_PERIODS = {
  EARLY_MEDIEVAL: HISTORICAL_ERAS.MEDIEVAL_EARLY,
  HIGH_MEDIEVAL: HISTORICAL_ERAS.MEDIEVAL_HIGH,
  LATE_MEDIEVAL: HISTORICAL_ERAS.MEDIEVAL_LATE,
};
/**
 * Medieval Demo Database
 */
export class MedievalDemoDatabase {
  private static instance: MedievalDemoDatabase;
  private clothingDatabase: MedievalClothing = [];
  private materialDatabase: UTDGNode = [];
  private accessoryDatabase: UTDGNode = [];
  constructor() {
    this.initializeDatabase();
  }

  static getInstance(): MedievalDemoDatabase {
    if (!MedievalDemoDatabase.instance) {
      MedievalDemoDatabase.instance = new MedievalDemoDatabase();
    }
    return MedievalDemoDatabase.instance;
  }

  /**
  * Get clothing items by criteria
  */
  getClothing(criteria: {
    era?: Era;
  social_class?: SocialClass;
  gender?: 'male' | 'female' | 'unisex';
  garment_type?: string;
  ceremonial?: boolean;
} = {}): MedievalClothing {
    return this.clothingDatabase.filter(item => {
      if (criteria.era && !this.eraMatches(item.metadata.era, criteria.era)) {
        return false;
      }
      if (criteria.social_class &&
          (!item.metadata.social_class || !item.metadata.social_class.includes(criteria.social_class))) {
        return false;
      }
      if (criteria.gender && criteria.gender !== 'unisex' &&
          item.metadata.gender && item.metadata.gender !== criteria.gender && item.metadata.gender !== 'unisex') {
        return false;
      }
      if (criteria.garment_type && item.medieval_specific.garment_type !== criteria.garment_type) {
        return false;
      }
      if (criteria.ceremonial !== undefined && item.metadata.ceremonial !== criteria.ceremonial) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get materials by criteria
   */
  getMaterials(criteria: {
    era?: Era;
    fabric_type?: string;
    availability?: 'common' | 'expensive' | 'rare'
  } = {}): UTDGNode {
    return this.materialDatabase.filter(item => {
      if (criteria.era && !this.eraMatches(item.metadata.era, criteria.era)) {
        return false;
      }
      if (criteria.fabric_type && !item.metadata.tags.includes(criteria.fabric_type)) {
        return false;
      }
      return true;
    });
  }
  /**
   * Get accessories by criteria
   */
  getAccessories(criteria: {
    era?: Era;
    social_class?: SocialClass;
    type?: string;
  } = {}): UTDGNode {
    return this.accessoryDatabase.filter(item => {
      if (criteria.era && !this.eraMatches(item.metadata.era, criteria.era)) {
        return false;
      }
      if (criteria.social_class &&
          (!item.metadata.social_class || !item.metadata.social_class.includes(criteria.social_class))) {
        return false;
      }
      return true;
    });
  }
  /**
   * Generate a complete medieval outfit
   */
  generateOutfit(criteria: {
  era: Era;
  social_class: SocialClass;
  gender: 'male' | 'female';
  occasion?: 'daily' | 'ceremonial' | 'work' | 'travel';
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
  }): {
    outfit: (MedievalClothing | UTDGNode)[];
    description: string;
    historical_notes: string;
  } {
    const outfit: (MedievalClothing | UTDGNode)[] = [];
  const historical_notes: string = [];
  // Base layer
    const undergarments = this.getClothing({
      era: criteria.era,
      social_class: criteria.social_class,
      gender: criteria.gender,
    }).filter(item =>
      item.medieval_specific.garment_type === 'chemise' || 
      item.medieval_specific.garment_type === 'braies'
    );
    if (undergarments.length > 0) {
  outfit.push(undergarments[0]);
  historical_notes.push('Medieval people wore linen undergarments for hygiene and warmth');
  // Main garment
    const mainGarments = this.getClothing({
      era: criteria.era,
      social_class: criteria.social_class,
      gender: criteria.gender,
      ceremonial: criteria.occasion === 'ceremonial',
    }).filter(item =>
      item.medieval_specific.garment_type === 'tunic' || 
      item.medieval_specific.garment_type === 'gown'
    );
    if (mainGarments.length > 0) {
      outfit.push(mainGarments[0]);
      if (criteria.social_class === 'noble') {
        historical_notes.push('Noble garments featured fine wool or silk with elaborate decoration');
      } else if (criteria.social_class === 'peasant') {
  historical_notes.push('Peasant clothing was practical, made from coarse wool or hemp');
  // Outer layer for cold weather
  if (criteria.season === 'winter' || criteria.season === 'autumn') {
    const cloaks = this.getClothing({
      era: criteria.era,
      social_class: criteria.social_class,
    }).filter(item => item.medieval_specific.garment_type === 'cloak');
      if (cloaks.length > 0) {
        outfit.push(cloaks[0]);
        historical_notes.push('Cloaks were essential for warmth and weather protection');
      }
      
      // Accessories
    const accessories = this.getAccessories({
      era: criteria.era,
      social_class: criteria.social_class,
    });
    if (accessories.length > 0) {
      outfit.push(accessories[0]);
    }
    
    // Generate description
    const description = this.generateOutfitDescription(outfit, criteria);
    return {
      outfit,
      description,
      historical_notes
    };
  }
  
  /**
   * Initialize the medieval demo database with historically accurate content
   */
  private initializeDatabase(): void {
    this.clothingDatabase = this.createMedievalClothing();
    this.materialDatabase = this.createMedievalMaterials();
    this.accessoryDatabase = this.createMedievalAccessories();
  }
  
  /**
   * Create medieval clothing database
   */
  private createMedievalClothing(): MedievalClothing[] {
    const clothing: MedievalClothing[] = [];
    
    // Peasant Male Tunic
    clothing.push({
      id: 'medieval_peasant_male_tunic_001',
      type: 'garment',
      content: 'A simple woolen tunic reaching to mid-thigh, made of coarse brown wool with minimal decoration. The sleeves are long and loose, practical for farm work.',
      description: 'Basic peasant tunic for daily wear',
      metadata: {
        era: [MEDIEVAL_PERIODS.HIGH_MEDIEVAL],
        authenticity: 0.9,
        source: 'Archaeological evidence from 12th-13th century England',
        tags: ['tunic', 'peasant', 'wool', 'brown', 'daily-wear'],
        social_class: ['peasant'],
        gender: 'male',
        daily_use: true,
        ceremonial: false,
      },
      relationships: {
        compatible: ['medieval_peasant_braies_001', 'medieval_peasant_belt_001'],
        incompatible: ['medieval_noble_silk_001', 'medieval_royal_purple_001'],
        variations: [
          {
            id: 'color_variation_1',
            type: 'color',
            value: 'natural gray wool',
            probability: 0.3,
            era_specific: true,
          },
          {
            id: 'condition_variation_1',
            type: 'condition',
            value: 'patched and mended',
            probability: 0.6,
            era_specific: true
          }
        ]
      },
      constraints: [],
      medieval_specific: {
        garment_type: 'tunic',
        construction_method: 'sewn',
        fabric_type: 'wool',
        dye_availability: 'common',
        seasonal_use: 'all_season',
      }
    });
    
    // Noble Female Gown
    clothing.push({
  id: 'medieval_noble_female_gown_001',
  type: 'garment',
  content: 'An elegant gown of fine blue wool with fitted bodice and flowing skirt reaching to the ankles. Decorated with embroidered trim and silver thread.',
  description: 'Noble lady\'s formal gown',
  metadata: {
  era: [MEDIEVAL_PERIODS.HIGH_MEDIEVAL, MEDIEVAL_PERIODS.LATE_MEDIEVAL],
  authenticity: 0.95,
  source: 'Court records and artistic depictions, 13th-14th century',
  tags: ['gown', 'noble', 'wool', 'blue', 'embroidered', 'formal'],
  social_class: ['noble'],
  gender: 'female',
  daily_use: false,
  ceremonial: true,
},
  relationships: {
  compatible: ['medieval_noble_chemise_001', 'medieval_noble_belt_gold_001'],
  incompatible: ['medieval_peasant_tunic_001'],
  variations: [,
  {
  id: 'fabric_variation_1',
  type: 'texture',
  value: 'silk imported from Byzantine',
  probability: 0.2,
  era_specific: true];
  },
  constraints: [],
      medieval_specific: {
  garment_type: 'gown',
  construction_method: 'sewn',
  fabric_type: 'wool',
  dye_availability: 'expensive',
  seasonal_use: 'all_season',
  ceremonial_context: 'court',
});
    // Monk's Robe
    clothing.push({)
  id: 'medieval_monk_robe_001',
  type: 'garment',
  content: 'A simple brown woolen robe with wide sleeves and a rope belt. The fabric is rough and undyed, symbolizing humility and poverty.',
  description: 'Benedictine monk\'s habit',
  metadata: {
  era: [MEDIEVAL_PERIODS.HIGH_MEDIEVAL],
  authenticity: 0.98,
  source: 'Monastic rules and surviving garments',
  tags: ['robe', 'religious', 'wool', 'brown', 'simple', 'monastic'],
  social_class: ['clergy'],
  gender: 'male',
  daily_use: true,
  ceremonial: true,
  occupation: ['monk', 'clergy'],
},
  relationships: {
  compatible: ['medieval_rope_belt_001'],
  incompatible: ['medieval_noble_silk_001', 'medieval_bright_colors_001'],
  variations: [],
},
  constraints: [],
      medieval_specific: {
  garment_type: 'gown',
  construction_method: 'sewn',
  fabric_type: 'wool',
  dye_availability: 'impossible',
  seasonal_use: 'all_season',
  ceremonial_context: 'religious',
    });
    
    return clothing;
  }
  
  /**
   * Create medieval materials database
   */
  private createMedievalMaterials(): UTDGNode[] {
    const materials: UTDGNode[] = [];
    
    // Wool Material
    materials.push({
  id: 'medieval_wool_material_001',
  type: 'material',
  content: 'Coarse woolen cloth woven from sheep\'s wool, the most common fabric in medieval Europe. Available in natural colors and dyed with local plants.',
  description: 'Basic wool fabric for medieval clothing',
  metadata: {
  era: [MEDIEVAL_PERIODS.EARLY_MEDIEVAL, MEDIEVAL_PERIODS.HIGH_MEDIEVAL, MEDIEVAL_PERIODS.LATE_MEDIEVAL],
  authenticity: 0.95,
  source: 'Archaeological textile remains and historical records',
  tags: ['wool', 'fabric', 'common', 'sheep', 'woven'],
  social_class: ['peasant', 'artisan', 'merchant', 'noble'],
},
  relationships: {
  compatible: ['medieval_natural_dyes_001', 'medieval_linen_001'],
  incompatible: ['modern_synthetic_001'],
  variations: [,
  {
  id: 'quality_variation_1',
  type: 'quality',
  value: 'fine wool for nobles',
  probability: 0.2,
  era_specific: true,
  social_class: ['noble'],
}
          {
  id: 'quality_variation_2',
  type: 'quality',
  value: 'coarse wool for peasants',
  probability: 0.6,
  era_specific: true,
  social_class: ['peasant']];
  },
  constraints: [];
  });
    // Linen Material
    materials.push({)
  id: 'medieval_linen_material_001',
  type: 'material',
  content: 'Fine linen cloth woven from flax fibers, prized for undergarments and shirts. Naturally white or cream colored, sometimes bleached.',
  description: 'Linen fabric for medieval undergarments',
  metadata: {
  era: [MEDIEVAL_PERIODS.HIGH_MEDIEVAL, MEDIEVAL_PERIODS.LATE_MEDIEVAL],
  authenticity: 0.92,
  source: 'Textile archaeological evidence',
  tags: ['linen', 'flax', 'white', 'undergarment', 'hygiene'],
  social_class: ['artisan', 'merchant', 'noble', 'clergy'],
},
  relationships: {
  compatible: ['medieval_wool_001', 'medieval_chemise_001'],
  incompatible: ['medieval_peasant_only_001'],
  variations: [],
},
  constraints: [];
  });
    return materials;
  /**
   * Create medieval accessories database
   */
  private createMedievalAccessories(): UTDGNode {
  const accessories: UTDGNode = [];
  // Leather Belt
  accessories.push({)
  id: 'medieval_leather_belt_001',
  type: 'accessory',
  content: 'A sturdy leather belt with an iron buckle, used to cinch tunics and carry pouches or tools.',
  description: 'Basic leather belt for medieval clothing',
  metadata: {
  era: [MEDIEVAL_PERIODS.HIGH_MEDIEVAL, MEDIEVAL_PERIODS.LATE_MEDIEVAL],
  authenticity: 0.9,
  source: 'Archaeological finds and artistic depictions',
  tags: ['belt', 'leather', 'iron', 'practical'],
  social_class: ['peasant', 'artisan', 'merchant', 'noble'],
},
  relationships: {
  compatible: ['medieval_tunic_001', 'medieval_gown_001'],
  incompatible: [],
  variations: [,
  {
  id: 'buckle_variation_1',
  type: 'decoration',
  value: 'bronze buckle with decoration',
  probability: 0.3,
  social_class: ['merchant', 'noble']]
},
  constraints: [];
  });
    return accessories;
  /**
   * Check if era matches criteria
   */
  private eraMatches(itemEras: Era, targetEra: Era): boolean {
  return itemEras.some(era => )
  era.name === targetEra.name ||
  (era.period.start <= targetEra.period.end && era.period.end >= targetEra.period.start)
  );
  /**
  * Generate outfit description
  */
  private generateOutfitDescription(()
  outfit: (MedievalClothing | UTDGNode)[],
  criteria: any): string {,
  const garmentNames = outfit.map(item => {)
  if ('medieval_specific' in item) {
  return item.medieval_specific.garment_type;
  return item.type;
});
    const socialClass = criteria.social_class;
    const gender = criteria.gender;
    const era = criteria.era.name;
    return `A ${era} ${gender} ${socialClass} wearing ${garmentNames.join(', ')}. ` +}
           'This outfit reflects the social status, practical needs, and fashion conventions of the period.';
/**
 * Medieval historical constraints specific to the demo
 */
export const MEDIEVAL_DEMO_CONSTRAINTS = [
  {
    id: 'medieval-clothing-accuracy',
    rule: 'era_compatibility',
    eras: [,
      { name: 'High Medieval', period: { start: 1000, end: 1300 }, region: ['Europe'], accuracy: 'high' as const },
      { name: 'Late Medieval', period: { start: 1300, end: 1500 }, region: ['Europe'], accuracy: 'high' as const }
    ],
    enforcement: 'strict' as const,
    message: 'Clothing items should match medieval period accuracy',
    historical_basis: 'Medieval clothing was highly regulated by sumptuary laws and social class distinctions';
  }
  {
    id: 'medieval-material-availability',
    rule: 'material_availability',
    eras: [,
      { name: 'Medieval Period', period: { start: 1000, end: 1500 }, region: ['Europe'], accuracy: 'high' as const }
    ],
    enforcement: 'warning' as const,
    message: 'Some materials may have been rare or unavailable in medieval Europe',
    historical_basis: 'Trade routes and material availability varied significantly in medieval times';
  }
  {
    id: 'social-class-restrictions',
    rule: 'social_class_appropriateness',
    eras: [,
      { name: 'Medieval Period', period: { start: 1000, end: 1500 }, region: ['Europe'], accuracy: 'high' as const }
    ],
    social_classes: ['peasant', 'artisan', 'merchant', 'noble'] as const,
    enforcement: 'suggestion' as const,
    message: 'Consider social class appropriateness for clothing and accessories',
    historical_basis: 'Medieval society had strict hierarchies reflected in clothing and possessions'];

export default MedievalDemoDatabase;