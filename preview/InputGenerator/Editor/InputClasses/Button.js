import { calEMA } from '../../Utils';

const CORNER_ANGLE = -3*Math.PI/4;

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

  display(ctx, x, y, w, h) {
      ctx.beginPath();
      ctx.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, Math.PI*2, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x+w/2, y+h/2, w/2*this.val, h/2*this.val, 0, 0, Math.PI*2, false);
      ctx.fill();
  }
}

export default Button;
