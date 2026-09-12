import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { Dashboard, readPublishedBundle, repositoryBundlePath } from '../dist/src/server/dashboard.js';
import { initialHealth } from '../dist/src/server/health.js';

await mkdir('public', { recursive: true });
await mkdir('hosted', { recursive: true });
const files = ['index.html','customer.css','customer.js','customer-model.mjs','state-client.mjs','operator.html','app.js','style.css'];
for (const file of files) await copyFile('web/' + file, 'public/' + file);
const health = initialHealth();
health.ledger.message = 'Hosted request review has no signing wallets. Native lending runs on the local operator backend.';
health.receipts.message = 'The published example contains recorded receipts. No receipt is issued by this hosted service.';
health.hook.message = 'Developer capture runs on participant machines; no private hook files are deployed.';
const dashboard = new Dashboard({ records: async () => ({cycle:null,requests:[]}), health: () => health, connected: () => false, published: readPublishedBundle });
for (const mode of ['recorded','live']) {
  const state = await dashboard.snapshot(mode);
  state.actions = state.actions.map(action => ({...action,allowed:false,reason:'Native actions are available only on the local operator backend.'}));
  await writeFile('hosted/' + mode + '.json', JSON.stringify(state));
}
await copyFile(repositoryBundlePath, 'hosted/bundle.json');
console.log('Hosted assets built from an explicit allowlist and the reviewed public bundle. No private state, wallet, service key or hook file included.');
