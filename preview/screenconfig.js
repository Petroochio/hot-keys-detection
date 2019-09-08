const SCREEN = {
    rx: (4+14/16)*25.4, // mm (real world dimensions)
    ry: (3+14/16)*25.4, // mm (real world dimensions)
    rw: (35+12/16)*25.4, // mm (real world dimensions)
    rh: (22+0/16)*25.4, // mm (real world dimensions)
    w: window.innerWidth, // px (screen resolution)
    h: window.innerHeight, // px (screen resolution)
};


function mapToScreen(pt) {
    // if (pt.x >= SCREEN.rx && pt.x <= SCREEN.rx + SCREEN.rw && pt.y >= SCREEN.ry && pt.y <= SCREEN.ry + SCREEN.rh) {
    //     var px = pt.x - SCREEN.rx;
    //     var py = pt.y - SCREEN.ry;
    //     px = (px / SCREEN.rw) * SCREEN.w;
    //     py = (py / SCREEN.rh) * SCREEN.h;
    //     return {x:px, y:py};
    // }

    return pt;
}

function unitToScreen(val) {
    return (val / SCREEN.rw * SCREEN.w);
}