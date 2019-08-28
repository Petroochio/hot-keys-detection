// i and j change height
// j and l change width
// a and d rotate x
// w and s rotate y
// q and e rotate z
// - and = set perspective

class DrawTarget {
  constructor(selector, setMove, storageID) {
    this.element = document.querySelector(selector);

    this.storageID = storageID;

    const savedData = JSON.parse(localStorage.getItem(this.storageID));
    if (savedData) {
      this.position = { x: savedData.position.x, y: savedData.position.y};
      this.rotation = { x: savedData.rotation.x, y: savedData.rotation.y, z: savedData.rotation.z };
      this.size = { x: savedData.size.x, y: savedData.size.y };
    } else {
      this.position = { x: 0, y: 0};
      this.rotation = { x: 0, y: 0, z: 0 };
      this.size = { x: 100, y: 100 }
    }
    this.updateStyle();

    this.element.addEventListener('mousedown', (e) => setMove(this));

    this.element.addEventListener('keypress', (e) => {
      switch (e.key) {
        case 'j':
          this.size.x -= 1;
          break;
        case 'l':
          this.size.x += 1;
          break;
        case 'i':
          this.size.y -= 1;
          break;
        case 'k':
          this.size.y += 1;
          break;
        case 'w':
          this.rotation.x += 1;
          break;
        case 's':
          this.rotation.x -= 1;
          break;
        case 'a':
          this.rotation.y -= 1;
          break;
        case 'd':
          this.rotation.y += 1;
          break;
        case 'q':
          this.rotation.z -= 1;
          break;
        case 'e':
          this.rotation.z += 1;
          break;
      }

      this.updateStyle();
    });
  }

  updateStyle() {
    this.element.style.left = this.position.x + 'px';
    this.element.style.top = this.position.y + 'px';

    this.element.style.width = this.size.x + 'px';
    this.element.style.height = this.size.y + 'px';
    let canvas = this.element.querySelector('canvas');
    canvas.width = this.size.x;
    canvas.height = this.size.y;

    // this.element.style.perspective = this.zoom + 'px';
    this.element.style.transform = `rotateY(${this.rotation.y}deg) rotateX(${this.rotation.x}deg) rotateZ(${this.rotation.z}deg)`;

    const dataToStore = {
      position: { x: this.position.x, y: this.position.y},
      rotation: { x: this.rotation.x, y: this.rotation.y, z: this.rotation.z },
      size: { x: this.size.x, y: this.size.y },
    };
    localStorage.setItem(this.storageID, JSON.stringify(dataToStore));
  }
}

export default DrawTarget;
