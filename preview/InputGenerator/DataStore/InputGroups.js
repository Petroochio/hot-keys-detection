// Defaul input groups state is empty array
let state = [];
const stateListeners = [];

function propogate() {
  stateListeners.forEach(l => l(state));
}

export default {
  getState: () => state,
  setProp: (prop, value) => {
    state[prop] = value;
    propogate();
  },
  pushGroup: (newGroup) => {
    state.push(newGroup);
    propogate();
  },
  removeGroup: (id) => {
    state.splice(id, 1);
    propogate();
  },
  forceUpdate: () => {
    propogate();
  },
  loadConfig: (config) => {
    state.splice(0, state.length);
    config.forEach(ig => state.push(ig));
    propogate();
  },
  subscribe: (listener) => {
    stateListeners.push(listener);
    listener(state);
  },
}