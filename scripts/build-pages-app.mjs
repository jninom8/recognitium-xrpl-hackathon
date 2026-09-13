import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
const base='/recognitium-xrpl-hackathon/';
await mkdir('docs/app',{recursive:true});
await copyFile('docs/index.html','docs/film.html');
const files=['index.html','customer.css','customer.js','customer-model.mjs','state-client.mjs','journey-model.mjs','journey-view.mjs','journey.css','wallet-panel.mjs','assistant.js','conversation.css','market.js','receipt-register.js'];
const path=s=>s.replace(/(["'`])\/(?!\/)([^"'`\s<>]*)/g,(all,q,p)=>q+base+(p.startsWith('api/')?p:['borrow','lend','review'].includes(p)?p+'.html':p===''?'':p.startsWith('?')?'index.html'+p:'app/'+p));
for(const file of files){let s=await readFile('web/'+file,'utf8');
if(file==='customer.js'){
s="import './pages-transport.js';\n"+s;
s=s.replace('function sourceChanged(value) {','function sourceChanged(value) {\n value="recorded";');
s=s.replaceAll('$("source").value = "live"','$("source").value = "recorded"');
s=s.replace('entry.get("mode") === "recorded" ? "recorded" : "live"','"recorded"');
s=s.replace("$('profile').querySelector('option[value=\"broker\"]').hidden = recorded;","$('profile').querySelector('option[value=\"broker\"]').hidden = false;");
s=s.replace('}, 3000);','}, 60000);');
}
if(file==='index.html')s=s.replace('<body class="welcome">','<body><aside style="padding:12px 20px;background:#fff3d9;color:#173e35;text-align:center">GitHub-hosted frontend · Saved loan data · New requests and signing require the live backend. <a href="./film.html">Watch the film</a></aside>');
s=path(s);
if(file==='index.html'){await writeFile('docs/index.html',s);for(const role of ['borrow','lend','review'])await writeFile('docs/'+role+'.html',s);}else await writeFile('docs/app/'+file,s);
}
await copyFile('hosted/recorded.json','docs/app/state.json');
await copyFile('evidence/synthetic-supplier-001.json','docs/app/evidence.json');
const st=JSON.parse(await readFile('hosted/recorded.json','utf8'));
const receipts=st.requests.flatMap(r=>['agreementReceipt','executionReceipt'].filter(k=>r[k]).map(k=>({...r[k],round:r.agreement.requestId,kind:k==='agreementReceipt'?'Agreement':'XRPL execution',source:'Saved completed loan'})));
await writeFile('docs/app/receipts.json',JSON.stringify({receipts}));
await writeFile('docs/app/pages-transport.js',`const original=window.fetch.bind(window);\nwindow.fetch=(input,options={})=>{const url=new URL(typeof input==='string'?input:input.url??input,location.href);if(url.pathname.includes('/api/')){if(options.method&&options.method!=='GET')return Promise.resolve(new Response(JSON.stringify({error:'GitHub Pages is read-only. Live backend required.'}),{status:503}));const resource=url.pathname.includes('/api/state')?'state.json':url.pathname.endsWith('/api/receipts')?'receipts.json':url.pathname.endsWith('/api/evidence/published')?'evidence.json':null;return resource?original(new URL(resource,import.meta.url),options):Promise.resolve(new Response('{}',{status:503}));}return original(input,options);};`);
console.log('Actual application assets published with explicit read-only transport.');
