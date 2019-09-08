export function calEMA(newVal, oldVal, EMA) {
  return ((newVal * EMA) + (oldVal * (1 - EMA)));
}

export function angleEMA(newAngle, oldAngle, EMA) {
  const nx = Math.cos(newAngle);
  const ny = Math.sin(newAngle);
  const ox = Math.cos(oldAngle);
  const oy = Math.sin(oldAngle);
  const x = (nx * EMA) + (ox * (1 - EMA));
  const y = (ny * EMA) + (oy * (1 - EMA));
  return Math.atan2(y, x);
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
