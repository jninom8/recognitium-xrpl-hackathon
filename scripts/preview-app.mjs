// Local preview of the hosted boundary: read/review only, no native signing.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from '../dist/src/hosted/api.js';
const assets=new Set(['index.html','customer.css','customer.js','customer-model.mjs','state-client.mjs','operator.html','app.js','style.css','journey-model.mjs','journey-view.mjs','journey.css','wallet-panel.mjs','assistant.js','conversation.css','market.js','receipt-register.js']);
const port=Number(process.env.PREVIEW_PORT??3200);
createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path.startsWith('/api/'))return handler(req,res);
  const file=['/','/borrow','/lend','/review'].includes(path)?'index.html':path==='/operator'?'operator.html':path.slice(1);
  if(!assets.has(file)){res.writeHead(404);return res.end();}
  try{const data=await readFile('web/'+file);res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'text/javascript','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'"});res.end(data);}catch{res.writeHead(500);res.end('Preview file unavailable');}
}).listen(port,'127.0.0.1',()=>console.log('Hosted-boundary preview: http://127.0.0.1:'+port));
