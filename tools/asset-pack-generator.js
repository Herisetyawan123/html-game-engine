#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const imageSourceDir = path.join(rootDir, 'assets', 'images');
const audioSourceDir = path.join(rootDir, 'assets', 'audios');
const outputFile = path.join(rootDir, 'assets', 'asset.pack.js');
const watchMode = process.argv.includes('--watch');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.avif']);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']);
const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.avif': 'image/avif',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac'
};

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function listFiles(dirPath, extensions, files = []) {
  if (!fs.existsSync(dirPath)) return files;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      listFiles(fullPath, extensions, files);
    } else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

function getRelativeAssetKey(filePath, sourceDir) {
  const relative = path.relative(sourceDir, filePath);
  const normalized = relative.split(path.sep).join('/');
  const ext = path.extname(normalized).toLowerCase();
  return normalized.slice(0, normalized.length - ext.length);
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function buildAssetPackContent(images, audios) {
  const imageEntries = Object.entries(images).sort(([a], [b]) => a.localeCompare(b));
  const audioEntries = Object.entries(audios).sort(([a], [b]) => a.localeCompare(b));
  const imageBody = imageEntries.map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)}`).join(',\n');
  const audioBody = audioEntries.map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)}`).join(',\n');

  return `window.__ASSETS_PACK__ = {\n  images: {\n${imageBody ? imageBody + '\n' : ''}  },\n  audios: {\n${audioBody ? audioBody + '\n' : ''}  }\n};\n`;
}

function generateAssetPack() {
  ensureDirectory(path.dirname(outputFile));
  const imageFiles = listFiles(imageSourceDir, IMAGE_EXTENSIONS);
  const audioFiles = listFiles(audioSourceDir, AUDIO_EXTENSIONS);
  const images = {};
  const audios = {};

  for (const filePath of imageFiles) {
    const key = getRelativeAssetKey(filePath, imageSourceDir);
    const mimeType = getMimeType(filePath);
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    images[key] = `data:${mimeType};base64,${base64}`;
  }

  for (const filePath of audioFiles) {
    const key = getRelativeAssetKey(filePath, audioSourceDir);
    const mimeType = getMimeType(filePath);
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    audios[key] = `data:${mimeType};base64,${base64}`;
  }

  const content = buildAssetPackContent(images, audios);
  fs.writeFileSync(outputFile, content, 'utf8');
  console.log(`[asset-pack] wrote ${Object.keys(images).length} image(s) and ${Object.keys(audios).length} audio file(s) to ${path.relative(rootDir, outputFile)}`);
}

function startWatching() {
  const watchedDirs = [imageSourceDir, audioSourceDir].filter((dirPath) => fs.existsSync(dirPath));
  if (!watchedDirs.length) {
    console.error('[asset-pack] no source folders found');
    process.exit(1);
  }

  generateAssetPack();
  console.log(`[asset-pack] watching ${watchedDirs.map((dirPath) => path.relative(rootDir, dirPath)).join(', ')} for changes...`);

  let timer = null;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        generateAssetPack();
      } catch (error) {
        console.error('[asset-pack] failed to regenerate asset pack:', error.message);
      }
    }, 150);
  };

  const watchDirectory = (dirPath) => {
    try {
      fs.watch(dirPath, { persistent: true }, (_eventType, filename) => {
        if (!filename || filename.startsWith('.')) return;
        schedule();
      });
    } catch (error) {
      console.warn(`[asset-pack] unable to watch ${dirPath}: ${error.message}`);
    }
  };

  watchedDirs.forEach(watchDirectory);
  const subdirs = [];
  const walk = (dirPath) => {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const child = path.join(dirPath, entry.name);
        subdirs.push(child);
        walk(child);
      }
    }
  };
  watchedDirs.forEach(walk);
  subdirs.forEach(watchDirectory);
}

if (watchMode) {
  startWatching();
} else {
  generateAssetPack();
}
