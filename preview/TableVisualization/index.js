import io from 'socket.io-client';
import { initMarkers } from '../InputGenerator/Markers';
import { avgCorners, angleEMA } from '../InputGenerator/Utils/General';
import InputGroup from '../InputGenerator/Editor/InputGroup';
import * as Vec2 from '../InputGenerator/Utils/Vec2';

let canvas, ctx;
let markerData;
let inputGroupData, tableGroupData;

let prevTime = 0;

function update() {
  const timenow = Date.now();
  const dt = timenow - prevTime;

  markerData.forEach(m => m.checkPresence(timenow));
  inputGroupData.forEach(i => i.update());
  
  tableGroupData.forEach(i => i.update(40)); // update argument is the bounding box marker size

  ctx.clearRect(-10, -10, 1000000, 1000000);
  tableGroupData.forEach(i => i.display(ctx));

  prevTime = timenow;

  window.requestAnimationFrame(update.bind(this));
}

function initVisInput(inputArr) {
  inputGroupData = inputArr.groups.map((i) => (new InputGroup(markerData, i)));
  tableGroupData = inputGroupData.map((i) => (new TableInputGroup(i)));
}

function init() {
  canvas = document.querySelector('#canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  markerData = initMarkers(ctx);

  const socket = io('localhost:5000');

  socket.on('connect', () => {
    console.log('connected to server');
    socket.emit('get inputs config')
  });

  socket.on('send inputs config', ({ config }) => {
    initVisInput(JSON.parse(config));
    window.requestAnimationFrame(update.bind(this));
  });

  socket.on('update markers', (data) => {
    const markers = data.markers;

    if (markers.length > 0) {
      const mappedMarkers = markers.map(m => {
        // include naive conversion here in library
        const mappedCorners = m.corners
          .map(c => ({ x: c[0], y: c[1]}));

        return {
          id: m.id,
          corner: mappedCorners[0],
          center: avgCorners(mappedCorners),
          allCorners: mappedCorners,
        };
      });

      // MappedMarkers
      const timenow = Date.now();

      mappedMarkers.forEach(m => {
        if (m !== undefined) {
          markerData[m.id].update(m, timenow);
        }
      });
    }
  });
}

window.onload = () => init();


/////////////////////////////
/////////////////////////////
// TABLE VISUALIZATION CLASS

class TableInputGroup {
  constructor(inputGroup) {
    this.inputGroup = inputGroup;
    
    this.pos = {x:0, y:0}; // initialize with arbitrary value
    this.angle = 0; // initialize with arbitrary value
    this.pxpermm = 1; // initialize with arbitrary value
    this.sizeFound = false;

    this.boundingBox = { //set with calBoundingBox()
      x: -1, 
      y: -1,
      w: -1,
      h: -1,
    };

    this.cornerAngleGroup = -Math.PI/2;
    this.cornerAngleInput = -3*Math.PI/4;
  }

  update(size) {
    if (this.inputGroup.anchor.present) {
      const tempAngle = -this.inputGroup.angle - this.cornerAngleGroup;
      this.angle = angleEMA(tempAngle, this.angle, 0.5);
      this.pos = mapToScreen(this.inputGroup.anchor.center);
      
      // IF PXPERMM HAS NOT BEEN DETERMINED, FIND IT AND CALCULATE BOUNDING BOX
      if (!this.sizeFound) {
        this.calBoundingBox(size);
      }
    }
  }

  display(ctx) {
    if (this.inputGroup.anchor.present && this.sizeFound) {
      ctx.save();

      ctx.strokeStyle = 'white';

      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.angle);

      ctx.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.w, this.boundingBox.h);

      const len = this.inputGroup.name.length;
      ctx.fillStyle = 'white';
      ctx.fillRect(this.boundingBox.x, this.boundingBox.y - 20, len * 7 + 20, 20);
      ctx.fillStyle = 'black';
      ctx.font = "14px sans-serif";
      ctx.fillText(this.inputGroup.name, this.boundingBox.x + 10, this.boundingBox.y - 5);

      let visX = 0;
      const visSize = 20;
      const visGap = 5;
      const visBuffer = 3;
      const xpos = this.boundingBox.x;
      const ypos = this.boundingBox.y + this.boundingBox.h + visGap;
      ctx.fillStyle = 'white';

      this.inputGroup.inputs.forEach( i => {
        
        const val = i.val;

        switch(i.type) {
          case 'BUTTON':
            ctx.beginPath();
            ctx.ellipse(xpos + visSize/2 + visX, ypos + visSize/2, visSize/2, visSize/2, 0, 0, Math.PI*2, false);
            ctx.stroke();
            const r = (val * (visSize - visBuffer * 2)) / 2;
            ctx.beginPath();
            ctx.ellipse(xpos + visSize/2 + visX, ypos + visSize/2, r, r, 0, 0, Math.PI*2, false);
            ctx.fill();
            visX = visX + visSize + visGap;
            break;

          case 'TOGGLE':
            ctx.strokeRect(xpos + visX, ypos, visSize, visSize);
            if (val > 0.5) ctx.fillRect(xpos + visX + visBuffer, ypos + visBuffer, visSize - visBuffer*2, visSize - visBuffer*2);
            visX = visX + visSize + visGap;
            break;

          case 'KNOB':
            const kx = visSize/2 * Math.cos(val);
            const ky = visSize/2 * Math.sin(val);
            ctx.beginPath();
            ctx.ellipse(xpos + visSize/2 + visX, ypos + visSize/2, visSize/2, visSize/2, 0, 0, Math.PI*2, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(xpos + visSize/2 + visX, ypos + visSize/2);
            ctx.lineTo(xpos + visSize/2 + visX + kx, ypos + visSize/2 + ky);
            ctx.stroke();
            visX = visX + visSize + visGap;
            break;

          case 'SLIDER':
            ctx.strokeRect(xpos + visX, ypos, visSize*3, visSize);
            ctx.fillRect(xpos + visX, ypos, visSize*3*val, visSize);
            visX = visX + visSize*3 + visGap;
            break;
        }
      });

      ctx.restore();
    }
  }

  calBoundingBox(markerOffsetSize) {
    let counter = 0;
    this.inputGroup.inputs.forEach(i => {
      if (i.actor.present) counter++;
    });

    if (counter === this.inputGroup.inputs.length) {
      let centerPts = this.inputGroup.inputs.map((i) => Vec2.vecRot(Vec2.vecScale({x:0, y:1}, i.relativePosition.distance * this.pxpermm), -i.relativePosition.angle - this.cornerAngleInput));
      centerPts.push({x:0, y:0});

      let actorLen = this.inputGroup.inputs.map(i => {
        const actorCen = mapToScreen(i.actor.center);
        return Vec2.vecMag(Vec2.vecSub(this.pos, actorCen));
      });

      let pxRatios = actorLen.map((v, i) => {
        return v / this.inputGroup.inputs[i].relativePosition.distance;
      });

      this.pxpermm = pxRatios.reduce((acc, v) => (acc + v));
      this.pxpermm = this.pxpermm / pxRatios.length;

      centerPts.sort((a, b) => (a.x - b.x));
      const xmax = centerPts[centerPts.length-1].x;
      const xmin = centerPts[0].x;
      const xw = xmax - xmin;
      
      centerPts.sort((a, b) => (a.y - b.y));
      const ymax = centerPts[centerPts.length-1].y;
      const ymin = centerPts[0].y;
      const yh = ymax - ymin;
      
      this.boundingBox.x = xmin*this.pxpermm - markerOffsetSize;
      this.boundingBox.y = ymin*this.pxpermm - markerOffsetSize;
      this.boundingBox.w = xw*this.pxpermm + markerOffsetSize*2;
      this.boundingBox.h = yh*this.pxpermm + markerOffsetSize*2;

      this.sizeFound = true;
    }
  }
}




