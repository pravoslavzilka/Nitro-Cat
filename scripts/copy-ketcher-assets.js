import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The WASM and worker files live in the binaryWasm subdirectory of ketcher-standalone's dist.
const src = path.join(__dirname, '../node_modules/ketcher-standalone/dist/binaryWasm');
const dest = path.join(__dirname, '../public/ketcher');

if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

fs.readdirSync(src).forEach(file => {
  const srcFile = path.join(src, file);
  if (fs.statSync(srcFile).isFile()) {
    fs.copyFileSync(srcFile, path.join(dest, file));
  }
});

console.log('Ketcher assets copied to public/ketcher/');
