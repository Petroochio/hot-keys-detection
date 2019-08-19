import * as snabbdom from 'snabbdom';
import h from 'snabbdom/h';
const patch = snabbdom.init([ // Init patch function with chosen modules
  require('snabbdom/modules/class').default, // makes it easy to toggle classes
  require('snabbdom/modules/props').default, // for setting properties on DOM elements
  require('snabbdom/modules/style').default, // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners').default, // attaches event listeners
]);

import { addStateListener, setToolState, setInputState } from '../DataStore';
import { InputGroup, createGroupState } from './InputGroup';

let root;
let lastDom;
let socket;

// maybe put the socket in the state, idk
function renderDom(state) {
  const { inputGroups, tools } = state;
  // const setToolState = (newTools) => setState({ inputGroups, tools: newTools });

  const setGroupState = (id, newGroup) => {
    inputGroups[id] = newGroup;
    setInputState(inputGroups); 
  };
  const groups = inputGroups
    .map((g, i) => InputGroup(i, g, tools, setGroupState, setToolState));

  const addGroup = () => {
    inputGroups.push(createGroupState(inputGroups.length));
    setInputState(inputGroups);
  };
  const addGroupButton = h('button.add-group', { on: { click: addGroup } }, 'add input group');

  const save = () => socket.emit('set inputs config', { config: JSON.stringify(state.inputGroups) });
  const saveButton = h('button.add-group', { on: { click: save } }, 'save input config');

  const load = () => socket.emit('get inputs config');
  const loadButton = h('button.add-group', { on: { click: load } }, 'load input config');

  const toggleVideo = () => {
    tools.showVideo = !tools.showVideo;
    setToolState(tools);
  };
  const toggleVideoButton = h('button.add-group', { on: { click: toggleVideo } }, 'toggle video');

  const toggleGroup = () => {
    tools.renderGroupPreview = !tools.renderGroupPreview;
    setToolState(tools);
  };
  const toggleGroupButton = h('button.add-group', { on: { click: toggleGroup } }, 'toggle group preview');

  const newDom = h('div.input-group-div', [...groups, addGroupButton, saveButton, loadButton, toggleVideoButton, toggleGroupButton]);
  patch(lastDom, newDom);
  lastDom = newDom; // must do this bc snabbdom
}

export default function init(sock) {
  root = document.querySelector('#ui');
  lastDom = h('div.input-group-div', []);
  patch(root, lastDom);
  addStateListener(renderDom);
  socket = sock;
  socket.on('send inputs config', ({ config }) => setInputState(JSON.parse(config)));
}
