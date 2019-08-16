import h from 'snabbdom/h';

export function createSliderState(inputID) {
  return {
    name: `Input ${inputID}`,
    type: 'SLIDER',
    actorID: '', // unset
    detectWindow: 250,
    relativePosition: { distance: 0, angle: 0 }, // unset
    endPosition: { distance: 0, angle: 0 },
  }
}

export function Slider(inputID, groupID, inputState, toolState, setInputState, setToolState) {
  const { actorID } = inputState;

  const selectType = ({ target }) => {
    inputState.type = target.value;
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
  const setName = ({ target }) => {
    inputState.name = target.value;
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
  const relPos = inputState.relativePosition;
  const relativePosition = h(
    'li.parameter.input-group.param-actor-rp',
    { on: { click: setRelPos } },
    [
      h('span.param-type', 'relative position'),
      h('span.param-value', `d: ${relPos.distance} a: ${relPos.angle}`),
    ]
  );

  // Relative Position
  const setEndPos = (e) => {
    toolState.toolMode = 'ACTOR_END_POS';
    toolState.targetData = { group: groupID, input: inputID };
    setToolState(toolState);
  };
  const endPos = inputState.endPosition;
  const endPosition = h(
    'li.parameter.input-group.param-actor-rp',
    { on: { click: setEndPos } },
    [
      h('span.param-type', 'end position'),
      h('span.param-value', `d: ${endPos.distance} a: ${endPos.angle}`),
    ]
  );

  return h('ul.input-element', [inputTypeName, actor, detectWindow, relativePosition, endPosition]);
}
