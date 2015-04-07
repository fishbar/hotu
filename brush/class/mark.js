'use strict';
//发光笔触
// 'lineCap': 'round',
// 'lineJoin': 'miter',
define(function() {
  return {
    initOpt: {
      'id': 'mark',
      'name': '马克笔',
      'desc': '钢笔',
      'globalCompositeOperation': 'source-over',
      'lineJoin': 'miter',
      'lineCap': 'butt',
      'smooth': {
        'x': {
          'f': 'Sinusoidal.In',
          'N': 6
        },
        'y': {
          'f': 'Sinusoidal.In',
          'N': 6
        },
        'width': {
          'f': 'Sinusoidal.Out',
          'N': 8
        }
      },
      'hue': 320,
      'opacity': 0.3,
      'color': {
        'light': 50,
        'sat': 100,
        'color': 'hsla(320,100%,50%,1)',
        'hue': 320,
        'opacity':0.3
      },
      'widthMax': 10,
      'controls': {
        'widthMax': {
          'set': function(value) {
            return (value - 1) / 35;
          },
          'get': function(ki) {
            return 1 + ki * 35;
          },
          'constructorUI': 'Slider',
          'descUI': '粗细',
          'containerName': 'shape'
        },
        'opacity': {
          'set': function(v) {
            return v;
          },
          'get': function(v) {
            return v;
          },
          'constructorUI': 'Slider',
          'descUI': '透明',
          'containerName': 'color'
        },
        'hue': {
          'set': function(value) {
            return value / 360;
          },
          'get': function(ki) {
            return 360 * ki;
          },
          'constructorUI': 'HueSlider',
          'containerName': 'color'
        },
        'color': {
          'set': function(c) {
            return c;
            ////////?////////?////////?////////?////////?////////?////////?////////?////////?
          },
          'get': function(v) {
            return v;
          }, //ki为传入的参数
          'constructorUI': 'LightSatSelector',
          'containerName': 'color'
        }
      }
    },
    begin:function(){
      this.secondBol = true;
    },
    second: function(opt) { //补上一个点
      var color = this.color;
      if (!color) return console.log('normal brush 没有颜色');
      color = color.color;
      var ctx = this.ctx;
      var widthMax = this.widthMax;
      this.secondBol = false;
      var widthPrev = this.widthPrev;
      var xp = this.xp;
      var yp = this.yp;
      var dx = this.dx;
      var dy = this.dy;
      var reverseBol = 0;
      var e = 0.00000001;
      if (dx >= e) {
        reverseBol = 1;
      } else if (Math.abs(dx) < e && dy < 0) {
        reverseBol = 1;
      }
      var phiHori = Math.atan2(this.sinp, this.cosp);
      if (phiHori >= 0) {
        phiHori = phiHori - Math.PI;
      }
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(xp, yp, widthPrev, phiHori, phiHori + Math.PI, reverseBol);
      ctx.fill();
      ctx.closePath();
    },
    draw: function(opt) {
      var ctx = this.ctx = opt.ctx || this.ctx;
      var color = this.color;
      if (!color) return console.log('normal brush 没有颜色');
      color = color.color;
      var Easing = this.Easing;
      var record = opt.record || {};
      var pt = opt.pt || {};

      var speed = record.speed || 3; //速度

      var speedPhi = speed / 6000;
      speedPhi = (speedPhi < 1) ? speedPhi : 1;
      var ki = Easing.Sinusoidal.In(1 - speedPhi);
      ki = Math.pow(ki, 2);
      var kFinal = this.getSmooth('width', ki);
      kFinal = (kFinal < 0) ? 0 : kFinal;

      var widthMax = this.widthMax;
      var width = widthMax * kFinal;
      width = (width < 1) ? 1 : width;
      var widthPrev = this.widthPrev || width;

      var x = pt[0];
      x = this.getSmooth('x', x);
      var y = pt[1];
      y = this.getSmooth('y', y);

      var xp = this.xp;
      var yp = this.yp;
      if (xp !== null && xp !== undefined && yp !== null && yp !== undefined) {
        var dx = this.dx = x - xp;
        var dy = this.dy = y - yp;
        var l = Math.sqrt(dy * dy + dx * dx);
        var cos, sin;

        if (l) {
          cos = this.cos = dy / l;
          sin = this.sin = -dx / l;
        }
        var cosp = this.cosp;
        var sinp = this.sinp;

        if (cosp !== undefined && cosp !== null && sinp !== undefined && sinp !== null) {
          if (this.secondBol) {
            this.second(opt);
          }
          var p1x = xp + widthPrev * cosp;
          var p1y = yp + widthPrev * sinp;
          var p2x = xp - widthPrev * cosp;
          var p2y = yp - widthPrev * sinp;
          var p3x = x - width * cos;
          var p3y = y - width * sin;
          var p4x = x + width * cos;
          var p4y = y + width * sin;
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.strokeStyle = color;
          ctx.moveTo(xp, yp);
          ctx.lineTo(p1x, p1y);
          ctx.lineTo(p4x, p4y);
          ctx.lineTo(p3x, p3y);
          ctx.lineTo(p2x, p2y);
          ctx.lineTo(xp, yp);
          ctx.fill();
          ctx.closePath();
        }
        this.cosp = cos;
        this.sinp = sin;
      }

      this.widthPrev = width;
      this.yp = y;
      this.xp = x;
    },
    end: function() {
      var color = this.color;
      if (!color) return console.log('normal brush 没有颜色');
      color = color.color;
      var ctx = this.ctx;
      this.secondBol = false;
      var widthPrev = this.widthPrev;
      var scaleList = this.scaleList;
      var x = this.xp;
      var y = this.yp;
      var dx = this.dx;
      var dy = this.dy;
      var reverseBol = 1;
      var e = 0.00000001;
      if (dx >= e) {
        reverseBol = 0;
      } else if (Math.abs(dx) < e && dy < 0) {
        reverseBol = 0;
      }
      var phiHori = Math.atan2(this.sin, this.cos);
      if (phiHori >= 0) {
        phiHori = phiHori - Math.PI;
      }

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, widthPrev, phiHori, phiHori + Math.PI, reverseBol);
      ctx.fill();
      ctx.closePath();

      this.widthPrev = null;
      this.yp = null;
      this.xp = null;
      this.cosp = null;
      this.sinp = null;

    },
    buttonStyle: function(node) {
      node.css({
        'textShadow': '0 0 9px #707',
        'color': '#f9f'
      });
    }
  };
});
