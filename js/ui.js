/* js/ui.js */
import { State } from './state.js';

/**
 * createButton(text, className)
 */
export function createButton(text, cls=''){
  const b = document.createElement('button');
  b.innerText = text;
  if(cls) b.className = cls;
  return b;
}

/**
 * renderContextList(container, onSelect)
 */
export function renderContextList(container, onSelect){
  container.innerHTML = '';
  State.getContexts().forEach(c=>{
    const btn = createButton(c.label, 'btn-ghost');
    btn.style.width='100%';
    btn.addEventListener('click', ()=>onSelect(c.id));
    container.appendChild(btn);
  });
}

/**
 * renderAuditList(container, options)
 * options:
 *   - query: string to match wallet/hash (case-insensitive)
 *   - walletFilter: string wallet address to filter by (exact)
 *   - onChange: callback to call after deletion (optional) -> usually re-render
 */
export function renderAuditList(container, options = {}){
  const { query = '', walletFilter = '', onChange = null } = options;
  container.innerHTML = '';

  // Get audits (newest first)
  const audits = State.getAudits().slice().reverse();

  // Apply filters
  const q = (query || '').trim().toLowerCase();
  const filtered = audits.filter(a=>{
    if(walletFilter && walletFilter.trim() !== ''){
      if(a.wallet !== walletFilter) return false;
    }
    if(q){
      // match wallet or hash or note or timestamp string
      if(String(a.wallet).toLowerCase().includes(q)) return true;
      if(String(a.hash).toLowerCase().includes(q)) return true;
      if(String(a.note || '').toLowerCase().includes(q)) return true;
      const t = new Date(a.timestamp).toLocaleString().toLowerCase();
      if(t.includes(q)) return true;
      return false;
    }
    return true;
  });

  if(filtered.length === 0){
    const empty = document.createElement('div');
    empty.className = 'small';
    empty.innerText = 'No audits found.';
    container.appendChild(empty);
    return;
  }

  filtered.forEach((a, idx)=>{
    const row = document.createElement('div');
    row.className = 'audit-row';

    // header row (wallet + truncated hash + delete button)
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    const left = document.createElement('div');
    left.innerHTML = `<div style="font-weight:700">${a.wallet}</div><div class="small">${a.hash.slice(0,12)}…</div>`;

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.alignItems = 'center';

    // Delete single audit button
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-danger';
    delBtn.style.padding = '4px 8px';
    delBtn.style.fontSize = '12px';
    delBtn.innerText = 'Delete';

    // Find actual index in original audits array (not reversed)
    delBtn.addEventListener('click', ()=>{
      const original = State.getAudits();
      // Find by unique triple: wallet, hash, timestamp
      const actualIndex = original.findIndex(x => x.wallet === a.wallet && x.hash === a.hash && x.timestamp === a.timestamp);
      if(actualIndex === -1){
        alert('Could not find audit entry to delete.');
        return;
      }
      if(!confirm(`Delete audit for ${a.wallet} — ${a.hash.slice(0,12)}… ?`)) return;
      State.deleteAudit(actualIndex);
      if(typeof onChange === 'function') onChange();
      else renderAuditList(container, options);
    });

    actions.appendChild(delBtn);

    header.appendChild(left);
    header.appendChild(actions);

    // timestamp / note
    const meta = document.createElement('div');
    meta.className = 'small';
    meta.style.marginTop = '6px';
    meta.innerText = `${new Date(a.timestamp).toLocaleString()} ${a.note? ' — ' + a.note : ''}`;

    row.appendChild(header);
    row.appendChild(meta);
    container.appendChild(row);
  });
}

/**
 * utility to build wallet filter dropdown options
 */
export function buildWalletFilterOptions(selectEl){
  selectEl.innerHTML = '';
  const audits = State.getAudits();
  const wallets = Array.from(new Set(audits.map(a=>a.wallet))).filter(Boolean);
  const emptyOpt = document.createElement('option'); emptyOpt.value=''; emptyOpt.innerText = 'All wallets';
  selectEl.appendChild(emptyOpt);
  wallets.forEach(w=>{
    const o = document.createElement('option');
    o.value = w;
    o.innerText = w;
    selectEl.appendChild(o);
  });
}

/**
 * showLog(container, msg)
 */
export function showLog(container, msg){
  container.innerText = new Date().toLocaleTimeString() + "  " + msg + "\n" + container.innerText;
}

/**
 * modals
 */
export function showModal(modalEl){ modalEl.style.display = 'flex'; }
export function hideModal(modalEl){ modalEl.style.display = 'none'; }
