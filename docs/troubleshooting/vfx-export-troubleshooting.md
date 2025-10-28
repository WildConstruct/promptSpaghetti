# VFX Export Troubleshooting Guide

## Quick Diagnostic Tools

### Automated Health Check

Run this command first to identify common issues:

```bash
# Comprehensive system check
wc health-check --export-path scene.vfx.json --verbose

# Output example:
✓ Export file format valid (v1.2.0)
✓ Schema validation passed
✓ Reproducibility data present
⚠ Large file size detected (45MB)
✗ Missing ControlNet compatibility data
✓ All required fields present
```

### Validation CLI Tools

```bash
# Basic validation
wc validate scene.vfx.json

# Strict validation with all checks
wc validate scene.vfx.json --strict --reproducibility --performance

# Repair common issues automatically
wc repair scene.vfx.json --backup --auto-fix

# Export format conversion
wc convert scene.vfx.json --from v1.1.0 --to v1.2.0
```

## Common Issues and Solutions

### 1. Export Generation Failures

#### Issue: "Export generation failed with validation error"

**Symptoms**:

- Export process stops with schema validation error
- Missing required fields in output
- Graph execution fails

**Diagnostic Steps**:

```javascript
// Check graph validity before export
const validator = GraphValidator.getInstance();
const graphValidation = validator.validateGraph(graph);

if (!graphValidation.isValid) {
  console.log('Graph validation errors:');
  graphValidation.errors.forEach(error => {
    console.log(`- ${error.code}: ${error.message}`);
    if (error.nodeId) {
      console.log(`  Node: ${error.nodeId}`);
    }
  });
}

// Check for circular dependencies
const cycleDetector = new CycleDetector();
const cycles = cycleDetector.findCycles(graph);
if (cycles.length > 0) {
  console.log('Circular dependencies detected:', cycles);
}
```

**Solutions**:

1. **Fix Graph Structure**:

   ```javascript
   // Remove invalid edges
   const invalidEdges = graph.edges.filter(
     edge =>
       !graph.nodes.find(n => n.id === edge.source) ||
       !graph.nodes.find(n => n.id === edge.target)
   );

   invalidEdges.forEach(edge => {
     graph.edges = graph.edges.filter(e => e.id !== edge.id);
   });
   ```

2. **Validate Node Configurations**:

   ```javascript
   graph.nodes.forEach(node => {
     if (!node.data || Object.keys(node.data).length === 0) {
       console.warn(`Node ${node.id} has empty configuration`);
       // Set default configuration
       node.data = getDefaultNodeConfig(node.type);
     }
   });
   ```

3. **Check Required Fields**:
   ```javascript
   const requiredFields = ['id', 'type', 'position', 'data'];
   graph.nodes.forEach(node => {
     requiredFields.forEach(field => {
       if (!node[field]) {
         throw new Error(`Node ${node.id} missing required field: ${field}`);
       }
     });
   });
   ```

#### Issue: "RNG state serialization failed"

**Symptoms**:

- Export completes but reproducibility validation fails
- Warning about missing RNG state

**Diagnostic Steps**:

```javascript
// Check RNG state capture
const exportData = await exporter.exportGraph(graph, executionResults, {
  quality: 'debug',
  includeDebugInfo: true
});

if (!exportData.execution.randomization.rngState) {
  console.warn('RNG state not captured - check seedrandom version');
}

// Verify seedrandom compatibility
const seedrandom = require('seedrandom');
const testRng = seedrandom('test');
console.log('Seedrandom state support:', typeof testRng.state === 'function');
```

**Solutions**:

1. **Update seedrandom**:

   ```bash
   npm update seedrandom
   npm list seedrandom  # Verify version 3.0.5+
   ```

2. **Enable Debug Mode**:
   ```javascript
   const exportOptions = {
     quality: 'production',
     includeDebugInfo: true, // Required for RNG state capture
     includeHistoricalData: true
   };
   ```

### 2. Import/Integration Failures

#### Issue: "Maya import fails with attribute errors"

**Symptoms**:

- Maya script errors during import
- Missing scene objects
- Incorrect camera/lighting setup

**Diagnostic Steps**:

