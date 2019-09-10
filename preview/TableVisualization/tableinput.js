function initTableInput(inputArr) {
    inputGroupData = inputArr.groups.map((i) => (new TableInputGroup(markerData, i)));
    inputGroupData.forEach((i) => i.calBoundingBox(30));
}

const angleRefAxis = xaxis;

function debugVec(start, end, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
}

class TableInputGroup {
    constructor(markerData, config) {
        this.name = config.name;
        this.anchor = markerData[config.anchorID];
        this.anchor.timeout = config.detectWindow;
        this.anchor.inuse = true;
        this.boundingBox = { //set with calBoundingBox()
            x: -1, 
            y: -1,
            w: -1,
            h: -1,
        };
        this.angle = 0;
        this.pos = {x:0, y:0};

        this.cornerAngleGroup = -3*Math.PI/4;
        this.cornerAngleInput = -3*Math.PI/4;

        this.inputs = config.inputs.map((i) => {
            switch(i.type) {
                case 'BUTTON':
                    return new Button(markerData, i, this);
                case 'TOGGLE':
                    return new Toggle(markerData, i, this);
                case 'KNOB':
                    return new Knob(markerData, i, this);
                case 'SLIDER':
                    return new Slider(markerData, i, this);
                default:
                    break;
            }   
        });
    }

    calBoundingBox(markerOffsetSize) {
        
        let centerPts = this.inputs.map((i) => vecRot(vecScale(yaxis, i.relativePosition.distance), -i.relativePosition.angle - this.cornerAngleInput));
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
        this.angle = vecAngleBetween(vecSub(this.anchor.center, this.anchor.corner), angleRefAxis) - this.cornerAngleGroup;
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

const BUTTON_EMA = 0.5;
const TOGGLE_EMA = 0.5;
const KNOB_EMA = 0.5;
const SLIDER_EMA = 0.5;

class Button {
    constructor(markerData, inputData, p) {
        this.name = inputData.name;
        this.type = inputData.type;
        this.actor = markerData[inputData.actorID];
        this.val = 0;
        this.relativePosition = {
            distance: inputData.relativePosition.distance,
            angle: inputData.relativePosition.angle,
        }
        this.actor.timeout = inputData.detectWindow;
        this.actor.inuse = true;
    }

    update(parent) {
        const v = this.actor.present ? 1 : 0;
        this.val = calEMA(this.val, v, BUTTON_EMA);
    }

    display(x, y, w, h) {
        ctx.beginPath();
        ctx.ellipse(x+w/2, y+h/2, w/2, h/2, 0, 0, Math.PI*2, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x+w/2, y+h/2, w/2*this.val, h/2*this.val, 0, 0, Math.PI*2, false);
        ctx.fill();
    }
}

class Toggle {
    constructor(markerData, inputData, p) {
        this.name = inputData.name;
        this.type = inputData.type;
        this.actor = markerData[inputData.actorID];
        this.val = 0;
        this.relativePosition = {
            distance: inputData.relativePosition.distance,
            angle: inputData.relativePosition.angle,
        }
        this.actor.timeout = inputData.detectWindow;
        this.actor.inuse = true;
    }

    update(parent) {
        const v = this.actor.present ? 1 : 0;
        this.val = calEMA(this.val, v, TOGGLE_EMA);
    }

    display(x, y, w, h) {
        ctx.beginPath();
        ctx.strokeRect(x, y, w, h);
        const offset = 3;
        if (this.val > 0.5) {
            ctx.beginPath();
            ctx.fillRect(x + offset, y + offset, w - offset*2, h - offset*2);
        }
    }
}

class Knob {
    constructor(markerData, inputData, p) {
        this.name = inputData.name;
        this.type = inputData.type;
        this.actor = markerData[inputData.actorID];
        this.val = 0;
        this.relativePosition = {
            distance: inputData.relativePosition.distance,
            angle: inputData.relativePosition.angle,
        }
        this.actor.timeout = inputData.detectWindow;
        this.actor.inuse = true;
    }

    update(parent) {
        if (this.actor.present) {
            const anchorVec = vecSub(parent.anchor.center, parent.anchor.corner);
            const actorVec = vecSub(this.actor.center, this.actor.corner);
            const angleBetween = -vecAngleBetween(anchorVec, actorVec);
            this.val = angleEMA(angleBetween, this.val, KNOB_EMA);
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

class Slider {
    constructor(markerData, inputData, p) {
        this.name = inputData.name;
        this.type = inputData.type;
        this.actor = markerData[inputData.actorID];
        this.val = 0;
        this.relativePosition = {
            distance: inputData.relativePosition.distance,
            angle: inputData.relativePosition.angle,
        }
        this.start = {
            distance: inputData.relativePosition.distance,
            angle: inputData.relativePosition.angle,
        }
        this.end = {
            distance: inputData.endPosition.distance,
            angle: inputData.endPosition.angle,
        }
        this.trackLength = vecMag(
            vecSub(
                vecRot(vecScale(xaxis, this.start.distance), this.start.angle), 
                vecRot(vecScale(xaxis, this.end.distance), this.end.angle)
                )
            );
        this.actor.timeout = inputData.detectWindow;
        this.actor.inuse = true;
    }

    update(parent) {
        if (this.actor.present) {
            const as = vecRot(vecScale(yaxis, this.start.distance), -this.start.angle + parent.angle - parent.cornerAngleInput);
            const aa = vecSub(parent.anchor.center, this.actor.center);
            debugVec(
                mapToScreen(parent.anchor.center),
                mapToScreen(vecAdd(parent.anchor.center, as)),
                'red'
                );
            const len = vecMag(vecSub(as, aa));
            let v = len / this.trackLength;
            v = v > 1 ? 1 : v < 0 ? 0 : v; // constraining v between 0 to 1
            this.val = calEMA(this.val, v, SLIDER_EMA);
        }
    }
    
    display(x, y, w, h) {
        ctx.beginPath();
        ctx.strokeRect(x, y, w, h);
        ctx.beginPath();
        ctx.fillRect(x, y, w*this.val, h);
    }
}

const calEMA = (newVal, oldVal, EMA) => ((newVal * EMA) + (oldVal * (1 - EMA)));

const angleEMA = (newAngle, oldAngle, EMA) => {
    const nx = Math.cos(newAngle);
    const ny = Math.sin(newAngle);
    const ox = Math.cos(oldAngle);
    const oy = Math.sin(oldAngle);
    const x = (nx * EMA) + (ox * (1 - EMA));
    const y = (ny * EMA) + (oy * (1 - EMA));
    return Math.atan2(y, x);
}
