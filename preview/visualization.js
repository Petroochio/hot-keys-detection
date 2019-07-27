const app = {};

let c;
let ctx;
let markerData;
let inputs;
let markerUpdated = true;

const FPS = 50;

function init() {

  initMarkers();
  inputs = INPUT_CONFIG.map(inputConf => createInput(markerData, inputConf));

  c = document.getElementById('vis');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  ctx = c.getContext('2d');
  ctx.translate(0.5, 0.5);

  app.markerImage = document.querySelector('#marker-image');

  const socket = io('http://localhost:5000');
  app.socket = socket;

  socket.on('connect', () => {
    console.log('connected to server');
  });

  const cornerToVec = (c) => ({ x: c[0], y: c[1] });
  const mapCornersToUV = (corners) => {
    return corners.map(c => mapUVtoCellCoord(mapPointToUV(cornerToVec(c))));
  };

  const sumPoints = (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y });
  const avgCorners = (corners) => {
    const total = corners.reduce(sumPoints, { x: 0, y: 0 });

    return {
      x: total.x / corners.length,
      y: total.y / corners.length,
    };
  };

  socket.on('update markers', (data) => {
    const markers = data.markers;

    if (markers.length > 0) {
      const mappedMarkers = markers.map(m => {
        const mappedCorners = mapCornersToUV(m.corners);

        if (mappedCorners.findIndex(c => c === undefined) < 0) {
          return {
            id: m.id,
            corner: mappedCorners[0],
            center: avgCorners(mappedCorners),
          };
        }
      });

      // HERE IS WHERE THE ARRAY OF MARKERS IS CLEMENT
      // MappedMarkers
      // console.log(mappedMarkers);
      const timenow = Date.now();

      mappedMarkers.forEach(m => {
        if (m !== undefined) {
          markerData[m.id].update(m, timenow);
        }
      });
    }

  });

  initAnimation(FPS);
}

var timestamp = 0;
var ptimestamp = 0;
var timeInterval = 0;

function initAnimation(fps) {
  timeInterval = 1000 / fps;
  ptimestamp = Date.now();
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  timestamp = Date.now();
  var delta = timestamp - ptimestamp;
  if (delta > timeInterval) {
    ptimestamp = timestamp - (delta % timeInterval);
    updateVis();
  }
}

function updateVis() {

  inputs.forEach(input => input.update());

  ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.clearRect(-10, -10, window.innerWidth+10, window.innerHeight+10);
  let timenow = Date.now();

  markerData.forEach(m => m.checkPresence(timenow));
  markerData.forEach(m => m.display(90));

  inputs.forEach(input => input.display());

}

window.onload = () => init();
