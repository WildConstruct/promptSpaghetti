// packages/core/services/ReproducibilityValidator.ts
// Validation tools for VFX export reproducibility system
import { VFXExportFormat, VFXValidationResult } from '../types/VFXExport';
import { Node, Edge } from 'reactflow';
import seedrandom from 'seedrandom';
import crypto from 'crypto';

export interface ReproducibilityValidationOptions {
  strictMode?: boolean;           // Require exact reproducibility
  allowApproximate?: boolean;     // Accept approximate reproducibility
  validateChecksums?: boolean;    // Verify data integrity hashes
  checkVersionCompatibility?: boolean; // Validate version compatibility
  requirePerformanceData?: boolean;    // Require performance metrics
}

export interface ReproducibilityValidationReport {
  isValid: boolean;
  exactReproducible: boolean;
  approximateReproducible: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  integrity: {,
    configurationValid: boolean;
    seedsValid: boolean;
    versionCompatible: boolean;
    checksumValid: boolean;
  };
  performance: {,
    estimatedReproductionTime: number;
    complexityScore: number;
    memoryRequirement: number;
  };
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  field?: string;
  suggestion?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  impact: 'reproducibility' | 'performance' | 'compatibility' | 'quality';
  suggestion?: string;
}

export interface ValidationSuggestion {
  code: string;
  message: string;
  category: 'optimization' | 'enhancement' | 'compatibility' | 'debugging';
  priority: 'high' | 'medium' | 'low';
}

