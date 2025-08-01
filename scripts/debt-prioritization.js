#!/usr/bin/env node

/**
 * Technical Debt Prioritization Engine
 * Automated scoring and prioritization of technical debt items
 * 
 * Usage: node scripts/debt-prioritization.js
 */

const fs = require('fs');
const path = require('path');

class DebtPrioritizationEngine {
  constructor() {
    this.weights = {
      impact: 0.4,
      risk: 0.3,
      effort: 0.2,
      strategic: 0.1
    };
    
    this.scoringRules = {
      businessImpact: {
        'critical': 10,
        'high': 7,
        'medium': 5,
        'low': 3,
        'minimal': 1
      },
      technicalImpact: {
        'critical': 10,
        'high': 7,
        'medium': 5,
        'low': 3,
        'minimal': 1
      },
      securityRisk: {
        'critical': 10,
        'high': 7,
        'medium': 5,
        'low': 3,
        'minimal': 1
      },
      reliabilityRisk: {
        'critical': 10,
        'high': 7,
        'medium': 5,
        'low': 3,
        'minimal': 1
      },
      developmentEffort: {
        'xs': 10,
        's': 7,
        'm': 5,
        'l': 3,
        'xl': 1
      },
      testingEffort: {
        'low': 10,
        'medium': 7,
        'high': 5,
        'critical': 3,
        'extensive': 1
      },
      architectureAlignment: {
        'high': 10,
        'medium': 7,
        'low': 5,
        'negative': 1
      },
      businessAlignment: {
        'high': 10,
        'medium': 7,
        'low': 5,
        'negative': 1

    };


  calculateScore(debtItem: any): number {
    const impact = this.calculateImpactScore(debtItem);
    const risk = this.calculateRiskScore(debtItem);
    const effort = this.calculateEffortScore(debtItem);
    const strategic = this.calculateStrategicScore(debtItem);
    
    let totalScore = (
      impact * this.weights.impact +
      risk * this.weights.risk +
      effort * this.weights.effort +
      strategic * this.weights.strategic
    );
    
    // Apply adjustment factors
    totalScore = this.applyAdjustmentFactors(debtItem, totalScore);
    
    return Math.min(100, Math.max(0, totalScore));


  calculateImpactScore(debtItem: any): number {
    // Infer impact from severity and category
    let businessImpact = 'medium';
    let technicalImpact = 'medium';
    
    if (debtItem.severity === 'critical') {
      businessImpact = 'critical';
      technicalImpact = 'critical';
 else if (debtItem.severity === 'high') {
      businessImpact = 'high';
      technicalImpact = 'high';
 else if (debtItem.severity === 'medium') {
      businessImpact = 'medium';
      technicalImpact = 'medium';
 else if (debtItem.severity === 'low') {
      businessImpact = 'low';
      technicalImpact = 'low';

    
    // Adjust based on category
    if (debtItem.category === 'security') {
      businessImpact = this.increaseLevel(businessImpact);
 else if (debtItem.category === 'performance') {
      businessImpact = this.increaseLevel(businessImpact);
 else if (debtItem.category === 'maintainability') {
      technicalImpact = this.increaseLevel(technicalImpact);

    
    const businessScore = this.scoringRules.businessImpact[businessImpact] || 5;
    const technicalScore = this.scoringRules.technicalImpact[technicalImpact] || 5;
    
    return (businessScore + technicalScore) / 2;


  calculateRiskScore(debtItem: any): number {
    let securityRisk = 'minimal';
    let reliabilityRisk = 'minimal';
    
    if (debtItem.category === 'security') {
      securityRisk = debtItem.severity;
 else if (debtItem.category === 'reliability') {
      reliabilityRisk = debtItem.severity;
 else if (debtItem.category === 'performance') {
      reliabilityRisk = debtItem.severity;

    
    // Adjust based on deployment blocker
    if (debtItem.blocksDeployment) {
      securityRisk = this.increaseLevel(securityRisk);
      reliabilityRisk = this.increaseLevel(reliabilityRisk);

    
    const securityScore = this.scoringRules.securityRisk[securityRisk] || 1;
    const reliabilityScore = this.scoringRules.reliabilityRisk[reliabilityRisk] || 1;
    
    return (securityScore + reliabilityScore) / 2;


  calculateEffortScore(debtItem: any): number {
    const developmentEffort = this.scoringRules.developmentEffort[debtItem.effort.toLowerCase()] || 5;
    
    // Infer testing effort from security and testing requirements
    let testingEffort = 'medium';
    if (debtItem.remediation && debtItem.remediation.securityReviewRequired) {
      testingEffort = 'critical';
 else if (debtItem.remediation && debtItem.remediation.testingRequired) {
      testingEffort = 'high';

    
    const testingScore = this.scoringRules.testingEffort[testingEffort] || 7;
    
    return (developmentEffort * 0.75) + (testingScore * 0.25);


  calculateStrategicScore(debtItem: any): number {
    // Infer strategic alignment from category and tags
    let architectureAlignment = 'medium';
    let businessAlignment = 'medium';
    
    if (debtItem.category === 'security') {
      architectureAlignment = 'high';
      businessAlignment = 'high';
 else if (debtItem.category === 'performance') {
      businessAlignment = 'high';
 else if (debtItem.category === 'maintainability') {
      architectureAlignment = 'high';
 else if (debtItem.category === 'developer_experience') {
      architectureAlignment = 'medium';

    
    // Adjust based on tags
    if (debtItem.tags.includes('architecture')) {
      architectureAlignment = 'high';
 else if (debtItem.tags.includes('refactoring')) {
      architectureAlignment = 'high';

    
    const architectureScore = this.scoringRules.architectureAlignment[architectureAlignment] || 5;
    const businessScore = this.scoringRules.businessAlignment[businessAlignment] || 5;
    
    return (architectureScore + businessScore) / 2;


  applyAdjustmentFactors(debtItem: any, baseScore: number): number {
    let adjustedScore = baseScore;
    
    // Deployment blocker multiplier - significant boost
    if (debtItem.blocksDeployment) {
      adjustedScore *= 5.0; // Much higher multiplier for deployment blockers

    
    // Critical security multiplier
    if (debtItem.category === 'security' && debtItem.severity === 'critical') {
      adjustedScore *= 3.0; // High multiplier for critical security

    
    // High security multiplier
    if (debtItem.category === 'security' && debtItem.severity === 'high') {
      adjustedScore *= 2.0; // Moderate multiplier for high security

    
    // Performance impact multiplier
    if (debtItem.category === 'performance' && debtItem.severity === 'high') {
      adjustedScore *= 1.5;

    
    // Add base score boost for security items
    if (debtItem.category === 'security') {
      adjustedScore += 20; // Add flat 20 points for all security items

    
    return adjustedScore;


  increaseLevel(level: string): string {
    const levels = ['minimal', 'low', 'medium', 'high', 'critical'];
    const currentIndex = levels.indexOf(level);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];


  assignPriority(score: number): string {
    if (score >= 90) return 'P0';
    if (score >= 80) return 'P1';
    if (score >= 70) return 'P2';
    if (score >= 60) return 'P3';
    return 'P4';


  generatePrioritizedList(debtItems: any[]): any[] {
    const scoredItems = debtItems.map((item: any) => {
      const priorityScore = this.calculateScore(item);
      const calculatedPriority = this.assignPriority(priorityScore);
      
      return {
        ...item,
        priorityScore: Math.round(priorityScore * 10) / 10,
        calculatedPriority,
        scoreBreakdown: this.generateScoreBreakdown(item)
      };
    });
    
    return scoredItems.sort((a, b) => b.priorityScore - a.priorityScore);


  generateScoreBreakdown(debtItem: any): any {
    const impact = this.calculateImpactScore(debtItem);
    const risk = this.calculateRiskScore(debtItem);
    const effort = this.calculateEffortScore(debtItem);
    const strategic = this.calculateStrategicScore(debtItem);
    
    return {
      impact: Math.round(impact * 10) / 10,
      risk: Math.round(risk * 10) / 10,
      effort: Math.round(effort * 10) / 10,
      strategic: Math.round(strategic * 10) / 10,
      weighted: {
        impact: Math.round(impact * this.weights.impact * 10) / 10,
        risk: Math.round(risk * this.weights.risk * 10) / 10,
        effort: Math.round(effort * this.weights.effort * 10) / 10,
        strategic: Math.round(strategic * this.weights.strategic * 10) / 10

    };



class DebtReportGenerator {
  constructor() {
    this.prioritizationEngine = new DebtPrioritizationEngine();


  generateReport(prioritizedItems: any[]): any {
    const summary = this.generateSummary(prioritizedItems);
    const recommendations = this.generateRecommendations(prioritizedItems);
    
    return {
      timestamp: new Date().toISOString(),
      summary,
      prioritizedItems,
      recommendations,
      nextActions: this.generateNextActions(prioritizedItems)
    };


  generateSummary(items: any[]): any {
    const priorityDistribution = {
      'P0': 0, 'P1': 0, 'P2': 0, 'P3': 0, 'P4': 0
    };
    
    const categoryDistribution = {};
    let totalEffort = 0;
    let criticalEffort = 0;
    
    items.forEach((item: any) => {
      priorityDistribution[item.calculatedPriority]++;
      
      if (!categoryDistribution[item.category]) {
        categoryDistribution[item.category] = 0;

      categoryDistribution[item.category]++;
      
      totalEffort += item.estimatedHours;
      if (item.calculatedPriority === 'P0' || item.calculatedPriority === 'P1') {
        criticalEffort += item.estimatedHours;

    });
    
    return {
      totalItems: items.length,
      priorityDistribution,
      categoryDistribution,
      totalEffort,
      criticalEffort,
      averageScore: items.reduce((sum: number, item: any) => sum + item.priorityScore, 0) / items.length
    };


  generateRecommendations(items: any[]): any[] {
    const recommendations = [];
    
    const criticalItems = items.filter((item: any) => item.calculatedPriority === 'P0');
    if (criticalItems.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `${criticalItems.length} critical items require immediate attention`,
        items: criticalItems.map((item: any) => item.id),
        action: 'Allocate emergency resources to address these items within 24-48 hours'
      });

    
    const securityItems = items.filter((item: any) => item.category === 'security' && item.calculatedPriority !== 'P4');
    if (securityItems.length > 0) {
      recommendations.push({
        type: 'security',
        message: `${securityItems.length} security items need attention`,
        items: securityItems.map((item: any) => item.id),
        action: 'Schedule security review and remediation within 2 weeks'
      });

    
    const quickWins = items.filter((item: any) => 
      item.estimatedHours <= 4 && (item.calculatedPriority === 'P1' || item.calculatedPriority === 'P2')
    );
    if (quickWins.length > 0) {
      recommendations.push({
        type: 'quick_wins',
        message: `${quickWins.length} quick wins available`,
        items: quickWins.map((item: any) => item.id),
        action: 'Complete these items during sprint planning or maintenance windows'
      });

    
    return recommendations;


  generateNextActions(items: any[]): any[] {
    const nextActions = [];
    
    // Week 1: Critical items
    const week1Items = items.filter((item: any) => item.calculatedPriority === 'P0');
    if (week1Items.length > 0) {
      nextActions.push({
        timeframe: 'Week 1',
        priority: 'Critical',
        items: week1Items.slice(0, 3),
        totalEffort: week1Items.slice(0, 3).reduce((sum: number, item: any) => sum + item.estimatedHours, 0),
        team: 'Senior Developer + Security Reviewer'
      });

    
    // Week 2-3: High priority items
    const week2Items = items.filter((item: any) => item.calculatedPriority === 'P1');
    if (week2Items.length > 0) {
      nextActions.push({
        timeframe: 'Week 2-3',
        priority: 'High',
        items: week2Items.slice(0, 5),
        totalEffort: week2Items.slice(0, 5).reduce((sum: number, item: any) => sum + item.estimatedHours, 0),
        team: 'Senior Developer + Mid-level Developer'
      });

    
    // Month 1-2: Medium priority items
    const month1Items = items.filter((item: any) => item.calculatedPriority === 'P2');
    if (month1Items.length > 0) {
      nextActions.push({
        timeframe: 'Month 1-2',
        priority: 'Medium',
        items: month1Items.slice(0, 8),
        totalEffort: month1Items.slice(0, 8).reduce((sum: number, item: any) => sum + item.estimatedHours, 0),
        team: 'Full Development Team'
      });

    
    return nextActions;


  generateMarkdownReport(report: any): string {
    const { timestamp, summary, prioritizedItems, recommendations, nextActions } = report;
    
    return `# Technical Debt Prioritization Report

**Generated**: ${timestamp}
**Total Items**: ${summary.totalItems}
**Average Score**: ${summary.averageScore.toFixed(1)}

## Summary

### Priority Distribution
${Object.entries(summary.priorityDistribution).map(([priority, count]: [string, number]) => 
    `- **${priority}**: ${count} items`
  ).join('\n')}

### Category Distribution
${Object.entries(summary.categoryDistribution).map(([category, count]: [string, number]) => 
    `- **${category}**: ${count} items`
  ).join('\n')}

### Effort Summary
- **Total Effort**: ${summary.totalEffort} hours
- **Critical Effort**: ${summary.criticalEffort} hours (${((summary.criticalEffort / summary.totalEffort) * 100).toFixed(1)}%)

## Top Priority Items

${prioritizedItems.slice(0, 10).map((item: any, index: number) => `
### ${index + 1}. ${item.title} (${item.id})
- **Priority**: ${item.calculatedPriority} (Score: ${item.priorityScore})
- **Category**: ${item.category}
- **Effort**: ${item.estimatedHours} hours
- **Location**: ${item.location}
- **Description**: ${item.description}

**Score Breakdown**:
- Impact: ${item.scoreBreakdown.impact} (weighted: ${item.scoreBreakdown.weighted.impact})
- Risk: ${item.scoreBreakdown.risk} (weighted: ${item.scoreBreakdown.weighted.risk})
- Effort: ${item.scoreBreakdown.effort} (weighted: ${item.scoreBreakdown.weighted.effort})
- Strategic: ${item.scoreBreakdown.strategic} (weighted: ${item.scoreBreakdown.weighted.strategic})
`).join('\n')}

## Recommendations

${recommendations.map((rec: any) => `
### ${rec.type.toUpperCase()}: ${rec.message}
**Action**: ${rec.action}
**Items**: ${rec.items.join(', ')}
`).join('\n')}

## Next Actions

${nextActions.map((action: any) => `
### ${action.timeframe} - ${action.priority} Priority
- **Team**: ${action.team}
- **Total Effort**: ${action.totalEffort} hours
- **Items**: ${action.items.map((item: any) => `${item.id} (${item.estimatedHours}h)`).join(', ')}
`).join('\n')}

## Conclusion

This prioritization analysis provides a systematic approach to addressing technical debt. Focus on critical security items first, followed by high-impact items with reasonable effort requirements.

**Key Actions**:
1. Immediately address P0 items (deployment blockers)
2. Schedule P1 items within 2 weeks
3. Plan P2 items for next sprint cycle
4. Review and update prioritization monthly

---
*Generated by Technical Debt Prioritization Engine*`;



async function main(): Promise<void> {
  console.log('🚀 Starting Technical Debt Prioritization...\n');
  
  try {
    // Load debt inventory
    const inventoryPath = path.join(__dirname, '..', 'docs', 'debt-inventory.json');
    if (!fs.existsSync(inventoryPath)) {
      throw new Error(`Debt inventory not found at ${inventoryPath}`);

    
    const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    const debtItems = inventoryData.items || [];
    
    console.log(`📊 Loaded ${debtItems.length} debt items from inventory`);
    
    // Initialize prioritization engine
    const engine = new DebtPrioritizationEngine();
    const reportGenerator = new DebtReportGenerator();
    
    // Generate prioritized list
    const prioritizedItems = engine.generatePrioritizedList(debtItems);
    
    // Generate comprehensive report
    const report = reportGenerator.generateReport(prioritizedItems);
    
    // Save JSON report
    const reportPath = path.join(__dirname, '..', 'docs', 'debt-priority-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Save Markdown report
    const markdownReport = reportGenerator.generateMarkdownReport(report);
    const markdownPath = path.join(__dirname, '..', 'docs', 'debt-priority-report.md');
    fs.writeFileSync(markdownPath, markdownReport);
    
    // Update inventory with priority scores
    const updatedInventory = {
      ...inventoryData,
      items: prioritizedItems,
      lastPrioritization: new Date().toISOString(),
      prioritizationSummary: report.summary
    };
    
    fs.writeFileSync(inventoryPath, JSON.stringify(updatedInventory, null, 2));
    
    console.log('\n✅ Prioritization complete!');
    console.log(`📊 Total items: ${report.summary.totalItems}`);
    console.log(`🔴 Critical (P0): ${report.summary.priorityDistribution.P0}`);
    console.log(`🟡 High (P1): ${report.summary.priorityDistribution.P1}`);
    console.log(`🟠 Medium (P2): ${report.summary.priorityDistribution.P2}`);
    console.log(`🟢 Low (P3): ${report.summary.priorityDistribution.P3}`);
    
    console.log('\n📋 Reports saved:');
    console.log(`   JSON: ${reportPath}`);
    console.log(`   Markdown: ${markdownPath}`);
    
    // Show top 3 priority items
    console.log('\n🎯 Top 3 Priority Items:');
    prioritizedItems.slice(0, 3).forEach((item: any, index: number) => {
      console.log(`   ${index + 1}. ${item.id}: ${item.title} (${item.calculatedPriority}, ${item.priorityScore})`);
    });
    
    // Show critical recommendations
    if (report.recommendations.length > 0) {
      console.log('\n⚠️  Critical Recommendations:');
      report.recommendations.forEach((rec: any) => {
        console.log(`   - ${rec.message}`);
      });

 catch (error) {
    console.error('❌ Prioritization failed:', error);
    process.exit(1);



if (require.main === module) {
  main();


module.exports = { DebtPrioritizationEngine, DebtReportGenerator };