let canvas, ctx, socket, frame;
let imgW, imgH;
let markerData;

let isSelectMode, selectTarget;

function update() {
  let timenow = Date.now();

  ctx.clearRect(-10, -10, canvas.width + 10, canvas.height + 10);
  markerData.forEach(m => m.checkPresence(timenow));
  markerData.forEach(m => m.display());

  ctx.beginPath();
  ctx.ellipse(20, 20, 10, 10, 0, 0, Math.PI*2, false);
  ctx.fill();
  // idk if there will be scope issues, but I'm avoiding them anyway
  window.requestAnimationFrame(update.bind(this));
}


window.onload = () => {
  canvas = document.querySelector('canvas');
  frame = document.querySelector('#frame');
  ctx = canvas.getContext('2d');
  initMarkers();

  canvas.addEventListener('mousemove', (e) => {
    const mousePt = { x: e.offsetX, y: e.offsetY };
    markerData.forEach(m => {
      if (m.present) m.shouldFill = pointInRect(mousePt, m.allCorners);
    });
  });

  canvas.addEventListener('click', (e) => {
    if (isSelectMode) {
      const mousePt = { x: e.offsetX, y: e.offsetY };
      markerData.forEach(m => {
        if (m.present && !m.inuse) {
          if (pointInRect(mousePt, m.allCorners)) {
            selectTarget.value = m.id;
            m.inuse = true;
            isSelectMode = false;
          }
        };
      });
    }
  });

  document.querySelector('#add-input').addEventListener('click', e => {
    document.querySelector('.input-group-div').appendChild(createNewInputGroup());
  });

  socket = io.connect('localhost:5000');
  socket.on('update image', (data) => {
    frame.src = 'data:image/png;base64,' + data.image;

    if (frame.width !== canvas.width) {
      canvas.width = frame.width;
      canvas.height = frame.height;
    }
  });

  socket.on('update markers', (data) => {
    const markers = data.markers;

    if (markers.length > 0) {
      const mappedMarkers = markers.map(m => {
        // const mappedCorners = mapCornersToUV(m.corners);
        // include naive conversion here in library
        const mappedCorners = m.corners.map(c =>
          ({ x: c[0] / 1280 * canvas.width, y: c[1] / 720 * canvas.height })
        );

        // if (mappedMarkers.findIndex(c => c === undefined) < 0) {
          return {
            id: m.id,
            corner: mappedCorners[0],
            center: avgCorners(mappedCorners),
            allCorners: mappedCorners,
          };
        // }
      });

      // HERE IS WHERE THE ARRAY OF MARKERS IS CLEMENT
      // MappedMarkers
      const timenow = Date.now();

      mappedMarkers.forEach(m => {
        if (m !== undefined) {
          markerData[m.id].update(m, timenow);
        }
      });
    }
  });

  window.requestAnimationFrame(update.bind(this));
}