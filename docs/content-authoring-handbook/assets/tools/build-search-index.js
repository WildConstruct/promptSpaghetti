#!/usr/bin/env node

/**
 * Content Indexing Tool for Handbook Search
 * Epic 8.3.3 - Search and Navigation System
 * 
 * This tool automatically generates a search index from markdown files
 * Usage: node build-search-index.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SearchIndexBuilder {
  constructor(options = {}) {
    this.options = {
      docsPath: path.join(__dirname, '../..'),
      outputPath: path.join(__dirname, '../data/search-index.json'),
      includePatterns: ['**/*.md', '**/*.html'],
      excludePatterns: ['**/node_modules/**', '**/assets/**', '**/_build/**'],
      minContentLength: 50,
      maxContentLength: 1000,
      ...options
    };

    this.index = [];
    this.partsMap = {
      'part1-foundation': 'part1',
      'part2-content-development': 'part2',
      'part3-engine-reference': 'part3',
      'part4-practical-guides': 'part4',
      'part5-advanced-topics': 'part5',
      'part6-reference-materials': 'part6',
      'assets/examples': 'examples'
    };

    this.difficultyMap = {
      'introduction': 'beginner',
      'basic': 'beginner',
      'getting-started': 'beginner',
      'tutorial': 'beginner',
      'advanced': 'advanced',
      'reference': 'intermediate',
      'api': 'advanced',
      'extension': 'advanced',
      'security': 'advanced',
      'performance': 'advanced'
    };

    this.typeMap = {
      'introduction': 'chapter',
      'reference': 'reference',
      'tutorial': 'example',
      'example': 'example',
      'api': 'reference',
      'guide': 'chapter'
    };
  }

  async build() {
    console.log('🔍 Building search index...');
    
    try {
      await this.scanFiles();
      await this.generateIndex();
      await this.writeIndex();
      
      console.log(`✅ Search index built successfully!`);
      console.log(`📊 Indexed ${this.index.length} pages`);
      console.log(`📝 Output: ${this.options.outputPath}`);
      
    } catch (error) {
      console.error('❌ Error building search index:', error);
      process.exit(1);
    }
  }

  async scanFiles() {
    const files = await this.findFiles(this.options.docsPath);
    
    for (const file of files) {
      if (this.shouldIncludeFile(file)) {
        await this.processFile(file);
      }
    }
  }

  async findFiles(dir) {
    const files = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.isExcluded(fullPath)) {
          files.push(...await this.findFiles(fullPath));
        }
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  shouldIncludeFile(file) {
    const ext = path.extname(file);
    const isMarkdown = ext === '.md';
    const isHtml = ext === '.html';
    
    return (isMarkdown || isHtml) && !this.isExcluded(file);
  }

  isExcluded(file) {
    const relativePath = path.relative(this.options.docsPath, file);
    
    return this.options.excludePatterns.some(pattern => {
      return relativePath.includes(pattern.replace('**/', '').replace('/**', ''));
    });
  }

  async processFile(file) {
    try {
      const content = await fs.promises.readFile(file, 'utf8');
      const relativePath = path.relative(this.options.docsPath, file);
      
      const pageData = this.extractPageData(content, relativePath);
      
      if (pageData.content.length >= this.options.minContentLength) {
        this.index.push(pageData);
        console.log(`✓ Indexed: ${pageData.title}`);
      } else {
        console.log(`⚠ Skipped (too short): ${relativePath}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  extractPageData(content, relativePath) {
    const title = this.extractTitle(content);
    const cleanContent = this.cleanContent(content);
    const url = this.generateUrl(relativePath);
    const part = this.determinePart(relativePath);
    const type = this.determineType(title, relativePath);
    const difficulty = this.determineDifficulty(title, relativePath);
    const keywords = this.extractKeywords(title, cleanContent);
    
    return {
      title,
      url,
      content: cleanContent.substring(0, this.options.maxContentLength),
      type,
      difficulty,
      part,
      keywords
    };
  }

  extractTitle(content) {
    // Try to find main heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }
    
    // Try to find any heading
    const headingMatch = content.match(/^#{1,6}\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
    
    // Try to find title in frontmatter
    const titleMatch = content.match(/^title:\s*(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim().replace(/['"]/g, '');
    }
    
    return 'Untitled';
  }

  cleanContent(content) {
    // Remove markdown syntax
    let cleaned = content
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/^\s*>\s+/gm, '') // Remove blockquotes
      .replace(/\n\s*\n/g, ' ') // Collapse whitespace
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    // Remove HTML tags if present
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    return cleaned;
  }

  generateUrl(relativePath) {
    // Convert file path to URL
    let url = relativePath.replace(/\\/g, '/');
    
    // Convert .md to .html
    if (url.endsWith('.md')) {
      url = url.replace('.md', '.html');
    }
    
    return url;
  }

  determinePart(relativePath) {
    for (const [pathPattern, part] of Object.entries(this.partsMap)) {
      if (relativePath.includes(pathPattern)) {
        return part;
      }
    }
    
    return 'other';
  }

  determineType(title, relativePath) {
    const titleLower = title.toLowerCase();
    const pathLower = relativePath.toLowerCase();
    
    // Check for explicit type indicators
    for (const [indicator, type] of Object.entries(this.typeMap)) {
      if (titleLower.includes(indicator) || pathLower.includes(indicator)) {
        return type;
      }
    }
    
    // Check file location patterns
    if (pathLower.includes('reference')) return 'reference';
    if (pathLower.includes('example')) return 'example';
    if (pathLower.includes('tutorial')) return 'example';
    if (pathLower.includes('guide')) return 'chapter';
    
    return 'chapter';
  }

  determineDifficulty(title, relativePath) {
    const titleLower = title.toLowerCase();
    const pathLower = relativePath.toLowerCase();
    
    // Check for explicit difficulty indicators
    for (const [indicator, difficulty] of Object.entries(this.difficultyMap)) {
      if (titleLower.includes(indicator) || pathLower.includes(indicator)) {
        return difficulty;
      }
    }
    
    // Default based on part
    const part = this.determinePart(relativePath);
    if (part === 'part1') return 'beginner';
    if (part === 'part2') return 'intermediate';
    if (part === 'part3') return 'advanced';
    if (part === 'part4') return 'beginner';
    if (part === 'part5') return 'advanced';
    if (part === 'part6') return 'all';
    
    return 'intermediate';
  }

  extractKeywords(title, content) {
    const keywords = new Set();
    
    // Extract from title
    const titleWords = title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    titleWords.forEach(word => keywords.add(word));
    
    // Extract important terms from content
    const contentWords = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Get most frequent words
    const wordFreq = {};
    contentWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
    
    topWords.forEach(word => keywords.add(word));
    
    // Add technical terms
    const technicalTerms = [
      'generator', 'node', 'rule', 'variable', 'schema', 'json',
      'weighted', 'conditional', 'sequential', 'markov', 'modifier',
      'api', 'engine', 'execution', 'runtime', 'performance',
      'security', 'integration', 'testing', 'debugging'
    ];
    
    technicalTerms.forEach(term => {
      if (title.toLowerCase().includes(term) || content.toLowerCase().includes(term)) {
        keywords.add(term);
      }
    });
    
    return Array.from(keywords).slice(0, 15);
  }

  async generateIndex() {
    // Sort by relevance score
    this.index.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a);
      const scoreB = this.calculateRelevanceScore(b);
      return scoreB - scoreA;
    });
    
    // Add IDs
    this.index.forEach((item, index) => {
      item.id = this.generateId(item.title, item.url);
    });
  }

  calculateRelevanceScore(item) {
    let score = 0;
    
    // Title length bonus (not too short, not too long)
    if (item.title.length > 10 && item.title.length < 80) {
      score += 10;
    }
    
    // Content length bonus
    score += Math.min(item.content.length / 100, 10);
    
    // Type bonuses
    if (item.type === 'chapter') score += 15;
    if (item.type === 'reference') score += 10;
    if (item.type === 'example') score += 5;
    
    // Part bonuses (foundation and practical guides are more important)
    if (item.part === 'part1' || item.part === 'part4') score += 5;
    
    // Keyword count bonus
    score += item.keywords.length;
    
    return score;
  }

  generateId(title, url) {
    return crypto.createHash('md5')
      .update(title + url)
      .digest('hex')
      .substring(0, 8);
  }

  async writeIndex() {
    const indexData = {
      generated: new Date().toISOString(),
      version: '1.0.0',
      totalPages: this.index.length,
      pages: this.index
    };
    
    const jsonContent = JSON.stringify(indexData.pages, null, 2);
    
    // Ensure directory exists
    const dir = path.dirname(this.options.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await fs.promises.writeFile(this.options.outputPath, jsonContent, 'utf8');
    
    // Also write metadata
    const metaPath = this.options.outputPath.replace('.json', '-meta.json');
    await fs.promises.writeFile(metaPath, JSON.stringify({
      generated: indexData.generated,
      version: indexData.version,
      totalPages: indexData.totalPages,
      stats: this.generateStats()
    }, null, 2), 'utf8');
  }

  generateStats() {
    const stats = {
      byType: {},
      byDifficulty: {},
      byPart: {}
    };
    
    this.index.forEach(item => {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.byDifficulty[item.difficulty] = (stats.byDifficulty[item.difficulty] || 0) + 1;
      stats.byPart[item.part] = (stats.byPart[item.part] || 0) + 1;
    });
    
    return stats;
  }
}

// Run if called directly
if (require.main === module) {
  const builder = new SearchIndexBuilder();
  builder.build();
}

module.exports = SearchIndexBuilder;