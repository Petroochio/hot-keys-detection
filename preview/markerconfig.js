const MARKER_COUNT = 100;
const MARKER_TIMEOUT = 300;
const CENTER_SMOOTH_THRESHOLD = 1;
const CORNER_SMOOTH_THRESHOLD = 3;
const SMOOTH_HEAVY = 0.2; // 0-1, lower the value to get more smoothing
const SMOOTH_LIGHT = 0.75;

class Marker {
    constructor(id) {
        this.id = id;
        this.inuse = false;
        this.present = false;
        this.timestamp = 0;
        this.timeout = MARKER_TIMEOUT;
        this.center = {x:0, y:0};
        this.corner = {x:0, y:0};
        this.allCorners = [];
        this.centerSmoothThreshold = 1;
        this.cornerSmoothThreshold = 3
    }

    update(marker, timenow) {
        if (this.present) {
            const centerDelta = vecMag(vecSub(this.center, marker.center));
            const cornerDelta = vecMag(vecSub(this.corner, marker.corner));
            const centerSmooth = centerDelta > this.centerSmoothThreshold ? SMOOTH_LIGHT : SMOOTH_HEAVY;
            const cornerSmooth = cornerDelta > this.cornerSmoothThreshold ? SMOOTH_LIGHT : SMOOTH_HEAVY;
            this.timestamp = timenow;
            this.center = vecEMA(this.center, marker.center, centerSmooth);
            this.corner = vecEMA(this.corner, marker.corner, cornerSmooth);
            this.allCorners = marker.allCorners.map((m) => (m));
        } else {
            this.present = true;
            this.timestamp = timenow;
            this.center = marker.center;
            this.corner = marker.corner;
        }
    }

    checkPresence(timenow) {
        this.present = (timenow - this.timestamp) > this.timeout ? false : true;
    }

    display(size) {
        if (this.present && !this.inuse) {
            const posCen = mapToScreen(this.center);
            const posCor = mapToScreen(this.corner);
            const vecCenCor0 = vecUnit(vecSub(posCen, posCor));
            const vecCenCor1 = vecRot90(vecCenCor0);
            const vecCenCor2 = vecRot90(vecCenCor1);
            const vecCenCor3 = vecRot90(vecCenCor2);
            const cor0 = vecAdd(posCen, vecScale(vecCenCor0, size/2));
            const cor1 = vecAdd(posCen, vecScale(vecCenCor1, size/2));
            const cor2 = vecAdd(posCen, vecScale(vecCenCor2, size/2));
            const cor3 = vecAdd(posCen, vecScale(vecCenCor3, size/2));
            
            // ctx is global
            ctx.beginPath();
            ctx.moveTo(Math.round(cor0.x), Math.round(cor0.y));
            ctx.lineTo(Math.round(cor1.x), Math.round(cor1.y));
            ctx.lineTo(Math.round(cor2.x), Math.round(cor2.y));
            ctx.lineTo(Math.round(cor3.x), Math.round(cor3.y));
            ctx.lineTo(Math.round(cor0.x), Math.round(cor0.y));
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(Math.round(cor0.x), Math.round(cor0.y), 2.5, 2.5, 0, 0, Math.PI*2, false);
            ctx.fill();

            const textPos = vecAdd(posCen, vecScale(vecCenCor0, size/2*1.5));
            ctx.fillText(this.id, textPos.x, textPos.y);
        }
    }
}

function initMarkers() {
    markerData = [];
    for (let i=0; i<MARKER_COUNT; i++) {
        markerData.push(new Marker(i));
    }
}