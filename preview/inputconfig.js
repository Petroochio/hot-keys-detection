const INPUT_CONFIG = [
    {
        type: 'BUTTON',
        name: 'BUTTON',
        anchor: 8,
        actor: 7,
        threshold: 0.25,
        centerAngle: Math.PI*1.25, 
        centerMag: 16, 
        size: 90
    },
    {
        type: 'TOGGLE',
        name: 'TOGGLE',
        anchor: 6,
        actor: 5,
        centerAngle: Math.PI*0.75,
        centerMag: 14,
        width: 90,
        height: 90,
        direction: 1
    },
    {
        type: 'KNOB',
        name: 'KNOB',
        anchor: 3,
        actor: 2,
        angleOffset: Math.PI*0,
        centerAngle: Math.PI*0, 
        centerMag: 20, 
        size: 100
    },
    {
        type: 'SLIDER',
        name: 'SLIDER',
        anchor: 0,
        actor: 1,
        angleAnchorStart: Math.PI*1.75, // angle between vec(anchor center -> corner) and vec(anchor center -> start center)
        distAnchorStart: 26, // distance between anchor center and start center
        angleAnchorEnd: Math.PI*1.75, // angle between vec(anchor center -> corner) and vec(anchor center -> end center)
        distAnchorEnd: 85, // distance between anchor center and end center
        angleAnchorCen: Math.PI*1.75, // angle between vec(anchor center -> corner) and vec(anchor center -> center of vis)
        distAnchorCen: 60, // distance between anchor center and center of vis
        width: 40,
        height: 100,
    },
];




// toggle/slider vis directions
//
// 0 ___  1 ___  2 ___  3 ___
//  |X| |  |XXX|  | |X|  |___|
//  |X|_|  |___|  |_|X|  |XXX|




