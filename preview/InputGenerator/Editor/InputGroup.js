import { inv } from 'mathjs';
import Button from './InputClasses/Button';
import Toggle from './InputClasses/Toggle';
import Knob from './InputClasses/Knob';
import Slider from './InputClasses/Slider';
import * as Vec2 from '../Utils/Vec2';

import { calDistortionMatrices, matrixTransform } from '../Utils/Distortion';
const config = {};

const { vecSub, vecRot, vecScale, vecAngleBetween } = Vec2;

// These need to be made constants
const CORNER_ANGLE = -3*Math.PI/4;
const xaxis = {x:1, y:0};
const yaxis = {x:0, y:1};
const angleRefAxis = xaxis;

const MARKER_SIZE = 20;
const MARKER_CORNERS = [
  {x: -MARKER_SIZE/2, y: -MARKER_SIZE/2},
  {x: MARKER_SIZE/2, y: -MARKER_SIZE/2},
  {x: MARKER_SIZE/2, y: MARKER_SIZE/2},
  {x: -MARKER_SIZE/2, y: MARKER_SIZE/2}
];

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


    // Undistortion Matrix stuff
    this.matrixRect2Quad;
    this.matrixQuad2Rect;
  }

  calBoundingBox(markerOffsetSize) {
    let centerPts = this.inputs.map((i) => vecRot(vecScale(yaxis, i.relativePosition.distance), i.relativePosition.angle));
    centerPts.push({x:0, y:0});

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
    if (this.anchor.present) {
      this.matrixRect2Quad = calDistortionMatrices(
        this.anchor.allCorners[0], this.anchor.allCorners[1], this.anchor.allCorners[2], this.anchor.allCorners[3],
        MARKER_CORNERS[0], MARKER_CORNERS[1], MARKER_CORNERS[2], MARKER_CORNERS[3]
      );

      this.matrixQuad2Rect = inv(this.matrixRect2Quad);
      this.inputs.forEach((i) => i.update(this));
    }
  }

  display(ctx) {
    if (this.anchor.present) {

      calDistortionMatrices(
        this.anchor.allCorners[0], this.anchor.allCorners[1], this.anchor.allCorners[2], this.anchor.allCorners[3],
        MARKER_CORNERS[0], MARKER_CORNERS[1], MARKER_CORNERS[2], MARKER_CORNERS[3]
      );

      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.strokeStyle = "rgba(255, 100, 255, 1.0)";
      ctx.lineWidth = 3;

      const mp = this.anchor.allCorners.map(c => matrixTransform(this.matrixQuad2Rect, c));
      ctx.beginPath();
      ctx.moveTo(mp[mp.length-1].x, mp[mp.length-1].y);
      mp.forEach(c => {
        ctx.lineTo(c.x, c.y);
      });
      ctx.stroke();

      this.inputs.forEach((i) => {
        i.display(this, ctx, 0, 0, 0, 0);
      });

      ctx.restore();
    }
  }

}

export default InputGroup;
