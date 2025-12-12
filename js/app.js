/* js/app.js */
import { State } from './state.js';
import * as UI from './ui.js';
import * as Context from './context.js';
import * as Profile from './profile.js';
import { createConsentModal } from './consent.js';
import * as GDPR from './gdpr.js';
import * as VC from './vc.js';

const left = document.getElementById('leftPane');
const main = document.getElementById('mainPane');
const right = document.getElementById('rightPane');

// Build left pane (controls)
left.innerHTML = `
  <label>Connected identity</label>
  <div style="display:flex;gap:8px"><input id="wallet" placeholder="0xAAA111" /><button id="connectBtn">Connect</button></div>
  <div class="muted small">DID: <span id="didDisplay">—</span></div>
  <hr/>
  <label>Personal details (saved to current context)</label>
  <input id="firstName" placeholder="First name" />
  <input id="surname" placeholder="Surname" />
  <input id="age" placeholder="Age" type="number" />
  <select id="gender"><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select>
  <button id="saveBio" class="btn-secondary">Save to context</button>
  <hr/>
  <label>Contexts</label>
  <div id="contextList"></div>
  <input id="newContextInput" placeholder="custom context id (e.g.,health)" />
  <button id="addContext" class="btn-secondary">Add context</button>
  <hr/>
  <label>Add attribute (key/value)</label>
  <input id="attrKey" placeholder="attribute (e.g., nationality)" />
  <input id="attrVal" placeholder="value (e.g., British)" />
  <button id="addAttr" class="btn-ghost">Add attribute</button>
  <hr/>
  <div class="controls">
    <button id="consentBtn" class="btn-ghost">Simulate Consent Request</button>
    <button id="eraseBtn" class="btn-danger">Request GDPR Erasure</button>
    <button id="benchBtn" class="btn" style="background:#805ad5">Run 10× Erasure Benchmark</button>
    <button id="issueVcBtn" class="btn-secondary">Issue VC (simulate)</button>
    <button onclick="window.location.href='https://forms.gle/Np6TWNWkjjeAbEcQA'" class="btn">
    Take SUS Questionnaire
</button>

  </div>
`;

// Build main pane (profile view)
main.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div><span id="contextPill" class="context-pill">No context</span><span id="contextExplain" class="small">Select a context</span></div>
    <div><span class="small">Profile state: </span><span id="profileState" class="small">Active</span></div>
  </div>
  <hr/>
  <label>Profile attributes</label>
  <div id="attributesArea"></div>
  <div style="margin-top:12px"><button id="shareBtn" class="btn">Share (consent)</button><button id="editBtn" class="btn-secondary" style="margin-left:8px">Edit</button></div>
  <hr/>
  <label>Logs</label>
  <div id="log" class="log"></div>
`;

// Build right pane (audit & metrics) — updated with search/filter/export/deleteAll
right.innerHTML = `
  <label>Audit & proofs</label>

  <div style="display:flex;gap:8px;margin-top:8px;margin-bottom:8px">
    <input id="auditSearch" type="text" placeholder="Search wallet / hash / note" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e6eef9" />
    <select id="walletFilter" style="min-width:180px;padding:8px;border-radius:8px;border:1px solid #e6eef9">
      <option value="">All wallets</option>
    </select>
  </div>

  <div style="display:flex;gap:8px;margin-bottom:8px">
    <button id="exportJsonBtn" class="btn-ghost">Export JSON</button>
    <button id="deleteAllBtn" class="btn-danger" style="margin-left:auto">Delete All</button>
  </div>

  <div id="auditList"></div>
  <hr/>
  <label>Metrics</label>
  <div id="metrics" class="small">No benchmarks run yet</div>
  <hr/>
  <label>VC JSON</label>
  <pre id="vcJson" style="background:#f7fafc;padding:8px;border-radius:6px;height:160px;overflow:auto"></pre>
