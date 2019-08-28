import DrawTarget from './DrawTarget';
import { initMarkers } from '../InputGenerator/Markers';
import { pointInRect } from '../InputGenerator/Utils/CollisionDetection';
import { avgCorners } from '../InputGenerator/Utils/General';
import { checkPerspective, relativePosition } from '../InputGenerator/Editor/RelativePos';
import InputGroup from '../InputGenerator/Editor/InputGroup';
import {Panel1, Panel2, Panel3} from './CarPanels';

let prevTime = 0;
let zoom = 1000;
let frameParent;

let socket;
let markerData;
let dummyCanvas, dummyCtx;
let panel1, panel2, panel3;

let inputGroupData = [];
function initTableInput(inputArr) {
  inputGroupData = inputArr.groups.map((i) => (new InputGroup(markerData, i)));

  panel1 = new Panel1(0, 0, 0);
  panel2 = new Panel2(0, 0, 0);
  panel3 = new Panel3(0, 0, 0);

}

let moveItem;

function update() {
  const timenow = Date.now();
  const dt = timenow - prevTime;

  markerData.forEach(m => m.checkPresence(timenow));
  inputGroupData.forEach(i => i.update());

  // panel1.clearCanvas();
  // panel2.clearCanvas();
  // panel3.clearCanvas();
  let panel2bool = false;
  inputGroupData.forEach(i => {
    switch(i.name) {
      case 'Panel1A':
        panel1.update(i.inputs[2].val, i.inputs[0].val, i.inputs[1].val);
        panel1.display(0, i.anchor.present);
        break;
      case 'Panel2A':
        panel2.update(i.inputs[0].val, i.inputs[2].val, i.inputs[1].val);
        panel2.display(0, i.anchor.present);
        if (i.anchor.present) {
          panel2bool = true;
        }
        break;
      case 'Panel3A':
        panel3.update(i.inputs[0].val, i.inputs[1].val);
        panel3.display(0, i.anchor.present);
        break;
      case 'Panel2B':
        if (!panel2bool) {

        }
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


  const savedZoom = localStorage.getItem('zoom');
  console.log(savedZoom);
  zoom = savedZoom != null || parseInt(savedZoom) < 0 ? parseInt(savedZoom) : 1000;
  const adjustZoom = (change) => {
    zoom += change;
    frameParent.style.perspective = zoom + 'px';
    localStorage.setItem('zoom', zoom);
  };
  adjustZoom(0);

  const setMove = (target) => moveItem = target;
  const frame1 = new DrawTarget('#wireframe1', setMove, 'panel1');
  const frame2 = new DrawTarget('#wireframe2', setMove, 'panel2');
  const frame3 = new DrawTarget('#wireframe3', setMove, 'panel3');

  document.addEventListener('keypress', (e) => {
    switch (e.key) {
      case '-':
        adjustZoom(-5);
        break;
      case '=':
        adjustZoom(5);
        break;
      default: break;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (moveItem) {
      moveItem.position.x += e.movementX;
      moveItem.position.y += e.movementY;

      moveItem.updateStyle();
    }
  });
  document.addEventListener('mouseup', (e) => {
    moveItem = null;
  });
  // frameParent.addEventListener('mouseout', (e) => {
  //   moveItem = null;
  // });

  window.requestAnimationFrame(update.bind(this));

  socket = io.connect('localhost:5000');

  socket.on('connect', () => {
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