```python
# Check Maya environment
import maya.cmds as cmds
print("Maya version:", cmds.about(version=True))
print("Available plugins:", cmds.pluginInfo(listPlugins=True))

# Verify Wild Construct plugin
if not cmds.pluginInfo('wildConstructImporter', query=True, loaded=True):
    print("Wild Construct plugin not loaded")
    try:
        cmds.loadPlugin('wildConstructImporter')
        print("Plugin loaded successfully")
    except:
        print("Plugin load failed - check installation")
```

**Solutions**:

1. **Plugin Installation**:

   ```bash
   # Install Maya plugin
   cp wildConstructImporter.py $MAYA_SCRIPT_PATH/plug-ins/

   # Verify installation
   maya -batch -command "loadPlugin wildConstructImporter; print(\\\"Plugin loaded\\\")"
   ```

2. **Fix Attribute Errors**:

   ```python
   def safe_set_attr(obj, attr, value):
       """Safely set Maya attribute with error handling"""
       try:
           if cmds.objExists(f"{obj}.{attr}"):
               cmds.setAttr(f"{obj}.{attr}", value)
           else:
               print(f"Warning: Attribute {obj}.{attr} does not exist")
       except Exception as e:
           print(f"Error setting {obj}.{attr}: {e}")
   ```

3. **Namespace Issues**:
   ```python
   def create_safe_namespace(name):
       """Create namespace safely"""
       if cmds.namespace(exists=name):
           print(f"Namespace {name} already exists")
           return name + "_" + str(int(time.time()))
       else:
           cmds.namespace(add=name)
           return name
   ```

#### Issue: "Houdini HDA parameter errors"

**Symptoms**:

- HDA fails to load export file
- Parameter evaluation errors
- Missing procedural elements

**Solutions**:

```python
# houdini_debug.py
import hou

def debug_hda_parameters(hda_node):
    """Debug HDA parameter issues"""
    try:
        # Check file parameter
        export_file = hda_node.parm('export_file').eval()
        if not os.path.exists(export_file):
            print(f"Export file not found: {export_file}")
            return False

        # Check JSON validity
        with open(export_file, 'r') as f:
            export_data = json.load(f)

        print("Export data loaded successfully")
        print(f"Export ID: {export_data['metadata']['exportId']}")

        # Validate required sections
        required_sections = ['metadata', 'prompt', 'graph', 'execution']
        missing_sections = [s for s in required_sections if s not in export_data]

        if missing_sections:
            print(f"Missing sections: {missing_sections}")
            return False

        return True

    except Exception as e:
        print(f"HDA parameter debug failed: {e}")
        return False

# Usage in HDA callback
node = hou.pwd()
if not debug_hda_parameters(node):
    hou.ui.displayMessage("HDA parameter validation failed")
```

### 3. Reproducibility Issues

#### Issue: "Same seed produces different results"

**Symptoms**:

- Results vary between exports with same seed
- Reproducibility validation fails
- Hash mismatches

**Diagnostic Process**:

```javascript
// Comprehensive reproducibility check
const reproducer = new ReproducibilityTester();

async function diagnoseReproducibility(exportData) {
  const diagnosis = {
    seedConsistency: false,
    configurationIntegrity: false,
    environmentMatch: false,
    versionCompatibility: false
  };

  // Check seed consistency
  const originalSeed = exportData.execution.randomization.masterSeed;
  const testExport = await exporter.exportGraph(graph, null, {
    seed: originalSeed,
    quality: 'production'
  });

  diagnosis.seedConsistency =
    testExport.execution.randomization.masterSeed === originalSeed;

  // Check configuration hashes
  const validator = ReproducibilityValidator.getInstance();
  const validation = validator.validateReproducibility(exportData);

  diagnosis.configurationIntegrity = validation.integrity.configurationValid;

  // Check environment
  const currentEnv = {
    nodeVersion: process.version,
    platform: process.platform
  };

  const exportEnv = exportData.execution.reproduction.environment;
  diagnosis.environmentMatch =
    currentEnv.nodeVersion === exportEnv.nodeVersion &&
    currentEnv.platform === exportEnv.platform;

  // Check version compatibility
  diagnosis.versionCompatibility = validation.integrity.versionCompatible;

  return diagnosis;
}
```

