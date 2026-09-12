import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { Client } from 'xrpl';

const http = 'https://lending-hackathon.dev.ripplex.io:51234/';
const wss = 'wss://lending-hackathon.dev.ripplex.io:51233';
const startedAt = new Date().toISOString();
const timeout = process.argv.includes('--long') ? 30000 : 12000;
async function timed(name, operation) {
  const start = performance.now();
  try { const result = await operation(); return { name, ok: true, milliseconds: Math.round(performance.now() - start), result }; }
  catch (error) { return { name, ok: false, milliseconds: Math.round(performance.now() - start), error: error.message, code: error.cause?.code ?? error.code ?? error.name }; }
}
const results = await Promise.all([
  timed('Track 1 HTTP server_info', async () => {
    const response = await fetch(http, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'server_info', params: [{}] }), signal: AbortSignal.timeout(timeout) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }),
  timed('Track 1 WebSocket server_info', () => new Promise((resolve, reject) => {
    const socket = new WebSocket(wss);
    const timer = setTimeout(() => { socket.close(); reject(new Error(`WebSocket server_info timeout after ${timeout}ms`)); }, timeout);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, command: 'server_info' }));
    socket.onmessage = ({ data }) => { clearTimeout(timer); socket.close(); resolve(JSON.parse(String(data))); };
    socket.onerror = () => { clearTimeout(timer); socket.close(); reject(new Error('WebSocket connection error')); };
  })),
  timed('xrpl.js 5.2.0 Track 1 server_info', async () => {
    const client = new Client(wss, { connectionTimeout: timeout, timeout });
    client.on('error', () => {});
    try { await client.connect(); return (await client.request({ command: 'server_info' })).result; }
    finally { if (client.isConnected()) await client.disconnect(); }
  }),
  timed('HTTPS 443 registry control', async () => {
    const response = await fetch('https://registry.npmjs.org/xrpl/latest', { signal: AbortSignal.timeout(timeout) });
    const body = await response.json(); return { status: response.status, version: body.version };
  }),
]);
const report = { startedAt, endedAt: new Date().toISOString(), node: process.version, track: 'Track 1 Vanilla', http, wss, results };
await mkdir('data/probes', { recursive: true });
await writeFile(`data/probes/${startedAt.replaceAll(/[:.]/g, '-')}.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (results.some(result => !result.ok)) process.exitCode = 1;
