import Button from './InputClasses/Button';
import Toggle from './InputClasses/Toggle';
import Knob from './InputClasses/Knob';
import Slider from './InputClasses/Slider';
import { Vec2 } from '../Utils';
const { vecSub, vecRot, vecScale, vecAngleBetween } = Vec2;

// These need to be made constants
const CORNER_ANGLE = -3*Math.PI/4;
const xaxis = {x:1, y:0};
const yaxis = {x:0, y:1};
const angleRefAxis = xaxis;

class InputGroup {
  constructor(markerData, config) {
      this.name = config.name;
      this.anchor = markerData[config.anchorID];
      this.anchor.timeout = config.detectWindow;
      this.anchor.inuse = true;
      this.inputs = config.inputs.map((i) => {
          switch(i.type) {
              case 'BUTTON':
                  return new Button(markerData, i);
              case 'TOGGLE':
                  return new Toggle(markerData, i);
              case 'KNOB':
                  return new Knob(markerData, i);
              case 'SLIDER':
                  return new Slider(markerData, i);
              default:
                  break;
          }   
      });

      this.boundingBox = { //set with calBoundingBox()
          x: -1, 
          y: -1,
          w: -1,
          h: -1,
      };
      this.angle = 0;
      this.pos = {x:0, y:0};
  }

  calBoundingBox(markerOffsetSize) {
      
      let centerPts = this.inputs.map((i) => vecRot(vecScale(yaxis, i.relativePosition.distance), i.relativePosition.angle));
      centerPts.push({x:0, y:0});

      // centerPts.forEach(p => {
      //     debugVec(
      //         mapToScreen(this.anchor.center),
      //         mapToScreen(vecAdd(this.anchor.center, p)),
      //         'red'
      //         );
      // });
      
      centerPts.sort((a, b) => (a.x - b.x));
      const xmax = centerPts[centerPts.length-1].x;
      const xmin = centerPts[0].x;
      const xw = xmax - xmin;
      
      centerPts.sort((a, b) => (a.y - b.y));
      const ymax = centerPts[centerPts.length-1].y;
      const ymin = centerPts[0].y;
      const yh = ymax - ymin;
      
      this.boundingBox.x = xmin - markerOffsetSize;
      this.boundingBox.y = ymin - markerOffsetSize;
      this.boundingBox.w = xw + markerOffsetSize*2;
      this.boundingBox.h = yh + markerOffsetSize*2;

  }

  update() {
      this.angle = vecAngleBetween(vecSub(this.anchor.center, this.anchor.corner), angleRefAxis) - CORNER_ANGLE;
      this.pos = this.anchor.center;
      this.inputs.forEach((i) => i.update(this));
  }

  display() {
      if (this.anchor.present) {
          const screenPos = mapToScreen(this.pos);
          const bbPosX = unitToScreen(this.boundingBox.x);
          const bbPosY = unitToScreen(this.boundingBox.y);
          const bbw = unitToScreen(this.boundingBox.w);
          const bbh = unitToScreen(this.boundingBox.h);
          ctx.save();
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.translate(screenPos.x, screenPos.y);
          ctx.rotate(this.angle);
          ctx.strokeRect(bbPosX, bbPosY, bbw, bbh);
          ctx.fillText(this.name, bbPosX, bbPosY - 5);

          let visX = bbPosX;
          const visY = bbPosY+bbh+5;
          const visW = 20;
          const visH = 20;
          const slideVisW = 40;
          const visGap = 7;
          this.inputs.forEach((i) => {
              const w = i.type==='SLIDER' ? slideVisW : visW;
              i.display(visX, visY, w, visH);
              visX = visX + w + visGap;
          });
          ctx.restore();
      }
  }
}

export default InputGroup;
