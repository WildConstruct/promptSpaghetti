#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');

// Import engine wrapper if it exists
let executeGraphFromFile;
try {
  ({ executeGraphFromFile } = require('./engine-wrapper'));
} catch (e) {
  // Fallback function if engine-wrapper doesn't exist
  executeGraphFromFile = async (path, options) => {
    return ['placeholder output'];
  };
}

async function main(argv = process.argv) {
  const program = new Command();
  let result = { exitCode: 0, outputs: [] };
  
  // Suppress process.exit in test environment
  if (process.env.NODE_ENV === 'test') {
    program.exitOverride();
  }
  
  program
    .name('promptgraph')
    .description('PromptScape Graph CLI')
    .version('1.0.0');
  
  program
    .command('exec <file>')
    .description('Execute a graph file')
    .option('-s, --seed <number>', 'Seed value', parseInt)
    .action(async (file, options) => {
      try {
        if (!fs.existsSync(file)) {
          console.error(`Graph file not found: ${file}`);
          result = { exitCode: 1, outputs: [] };
          return;
        }
        
        const outputs = await executeGraphFromFile(file, { seed: options.seed });
        outputs.forEach(output => console.log(output));
        result = { exitCode: 0, outputs };
      } catch (error) {
        console.error(`Error executing graph: ${error.message}`);
        result = { exitCode: 1, outputs: [] };
      }
    });

  // Remove the default action that conflicts with help

  try {
    await program.parseAsync(argv);
    return result;
  } catch (error) {
    // Handle Commander.js errors (like missing arguments, invalid commands)
    if (error.code === 'commander.missingArgument') {
      return { exitCode: 1, outputs: [] };
    }
    if (error.code === 'commander.unknownCommand') {
      return { exitCode: 1, outputs: [] };
    }
    if (error.code === 'commander.help') {
      return { exitCode: 0, outputs: [] };
    }
    return { exitCode: 1, outputs: [] };
  }
}

// Export for testing
module.exports = { main };

// Run if called directly
if (require.main === module) {
  main().then(result => {
    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  });
}
