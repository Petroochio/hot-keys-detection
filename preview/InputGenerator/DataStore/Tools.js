let state = {
  toolMode: 'NONE',
  targetData: false,
  showVideo: true,
  renderGroupPreview: false,
};
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
  forceUpdate: () => {
    propogate();
  },
  subscribe: (listener) => {
    stateListeners.push(listener);
    listener(state);
  },
}