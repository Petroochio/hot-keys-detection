import * as UIManager from './UIElements/UIManager';
import * as Editor from './Editor';

let prevTime = 0;

function update() {
  const timenow = Date.now();
  const dt = timenow - prevTime;
  Editor.update(timenow);
  UIManager.update(dt);

  prevTime = timenow;

  window.requestAnimationFrame(update.bind(this));
}

window.onload = () => {
  Editor.init();
  UIManager.init(Editor.getSocket());

  window.requestAnimationFrame(update.bind(this));
}