**Solutions**:

1. **Environment Matching**:

   ```bash
   # Use Node Version Manager to match versions
   nvm install v18.17.0
   nvm use v18.17.0

   # Verify environment
   node --version  # Should match export data
   ```

2. **Configuration Lock**:

   ```javascript
   // Lock node configurations for reproducibility
   function lockNodeConfigurations(graph) {
     graph.nodes.forEach(node => {
       node.data.locked = true;
       node.data.configHash = generateConfigurationHash(node.data);
     });
   }
   ```

3. **Seed Isolation**:

   ```javascript
   // Ensure proper seed isolation
   class IsolatedRandomGenerator {
     constructor(masterSeed) {
       this.masterRng = seedrandom(masterSeed.toString());
       this.nodeRngs = new Map();
     }

     getNodeRng(nodeId) {
       if (!this.nodeRngs.has(nodeId)) {
         const nodeSeed = this.masterRng.int32();
         this.nodeRngs.set(nodeId, seedrandom(nodeSeed.toString()));
       }
       return this.nodeRngs.get(nodeId);
     }
   }
   ```

### 4. Performance Issues

#### Issue: "Export takes too long (>30 seconds)"

**Diagnostic Tools**:

```javascript
// Performance profiler
class ExportProfiler {
  constructor() {
    this.timers = new Map();
    this.memorySnapshots = [];
  }

  startTimer(label) {
    this.timers.set(label, {
      start: Date.now(),
      memory: process.memoryUsage()
    });
  }

  endTimer(label) {
    const timer = this.timers.get(label);
    if (timer) {
      const duration = Date.now() - timer.start;
      const memoryDelta =
        process.memoryUsage().heapUsed - timer.memory.heapUsed;

      console.log(
        `${label}: ${duration}ms (Memory: +${Math.round(memoryDelta / 1024 / 1024)}MB)`
      );

      return { duration, memoryDelta };
    }
  }

  profileExport(graph, executionResults, options) {
    const profiler = this;

    return new Promise(async (resolve, reject) => {
      profiler.startTimer('total_export');

      try {
        profiler.startTimer('metadata_build');
        const metadata = await this.buildMetadata(options);
        profiler.endTimer('metadata_build');

        profiler.startTimer('graph_processing');
        const graphData = await this.buildGraphStructure(graph);
        profiler.endTimer('graph_processing');

        profiler.startTimer('execution_data');
        const executionData = await this.buildExecutionData(
          executionResults,
          options
        );
        profiler.endTimer('execution_data');

        const result = {
          metadata,
          graph: graphData,
          execution: executionData
        };

        const totalTime = profiler.endTimer('total_export');
        result._profiling = { totalTime };

        resolve(result);
      } catch (error) {
        profiler.endTimer('total_export');
        reject(error);
      }
    });
  }
}
```

**Solutions**:

1. **Graph Simplification**:

   ```javascript
   // Identify performance bottlenecks
   function analyzeGraphComplexity(graph) {
     const analysis = {
       nodeCount: graph.nodes.length,
       edgeCount: graph.edges.length,
       maxDepth: calculateMaxDepth(graph),
       cyclomaticComplexity: calculateCyclomaticComplexity(graph)
     };

     // Identify expensive nodes
     const expensiveNodes = graph.nodes.filter(node => {
       return (
         node.type === 'WeightedAdvanced' ||
         node.type === 'Markov' ||
         (node.data && node.data.complexity === 'high')
       );
     });

     analysis.expensiveNodes = expensiveNodes.length;

     return analysis;
   }
   ```

2. **Caching Implementation**:

   ```javascript
   // Node-level caching
   class NodeCache {
     constructor(maxSize = 100) {
       this.cache = new Map();
       this.maxSize = maxSize;
     }

     generateKey(node, inputs) {
       const nodeHash = hash(JSON.stringify(node.data));
       const inputHash = hash(JSON.stringify(inputs));
       return `${node.id}_${nodeHash}_${inputHash}`;
     }

     get(node, inputs) {
       const key = this.generateKey(node, inputs);
       return this.cache.get(key);
     }

     set(node, inputs, result) {
       const key = this.generateKey(node, inputs);

       if (this.cache.size >= this.maxSize) {
         const firstKey = this.cache.keys().next().value;
         this.cache.delete(firstKey);
       }

       this.cache.set(key, result);
     }
   }
   ```