`;

/* DOM refs */
const contextListEl = document.getElementById('contextList');
const attributesArea = document.getElementById('attributesArea');
const auditList = document.getElementById('auditList');
const logEl = document.getElementById('log');
const auditSearch = document.getElementById('auditSearch');
const walletFilter = document.getElementById('walletFilter');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');

/* init context list */
Context.initContextControls(contextListEl, (ctx)=>{
  selectContext(ctx);
});

/* stateful vars */
let connectedWallet = null;
let currentContext = null;

/* helper: select context */
function selectContext(ctx){
  currentContext = ctx;
  document.getElementById('contextPill').innerText = ctx;
  document.getElementById('contextExplain').innerText = 'Viewing ' + ctx;
  renderProfile();
}

/* render profile & audit */
function renderProfile(){
  Profile.renderProfileAttributes(attributesArea, connectedWallet, currentContext);
  renderAuditPanel(); // custom wrapper below
  UI.showLog(logEl, 'Rendered profile view');
}

/* audit rendering wrapper (uses search + filter) */
function renderAuditPanel(){
  const q = auditSearch.value.trim();
  const wf = walletFilter.value.trim();
  UI.renderAuditList(auditList, {
    query: q,
    walletFilter: wf,
    onChange: () => renderAuditPanel()
  });

  // rebuild wallet filter options
  UI.buildWalletFilterOptions(walletFilter);
  // keep previously selected value if possible
  if(wf) walletFilter.value = wf;
}

/* wire controls */
document.getElementById('connectBtn').addEventListener('click', ()=>{
  const w = document.getElementById('wallet').value.trim();
  if(!w) return alert('Enter wallet');
  connectedWallet = w;
  document.getElementById('didDisplay').innerText = 'did:ethr:' + w;
  State.ensureProfile(w);
  UI.showLog(logEl, `Connected ${w}`);
  renderProfile();
});

document.getElementById('addContext').addEventListener('click', ()=>{
  const id = document.getElementById('newContextInput').value.trim();
  if(!id) return alert('Enter id');
  State.addContext({id, label: id[0].toUpperCase()+id.slice(1)});
  Context.initContextControls(contextListEl, selectContext);
  UI.showLog(logEl, `Added context ${id}`);
});

document.getElementById('saveBio').addEventListener('click', ()=>{
  if(!connectedWallet) return alert('Connect wallet first');
  if(!currentContext) return alert('Select context first');
  const f = document.getElementById('firstName').value.trim();
  const s = document.getElementById('surname').value.trim();
  const a = document.getElementById('age').value.trim();
  const g = document.getElementById('gender').value.trim();
  if(f) State.setAttr(connectedWallet, currentContext, 'firstName', f);
  if(s) State.setAttr(connectedWallet, currentContext, 'surname', s);
  if(a) State.setAttr(connectedWallet, currentContext, 'age', a);
  if(g) State.setAttr(connectedWallet, currentContext, 'gender', g);
  UI.showLog(logEl, `Saved bio to ${currentContext}`);
  renderProfile();
});

document.getElementById('addAttr').addEventListener('click', ()=>{
  if(!connectedWallet) return alert('Connect wallet first');
  if(!currentContext) return alert('Select context first');
  const k = document.getElementById('attrKey').value.trim();
  const v = document.getElementById('attrVal').value.trim();
  if(!k||!v) return alert('Enter key & value');
  State.setAttr(connectedWallet, currentContext, k, v);
  document.getElementById('attrKey').value=''; document.getElementById('attrVal').value='';
  UI.showLog(logEl, `Added ${k}=${v}`);
  renderProfile();
});

/* Consent */
const consentModal = createConsentModal(document.getElementById('modalRoot'));
document.getElementById('consentBtn').addEventListener('click', ()=>{
  if(!connectedWallet) return alert('Connect wallet first');
  const attrs = Object.keys(State.getProfile(connectedWallet, currentContext) || {});
  consentModal.open(connectedWallet, attrs);
});

/* Share button also opens consent */
document.getElementById('shareBtn').addEventListener('click', ()=>document.getElementById('consentBtn').click());

/* GDPR erase & benchmark */
document.getElementById('eraseBtn').addEventListener('click', async ()=>{
  if(!connectedWallet) return alert('Connect wallet first');
  await GDPR.triggerErase(connectedWallet);
  renderProfile();
  renderAuditPanel();
});
document.getElementById('benchBtn').addEventListener('click', ()=>GDPR.runBenchmark(10).then(()=>renderAuditPanel()));

/* Issue VC */
document.getElementById('issueVcBtn').addEventListener('click', ()=>{
  if(!connectedWallet) return alert('Connect wallet first');
  if(!currentContext) return alert('Select context first');
  const vc = VC.issueVC(connectedWallet, currentContext);
  document.getElementById('vcJson').innerText = JSON.stringify(vc, null, 2);
});

/* Audit controls wiring */
auditSearch.addEventListener('input', ()=> renderAuditPanel());
walletFilter.addEventListener('change', ()=> renderAuditPanel());

// Export JSON
exportJsonBtn.addEventListener('click', ()=>{
  const data = State.exportAudits();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audits.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  UI.showLog(logEl, `Exported ${data.length} audits to audits.json`);
});

// Delete All
deleteAllBtn.addEventListener('click', ()=>{
  if(!confirm('Delete ALL audit entries? This cannot be undone.')) return;
  State.deleteAllAudits();
  renderAuditPanel();
  UI.showLog(logEl, 'All audits deleted');
});

/* initial render */
Context.initContextControls(contextListEl, selectContext);
renderProfile();
renderAuditPanel();
UI.showLog(logEl, 'App ready');
