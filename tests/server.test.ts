import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
test('local API shows disconnected state and refuses unauthenticated or wrong-role mutation', async () => {
  const port=36000+Math.floor(Math.random()*10000);
  const broker='B'.repeat(32), borrower='R'.repeat(32), operator='O'.repeat(32);
  const child=spawn(process.execPath,['dist/src/server/index.js'],{env:{...process.env,PORT:String(port),PROTOTYPE_BROKER_TOKEN:broker,PROTOTYPE_BORROWER_TOKEN:borrower,PROTOTYPE_OPERATOR_TOKEN:operator,RECOGNITIUM_API_KEY:''},stdio:['ignore','pipe','pipe']});
  try {
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw new Error('Server exited before readiness');}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('Server startup timeout')),10000);timer.unref();})]);
    const base=`http://127.0.0.1:${port}`;
    const state=await (await fetch(base+'/api/state')).json();
    assert.equal(state.contractVersion,'recognitium.lending.v1'); assert.equal(state.connected,false);
    const home=await fetch(base); assert.equal(home.status,200); assert.match(await home.text(),/Agree\. Fund\. Verify\./);
    for(const [path,token] of [['/api/setup',''],['/api/setup',broker],['/api/requests/x/approve/borrower',broker]]) {
      const response=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:'{}'});
      assert.equal(response.status,401);
    }
    const crossOrigin=await fetch(base+'/api/requests/x/approve/broker',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${broker}`,Origin:'https://untrusted.invalid'},body:'{}'});
    assert.equal(crossOrigin.status,409);
    assert.equal((await fetch(base+'/wallets/broker.json')).status,404);
  } finally { if(child.exitCode === null) { const exited=once(child,'exit');child.kill();await exited; } }
});
