function createInput(markerData, config) {
    switch(config.type) {
        case 'BUTTON':
            return new Button(markerData, config);
        case 'TOGGLE':
            return new Toggle(markerData, config);
        case 'KNOB':
            return new Knob(markerData, config);
        case 'SLIDER':
            return new Slider(markerData, config);
        default:
            console.error('No Class Found for Input of type ' + config.type);
            break;
    }
}



function rotateScaleUnitVec(vec, angle, scale) {
    return vecScale(vecRot(vecUnit(vec), angle), scale);
}

function debugVec(start, end, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
}


//----------------------------------------------
// BUTTON CLASS
//----------------------------------------------

const BUTTON_TIMEOUT = 75;
const BUTTON_EMA = 0.5;

class Button {
    constructor(markerData, config) {
        this.type = 'BUTTON';
        this.name = config.name;

        this.anchor = markerData[config.anchor];
        this.actor = markerData[config.actor];
        this.anchor.inuse = true;
        this.actor.inuse = true;
        this.actor.timeout = BUTTON_TIMEOUT;

        this.threshold = config.threshold;
        this.val = 0;
        this.center = { angle: config.centerAngle, mag: config.centerMag };
        this.size = config.size;
        this.state = false;

        this.pos = { x: 0, y: 0 }; // screen units
        this.angle = 0;
    }

    update() {
        const v = this.actor.present ? 1 : 0;
        this.val = this.val * (1-BUTTON_EMA) + v * BUTTON_EMA;
        this.state = this.val < this.threshold ? false : true;

        const cenVecRot = rotateScaleUnitVec(vecSub(this.anchor.center, this.anchor.corner), this.center.angle, this.center.mag);
        const cenPos = vecAdd(this.anchor.center, cenVecRot);

        this.pos = mapToScreen(cenPos);
        this.angle = vecAngleBetween(cenVecRot, {x:1, y:0});
    }

