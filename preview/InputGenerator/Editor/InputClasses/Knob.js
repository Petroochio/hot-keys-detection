import { calEMA } from '../../Utils';

const CORNER_ANGLE = -3*Math.PI/4;
const xaxis = {x:1, y:0};

class Knob {
  constructor(markerData, inputData) {
      this.name = inputData.name;
      this.type = inputData.type;
      this.actor = markerData[inputData.actorID];
      this.val = 0;
      this.relativePosition = {
          distance: inputData.relativePosition.distance,
          angle: inputData.relativePosition.angle - CORNER_ANGLE,
      }
      this.actor.timeout = inputData.detectWindow;
      this.actor.inuse = true;
  }

  update(parent) {
      if (this.actor.present) {
          const anchorVec = vecSub(parent.anchor.center, parent.anchor.corner);
          const actorVec = vecSub(this.actor.center, this.actor.corner);
          const angleBetween = -vecAngleBetween(anchorVec, actorVec);
          this.val = calEMA(angleBetween, this.val, 0.5);
      }
  }

  display(x, y, w, h) {
      const traj = vecScale(vecRot(xaxis, this.val), w/2);
      ctx.beginPath();
      ctx.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, Math.PI*2, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x+w/2, y+h/2);
      ctx.lineTo(x+w/2+traj.x, y+h/2+traj.y);
      ctx.stroke();
  }
}

export default Knob;