#### Issue: "Memory usage grows during export"

**Diagnostic**:

```javascript
// Memory leak detector
class MemoryLeakDetector {
  constructor() {
    this.snapshots = [];
    this.threshold = 50 * 1024 * 1024; // 50MB
  }

  takeSnapshot(label) {
    const usage = process.memoryUsage();
    this.snapshots.push({
      label,
      timestamp: Date.now(),
      ...usage
    });

    if (usage.heapUsed > this.threshold) {
      console.warn(
        `High memory usage detected: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`
      );
    }
  }

  analyzeLeaks() {
    if (this.snapshots.length < 2) return;

    const growth = [];
    for (let i = 1; i < this.snapshots.length; i++) {
      const current = this.snapshots[i];
      const previous = this.snapshots[i - 1];

      growth.push({
        from: previous.label,
        to: current.label,
        heapGrowth: current.heapUsed - previous.heapUsed,
        externalGrowth: current.external - previous.external
      });
    }

    const suspiciousGrowth = growth.filter(
      g => g.heapGrowth > 10 * 1024 * 1024
    ); // 10MB+
    if (suspiciousGrowth.length > 0) {
      console.warn('Potential memory leaks detected:');
      suspiciousGrowth.forEach(g => {
        console.warn(
          `${g.from} -> ${g.to}: +${Math.round(g.heapGrowth / 1024 / 1024)}MB`
        );
      });
    }
  }
}
```

**Solutions**:

```javascript
// Memory optimization
function optimizeExportMemory() {
  // Force garbage collection periodically
  if (global.gc) {
    global.gc();
  }

  // Clear large objects when done
  function clearLargeObjects(obj) {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
          delete obj[key];
        }
      });
    }
  }

  // Stream processing for large data
  function processInChunks(largeArray, chunkSize = 1000) {
    const chunks = [];
    for (let i = 0; i < largeArray.length; i += chunkSize) {
      chunks.push(largeArray.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
```

### 5. File Format Issues

#### Issue: "Export file corrupted or unreadable"

**Diagnostic**:

```bash
# Check file integrity
file scene.vfx.json
wc validate scene.vfx.json --schema-only

# Check JSON syntax
jq . scene.vfx.json > /dev/null && echo "Valid JSON" || echo "Invalid JSON"

# Check file size and permissions
ls -la scene.vfx.json
```

**Solutions**:

```javascript
// File integrity checker
class FileIntegrityChecker {
  static async validateExportFile(filePath) {
    const results = {
      fileExists: false,
      validJSON: false,
      schemaValid: false,
      checksumValid: false,
      size: 0
    };

    try {
      // Check file existence
      const stats = await fs.stat(filePath);
      results.fileExists = true;
      results.size = stats.size;

      // Check JSON validity
      const content = await fs.readFile(filePath, 'utf8');
      const exportData = JSON.parse(content);
      results.validJSON = true;

      // Check schema
      const validator = new VFXExportValidator();
      const schemaValidation = validator.validateSchema(exportData);
      results.schemaValid = schemaValidation.isValid;

      // Check checksum if present
      if (exportData.metadata && exportData.metadata.checksum) {
        const calculatedChecksum = await this.calculateChecksum(content);
        results.checksumValid =
          calculatedChecksum === exportData.metadata.checksum;
      } else {
        results.checksumValid = true; // No checksum to validate
      }
    } catch (error) {
      console.error(`File validation error: ${error.message}`);
    }

    return results;
  }

  static async calculateChecksum(content) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
```

## Automated Diagnostic Scripts

### Health Check Script

