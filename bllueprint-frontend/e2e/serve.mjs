// Minimal static server for the production build, used by the Playwright `web`
// project. SPA fallback: unknown paths without an extension get index.html,
// like the Electron app:// handler does.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.argv[2] ?? 4310);
const root = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist',
  'bllueprint-frontend',
  'browser',
);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error(`No build found at ${root}. Run "npm run build" first.`);
  process.exit(1);
}

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  let file = resolve(root, `.${sep}${pathname}`);

  if (!file.startsWith(root + sep) && file !== root) {
    res.writeHead(403).end();
    return;
  }

  const isFile = existsSync(file) && statSync(file).isFile();

  if (!isFile) {
    if (extname(pathname)) {
      res.writeHead(404).end(`Not found: ${pathname}`);
      return;
    }
    file = join(root, 'index.html');
  }

  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`e2e: serving ${root} on http://localhost:${port}`));
