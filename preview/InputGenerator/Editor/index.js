import { initMarkers } from '../Markers';
import { pointInRect, avgCorners } from '../Utils';
import { updateState, addStateListener } from '../DataStore';

let canvas, ctx, socket, frame;
let frameW, frameH;
let markerData;
let state;

function resize() {
  const ui = document.querySelector('.input-group-div');
  frameW = window.innerWidth - 365;
  
  frame.width = frameW;
}

function stateListener(newState) {
  state = newState;
}

function update() {
  const { inputGroups, tools } = state;
  let timenow = Date.now();

  ctx.clearRect(-10, -10, canvas.width + 10, canvas.height + 10);
  // Update
  markerData.forEach(m => m.checkPresence(timenow));

  switch (tools.toolMode) {
    case 'ACTOR_REL_POS':
      const { group, input } = tools.targetData;
      const anchor = markerData[inputGroups[group].anchorID];
      const actor = markerData[inputGroups[group].actors[input].actorID];

      if (anchor.present && actor.present) {
        if (checkPerspective(anchor, actor, 0.01, 0.0002)) {
          const relPos = relativePosition(anchor, actor, 19);
          tools.toolMode = 'NONE';
          inputGroups[group].actors[input].relativePosition = relPos;
          setState(state);
        }
      }
      break;
    default: break;
  }

  // Display
  markerData.forEach(m => m.display());

  // idk if there will be scope issues, but I'm avoiding them anyway
  window.requestAnimationFrame(update.bind(this));
}

export default function initEditor() {
  canvas = document.querySelector('canvas');
  frame = document.querySelector('#frame');
  ctx = canvas.getContext('2d');
  markerData = initMarkers(ctx);

  canvas.addEventListener('mousemove', (e) => {
    const mousePt = { x: e.offsetX, y: e.offsetY };
    markerData.forEach(m => {
      if (m.present) m.shouldFill = pointInRect(mousePt, m.allCorners);
    });
  });

  canvas.addEventListener('click', (e) => {
    const { tools, inputGroups } = state;
    const mousePt = { x: e.offsetX, y: e.offsetY };
    const hitMarker = (m) => (m.present && !m.inuse && pointInRect(mousePt, m.allCorners));

    switch (tools.toolMode) {
      case 'ANCHOR_SELECT':
        markerData.forEach(m => {
          if (hitMarker(m)) {
            m.inuse = true;
            tools.toolMode = 'NONE';
            inputGroups[tools.targetData].anchorID = m.id;
            setState(state);
          }
        });
        break;
      default: break;
    }
  });

  socket = io.connect('localhost:5000');
  socket.on('update image', (data) => {
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

      // HERE IS WHERE THE ARRAY OF MARKERS IS CLEMENT
      // MappedMarkers
      const timenow = Date.now();

      mappedMarkers.forEach(m => {
        if (m !== undefined) {
          markerData[m.id].update(m, timenow);
        }
      });
    }
  });

  addStateListener(stateListener);
  resize();

  window.requestAnimationFrame(update.bind(this));
}

window.onresize = resize;