/////////////////////////////
/////////////////////////////
// SCREEN MAPPING

const IMGW = 1280;
const IMGH = 720;

const QUADS_CALIBRATED = [[{"x":0.10510614934114203,"y":0.15773034877667882},{"x":0.11447657393850659,"y":0.33263925833357055},{"x":0.12970351390922402,"y":0.49921915668922434},{"x":0.14903001464128843,"y":0.65018222854511},{"x":0.1712847730600293,"y":0.7834461535841521},{"x":0.19412518301610543,"y":0.8955157556489133}],[{"x":0.16630673499267937,"y":0.137948984903696},{"x":0.174798682284041,"y":0.32170745198271167},{"x":0.18885431918008785,"y":0.49817803227485685},{"x":0.20730234260614935,"y":0.656428975031315},{"x":0.2275073206442167,"y":0.794377959935011},{"x":0.2474194729136164,"y":0.909050373035691}],[{"x":0.23834187408491947,"y":0.11868818323789693},{"x":0.24566251830161054,"y":0.31285789446058776},{"x":0.2576683748169839,"y":0.4966163456533056},{"x":0.2734809663250366,"y":0.6616345971031526},{"x":0.29017203513909223,"y":0.8033762449773881},{"x":0.30715593195589885,"y":0.9210233038009175}],[{"x":0.32091874084919475,"y":0.1015096304008329},{"x":0.3264824304538799,"y":0.3034877747312801},{"x":0.3358528572853278,"y":0.4952034183246031},{"x":0.3472730622633659,"y":0.6659478222808759},{"x":0.3601573960847422,"y":0.810143553670777},{"x":0.3724560783687832,"y":0.9298728613230414}],[{"x":0.41228038960983254,"y":0.08953669963560645},{"x":0.4155014730651766,"y":0.29724102030192606},{"x":0.4204795111325265,"y":0.4940135505036846},{"x":0.4272145038118823,"y":0.667360781382174},{"x":0.4345351480285734,"y":0.8141592920353983},{"x":0.4412701407079292,"y":0.9349297241020302}],[{"x":0.5086200764378203,"y":0.08485163977095263},{"x":0.5094985537438231,"y":0.2946382092660073},{"x":0.5100841963448252,"y":0.49245187976843113},{"x":0.5106698478821605,"y":0.6663196569678065},{"x":0.5115483251881634,"y":0.8146798542425819},{"x":0.5124268024941664,"y":0.9359708485163977}],[{"x":0.6052525800981424,"y":0.08745445080687142},{"x":0.6032027997174689,"y":0.2956793336803748},{"x":0.5991032389561219,"y":0.4914107394677658},{"x":0.5944180266574396,"y":0.6647579703462552},{"x":0.5888543370527544,"y":0.8120770432066632},{"x":0.5829978216794015,"y":0.9328474752732951}],[{"x":0.696028550512445,"y":0.09682457053617907},{"x":0.6925146412884334,"y":0.29947200459406315},{"x":0.6843155197657393,"y":0.4903695991671005},{"x":0.6740666178623719,"y":0.6605934726887851},{"x":0.6629392386530014,"y":0.8058303284930537},{"x":0.6515190336749634,"y":0.9257083636655713}],[{"x":0.7785979877515311,"y":0.1119751166407465},{"x":0.7727489019033675,"y":0.30467762666590076},{"x":0.761975065616798,"y":0.48989113530326595},{"x":0.7475658857979502,"y":0.65434672620258},{"x":0.7320461200585652,"y":0.7954190525767829},{"x":0.7165263543191801,"y":0.9146277980218636}],[{"x":0.8509334178829612,"y":0.12909942738157212},{"x":0.8433199478976025,"y":0.31285789446058776},{"x":0.8304356140762262,"y":0.4882873662246633},{"x":0.8137445452621705,"y":0.6465382930948237},{"x":0.7947108702987737,"y":0.784487246225924},{"x":0.7753843695667094,"y":0.9007213777207509}],[{"x":0.9124268293031662,"y":0.1478396668401874},{"x":0.9042277077804722,"y":0.3211868897755279},{"x":0.8904648966530929,"y":0.48672567960311197},{"x":0.8717240474583638,"y":0.6382092977798836},{"x":0.8506405921142935,"y":0.77147319104633},{"x":0.8292643110015556,"y":0.8845839492980544}]];
const CELLS_CALIBRATED = [[{"x":0,"y":1},{"x":0,"y":0.8},{"x":0,"y":0.6000000000000001},{"x":0,"y":0.4},{"x":0,"y":0.2},{"x":0,"y":0}],[{"x":0.1,"y":1},{"x":0.1,"y":0.8},{"x":0.1,"y":0.6000000000000001},{"x":0.1,"y":0.4},{"x":0.1,"y":0.2},{"x":0.1,"y":0}],[{"x":0.2,"y":1},{"x":0.2,"y":0.8},{"x":0.2,"y":0.6000000000000001},{"x":0.2,"y":0.4},{"x":0.2,"y":0.2},{"x":0.2,"y":0}],[{"x":0.30000000000000004,"y":1},{"x":0.30000000000000004,"y":0.8},{"x":0.30000000000000004,"y":0.6000000000000001},{"x":0.30000000000000004,"y":0.4},{"x":0.30000000000000004,"y":0.2},{"x":0.30000000000000004,"y":0}],[{"x":0.4,"y":1},{"x":0.4,"y":0.8},{"x":0.4,"y":0.6000000000000001},{"x":0.4,"y":0.4},{"x":0.4,"y":0.2},{"x":0.4,"y":0}],[{"x":0.5,"y":1},{"x":0.5,"y":0.8},{"x":0.5,"y":0.6000000000000001},{"x":0.5,"y":0.4},{"x":0.5,"y":0.2},{"x":0.5,"y":0}],[{"x":0.6000000000000001,"y":1},{"x":0.6000000000000001,"y":0.8},{"x":0.6000000000000001,"y":0.6000000000000001},{"x":0.6000000000000001,"y":0.4},{"x":0.6000000000000001,"y":0.2},{"x":0.6000000000000001,"y":0}],[{"x":0.7000000000000001,"y":1},{"x":0.7000000000000001,"y":0.8},{"x":0.7000000000000001,"y":0.6000000000000001},{"x":0.7000000000000001,"y":0.4},{"x":0.7000000000000001,"y":0.2},{"x":0.7000000000000001,"y":0}],[{"x":0.8,"y":1},{"x":0.8,"y":0.8},{"x":0.8,"y":0.6000000000000001},{"x":0.8,"y":0.4},{"x":0.8,"y":0.2},{"x":0.8,"y":0}],[{"x":0.9,"y":1},{"x":0.9,"y":0.8},{"x":0.9,"y":0.6000000000000001},{"x":0.9,"y":0.4},{"x":0.9,"y":0.2},{"x":0.9,"y":0}],[{"x":1,"y":1},{"x":1,"y":0.8},{"x":1,"y":0.6000000000000001},{"x":1,"y":0.4},{"x":1,"y":0.2},{"x":1,"y":0}]];

