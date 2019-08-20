import Button from './InputClasses/Button';
import Toggle from './InputClasses/Toggle';
import Knob from './InputClasses/Knob';
import Slider from './InputClasses/Slider';
import { Vec2 } from '../Utils';
import { create, all } from 'mathjs';
const config = { };
const math = create(all, config);

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

  // q1-4 corner positions of the quadrilateral, r1-4 corner positions of the rectangle (marker in our case)
  calDistortionMatrices(q1, q2, q3, q4, r1, r2, r3, r4) {
    
    const matrixA = math.matrix(
        [
            [ r1.x, r1.y, 1., 0., 0., 0., (-q1.x)*r1.x, (-q1.x)*r1.y ],
            [ 0., 0., 0., r1.x, r1.y, 1., (-q1.y)*r1.x, (-q1.y)*r1.y ],
            [ r2.x, r2.y, 1., 0., 0., 0., (-q2.x)*r2.x, (-q2.x)*r2.y ],
            [ 0., 0., 0., r2.x, r2.y, 1., (-q2.y)*r2.x, (-q2.y)*r2.y ],
            [ r3.x, r3.y, 1., 0., 0., 0., (-q3.x)*r3.x, (-q3.x)*r3.y ],
            [ 0., 0., 0., r3.x, r3.y, 1., (-q3.y)*r3.x, (-q3.y)*r3.y ],
            [ r4.x, r4.y, 1., 0., 0., 0., (-q4.x)*r4.x, (-q4.x)*r4.y ],
            [ 0., 0., 0., r4.x, r4.y, 1., (-q4.y)*r4.x, (-q4.y)*r4.y ]
        ]
    );
    
    const matrixB = math.matrix(
        [
            [ q1.x ],
            [ q1.y ],
            [ q2.x ],
            [ q2.y ],
            [ q3.x ],
            [ q3.y ],
            [ q4.x ],
            [ q4.y ]
        ]  
    );

    const s = math.lusolve(matrixA, matrixB);

    this.matrixRect2Quad = math.matrix(
        [
            [ math.subset(s, math.index(0, 0)), math.subset(s, math.index(1, 0)), math.subset(s, math.index(2, 0)) ],
            [ math.subset(s, math.index(3, 0)), math.subset(s, math.index(4, 0)), math.subset(s, math.index(5, 0)) ],
            [ math.subset(s, math.index(6, 0)), math.subset(s, math.index(7, 0)), 1. ]
        ]
    );

    this.matrixQuad2Rect = math.inv(this.matrixRect2Quad);
  }

  // transformation of v using matrix m
  // v = 2D vector of the format {x:X, y:Y}
  matrixTransform(m, v) {

    const matrixV = math.matrix([
        [v.x],
        [v.y],
        [1.]
    ]);

    const result = math.multiply(m, matrixV);

    return {
        x: math.subset(result, math.index(0, 0)) / math.subset(result, math.index(2, 0)),
        y: math.subset(result, math.index(1, 0)) / math.subset(result, math.index(2, 0))
    };
  }

  // map point from quad to rect - need to calDistortionMatrix first
  quad2Rect(v) {
      return this.matrixTransform(this.matrixQuad2Rect, v);
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
      if (this.anchor.present) {
      this.calDistortionMatrices(
        this.anchor.allCorners[0], this.anchor.allCorners[1], this.anchor.allCorners[2], this.anchor.allCorners[3],
        MARKER_CORNERS[0], MARKER_CORNERS[1], MARKER_CORNERS[2], MARKER_CORNERS[3]
        );
      }
      this.inputs.forEach((i) => i.update(this));
  }

  display(ctx) {
      if (this.anchor.present) {

        this.calDistortionMatrices(
            this.anchor.allCorners[0], this.anchor.allCorners[1], this.anchor.allCorners[2], this.anchor.allCorners[3],
            MARKER_CORNERS[0], MARKER_CORNERS[1], MARKER_CORNERS[2], MARKER_CORNERS[3]
        );

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.strokeStyle = "rgba(255, 100, 255, 1.0)";
        ctx.lineWidth = 3;

        const mp = this.anchor.allCorners.map(c => {
            return this.quad2Rect(c);
        });
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

        //   const screenPos = this.pos;//mapToScreen(this.pos);
        //   const bbPosX = this.boundingBox.x; //unitToScreen(this.boundingBox.x);
        //   const bbPosY = this.boundingBox.y; //unitToScreen(this.boundingBox.y);
        //   const bbw = this.boundingBox.w; //unitToScreen(this.boundingBox.w);
        //   const bbh = this.boundingBox.h; //unitToScreen(this.boundingBox.h);
        //   ctx.save();
        //   ctx.fillStyle = '#ffffff';
        //   ctx.strokeStyle = '#ffffff';
        //   ctx.textAlign = "left";
        //   ctx.textBaseline = "alphabetic";
        //   ctx.translate(screenPos.x, screenPos.y);
        //   ctx.rotate(this.angle);
        //   ctx.strokeRect(bbPosX, bbPosY, bbw, bbh);
        //   ctx.fillText(this.name, bbPosX, bbPosY - 5);

        //   let visX = bbPosX;
        //   const visY = bbPosY+bbh+5;
        //   const visW = 20;
        //   const visH = 20;
        //   const slideVisW = 40;
        //   const visGap = 7;
        //   this.inputs.forEach((i) => {
        //       const w = i.type==='SLIDER' ? slideVisW : visW;
        //       i.display(ctx, visX, visY, w, visH);
        //       visX = visX + w + visGap;
        //   });
        //   ctx.restore();
      }
  }

}

export default InputGroup;
