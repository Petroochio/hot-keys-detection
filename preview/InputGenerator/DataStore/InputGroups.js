// Defaul input groups state is empty array
const undos = [];
const redos = [];
let state = [];
const stateListeners = [];

function propogate() {
  stateListeners.forEach(l => l(state));
}

export default {
  getState: () => state,
  storeState: () => {
    undos.push(JSON.stringify(state));
    redos.splice(0, redos.length);
  },
  setProp: (prop, value) => {
    state[prop] = value;
    propogate();
  },
  undo: () => {
    if (undos.length > 0) {
      redos.push(JSON.stringify(state));
      state.splice(0, state.length);
      JSON.parse(undos[undos.length - 1]).map(ig => state.push(ig));
      undos.splice(undos.length - 1, 1);
      propogate();
    }
  },
  redo: () => {
    if (redos.length > 0) {
      undos.push(JSON.stringify(state));
      state.splice(0, state.length);
      JSON.parse(redos[redos.length - 1]).map(ig => state.push(ig));
      redos.splice(redos.length - 1, 1);
      propogate();
    }
  },
  pushGroup: (newGroup) => {
    undos.push(JSON.stringify(state));
    state.push(newGroup);
    redos.splice(0, redos.length);
    propogate();
  },
  removeGroup: (id) => {
    undos.push(JSON.stringify(state));
    state.splice(id, 1);
    redos.splice(0, redos.length);
    propogate();
  },
  forceUpdate: () => {
    propogate();
  },
  loadConfig: (config) => {
    state.splice(0, state.length);
    config.forEach(ig => state.push(ig));
    undos.splice(0, undos.length);
    redos.splice(0, redos.length);
    propogate();
  },
  subscribe: (listener) => {
    stateListeners.push(listener);
    listener(state);
  },
}