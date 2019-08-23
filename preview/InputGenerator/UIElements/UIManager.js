import * as snabbdom from 'snabbdom';
import h from 'snabbdom/h';
const patch = snabbdom.init([ // Init patch function with chosen modules
  require('snabbdom/modules/class').default, // makes it easy to toggle classes
  require('snabbdom/modules/props').default, // for setting properties on DOM elements
  require('snabbdom/modules/style').default, // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners').default, // attaches event listeners
]);

import InputGroupStore from '../DataStore/InputGroups';
import ToolStore from '../DataStore/Tools';
import UIStore from '../DataStore/UI';
import { InputGroup, createGroupState } from './InputGroup';

let root;
let lastDom;
let socket;
let inputGroupState, toolState, uiState;

let saveHeld = false;
let saveCount = 0;
const SAVE_COUNT_MAX = 3000;

export function update(dt) {
  if (saveHeld) {
    UIStore.setProp('saveCount', uiState.saveCount + dt);
  }
}

// maybe put the socket in the state, idk
function renderDom() {
  const setGroupState = InputGroupStore.setProp;
  const groups = inputGroupState
    .map((g, i) => InputGroup(i, g, toolState, setGroupState));

  const addGroup = () => {
    InputGroupStore.pushGroup(createGroupState(inputGroupState.length));
  };
  const addGroupButton = h('button.add-group', { on: { click: addGroup } }, 'add input group');

  const saveStart = () => {
    // UIStore.setProp('saveHeld', true);
    saveHeld = true;
  };
  const saveEnd = () => {
    if (saveCount >= SAVE_COUNT_MAX) {
      socket.emit('set inputs config', { config: JSON.stringify(inputGroupState) });
    }
    UIStore.setProp('saveHeld', false);
    UIStore.setProp('saveCount', 0);
  }
  const noSave = () => {
    UIStore.setProp('saveHeld', false);
    UIStore.setProp('saveCount', 0);
  }

  const fillWidth = saveCount >= SAVE_COUNT_MAX ? 100 : saveCount / SAVE_COUNT_MAX * 100;
  const saveButton = h(
    'button.add-group',
    { on: { mouseup: saveEnd, mousedown: saveStart, mouseout: noSave } },
    ['save input config', h('div.save-fill', { style: { width: `${fillWidth}%` } })]
  );

  const load = () => socket.emit('get inputs config');
  const loadButton = h('button.add-group', { on: { click: load } }, 'load input config');

  const toggleVideo = () => {
    ToolStore.setProp('showVideo', !toolState.showVideo);
  };
  const toggleVideoButton = h('span.add-group',
    [
      'toggle video',
      h('input',  { props: { type: 'checkbox', checked: toolState.showVideo }, on: { change: toggleVideo } })
    ]);

  const toggleGroup = (e) => {
    ToolStore.setProp('renderGroupPreview', !toolState.renderGroupPreview);
  };
  const toggleGroupButton = h('span.add-group',
    [
      'toggle group preview',
      h('input',  { props: { type: 'checkbox', checked: toolState.renderGroupPreview }, on: { change: toggleGroup } })
    ]);
  
  const actionBar = h('div#action-bar', [addGroupButton, saveButton, loadButton, toggleVideoButton, toggleGroupButton]);

  const newDom = h('div.input-group-div', [actionBar, ...groups]);
  patch(lastDom, newDom);
  lastDom = newDom; // must do this bc snabbdom
}

export function init(sock) {
  root = document.querySelector('#ui');
  lastDom = h('div.input-group-div', []);
  patch(root, lastDom);
  uiState = UIStore.getState();
  toolState = ToolStore.getState();
  inputGroupState = InputGroupStore.getState();

  ToolStore.subscribe(renderDom)
  InputGroupStore.subscribe(renderDom);
  UIStore.subscribe(renderDom);
  socket = sock;
  socket.on('send inputs config', ({ config }) => InputGroupStore.loadConfig(JSON.parse(config)));
}
