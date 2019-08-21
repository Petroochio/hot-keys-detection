import { calEMA } from '../../Utils/General';
import { vecSub, vecMag, vecRot, vecScale, vecEMA, lineCP, vecUnit } from '../../Utils/Vec2';

const CORNER_ANGLE = -3*Math.PI/4;
const xaxis = {x:1, y:0};
const yaxis = {x:0, y:1};

class Button {
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
      const v = this.actor.present ? 1 : 0;
      this.val = calEMA(v, this.val, 0.5);
  }

  display(parent, ctx, pxpermm, w) {
    const screenpos = vecRot(vecScale(xaxis, this.relativePosition.distance*pxpermm), -this.relativePosition.angle);

    ctx.save();

    ctx.translate(parent.pos.x, parent.pos.y);
    ctx.rotate(parent.angle);
    ctx.translate(screenpos.x, screenpos.y);

    ctx.beginPath();
    ctx.ellipse(0, 0, w/2, w/2, 0, 0, Math.PI*2, false);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(0, 0, w*this.val, w*this.val, 0, 0, Math.PI*2, false);
    ctx.fill();
    
    ctx.restore();
  }
}

export default Button;
