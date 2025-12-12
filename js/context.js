/* js/context.js */
import { State } from './state.js';
import { renderContextList } from './ui.js';

export function initContextControls(container, onSelect){
  renderContextList(container, onSelect);
}

export function addCustomContext(id, label){
  const ctx = { id, label };
  State.addContext(ctx);
}
