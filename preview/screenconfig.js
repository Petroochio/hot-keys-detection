const SCREEN = {
    rx: 117, // mm (real world dimensions)
    ry: 70, // mm (real world dimensions)
    rw: (35+10/16)*25.4, // mm (real world dimensions)
    rh: (22+7/16)*25.4, // mm (real world dimensions)
    w: window.innerWidth, // px (screen resolution)
    h: window.innerHeight, // px (screen resolution)
};


function mapToScreen(pt) {
    if (pt.x >= SCREEN.rx && pt.x <= SCREEN.rx + SCREEN.rw && pt.y >= SCREEN.ry && pt.y <= SCREEN.ry + SCREEN.rh) {
        var px = pt.x - SCREEN.rx;
        var py = pt.y - SCREEN.ry;
        px = (px / SCREEN.rw) * SCREEN.w;
        py = (py / SCREEN.rh) * SCREEN.h;
        return {x:px, y:py};
    }
    // Don't return undefined
    return { x: 0, y: 0};
}

function unitToScreen(val) {
    return (val / SCREEN.rw * SCREEN.w);
}