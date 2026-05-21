import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApiHandler } from './deepseek.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
loadEnv();
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function loadEnv() {
  const envPath = path.join(ROOT_DIR, '.env');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function responseToNode(response, res) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  response.arrayBuffer().then((buffer) => res.end(Buffer.from(buffer))).catch(() => res.end());
}

function requestToWeb(req, body) {
  return new Request('http://' + HOST + ':' + PORT + req.url, {
    method: req.method,
    headers: req.headers,
    body: body.length ? body : undefined,
  });
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function resolveStaticPath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const relativePath = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT_DIR, relativePath);
  if (!filePath.startsWith(ROOT_DIR)) return null;
  return filePath;
}

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://' + HOST + ':' + PORT);
  const filePath = resolveStaticPath(url.pathname);
  if (!filePath) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    const contentType = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': contentType });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}


const apiHandler = createApiHandler();
const server = http.createServer(async (req, res) => {
  try {
    const body = req.method === 'GET' || req.method === 'HEAD' ? Buffer.alloc(0) : await readRequestBody(req);
    const apiResponse = await apiHandler(requestToWeb(req, body));
    if (apiResponse) {
      responseToNode(apiResponse, res);
      return;
    }
    await serveStatic(req, res);
  } catch {
    res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'internal_server_error' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log('EchoCare server running at http://' + HOST + ':' + PORT);
});