    display() {
        if (this.anchor.present) {
            const ellipseSize = unitToScreen(this.size);
            const textPos = { x: ellipseSize/2 + 10, y: 0 };

            // ctx is global
            ctx.save();
            
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(this.angle);

            ctx.beginPath();
            ctx.ellipse(0, 0, ellipseSize/2, ellipseSize/2, 0, 0, Math.PI*2, false);
            ctx.stroke();

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(this.name, textPos.x, textPos.y);

            if (this.state) {
                const sizeRatio = this.val*0.7 + 0.3;
                const actorSize = ellipseSize / 2 * sizeRatio;
                ctx.beginPath();
                ctx.ellipse(0, 0, actorSize, actorSize, 0, 0, Math.PI*2, false);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
}



//----------------------------------------------
// TOGGLE CLASS
//----------------------------------------------

const TOGGLE_EMA = 0.8;
const TOGGLE_TIMEOUT = 100;

class Toggle {
    constructor(markerData, config) {
        this.type = 'TOGGLE';
        this.name = config.name;

        this.anchor = markerData[config.anchor];
        this.actor = markerData[config.actor];
        this.actor.timeout = TOGGLE_TIMEOUT;
        this.anchor.inuse = true;
        this.actor.inuse = true;

        this.threshold = config.threshold;
        this.val = 0;
        this.center = { angle: config.centerAngle, mag: config.centerMag };
        this.width = config.width;
        this.height = config.height;

        this.pos = { x: 0, y: 0 }; // screen units
        this.angle = 0;

        this.direction = config.direction;
    }

    update() {
        const v = this.actor.present ? 1 : 0;
        this.val = this.val * (1-TOGGLE_EMA) + v * TOGGLE_EMA;

        const cenVecRot = rotateScaleUnitVec(vecSub(this.anchor.center, this.anchor.corner), this.center.angle, this.center.mag);
        const cenPos = vecAdd(this.anchor.center, cenVecRot);

        this.pos = mapToScreen(cenPos);
        this.angle = vecAngleBetween(cenVecRot, {x:1, y:0});
    }

    display() {
        if (this.anchor.present) {
            const vecW = vecScale({x:0.5, y:0}, unitToScreen(this.width));
            const vecH = vecScale({x:0, y:0.5}, unitToScreen(this.height));
            
            //   v0 __v01__ v1
            //     |   |   |
            //  v30|   |   |v12
            //     |___|___|
            //   v3   v23   v2

            const v0 = vecAdd(vecScale(vecW, -1), vecScale(vecH, -1));
            const v1 = vecAdd(vecScale(vecW, 1), vecScale(vecH, -1));
            const v2 = vecAdd(vecScale(vecW, 1), vecScale(vecH, 1));
            const v3 = vecAdd(vecScale(vecW, -1), vecScale(vecH, 1));

            const v01 = vecScale(vecH, -1);
            const v12 = vecScale(vecW, 1);
            const v23 = vecScale(vecH, 1);
            const v30 = vecScale(vecW, -1);

            const textPos = { x: vecW.x + 10, y: 0 };

            // ctx is global
            ctx.save();

            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(this.angle + this.direction*Math.PI/2);

            ctx.beginPath();
            ctx.moveTo(v0.x, v0.y);
            ctx.lineTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);
            ctx.lineTo(v0.x, v0.y);
            ctx.stroke();

            ctx.beginPath();
            if (this.val > 0.5) {
                ctx.moveTo(v0.x, v0.y);
                ctx.lineTo(v01.x, v01.y);
                ctx.lineTo(v23.x, v23.y);
                ctx.lineTo(v3.x, v3.y);
                ctx.lineTo(v0.x, v0.y);
            } else {
                ctx.moveTo(v1.x, v1.y);
                ctx.lineTo(v01.x, v01.y);
                ctx.lineTo(v23.x, v23.y);
                ctx.lineTo(v2.x, v2.y);
                ctx.lineTo(v1.x, v1.y);
            }
            ctx.fill();

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(this.name, textPos.x, textPos.y);

            ctx.restore();
        }
    }
}




//----------------------------------------------
// KNOB CLASS
//----------------------------------------------

const KNOB_EMA = 0.5;

class Knob {
    constructor(markerData, config) {
        this.type = 'KNOB';
        this.name = config.name;

        this.anchor = markerData[config.anchor];
        this.actor = markerData[config.actor];
        this.anchor.inuse = true;
        this.actor.inuse = true;

        this.val = 0;
        this.angleOffset = config.angleOffset;
        this.center = { angle: config.centerAngle, mag: config.centerMag };
        this.size = config.size;

        this.pos = { x: 0, y: 0 }; // screen units
        this.angle = 0;
    }

    update() {
        const v = (vecAngleBetween(vecSub(this.actor.center, this.actor.corner), vecSub(this.anchor.center, this.anchor.corner)) + Math.PI - this.angleOffset)%(2*Math.PI);
        this.val = this.val * (1-KNOB_EMA) + v * KNOB_EMA;

        const cenVecRot = rotateScaleUnitVec(vecSub(this.anchor.center, this.actor.center), this.center.angle, this.center.mag);
        const cenPos = vecAdd(this.anchor.center, cenVecRot);

        this.pos = mapToScreen(cenPos);
        this.angle = vecAngleBetween(cenVecRot, {x:1, y:0});
    }

    display() {
        if (this.anchor.present) {
            const ellipseSize = unitToScreen(this.size);
            const textPos = { x: ellipseSize/2 + 10, y: 0 };

            // ctx is global
            ctx.save();
            
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(this.angle);

            ctx.beginPath();
            ctx.ellipse(0, 0, ellipseSize/2, ellipseSize/2, 0, 0, Math.PI*2, false);
            ctx.stroke();

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(this.name, textPos.x, textPos.y);

            const actorRadius = ellipseSize / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.ellipse(0, 0, actorRadius, actorRadius, 0, 0, this.val, false);
            ctx.lineTo(0, 0);
            ctx.fill();
            
            ctx.restore();
        }
    }
}

//----------------------------------------------
// SLIDER CLASS
//----------------------------------------------

const SLIDER_EMA = 0.8;

class Slider {
    constructor(markerData, config) {
        this.type = 'SLIDER';
        this.name = config.name;

        this.anchor = markerData[config.anchor];
        this.actor = markerData[config.actor];
        this.anchor.inuse = true;
        this.actor.inuse = true;

        this.val = 0;
        this.angleAnchorStart = config.angleAnchorStart;
        this.distAnchorStart = config.distAnchorStart;
        this.angleAnchorEnd = config.angleAnchorEnd;
        this.distAnchorEnd = config.distAnchorEnd;
        this.angleAnchorCen = config.angleAnchorCen;
        this.distAnchorCen = config.distAnchorCen;
        this.width = config.width;
        this.height = config.height;

        this.pos = { x: 0, y: 0 }; // screen units
        this.angle = 0;
        this.direction = config.direction;

        // this.a;
        // this.b;
        // this.c;
        // this.d;
    }

    update() {
        const vecStart = rotateScaleUnitVec(vecSub(this.anchor.center, this.anchor.corner), this.angleAnchorStart, this.distAnchorStart);
        const vecEnd = rotateScaleUnitVec(vecSub(this.anchor.center, this.anchor.corner), this.angleAnchorEnd, this.distAnchorEnd);
        const vecSlider = vecSub(this.anchor.center, this.actor.center);
        const vecCen = rotateScaleUnitVec(vecSub(this.anchor.center, this.anchor.corner), this.angleAnchorCen, this.distAnchorCen);
        const trackVec = vecSub(vecStart, vecEnd);
        const trackLen = vecMag(trackVec);
        const curLen = vecMag(vecSub(vecStart, vecSlider));
        
        this.pos = mapToScreen(vecAdd(this.anchor.center, vecCen));
        this.angle = vecAngleBetween(trackVec, {x:0, y:-1});

        this.a = mapToScreen(vecAdd(this.anchor.center, vecStart));
        this.b = mapToScreen(vecAdd(this.anchor.center, vecEnd));
        this.c = mapToScreen(vecAdd(this.anchor.center, vecSlider));
        this.d = mapToScreen(this.anchor.center);

        //console.log(this.angle, trackVec, curLen, trackLen);
        let v = curLen / trackLen;
        v = v > 1 ? 1 : v < 0 ? 0 : v;
        if (!isNaN(v)) {
            this.val = this.val * (1-SLIDER_EMA) + v * SLIDER_EMA;
        }
    }

    display() {
        if (this.anchor.present) {
            const vecW = vecScale({x:0.5, y:0}, unitToScreen(this.width));
            const vecH = vecScale({x:0, y:0.5}, unitToScreen(this.height));
            
            //   v0 ____ v1
            //     |    |
            //  v30|----|v12
            //     |____|
            //   v3      v2

            const v0 = vecAdd(vecScale(vecW, -1), vecScale(vecH, -1));
            const v1 = vecAdd(vecScale(vecW, 1), vecScale(vecH, -1));
            const v2 = vecAdd(vecScale(vecW, 1), vecScale(vecH, 1));
            const v3 = vecAdd(vecScale(vecW, -1), vecScale(vecH, 1));

            const v12 = vecAdd(v2, vecScale(vecSub(v2, v1), this.val));
            const v30 = vecAdd(v3, vecScale(vecSub(v3, v0), this.val));

            const textPos = { x: vecW.x + 10, y: 0 };

            // ctx is global
            ctx.save();

            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(this.angle);

            ctx.beginPath();
            ctx.moveTo(v0.x, v0.y);
            ctx.lineTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);
            ctx.lineTo(v0.x, v0.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(v3.x, v3.y);
            ctx.lineTo(v30.x, v30.y);
            ctx.lineTo(v12.x, v12.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);
            ctx.fill();

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(this.name, textPos.x, textPos.y);

            ctx.restore();

            // ctx.save();
            
            // ctx.strokeStyle = 'red';
            // ctx.beginPath();
            // ctx.moveTo(this.d.x, this.d.y);
            // ctx.lineTo(this.b.x, this.b.y);
            // ctx.stroke();
            
            // ctx.strokeStyle = 'green';
            // ctx.beginPath();
            // ctx.moveTo(this.d.x, this.d.y);
            // ctx.lineTo(this.a.x, this.a.y);
            // ctx.stroke();
            
            // ctx.strokeStyle = 'blue';
            // ctx.beginPath();
            // ctx.moveTo(this.d.x, this.d.y);
            // ctx.lineTo(this.c.x, this.c.y);
            // ctx.stroke();
            // ctx.restore();

        }
    }
}
