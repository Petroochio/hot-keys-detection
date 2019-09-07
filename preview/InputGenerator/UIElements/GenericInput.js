import h from 'snabbdom/h';

import { createButtonState } from './Button';
import { createToggleState } from './Toggle';
import { createKnobState } from './Knob';
import { createSliderState } from './Slider';

// Undo is annoying bc our data is not immutable and this is hacky
import InputGroupStore from '../DataStore/InputGroups'

export function createGenericState(inputID) {
  return {
    name: `Input ${inputID}`,
    type: 'NONE',
  }
}

export function GenericInput(inputID, groupID, inputState, toolState, setInputState, removeInput) {
  const selectType = ({ target }) => {
    let newState;
    switch (target.value) {
      case 'BUTTON':
        newState = createButtonState(inputID);
        newState.name = inputState.name;
        setInputState(inputID, newState);
        break;
      case 'TOGGLE':
        newState = createToggleState(inputID);
        newState.name = inputState.name;
        setInputState(inputID, newState);
        break;
      case 'KNOB':
        newState = createKnobState(inputID);
        newState.name = inputState.name;
        setInputState(inputID, newState);
        break;
      case 'SLIDER':
        newState = createSliderState(inputID);
        newState.name = inputState.name;
        setInputState(inputID, newState);
        break;
    }
  };
  const typeSelect = h('span.param-value',
    h('select',
      { on: { change: selectType } },
      [
        h('option', { props: { value: 'NONE', selected: true, } }, 'Select Input Type'),
        h('option', { props: { value: 'BUTTON' } }, 'Button'),
        h('option', { props: { value: 'TOGGLE' } }, 'Toggle'),
        h('option', { props: { value: 'KNOB' } }, 'Knob'),
        h('option', { props: { value: 'SLIDER' } }, 'Slider'),
      ]
  ));

  const setName = ({ target }) => {
    InputGroupStore.storeState();
    inputState.name = target.value;
    InputGroupStore.forceUpdate();
  };
  const nameField = h('span.param-value.input-name',
    h('input', { on: { change: setName }, props: { value: inputState.name } })
  );
  const inputTypeName = h('li.parameter.input.param-input-type', [typeSelect, nameField]);

  const bulletElement = h('span.bullet', '');
  const removeInputButton = h('button.remove-input', { on: { click: () => removeInput(inputID) } }, 'remove input');

  return h('ul.input-element', [inputTypeName, bulletElement, removeInputButton]);
}
