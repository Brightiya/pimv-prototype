/* js/vc.js */
import { State } from './state.js';
import { showLog } from './ui.js';

export function issueVC(wallet, ctx){
  const data = State.getProfile(wallet, ctx) || {};

  const vc = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential", "PIMVProfileCredential"],
    issuer: "did:example:issuer",
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: `did:ethr:${wallet}`,
      context: ctx,   // ✅ FIXED — use ctx, not context
      profile: data
    },
    proof: {
      type: "Ed25519Signature2018",
      created: new Date().toISOString(),
      proofValue: "simulated-proof-" + Math.random().toString(16).slice(2, 10)
    }
  };

  showLog(document.getElementById('log'), `Issued VC for ${wallet} (${ctx})`);
  return vc;
}
