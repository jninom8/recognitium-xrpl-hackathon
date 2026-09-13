import {drops} from './state-client.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const key=(r,mode)=>mode+':'+r.agreement.requestId+':'+r.agreement.accounts.borrower;
export class WalletReadings {
  readings=new Map();
  get(r,mode){return this.readings.get(key(r,mode))??{};}
  async read(r,mode,fetcher=fetch) {
    const id=key(r,mode), prior=this.get(r,mode);
    if(prior.busy)return;
    this.readings.set(id,{...prior,busy:true,error:undefined});
    try{
      const response=await fetcher('/recognitium-xrpl-hackathon/api/requests/'+encodeURIComponent(r.agreement.requestId)+'/recognitium-xrpl-hackathon/app/balance?mode='+mode,{signal:AbortSignal.timeout(20000)});
      if(!response.ok)throw Error('Balance check unavailable. The previous observation is retained.');
      const o=await response.json();
      if(o.requestId!==r.agreement.requestId || o.account!==r.agreement.accounts.borrower || o.networkId!==r.agreement.network.networkId || !/^\d+$/.test(o.balanceDrops) || !Number.isSafeInteger(o.ledgerIndex) || !/^[A-Fa-f0-9]{64}$/.test(o.ledgerHash) || !Number.isFinite(Date.parse(o.checkedAt)))throw Error('The balance response did not match this request.');
      this.readings.set(id,{observation:o,busy:false});
    }catch(error){this.readings.set(id,{observation:prior.observation,busy:false,error:error.message});}
  }
}
export function walletPanel(r,mode,readings) {
  if(!r)return '';
  const {observation:o,busy,error}=readings.get(r,mode),funded=r.funding.status==='funded';
  const pendingLabel=r.funding.status==='unfunded'?'Not funded':'Not confirmed';
  const explorer='https://custom.xrpl.org/lending-hackathon.dev.ripplex.io:51233/';
  return `<section class="wallet-panel" aria-label="Borrower wallet and XRPL network"><div class="wallet-heading"><div><p class="eyebrow">BORROWER TEST WALLET</p><h2>Balance, with context.</h2></div><button class="secondary" data-balance ${busy?'disabled':''}>${busy?'Checking ledger…':o?'Refresh balance ↻':'Check wallet balance ↗'}</button></div><div class="wallet-figures"><div><span>${mode==='recorded'?'Wallet now · separate live lookup':'Wallet balance · last checked'}</span><strong>${o?esc(drops(o.balanceDrops)):'Not checked'}${o?'<small> test XRP</small>':''}</strong></div><div><span>Received from this loan${mode==='recorded'?' · historical':''}</span><strong>${funded?esc(drops(r.funding.borrowerFundingDrops)):pendingLabel}${funded?'<small> test XRP</small>':''}</strong></div></div><p class="hint">The wallet can contain test funds supplied during setup and other transfers. Its balance is not the loan amount or the amount owed.</p><div class="network-line"><span>XRPL event network <strong>${esc(r.agreement.network.networkId)}</strong> · Test funds only</span><a target="_blank" rel="noopener" href="${explorer}">Explore the XRPL chain ↗</a></div><details><summary>Wallet address and ledger observation</summary><p class="hash">${esc(r.agreement.accounts.borrower)}</p>${o?'<p class="hint">Checked '+esc(new Date(o.checkedAt).toLocaleString('en-GB'))+' at validated ledger '+o.ledgerIndex+'.</p><p class="hash">Ledger hash: '+esc(o.ledgerHash)+'</p>':'<p class="hint">Use Check wallet balance for an on-demand read from the event ledger.</p>'}</details>${error?'<p class="receipt-alert" role="status">'+esc(error)+'</p>':''}</section>`;
}
