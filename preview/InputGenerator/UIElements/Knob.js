import h from 'snabbdom/h';

export function createKnobState(inputID) {
  return {
    name: `Input ${inputID}`,
    type: 'KNOB',
    actorID: '', // unset
    detectWindow: 250,
    relativePosition: '', // unset
  }
}

export function Knob(inputID, groupID, inputState, toolState, setInputState, setToolState) {
  const { actorID } = inputState;

  const selectType = ({ value }) => {
    inputState.type = value;
    setInputState(inputID, inputState);
  };
  const typeSelect = h('span.param-value',
    h('select',
      { on: { change: selectType } },
      [
        h('option', { props: { value: 'NONE', disabled: true, } }, 'Select Input Type'),
        h('option', { props: { value: 'BUTTON' } }, 'Button'),
        h('option', { props: { value: 'TOGGLE' } }, 'Toggle'),
        h('option', { props: { value: 'KNOB' } }, 'Knob'),
        h('option', { props: { value: 'SLIDER' } }, 'Slider'),
      ]
  ));

  // Input type and name
  const setName = ({ value }) => {
    inputState.name = value;
    setInputState(inputID, inputState);
  };
  const nameField = h('span.param-value.input-name',
    h('input', { on: { change: setName }, props: { value: inputState.name } })
  );
  const inputTypeName = h('li.parameter.input.param-input-type', [typeSelect, nameField]);

  // Actor
  const selectActor = (e) => {
    toolState.toolMode = 'ACTOR_SELECT';
    toolState.targetData = { group: groupID, input: inputID };
    setToolState(toolState);
  };
  const actor = h(
    'li.parameter.input-group.param-actor',
    [
      h('span.param-type', 'actor ID'),
      h('span.param-value',
        h('input',
          {
            on: { click: selectActor },
            props: { type: 'number', step: 1, value: actorID >= 0 ? actorID : '' }
          }
        )
      ),
    ]
  );

  // Detect window
  const setDetectWindow = (e) => {
    inputState.detectWindow = e.target.value;
    setInputState(inputID, inputState);
  };
  const detectWindow = h(
    'li.parameter.input-group.param-anchor-dw',
    [
      h('span.param-type', 'anchor detection window'),
      h('span.param-value',
        h('input',
          {
            on: { change: setDetectWindow },
            props: { type: 'number', step: '1', value: inputState.detectWindow }
          }
        )
      ),
      h('span.param-unit', 'ms'),
    ]
  );

  // Relative Position
  const setRelPos = (e) => {
    toolState.toolMode = 'ACTOR_REL_POS';
    toolState.targetData = { group: groupID, input: inputID };
    setToolState(toolState);
  };
  const relativePosition = h(
    'li.parameter.input-group.param-actor-rp',
    [
      h('span.param-type', 'relative position'),
      h('span.param-value', { on: { click: setRelPos } }, inputState.relativePosition),
    ]
  );

  return h('ul', [inputTypeName, actor, detectWindow, relativePosition]);
}
