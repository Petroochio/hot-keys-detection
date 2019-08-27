import DrawTarget from './DrawTarget';
import { initMarkers } from '../InputGenerator/Markers';
import { pointInRect } from '../InputGenerator/Utils/CollisionDetection';
import { avgCorners } from '../InputGenerator/Utils/General';
import { checkPerspective, relativePosition } from '../InputGenerator/Editor/RelativePos';
import InputGroup from '../InputGenerator/Editor/InputGroup';

let prevTime = 0;
let zoom = 1000;
let frameParent;

let socket;
let markerData;
let dummyCanvas, dummyCtx;

let inputGroupData = [];
function initTableInput(inputArr) {
  inputGroupData = inputArr.groups.map((i) => (new InputGroup(markerData, i)));
  console.log(inputGroupData);
}

function update() {
  const timenow = Date.now();
  const dt = timenow - prevTime;

  markerData.forEach(m => m.checkPresence(timenow));
  inputGroupData.forEach(i => i.update());

  inputGroupData.forEach(i => {
    switch(i.name) {
      case 'Panel1A':
        break;
      case 'Panel2A':
        break;
      case 'Panel3A':
        break;
      case 'Panel2B':
        break;
      default:
        break;
    }
  });

  prevTime = timenow;

  window.requestAnimationFrame(update.bind(this));
}

function init() {
  frameParent = document.querySelector('#frame-parent');

  dummyCanvas = document.querySelector('#dummy-canvas');
  dummyCtx = dummyCanvas.getContext('2d');
  dummyCtx.translate(0.5, 0.5);
  markerData = initMarkers(dummyCtx);

  const adjustZoom = (change) => {
    zoom += change;
    frameParent.style.perspective = zoom + 'px';
  };
  const frame1 = new DrawTarget('#wireframe1', adjustZoom);
  const frame2 = new DrawTarget('#wireframe2', adjustZoom);
  const frame3 = new DrawTarget('#wireframe3', adjustZoom);

  window.requestAnimationFrame(update.bind(this));

  socket = io.connect('localhost:5000');

  socket.on('connect', () => {
    console.log('connected to server');
    socket.emit('get inputs config')
  });

  socket.on('send inputs config', ({ config }) => initTableInput(JSON.parse(config)));

  socket.on('update markers', (data) => {
    const markers = data.markers;

    if (markers.length > 0) {
      const mappedMarkers = markers.map(m => {
        // include naive conversion here in library
        const mappedCorners = m.corners
          .map(c => ({ x: c[0] / 1280, y: c[1] / 720 }));

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
}

window.onload = () => init();
