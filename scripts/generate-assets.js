#!/usr/bin/env node

/**
 * Asset Generator for Prompt Spaghetti
 * Converts lists of prompt components into PSG format
 */

const fs = require('fs');
const path = require('path');

class AssetGenerator {
  constructor() {
    this.generatedCount = 0;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.outputDir = path.join(process.cwd(), 'assets', 'generated', this.timestamp);
  }

  /**
   * Parse input text into structured list
   */
  parseInput(text, category = 'general') {
    const lines = text.split('\n').filter(line => line.trim());
    const items = [];
    
    for (const line of lines) {
      // Remove numbering, bullets, extra spaces
      let clean = line
        .replace(/^\d+[\s–.-]+/, '') // Remove numbers
        .replace(/^[•·*-]\s*/, '')    // Remove bullets
        .replace(/\s+–\s+/, ' - ')    // Normalize dashes
        .trim();
      
      if (clean) {
        items.push({
          original: line,
          clean: clean,
          category: category,
          id: this.generateId(clean)
        });
      }
    }
    
    return items;
  }

  /**
   * Generate unique ID from text
   */
  generateId(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50);
  }

  /**
   * Create a simple Output node
   */
  createOutputNode(item, index) {
    return {
      id: `${item.category}_${item.id}_${this.generatedCount++}`,
      type: 'Output',
      data: {
        label: item.clean,
        template: item.clean.toLowerCase(),
        metadata: {
          category: item.category,
          tags: this.extractTags(item.clean),
          generated: this.timestamp,
          source: 'batch-generator'
        }
      },
      position: {
        x: 100 + (index % 5) * 200,
        y: 100 + Math.floor(index / 5) * 150
      }
    };
  }

  /**
   * Create a WeightedChoice node from multiple items
   */
  createWeightedChoiceNode(items, category) {
    return {
      id: `weighted_${category}_${this.generatedCount++}`,
      type: 'WeightedChoice',
      data: {
        label: `${category} Options`,
        choices: items.map((item, idx) => ({
          id: `choice_${idx}`,
          weight: 1,
          text: item.clean.toLowerCase()
        })),
        metadata: {
          category: category,
          itemCount: items.length,
          generated: this.timestamp
        }
      },
      position: {
        x: 400,
        y: 100
      }
    };
  }

  /**
   * Extract tags from text
   */
  extractTags(text) {
    const words = text.toLowerCase().split(/[\s-–]+/);
    const tags = ['generated'];
    
    // Add meaningful words as tags
    for (const word of words) {
      if (word.length > 3 && !['with', 'from', 'that', 'this'].includes(word)) {
        tags.push(word);
      }
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Generate combinations of two lists
   */
  generateCombinations(list1, list2, separator = ', ') {
    const combinations = [];
    
    for (const item1 of list1) {
      for (const item2 of list2) {
        combinations.push({
          clean: `${item1.clean}${separator}${item2.clean}`,
          category: `${item1.category}_x_${item2.category}`,
          id: `${item1.id}_${item2.id}`
        });
      }
    }
    
    return combinations;
  }

  /**
   * Create a complete PSG graph
   */
  createGraph(nodes, edges = []) {
    return {
      nodes: nodes,
      edges: edges,
      metadata: {
        version: '1.0.0',
        generated: this.timestamp,
        generator: 'asset-generator',
        nodeCount: nodes.length,
        edgeCount: edges.length
      }
    };
  }

  /**
   * Save graph to file
   */
  saveGraph(graph, filename) {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(graph, null, 2));
    
    return filepath;
  }

  /**
   * Generate assets from text input
   */
  generate(input, options = {}) {
    const {
      category = 'general',
      mode = 'standard', // 'simple', 'standard', 'advanced'
      createWeighted = true,
      createIndividual = true,
      combinations = null // { withList: otherList, separator: ', ' }
    } = options;

    // Parse input
    const items = this.parseInput(input, category);
    console.log(`Parsed ${items.length} items from input`);

    const nodes = [];
    
    // Create individual nodes
    if (createIndividual) {
      items.forEach((item, index) => {
        nodes.push(this.createOutputNode(item, index));
      });
    }
    
    // Create weighted choice node
    if (createWeighted && items.length > 1) {
      nodes.push(this.createWeightedChoiceNode(items, category));
    }
    
    // Generate combinations if requested
    if (combinations && combinations.withList) {
      const otherItems = this.parseInput(combinations.withList, combinations.category || 'other');
      const combos = this.generateCombinations(items, otherItems, combinations.separator);
      
      combos.forEach((combo, index) => {
        nodes.push(this.createOutputNode(combo, index));
      });
      
      console.log(`Generated ${combos.length} combinations`);
    }
    
    // Create graph
    const graph = this.createGraph(nodes);
    
    // Save to file
    const filename = `${category}_assets.psg`;
    const filepath = this.saveGraph(graph, filename);
    
    console.log(`Generated ${nodes.length} nodes`);
    console.log(`Saved to: ${filepath}`);
    
    return {
      graph,
      filepath,
      stats: {
        nodeCount: nodes.length,
        categories: [...new Set(items.map(i => i.category))],
        timestamp: this.timestamp
      }
    };
  }
}

// Example usage
if (require.main === module) {
  const generator = new AssetGenerator();
  
  // Example: Hair styles
  const hairStyles = `
    1. buzzed
    2. pixie
    3. lob
    4. waist-length
    5. shoulder-length
    6. chin-length bob
    7. asymmetrical cut
    8. layered shag
    9. blunt cut
    10. feathered layers
  `;
  
  // Example: Hair colors
  const hairColors = `
    1. platinum blonde
    2. ash brown
    3. jet black
    4. auburn red
    5. silver grey
    6. honey blonde
    7. chestnut brown
    8. strawberry blonde
    9. salt and pepper
    10. midnight blue
  `;
  
  // Generate individual hair style assets
  const styleResult = generator.generate(hairStyles, {
    category: 'hair_style',
    createWeighted: true
  });
  
  // Generate individual hair color assets
  const colorResult = generator.generate(hairColors, {
    category: 'hair_color',
    createWeighted: true
  });
  
  // Generate combinations
  const comboGenerator = new AssetGenerator();
  const comboResult = comboGenerator.generate(hairStyles, {
    category: 'hair_appearance',
    createIndividual: false,
    createWeighted: false,
    combinations: {
      withList: hairColors,
      category: 'hair_color',
      separator: ' with '
    }
  });
  
  console.log('\n=== Generation Complete ===');
  console.log(`Total assets generated: ${generator.generatedCount + comboGenerator.generatedCount}`);
  console.log(`Output directory: ${generator.outputDir}`);
}

module.exports = AssetGenerator;