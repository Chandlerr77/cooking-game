// Static file server for game/ so Sizzle & Serve can be played without a build step.
// Usage: node serve.ts [--port 8080]   then open http://localhost:8080
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const gameRoot = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const argv = process.argv.slice(2);
const flag = argv.indexOf('--port');
const wanted = flag >= 0 ? Number(argv[flag + 1]) : 8080;
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

createServer((req, res) => {
  let path: string;
  try {
    path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (path.endsWith('/')) path += 'index.html';
  const target = resolve(join(gameRoot, normalize(path)));
  if (target !== gameRoot && !target.startsWith(gameRoot + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  try {
    const info = statSync(target);
    if (!info.isFile()) throw new Error('not a file');
    res.writeHead(200, {
      'content-type': types[extname(target).toLowerCase()] ?? 'application/octet-stream',
      'content-length': info.size,
      'cache-control': 'no-store',
    });
    createReadStream(target).pipe(res);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Sizzle & Serve on http://localhost:${port}`));
