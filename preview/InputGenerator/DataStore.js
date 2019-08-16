let state = {
  // Tool Modes: ANCHOR_SELECT, ACTOR_SELECT, RELATIVE_CENTER
  tools: {
    toolMode: 'NONE',
    targetData: false,
  },
  inputGroups: [],
};
const stateListeners = [];

function propogate() {
  stateListeners.forEach(l => l(state));
}

export function setState(newState) {
  state = newState;
  propogate();
}

export function setInputState(newState) {
  state.inputGroups = newState;
  propogate();
}

export function addStateListener(f) {
  stateListeners.push(f);
  f(state); // push state to new listener
}