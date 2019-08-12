import { Vec2 } from '../Utils';
const { vecMag, vecSub, vecAngleBetween } = Vec2;
​
export function checkPerspective(anchor, actor, edgeThres, perimeterThres) {
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
  console.log(check, peridiff, edgediff1, edgediff2);
  return check;
}
​
export function relativePosition(anchor, actor, markerSize) {
  // array of edge lengths
  const edgelen1 = anchor.allCorners.map((v, i, arr) => vecMag(vecSub(v, arr[(i + 1) % arr.length])));
  const edgelen2 = actor.allCorners.map((v, i, arr) => vecMag(vecSub(v, arr[(i + 1) % arr.length])));
  // perimeters
  const peri1 = edgelen1.reduce((acc, v) => (acc + v));
  const peri2 = edgelen2.reduce((acc, v) => (acc + v));
​
  const mmperpx = (markerSize*4) / ((peri1+peri2)/2);
​
  const pxdist = vecMag(vecSub(anchor.center, actor.center));
  const realdist = pxdist * mmperpx;
  const angle = vecAngleBetween(vecSub(anchor.center, anchor.corner), vecSub(anchor.center, actor.center));
  return {
      distance: realdist,
      angle: angle,
    };
}
