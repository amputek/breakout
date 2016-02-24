var Renderer;

Renderer = (function() {
  var line, make, rgba, solidCircle, strokedCircle, windowHeight, windowWidth;

  windowWidth = 320;

  windowHeight = 568;

  line = function(ctx, x, y, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    return ctx.stroke();
  };

  solidCircle = function(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    return ctx.fill();
  };

  strokedCircle = function(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    return ctx.stroke();
  };

  make = function(x) {
    if (x < 0) {
      x = 0;
    }
    return x;
  };

  rgba = function(r, g, b, a) {
    if (a === void 0) {
      a = 1.0;
    }
    return 'rgba(' + Math.round(make(r)) + ',' + Math.round(make(g)) + ',' + Math.round(make(b)) + ',' + a + ')';
  };

  function Renderer(canvas, w, h) {
    windowWidth = w;
    windowHeight = h;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w;
    canvas.style.height = h;
    this.context = canvas.getContext('2d');
    this.lightcanvas = document.createElement('canvas');
    this.lightcontext = this.lightcanvas.getContext('2d');
    this.lightcontext.lineCap = 'square';
    this.lightcanvas.width = windowWidth;
    this.lightcanvas.height = windowHeight;
    this.lightgradient = this.lightcontext.createRadialGradient(0, 0, 10, 0, 0, 100);
    this.lightgradient.addColorStop(0, 'rgba(255,225,200,1.0)');
    this.lightgradient.addColorStop(0.03, 'rgba(255,220,160,1.0)');
    this.lightgradient.addColorStop(0.3, 'rgba(160,200,250,0.5)');
    this.lightgradient.addColorStop(1.0, 'rgba(0,0,0,0.0)');
    this.lightsources = [];
  }

  Renderer.prototype.addLights = function(lights) {
    var canvas, context, i, j, ref, results;
    results = [];
    for (i = j = 0, ref = lights.length - 1; j <= ref; i = j += 1) {
      canvas = document.createElement('canvas');
      context = canvas.getContext('2d');
      canvas.width = windowWidth;
      canvas.height = windowHeight;
      results.push(this.lightsources.push({
        canvas: canvas,
        context: context
      }));
    }
    return results;
  };

  Renderer.prototype.drawBackground = function() {
    this.context.fillStyle = 'rgba(0,0,0,1.0)';
    return this.context.fillRect(0, 0, windowWidth, windowHeight);
  };

  Renderer.prototype.drawLightGlow = function(i, x, y, r) {
    this.lightsources[i].context.clearRect(0, 0, windowWidth, windowHeight);
    this.lightsources[i].context.fillStyle = this.lightgradient;
    this.lightsources[i].context.save();
    this.lightsources[i].context.translate(x, y);
    this.lightsources[i].context.scale(r / 100, r / 100);
    solidCircle(this.lightsources[i].context, 0, 0, r);
    return this.lightsources[i].context.restore();
  };

  Renderer.prototype.drawLight = function(lights) {
    var i, j, ref;
    this.lightcontext.clearRect(0, 0, windowWidth, windowHeight);
    this.lightcontext.globalCompositeOperation = "lighter";
    for (i = j = 0, ref = lights.length - 1; j <= ref; i = j += 1) {
      this.lightcontext.drawImage(this.lightsources[i].canvas, 0, 0);
    }
    return this.context.drawImage(this.lightcanvas, 0, 0);
  };

  Renderer.prototype.drawShadow = function(i, s) {
    this.lightsources[i].context.strokeStyle = 'rgba(255,255,255,' + 1.0 / (s.dist * 0.05) + ')';
    this.lightsources[i].context.fillStyle = 'rgba(255,255,255,' + 1.0 / (s.dist * 0.05) + ')';
    this.lightsources[i].context.lineWidth = 15.0 / (s.dist * 0.2);
    if (s.cornerC.x !== void 0) {
      line(this.lightsources[i].context, s.cornerA.x, s.cornerA.y, s.cornerC.x, s.cornerC.y);
      line(this.lightsources[i].context, s.cornerB.x, s.cornerB.y, s.cornerC.x, s.cornerC.y);
      solidCircle(this.lightsources[i].context, s.cornerC.x, s.cornerC.y, this.lightsources[i].context.lineWidth / 2);
    } else {
      line(this.lightsources[i].context, s.cornerA.x, s.cornerA.y, s.cornerB.x, s.cornerB.y);
    }
    this.lightsources[i].context.fillStyle = '#000';
    this.lightsources[i].context.beginPath();
    this.lightsources[i].context.moveTo(s.cornerA.x, s.cornerA.y);
    if (s.cornerC !== void 0) {
      this.lightsources[i].context.lineTo(s.cornerC.x, s.cornerC.y);
    }
    this.lightsources[i].context.lineTo(s.cornerB.x, s.cornerB.y);
    this.lightsources[i].context.lineTo(s.cornerFarB.x, s.cornerFarB.y);
    this.lightsources[i].context.lineTo(s.cornerFarA.x, s.cornerFarA.y);
    return this.lightsources[i].context.fill();
  };

  Renderer.prototype.drawBall = function(x, y, r) {
    this.context.fillStyle = "white";
    return solidCircle(this.context, x, y, r);
  };

  Renderer.prototype.drawPaddle = function(x, y, w, h) {
    this.context.fillStyle = 'rgba(50,50,50,1.0)';
    this.context.beginPath();
    this.context.rect(x - w, y - h / 2, w * 2, h);
    return this.context.fill();
  };

  Renderer.prototype.drawBrick = function(type, left, top, size, dark, count) {
    var bottom, p, right;
    if (type === "brick") {
      this.context.fillStyle = 'rgba(' + dark + ',' + (dark + 5) + ',' + (dark + 5) + ',1.0)';
      this.context.beginPath();
      this.context.rect(left, top, size * 2, size * 2);
      this.context.fill();
    }
    if (type === "explosive") {
      p = Math.round(Math.sin(count) * 10);
      right = left + size * 2;
      bottom = top + size * 2;
      this.context.strokeStyle = rgba(10 + dark * 3 + p, dark * 1.5, dark * 0.0);
      this.context.fillStyle = rgba(10 + dark * 1.5, dark * 0.75, dark * 0.1);
      this.context.lineWidth = 2.0;
      this.context.beginPath();
      this.context.rect(left, top, size * 2, size * 2);
      this.context.fill();
      this.context.stroke();
      line(this.context, left + 3, top + 3, right - 3, bottom - 3);
      return line(this.context, right - 3, top + 3, left + 3, bottom - 3);
    }
  };

  Renderer.prototype.drawExplosion = function(x, y, life) {
    this.context.lineWidth = 2.0;
    this.context.strokeStyle = 'rgba(255,' + (255 - life * 3) + ',0,' + (1.0 - (life * 0.02)) + ')';
    this.context.fillStyle = 'rgba(255,' + (255 - life * 3) + ',0,' + (0.5 - (life * 0.01)) + ')';
    strokedCircle(this.context, x, y, life);
    return solidCircle(this.context, x, y, life);
  };

  Renderer.prototype.drawDebris = function(x, y, radius, angle, dark) {
    this.context.fillStyle = rgba(dark, dark + 5, dark + 5);
    this.context.beginPath();
    this.context.save();
    this.context.translate(x, y);
    this.context.rotate(angle);
    this.context.rect(0 - radius, 0 - radius, radius * 2, radius * 2);
    this.context.fill();
    return this.context.restore();
  };

  return Renderer;

})();
