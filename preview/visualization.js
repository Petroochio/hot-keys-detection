const app = {};

var c;
var ctx;
var markerData = [];
var markerUpdated = true;

const SCREEN = {
  rx: 108, // mm (real world dimensions)
  ry: 80, // mm (real world dimensions)
  rw: 930, // mm (real world dimensions)
  rh: 569, // mm (real world dimensions)
  w: window.innerWidth, // px (screen resolution)
  h: window.innerHeight, // px (screen resolution)
};

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
    markerUpdated = false;
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
      markerData = mappedMarkers;
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
  if (!markerUpdated) {
    ctx.clearRect(-10, -10, window.innerWidth+10, window.innerHeight+10);
    if (markerData.length > 0) {
      for (var i=0; i<markerData.length; i++) {
        if (markerData[i] !== undefined) { // CHECK THIS BUG PETER
          drawMarkerRect(markerData[i].center, markerData[i].corner, 90, markerData[i].id);
        }
      }
    }
    markerUpdated = true;
  }
}

function mapToScreen(pt) {
  if (pt.x >= SCREEN.rx && pt.x <= SCREEN.rx + SCREEN.rw && pt.y >= SCREEN.ry && pt.y <= SCREEN.ry + SCREEN.rh) {
    var px = pt.x - SCREEN.rx;
    var py = pt.y - SCREEN.ry;
    px = (px / SCREEN.rw) * SCREEN.w;
    py = (py / SCREEN.rh) * SCREEN.h;
    return {x:px, y:py};
  }
}

function drawMarkerRect(cen, cor, size, id) {
  var posCen = mapToScreen(cen);
  var posCor = mapToScreen(cor);
  var vecCenCor0 = vecUnit(vecSub(posCen, posCor));
  var vecCenCor1 = vecRot90(vecCenCor0);
  var vecCenCor2 = vecRot90(vecCenCor1);
  var vecCenCor3 = vecRot90(vecCenCor2);
  var cor0 = vecAdd(posCen, vecScale(vecCenCor0, size/2));
  var cor1 = vecAdd(posCen, vecScale(vecCenCor1, size/2));
  var cor2 = vecAdd(posCen, vecScale(vecCenCor2, size/2));
  var cor3 = vecAdd(posCen, vecScale(vecCenCor3, size/2));
  
  ctx.beginPath();
  ctx.moveTo(Math.round(cor0.x), Math.round(cor0.y));
  ctx.lineTo(Math.round(cor1.x), Math.round(cor1.y));
  ctx.lineTo(Math.round(cor2.x), Math.round(cor2.y));
  ctx.lineTo(Math.round(cor3.x), Math.round(cor3.y));
  ctx.lineTo(Math.round(cor0.x), Math.round(cor0.y));
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cor0.x, cor0.y, 2.5, 2.5, 0, 0, Math.PI*2, false);
  ctx.fill();

  var textPos = vecAdd(posCen, vecScale(vecCenCor0, size/2*1.5));
  ctx.fillText(id, textPos.x, textPos.y);
}

window.onload = init;












// Lol we made a vector library
function vecAdd(vec1, vec2) {
  return {x:vec1.x + vec2.x, y:vec1.y + vec2.y};
}

// vector vec1 ---> vec2
function vecSub(vec1, vec2) {
  return {x:-vec1.x + vec2.x, y:-vec1.y + vec2.y};
}

function vecScale(vec, scale) {
  return {x:vec.x*scale, y:vec.y*scale};
}

function vecDot(vec1, vec2) {
  return vec1.x*vec2.x + vec1.y*vec2.y;
}

function vecMag(vec) {
  return Math.pow(Math.pow(vec.x, 2) + Math.pow(vec.y, 2), 0.5);
}

function vecMag2(vec) {
  return Math.pow(vec.x, 2) + Math.pow(vec.y, 2);
}

function vecUnit(vec) {
  var m = vecMag(vec);
  return {
    x: vec.x/m,
    y: vec.y/m,
  };
}

function vecRot90(vec) {
  return {x:vec.y, y:-vec.x}
}
