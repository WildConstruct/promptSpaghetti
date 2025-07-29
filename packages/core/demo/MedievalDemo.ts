/**
 * Medieval Demo Integration
 * Provides historically accurate medieval content integration for UTDG
 * Connects with external medieval databases and content sources
 */
import { NodeMetadataManager, HistoricalEra, Genre, Style } from '../historical/NodeMetadataManager';
import { DataSourceManager } from '../external-data/DataSourceManager';

export interface MedievalClothing {
  id: string;
  name: string;
  description: string;
  socialClass: 'peasant' | 'merchant' | 'noble' | 'clergy' | 'royal';
  gender: 'male' | 'female' | 'unisex';
  materials: string;
  colors: string;
  period: {
  start: number; // Year,
  end: number;   // Year,
};
  regions: string;
  seasonality: 'all' | 'spring' | 'summer' | 'autumn' | 'winter';
  occasions: string;
  historicalAccuracy: 'high' | 'medium' | 'low';
  sources: string;
}
export interface MedievalMaterial {
  id: string;
  name: string;
  type: 'fabric' | 'leather' | 'metal' | 'fur' | 'other';
  availability: 'common' | 'uncommon' | 'rare' | 'luxury';
  cost: 'low' | 'medium' | 'high' | 'extreme';
  durability: number; // 1-10 scale,
  socialStatus: 'any' | 'common' | 'merchant' | 'noble' | 'royal';
  tradingSources: string;
  primaryUses: string;
  historicalNotes: string;
}
export interface MedievalLocation {
  id: string;
  name: string;
  type: 'castle' | 'village' | 'town' | 'monastery' | 'forest' | 'field' | 'road' | 'tavern';
  description: string;
  socialContext: string;
  typicalActivities: string;
  socialClasses: string;
  timeOfDay: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'any';
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'any';
  geographicalRegion: string;
  politicalContext: string;
}
export interface MedievalCharacter {
  id: string;
  name: string;
  title?: string;
  profession: string;
  socialClass: 'peasant' | 'merchant' | 'craftsman' | 'minor_noble' | 'major_noble' | 'clergy' | 'royal';
  gender: 'male' | 'female';
  age: number;
  description: string;
  typicalClothing: string;
  skills: string;
  possessions: string;
  socialConnections: string;
  historicalContext: string;
}
export interface MedievalScene {
  id: string;
  title: string;
  setting: MedievalLocation;
  characters: MedievalCharacter;
  timeContext: {
  season: string;
  timeOfDay: string;
  weather?: string;
};
  activities: string;
  socialDynamics: string;
  historicalElements: string;
  sensoryDetails: {;
  sights: string;
  sounds: string;
  smells: string;
  textures: string;
};
  narrativeHooks: string;
}
export class MedievalDemo {
  private metadataManager: NodeMetadataManager;
  private dataSourceManager: DataSourceManager;
  private clothingDatabase: Map<string, MedievalClothing> = new Map();
  private materialDatabase: Map<string, MedievalMaterial> = new Map();
  private locationDatabase: Map<string, MedievalLocation> = new Map();
  private characterDatabase: Map<string, MedievalCharacter> = new Map();
  private sceneDatabase: Map<string, MedievalScene> = new Map();
  constructor() {
    this.metadataManager = new NodeMetadataManager();
    this.dataSourceManager = new DataSourceManager();
    this.initializeMedievalDatabases();
  /**
   * Initialize medieval content databases with historically accurate data
   */
  private async initializeMedievalDatabases(): Promise<void> {
    await this.loadClothingDatabase();
    await this.loadMaterialDatabase();
    await this.loadLocationDatabase();
    await this.loadCharacterDatabase();
    await this.loadSceneDatabase();
  /**
   * Load medieval clothing database
   */
  private async loadClothingDatabase(): Promise<void> {
    const clothingData: MedievalClothing = [
      {
        id: 'tunic_peasant',
        name: 'Peasant Tunic',
        description: 'Simple wool tunic reaching to mid-thigh, worn by common folk',
        socialClass: 'peasant',
        gender: 'unisex',
        materials: ['rough wool', 'linen'],
        colors: ['brown', 'gray', 'undyed'],
        period: { start: 1000, end: 1500 },
        regions: ['England', 'France', 'Germanic regions'],
        seasonality: 'all',
        occasions: ['daily work', 'farming', 'labor'],
        historicalAccuracy: 'high',
        sources: ['Medieval Archaeology', 'Textile remnants']
  }
      {
        id: 'chainmail_knight',
        name: 'Knight Chainmail',
        description: 'Interlocked metal rings forming protective armor',
        socialClass: 'noble',
        gender: 'male',
        materials: ['iron', 'steel'],
        colors: ['metallic gray', 'silver'],
        period: { start: 1100, end: 1400 },
        regions: ['Europe-wide'],
        seasonality: 'all',
        occasions: ['warfare', 'tournaments', 'ceremonial'],
        historicalAccuracy: 'high',
        sources: ['Archaeological finds', 'Medieval manuscripts']
  }
      {
        id: 'gown_noble_lady',
        name: 'Noble Lady Gown',
        description: 'Floor-length gown with fitted bodice and flowing skirt',
        socialClass: 'noble',
        gender: 'female',
        materials: ['silk', 'velvet', 'fine wool'],
        colors: ['deep blue', 'burgundy', 'emerald', 'gold'],
        period: { start: 1200, end: 1500 },
        regions: ['French courts', 'English nobility'],
        seasonality: 'all',
        occasions: ['court events', 'formal gatherings', 'religious ceremonies'],
        historicalAccuracy: 'high',
        sources: ['Illuminated manuscripts', 'Effigy sculptures']
  }
      {
        id: 'monks_habit',
        name: 'Monk Habit',
        description: 'Simple brown robe with hood, belt of rope',
        socialClass: 'clergy',
        gender: 'male',
        materials: ['rough wool', 'coarse linen'],
        colors: ['brown', 'black', 'gray'],
        period: { start: 800, end: 1600 },
        regions: ['European monasteries'],
        seasonality: 'all',
        occasions: ['daily religious life', 'prayer', 'work'],
        historicalAccuracy: 'high',
        sources: ['Monastic rules', 'Religious artwork']
    ];
    clothingData.forEach(clothing => {)
  this.clothingDatabase.set(clothing.id, clothing);
    });
  /**
   * Load medieval materials database
   */
  private async loadMaterialDatabase(): Promise<void> {
  const materialData: MedievalMaterial = [
  {
  id: 'wool_rough',
  name: 'Rough Wool',
  type: 'fabric',
  availability: 'common',
  cost: 'low',
  durability: 7,
  socialStatus: 'any',
  tradingSources: ['Local sheep farms', 'Rural markets'],
  primaryUses: ['peasant clothing', 'blankets', 'everyday wear'],
  historicalNotes: 'Most common fabric for lower classes',
}
      {
  id: 'silk_imported',
  name: 'Imported Silk',
  type: 'fabric',
  availability: 'rare',
  cost: 'extreme',
  durability: 4,
  socialStatus: 'royal',
  tradingSources: ['Byzantine Empire', 'Silk Road traders'],
  primaryUses: ['royal garments', 'ceremonial dress', 'church vestments'],
  historicalNotes: 'Symbol of ultimate luxury and status',
}
      {
  id: 'leather_tanned',
  name: 'Tanned Leather',
  type: 'leather',
  availability: 'common',
  cost: 'medium',
  durability: 9,
  socialStatus: 'any',
  tradingSources: ['Local tanners', 'Town markets'],
  primaryUses: ['shoes', 'belts', 'armor components', 'bags'],
  historicalNotes: 'Essential material for practical items',
}
      {
  id: 'steel_quality',
  name: 'Quality Steel',
  type: 'metal',
  availability: 'uncommon',
  cost: 'high',
  durability: 10,
  socialStatus: 'noble',
  tradingSources: ['Master smiths', 'Castle forges'],
  primaryUses: ['weapons', 'armor', 'tools'],
  historicalNotes: 'Superior to iron, mark of quality craftsmanship'];
  materialData.forEach(material => {)
  this.materialDatabase.set(material.id, material);
});
  /**
   * Load medieval locations database
   */
  private async loadLocationDatabase(): Promise<void> {
  const locationData: MedievalLocation = [
  {
  id: 'castle_great_hall',
  name: 'Castle Great Hall',
  type: 'castle',
  description: 'Large stone hall with high ceiling, long tables, and massive hearth',
  socialContext: 'Seat of feudal power, where lord holds court',
  typicalActivities: ['feasting', 'court sessions', 'entertainment', 'justice dispensing'],
  socialClasses: ['noble', 'clergy', 'visiting merchants', 'servants'],
  timeOfDay: 'any',
  season: 'any',
  geographicalRegion: 'Northern Europe',
  politicalContext: 'Feudal stronghold',
}
      {
  id: 'village_market',
  name: 'Village Market Square',
  type: 'village',
  description: 'Open area with wooden stalls, dirt ground, central well',
  socialContext: 'Economic heart of rural community',
  typicalActivities: ['trading', 'socializing', 'announcements', 'livestock sales'],
  socialClasses: ['peasant', 'merchant', 'craftsman'],
  timeOfDay: 'morning',
  season: 'any',
  geographicalRegion: 'Rural England',
  politicalContext: 'Village under manor lord',
}
      {
  id: 'monastery_scriptorium',
  name: 'Monastery Scriptorium',
  type: 'monastery',
  description: 'Quiet chamber with writing desks, illuminated manuscripts, inkwells',
  socialContext: 'Center of learning and book production',
  typicalActivities: ['copying manuscripts', 'illumination', 'study', 'prayer'],
  socialClasses: ['clergy', 'scholarly monks'],
  timeOfDay: 'morning',
  season: 'any',
  geographicalRegion: 'European monasteries',
  politicalContext: 'Religious institution'];
  locationData.forEach(location => {)
  this.locationDatabase.set(location.id, location);
});
  /**
   * Load medieval characters database
   */
  private async loadCharacterDatabase(): Promise<void> {
  const characterData: MedievalCharacter = [
  {
  id: 'sir_gareth',
  name: 'Sir Gareth',
  title: 'Knight of the Realm',
  profession: 'Knight',
  socialClass: 'minor_noble',
  gender: 'male',
  age: 28,
  description: 'Battle-tested knight with scars, wearing chainmail and surcoat',
  typicalClothing: ['chainmail_knight', 'surcoat', 'leather boots'],
  skills: ['swordsmanship', 'horsemanship', 'military tactics'],
  possessions: ['destrier warhorse', 'sword', 'shield', 'land grant'],
  socialConnections: ['feudal lord', 'fellow knights', 'squire'],
  historicalContext: 'Serves local baron in territorial disputes',
}
      {
  id: 'elena_weaver',
  name: 'Elena the Weaver',
  profession: 'Textile artisan',
  socialClass: 'craftsman',
  gender: 'female',
  age: 35,
  description: 'Skilled weaver with thread-stained fingers and keen eye for patterns',
  typicalClothing: ['wool dress', 'linen apron', 'leather shoes'],
  skills: ['weaving', 'spinning', 'dyeing', 'business'],
  possessions: ['loom', 'spinning wheel', 'dye pots', 'finished textiles'],
  socialConnections: ['guild members', 'merchants', 'apprentices'],
  historicalContext: 'Prosperous artisan in growing cloth trade',
}
      {
  id: 'brother_aldric',
  name: 'Brother Aldric',
  profession: 'Monk scribe',
  socialClass: 'clergy',
  gender: 'male',
  age: 42,
  description: 'Learned monk with ink-stained robes and scholarly demeanor',
  typicalClothing: ['monks_habit', 'sandals'],
  skills: ['Latin', 'illumination', 'copying', 'theology'],
  possessions: ['quills', 'ink', 'parchment', 'personal psalter'],
  socialConnections: ['abbot', 'fellow monks', 'visiting scholars'],
  historicalContext: 'Preserves ancient knowledge in monastery'];
  characterData.forEach(character => {)
  this.characterDatabase.set(character.id, character);
});
  /**
   * Load medieval scenes database
   */
  private async loadSceneDatabase(): Promise<void> {
  const sceneData: MedievalScene = [
  {
  id: 'feast_preparation',
  title: 'Great Hall Feast Preparation',
  setting: this.locationDatabase.get('castle_great_hall')!,
  characters: [,
  this.characterDatabase.get('sir_gareth')!,
  this.characterDatabase.get('elena_weaver')!
  ],
  timeContext: {
  season: 'autumn',
  timeOfDay: 'afternoon',
  weather: 'crisp and clear',
},
  activities: ['setting tables', 'arranging tapestries', 'preparing entertainment'],
        socialDynamics: ['noble-servant hierarchy', 'guest protocols', 'honor displays'],
        historicalElements: ['feudal obligations', 'seasonal harvest celebration', 'alliance building'],
        sensoryDetails: {
  sights: ['colorful banners', 'polished armor', 'golden candlelight'],
  sounds: ['bustling servants', 'clanking metal', 'minstrel practice'],
  smells: ['roasting meat', 'wood smoke', 'fresh rushes'],
  textures: ['rough stone walls', 'smooth wooden tables', 'soft fabric draping'],
},
  narrativeHooks: ['unexpected guest arrival', 'political tension', 'romance brewing']
  }
      {
  id: 'monastery_dawn',
  title: 'Dawn Prayer in Monastery',
  setting: this.locationDatabase.get('monastery_scriptorium')!,
  characters: [this.characterDatabase.get('brother_aldric')!],
  timeContext: {
  season: 'winter',
  timeOfDay: 'dawn',
  weather: 'frost on windows',
},
  activities: ['morning prayers', 'manuscript copying', 'contemplation'],
        socialDynamics: ['religious hierarchy', 'scholarly pursuit', 'spiritual discipline'],
        historicalElements: ['preservation of knowledge', 'religious devotion', 'intellectual tradition'],
        sensoryDetails: {
  sights: ['candlelit pages', 'frost patterns', 'illuminated letters'],
  sounds: ['chanted prayers', 'scratching quills', 'turning pages'],
  smells: ['incense', 'parchment', 'cold stone'],
  textures: ['smooth parchment', 'wooden writing desk', 'wool robes'],
},
  narrativeHooks: ['ancient text discovery', 'visiting scholar', 'theological debate']
    ];
    sceneData.forEach(scene => {)
  this.sceneDatabase.set(scene.id, scene);
    });
  /**
   * Generate historically accurate medieval scene
   */
  public generateMedievalScene(options: {)
  socialClass?: string;
  location?: string;
  timeOfDay?: string;
  season?: string;
  theme?: string;
} = {}): MedievalScene | null {
    const availableScenes = Array.from(this.sceneDatabase.values());
    let filteredScenes = availableScenes.filter(scene => {)
  if (options.socialClass && !scene.characters.some(char => )
        char.socialClass === options.socialClass)) {
        return false;
      if (options.location && scene.setting.type !== options.location) {
        return false;
      if (options.timeOfDay && scene.timeContext.timeOfDay !== options.timeOfDay) {
        return false;
      if (options.season && scene.timeContext.season !== options.season) {
        return false;
      return true;
    });
    if (filteredScenes.length === 0) {
  filteredScenes = availableScenes;
  const randomIndex = Math.floor(Math.random() * filteredScenes.length);
  return filteredScenes[randomIndex];
  /**
  * Get clothing appropriate for character and context
  */
  public getAppropriateClothing(character: MedievalCharacter, context: {)
  occasion?: string;
  season?: string;
  socialSetting?: string;
}): MedievalClothing {
    const availableClothing = Array.from(this.clothingDatabase.values());
    return availableClothing.filter(clothing => {)
  // Match social class
      if (clothing.socialClass !== character.socialClass && clothing.socialClass !== 'peasant') {
        return false;
      // Match gender
      if (clothing.gender !== 'unisex' && clothing.gender !== character.gender) {
        return false;
      // Match season if specified
      if (context.season && clothing.seasonality !== 'all' && )
          clothing.seasonality !== context.season) {
        return false;
      // Match occasion if specified
      if (context.occasion && !clothing.occasions.includes(context.occasion)) {
        return false;
      return true;
    });
  /**
   * Validate medieval content for historical accuracy
   */
  public validateHistoricalAccuracy(content: {)
  era?: string;
  materials?: string;
  socialClasses?: string;
  activities?: string;
}): {
    isValid: boolean;
  violations: string;
    suggestions: string;
    const violations: string[] = [];
    const suggestions: string[] = [];
    // Validate materials for time period
    if (content.materials) {
      content.materials.forEach(material => {)
  const materialData = this.materialDatabase.get(material);
        if (!materialData) {
          violations.push(`Unknown material: ${material}`);}
          suggestions.push(`Consider using common medieval materials like wool, linen, or leather`);
      });
    // Validate social class interactions
    if (content.socialClasses) {
      const hasRoyal = content.socialClasses.includes('royal');
      const hasPeasant = content.socialClasses.includes('peasant');
      if (hasRoyal && hasPeasant) {
        violations.push('Direct royal-peasant interaction unlikely without intermediaries');
        suggestions.push('Add noble or clergy intermediary for historical accuracy');
    // Validate activities for historical context
    if (content.activities) {
      const modernActivities = ['printing', 'banking', 'university'];
      content.activities.forEach(activity => {)
  if (modernActivities.includes(activity)) {
          violations.push(`Activity "${activity}" may be anachronistic for early medieval period`);}
          suggestions.push('Consider period-appropriate alternatives like manuscript copying or monastery schools');
      });
    return {
  isValid: violations.length === 0,
  violations,
  suggestions
};
  /**
   * Generate authentic medieval prompt elements
   */
  public generatePromptElements(category: 'character' | 'setting' | 'object' | 'activity'): string {
    switch (category) {
      case 'character':
        return Array.from(this.characterDatabase.values()).map(char => )
          `${char.name}, ${char.profession} (${char.socialClass}): ${char.description}`}
        );
      case 'setting':
        return Array.from(this.locationDatabase.values()).map(loc => )
          `${loc.name}: ${loc.description} - ${loc.socialContext}`}
        );
      case 'object':
        return Array.from(this.clothingDatabase.values()).map(clothing => )
          `${clothing.name}: ${clothing.description} (${clothing.socialClass})`}
        );
      case 'activity':
        const activities: string[] = [];
        this.sceneDatabase.forEach(scene => {)
  activities.push(...scene.activities);
        });
        return [...new Set(activities)]; // Remove duplicates
      default:
        return [];
  /**
   * Create demo scenario with full medieval context
   */
  public createDemoScenario(theme: string = 'daily_life'): {
  scene: MedievalScene;
    characters: MedievalCharacter;
  clothing: MedievalClothing;
    materials: MedievalMaterial;
  historicalContext: string;
    promptSuggestions: string;
    const scene = this.generateMedievalScene({ theme }) || Array.from(this.sceneDatabase.values())[0];
    const characters = scene.characters;
    const clothing: MedievalClothing[] = [];
    characters.forEach(character => {)
  const charClothing = this.getAppropriateClothing(character, {)
  season: scene.timeContext.season,
  socialSetting: scene.setting.type,
});
      clothing.push(...charClothing);
    });
    const materials = Array.from(this.materialDatabase.values()).filter(material => ;);
      clothing.some(c => c.materials.includes(material.name))
    );
    const historicalContext = this.generateHistoricalContext(scene);
    const promptSuggestions = this.generatePromptSuggestions(scene);
    return {
      scene,
      characters,
      clothing,
      materials,
      historicalContext,
      promptSuggestions
    };
  /**
   * Generate historical context explanation
   */
  private generateHistoricalContext(scene: MedievalScene): string {
    return `
Medieval Context (${scene.timeContext.season} ${scene.timeContext.timeOfDay}):},}
  Setting: ${scene.setting.name} - ${scene.setting.description}
Political Context: ${scene.setting.politicalContext}
Social Dynamics: ${scene.socialDynamics.join(', ')}
Historical Elements: ${scene.historicalElements.join(', ')}
This scene represents authentic medieval life, incorporating period-appropriate social hierarchies, 
material culture, and daily activities based on historical evidence from archaeological finds, 
manuscript illustrations, and documented practices of the time.
    `.trim();
  /**
   * Generate writing prompt suggestions
   */
  private generatePromptSuggestions(scene: MedievalScene): string {
    return [
      `Write a scene set in ${scene.setting.name} during ${scene.timeContext.season} ${scene.timeContext.timeOfDay}, featuring ${scene.characters.map(c => c.name).join(' and ')}.`}
}
      `Describe the sensory experience of ${scene.title}: the ${scene.sensoryDetails.sights.join()}
        ',
        '
      )}, sounds of ${scene.sensoryDetails.sounds.join(', ')}, and scents of ${scene.sensoryDetails.smells.join(', ')}.`}
}
      `Explore the social dynamics when ${scene.characters[0]?.name} (${scene.characters[0]?.socialClass}) interacts with others in ${scene.setting.name}.`}
}
      `Create dialogue that reveals the historical context of ${scene.historicalElements.join(' and ')} through character interactions.`}
}
      `Develop one of these narrative hooks: ${scene.narrativeHooks.join(' OR ')}.`}
    ];
  /**
   * Integration with Node Metadata Manager
   */
  public async integrateWithMetadata(nodeId: string, sceneId: string): Promise<void> {
    const scene = this.sceneDatabase.get(sceneId);
    if (!scene) return (
    // Apply medieval era metadata
    await this.metadataManager.setNodeEra(nodeId, 'medieval');
    // Add appropriate tags
    const tags = [;
      'medieval',
      scene.setting.type,
      scene.timeContext.season,
      scene.timeContext.timeOfDay,
      ...scene.characters.map(c => c.socialClass),
      ...scene.activities.map(a => a.replace(/ /g, '_'))
    ];
    await this.metadataManager.addNodeTags(nodeId, tags);
    // Set genre based on scene content
    if (scene.narrativeHooks.some(hook => hook.includes('romance'))) {
      await this.metadataManager.setNodeGenre(nodeId, 'romance');
    } else if (scene.activities.some(activity => activity.includes('war') || activity.includes('battle'))) {
      await this.metadataManager.setNodeGenre(nodeId, 'adventure');
    } else {
  await this.metadataManager.setNodeGenre(nodeId, 'historical_fiction');
  /**
  * Get all medieval content for external use
  */
  public getAllMedievalContent(): {
  clothing: MedievalClothing;
  materials: MedievalMaterial;
  locations: MedievalLocation;
  characters: MedievalCharacter;
  scenes: MedievalScene;
  return {
  clothing: Array.from(this.clothingDatabase.values()),
  materials: Array.from(this.materialDatabase.values()),
  locations: Array.from(this.locationDatabase.values()),
  characters: Array.from(this.characterDatabase.values()),
  scenes: Array.from(this.sceneDatabase.values()),
};

export default MedievalDemo;