```javascript
// comprehensive-health-check.js
const {
  VFXExportValidator,
  ReproducibilityValidator
} = require('./validators');

async function runHealthCheck(exportPath, options = {}) {
  const report = {
    timestamp: new Date().toISOString(),
    exportPath,
    checks: [],
    overallStatus: 'unknown',
    score: 0
  };

  const checks = [
    { name: 'File Integrity', weight: 20, func: checkFileIntegrity },
    { name: 'Schema Validation', weight: 25, func: checkSchemaValidation },
    { name: 'Reproducibility', weight: 20, func: checkReproducibility },
    { name: 'Performance', weight: 15, func: checkPerformance },
    { name: 'Compatibility', weight: 10, func: checkCompatibility },
    { name: 'Security', weight: 10, func: checkSecurity }
  ];

  let totalScore = 0;
  let totalWeight = 0;

  for (const check of checks) {
    try {
      console.log(`Running ${check.name}...`);
      const result = await check.func(exportPath, options);

      report.checks.push({
        name: check.name,
        status: result.status,
        score: result.score,
        issues: result.issues || [],
        recommendations: result.recommendations || []
      });

      totalScore += result.score * check.weight;
      totalWeight += check.weight;
    } catch (error) {
      report.checks.push({
        name: check.name,
        status: 'error',
        score: 0,
        issues: [error.message],
        recommendations: ['Fix the underlying error and retry']
      });
    }
  }

  report.score = Math.round(totalScore / totalWeight);
  report.overallStatus =
    report.score >= 80 ? 'good' : report.score >= 60 ? 'warning' : 'error';

  return report;
}

async function checkFileIntegrity(exportPath) {
  const integrity = await FileIntegrityChecker.validateExportFile(exportPath);

  let score = 0;
  const issues = [];

  if (integrity.fileExists) score += 25;
  else issues.push('Export file does not exist');

  if (integrity.validJSON) score += 25;
  else issues.push('Invalid JSON format');

  if (integrity.schemaValid) score += 25;
  else issues.push('Schema validation failed');

  if (integrity.checksumValid) score += 25;
  else issues.push('Checksum validation failed');

  return {
    status: score === 100 ? 'pass' : issues.length > 2 ? 'fail' : 'warning',
    score,
    issues
  };
}

// Usage
runHealthCheck('scene.vfx.json', { verbose: true })
  .then(report => {
    console.log('\n=== HEALTH CHECK REPORT ===');
    console.log(`Overall Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`Score: ${report.score}/100`);

    report.checks.forEach(check => {
      const statusIcon =
        check.status === 'pass' ? '✓' : check.status === 'warning' ? '⚠' : '✗';
      console.log(`${statusIcon} ${check.name}: ${check.score}/100`);

      if (check.issues.length > 0) {
        check.issues.forEach(issue => console.log(`  - ${issue}`));
      }
    });
  })
  .catch(console.error);
```

### Export Repair Tool

```javascript
// export-repair-tool.js
class ExportRepairTool {
  constructor() {
    this.repairs = [];
  }

  async repairExport(exportPath, options = {}) {
    const backupPath = `${exportPath}.backup.${Date.now()}`;

    // Create backup
    if (options.backup !== false) {
      await fs.copyFile(exportPath, backupPath);
      console.log(`Backup created: ${backupPath}`);
    }

    // Load export data
    const content = await fs.readFile(exportPath, 'utf8');
    let exportData;

    try {
      exportData = JSON.parse(content);
    } catch (error) {
      throw new Error(`Cannot parse JSON: ${error.message}`);
    }

    // Apply repairs
    await this.repairMissingFields(exportData);
    await this.repairInvalidValues(exportData);
    await this.repairReproducibilityData(exportData);
    await this.repairVersionCompatibility(exportData);

    // Validate repairs
    const validator = new VFXExportValidator();
    const validation = validator.validateExport(exportData);

    if (validation.isValid) {
      // Save repaired export
      await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
      console.log(
        `Export repaired successfully. ${this.repairs.length} issues fixed.`
      );

      return {
        success: true,
        repairsApplied: this.repairs,
        backupPath: options.backup !== false ? backupPath : null
      };
    } else {
      throw new Error(`Repair failed: ${validation.errors.join(', ')}`);
    }
  }

