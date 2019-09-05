export class Dial {
  constructor(v, t, db) {
    this.pval = v;
    this.val = v;
    this.delta = t;
    this.dir = 0;
    this.d = 0;
    this.debounce = db;
    this.timestamp = Date.now();
  }

  update(v) {
    this.val = v;

    if (this.val < -Math.PI*0.5 && this.pval > Math.PI*0.5) {
      this.d = ((Math.PI + this.val) + (Math.PI - this.pval));
    } else if (this.val > Math.PI*0.5 && this.pval < -Math.PI*0.5) {
      this.d = -((Math.PI - this.val) + (Math.PI + this.pval));
    } else {
      this.d = this.val - this.pval;
    }

    const timenow = Date.now();

    if (Math.abs(this.d) > this.delta && timenow - this.timestamp > this.debounce) {
      console.log(this.d);
      this.dir = this.d > 0 ? 1 : -1;
      this.pval = this.val;
      this.timestamp = Date.now();
    } else {
      this.dir = 0;
    }
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
    this.dial1 = new Dial(k1, 0.3, 400); // old thres = 0.7
    this.dial2 = new Dial(k2, 0.3, 400);

    this.power = true;

    this.temp = 64;
    this.minTemp = 40;
    this.maxTemp = 98;
    this.tempDelta = 2;

    this.fan = 0.25;
    this.minFan = 0;
    this.maxFan = 1.0;
    this.fanDelta = 0.1;

    this.canvas = document.querySelector('#panel1canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.translate(0.5, 0.5);
  }

  update(b1, k1, k2, prevpresent, present) {

    if (!prevpresent && present) {
      this.dial1.val = k1;
      this.dial1.pval = k1;
      this.dial2.val = k2;
      this.dial2.pval = k2;
      return;
    }

    if (present) {
      this.pushbutton.update(b1);
      this.dial1.update(k1);
      this.dial2.update(k2);
      this.power = this.pushbutton.clickDown ? !this.power : this.power;

      this.temp = this.dial1.dir > 0 ? this.temp + this.tempDelta : this.dial1.dir < 0 ? this.temp - this.tempDelta : this.temp;
      this.temp = this.temp > this.maxTemp ? this.maxTemp : this.temp < this.minTemp ? this.minTemp : this.temp;

      this.fan = this.dial2.dir > 0 ? this.fan + this.fanDelta : this.dial2.dir < 0 ? this.fan - this.fanDelta : this.fan;
      this.fan = this.fan > this.maxFan ? this.maxFan : this.fan < this.minFan ? this.minFan : this.fan;
    }
  }

  display(mode, bool) {
    if (this.power) {
      this.ctx.save();
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2;
      this.ctx.fillStyle = 'white';
      if (bool) {
        switch (mode) {  
          case 0:
            this.ctx.font = "50px sans-serif";
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = "top";
            this.ctx.translate(0, 0);
            this.ctx.rotate(0);
            this.ctx.fillText(this.temp+' \u00B0'+'F', 150, 70);

            this.ctx.strokeRect(300, 70, 300, 50);

            for (let i=0; i<=this.fan; i=i+this.fanDelta) {
              this.ctx.fillRect(300 + i*300, 70, 28, 50);
            }
            break;
        }
      }
      this.ctx.restore();
    }
  }

  clearCanvas() {
    this.ctx.clearRect(-10, -10, this.canvas.width+10, this.canvas.height+10);
  }
}

export class Panel2 {
  constructor(k1, b1, b2) {
    this.dial = new Dial(k1, 0.3, 200);
    this.pushbutton1 = new PushButton(b1, 0.5);
    this.pushbutton2 = new PushButton(b2, 0.5);

    this.station = 93.3;
    this.stationDelta = 1.8;
    this.stationMax = 105.9;
    this.stationMin = 87.4;

    this.volume = 0.5;
    this.volumeDelta = 0.05;

    this.canvas = document.querySelector('#panel2canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.translate(0.5, 0.5);
  }

  update(k1, b1, b2, prevpresent, present) {
    
    if (!prevpresent && present) {
      this.dial.val = k1;
      this.dial.pval = k1;
      return;
    }

    if (present) {
      this.dial.update(k1);
      this.pushbutton1.update(b1);
      this.pushbutton2.update(b2);

      this.station = this.pushbutton1.clickDown ? this.station - this.stationDelta : this.station;
      this.station = this.pushbutton2.clickDown ? this.station + this.stationDelta : this.station;
      this.station = this.station > this.stationMax ? this.stationMax : this.station < this.stationMin ? this.stationMin : this.station;

      this.volume = this.dial.dir > 0 ? this.volume + this.volumeDelta : this.dial.dir < 0 ? this.volume - this.volumeDelta : this.volume;
      this.volume = this.volume > 1 ? 1 : this.volume < 0 ? 0 : this.volume;
    }
  }

  display(mode, bool) {
    this.ctx.save();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = 'white';
    if (bool) {
      switch (mode) {  
        case 0:
          this.ctx.font = "50px sans-serif";
          this.ctx.textAlign = "left";
          this.ctx.textBaseline = "top";
          this.ctx.translate(0, 0);
          this.ctx.rotate(0);
          this.ctx.fillText(this.station.toFixed(1), 270, 100);
          this.ctx.font = "25px sans-serif";
          this.ctx.fillText('FM', 400, 100);

          this.ctx.strokeRect(500, 100, 150, 40);   
          this.ctx.fillRect(500, 100, 150*this.volume, 40);
          break;
        
        case 1:
          this.ctx.font = "50px sans-serif";
          this.ctx.textAlign = "left";
          this.ctx.textBaseline = "top";
          this.ctx.translate(0, 0);
          this.ctx.rotate(0);
          this.ctx.fillText(this.station.toFixed(1), 430, 130);
          this.ctx.font = "25px sans-serif";
          this.ctx.fillText('FM', 560, 130);

          this.ctx.strokeRect(430, 200, 230, 40);   
          this.ctx.fillRect(430, 200, 230*this.volume, 40);
      }
    }
    this.ctx.restore();
  }

  clearCanvas() {
    this.ctx.clearRect(-10, -10, this.canvas.width+10, this.canvas.height+10);
  }
}


export class Panel3 {
  constructor(s1, t1) {
    this.gearVal = s1;
    this.toggleVal = t1;

    this.gear = '';
    this.toggle = false;

    this.canvas = document.querySelector('#panel3canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.translate(0.5, 0.5);
  }

  update(s1, t1, prevpresent, present) {

    if (present) {
      this.gearVal = s1;
      this.toggleVal = t1;

      this.toggle = this.toggleVal > 0.5 ? false : true;

      if (this.gearVal < 0.1) {
        this.gear = 'P';
      } else if (this.gearVal < 0.35) {
        this.gear = 'R';
      } else if (this.gearVal < 0.6) {
        this.gear = 'N';
      } else if (this.gearVal < 0.93) {
        this.gear = 'D';
      } else {
        this.gear = 'S';
      }
    }

  }

  display(mode, bool) {
    this.ctx.save();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = 'white';
    if (bool) {
      switch (mode) {  
        case 0:
          this.ctx.font = "80px sans-serif";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "top";
          this.ctx.translate(0, 0);
          this.ctx.rotate(0);
          this.ctx.fillText(this.gear, 200, 150);
          if (this.toggle) {
            this.ctx.font = "30px sans-serif";
            this.ctx.fillText('AWD ON', 200, 250);
          }
          break;
      }
    }
    this.ctx.restore();
  }

  clearCanvas() {
    this.ctx.clearRect(-10, -10, this.canvas.width+10, this.canvas.height+10);
  }
}