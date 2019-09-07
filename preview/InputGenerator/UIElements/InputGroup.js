import h from 'snabbdom/h';
import { createGenericState, GenericInput } from './GenericInput';
import { Button } from './Button';
import { Toggle } from './Toggle';
import { Knob } from './Knob';
import { Slider } from './Slider';
import ToolStore from '../DataStore/Tools';
import InputGroupStore from '../DataStore/InputGroups'

export function createGroupState(groupID) {
  return {
    name: `input_group_${groupID}`,
    anchorID: '',
    detectWindow: 250,
    inputs: [],
    markerSize: 20,
  }
}

// State should be the individual group state
export function InputGroup(groupID, groupState, toolState, setGroupState) {
  // Name
  const setName = (e) => {
    InputGroupStore.storeState();
    groupState.name = e.target.value;
    InputGroupStore.forceUpdate();
  };
  const name = h(
    'li.parameter.input-group.param-name.input-group-name',
    [
      h('span.param-type', 'Input Group'),
      h('span.param-value',
        h('input',
          {
            on: { change: setName },
            props: { type: 'text', value: groupState.name }
          }
        )
      ),
    ]
  );

  const setMarkerSize = (e) => {
    InputGroupStore.storeState();
    groupState.markerSize = e.target.value;
    InputGroupStore.forceUpdate();
  };
  const markerSize = h(
    'li.parameter.input-group.marker-size',
    [
      h('span.bullet', ''),
      h('span.param-type', 'marker size'),
      h('input.param-value', { on: { change: setMarkerSize }, props: { value: groupState.markerSize } }),
      h('span.unit', 'mm'),
    ]
  );

  // Anchor
  const selectAnchor = (e) => {
    ToolStore.setProp('toolMode', 'ANCHOR_SELECT');
    ToolStore.setProp('targetData', groupID);
  };
  const anchor = h(
    'li.parameter.input-group.param-anchor',
    [
      h('span.bullet', ''),
      h('span.param-type', 'anchor ID'),
      h('span.param-value',
        h('input',
          {
            on: { click: selectAnchor },
            props: { type: 'number', step: 1, value: groupState.anchorID }
          }
        )
      ),
    ]
  );

  // Detect window
  const setDetectWindow = (e) => {
    InputGroupStore.storeState();
    groupState.detectWindow = e.target.value;
    InputGroupStore.forceUpdate();
  };
  const detectWindow = h(
    'li.parameter.input-group.param-anchor-dw',
    [
      h('span.bullet', ''),
      h('span.param-type', 'anchor detection window'),
      h('span.param-value',
        h('input',
          {
            on: { change: setDetectWindow },
            props: { type: 'number', step: '1', value: groupState.detectWindow }
          }
        )
      ),
      h('span.param-unit', 'ms'),
    ]
  );

  const removeInput = (inputID) => {
    InputGroupStore.storeState();
    groupState.inputs.splice(inputID, 1);
    InputGroupStore.forceUpdate();
  }

  // Inputs
  const setInputState = (id, newState) => {
    InputGroupStore.storeState();
    groupState.inputs[id] = newState;
    InputGroupStore.forceUpdate();
  };
  const inputs = groupState.inputs
    .map((a, i) => {
      switch (a.type) {
        case 'BUTTON':
          return Button(i, groupID, a, toolState, setInputState, removeInput);
        case 'TOGGLE':
          return Toggle(i, groupID, a, toolState, setInputState, removeInput);
        case 'KNOB':
          return Knob(i, groupID, a, toolState, setInputState, removeInput);
        case 'SLIDER':
          return Slider(i, groupID, a, toolState, setInputState, removeInput);
        default:
          return GenericInput(i, groupID, a, toolState, setInputState, removeInput);
      }
    });

  const addInput = () => {
    InputGroupStore.storeState();
    groupState.inputs.push(createGenericState(groupState.inputs.length));
    InputGroupStore.forceUpdate();
  }
  const bulletElement = h('span.bullet', '');
  const addInputButton = h('button.add-input', { on: { click: addInput } }, 'add input');
  const removeGroupButton = h('button.remove-group', { on: { click: () => InputGroupStore.removeGroup(groupID) } }, 'remove group');
  const actorParent = h('li.parameter.input-object', [...inputs, bulletElement, addInputButton, removeGroupButton]);

  // Whole assembly
  return h('ul.input-group-list', [name, anchor, markerSize, detectWindow, actorParent]);
}
