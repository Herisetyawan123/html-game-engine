#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const scenesDir = path.join(rootDir, 'scenes');
const routesFile = path.join(rootDir, 'scenes', 'routes', 'main.js');
const indexFile = path.join(rootDir, 'index.html');

function normalizeName(input) {
  const raw = (input || '').trim();
  if (!raw) {
    console.error('[create-scene] Please provide a scene name. Example: npm run create:scene demo');
    process.exit(1);
  }

  const withoutSuffix = raw
    .replace(/-scene$/i, '')
    .replace(/Scene$/i, '');

  const slug = withoutSuffix
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  const sceneName = slug || 'new-scene';
  const className = (withoutSuffix || 'new-scene')
    .replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]+/g, '') + 'Scene';

  return { sceneName, className, fileName: `${sceneName}-scene.js` };
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function buildSceneTemplate(className) {
  return `class ${className} extends Scene {
  create() {
    const g = this.game;
    g.ui.add(new Label({ x: 'center', y: 140, text: '${className}' }, null, '${className}', { align: 'center', font: 'bold 36px sans-serif' }));
    g.ui.add(new Button({ x: 'center', y: 260, width: 280, height: 64, label: 'BACK', onClick: () => g.scenes.switchTo('home') }));
  }

  render(ctx) {
    drawBackdrop(ctx, this.game.assets);
  }
}
`;
}

function ensureRouteRegistration(routesPath, sceneName, className) {
  const routeContent = fs.existsSync(routesPath) ? fs.readFileSync(routesPath, 'utf8') : `function registerAllScenes(game) {\n    game.first_scene = 'home';\n}\n`;
  const registrationLine = `    game.scenes.register('${sceneName}', ${className});`;

  if (routeContent.includes(registrationLine)) return false;

  const marker = /\n\}\s*$/;
  const updatedContent = routeContent.replace(marker, `\n    ${registrationLine}\n}`);
  fs.writeFileSync(routesPath, updatedContent, 'utf8');
  return true;
}

function ensureIndexScript(indexPath, fileName) {
  const scriptTag = `  <script src="scenes/${fileName}"></script>`;
  const content = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
  if (content.includes(scriptTag)) return false;

  const marker = /\s*<!-- Scenes -->\s*[\s\S]*?<!-- Examples Scene -->/;
  const updatedContent = content.replace(marker, (match) => `${match}\n  <script src="scenes/${fileName}"></script>`);
  fs.writeFileSync(indexPath, updatedContent, 'utf8');
  return true;
}

function main() {
  const { sceneName, className, fileName } = normalizeName(process.argv[2]);
  const targetPath = path.join(scenesDir, fileName);

  if (fs.existsSync(targetPath)) {
    console.error(`[create-scene] ${targetPath} already exists.`);
    process.exit(1);
  }

  ensureDirectory(scenesDir);
  ensureDirectory(path.dirname(routesFile));
  fs.writeFileSync(targetPath, buildSceneTemplate(className), 'utf8');
  ensureRouteRegistration(routesFile, sceneName, className);
  ensureIndexScript(indexFile, fileName);

  console.log(`[create-scene] created ${path.relative(rootDir, targetPath)}`);
  console.log(`[create-scene] registered '${sceneName}' in ${path.relative(rootDir, routesFile)}`);
  console.log(`[create-scene] added script include in ${path.relative(rootDir, indexFile)}`);
}

main();
