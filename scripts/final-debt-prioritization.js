#!/usr/bin/env node

/**
 * Final Technical Debt Prioritization Framework Application
 * Epic 18 Task: E18-1753114561979-82AADE - Apply framework to inventory
 * 
 * This final version correctly applies the Epic 18 prioritization framework
 * with proper 100-point scale scoring to accurately prioritize all debt items.
 */

const fs = require('fs');
const path = require('path');

class FinalDebtPrioritizationEngine {
  constructor() {
    // Framework weights as defined in Epic 18.1.6
    this.weights = {
      impact: 0.4,    // 40% weight
      risk: 0.3,      // 30% weight 
      effort: 0.2,    // 20% weight
      strategic: 0.1  // 10% weight
    };
  }

  /**
   * Load debt inventory from file
   */
  loadDebtInventory(filePath = './docs/debt-inventory.json') {
    try {
      const absolutePath = path.resolve(filePath);
      const data = fs.readFileSync(absolutePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Failed to load debt inventory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Apply final correct prioritization scoring (100-point scale)
   */
  applyFinalPrioritization(debtItem) {
    // Calculate 10-point scores
    const impactScore = this.calculateRealImpactScore(debtItem);
    const riskScore = this.calculateRealRiskScore(debtItem);
    const effortScore = this.calculateRealEffortScore(debtItem);
    const strategicScore = this.calculateRealStrategicScore(debtItem);

    // Calculate weighted total on 100-point scale
    let totalScore = (
      (impactScore * 10 * this.weights.impact) +
      (riskScore * 10 * this.weights.risk) +
      (effortScore * 10 * this.weights.effort) +
      (strategicScore * 10 * this.weights.strategic)
    );

    // Apply adjustment factors for deployment blockers
    const adjustmentFactors = [];
    if (debtItem.blocksDeployment) {
      totalScore *= 1.5; // 1.5x multiplier for deployment blockers
      adjustmentFactors.push('Deployment Blocker (×1.5)');
    }

    // Ensure score is within bounds
    const finalScore = Math.min(100, Math.max(0, totalScore));
    const priority = this.assignPriority(finalScore);

    return {
      ...debtItem,
      finalScoring: {
        componentScores: {
          impact: Math.round(impactScore * 10) / 10,
          risk: Math.round(riskScore * 10) / 10,
          effort: Math.round(effortScore * 10) / 10,
          strategic: Math.round(strategicScore * 10) / 10
        },
        weightedScores: {
          impact: Math.round(impactScore * 10 * this.weights.impact * 10) / 10,
          risk: Math.round(riskScore * 10 * this.weights.risk * 10) / 10,
          effort: Math.round(effortScore * 10 * this.weights.effort * 10) / 10,
          strategic: Math.round(strategicScore * 10 * this.weights.strategic * 10) / 10
        },
        baseScore: Math.round((totalScore / (debtItem.blocksDeployment ? 1.5 : 1)) * 10) / 10,
        adjustmentFactors,
        finalScore: Math.round(finalScore * 10) / 10,
        calculatedPriority: priority
      },
      priorityChange: {
        originalScore: debtItem.priorityScore || 0,
        originalPriority: debtItem.calculatedPriority || debtItem.priority,
        newScore: Math.round(finalScore * 10) / 10,
        newPriority: priority,
        scoreChange: Math.round((finalScore - (debtItem.priorityScore || 0)) * 10) / 10,
        priorityChanged: priority !== (debtItem.calculatedPriority || debtItem.priority)
      }
    };
  }

  /**
   * Calculate impact score (0-10 scale)
   */
  calculateRealImpactScore(debtItem) {
    let score = 5; // Default medium impact

    // Security vulnerabilities have high business impact
    if (debtItem.category === 'security') {
      if (debtItem.severity === 'critical') {
        score = 10; // Maximum impact for critical security issues
      } else if (debtItem.severity === 'high') {
        score = 8; // High impact for high severity security
      } else {
        score = 6; // Medium-high for other security issues
      }
    }

    // Deployment blockers have maximum business impact
    if (debtItem.blocksDeployment) {
      score = Math.max(score, 10);
    }

    // Technical impact based on location and complexity
    if (debtItem.location?.includes('core/') || 
        debtItem.location?.includes('engine.ts') ||
        debtItem.location?.includes('graphSchema.ts')) {
      score = Math.max(score, 8); // High technical impact for core systems
    }

    // Maintainability issues in large files have higher impact
    if (debtItem.category === 'maintainability' && debtItem.estimatedHours > 20) {
      score = Math.max(score, 7);
    }

    return score;
  }

  /**
   * Calculate risk score (0-10 scale)
   */
  calculateRealRiskScore(debtItem) {
    let score = 1; // Default minimal risk

    // Security risks
    if (debtItem.category === 'security') {
      if (debtItem.impact?.includes('Remote Code Execution') ||
          debtItem.impact?.includes('Code Injection')) {
        score = 10; // Maximum risk for RCE vulnerabilities
      } else if (debtItem.impact?.includes('Property Injection') ||
                 debtItem.impact?.includes('Data Injection')) {
        score = 8; // High risk for injection vulnerabilities
      } else if (debtItem.severity === 'high') {
        score = 7; // High risk for high severity security issues
      } else {
        score = 5; // Medium risk for other security issues
      }
    }

    // Reliability risks
    if (debtItem.category === 'reliability') {
      if (debtItem.severity === 'critical') {
        score = Math.max(score, 9);
      } else if (debtItem.severity === 'high') {
        score = Math.max(score, 7);
      } else {
        score = Math.max(score, 4);
      }
    }

    // Performance issues can cause reliability problems
    if (debtItem.category === 'performance' && debtItem.severity === 'high') {
      score = Math.max(score, 6);
    }

    return score;
  }

  /**
   * Calculate effort score (0-10 scale, higher score = lower effort = higher priority)
   */
  calculateRealEffortScore(debtItem) {
    const hours = debtItem.estimatedHours || 8;
    
    // Effort scoring: lower effort = higher score
    let score;
    if (hours <= 4) score = 10;      // XS effort - very quick to fix
    else if (hours <= 8) score = 8;  // S effort - straightforward
    else if (hours <= 16) score = 6; // M effort - moderate work
    else if (hours <= 32) score = 4; // L effort - significant work
    else score = 2;                  // XL effort - major refactoring

    // Testing effort adjustment for security items
    if (debtItem.category === 'security') {
      score = Math.max(1, score - 1); // Security items need more testing
    }

    return score;
  }

  /**
   * Calculate strategic alignment score (0-10 scale)
   */
  calculateRealStrategicScore(debtItem) {
    let score = 5; // Default medium alignment

    // Security items have high strategic alignment
    if (debtItem.category === 'security') {
      score = 10; // Maximum strategic alignment
    }

    // Deployment blockers have high business alignment
    if (debtItem.blocksDeployment) {
      score = Math.max(score, 10);
    }

    // Maintainability improvements have good strategic alignment
    if (debtItem.category === 'maintainability') {
      score = Math.max(score, 8);
    }

    // Type safety improvements have good architectural alignment
    if (debtItem.category === 'type_safety') {
      score = Math.max(score, 8);
    }

    // Performance improvements have medium strategic value
    if (debtItem.category === 'performance') {
      score = Math.max(score, 6);
    }

    return score;
  }

  /**
   * Assign priority based on score with Epic 18 thresholds
   */
  assignPriority(score) {
    if (score >= 90) return 'P0';  // Critical priority
    if (score >= 80) return 'P1';  // High priority  
    if (score >= 70) return 'P2';  // Medium priority
    if (score >= 60) return 'P3';  // Low priority
    return 'P4';                   // Minimal priority
  }

  /**
   * Process entire debt inventory with final correct scoring
   */
  processInventory(inventoryData) {
    console.log('🎯 Applying final corrected prioritization framework...\n');
    
    const processedItems = inventoryData.items.map(item => this.applyFinalPrioritization(item));
    
    // Sort by final priority score
    const sortedItems = processedItems.sort((a, b) => 
      b.finalScoring.finalScore - a.finalScoring.finalScore
    );

    // Generate final summary
    const summary = this.generateFinalSummary(processedItems);
    
    return {
      metadata: {
        ...inventoryData.metadata,
        finalAnalysisDate: new Date().toISOString(),
        frameworkVersion: '2.2.0',
        epic18Task: 'E18-1753114561979-82AADE',
        scoringCorrected: true,
        totalItemsProcessed: processedItems.length
      },
      summary,
      items: sortedItems,
      recommendations: this.generateFinalRecommendations(sortedItems, summary)
    };
  }

  /**
   * Generate final summary statistics
   */
  generateFinalSummary(processedItems) {
    const priorityCounts = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
    const effortByPriority = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
    const categoryStats = {};
    
    let totalScore = 0;
    let priorityChanges = 0;
    
    processedItems.forEach(item => {
      const priority = item.finalScoring.calculatedPriority;
      priorityCounts[priority]++;
      effortByPriority[priority] += item.estimatedHours;
      totalScore += item.finalScoring.finalScore;
      
      if (item.priorityChange.priorityChanged) {
        priorityChanges++;
      }
      
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { 
          count: 0, 
          totalScore: 0, 
          averageScore: 0,
          highestPriority: 'P4'
        };
      }
      categoryStats[item.category].count++;
      categoryStats[item.category].totalScore += item.finalScoring.finalScore;
      
      // Track highest priority in category
      const priorityOrder = { P0: 4, P1: 3, P2: 2, P3: 1, P4: 0 };
      const currentHighest = categoryStats[item.category].highestPriority;
      if (priorityOrder[priority] > priorityOrder[currentHighest]) {
        categoryStats[item.category].highestPriority = priority;
      }
    });

    // Calculate category averages
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.averageScore = Math.round(stats.totalScore / stats.count * 10) / 10;
    });

    return {
      priorityDistribution: priorityCounts,
      effortByPriority,
      categoryStats,
      overallAverageScore: Math.round(totalScore / processedItems.length * 10) / 10,
      priorityChanges,
      totalEffort: processedItems.reduce((sum, item) => sum + item.estimatedHours, 0),
      criticalPathEffort: effortByPriority.P0 + effortByPriority.P1
    };
  }

