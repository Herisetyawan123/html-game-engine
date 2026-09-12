#!/usr/bin/env node
/**
 * Clean assets/images and assets/audios:
 *   1. Delete files whose extension doesn't match the folder type
 *      (images -> image types only, audios -> audio types only).
 *      Dotfiles (e.g. .gitkeep) are always preserved.
 *   2. Rename folders to snake_case (already-compliant names are skipped).
 *   3. Delete empty folders (target roots themselves are kept).
 *
 * Usage:
 *   node tools/main.js clean
 *   npm run clean:assets
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.svg', '.avif', '.apng']);
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac', '.opus']);

const TARGETS = [
  { name: 'images', extensions: IMAGE_EXTS },
  { name: 'audios', extensions: AUDIO_EXTS },
];

function snakeCase(name) {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function uniqueDirPath(dirPath) {
  let candidate = dirPath;
  let counter = 1;
  while (fs.existsSync(candidate)) {
    candidate = `${dirPath}_${counter}`;
    counter += 1;
  }
  return candidate;
}

/** Collect all subdirectories under `dir`, deepest first. */
function listDirsDeepestFirst(dir) {
  const result = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = path.join(current, entry.name);
      walk(full);
      result.push(full);
    }
  };
  walk(dir);
  return result;
}

function cleanAssets(root, options = {}) {
  const dryRun = options.dryRun === true;
  const tag = dryRun ? '[clean] [DRY ]' : '[clean]';
  const stats = { renamed: 0, deletedFiles: 0, deletedDirs: 0, kept: 0 };
  const assetsDir = path.join(root, 'assets');

  if (!fs.existsSync(assetsDir)) {
    console.error('[clean] Folder assets tidak ditemukan. Batal.');
    process.exit(1);
  }

  const targets = TARGETS
    .map((t) => ({ ...t, dir: path.join(assetsDir, t.name) }))
    .filter((t) => {
      if (!fs.existsSync(t.dir)) {
        console.log(`[clean] [SKIP] assets/${t.name} tidak ada.`);
        return false;
      }
      return true;
    });

  if (!targets.length) {
    console.log('[clean] [SKIP] Tidak ada folder images/audios di dalam assets.');
    return stats;
  }
  console.log(`[clean] Target: ${targets.map((t) => `assets/${t.name}`).join(', ')}`);

  // STEP 1 - Rename folders to snake_case (deepest first, skip compliant ones)
  for (const target of targets) {
    for (const dirPath of listDirsDeepestFirst(target.dir)) {
      const base = path.basename(dirPath);
      const fixed = snakeCase(base);
      if (!fixed || fixed === base) continue;
      let newPath = path.join(path.dirname(dirPath), fixed);
      const caseOnlyRename = newPath.toLowerCase() === dirPath.toLowerCase();
      if (fs.existsSync(newPath) && !caseOnlyRename) newPath = uniqueDirPath(newPath);
      try {
        if (!dryRun) {
          if (caseOnlyRename && newPath !== dirPath) {
            // Case-only rename needs a temp step on case-insensitive FS (macOS).
            const tmpPath = `${dirPath}__tmp_rename__`;
            fs.renameSync(dirPath, tmpPath);
            fs.renameSync(tmpPath, newPath);
          } else {
            fs.renameSync(dirPath, newPath);
          }
        }
        stats.renamed += 1;
        console.log(`${tag} [DIR ] ${path.relative(root, dirPath)} -> ${path.relative(root, newPath)}`);
      } catch (err) {
        console.log(`[clean] [ERROR] ${err.message}`);
      }
    }
  }

  // STEP 2 - Delete files with wrong extension for the folder type
  for (const target of targets) {
    const stack = [target.dir];
    while (stack.length) {
      const current = stack.pop();
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(full);
          continue;
        }
        if (entry.name.startsWith('.')) continue; // preserve .gitkeep, .DS_Store, etc.
        if (target.extensions.has(path.extname(entry.name).toLowerCase())) {
          stats.kept += 1;
          continue;
        }
        try {
          if (!dryRun) fs.unlinkSync(full);
          stats.deletedFiles += 1;
          console.log(`${tag} [FILE] Dihapus: ${path.relative(root, full)}`);
        } catch (err) {
          console.log(`[clean] [ERROR] ${err.message}`);
        }
      }
    }
  }

  // STEP 3 - Delete empty folders (deepest first, keep target roots)
  for (const target of targets) {
    for (const dirPath of listDirsDeepestFirst(target.dir)) {
      try {
        if (fs.readdirSync(dirPath).length === 0) {
          if (!dryRun) fs.rmdirSync(dirPath);
          stats.deletedDirs += 1;
          console.log(`${tag} [RMDIR] Folder kosong dihapus: ${path.relative(root, dirPath)}`);
        }
      } catch (err) {
        console.log(`[clean] [ERROR] ${err.message}`);
      }
    }
  }

  return stats;
}

function printHelp() {
  console.log('Usage: node tools/main.js clean [--dry-run]\n');
  console.log('Clean assets/images + assets/audios:');
  console.log('  1. Delete files whose extension does not match the folder type');
  console.log('     (images -> image types only, audios -> audio types only).');
  console.log('     Dotfiles (e.g. .gitkeep) are always preserved.');
  console.log('  2. Rename folders to snake_case (compliant names are skipped).');
  console.log('  3. Delete empty folders (target roots themselves are kept).');
  console.log('\nOptions:');
  console.log('  --dry-run   Show what would change without modifying anything.');
}

function run(args = []) {
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }
  const dryRun = args.includes('--dry-run');
  console.log(`Root Folder  : ${rootDir}`);
  console.log(`Assets Folder: ${path.join(rootDir, 'assets')}`);
  if (dryRun) console.log('[clean] DRY RUN - no changes will be made.');
  const stats = cleanAssets(rootDir, { dryRun });
  console.log(
    `\n[clean] Selesai. Folder di-rename: ${stats.renamed}, ` +
    `file dihapus: ${stats.deletedFiles}, folder kosong dihapus: ${stats.deletedDirs}, ` +
    `file dipertahankan: ${stats.kept}.`
  );
}

if (require.main === module) {
  run(process.argv.slice(2));
}

module.exports = { run, cleanAssets, snakeCase };
