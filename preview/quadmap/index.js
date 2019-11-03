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

function vecRot(vec, angle) {
    var x = vec.x * Math.cos(angle) - vec.y * Math.sin(angle);
    var y = vec.x * Math.sin(angle) + vec.y * Math.cos(angle);
    return {x:x, y:y};
}

function vecAngleBetween(vec1, vec2) {
  return Math.atan2(vec1.y, vec1.x) - Math.atan2(vec2.y, vec2.x);
}

function vecEMA(vec1, vec2, weight) {
  return {
    x: (vec1.x*(1-weight) + vec2.x*weight), 
    y: (vec1.y*(1-weight) + vec2.y*weight) 
  };
}

// edge length from right angle triangle
function lenFromRATri(hyp, len) {
  return Math.pow(Math.pow(hyp, 2) - Math.pow(len, 2), 0.5);
}

// Line closest point
function lineCP(sP, eP, pt) {
  var sToPt = vecSub(sP, pt);
  var sToE = vecSub(sP, eP);
  var magSE = vecMag2(sToE);
  var t = vecDot(sToPt, sToE) / magSE;
  return {x: sP.x + sToE.x*t, y: sP.y + sToE.y*t};
}

// memoize this
function areaTriangle(p0, p1, p2) {
  return Math.abs(p0.x*(p1.y - p2.y) + p1.x*(p2.y - p0.y) + p2.x*(p0.y - p1.y))/2
}
// End Vector lib

function ptInQuad(pt, quadArr) {
  var quadArea = areaTriangle(quadArr[0], quadArr[1], quadArr[2]) + areaTriangle(quadArr[0], quadArr[2], quadArr[3]);
  var ptArea = 0;
  for (var i=0; i<quadArr.length; i++) {
      ptArea = ptArea + areaTriangle(pt, quadArr[i], quadArr[(i+1)%quadArr.length]);
  }
  var ratio = ptArea / quadArea;
  if (ratio <= 1.0001) {
      return true;
  } else {
      return false;
  }
}

const xaxis = {x:1, y:0};
const yaxis = {x:0, y:1};
const xaxisNeg = {x:-1, y:0};
const yaxisNeg = {x:0, y:-1};

function mapQuad(pt, quadArr) {
  // https://math.stackexchange.com/questions/13404/mapping-irregular-quadrilateral-to-a-rectangle
  const p0 = quadArr[0];
  const p1 = quadArr[1];
  const p2 = quadArr[2];
  const p3 = quadArr[3];
  const dU0 = vecMag(vecSub(lineCP(p0, p3, pt), pt));
  const dU1 = vecMag(vecSub(lineCP(p1, p2, pt), pt));
  const u = dU0 / (dU0 + dU1);
  const dV0 = vecMag(vecSub(lineCP(p0, p1, pt), pt));
  const dV1 = vecMag(vecSub(lineCP(p3, p2, pt), pt));
  const v = dV0 / (dV0 + dV1);

  return {u:u, v:v};
}

function mapPointToUV(pt) {
  const quadindex = QUADS.findIndex(q => ptInQuad(pt, q));
  const quad = QUADS[quadindex];
  if (quad) {
    return {
      uv: mapQuad(pt, quad),
      uvindex: quadindex,
    };
  }

  // console.warn('Cannot find quad for given point in: mapPointToUV') 
  // Probs should throw error
  return undefined;
}

function mapUVtoCellCoord(pt) {
  // Bail if point is undefined
  if (!pt) return undefined;

  const cell = CELLS_SIMPLE[pt.uvindex];

  return {
    x: (cell.corner.x + (pt.uv.u * cell.w)) * window.innerWidth,
    y: (cell.corner.y + (pt.uv.v * cell.h)) * window.innerHeight,
  };
}
