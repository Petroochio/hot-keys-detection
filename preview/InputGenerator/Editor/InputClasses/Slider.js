import { Vec2, calEMA } from '../../Utils';
const { vecSub, vecMag, vecRot, vecScale, vecEMA, lineCP } = Vec2;

const CORNER_ANGLE = -3*Math.PI/4;
const xaxis = {x:1, y:0};
const yaxis = {x:0, y:1};

class Slider {
  constructor(markerData, inputData) {
      this.name = inputData.name;
      this.type = inputData.type;
      this.actor = markerData[inputData.actorID];
      this.val = 0;
      this.relativePosition = {
          distance: inputData.relativePosition.distance,
          angle: inputData.relativePosition.angle - CORNER_ANGLE,
      }
      this.start = {
          distance: inputData.relativePosition.distance,
          angle: inputData.relativePosition.angle - CORNER_ANGLE,
      }
      this.end = {
          distance: inputData.endPosition.distance,
          angle: inputData.endPosition.angle - CORNER_ANGLE,
      }
      this.trackLength = vecMag(
          vecSub(
              vecRot(vecScale(xaxis, this.start.distance), this.start.angle), 
              vecRot(vecScale(xaxis, this.end.distance), this.end.angle)
              )
          );
      this.actor.timeout = inputData.detectWindow;
      this.actor.inuse = true;
      this.pos = {x:0, y:0};
      this.spos = {x:0, y:0};
      this.epos = {x:0, y:0};
  }

  update(parent) {
      if (this.actor.present) {

        //   const as = vecRot(vecScale(yaxis, this.start.distance), this.start.angle + parent.angle);
        //   const aa = vecSub(parent.anchor.center, this.actor.center);
          // debugVec(
          //     mapToScreen(parent.anchor.center),
          //     mapToScreen(vecAdd(parent.anchor.center, as)),
          //     'red'
          //     );
        //   const len = vecMag(vecSub(as, aa));
        //   let v = len / this.trackLength;
        //   v = v > 1 ? 1 : v < 0 ? 0 : v; // constraining v between 0 to 1
        //   this.val = calEMA(v, this.val, 0.5);

          const rwpos = this.actor.center;
          this.pos = vecEMA(this.pos, parent.quad2Rect(rwpos), 0.3);
          const as = vecRot(vecScale(xaxis, this.start.distance), -this.start.angle);
          this.spos = vecEMA(this.spos, as, 1.0);
          const ae = vecRot(vecScale(xaxis, this.end.distance), -this.end.angle);
          this.epos = vecEMA(this.spos, ae, 1.0);
          
          let v = lineCP(this.epos, this.pos, this.spos).t;
          v = v > 1 ? 1 : v < 0 ? 0 : v; // constraining v between 0 to 1
          this.val = calEMA(v, this.val, 0.5); 
          console.log(v, this.val);
      }
  }
  
  display(parent, ctx, x, y, w, h) {
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.pos.x, this.pos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.spos.x, this.spos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.epos.x, this.epos.y);
    ctx.stroke();

    //   ctx.beginPath();
    //   ctx.strokeRect(x, y, w, h);
    //   ctx.beginPath();
    //   ctx.fillRect(x, y, w*this.val, h);
  }
}

export default Slider;
