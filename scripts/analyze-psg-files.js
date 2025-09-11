const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all PSG files
const psgFiles = glob.sync('**/*.psg', {
  ignore: ['node_modules/**', 'dist/**', '.git/**']
});

console.log(`Found ${psgFiles.length} PSG files\n`);

const results = [];
let totalNodes = 0;
let multiNodeFiles = [];

psgFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    
    const nodeCount = data.nodes ? data.nodes.length : 0;
    const edgeCount = data.edges ? data.edges.length : 0;
    
    const name = data.name || data.metadata?.name || path.basename(file, '.psg');
    const description = data.description || data.metadata?.description || 'No description';
    
    results.push({
      file: file,
      name: name,
      description: description,
      nodeCount: nodeCount,
      edgeCount: edgeCount
    });
    
    totalNodes += nodeCount;
    
    if (nodeCount > 1) {
      multiNodeFiles.push({
        file: file,
        name: name,
        nodeCount: nodeCount
      });
    }
  } catch (e) {
    console.error(`Error parsing ${file}: ${e.message}`);
  }
});

// Sort by node count descending
results.sort((a, b) => b.nodeCount - a.nodeCount);

console.log('=== FILES WITH MULTIPLE NODES ===');
console.log('These files have more than 1 node and may have incorrect descriptions:\n');

multiNodeFiles.sort((a, b) => b.nodeCount - a.nodeCount);
multiNodeFiles.forEach(item => {
  console.log(`${item.nodeCount} nodes: ${item.name}`);
  console.log(`  File: ${item.file}`);
});

console.log('\n=== SUMMARY ===');
console.log(`Total PSG files: ${psgFiles.length}`);
console.log(`Total nodes across all files: ${totalNodes}`);
console.log(`Files with multiple nodes: ${multiNodeFiles.length}`);
console.log(`Average nodes per file: ${(totalNodes / psgFiles.length).toFixed(2)}`);

// Create detailed report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: psgFiles.length,
    totalNodes: totalNodes,
    multiNodeFiles: multiNodeFiles.length,
    averageNodesPerFile: (totalNodes / psgFiles.length).toFixed(2)
  },
  files: results,
  multiNodeFiles: multiNodeFiles
};

fs.writeFileSync('psg-analysis-report.json', JSON.stringify(report, null, 2));
console.log('\nDetailed report saved to psg-analysis-report.json');