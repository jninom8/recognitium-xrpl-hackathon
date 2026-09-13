import { amountToDrops } from './customer-model.mjs';
const blank=()=>({amount:null,days:null,purpose:null});
export function createConversation(root, actions) {
  root.innerHTML=`<div class="chat-heading"><div><span class="eyebrow">YOUR FINANCING GUIDE</span><h2 id="chat-title">Let's take the next step.</h2></div><span id="chat-provider" class="guide-label">Ready to help</span></div>
    <p class="chat-disclosure">Made-up business details only. AI helps prepare; you decide. No documents, personal information or wallet secrets.</p>
    <div id="chat-messages" class="chat-messages" role="log" aria-label="Financing conversation" aria-live="polite"></div>
    <div id="chat-chips" class="chat-chips"></div>
    <form id="chat-form" class="chat-form"><label class="sr-only" for="chat-input">Message to your financing guide</label><textarea id="chat-input" maxlength="800" rows="2" placeholder="Tell me what you have in mind…" required></textarea><button class="primary" id="chat-send" type="submit">Send ↗</button></form>
    <p id="chat-status" class="hint" role="status"></p><div id="chat-draft" class="chat-draft" hidden></div>
    <div class="chat-actions"><button type="button" id="chat-review" class="primary" hidden>Review request →</button><button type="button" id="chat-form-fallback" class="text-button">Use a simple form</button><button type="button" id="chat-reset" class="text-button">Start a new conversation</button></div>`;
  const $=id=>root.querySelector('#'+id);
  let key='',version=0,ctx,busy=false,draft=blank(),messages=[],controller;
  let sessionId;try{sessionId=sessionStorage.getItem('recognitium.ai.session');}catch{}
  if(!/^[a-f0-9-]{36}$/.test(sessionId??'')){sessionId=crypto.randomUUID();try{sessionStorage.setItem('recognitium.ai.session',sessionId);}catch{}}
  const add=(text,who='guide')=>{const el=document.createElement('p');el.className='chat-message '+who;el.textContent=text;$('chat-messages').append(el);$('chat-messages').scrollTop=$('chat-messages').scrollHeight;};
  function paintDraft(){
    $('chat-draft').hidden=ctx?.role==='broker'||(!draft.amount&&!draft.days&&!draft.purpose);
    $('chat-draft').textContent='Draft only · '+[draft.amount&&draft.amount+' test XRP',draft.days&&draft.days+' days',draft.purpose&&draft.purpose.replaceAll('-',' ')].filter(Boolean).join(' · ');
    $('chat-review').hidden=ctx?.role!=='borrower'||ctx?.mode==='recorded'||Boolean(ctx?.id)||!draft.amount||!draft.days||!draft.purpose;
  }
  function intro(){
    $('chat-messages').replaceChildren();messages=[];draft=blank();
    $('chat-provider').textContent='Ready to help';$('chat-status').textContent='';
    const recorded=ctx.mode==='recorded';
    $('chat-title').textContent=ctx.role==='borrower'?'Your next step, together.':ctx.role==='lender'?'Put your intention into words.':'A clear view before you decide.';
    add(recorded?'This is the completed test loan. Ask about the process or open its evidence. New requests belong in the live workspace.':ctx.role==='borrower'?(ctx.id?'Your saved request is in the summary. I can explain the next steps. To prepare another request, choose New request first.':'What would you like to finance? Tell me the amount and timing if you know them.'):ctx.role==='lender'?'How much test XRP are you considering providing? We can explore the process. This conversation does not deposit money or reserve a place in a vault.':'Choose a request in the summary, then open its review. I can explain the checks; your decision stays separate from the conversation.');
    const chips=recorded?['How does the agreement link to the loan?','What can I verify offline?']:ctx.role==='borrower'?['Inventory: 100 test XRP for 30 days','Waiting for an invoice payment','What happens after I apply?']:ctx.role==='lender'?['I am considering 200 test XRP','How are returns calculated?','Can I withdraw at any time?']:['What should I check before review?','What does a KYC commitment prove?'];
    $('chat-chips').replaceChildren(...chips.map(text=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>{$('chat-input').value=text;void send();});return b;}));
    $('chat-form-fallback').textContent=ctx.role==='borrower'&&!recorded?'Use a simple form':ctx.role==='broker'?'Open review':'View evidence';
    paintDraft();
  }
  function restore(){busy=false;$('chat-send').disabled=false;$('chat-input').disabled=false;$('chat-chips').querySelectorAll('button').forEach(b=>b.disabled=false);}
  async function send(){
    const text=$('chat-input').value.trim();if(!text||busy)return;
    if(/\bsEd[1-9A-HJ-NP-Za-km-z]{20,}\b|-----BEGIN.*PRIVATE KEY|api[_ -]?key\s*[:=]/i.test(text)){$('chat-status').textContent='Keep secrets outside the conversation. Please use synthetic business details.';return;}
    const at=version;busy=true;add(text,'you');messages.push(text);messages=messages.slice(-8);$('chat-input').value='';$('chat-send').disabled=true;$('chat-input').disabled=true;$('chat-chips').querySelectorAll('button').forEach(b=>b.disabled=true);$('chat-status').textContent='Preparing a suggestion…';
    controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),24000);
    try{
      const response=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:ctx.role,messages,draft,sessionId}),signal:controller.signal});
      if(!response.ok)throw Error();const result=await response.json();if(at!==version)return;
      if(result.source!=='mistral'||typeof result.reply!=='string'||!result.draft)throw Error();
      if(result.draft.amount!==null)amountToDrops(result.draft.amount);
      if(result.draft.days!==null&&(!Number.isInteger(result.draft.days)||result.draft.days<1||result.draft.days>90))throw Error();
      if(result.draft.purpose!==null&&!['inventory','receivables','working-capital'].includes(result.draft.purpose))throw Error();
      draft=result.draft;add(result.reply);$('chat-provider').textContent='Mistral · AI guidance';$('chat-status').textContent='Suggestions only. Confirm the exact fields before sending a request.';paintDraft();
    }catch{if(at===version){$('chat-provider').textContent='Guided form available';$('chat-status').textContent='AI is unavailable or its demo limit was reached. Your existing records are unchanged.';add('You can continue with the simple form or review the saved evidence below.');}}
    finally{clearTimeout(timeout);if(at===version)restore();}
  }
  $('chat-form').addEventListener('submit',e=>{e.preventDefault();void send();});
  $('chat-review').addEventListener('click',()=>actions.reviewDraft(structuredClone(draft)));
  $('chat-form-fallback').addEventListener('click',()=>actions.fallback(ctx));
  $('chat-reset').addEventListener('click',()=>{version++;controller?.abort();restore();intro();});
  return {update(context){ctx=context;const next=[ctx.role,ctx.mode,ctx.id,ctx.revision,ctx.instanceId].join(':');if(next!==key){key=next;version++;controller?.abort();restore();intro();}}};
}
