export class Dial {
  constructor(v, t) {
    this.pval = v;
    this.val = v;
    this.delta = t;
    this.dir = 0;
  }

  update(v) {
    this.val = v;
    const d = this.val - this.pval;
    this.dir = Math.abs(d) < this.delta ? 0 : d > 0 ? 1 : -1;
    this.pval = this.val;
  }
}

export class PushButton {
  constructor(v, t) {
    this.val = v;
    this.threshold = t;
    this.pstate = 0;
    this.state = 0;
    this.clickDown = false;
    this.clickUp = false;
  }

  update(v) {
    this.val = v;
    this.state = this.val > this.threshold ? 1 : 0;
    this.clickDown = this.state - this.pstate === 1 ? true : false;
    this.clickUp = this.state - this.pstate === -1 ? true : false;
    this.pstate = this.state;
  }
}

export class Panel1 {
  constructor(b1, k1, k2) {
    this.pushbutton = new PushButton(b1, 0.5);
    this.dial1 = new Dial(k1, 0.4);
    this.dial2 = new Dial(k2, 0.4);

    this.power = false;

    this.temp = 64;
    this.minTemp = 40;
    this.maxTemp = 98;
    this.tempDelta = 2;

    this.fan = 0.25;
    this.minFan = 0;
    this.maxFan = 1.0;
    this.fanDelta = 0.05;

    this.canvas = document.querySelector('#panel1canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.translate(0.5, 0.5);
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = 'white';
  }

  update(b1, k1, k2) {
    this.pushbutton.update(b1);
    this.dial1.update(k1);
    this.dial2.update(k2);

    this.power = this.pushbutton.clickDown ? !this.power : this.power;

    this.temp = this.dial1.dir > 0 ? this.temp + this.tempDelta : this.dial1.dir < 0 ? this.temp - this.tempDelta : this.temp;
    this.temp = this.temp > this.maxTemp ? this.maxTemp : this.temp < this.minTemp ? this.minTemp : this.temp;

    this.fan = this.dial2.dir > 0 ? this.fan + this.fanDelta : this.dial2.dir < 0 ? this.fan - this.fanDelta : this.fan;
    this.fan = this.fan > this.maxFan ? this.maxFan : this.fan < this.minFan ? this.minFan : this.fan;
  }

  display(mode) {
    if (this.power) {
      this.ctx.save();
      switch (mode) {  
        case 0:
          this.ctx.font = "13px sans-serif";
          this.ctx.textAlign = "left";
          this.ctx.textBaseline = "top";
          this.ctx.translate(0, 0);
          this.ctx.rotate(0);
          this.ctx.fillText(this.temp+' \u00B0'+'F', 0, 0);
          this.ctx.strokeRect(0, 0, 100, 30);
          this.ctx.fillRect(0, 0, 100*this.fan, 30);
          break;
      }
      this.ctx.restore();
    }
  }
}