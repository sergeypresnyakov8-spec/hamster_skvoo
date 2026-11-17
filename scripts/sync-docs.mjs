import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.resolve(rootDir, 'dist');
const docsDir = path.resolve(rootDir, 'docs');

if (fs.existsSync(distDir)) {
  fs.rmSync(docsDir, { recursive: true, force: true });
  fs.cpSync(distDir, docsDir, { recursive: true, force: true });
  const indexHtml = path.resolve(docsDir, 'index.html');
  const notFoundHtml = path.resolve(docsDir, '404.html');
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, notFoundHtml);
  }
}
