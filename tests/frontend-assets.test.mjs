import{test}from'node:test';import assert from'node:assert/strict';import{readdirSync,readFileSync,existsSync}from'node:fs';import{execFileSync}from'node:child_process';
test('browser modules parse and their local imports are included in all serving boundaries',()=>{
 const serving=['scripts/build-hosted.mjs','scripts/preview-app.mjs','src/server/index.ts'].map(p=>readFileSync(p,'utf8'));
 for(const file of readdirSync('web').filter(f=>/\.(js|mjs)$/.test(f))){
  execFileSync(process.execPath,['--check','web/'+file],{stdio:'pipe'});
  const text=readFileSync('web/'+file,'utf8');for(const [,name]of text.matchAll(/from\s+["']\.?\/([^"']+)["']/g)){
   assert.ok(existsSync('web/'+name),'Missing '+name);for(const source of serving)assert.ok(source.includes(name),'Asset not served: '+name);
  }
 }
});

test('hosted entry loads without CommonJS require of ESM dependencies',()=>{execFileSync(process.execPath,['--no-experimental-require-module','--input-type=module','-e',"await import('./dist/src/hosted/api.js')"],{stdio:'pipe'});});
