import { calEMA } from '../../Utils/General';

const CORNER_ANGLE = -3*Math.PI/4;

class Toggle {
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

  display(parent, ctx, x, y, w, h) {
    //   ctx.beginPath();
    //   ctx.strokeRect(x, y, w, h);
    //   const offset = 3;
    //   if (this.val > 0.5) {
    //       ctx.beginPath();
    //       ctx.fillRect(x + offset, y + offset, w - offset*2, h - offset*2);
    //   }
  }
}

export default Toggle;
