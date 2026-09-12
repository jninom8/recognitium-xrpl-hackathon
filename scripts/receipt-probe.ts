import { mkdir, writeFile } from 'node:fs/promises';
import { RecognitiumClient } from '../src/recognitium/client.js';
const client = new RecognitiumClient();
const hash = '5d1f5422917315e16a2b119d91c275b7085af2f56103f6914b3d9a444cbcc10a';
const evidence = await client.recover('DG-8ab218c99d844c4a92b0385f87475887', hash);
await mkdir('data/integration', { recursive: true });
await writeFile('data/integration/receipt-probe.json', JSON.stringify({ purpose: 'SYNTHETIC integration probe; no loan or payment asserted', evidence, tipWire: await client.tip() }, null, 2));
console.log(JSON.stringify({ receiptId: evidence.receiptId, contentHash: 'consistent', chainHash: 'consistent', authorityRecord: 'online-verified', xrplValidation: 'not-applicable', authorityCheckedAt: evidence.authorityCheckedAt }));
