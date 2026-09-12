// Uses the installed project hook's own APIs; no fabricated capture events.
// Hook identity/config are never logged or exported.
import { execFileSync } from 'node:child_process';
const root = '../.local/xrpl-devex-hook/hook/';
if (process.argv.includes('--flush')) {
  const { loadConfig } = await import(root + 'lib/config.mjs');
  const { loadIdentity } = await import(root + 'lib/identity.mjs');
  const { flushBuffer } = await import(root + 'lib/buffer.mjs');
  const outcome = await flushBuffer({ config: loadConfig(), identity: loadIdentity(), hint: process.cwd(), timeoutMs: 8000 });
  console.log(JSON.stringify({ action: 'flush-existing-events', ok: outcome.ok, sent: outcome.sent, remaining: outcome.remaining, status: outcome.status, checkedAt: new Date().toISOString() }));
}
const status = JSON.parse(execFileSync(process.execPath, ['.local/xrpl-devex-hook/hook/status.mjs', '--json'], { encoding: 'utf8' }));
console.log(JSON.stringify(Object.fromEntries(['client_version', 'hooks_registered', 'buffered_events', 'sent_events', 'buffered_by_kind', 'sent_by_channel', 'last_flush_at', 'last_flush_result'].map(key => [key, status[key]])), null, 2));