  /**
   * Generate final recommendations
   */
  generateFinalRecommendations(sortedItems, summary) {
    const recommendations = [];
    
    // Critical items (P0)
    const p0Items = sortedItems.filter(item => item.finalScoring.calculatedPriority === 'P0');
    if (p0Items.length > 0) {
      recommendations.push({
        type: 'IMMEDIATE_ACTION',
        priority: 'CRITICAL',
        title: 'Critical Security Vulnerabilities - Deployment Blockers',
        message: `${p0Items.length} critical items are blocking deployment and must be resolved immediately`,
        items: p0Items.map(item => ({
          id: item.id,
          title: item.title,
          effort: item.estimatedHours,
          score: item.finalScoring.finalScore,
          reason: item.blocksDeployment ? 'Deployment blocker' : 'Critical security risk'
        })),
        totalEffort: summary.effortByPriority.P0,
        timeframe: 'Within 24-48 hours',
        impact: 'Blocks production deployment',
        requiredResources: 'Senior developer + security reviewer'
      });
    }

    // High priority items (P1)
    const p1Items = sortedItems.filter(item => item.finalScoring.calculatedPriority === 'P1');
    if (p1Items.length > 0) {
      recommendations.push({
        type: 'HIGH_PRIORITY_SPRINT',
        priority: 'HIGH',
        title: 'High Priority Items for Immediate Sprint',
        message: `${p1Items.length} high priority items should be addressed in the next sprint`,
        items: p1Items.map(item => ({
          id: item.id,
          title: item.title,
          effort: item.estimatedHours,
          score: item.finalScoring.finalScore
        })),
        totalEffort: summary.effortByPriority.P1,
        timeframe: 'Next 1-2 weeks'
      });
    }

    // Medium priority batch
    const p2Items = sortedItems.filter(item => item.finalScoring.calculatedPriority === 'P2');
    if (p2Items.length > 0) {
      recommendations.push({
        type: 'MEDIUM_PRIORITY_BATCH',
        priority: 'MEDIUM',
        title: 'Medium Priority Technical Debt',
        message: `${p2Items.length} medium priority items for upcoming sprints`,
        totalEffort: summary.effortByPriority.P2,
        timeframe: 'Next 4-6 weeks'
      });
    }

    // Security category focus
    const securityItems = sortedItems.filter(item => item.category === 'security');
    const criticalSecurity = securityItems.filter(item => 
      item.finalScoring.calculatedPriority === 'P0' || 
      item.finalScoring.calculatedPriority === 'P1'
    );
    
    if (criticalSecurity.length > 0) {
      recommendations.push({
        type: 'SECURITY_FOCUS',
        priority: 'CRITICAL',
        title: 'Security-First Approach Required',
        message: `${criticalSecurity.length} security vulnerabilities need immediate resolution`,
        recommendation: 'Establish dedicated security remediation workflow',
        securityImplications: 'Prevents potential data breaches and system compromise'
      });
    }

    // Resource allocation based on critical path
    if (summary.criticalPathEffort > 0) {
      const teamSize = Math.ceil(summary.criticalPathEffort / 40); // 40 hours per person per week
      recommendations.push({
        type: 'RESOURCE_ALLOCATION',
        priority: 'HIGH',
        title: 'Critical Path Resource Planning',
        message: `Critical path (P0 + P1) requires ${summary.criticalPathEffort} hours`,
        recommendation: `Allocate ${teamSize} developer(s) for immediate action`,
        estimatedDuration: `${Math.ceil(summary.criticalPathEffort / (teamSize * 40))} week(s)`,
        breakdown: {
          p0Effort: summary.effortByPriority.P0,
          p1Effort: summary.effortByPriority.P1,
          totalCriticalPath: summary.criticalPathEffort
        }
      });
    }

    return recommendations;
  }

