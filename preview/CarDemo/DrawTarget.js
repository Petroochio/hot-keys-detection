class DrawTarget {
  constructor(selector, adjustZoom) {
    this.element = document.querySelector(selector);

    this.mouseDown = false;
    this.mouseOffset = { x: 0, y: 0 };
    this.position = { x: 0, y: 0};
    this.rotation = { x: 0, y: 0, z: 0 };
    this.size = { x: 100, y: 100 }
    this.zoom = 0;

    this.element.addEventListener('mousedown', (e) => this.mouseDown = true);
    this.element.addEventListener('mouseup', (e) => {
      this.mouseDown = false;
    });
    this.element.addEventListener('mouseout', (e) => this.mouseDown = false);

    this.element.addEventListener('mousemove', (e) => {
      if (this.mouseDown) {
        this.position.x += e.movementX;
        this.position.y += e.movementY;

        this.updateStyle();
      }
    });

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
        case '-':
          adjustZoom(-5);
          break;
        case '=':
          adjustZoom(5);
          break;
        default: break;
      }

      this.updateStyle();
    });
  }

  updateStyle() {
    this.element.style.left = this.position.x + 'px';
    this.element.style.top = this.position.y + 'px';

    this.element.style.minWidth = this.size.x + 'px';
    this.element.style.minHeight = this.size.y + 'px';

    // this.element.style.perspective = this.zoom + 'px';
    this.element.style.transform = `rotateY(${this.rotation.y}deg) rotateX(${this.rotation.x}deg) rotateZ(${this.rotation.z}deg)`;
  }
}

export default DrawTarget;