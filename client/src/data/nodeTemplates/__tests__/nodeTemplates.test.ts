/**
 * Tests for node template data structures
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */
import {
  panelArchetypeTemplate,
  aestheticInfluenceTemplate,
  wearLevelTemplate,
  colorPaletteTemplate,
  materialsTemplate,
  allNodeTemplates,
  templateCategories,
  retroGamingDemoTemplate,
  getTemplateById,
  getTemplatesByCategory,
  validateTemplate
} from '../index';
describe('Node Templates', () => {
  describe('Individual Templates', () => {
    test('panelArchetypeTemplate should be valid', () => {
      expect(validateTemplate(panelArchetypeTemplate)).toBe(true);
      expect(panelArchetypeTemplate.id).toBe('archetype-2');
      expect(panelArchetypeTemplate.type).toBe('logic');
      expect(panelArchetypeTemplate.data.options).toHaveLength(8);
    });
    test('aestheticInfluenceTemplate should be valid', () => {
      expect(validateTemplate(aestheticInfluenceTemplate)).toBe(true);
      expect(aestheticInfluenceTemplate.id).toBe('aesthetic-3');
      expect(aestheticInfluenceTemplate.type).toBe('logic');
      expect(aestheticInfluenceTemplate.data.options).toHaveLength(8);
    });
    test('wearLevelTemplate should be valid', () => {
      expect(validateTemplate(wearLevelTemplate)).toBe(true);
      expect(wearLevelTemplate.id).toBe('wear-5');
      expect(wearLevelTemplate.type).toBe('transform');
      expect(wearLevelTemplate.data.options).toHaveLength(6);
    });
    test('colorPaletteTemplate should be valid', () => {
      expect(validateTemplate(colorPaletteTemplate)).toBe(true);
      expect(colorPaletteTemplate.id).toBe('colors-6');
      expect(colorPaletteTemplate.type).toBe('transform');
      expect(colorPaletteTemplate.data.options).toHaveLength(8);
    });
    test('materialsTemplate should be valid', () => {
      expect(validateTemplate(materialsTemplate)).toBe(true);
      expect(materialsTemplate.id).toBe('materials-7');
      expect(materialsTemplate.type).toBe('transform');
      expect(materialsTemplate.data.options).toHaveLength(9);
    });
  });
  describe('Template Collections', () => {
    test('allNodeTemplates should contain all templates', () => {
      expect(allNodeTemplates).toHaveLength(5);
      expect(allNodeTemplates).toContain(panelArchetypeTemplate);
      expect(allNodeTemplates).toContain(aestheticInfluenceTemplate);
      expect(allNodeTemplates).toContain(wearLevelTemplate);
      expect(allNodeTemplates).toContain(colorPaletteTemplate);
      expect(allNodeTemplates).toContain(materialsTemplate);
    });
    test('templateCategories should group templates correctly', () => {
      expect(templateCategories.logic).toHaveLength(2);
      expect(templateCategories.transform).toHaveLength(3);
      expect(templateCategories.logic).toContain(panelArchetypeTemplate);
      expect(templateCategories.logic).toContain(aestheticInfluenceTemplate);
      expect(templateCategories.transform).toContain(wearLevelTemplate);
      expect(templateCategories.transform).toContain(colorPaletteTemplate);
      expect(templateCategories.transform).toContain(materialsTemplate);
    });
  });
  describe('Graph Templates', () => {
    test('retroGamingDemoTemplate should be valid', () => {
      expect(retroGamingDemoTemplate.name).toBe('Retro Gaming UI Demo');
      expect(retroGamingDemoTemplate.nodes).toHaveLength(5);
      expect(retroGamingDemoTemplate.edges).toHaveLength(4);
      // Verify all nodes are valid
      retroGamingDemoTemplate.nodes.forEach(node => {)
        expect(validateTemplate(node)).toBe(true);
      });
    });
  });
  describe('Utility Functions', () => {
    test('getTemplateById should return correct template', () => {
      expect(getTemplateById('archetype-2')).toBe(panelArchetypeTemplate);
      expect(getTemplateById('aesthetic-3')).toBe(aestheticInfluenceTemplate);
      expect(getTemplateById('nonexistent')).toBeUndefined();
    });
    test('getTemplatesByCategory should filter correctly', () => {
      const logicTemplates = getTemplatesByCategory('logic');
      const transformTemplates = getTemplatesByCategory('transform');
      const outputTemplates = getTemplatesByCategory('output');
      expect(logicTemplates).toHaveLength(2);
      expect(transformTemplates).toHaveLength(3);
      expect(outputTemplates).toHaveLength(0);
    });
    test('validateTemplate should detect invalid templates', () => {
      // Valid template
      expect(validateTemplate(panelArchetypeTemplate)).toBe(true);
      // Invalid templates
      expect(validateTemplate({} as any)).toBe(false);
      expect(validateTemplate({ id: 'test', type: 'invalid' } as any)).toBe(false);
      expect(validateTemplate({ )
        id: 'test', 
        type: 'logic', 
        position: { x: 0, y: 0 },
        data: { label: 'Test' }
      } as any)).toBe(false);
    });
  });
  describe('Data Integrity', () => {
    test('all templates should have unique IDs', () => {
      const ids = allNodeTemplates.map(template => template.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
    test('all options should have positive weights', () => {
      allNodeTemplates.forEach(template => {)
        template.data.options.forEach(option => {)
          expect(option.weight).toBeGreaterThan(0);
          expect(typeof option.weight).toBe('number');
        });
      });
    });
    test('all options should have required fields', () => {
      allNodeTemplates.forEach(template => {)
        template.data.options.forEach(option => {)
          expect(option.label).toBeDefined();
          expect(option.value).toBeDefined();
          expect(option.weight).toBeDefined();
          expect(typeof option.label).toBe('string');
          expect(typeof option.value).toBe('string');
          expect(typeof option.weight).toBe('number');
        });
      });
    });
    test('templates should have valid positions', () => {
      allNodeTemplates.forEach(template => {)
        expect(typeof template.position.x).toBe('number');
        expect(typeof template.position.y).toBe('number');
        expect(template.position.x).toBeGreaterThanOrEqual(0);
        expect(template.position.y).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
describe('Option Collections', () => {
  test('panel archetype options should include all major types', () => {
    const options = panelArchetypeTemplate.data.options;
    const values = options.map(opt => opt.value);
    expect(values).toContain('Cockpit Control Surface');
    expect(values).toContain('Bridge/Command Center Console');
    expect(values).toContain('Machinery/Engineering Panel');
    expect(values).toContain('Handheld Device');
  });
  test('aesthetic influence options should cover major retrofuturistic styles', () => {
    const options = aestheticInfluenceTemplate.data.options;
    const values = options.map(opt => opt.value);
    expect(values).toContain('Star Wars Core');
    expect(values).toContain('Cassette Futurism');
    expect(values).toContain('Dieselpunk');
    expect(values).toContain('Atompunk/Raygun Gothic');
  });
  test('wear level options should represent degradation spectrum', () => {
    const options = wearLevelTemplate.data.options;
    const values = options.map(opt => opt.value);
    expect(values).toContain('Pristine (New Old Stock)');
    expect(values).toContain('Lightly Used');
    expect(values).toContain('Battle-Scarred / Field Repaired');
    expect(values).toContain('Overgrown / Reclaimed by Nature');
  });
});