  /**
   * Generate comprehensive final report
   */
  generateFinalReport(processedData) {
    const report = [];
    
    report.push('# Final Technical Debt Prioritization Report');
    report.push(`**Generated**: ${new Date().toISOString()}`);
    report.push('**Epic 18 Task**: E18-1753114561979-82AADE - Apply framework to inventory');
    report.push('**Framework Version**: 2.2.0 (Final Corrected)');
    report.push('**Scoring Method**: Epic 18 Prioritization Framework (100-point scale)\n');
    
    // Executive Summary
    report.push('## 📊 Executive Summary\n');
    report.push(`**Total Items Analyzed**: ${processedData.items.length}`);
    report.push(`**Overall Average Score**: ${processedData.summary.overallAverageScore}/100`);
    report.push(`**Critical Path Effort**: ${processedData.summary.criticalPathEffort} hours`);
    report.push(`**Items with Priority Changes**: ${processedData.summary.priorityChanges}\n`);
    
    // Priority Distribution
    report.push('## 🎯 Priority Distribution\n');
    Object.entries(processedData.summary.priorityDistribution).forEach(([priority, count]) => {
      const effort = processedData.summary.effortByPriority[priority];
      const percentage = ((count / processedData.items.length) * 100).toFixed(1);
      report.push(`- **${priority}**: ${count} items (${effort} hours, ${percentage}%)`);
    });
    report.push('');
    
    // Critical Items Section
    const criticalItems = processedData.items.filter(item => 
      item.finalScoring.calculatedPriority === 'P0'
    );
    
    if (criticalItems.length > 0) {
      report.push('## 🚨 CRITICAL ITEMS (P0) - IMMEDIATE ACTION REQUIRED\n');
      report.push('⚠️ **These items are blocking deployment and must be resolved immediately**\n');
      
      criticalItems.forEach((item, index) => {
        const scoring = item.finalScoring;
        report.push(`### ${index + 1}. ${item.title} (${item.id})\n`);
        report.push(`**Priority Score**: ${scoring.finalScore}/100`);
        report.push(`**Category**: ${item.category}`);
        report.push(`**Estimated Effort**: ${item.estimatedHours} hours`);
        report.push(`**Location**: \`${item.location}\``);
        report.push(`**Impact**: ${item.impact}`);
        
        if (item.blocksDeployment) {
          report.push('**🚫 DEPLOYMENT BLOCKER** - Cannot deploy until resolved');
        }
        
        report.push('\n**Scoring Breakdown**:');
        report.push(`- Impact: ${scoring.componentScores.impact}/10 → ${scoring.weightedScores.impact}/40`);
        report.push(`- Risk: ${scoring.componentScores.risk}/10 → ${scoring.weightedScores.risk}/30`);
        report.push(`- Effort: ${scoring.componentScores.effort}/10 → ${scoring.weightedScores.effort}/20`);
        report.push(`- Strategic: ${scoring.componentScores.strategic}/10 → ${scoring.weightedScores.strategic}/10`);
        
        if (scoring.adjustmentFactors.length > 0) {
          report.push(`- Adjustments: ${scoring.adjustmentFactors.join(', ')}`);
        }
        
        report.push(`- **Total**: ${scoring.finalScore}/100\n`);
        
        report.push('**Success Criteria**:');
        item.successCriteria.forEach(criteria => {
          report.push(`- ${criteria}`);
        });
        report.push('\n---\n');
      });
    }
    
    // High Priority Items
    const highPriorityItems = processedData.items.filter(item => 
      item.finalScoring.calculatedPriority === 'P1'
    );
    
    if (highPriorityItems.length > 0) {
      report.push('## 🔥 HIGH PRIORITY ITEMS (P1) - NEXT SPRINT\n');
      highPriorityItems.forEach((item, index) => {
        const score = item.finalScoring.finalScore;
        report.push(`${index + 1}. **${item.title}** (${item.id})`);
        report.push(`   - Score: ${score}/100 | Effort: ${item.estimatedHours}h | Category: ${item.category}`);
        report.push(`   - Location: \`${item.location}\``);
        report.push('');
      });
    }
    
    // Category Analysis
    report.push('## 📈 Category Analysis\n');
    Object.entries(processedData.summary.categoryStats).forEach(([category, stats]) => {
      report.push(`**${category.toUpperCase()}**:`);
      report.push(`- Items: ${stats.count}`);
      report.push(`- Average Score: ${stats.averageScore}/100`);
      report.push(`- Highest Priority: ${stats.highestPriority}`);
      report.push('');
    });
    
    // Recommendations
    report.push('## 📋 IMPLEMENTATION RECOMMENDATIONS\n');
    processedData.recommendations.forEach((rec, index) => {
      report.push(`### ${index + 1}. ${rec.title}\n`);
      report.push(`**Priority**: ${rec.priority}`);
      report.push(`**Message**: ${rec.message}`);
      
      if (rec.totalEffort) {
        report.push(`**Total Effort**: ${rec.totalEffort} hours`);
      }
      if (rec.timeframe) {
        report.push(`**Timeframe**: ${rec.timeframe}`);
      }
      if (rec.requiredResources) {
        report.push(`**Required Resources**: ${rec.requiredResources}`);
      }
      if (rec.recommendation) {
        report.push(`**Recommendation**: ${rec.recommendation}`);
      }
      
      if (rec.items && rec.items.length > 0) {
        report.push('\n**Items**:');
        rec.items.forEach(item => {
          if (typeof item === 'object' && item.title) {
            report.push(`- ${item.title} (${item.id}) - ${item.effort}h - Score: ${item.score}/100`);
          } else {
            report.push(`- ${item}`);
          }
        });
      }
      report.push('\n');
    });
    
    // Implementation Roadmap
    report.push('## 🗺️ IMPLEMENTATION ROADMAP\n');
    
    const p0Count = processedData.summary.priorityDistribution.P0;
    const p1Count = processedData.summary.priorityDistribution.P1;
    const p0Effort = processedData.summary.effortByPriority.P0;
    const p1Effort = processedData.summary.effortByPriority.P1;
    
    if (p0Count > 0) {
      report.push('### Phase 1: Critical Security Fixes (Immediate)');
      report.push(`- **Items**: ${p0Count} critical deployment blockers`);
      report.push(`- **Effort**: ${p0Effort} hours`);
      report.push('- **Duration**: 1-2 days');
      report.push('- **Team**: Senior developer + security reviewer');
      report.push('- **Outcome**: Deployment unblocked, critical security vulnerabilities resolved\n');
    }
    
    if (p1Count > 0) {
      report.push('### Phase 2: High Priority Issues (Next Sprint)');
      report.push(`- **Items**: ${p1Count} high priority items`);
      report.push(`- **Effort**: ${p1Effort} hours`);
      report.push('- **Duration**: 1-2 weeks');
      report.push('- **Team**: Development team');
      report.push('- **Outcome**: Major technical debt addressed\n');
    }
    
    const p2Count = processedData.summary.priorityDistribution.P2;
    const p2Effort = processedData.summary.effortByPriority.P2;
    
    if (p2Count > 0) {
      report.push('### Phase 3: Medium Priority Improvements (Upcoming Sprints)');
      report.push(`- **Items**: ${p2Count} medium priority items`);
      report.push(`- **Effort**: ${p2Effort} hours`);
      report.push('- **Duration**: 4-6 weeks');
      report.push('- **Team**: Development team (background work)');
      report.push('- **Outcome**: Code quality and maintainability improvements\n');
    }
    
    return report.join('\n');
  }

