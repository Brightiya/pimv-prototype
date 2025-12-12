/* js/gdpr.js */
import { State } from './state.js';
import { showLog, renderAuditList } from './ui.js';

export async function triggerErase(wallet){
  if(!wallet) throw new Error('wallet required');
  const ok = confirm(`Confirm GDPR erasure for ${wallet}?`);
  if(!ok) return;
  showLog(document.getElementById('log'), `Starting erasure ${wallet}`);
  const start = performance.now();
  // simulate DB soft delete
  State.markDeleted(wallet);
  // simulate IPFS unpin delay
  await new Promise(r=>setTimeout(r, 120));
  // simulate on-chain proof
  const proof = generateProof();
  State.addAudit({wallet, hash:proof, timestamp:Date.now(), note:'erase'});
  renderAuditList(document.getElementById('auditList'));
  const elapsed = Math.round(performance.now()-start);
  showLog(document.getElementById('log'), `Erasure complete ${wallet} in ${elapsed} ms`);
  document.getElementById('metrics').innerText = `Last erasure: ${elapsed} ms`;
  return { elapsed, proof };
}

export async function runBenchmark(n=10){
  showLog(document.getElementById('log'), `Running ${n}× erasure benchmark`);
  const results = [];
  for(let i=0;i<n;i++){
    const fake = '0xFAKE'+Math.floor(Math.random()*1e6).toString(16).toUpperCase();
    State.ensureProfile(fake);
    const t0 = performance.now();
    // simulate
    await new Promise(r=>setTimeout(r, 60 + Math.random()*120));
    State.addAudit({wallet:fake, hash:generateProof(), timestamp:Date.now(), note:'bench'});
    results.push(Math.round(performance.now()-t0));
    renderAuditList(document.getElementById('auditList'));
    showLog(document.getElementById('log'), `Bench ${i+1}/${n}: ${results[results.length-1]} ms`);
  }
  const avg = Math.round(results.reduce((a,b)=>a+b,0)/results.length);
  document.getElementById('metrics').innerText = `Benchmark ${n} runs — avg ${avg} ms`;
  showLog(document.getElementById('log'), `Benchmark finished — avg ${avg} ms`);
  return {avg, results};
}

function generateProof(){
  return '0x'+Math.random().toString(16).slice(2,32).padEnd(64,'0');
}