  async repairMissingFields(exportData) {
    // Add missing required fields
    if (!exportData.metadata) {
      exportData.metadata = this.generateDefaultMetadata();
      this.repairs.push('Added missing metadata section');
    }

    if (!exportData.metadata.exportId) {
      exportData.metadata.exportId = `repaired-${Date.now()}`;
      this.repairs.push('Generated missing export ID');
    }

    if (!exportData.execution) {
      exportData.execution = this.generateDefaultExecution();
      this.repairs.push('Added missing execution section');
    }

    if (!exportData.execution.randomization) {
      exportData.execution.randomization = {
        masterSeed: Math.floor(Math.random() * 1000000),
        nodeSeed: {}
      };
      this.repairs.push('Generated missing randomization data');
    }
  }

  async repairInvalidValues(exportData) {
    // Fix invalid values
    if (
      exportData.metadata.version &&
      !/^\d+\.\d+\.\d+$/.test(exportData.metadata.version)
    ) {
      exportData.metadata.version = '1.2.0';
      this.repairs.push('Fixed invalid version format');
    }

    // Ensure numeric values are numbers
    if (typeof exportData.execution.randomization.masterSeed === 'string') {
      exportData.execution.randomization.masterSeed = parseInt(
        exportData.execution.randomization.masterSeed
      );
      this.repairs.push('Converted master seed to number');
    }
  }

  generateDefaultMetadata() {
    return {
      exportId: `repaired-${Date.now()}`,
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      generator: {
        name: 'Wild Construct Prompt Generator',
        version: '1.0.0',
        build: 'repair-tool'
      }
    };
  }

  generateDefaultExecution() {
    return {
      randomization: {
        masterSeed: Math.floor(Math.random() * 1000000),
        nodeSeed: {}
      },
      performance: {
        totalTime: 0,
        nodePerformance: {}
      },
      reproduction: {
        environment: {
          nodeVersion: process.version,
          platform: process.platform
        },
        exactReproduction: false,
        approximateReproduction: true
      }
    };
  }
}

// CLI usage
if (require.main === module) {
  const exportPath = process.argv[2];
  if (!exportPath) {
    console.error('Usage: node export-repair-tool.js <export-file.vfx.json>');
    process.exit(1);
  }

  const repairTool = new ExportRepairTool();
  repairTool
    .repairExport(exportPath, { backup: true })
    .then(result => {
      console.log('Repair completed successfully');
      console.log(`Repairs applied: ${result.repairsApplied.length}`);
      result.repairsApplied.forEach(repair => console.log(`- ${repair}`));
    })
    .catch(error => {
      console.error('Repair failed:', error.message);
      process.exit(1);
    });
}
```

## Emergency Procedures

### Critical Export Failure Recovery

1. **Immediate Actions**:

   ```bash
   # Stop all export processes
   pkill -f "wildstruct.*export"

   # Check system resources
   df -h  # Disk space
   free -h  # Memory

   # Check for corrupted files
   find /project/exports -name "*.vfx.json" -exec wc validate {} \;
   ```

2. **Data Recovery**:

   ```bash
   # Restore from backup
   cp /backup/exports/*.vfx.json /project/exports/

   # Validate restored files
   for file in /project/exports/*.vfx.json; do
       wc validate "$file" || echo "CORRUPTED: $file"
   done
   ```

3. **Service Restart**:
   ```bash
   # Restart Wild Construct services
   systemctl restart wildstruct-exporter
   systemctl status wildstruct-exporter
   ```

### Pipeline Integration Failure Recovery

1. **Isolation**:

   ```bash
   # Disable automatic imports
   touch /project/.disable_auto_import

   # Kill running import processes
   pkill -f "maya.*wildstruct"
   pkill -f "houdini.*wildstruct"
   ```

2. **Diagnostic**:

   ```bash
   # Check software versions
   maya -batch -command "print(cmds.about(version=True))"
   houdini -version

   # Verify plugin installation
   ls -la $MAYA_SCRIPT_PATH/plug-ins/wildConstruct*
   ```

3. **Recovery**:

   ```bash
   # Reinstall plugins
   cp /backup/plugins/* $MAYA_SCRIPT_PATH/plug-ins/

   # Test with simple scene
   wc validate test-scene.vfx.json
   maya -batch -file test-import.py
   ```

This comprehensive troubleshooting guide provides the tools and knowledge needed to diagnose and resolve common issues with Wild Construct VFX exports across different production scenarios.
