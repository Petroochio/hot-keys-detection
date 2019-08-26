import DrawTarget from './DrawTarget';
let prevTime = 0;
let zoom = 1000;
let frameParent;

function update() {
  const timenow = Date.now();
  const dt = timenow - prevTime;

  prevTime = timenow;

  window.requestAnimationFrame(update.bind(this));
}

function init() {
  frameParent = document.querySelector('#frame-parent');
  const adjustZoom = (change) => {
    zoom += change;
    frameParent.style.perspective = zoom + 'px';
  };
  const frame1 = new DrawTarget('#wireframe1', adjustZoom);
  const frame2 = new DrawTarget('#wireframe2', adjustZoom);
  const frame3 = new DrawTarget('#wireframe3', adjustZoom);

  window.requestAnimationFrame(update.bind(this));
}

window.onload = () => init();
