import h from 'snabbdom/h';
import { createGenericState, GenericInput } from './GenericInput';
import { Button } from './Button';
import { Toggle } from './Toggle';
import { Knob } from './Knob';
import { Slider } from './Slider';

export function createGroupState(groupID) {
  return {
    name: `input_group_${groupID}`,
    anchorID: 0,
    detectWindow: 250,
    actors: [],
  }
}

// State should be the individual group state
export function InputGroup(groupID, groupState, toolState, setGroupState, setToolState) {
  // Name
  const setName = (e) => {
    groupState.name = e.target.value;
    setGroupState(groupID, groupState);
  };
  const name = h(
    'li.parameter.input-group.param-name.input-group-name',
    [
      h('span.param-type', 'anchor ID'),
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

  // Anchor
  const selectAnchor = (e) => {
    toolState.toolMode = 'ANCHOR_SELECT';
    toolState.targetData = groupID;
    setToolState(toolState);
  };
  const anchor = h(
    'li.parameter.input-group.param-anchor',
    [
      h('span.param-type', 'Input Group'),
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
    groupState.detectWindow = e.target.value;
    setGroupState(groupID, groupState);
  };
  const detectWindow = h(
    'li.parameter.input-group.param-anchor-dw',
    [
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

  // Actors
  const setInputState = (id, newState) => {
    groupState.actors[id] = newState;
    setGroupState(groupID, groupState);
  };
  const actors = groupState.actors
    .map((a, i) => {
      switch (a.type) {
        case 'BUTTON':
          return Button(i, groupID, a, toolState, setInputState, setToolState);
        case 'TOGGLE':
          return Toggle(i, groupID, a, toolState, setInputState, setToolState);
        case 'KNOB':
          return Knob(i, groupID, a, toolState, setInputState, setToolState);
        case 'SLIDER':
          return Slider(i, groupID, a, toolState, setInputState, setToolState);
        default:
          return GenericInput(i, groupID, a, toolState, setInputState, setToolState);
      }
    });

  const addInput = () => {
    groupState.actors.push(createGenericState(groupState.actors.length));
    setGroupState(groupID, groupState);
  }
  const addInputButton = h('button.add-input', { on: { click: addInput } }, 'add input');
  const actorParent = h('li.parameter.input-object', [...actors, addInputButton]);

  // Whole assembly
  return h('ul.input-group-list', [name, anchor, detectWindow, actorParent]);
}
