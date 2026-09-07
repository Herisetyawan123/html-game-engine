#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Files & folders to copy
const INCLUDE = [
  'index.html',
  'engine/',
  'scenes/',
  'assets/',
];

// Files/folders to skip
const EXCLUDE = [
  'node_modules',
  '.git',
  '.gitignore',
  'package.json',
  'package-lock.json',
  'README.md',
  'CLAUDE.md',
  'tools/',
  'clean 04.51.14.py',
  'optimize 04.51.14.py',
  'clean.py',
  'optimize.py',
  'build.js',
  'dist/',
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(file => {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      
      // Skip excluded files
      if (EXCLUDE.some(exc => srcFile.includes(exc))) return;
      
      copyRecursive(srcFile, destFile);
    });
  } else {
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

console.log('🔨 Building framework...');

// Clean dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });

// Copy included files
INCLUDE.forEach(item => {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  ${item} not found, skipping`);
    return;
  }
  const dest = path.join(DIST, item);
  copyRecursive(src, dest);
});

// Verify key files
const required = ['index.html', 'engine/main.js', 'assets/asset.pack.js'];
const missing = required.filter(f => !fs.existsSync(path.join(DIST, f)));

if (missing.length > 0) {
  console.error(`❌ Missing files: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('✅ Build complete: dist/');
console.log(`   - Ready to deploy`);
console.log(`   - Open: file://${DIST}/index.html`);
