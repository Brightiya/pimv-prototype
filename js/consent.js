/* js/consent.js */
import { showModal, hideModal, showLog } from './ui.js';
import { State } from './state.js';

export function createConsentModal(rootEl){
  const backdrop = document.createElement('div'); backdrop.className='modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h2 id="consentTitle">Consent Request — Acme Insurance</h2>
      <div class="small">Acme Insurance requests limited verification.</div>
      <div style="display:flex;gap:12px;margin-top:12px">
        <div style="flex:1">
          <label>Requested</label>
          <div id="consentRequested" class="small"></div>
        </div>
        <div style="flex:1">
          <label>Privacy summary</label>
          <div class="small">Purpose: eligibility check. Retention: minimal proof only.</div>
        </div>
      </div>
      <div style="margin-top:12px">
        <input id="consentCheck" type="checkbox" /> <span class="small">I consent to share these attributes</span>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
        <button id="consentReject" class="btn-ghost">Reject</button>
        <button id="consentApprove" disabled>Approve</button>
      </div>
    </div>
  `;
  rootEl.appendChild(backdrop);

  const requested = backdrop.querySelector('#consentRequested');
  const chk = backdrop.querySelector('#consentCheck');
  const approve = backdrop.querySelector('#consentApprove');
  const reject = backdrop.querySelector('#consentReject');

  chk.addEventListener('change', ()=>approve.disabled = !chk.checked);
  approve.addEventListener('click', ()=>{
    const wallet = backdrop.dataset.wallet || '—';
    State.addAudit({wallet, hash: generateProof(wallet), timestamp: Date.now(), note:'consent_approved'});
    hideModal(backdrop); showLog(document.getElementById('log'), `Consent approved for ${wallet}`);
    renderAudit();
  });
  reject.addEventListener('click', ()=>{ hideModal(backdrop); showLog(document.getElementById('log'), 'Consent rejected'); });

  function open(wallet, attrs){
    backdrop.dataset.wallet = wallet;
    requested.innerHTML = attrs.map(a=>`<div>${a}</div>`).join('');
    chk.checked=false; approve.disabled=true;
    showModal(backdrop);
  }

  function generateProof(wallet){
    return '0x' + Math.random().toString(16).slice(2,32).padEnd(64,'0');
  }

  function renderAudit(){
    const list = document.getElementById('auditPanel');
    if(list) list.innerHTML=''; // will be re-rendered by main
  }

  return { open, el: backdrop };
}
