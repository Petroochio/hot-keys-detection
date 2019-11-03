const app = {};

function init() {
  app.markerImage = document.querySelector('#marker-image');

  const socket = io('http://localhost:5000');
  app.socket = socket;

  socket.on('connect', () => {
    console.log('connected to server');
  });

  const cornerToVec = (c) => ({ x: c[0], y: c[1] });
  const mapCornersToUV = (corners) => {
    return corners.map(c => mapUVtoCellCoord(mapPointToUV(cornerToVec(c))));
  };

  const sumPoints = (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y });
  const avgCorners = (corners) => {
    const total = corners.reduce(sumPoints, { x: 0, y: 0 });

    return {
      x: total.x / corners.length,
      y: total.y / corners.length,
    };
  };

  socket.on('update markers', (data) => {
    const markers = data.markers;

    if (markers.length > 0) {
      const mappedMarkers = markers.map(m => {
        const mappedCorners = mapCornersToUV(m.corners);

        if (mappedCorners.findIndex(c => c === undefined) < 0) {
          return {
            id: m.id,
            corner: mappedCorners[0],
            midpoint: avgCorners(mappedCorners),
          };
        }
      });
    }
  });

  socket.on('update image', (data) => {
    app.markerImage.src = 'data:image/png;base64,' + data.image;
  });
  socket.on('send camera config', (data) => {
    Object.keys(data).forEach(key => {
      if (key === 'camID') {
        document.querySelector(`input[name=cameraIndex]`).value = data[key];
      } else {
        document.querySelector(`input[name=${key}]`).value = data[key];
      }
    });
  });
  socket.emit('get camera config');

  const sendParam = (e) => {
    if (e.target.name == 'cameraIndex') {
      socket.emit(
        'set camera',
        { camID: e.target.value }
      );
    } else {
      socket.emit(
        'set attribute',
        { attr: e.target.name, value: e.target.value }
      );
    }
  };

  const params = document.querySelectorAll('.parameterItem');
  for(let i = 0; i < params.length; i++) {
    params[i].addEventListener('change', sendParam)
  }
}

window.onload = init;