  /**
   * Save final results
   */
  saveResults(processedData, outputDir = './docs') {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Save final inventory
      const finalInventoryPath = path.join(outputDir, 'final-debt-inventory.json');
      fs.writeFileSync(finalInventoryPath, JSON.stringify(processedData, null, 2));
      
      // Save comprehensive report
      const reportPath = path.join(outputDir, 'final-prioritization-report.md');
      const report = this.generateFinalReport(processedData);
      fs.writeFileSync(reportPath, report);
      
      // Save executive dashboard summary
      const dashboardPath = path.join(outputDir, 'debt-prioritization-dashboard.json');
      const dashboard = {
        timestamp: new Date().toISOString(),
        epic18Task: 'E18-1753114561979-82AADE',
        frameworkVersion: '2.2.0',
        status: 'COMPLETE',
        summary: processedData.summary,
        criticalItems: processedData.items
          .filter(item => item.finalScoring.calculatedPriority === 'P0')
          .map(item => ({
            id: item.id,
            title: item.title,
            priority: item.finalScoring.calculatedPriority,
            score: item.finalScoring.finalScore,
            effort: item.estimatedHours,
            category: item.category,
            blocksDeployment: item.blocksDeployment,
            location: item.location
          })),
        recommendations: processedData.recommendations,
        nextActions: processedData.summary.priorityDistribution.P0 > 0 ? 
          'IMMEDIATE: Resolve critical deployment blockers' :
          processedData.summary.priorityDistribution.P1 > 0 ?
            'HIGH: Schedule high priority items for next sprint' :
            'MEDIUM: Continue with planned technical debt reduction'
      };
      fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
      
      console.log('✅ Final results saved:');
      console.log(`   📄 Complete inventory: ${finalInventoryPath}`);
      console.log(`   📊 Comprehensive report: ${reportPath}`);
      console.log(`   📈 Executive dashboard: ${dashboardPath}\n`);
      
      return {
        finalInventoryPath,
        reportPath,
        dashboardPath
      };
      
    } catch (error) {
      console.error(`❌ Failed to save results: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🎯 Final Technical Debt Prioritization Framework Application');
    console.log('Epic 18 Task: E18-1753114561979-82AADE - Apply framework to inventory');
    console.log('Framework: Epic 18.1.6 Prioritization Framework (100-point scale)\n');
    
    const engine = new FinalDebtPrioritizationEngine();
    
    // Load existing inventory
    console.log('📖 Loading debt inventory...');
    const inventoryData = engine.loadDebtInventory();
    console.log(`✅ Loaded ${inventoryData.items.length} debt items\n`);
    
    // Process with final corrected framework
    const processedData = engine.processInventory(inventoryData);
    
    // Display summary
    console.log('📊 FINAL PRIORITIZATION RESULTS');
    console.log('═'.repeat(70));
    console.log(`Overall Average Score: ${processedData.summary.overallAverageScore}/100`);
    console.log(`Total Effort: ${processedData.summary.totalEffort} hours`);
    console.log(`Critical Path: ${processedData.summary.criticalPathEffort} hours\n`);
    
    console.log('Priority Distribution:');
    Object.entries(processedData.summary.priorityDistribution).forEach(([priority, count]) => {
      const effort = processedData.summary.effortByPriority[priority];
      const percentage = ((count / processedData.items.length) * 100).toFixed(1);
      console.log(`  ${priority}: ${count} items (${effort} hours, ${percentage}%)`);
    });
    console.log('');
    
    // Display critical items
    const criticalItems = processedData.items.filter(item => 
      item.finalScoring.calculatedPriority === 'P0'
    );
    
    if (criticalItems.length > 0) {
      console.log('🚨 CRITICAL ITEMS (P0) - DEPLOYMENT BLOCKERS:');
      criticalItems.forEach((item, index) => {
        const score = item.finalScoring.finalScore;
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   Score: ${score}/100 | Effort: ${item.estimatedHours}h | Category: ${item.category}`);
      });
      console.log('');
    }
    
    // Display high priority items
    const highPriorityItems = processedData.items.filter(item => 
      item.finalScoring.calculatedPriority === 'P1'
    );
    
    if (highPriorityItems.length > 0) {
      console.log('🔥 HIGH PRIORITY ITEMS (P1) - NEXT SPRINT:');
      highPriorityItems.forEach((item, index) => {
        const score = item.finalScoring.finalScore;
        console.log(`${index + 1}. ${item.title} (${score}/100, ${item.estimatedHours}h)`);
      });
      console.log('');
    }
    
    // Save final results
    console.log('💾 Saving final results...');
    const savedPaths = engine.saveResults(processedData);
    
    console.log('🎉 Epic 18 Prioritization Framework Application COMPLETE!');
    
    if (criticalItems.length > 0) {
      console.log('\n🚨 IMMEDIATE ACTION REQUIRED:');
      console.log(`${criticalItems.length} critical items are blocking deployment!`);
      console.log(`Estimated effort: ${processedData.summary.effortByPriority.P0} hours`);
      console.log('These must be resolved before production deployment.');
    } else {
      console.log('\n✅ No critical deployment blockers identified.');
      if (highPriorityItems.length > 0) {
        console.log(`${highPriorityItems.length} high priority items should be scheduled for the next sprint.`);
      }
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Review the comprehensive prioritization report');
    console.log('2. Implement recommendations starting with P0 items');
    console.log('3. Schedule P1 items for immediate sprint planning');
    console.log('4. Use the dashboard for ongoing tracking');
    
  } catch (error) {
    console.error(`❌ Framework application failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { FinalDebtPrioritizationEngine };