/* js/profile.js */
import { State } from './state.js';
import { showLog } from './ui.js';

export function renderProfileAttributes(container, wallet, ctx){
  container.innerHTML = '';
  if(!wallet){ container.innerHTML = `<div class="small">No wallet connected</div>`; return; }
  const data = State.getProfile(wallet, ctx) || {};
  const keys = Object.keys(data).filter(k=>k!=='_deletedAt');
  if(keys.length===0){ container.innerHTML = `<div class="small">No attributes for this context</div>`; return; }

  keys.forEach(k=>{
    const row = document.createElement('div'); row.className = 'profile-attr';
    const left = document.createElement('div');
    left.innerHTML = `<div class="attr-key">${k}</div><div class="small">${data[k]}</div>`;
    const right = document.createElement('div');
    right.className = 'kv';
    const edit = document.createElement('button'); edit.innerText='Edit'; edit.className='btn-ghost';
    const del = document.createElement('button'); del.innerText='Delete'; del.className='btn-ghost';
    edit.addEventListener('click', ()=>enterEditMode(row, wallet, ctx, k, data[k]));
    del.addEventListener('click', ()=>{ State.deleteProfileKey(wallet, ctx, k); showLog(document.getElementById('log'), `Deleted ${k}`); renderProfileAttributes(container,wallet,ctx); });
    right.appendChild(edit); right.appendChild(del);
    row.appendChild(left); row.appendChild(right);
    container.appendChild(row);
  });
}

function enterEditMode(rowEl, wallet, ctx, key, value){
  rowEl.innerHTML = '';
  const input = document.createElement('input'); input.type='text'; input.value = value;
  const save = document.createElement('button'); save.innerText='Save';
  save.addEventListener('click', ()=>{
    State.setAttr(wallet, ctx, key, input.value);
    showLog(document.getElementById('log'), `Saved ${key}=${input.value}`);
    renderProfileAttributes(document.getElementById('attributesArea'), wallet, ctx);
  });
  const cancel = document.createElement('button'); cancel.innerText='Cancel';
  cancel.addEventListener('click', ()=>renderProfileAttributes(document.getElementById('attributesArea'), wallet, ctx));
  rowEl.appendChild(input);
  const wrap = document.createElement('div'); wrap.style.marginLeft='8px'; wrap.appendChild(save); wrap.appendChild(cancel);
  rowEl.appendChild(wrap);
}