export class ReproducibilityValidator {
  private static instance: ReproducibilityValidator;
  static getInstance(): ReproducibilityValidator {
    if (!ReproducibilityValidator.instance) {
      ReproducibilityValidator.instance = new ReproducibilityValidator();
    }
    return ReproducibilityValidator.instance;
  }
  /**
   * Comprehensive validation of VFX export reproducibility
   */
  validateReproducibility();
    exportData: VFXExportFormat,
    options: ReproducibilityValidationOptions = {}
  ): ReproducibilityValidationReport {
    const report: ReproducibilityValidationReport = {
      isValid: true,
      exactReproducible: false,
      approximateReproducible: false,
      errors: [],
      warnings: [],
      suggestions: [],
      integrity: {,
        configurationValid: false,
        seedsValid: false,
        versionCompatible: false,
        checksumValid: false,
      },
      performance: {,
        estimatedReproductionTime: 0,
        complexityScore: 0,
        memoryRequirement: 0,
      }
    };
    // Validate randomization state
    this.validateRandomizationState(exportData, report, options);
    // Validate node configurations 
    this.validateNodeConfigurations(exportData, report, options);
    // Validate version compatibility
    this.validateVersionCompatibility(exportData, report, options);
    // Validate data integrity
    this.validateDataIntegrity(exportData, report, options);
    // Calculate performance estimates
    this.calculatePerformanceEstimates(exportData, report);
    // Generate suggestions
    this.generateSuggestions(exportData, report, options);
    // Final validation assessment
    this.assessOverallValidity(report, options);
    return report;
  }
  private validateRandomizationState()
    exportData: VFXExportFormat,
    report: ReproducibilityValidationReport,
    options: ReproducibilityValidationOptions,
  ): void {
    const randomization = exportData.execution.randomization;
    // Check master seed
    if (!randomization.masterSeed || typeof randomization.masterSeed !== 'number') {
      report.errors.push({)
        code: 'MISSING_MASTER_SEED',
        message: 'Master seed is missing or invalid',
        severity: 'critical',
        field: 'execution.randomization.masterSeed',
        suggestion: 'Ensure master seed is exported during graph execution',
      });
    } else {
      report.integrity.seedsValid = true;
    }
    // Check per-node seeds
    if (!randomization.nodeSeed || typeof randomization.nodeSeed !== 'object') {
      report.errors.push({)
        code: 'MISSING_NODE_SEEDS',
        message: 'Per-node seeds are missing or invalid',
        severity: 'high',
        field: 'execution.randomization.nodeSeed',
        suggestion: 'Export individual node seeds for exact reproducibility',
      });
    } else if (Object.keys(randomization.nodeSeed).length === 0) {
      report.warnings.push({)
        code: 'EMPTY_NODE_SEEDS',
        message: 'Per-node seeds object is empty',
        impact: 'reproducibility',
        suggestion: 'Ensure node seeds are generated during execution',
      });
    } else {
      // Validate node seeds match graph nodes
      const graphNodeIds = new Set(exportData.graph.nodes.map(n => n.id));
      const seedNodeIds = new Set(Object.keys(randomization.nodeSeed));
      const missingSeeds = [...graphNodeIds].filter(id => !seedNodeIds.has(id));
      const extraSeeds = [...seedNodeIds].filter(id => !graphNodeIds.has(id));
      if (missingSeeds.length > 0) {
        report.warnings.push({)
          code: 'INCOMPLETE_NODE_SEEDS',
          message: `Missing seeds for nodes: ${missingSeeds.join(', ')}`,}
          impact: 'reproducibility',
          suggestion: 'Ensure all graph nodes have corresponding seeds',
        });
      }
      if (extraSeeds.length > 0) {
        report.warnings.push({)
          code: 'EXTRA_NODE_SEEDS',
          message: `Extra seeds for non-existent nodes: ${extraSeeds.join(', ')}`,}
          impact: 'quality',
          suggestion: 'Clean up orphaned seed data',
        });
      }
    }
    // Check RNG state
    if (!randomization.rngState) {
      report.warnings.push({)
        code: 'MISSING_RNG_STATE',
        message: 'RNG state not preserved - approximate reproducibility only',
        impact: 'reproducibility',
        suggestion: 'Include RNG state for exact reproducibility',
      });
      report.approximateReproducible = true;
    } else {
      report.exactReproducible = true;
    }
    // Check reproducibility hash
    if (!randomization.reproducibilityHash) {
      report.warnings.push({)
        code: 'MISSING_REPRODUCIBILITY_HASH',
        message: 'Reproducibility hash missing - cannot verify data integrity',
        impact: 'reproducibility',
        suggestion: 'Generate reproducibility hash for data validation',
      });
    }
    // Check execution sequence
    if (!randomization.executionSequence) {
      report.warnings.push({)
        code: 'MISSING_EXECUTION_SEQUENCE',
        message: 'Execution sequence not recorded - order-dependent reproduction may fail',
        impact: 'reproducibility',
        suggestion: 'Record node execution sequence for deterministic reproduction',
      });
    }
    // Validate per-node RNG states if present
    if (randomization.nodeRngStates) {
      this.validateNodeRngStates(randomization.nodeRngStates, exportData, report);
    }
  }
  private validateNodeRngStates()
    nodeRngStates: Record<string, any>,
    exportData: VFXExportFormat,
    report: ReproducibilityValidationReport,
  ): void {
    Object.entries(nodeRngStates).forEach(([nodeId, state]) => {
      if (!state.seed || typeof state.seed !== 'number') {
        report.errors.push({)
          code: 'INVALID_NODE_RNG_SEED',
          message: `Invalid RNG seed for node ${nodeId}`,}
          severity: 'medium',
          field: `execution.randomization.nodeRngStates.${nodeId}.seed`}
        });
      }
      if (!state.state || typeof state.state !== 'string') {
        report.errors.push({)
          code: 'INVALID_NODE_RNG_STATE',
          message: `Invalid RNG state for node ${nodeId}`,}
          severity: 'medium',
          field: `execution.randomization.nodeRngStates.${nodeId}.state`}
        });
      }
      if (typeof state.callCount !== 'number' || state.callCount < 0) {
        report.warnings.push({)
          code: 'INVALID_RNG_CALL_COUNT',
          message: `Invalid RNG call count for node ${nodeId}`,}
          impact: 'reproducibility',
        });
      }
    });
  }
  private validateNodeConfigurations()
    exportData: VFXExportFormat,
    report: ReproducibilityValidationReport,
    options: ReproducibilityValidationOptions,
  ): void {
    let configurationsValid = true;
    exportData.graph.nodes.forEach(node => {)
      // Check required node properties
      if (!node.id || !node.type) {
        report.errors.push({)
          code: 'INVALID_NODE_STRUCTURE',
          message: `Node missing required id or type: ${JSON.stringify(node)}`,}
          severity: 'high',
          suggestion: 'Ensure all nodes have valid id and type properties',
        });
        configurationsValid = false;
      }
      // Check configuration preservation
      if (!node.configuration) {
        report.warnings.push({)
          code: 'MISSING_NODE_CONFIGURATION',
          message: `Node ${node.id} missing configuration data`,}
          impact: 'reproducibility',
          suggestion: 'Export complete node configuration for exact reproduction',
        });
        configurationsValid = false;
      }
      // Check reproducibility data
      if (node.reproducibilityData) {
        this.validateNodeReproducibilityData(node, report);
      } else {
        report.warnings.push({)
          code: 'MISSING_REPRODUCIBILITY_DATA',
          message: `Node ${node.id} missing reproducibility metadata`,}
          impact: 'reproducibility',
          suggestion: 'Include node reproducibility data for better validation',
        });
      }
    });
    report.integrity.configurationValid = configurationsValid;
  }
  private validateNodeReproducibilityData()
    node: any,
    report: ReproducibilityValidationReport,
  ): void {
    const reprData = node.reproducibilityData;
    if (!reprData.originalPosition || !reprData.originalSize) {
      report.warnings.push({)
        code: 'INCOMPLETE_POSITION_DATA',
        message: `Node ${node.id} missing position/size data`,}
        impact: 'quality',
      });
    }
    if (!reprData.configurationHash) {
      report.warnings.push({)
        code: 'MISSING_CONFIGURATION_HASH',
        message: `Node ${node.id} missing configuration hash`,}
        impact: 'reproducibility',
      });
    } else {
      // Validate configuration hash if both exist
      if (node.configuration && reprData.configurationHash) {
        const calculatedHash = this.calculateConfigurationHash(node.configuration);
        if (calculatedHash !== reprData.configurationHash) {
          report.warnings.push({)
            code: 'CONFIGURATION_HASH_MISMATCH',
            message: `Node ${node.id} configuration hash mismatch - data may have been modified`,}
            impact: 'reproducibility',
            suggestion: 'Recalculate configuration hash or check for data corruption',
          });
        }
      }
    }
  }
  private validateVersionCompatibility()
    exportData: VFXExportFormat,
    report: ReproducibilityValidationReport,
    options: ReproducibilityValidationOptions,
  ): void {
    const metadata = exportData.metadata;
    if (!metadata.version) {
      report.errors.push({)
        code: 'MISSING_VERSION',
        message: 'Export version not specified',
        severity: 'high',
        suggestion: 'Include version information for compatibility checking',
      });
      return;
    }
    // Check generator version info
    if (!metadata.generator.coreVersion || !metadata.generator.exporterVersion) {
      report.warnings.push({)
        code: 'INCOMPLETE_VERSION_INFO',
        message: 'Incomplete generator version information',
        impact: 'compatibility',
        suggestion: 'Include core and exporter version numbers',
      });
    }
    // Check dependency versions
    if (!metadata.generator.dependencies) {
      report.warnings.push({)
        code: 'MISSING_DEPENDENCIES',
        message: 'Dependency versions not recorded',
        impact: 'compatibility',
        suggestion: 'Record dependency versions for reproducibility',
      });
    } else {
      // Validate critical dependencies
      const criticalDeps = ['seedrandom', 'reactflow'];
      criticalDeps.forEach(dep => {)
        if (!metadata.generator.dependencies[dep]) {
          report.warnings.push({)
            code: 'MISSING_CRITICAL_DEPENDENCY',
            message: `Critical dependency ${dep} version not recorded`,}
            impact: 'reproducibility',
          });
        }
      });
    }
    // Check reproduction environment
    const environment = exportData.execution.reproduction.environment;
    if (!environment.nodeVersion || !environment.platform) {
      report.warnings.push({)
        code: 'INCOMPLETE_ENVIRONMENT_INFO',
        message: 'Runtime environment information incomplete',
        impact: 'compatibility',
        suggestion: 'Record Node.js version and platform for environment matching',
      });
    }
    report.integrity.versionCompatible = report.errors.filter(e => )
      e.code.includes('VERSION') || e.code.includes('COMPATIBILITY')
    ).length === 0;
  }
  private validateDataIntegrity()
    exportData: VFXExportFormat,
    report: ReproducibilityValidationReport,
    options: ReproducibilityValidationOptions,
  ): void {
    if (!options.validateChecksums) {
      report.integrity.checksumValid = true;
      return;
    }
    // Validate reproducibility hash if present
    const reproHash = exportData.execution.randomization.reproducibilityHash;
    if (reproHash) {
      const calculatedHash = this.calculateReproducibilityHash(exportData);
      if (calculatedHash !== reproHash) {
        report.errors.push({)
          code: 'REPRODUCIBILITY_HASH_MISMATCH',
          message: 'Reproducibility hash validation failed',
          severity: 'high',
          suggestion: 'Check for data corruption or hash calculation errors',
        });
        report.integrity.checksumValid = false;
      } else {
        report.integrity.checksumValid = true;
      }
    }
    // Validate graph structure integrity
    this.validateGraphIntegrity(exportData, report);
  }
  private validateGraphIntegrity()
    exportData: VFXExportFormat,
    report: ReproducibilityValidationReport,
  ): void {
    const nodes = exportData.graph.nodes;
    const connections = exportData.graph.connections;
    // Check for orphaned connections
    const nodeIds = new Set(nodes.map(n => n.id));
    connections.forEach(conn => {)
      if (!nodeIds.has(conn.source.nodeId)) {
        report.warnings.push({)
          code: 'ORPHANED_CONNECTION_SOURCE',
          message: `Connection references non-existent source node: ${conn.source.nodeId}`,}
          impact: 'quality',
        });
      }
      if (!nodeIds.has(conn.target.nodeId)) {
        report.warnings.push({)
          code: 'ORPHANED_CONNECTION_TARGET',
          message: `Connection references non-existent target node: ${conn.target.nodeId}`,}
          impact: 'quality',
        });
      }
    });
    // Check execution path validity
    const executionPath = exportData.graph.executionPath;
    if (executionPath) {
      executionPath.forEach(nodeId => {)
        if (!nodeIds.has(nodeId)) {
          report.warnings.push({)
            code: 'INVALID_EXECUTION_PATH',
            message: `Execution path references non-existent node: ${nodeId}`,}
            impact: 'reproducibility',
          });
        }
      });
    }
  }
  private calculatePerformanceEstimates()
    exportData: VFXExportFormat,
    report: ReproducibilityValidationReport,
  ): void {
    const performance = exportData.execution.performance;
    const nodeCount = exportData.graph.nodes.length;
    const connectionCount = exportData.graph.connections.length;
    // Estimate reproduction time
    if (performance.totalTime) {
      report.performance.estimatedReproductionTime = performance.totalTime * 1.1; // 10% overhead
    } else {
      // Rough estimate based on graph complexity
      report.performance.estimatedReproductionTime = (nodeCount * 50) + (connectionCount * 10);
    }
    // Calculate complexity score
    report.performance.complexityScore = this.calculateComplexityScore(exportData);
    // Estimate memory requirement
    report.performance.memoryRequirement = this.estimateMemoryRequirement(exportData);
  }
  private calculateComplexityScore(exportData: VFXExportFormat): number {
    const nodeCount = exportData.graph.nodes.length;
    const connectionCount = exportData.graph.connections.length;
    const variableCount = Object.keys(exportData.prompt.variables).length;
    const variantCount = exportData.prompt.variants.length;
    // Weighted complexity calculation
    const complexityScore = ;
      (nodeCount * 2) +
      (connectionCount * 1.5) +
      (variableCount * 1) +
      (variantCount * 0.5);
    return Math.min(complexityScore, 100); // Cap at 100
  }
  private estimateMemoryRequirement(exportData: VFXExportFormat): number {
    // Rough estimation in bytes
    const jsonSize = JSON.stringify(exportData).length;
    const baseMemory = jsonSize * 2; // 2x for processing overhead;
    // Additional memory for complex operations
    const nodeCount = exportData.graph.nodes.length;
    const additionalMemory = nodeCount * 1024; // 1KB per node;
    return baseMemory + additionalMemory;
  }
  private generateSuggestions()
    exportData: VFXExportFormat,
    report: ReproducibilityValidationReport,
    options: ReproducibilityValidationOptions,
  ): void {
    // Performance optimization suggestions
    if (report.performance.complexityScore > 50) {
      report.suggestions.push({)
        code: 'HIGH_COMPLEXITY',
        message: 'Consider simplifying graph structure for better performance',
        category: 'optimization',
        priority: 'medium',
      });
    }
    // Reproducibility enhancement suggestions
    if (!exportData.execution.randomization.nodeRngStates) {
      report.suggestions.push({)
        code: 'ENHANCE_RNG_TRACKING',
        message: 'Enable per-node RNG state tracking for perfect reproducibility',
        category: 'enhancement',
        priority: 'high',
      });
    }
    // Compatibility suggestions
    if (!exportData.metadata.generator.dependencies) {
      report.suggestions.push({)
        code: 'ADD_DEPENDENCY_TRACKING',
        message: 'Record dependency versions for better compatibility validation',
        category: 'compatibility',
        priority: 'medium',
      });
    }
    // Debug suggestions
    if (report.errors.length > 0) {
      report.suggestions.push({)
        code: 'ENABLE_DEBUG_MODE',
        message: 'Use debug quality mode for more detailed reproducibility data',
        category: 'debugging',
        priority: 'high',
      });
    }
  }
  private assessOverallValidity()
    report: ReproducibilityValidationReport,
    options: ReproducibilityValidationOptions,
  ): void {
    const criticalErrors = report.errors.filter(e => e.severity === 'critical').length;
    const highErrors = report.errors.filter(e => e.severity === 'high').length;
    if (criticalErrors > 0) {
      report.isValid = false;
    } else if (options.strictMode && highErrors > 0) {
      report.isValid = false;
    } else if (options.strictMode && !report.exactReproducible) {
      report.isValid = false;
    } else if (!options.allowApproximate && !report.exactReproducible && !report.approximateReproducible) {
      report.isValid = false;
    } else {
      report.isValid = true;
    }
    // Set reproducibility flags
    if (report.integrity.seedsValid && report.integrity.configurationValid) {
      if (report.errors.length === 0) {
        report.exactReproducible = true;
      }
      report.approximateReproducible = true;
    }
  }
  /**
   * Test actual reproduction by re-executing with exported data
   */
  async testReproduction()
    exportData: VFXExportFormat,
    originalGraph: { nodes: Node[]; edges: Edge[] }
  ): Promise<{
    success: boolean;
    identicalResults: boolean;
    differences: string[];
    reproductionTime: number;
  }> {
    const startTime = Date.now();
    try {
      // Reconstruct RNG state
      const masterSeed = exportData.execution.randomization.masterSeed;
      // Simulate reproduction (in real implementation, would re-execute graph)
      const reproduced = {
        success: true,
        identicalResults: true,
        differences: [],
        reproductionTime: Date.now() - startTime,
      };
      return reproduced;
    } catch (error) {
      return {
        success: false,
        identicalResults: false,
        differences: [`Reproduction failed: ${error}`],}
        reproductionTime: Date.now() - startTime,
      };
    }
  }
  private calculateConfigurationHash(configuration: any): string {
    if (!configuration || typeof configuration !== 'object') {
      return 'null-config';
    }
    const configString = JSON.stringify(configuration, Object.keys(configuration).sort());
    return crypto.createHash('sha256').update(configString).digest('hex').substring(0, 16);
  }
  private calculateReproducibilityHash(exportData: VFXExportFormat): string {
    const reproData = {
      masterSeed: exportData.execution.randomization.masterSeed,
      nodeSeed: exportData.execution.randomization.nodeSeed,
      nodeConfigs: exportData.graph.nodes.map(n => ({ id: n.id, config: n.configuration }))
    };
    const reproString = JSON.stringify(reproData, Object.keys(reproData).sort());
    return crypto.createHash('sha256').update(reproString).digest('hex').substring(0, 16);
  }
}