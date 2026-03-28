/**
 * Builds a self-contained Ketcher iframe page.
 * esbuild handles CJS→ESM conversion far better than Vite's dev optimizer,
 * so we bundle Ketcher + React separately and serve as a static HTML file.
 * Output: public/ketcher-frame/ketcher-bundle.js  +  public/ketcher-frame/index.html
 */
import { build } from 'esbuild';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = resolve(__dirname, '..');
const outDir    = resolve(root, 'public/ketcher-frame');

mkdirSync(outDir, { recursive: true });

// ── 1. Write the entry source ─────────────────────────────────────────────────
const entrySource = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from 'ketcher-react';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import 'ketcher-react/dist/index.css';

const structServiceProvider = new StandaloneStructServiceProvider();

function App() {
  return React.createElement(Editor, {
    staticResourcesUrl: '/ketcher/',
    structServiceProvider,
    onInit: (ketcher) => {
      window._ketcher = ketcher;
      window.parent.postMessage({ type: 'ketcher-ready' }, '*');
    },
  });
}

createRoot(document.getElementById('root')).render(React.createElement(App));

// Listen for commands from the parent frame
window.addEventListener('message', async (e) => {
  if (!window._ketcher) return;
  if (e.data?.type === 'get-smiles') {
    try {
      const smiles = await window._ketcher.getSmiles();
      window.parent.postMessage({ type: 'smiles-result', smiles }, '*');
    } catch (err) {
      window.parent.postMessage({ type: 'smiles-result', smiles: '', error: String(err) }, '*');
    }
  }
  if (e.data?.type === 'set-smiles' && e.data.smiles) {
    try {
      await window._ketcher.setMolecule(e.data.smiles);
    } catch {}
  }
});
`;

const entryPath = resolve(outDir, '_entry.jsx');
writeFileSync(entryPath, entrySource);

// ── 2. Bundle with esbuild ────────────────────────────────────────────────────
console.log('Building Ketcher frame bundle…');
try {
  await build({
    entryPoints: [entryPath],
    bundle: true,
    outfile: resolve(outDir, 'ketcher-bundle.js'),
    platform: 'browser',
    format: 'esm',
    target: ['es2020'],
    minify: false,
    sourcemap: false,
    // Silence warnings about CJS interop — expected for this dep tree
    logLevel: 'error',
    define: {
      'process.env.NODE_ENV': '"production"',
      global: 'window',
    },
    // Needed for packages that check process.env
    inject: [],
    loader: {
      '.js': 'jsx',
      '.woff': 'file',
      '.woff2': 'file',
      '.ttf': 'file',
      '.svg': 'text',
      '.png': 'dataurl',
    },
  });
  console.log('✓ Ketcher bundle built');
} catch (err) {
  console.error('Ketcher bundle build failed:', err.message);
  process.exit(1);
}

// ── 3. Write the host HTML ────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ketcher Editor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./ketcher-bundle.js"></script>
</body>
</html>`;

writeFileSync(resolve(outDir, 'index.html'), html);
console.log('✓ ketcher-frame/index.html written');
