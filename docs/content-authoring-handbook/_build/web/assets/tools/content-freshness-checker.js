#!/usr/bin/env node

/**
 * Content Freshness Checker - Content Authoring Handbook
 * Epic 8.3 Story 8.3.6 - Update Cycle and Maintenance
 * 
 * Analyzes content age and generates freshness reports
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ContentFreshnessChecker {
  constructor() {
    this.rootDir = path.join(__dirname, '../..');
    this.contentDirs = [
      'part1-foundation',
      'part2-content-development',
      'part3-engine-reference',
      'part4-practical-guides',
      'part5-advanced-topics',
      'part6-reference-materials'
    ];
    this.reportsDir = path.join(this.rootDir, 'reports');
    this.maxAge = {
      critical: 30,    // days
      warning: 60,     // days
      stale: 90        // days
    };
    
    this.ensureDirectoryExists(this.reportsDir);
  }

  /**
   * Get all content files with metadata
   */
  getContentFiles() {
    const files = [];
    
    this.contentDirs.forEach(dir => {
      const dirPath = path.join(this.rootDir, dir);
      if (fs.existsSync(dirPath)) {
        const dirFiles = this.getFilesRecursively(dirPath);
        files.push(...dirFiles);
      }
    });
    
    return files;
  }

  /**
   * Get files recursively from directory
   */
  getFilesRecursively(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursively(itemPath));
      } else if (item.endsWith('.md') || item.endsWith('.json')) {
        files.push({
          path: itemPath,
          relativePath: path.relative(this.rootDir, itemPath),
          name: item,
          size: stat.size,
          modified: stat.mtime,
          accessed: stat.atime,
          category: this.categorizeFile(itemPath)
        });
      }
    });
    
    return files;
  }

  /**
   * Categorize file based on path
   */
  categorizeFile(filePath) {
    const relativePath = path.relative(this.rootDir, filePath);
    
    if (relativePath.includes('part1-foundation')) return 'foundation';
    if (relativePath.includes('part2-content-development')) return 'content-development';
    if (relativePath.includes('part3-engine-reference')) return 'engine-reference';
    if (relativePath.includes('part4-practical-guides')) return 'practical-guides';
    if (relativePath.includes('part5-advanced-topics')) return 'advanced-topics';
    if (relativePath.includes('part6-reference-materials')) return 'reference-materials';
    if (relativePath.includes('assets/examples')) return 'examples';
    
    return 'other';
  }

  /**
   * Check content age and freshness
   */
  checkContentAge() {
    const files = this.getContentFiles();
    const now = new Date();
    const analysis = {
      total: files.length,
      fresh: 0,
      aging: 0,
      stale: 0,
      critical: 0,
      files: []
    };
    
    files.forEach(file => {
      const ageInDays = (now - file.modified) / (1000 * 60 * 60 * 24);
      const agingStatus = this.getAgingStatus(ageInDays);
      
      const fileAnalysis = {
        ...file,
        ageInDays: Math.round(ageInDays),
        agingStatus: agingStatus,
        freshness: this.calculateFreshness(ageInDays, file.category),
        priority: this.getPriority(file.category),
        recommendations: this.getRecommendations(ageInDays, file.category)
      };
      
      analysis.files.push(fileAnalysis);
      analysis[agingStatus]++;
    });
    
    return analysis;
  }

  /**
   * Get aging status based on days
   */
  getAgingStatus(ageInDays) {
    if (ageInDays <= this.maxAge.critical) return 'fresh';
    if (ageInDays <= this.maxAge.warning) return 'aging';
    if (ageInDays <= this.maxAge.stale) return 'stale';
    return 'critical';
  }

  /**
   * Calculate freshness score for a file
   */
  calculateFreshness(ageInDays, category) {
    const maxAge = this.getCategoryMaxAge(category);
    const score = Math.max(0, 100 - (ageInDays / maxAge) * 100);
    return Math.round(score);
  }

  /**
   * Get maximum age threshold for category
   */
  getCategoryMaxAge(category) {
    const categoryAges = {
      'foundation': 120,           // Foundation docs change less frequently
      'content-development': 60,   // Content development needs regular updates
      'engine-reference': 90,      // Engine reference needs moderate updates
      'practical-guides': 45,      // Practical guides need frequent updates
      'advanced-topics': 90,       // Advanced topics need moderate updates
      'reference-materials': 120,  // Reference materials are more stable
      'examples': 30               // Examples should be very current
    };
    
    return categoryAges[category] || 90;
  }

  /**
   * Get priority based on category
   */
  getPriority(category) {
    const priorities = {
      'foundation': 'medium',
      'content-development': 'high',
      'engine-reference': 'high',
      'practical-guides': 'critical',
      'advanced-topics': 'medium',
      'reference-materials': 'low',
      'examples': 'critical'
    };
    
    return priorities[category] || 'medium';
  }

  /**
   * Get recommendations for file maintenance
   */
  getRecommendations(ageInDays, category) {
    const recommendations = [];
    
    if (ageInDays > this.maxAge.critical) {
      recommendations.push('Review content for accuracy');
      recommendations.push('Update examples and code snippets');
      recommendations.push('Verify all links are working');
    }
    
    if (ageInDays > this.maxAge.warning) {
      recommendations.push('Check for outdated information');
      recommendations.push('Update screenshots if applicable');
    }
    
    if (ageInDays > this.maxAge.stale) {
      recommendations.push('Complete content review required');
      recommendations.push('Consider restructuring or rewriting');
      recommendations.push('Update all references and dependencies');
    }
    
    if (category === 'examples' && ageInDays > 30) {
      recommendations.push('Test all code examples');
      recommendations.push('Update to latest API versions');
    }
    
    if (category === 'practical-guides' && ageInDays > 45) {
      recommendations.push('Walk through all tutorial steps');
      recommendations.push('Update with new features and best practices');
    }
    
    return recommendations;
  }

  /**
   * Calculate overall freshness score
   */
  calculateOverallFreshness(analysis) {
    if (analysis.total === 0) return 100;
    
    const weights = {
      fresh: 1.0,
      aging: 0.7,
      stale: 0.4,
      critical: 0.1
    };
    
    const weightedScore = (
      analysis.fresh * weights.fresh +
      analysis.aging * weights.aging +
      analysis.stale * weights.stale +
      analysis.critical * weights.critical
    ) / analysis.total;
    
    return Math.round(weightedScore * 100);
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.critical > 0) {
      recommendations.push({
        priority: 'critical',
        action: `Immediately review ${analysis.critical} critical files`,
        description: 'These files are significantly outdated and may contain incorrect information'
      });
    }
    
    if (analysis.stale > 0) {
      recommendations.push({
        priority: 'high',
        action: `Review ${analysis.stale} stale files`,
        description: 'These files should be reviewed for accuracy and relevance'
      });
    }
    
    if (analysis.aging > 0) {
      recommendations.push({
        priority: 'medium',
        action: `Monitor ${analysis.aging} aging files`,
        description: 'These files are approaching staleness and should be reviewed soon'
      });
    }
    
    // Category-specific recommendations
    const categoryStats = this.getCategoryStatistics(analysis);
    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.avgAge > this.getCategoryMaxAge(category)) {
        recommendations.push({
          priority: this.getPriority(category),
          action: `Review ${category} content`,
          description: `${category} files have an average age of ${stats.avgAge} days`
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get statistics by category
   */
  getCategoryStatistics(analysis) {
    const categories = {};
    
    analysis.files.forEach(file => {
      if (!categories[file.category]) {
        categories[file.category] = {
          count: 0,
          totalAge: 0,
          avgAge: 0,
          freshness: 0
        };
      }
      
      categories[file.category].count++;
      categories[file.category].totalAge += file.ageInDays;
      categories[file.category].freshness += file.freshness;
    });
    
    Object.keys(categories).forEach(category => {
      const stats = categories[category];
      stats.avgAge = Math.round(stats.totalAge / stats.count);
      stats.freshness = Math.round(stats.freshness / stats.count);
    });
    
    return categories;
  }

  /**
   * Generate comprehensive freshness report
   */
  generateFreshnessReport() {
    const analysis = this.checkContentAge();
    const freshnessScore = this.calculateOverallFreshness(analysis);
    const recommendations = this.generateRecommendations(analysis);
    const categoryStats = this.getCategoryStatistics(analysis);
    
    const report = {
      timestamp: new Date().toISOString(),
      version: this.getHandbookVersion(),
      summary: {
        totalFiles: analysis.total,
        freshnessScore: freshnessScore,
        distribution: {
          fresh: analysis.fresh,
          aging: analysis.aging,
          stale: analysis.stale,
          critical: analysis.critical
        },
        percentages: {
          fresh: Math.round((analysis.fresh / analysis.total) * 100),
          aging: Math.round((analysis.aging / analysis.total) * 100),
          stale: Math.round((analysis.stale / analysis.total) * 100),
          critical: Math.round((analysis.critical / analysis.total) * 100)
        }
      },
      categoryStats: categoryStats,
      recommendations: recommendations,
      criticalFiles: analysis.files.filter(f => f.agingStatus === 'critical'),
      staleFiles: analysis.files.filter(f => f.agingStatus === 'stale'),
      agingFiles: analysis.files.filter(f => f.agingStatus === 'aging'),
      allFiles: analysis.files
    };
    
    return report;
  }

  /**
   * Get handbook version
   */
  getHandbookVersion() {
    try {
      const versionFile = path.join(this.rootDir, 'VERSION');
      return fs.readFileSync(versionFile, 'utf8').trim();
    } catch (error) {
      return '1.0.0';
    }
  }

  /**
   * Save report to file
   */
  saveReport(report) {
    const filename = `content-freshness-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    return filepath;
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Content Freshness Report</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .score { font-size: 48px; font-weight: bold; color: ${this.getScoreColor(report.summary.freshnessScore)}; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .metric { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .critical { color: #dc3545; }
        .stale { color: #fd7e14; }
        .aging { color: #ffc107; }
        .fresh { color: #28a745; }
        .recommendation { background: #e9ecef; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .file-list { max-height: 300px; overflow-y: auto; }
        .file-item { padding: 10px; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Content Freshness Report</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        <p>Version: ${report.version}</p>
        <div class="score">${report.summary.freshnessScore}%</div>
    </div>
    
    <div class="grid">
        <div class="card">
            <h2>Distribution</h2>
            <div class="metric fresh">${report.summary.distribution.fresh} Fresh (${report.summary.percentages.fresh}%)</div>
            <div class="metric aging">${report.summary.distribution.aging} Aging (${report.summary.percentages.aging}%)</div>
            <div class="metric stale">${report.summary.distribution.stale} Stale (${report.summary.percentages.stale}%)</div>
            <div class="metric critical">${report.summary.distribution.critical} Critical (${report.summary.percentages.critical}%)</div>
        </div>
        
        <div class="card">
            <h2>Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div class="recommendation">
                    <strong>${rec.priority.toUpperCase()}:</strong> ${rec.action}<br>
                    <small>${rec.description}</small>
                </div>
            `).join('')}
        </div>
        
        <div class="card">
            <h2>Category Statistics</h2>
            ${Object.entries(report.categoryStats).map(([category, stats]) => `
                <div>
                    <strong>${category}:</strong> ${stats.count} files, ${stats.avgAge} days avg, ${stats.freshness}% fresh
                </div>
            `).join('')}
        </div>
        
        <div class="card">
            <h2>Critical Files</h2>
            <div class="file-list">
                ${report.criticalFiles.map(file => `
                    <div class="file-item">
                        <strong>${file.relativePath}</strong><br>
                        <small>${file.ageInDays} days old</small>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
    
    const filename = `content-freshness-${new Date().toISOString().split('T')[0]}.html`;
    const filepath = path.join(this.reportsDir, filename);
    
    fs.writeFileSync(filepath, html);
    return filepath;
  }

  /**
   * Get color for freshness score
   */
  getScoreColor(score) {
    if (score >= 85) return '#28a745';
    if (score >= 70) return '#ffc107';
    if (score >= 50) return '#fd7e14';
    return '#dc3545';
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Run complete freshness check
   */
  run() {
    console.log('🔍 Checking content freshness...');
    
    const report = this.generateFreshnessReport();
    const jsonPath = this.saveReport(report);
    const htmlPath = this.generateHTMLReport(report);
    
    console.log('\n📊 Content Freshness Report');
    console.log('===============================');
    console.log(`Overall Score: ${report.summary.freshnessScore}%`);
    console.log(`Total Files: ${report.summary.totalFiles}`);
    console.log(`Fresh: ${report.summary.distribution.fresh} (${report.summary.percentages.fresh}%)`);
    console.log(`Aging: ${report.summary.distribution.aging} (${report.summary.percentages.aging}%)`);
    console.log(`Stale: ${report.summary.distribution.stale} (${report.summary.percentages.stale}%)`);
    console.log(`Critical: ${report.summary.distribution.critical} (${report.summary.percentages.critical}%)`);
    console.log('===============================');
    
    if (report.recommendations.length > 0) {
      console.log('\n🎯 Top Recommendations:');
      report.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
      });
    }
    
    console.log('\n📄 Reports saved:');
    console.log(`- JSON: ${jsonPath}`);
    console.log(`- HTML: ${htmlPath}`);
    
    return report;
  }
}

// CLI interface
if (require.main === module) {
  const checker = new ContentFreshnessChecker();
  const report = checker.run();
  
  // Exit with appropriate code
  if (report.summary.freshnessScore < 70) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

module.exports = ContentFreshnessChecker;