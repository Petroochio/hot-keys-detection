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

      // HERE IS WHERE THE ARRAY OF MARKERS IS CLEMENT
      // console.log(mappedMarkers);
    }
  });

  socket.on('update image', (data) => {
    app.markerImage.src = 'data:image/png;base64,' + data.image;
  });

  const sendParam = (e) => {
    console.log(e.target.name, e.target.value);
    if (e.target.name == 'cameraIndex') {
      console.log('yes');
      socket.emit(
        'set camera',
        { camID: e.target.value }
      );
    } else {
      console.log('no');
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