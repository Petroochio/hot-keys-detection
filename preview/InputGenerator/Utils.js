export function calEMA(newVal, oldVal, EMA) {
  return ((newVal * EMA) + (oldVal * (1 - EMA)));
}

// Vector Lib
// Lol we made a vector library
export const Vec2 = {
  vecAdd(vec1, vec2) {
    return {x:vec1.x + vec2.x, y:vec1.y + vec2.y};
  },
  
  // vector vec1 ---> vec2
  vecSub(vec1, vec2) {
    return {x:-vec1.x + vec2.x, y:-vec1.y + vec2.y};
  },
  
  vecScale(vec, scale) {
    return {x:vec.x*scale, y:vec.y*scale};
  },
  
  vecDot(vec1, vec2) {
    return vec1.x*vec2.x + vec1.y*vec2.y;
  },
  
  vecMag(vec) {
    return Math.pow(Math.pow(vec.x, 2) + Math.pow(vec.y, 2), 0.5);
  },
  
  vecMag2(vec) {
    return Math.pow(vec.x, 2) + Math.pow(vec.y, 2);
  },
  
  vecUnit(vec) {
    var m = vecMag(vec);
    return {
      x: vec.x/m,
      y: vec.y/m,
    };
  },
  
  vecRot90(vec) {
    return {x:vec.y, y:-vec.x}
  },
  
  vecRot(vec, angle) {
    var x = vec.x * Math.cos(angle) - vec.y * Math.sin(angle);
    var y = vec.x * Math.sin(angle) + vec.y * Math.cos(angle);
    return {x:x, y:y};
  },
  
  vecAngleBetween(vec1, vec2) {
    return Math.atan2(vec1.y, vec1.x) - Math.atan2(vec2.y, vec2.x);
  },
  
  vecEMA(vec1, vec2, weight) {
    return {
      x: (vec1.x*(1-weight) + vec2.x*weight), 
      y: (vec1.y*(1-weight) + vec2.y*weight) 
    };
  },

  vecDot(vec1, vec2) {
    return vec1.x*vec2.x + vec1.y*vec2.y;
  },

  // p0 is point of interest, p1: start of line, p2: end of line
  lineCP(p2, p0, p1) {
    var p10 = {x: p0.x-p1.x, y: p0.y-p1.y};
    var p12 = {x: p2.x-p1.x, y: p2.y-p1.y};
    var t = Vec2.vecDot(p12, p10)/Vec2.vecDot(p12, p12);
    var CPx = p1.x + t*p12.x;
    var CPy = p1.y + t*p12.y;
    // console.log(p10, p12, t, CPx, CPy);
    return {x: CPx, y: CPy, t: t};
  },
};


// TRIANGLE COLLISION

export function pointInTri(pt, t0, t1, t2) {
  const area = 0.5 * (-t1.y * t2.x + t0.y * (-t1.x + t2.x) + t0.x * (t1.y - t2.y) + t1.x * t2.y);
  // Need this bc this formula needs to know winding order of triangle verts
  const sign = area > 0 ? 1 : -1;

  const s = (t0.y * t2.x - t0.x * t2.y + (t2.y - t0.y) * pt.x + (t0.x - t2.x) * pt.y) * sign;
  const t = (t0.x * t1.y - t0.y * t1.x + (t0.y - t1.y) * pt.x + (t1.x - t0.x) * pt.y) * sign;
    
  return s > 0 && t > 0 && ((s + t) < 2 * area * sign);
}

// RECT COLLISION
export function pointInRect(pt, rect) {
  if (pointInTri(pt, rect[0], rect[1], rect[2])) return true;
  else if (pointInTri(pt, rect[0], rect[2], rect[3])) return true;

  return false;
}

// Corner stuff
export const sumPoints = (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y });
export const avgCorners = (corners) => {
  const total = corners.reduce(sumPoints, { x: 0, y: 0 });

  return {
    x: total.x / corners.length,
    y: total.y / corners.length,
  };
};