const QUADSNORM = generateQuads(QUADS_CALIBRATED);

const QUADS = QUADSNORM.map(
  subset => subset.map(
    q => ({
      x: q.x * IMGW,
      y: q.y * IMGH,
    })
  )
);

const CELLS = generateQuads(CELLS_CALIBRATED);

const CELLS_SIMPLE = CELLS.map(c => ({
  corner: c[0],
  w: c[2].x - c[0].x,
  h: c[2].y - c[0].y,
}));


function generateQuads(q) {
  var a0 = shiftArray2D(q, -1, -1);
  var a1 = shiftArray2D(q, 1, -1);
  var a2 = shiftArray2D(q, 1, 1);
  var a3 = shiftArray2D(q, -1, 1);
  var quadArr = [];
  for (var i=0; i<a0.length; i++) {
    for (var j=0; j<a0[i].length; j++) {
      var temparr = [];
      temparr.push(a0[i][j]);
      temparr.push(a1[i][j]);
      temparr.push(a2[i][j]);
      temparr.push(a3[i][j]);
      quadArr.push(temparr);
    }
  }
  return quadArr;
}

function shiftArray(arr, index) {
  var newarr = [];
  if (index > 0) {
    for (var i=index; i<arr.length; i++) {
      newarr.push(arr[i]);
    }
  } else if (index < 0) {
    for (var i=0; i<arr.length+index; i++) {
      newarr.push(arr[i]);
    }
  }
  return newarr;
}

