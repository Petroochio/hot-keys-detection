const INPUT_CONFIG = [
    {
        type: 'BUTTON',
        name: 'START ?',
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
        startLength: 26,
        endLength: 85,
        centerAngle: Math.PI*1.75, 
        centerMag: 60, 
        width: 40,
        height: 100,
        direction: 1
    },
];




// toggle/slider vis directions
//
// 0 ___  1 ___  2 ___  3 ___
//  |X| |  |XXX|  | |X|  |___|
//  |X|_|  |___|  |_|X|  |XXX|

