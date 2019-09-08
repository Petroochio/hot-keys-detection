import io from 'socket.io-client';
import { initMarkers } from '../InputGenerator/Markers';
import { pointInRect } from '../InputGenerator/Utils/CollisionDetection';
import { avgCorners } from '../InputGenerator/Utils/General';
import { checkPerspective, relativePosition } from '../InputGenerator/Editor/RelativePos';
import InputGroup from '../InputGenerator/Editor/InputGroup';

function init() {
  const socket = io('localhost:5000');
  socket.on('connect', () => {
    console.log('connected to server');
    socket.emit('get inputs config')
  });

  socket.on('update markers', (data) => {
    const markers = data.markers;
    // Do marker thing here
  });
}