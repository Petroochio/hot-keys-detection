import { initMarkers } from '../Markers';
import { pointInRect } from '../Utils/CollisionDetection';
import { avgCorners } from '../Utils/General';
import InputGroupStore from '../DataStore/InputGroups';
import ToolStore from '../DataStore/Tools';
import UIStore from '../DataStore/UI';
import { checkPerspective, relativePosition } from './RelativePos';
import InputGroup from './InputGroup';

let canvas, ctx, socket, frame;
let frameW, frameH;
let markerData;
let inputGroupState, toolState, uiState;

let inputGroupData = [];
function initInputGroup() {
  inputGroupData = inputGroupState.map((i) => (new InputGroup(markerData, i)));
  inputGroupData.forEach((i) => i.calBoundingBox(30));
}

function resize() {
  frameW = window.innerWidth - 365;
  frame.width = frameW;
}

function stateListener() {
  initInputGroup(inputGroupState);

  // Set markers to be properly inuse
  markerData.forEach((m) => {
    m.inuse = false;

    inputGroupState.forEach((group, gID) => {
      const { anchorID, inputs } = group;
      // first check anchor
      if (anchorID === m.id) {
        m.type = 'ANCHOR';
        m.groupID = gID;
        m.actorID = -1; // Unset
        m.inuse = true;
        m.timeout = group.detectWindow;
      }
      else {
        // then check inputs
        inputs.forEach((input, iID) => {
          if (m.id === input.actorID) {
            m.type = 'ACTOR';
            m.groupID = gID;
            m.inputID = iID;
            m.inuse = true;
            m.timeout = input.detectWindow;
          }
        });
      }
    });
  });
}

let relativePositionCounter = 0;
let relativePositionArr = [];
export function update(timenow) {
  ctx.clearRect(-10, -10, canvas.width + 10, canvas.height + 10);
  ctx.fillStyle = '#000000';
  // fill black when no video
  if (!toolState.showVideo) ctx.fillRect(-10, -10, canvas.width + 10, canvas.height + 10);
  // Update
  markerData.forEach(m => m.checkPresence(timenow));
  inputGroupData.forEach(i => i.update());

  const { group, input } = toolState.targetData;
  let anchor, actor;

  switch (toolState.toolMode) {
    case 'ACTOR_REL_POS':
      anchor = markerData[inputGroupState[group].anchorID];
      actor = markerData[inputGroupState[group].inputs[input].actorID];

      if (anchor.present && actor.present) {
        if (checkPerspective(anchor, actor, 0.01, 0.0002)) {
          
          relativePositionArr.push(relativePosition(anchor, actor, inputGroupState[group].markerSize));
          relativePositionCounter++;

          if (relativePositionCounter > 30) {
            let d = 0, a = 0;
            relativePositionArr.forEach(p => {
              d = d + p.distance;
              a = a + p.angle;
            });
            
            d = d / relativePositionArr.length;
            a = a / relativePositionArr.length;
            
            const relPos = {distance: d, angle: a};
            
            inputGroupState[group].inputs[input].relativePosition = relPos;
            InputGroupStore.forceUpdate();

            ToolStore.setProp('toolMode', 'NONE');
            relativePositionCounter = 0;
            relativePositionArr = [];
          }
        }
      }
      break;
    case 'ACTOR_END_POS':
      anchor = markerData[inputGroupState[group].anchorID];
      actor = markerData[inputGroupState[group].inputs[input].actorID];

      if (anchor.present && actor.present) {
        if (checkPerspective(anchor, actor, 0.01, 0.0002)) {
          
          relativePositionArr.push(relativePosition(anchor, actor, inputGroupState[group].markerSize));
          relativePositionCounter++;

          if (relativePositionCounter > 30) {
            let d = 0, a = 0;
            relativePositionArr.forEach(p => {
              d = d + p.distance;
              a = a + p.angle;
            });
            
            d = d / relativePositionArr.length;
            a = a / relativePositionArr.length;
            
            const endPos = {distance: d, angle: a};
            
            inputGroupState[group].inputs[input].endPosition = endPos;
            InputGroupStore.forceUpdate();

            ToolStore.setProp('toolMode', 'NONE');
            relativePositionCounter = 0;
            relativePositionArr = [];
          }
        }
      }
      break;
    default: break;
  }

  // Display
  if (!toolState.renderGroupPreview) markerData.forEach(m => m.display());
  else {
    // do input preview
    inputGroupData.forEach(i => i.display(ctx, 20)); // replace second argument with marker size
  }

  // idk if there will be scope issues, but I'm avoiding them anyway
  // window.requestAnimationFrame(update.bind(this));
}

export function getSocket() {
  return socket;
}

export function init() {
  canvas = document.querySelector('canvas');
  frame = document.querySelector('#frame');
  ctx = canvas.getContext('2d');
  ctx.translate(0.5, 0.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  markerData = initMarkers(ctx);

  canvas.addEventListener('mousemove', (e) => {
    const mousePt = { x: e.offsetX, y: e.offsetY };
    markerData.forEach(m => {
      if (m.present) m.shouldFill = pointInRect(mousePt, m.allCorners);
    });
  });

  canvas.addEventListener('click', (e) => {
    const mousePt = { x: e.offsetX, y: e.offsetY };
    const hitMarker = (m) => (m.present && !m.inuse && pointInRect(mousePt, m.allCorners));

    switch (toolState.toolMode) {
      case 'ANCHOR_SELECT':
        markerData.forEach(m => {
          if (hitMarker(m)) {
            ToolStore.setProp('toolMode', 'NONE');
            inputGroupState[toolState.targetData].anchorID = m.id;
            InputGroupStore.forceUpdate();
          }
        });
        break;
      case 'ACTOR_SELECT':
        const { group, input } = toolState.targetData;

        markerData.forEach(m => {
          if (hitMarker(m)) {
            ToolStore.setProp('toolMode', 'NONE');
            inputGroupState[group].inputs[input].actorID = m.id;
            InputGroupStore.forceUpdate();
          }
        });
        break;
      default: break;
    }
  });

  socket = io.connect('localhost:5000');
  socket.on('update image', (data) => {
    if (!toolState.showVideo) return; // bail when video no show

    frame.src = 'data:image/png;base64,' + data.image;

    if (frame.height !== canvas.height || frame.width !== canvas.width) {
      canvas.width = frame.width;
      canvas.height = frame.height;
    }
  });

  socket.on('update markers', (data) => {
    const markers = data.markers;

    if (markers.length > 0) {
      const mappedMarkers = markers.map(m => {
        // include naive conversion here in library
        const mappedCorners = m.corners
          .map(c => ({ x: c[0] / 1280 * canvas.width, y: c[1] / 720 * canvas.height }));

        return {
          id: m.id,
          corner: mappedCorners[0],
          center: avgCorners(mappedCorners),
          allCorners: mappedCorners,
        };
      });

      // MappedMarkers
      const timenow = Date.now();

      mappedMarkers.forEach(m => {
        if (m !== undefined) {
          markerData[m.id].update(m, timenow);
        }
      });
    }
  });

  toolState = ToolStore.getState();
  inputGroupState = InputGroupStore.getState();
  uiState = UIStore.getState();
  InputGroupStore.subscribe(stateListener);
  resize();
}

window.onresize = resize;
