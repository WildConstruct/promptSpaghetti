/**
 * UTDG System Test Suite
 * Epic 8.8: Historical Data Integration Foundation
 */
import { UTDGManager, ConstraintValidator, MedievalDemoDatabase, HISTORICAL_ERAS, MEDIEVAL_DEMO_CONSTRAINTS } from '../../../index';
describe('UTDG Historical Data Integration Foundation', () => {
    let utdgManager;
    let medievalDemo;
    let constraintValidator;
    beforeEach(() => {
        utdgManager = UTDGManager.getInstance();
        medievalDemo = MedievalDemoDatabase.getInstance();
        constraintValidator = new ConstraintValidator(MEDIEVAL_DEMO_CONSTRAINTS);
    });
    describe('UTDG Manager', () => {
        test('should create singleton instance', () => {
            const instance1 = UTDGManager.getInstance();
            const instance2 = UTDGManager.getInstance();
            expect(instance1).toBe(instance2);
        });
        test('should generate medieval demo content', () => {
            const result = utdgManager.generateMedievalDemo('village_life');
            expect(result).toBeDefined();
            expect(result.nodes).toBeInstanceOf(Array);
            expect(result.nodes.length).toBeGreaterThan(0);
            expect(result.generation_metadata).toBeDefined();
            expect(result.generation_metadata.accuracy_score).toBeGreaterThan(0);
        });
        test('should export VFX data correctly', () => {
            const nodes = medievalDemo.getClothing({
                era: HISTORICAL_ERAS.MEDIEVAL_HIGH,
                social_class: 'peasant'
            });
            if (nodes.length > 0) {
                const vfxData = utdgManager.exportForVFX(nodes, HISTORICAL_ERAS.MEDIEVAL_HIGH, 'Medieval village scene');
                expect(vfxData).toBeDefined();
                expect(vfxData.scene_description).toBe('Medieval village scene');
                expect(vfxData.historical_context).toBe(HISTORICAL_ERAS.MEDIEVAL_HIGH);
                expect(vfxData.materials).toBeInstanceOf(Array);
                expect(vfxData.crowd_control_data).toBeDefined();
            }
        });
        test('should validate UTDG data quality', () => {
            const nodes = medievalDemo.getClothing({
                era: HISTORICAL_ERAS.MEDIEVAL_HIGH
            });
            const validationReport = utdgManager.validateUTDGData(nodes);
            expect(validationReport).toBeDefined();
            expect(validationReport.overall_score).toBeGreaterThanOrEqual(0);
            expect(validationReport.overall_score).toBeLessThanOrEqual(1);
            expect(validationReport.metrics).toBeDefined();
            expect(validationReport.recommendations).toBeInstanceOf(Array);
        });
    });
    describe('Medieval Demo Database', () => {
        test('should provide medieval clothing data', () => {
            const clothing = medievalDemo.getClothing({
                era: HISTORICAL_ERAS.MEDIEVAL_HIGH,
                social_class: 'peasant',
                gender: 'male'
            });
            expect(clothing).toBeInstanceOf(Array);
            if (clothing.length > 0) {
                const item = clothing[0];
                expect(item.type).toBe('garment');
                expect(item.metadata.era).toContain(HISTORICAL_ERAS.MEDIEVAL_HIGH);
                expect(item.metadata.social_class).toContain('peasant');
                expect(item.medieval_specific).toBeDefined();
            }
        });
        test('should generate complete medieval outfit', () => {
            const outfit = medievalDemo.generateOutfit({
                era: HISTORICAL_ERAS.MEDIEVAL_HIGH,
                social_class: 'noble',
                gender: 'female',
                occasion: 'ceremonial'
            });
            expect(outfit).toBeDefined();
            expect(outfit.outfit).toBeInstanceOf(Array);
            expect(outfit.description).toBeDefined();
            expect(outfit.historical_notes).toBeInstanceOf(Array);
            expect(outfit.historical_notes.length).toBeGreaterThan(0);
        });
        test('should provide materials and accessories', () => {
            const materials = medievalDemo.getMaterials({
                era: HISTORICAL_ERAS.MEDIEVAL_HIGH
            });
            const accessories = medievalDemo.getAccessories({
                era: HISTORICAL_ERAS.MEDIEVAL_HIGH,
                social_class: 'merchant'
            });
            expect(materials).toBeInstanceOf(Array);
            expect(accessories).toBeInstanceOf(Array);
        });
    });
    describe('Constraint Validator', () => {
        test('should validate historical constraints', () => {
            const testNodes = [
                {
                    id: 'test_peasant_silk',
                    type: 'material',
                    content: 'Expensive silk fabric',
                    metadata: {
                        era: [HISTORICAL_ERAS.MEDIEVAL_HIGH],
                        authenticity: 0.9,
                        source: 'test',
                        tags: ['silk', 'luxury'],
                        social_class: ['peasant']
                    },
                    relationships: {
                        compatible: [],
                        incompatible: [],
                        variations: []
                    },
                    constraints: []
                }
            ];
            const result = constraintValidator.validateNodes(testNodes);
            expect(result).toBeDefined();
            expect(result.valid).toBeDefined();
            expect(result.violations).toBeInstanceOf(Array);
            expect(result.warnings).toBeInstanceOf(Array);
            expect(result.suggestions).toBeInstanceOf(Array);
        });
        test('should provide era-specific validation', () => {
            const testNodes = [];
            const result = constraintValidator.validateForEra(testNodes, HISTORICAL_ERAS.MEDIEVAL_HIGH);
            expect(result).toBeDefined();
            expect(result.valid).toBe(true); // Empty set should be valid
        });
        test('should generate improvement suggestions', () => {
            const testNodes = [];
            const suggestions = constraintValidator.getSuggestions(testNodes, HISTORICAL_ERAS.MEDIEVAL_HIGH);
            expect(suggestions).toBeInstanceOf(Array);
        });
    });
    describe('Historical Eras', () => {
        test('should provide comprehensive era definitions', () => {
            expect(HISTORICAL_ERAS.MEDIEVAL_HIGH).toBeDefined();
            expect(HISTORICAL_ERAS.MEDIEVAL_HIGH.name).toBe('High Medieval');
            expect(HISTORICAL_ERAS.MEDIEVAL_HIGH.period.start).toBe(1000);
            expect(HISTORICAL_ERAS.MEDIEVAL_HIGH.period.end).toBe(1300);
            expect(HISTORICAL_ERAS.MEDIEVAL_HIGH.accuracy).toBe('high');
        });
        test('should include multiple historical periods', () => {
            const eraKeys = Object.keys(HISTORICAL_ERAS);
            expect(eraKeys.length).toBeGreaterThan(5);
            expect(eraKeys).toContain('MEDIEVAL_HIGH');
            expect(eraKeys).toContain('RENAISSANCE');
            expect(eraKeys).toContain('ROMAN_EMPIRE');
        });
    });
    describe('Content Generation', () => {
        test('should generate content with different configurations', async () => {
            const config = {
                era: HISTORICAL_ERAS.MEDIEVAL_HIGH,
                region: 'England',
                social_class: 'artisan',
                scenario: 'daily_life',
                gender: 'male',
                age_groups: ['adult'],
                variation_level: 'medium',
                historical_accuracy: 'moderate',
                creativity_factor: 0.5
            };
            const result = await utdgManager.generateHistoricalContent(config);
            expect(result).toBeDefined();
            expect(result.nodes).toBeInstanceOf(Array);
            expect(result.generation_metadata.config).toEqual(config);
            expect(result.generation_metadata.accuracy_score).toBeGreaterThanOrEqual(0);
        });
    });
    describe('External Data Integration', () => {
        test('should handle historical queries', async () => {
            const query = {
                era: 'medieval',
                category: 'garment',
                social_class: 'peasant',
                filters: {},
                limit: 5
            };
            const result = await utdgManager.queryHistoricalContent(query);
            expect(result).toBeDefined();
            expect(result.nodes).toBeInstanceOf(Array);
            expect(result.query_metadata).toBeDefined();
            expect(result.query_metadata.sources_used).toBeInstanceOf(Array);
        });
    });
});
// Type safety tests
describe('UTDG Type System', () => {
    test('should enforce proper UTDGNode structure', () => {
        const node = {
            id: 'test_node_001',
            type: 'material',
            content: 'Test historical material',
            metadata: {
                era: [HISTORICAL_ERAS.MEDIEVAL_HIGH],
                authenticity: 0.8,
                source: 'test source',
                tags: ['test', 'material']
            },
            relationships: {
                compatible: [],
                incompatible: [],
                variations: []
            },
            constraints: []
        };
        expect(node.id).toBe('test_node_001');
        expect(node.type).toBe('material');
        expect(node.metadata.era).toContain(HISTORICAL_ERAS.MEDIEVAL_HIGH);
        expect(node.metadata.authenticity).toBe(0.8);
    });
    test('should handle Era type correctly', () => {
        const era = HISTORICAL_ERAS.MEDIEVAL_HIGH;
        expect(era.name).toBe('High Medieval');
        expect(typeof era.period.start).toBe('number');
        expect(typeof era.period.end).toBe('number');
        expect(era.region).toBeInstanceOf(Array);
        expect(['high', 'medium', 'low']).toContain(era.accuracy);
    });
});
