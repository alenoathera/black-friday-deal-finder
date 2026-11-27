// The Deal Check static file server for local testing (Node 22 standard library only)
import { createReadStream, statSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDirectory = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const cliArguments = process.argv.slice(2);
const portFlagIndex = cliArguments.indexOf('--port');
const specifiedPort = portFlagIndex === -1 ? 8080 : Number(cliArguments[portFlagIndex + 1]);
const port = Number.isInteger(specifiedPort) && specifiedPort > 0 && specifiedPort < 65536 ? specifiedPort : 8080;

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = createServer((req, res) => {
  const parsedUrl = new URL(req.url ?? '/', 'http://localhost');
  let cleanPath: string;
  try {
    cleanPath = decodeURIComponent(parsedUrl.pathname);
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain' }).end('Bad request path');
    return;
  }

  if (cleanPath.endsWith('/')) {
    cleanPath += 'index.html';
  }

  const filePath = resolve(join(appDirectory, normalize(cleanPath)));
  if (filePath !== appDirectory && !filePath.startsWith(appDirectory + sep)) {
    res.writeHead(403, { 'content-type': 'text/plain' }).end('Access denied');
    return;
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Resource not found');
    return;
  }

  try {
    const stats = statSync(filePath);
    if (!stats.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not a file');
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const mimeType = CONTENT_TYPES[ext] ?? 'application/octet-stream';

    res.writeHead(200, {
      'content-type': mimeType,
      'content-length': stats.size,
      'cache-control': 'no-store, no-cache, must-revalidate',
    });

    createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500, { 'content-type': 'text/plain' }).end('Internal server error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`The Deal Check web server listening at http://127.0.0.1:${port}`);
});