function shiftArray2D(arr, index1, index2) {
  var newarr = arr.map( a => shiftArray(a, index2));
  newarr = shiftArray(newarr, index1);
  return newarr;
}

function areaTriangle(p0, p1, p2) {
  return Math.abs(p0.x*(p1.y - p2.y) + p1.x*(p2.y - p0.y) + p2.x*(p0.y - p1.y))/2
}

function ptInQuad(pt, quadArr) {
  var quadArea = areaTriangle(quadArr[0], quadArr[1], quadArr[2]) + areaTriangle(quadArr[0], quadArr[2], quadArr[3]);
  var ptArea = 0;
  for (var i=0; i<quadArr.length; i++) {
      ptArea = ptArea + areaTriangle(pt, quadArr[i], quadArr[(i+1)%quadArr.length]);
  }
  var ratio = ptArea / quadArea;
  if (ratio <= 1.0001) {
      return true;
  } else {
      return false;
  }
}

function mapQuad(pt, quadArr) {
  // https://math.stackexchange.com/questions/13404/mapping-irregular-quadrilateral-to-a-rectangle
  const p0 = quadArr[0];
  const p1 = quadArr[1];
  const p2 = quadArr[2];
  const p3 = quadArr[3];
  const dU0 = Vec2.vecMag(Vec2.vecSub(Vec2.lineCP(p0, pt, p3), pt));
  const dU1 = Vec2.vecMag(Vec2.vecSub(Vec2.lineCP(p1, pt, p2), pt));
  const u = dU0 / (dU0 + dU1);
  const dV0 = Vec2.vecMag(Vec2.vecSub(Vec2.lineCP(p0, pt, p1), pt));
  const dV1 = Vec2.vecMag(Vec2.vecSub(Vec2.lineCP(p3, pt, p2), pt));
  const v = dV0 / (dV0 + dV1);

  return {u:u, v:v};
}

function mapPointToUV(pt) {
  const quadindex = QUADS.findIndex(q => ptInQuad(pt, q));
  const quad = QUADS[quadindex];
  if (quad) {
    return {
      uv: mapQuad(pt, quad),
      uvindex: quadindex,
    };
  }

  // console.warn('Cannot find quad for given point in: mapPointToUV') 
  // Probs should throw error
  return undefined;
}

function mapUVtoCellCoord(pt) {
  // Bail if point is undefined
  if (!pt) return {x:-1, y:-1};

  const cell = CELLS_SIMPLE[pt.uvindex];

  return {
    x: (cell.corner.x + (pt.uv.u * cell.w)) * window.innerWidth,
    y: (cell.corner.y + (pt.uv.v * cell.h)) * window.innerHeight,
  };
}

function mapToScreen(pt) {
  return mapUVtoCellCoord(mapPointToUV(pt));
}