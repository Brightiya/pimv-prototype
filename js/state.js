/* js/state.js */
export const State = (function(){
  const LS_KEY = "pimv_state_v1";

  // Defaults
  const defaultState = {
    contexts: [
      {id:'professional', label:'Professional'},
      {id:'personal', label:'Personal'},
      {id:'religious', label:'Religious'},
      {id:'tribal', label:'Tribal/Custom'}
    ],
    profiles: {
      "0xAAA111": {
        professional: { firstName:'Usman', surname:'Yahen', age:34, gender:'Male', email:'usman@work.test', role:'Engineer' },
        personal: { firstName:'Usman', surname:'Yahen', nickname:'Uzi', phone:'+44 7000 000' }
      }
    },
    audits: []
  };

  let data = load();

  function load(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){ console.warn("Failed to load state", e); }
    return JSON.parse(JSON.stringify(defaultState));
  }

  function save(){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(data)); }catch(e){ console.warn("Failed to save state", e); }
  }

  // Public API
  return {
    getContexts(){ return data.contexts; },
    addContext(ctx){ data.contexts.push(ctx); save(); },

    getProfiles(){ return data.profiles; },
    getProfile(wallet, ctx){
      return (data.profiles[wallet]||{})[ctx] || null;
    },

    ensureProfile(wallet){
      data.profiles[wallet] = data.profiles[wallet] || {};
      save();
    },

    setAttr(wallet, ctx, key, value){
      data.profiles[wallet] = data.profiles[wallet] || {};
      data.profiles[wallet][ctx] = data.profiles[wallet][ctx] || {};
      data.profiles[wallet][ctx][key] = value;
      save();
    },

    deleteProfileKey(wallet, ctx, key){
      const p = (data.profiles[wallet]||{})[ctx];
      if(p && Object.prototype.hasOwnProperty.call(p,key)){
        delete p[key];
        save();
      }
    },

    markDeleted(wallet){
      data.profiles[wallet] = data.profiles[wallet] || {};
      data.profiles[wallet]._deletedAt = new Date().toISOString();
      save();
    },

    addAudit(a){
      // Ensure minimal required fields
      const entry = {
        wallet: a.wallet || '—',
        hash: a.hash || ('0x' + Math.random().toString(16).slice(2,32)),
        timestamp: a.timestamp || Date.now(),
        note: a.note || ''
      };
      data.audits.push(entry);
      save();
    },

    getAudits(){
      // return shallow copy
      return data.audits.slice();
    },

    // delete by index in original audits array
    deleteAudit(index){
      if(index >= 0 && index < data.audits.length){
        data.audits.splice(index, 1);
        save();
      }
    },

    // delete all audits
    deleteAllAudits(){
      data.audits = [];
      save();
    },

    // export audits data (returns JS array)
    exportAudits(){
      return JSON.parse(JSON.stringify(data.audits));
    },

    getRaw(){ return data; }
  };
})();
