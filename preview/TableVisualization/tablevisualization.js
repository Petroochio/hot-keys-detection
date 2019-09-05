const app = {};

let c;
let ctx;
let markerData;
let inputs;
let markerUpdated = true;

const FPS = 50;

function init() {

  c = document.getElementById('vis');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  ctx = c.getContext('2d');
  ctx.translate(0.5, 0.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  app.markerImage = document.querySelector('#marker-image');

  const socket = io('http://localhost:5000');
  app.socket = socket;
  initMarkers();

  socket.on('connect', () => {
    console.log('connected to server');
    socket.emit('get inputs config')
  });

  socket.on('send inputs config', ({ config }) => initTableInput(JSON.parse(config)));

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
            allCorners: mappedCorners,
          };
        }
      });

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
  timestamp = Date.now();
  var delta = timestamp - ptimestamp;
  if (delta > timeInterval) {
    ptimestamp = timestamp - (delta % timeInterval);
    updateVis();
  }

  requestAnimationFrame(animate);
}

function updateVis() {

  let timenow = Date.now();
  markerData.forEach(m => m.checkPresence(timenow));

  ctx.clearRect(-10, -10, window.innerWidth+10, window.innerHeight+10);
  // markerData.forEach(m => m.display(90));

  // relPos2Marker(0, 1);

  inputGroupData.forEach((i) => i.calBoundingBox(30));

  inputGroupData.forEach(i => i.update());
  inputGroupData.forEach(i => i.display());
}

window.onload = () => init();

function relPos2Marker(i, j) {
  if (markerData[i].present && markerData[j].present) {
    if (checkPerspective(markerData[i], markerData[j], 0.01, 0.0002)) {
      const relPos = relativePosition(markerData[i], markerData[j], 19);
    }
  }
}


function checkPerspective(anchor, actor, edgeThres, perimeterThres) {
  // array of edge lengths
  const edgelen1 = anchor.allCorners.map((v, i, arr) => vecMag(vecSub(v, arr[(i + 1) % arr.length])));
  const edgelen2 = actor.allCorners.map((v, i, arr) => vecMag(vecSub(v, arr[(i + 1) % arr.length])));
  // perimeters
  const peri1 = edgelen1.reduce((acc, v) => (acc + v));
  const peri2 = edgelen2.reduce((acc, v) => (acc + v));
  // finding variance between both perimeters
  const periavg = (peri1 + peri2)/2;
  const perivar = (Math.pow(peri1 - periavg, 2) + Math.pow(peri1 - periavg, 2))/2;
  // finding variance for each array of edge lengths
  const edgevarsum1 = edgelen1.reduce((acc, v) => {
    const vari = Math.pow(v - (peri1 / 4), 2);
    return acc + vari;
  });
  const edgevarsum2 = edgelen2.reduce((acc, v) => {
    const vari = Math.pow(v - (peri2 / 4), 2);
    return acc + vari;
  });
  const edgevar1 = edgevarsum1 / 4;
  const edgevar2 = edgevarsum2 / 4;
  // percentage differences
  const peridiff = perivar / Math.pow(periavg, 2);
  const edgediff1 = edgevar1 / Math.pow(peri1/4, 2);
  const edgediff2 = edgevar2 / Math.pow(peri2/4, 2);
  
  const check = peridiff < perimeterThres && edgediff1 < edgeThres && edgediff2 < edgeThres ? true : false;
  // console.log(check, peridiff, edgediff1, edgediff2);
  return check;
}

function relativePosition(anchor, actor, markerSize) {
  // array of edge lengths
  const edgelen1 = anchor.allCorners.map((v, i, arr) => vecMag(vecSub(v, arr[(i + 1) % arr.length])));
  const edgelen2 = actor.allCorners.map((v, i, arr) => vecMag(vecSub(v, arr[(i + 1) % arr.length])));
  // perimeters
  const peri1 = edgelen1.reduce((acc, v) => (acc + v));
  const peri2 = edgelen2.reduce((acc, v) => (acc + v));

  const mmperpx = (markerSize*4) / ((peri1+peri2)/2);

  const pxdist = vecMag(vecSub(anchor.center, actor.center));
  const realdist = pxdist * mmperpx;
  const angle = vecAngleBetween(vecSub(anchor.center, anchor.corner), vecSub(anchor.center, actor.center));
  return {
    distance: realdist,
    angle: angle,
  };
}
