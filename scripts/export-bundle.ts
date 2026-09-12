import { mkdir, writeFile } from 'node:fs/promises';
import { Store } from '../src/requests/store.js';
import type { PrivateRequest } from '../src/requests/service.js';
import { exportBundle } from '../src/recognitium/evidence.js';
import { verifyOffline } from '../src/recognitium/evidence.js';
import type { Operation } from '../src/requests/journal.js';
const id = process.argv[2]; if (!id) throw new Error('Provide request ID');
const request = await new Store<PrivateRequest>('data/requests').read(id); if (!request) throw new Error('Unknown request');
const bundle = exportBundle(request);
const cycle = await new Store<{requestId:string;depositDrops:string;yield?:{realisedYieldDrops:string};refusal?:NonNullable<typeof bundle.nativeCycle>['refusal']}>('data/cycles').read('native');
if(!cycle?.yield || !cycle.refusal || cycle.requestId !== id) throw new Error('Complete native cycle with refusal and realised yield required');
const operations=await new Store<Operation>('data/operations').all();
bundle.nativeCycle={depositDrops:cycle.depositDrops,realisedYieldDrops:cycle.yield.realisedYieldDrops,refusal:cycle.refusal,
  transactions:Object.fromEntries(operations.filter(op=>op.result).map(op=>[op.id,op.result!]))};
verifyOffline(bundle);
await mkdir('data/exports',{recursive:true});
await writeFile(`data/exports/${id}.json`,JSON.stringify(bundle,null,2));
console.log(`Synthetic evidence exported to data/exports/${id}.json. Review before publication.`);
