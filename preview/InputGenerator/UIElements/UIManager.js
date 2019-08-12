import * as snabbdom from 'snabbdom';
import h from 'snabbdom/h';
const patch = snabbdom.init([ // Init patch function with chosen modules
  require('snabbdom/modules/class').default, // makes it easy to toggle classes
  require('snabbdom/modules/props').default, // for setting properties on DOM elements
  require('snabbdom/modules/style').default, // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners').default, // attaches event listeners
]);

import { addStateListener, setState } from '../DataStore';
import { InputGroup, createGroupState } from './InputGroup';

let root;
let lastDom;

function renderDom(state) {
  const { inputGroups, tools } = state;
  const setToolState = (newTools) => setState({ inputGroups, tools: newTools });

  const setGroupState = (id, newGroup) => {
    inputGroups[id] = newGroup;
    setState({ inputGroups, tools }); 
  };

  const groups = inputGroups
    .map((g, i) => InputGroup(i, g, tools, setGroupState, setToolState));

  const addGroup = () => {
    inputGroups.push(createGroupState(inputGroups.length));
    setState({ inputGroups, tools });
  };
  const addGroupButton = h('button.add-group', { on: { click: addGroup } }, 'add input');
  const newDom = h('div.input-group-div', [...groups, addGroupButton]);
  patch(lastDom, newDom);
  lastDom = newDom; // must do this bc snabbdom
}

export default function init() {
  root = document.querySelector('#ui');
  lastDom = h('div.input-group-div', []);
  patch(root, lastDom);
  addStateListener(renderDom);
}
