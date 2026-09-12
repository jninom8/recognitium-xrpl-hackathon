// Serves only the three public design files, on loopback. No live application API.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const routes = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
  '/prototype.js': ['prototype.js', 'text/javascript; charset=utf-8'],
};
const server = createServer(async (request, response) => {
  const file = Object.hasOwn(routes, request.url) ? routes[request.url] : undefined;
  if (request.method !== 'GET' || !file) { response.writeHead(404); response.end('Not found'); return; }
  try {
    const body = await readFile(new URL(`../docs/design/${file[0]}`, import.meta.url));
    response.writeHead(200, {
      'Content-Type': file[1], 'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(body);
  } catch { response.writeHead(500); response.end('Design file unavailable'); }
});
server.listen(3100, '127.0.0.1', () => console.log('Simulated design concept: http://127.0.0.1:3100 (no ledger or receipt calls)'));
