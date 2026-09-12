#!/usr/bin/env node
/**
 * Tools CLI - single entry point for all framework tools.
 *
 * Usage:
 *   node tools/main.js <command> [args...]
 *   npm run <script>   (see package.json shortcuts)
 *
 * Available commands:
 *   assets [--watch]   Generate asset pack from assets/images + assets/audios
 *   scene <name>       Create a new scene (scaffold + route + script tag)
 *   build              Build deployable copy into dist/
 *   clean              Clean assets/images + assets/audios (wrong types, snake_case, empty dirs)
 *
 * Adding a new tool:
 *   1. Create tools/commands/<name>.js exporting { run(args) }
 *   2. Register it in COMMANDS below
 *   3. (Optional) add an npm script shortcut in package.json
 */

const path = require('path');

const COMMANDS = {
  assets: {
    file: './commands/asset-pack-generator.js',
    description: 'Generate asset pack  (usage: assets [--watch])',
  },
  scene: {
    file: './commands/create-scene.js',
    description: 'Create a new scene   (usage: scene <name>)',
  },
  build: {
    file: './commands/build.js',
    description: 'Build deployable copy into dist/',
  },
  clean: {
    file: './commands/clean-assets.js',
    description: 'Clean assets/images + assets/audios',
  },
};

function printHelp() {
  console.log('Usage: node tools/main.js <command> [args...]\n');
  console.log('Commands:');
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(10)} ${cmd.description}`);
  }
  console.log('\nExamples:');
  console.log('  node tools/main.js assets');
  console.log('  node tools/main.js assets --watch');
  console.log('  node tools/main.js scene demo');
  console.log('  node tools/main.js build');
  console.log('  node tools/main.js clean');
}

function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    process.exit(command ? 0 : 1);
  }

  const entry = COMMANDS[command];
  if (!entry) {
    console.error(`❌ Unknown command: "${command}"\n`);
    printHelp();
    process.exit(1);
  }

  const tool = require(path.join(__dirname, entry.file));
  tool.run(args);
}

main();
