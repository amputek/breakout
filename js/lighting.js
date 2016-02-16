var LightSource, calculateCorners, light;

LightSource = (function() {
  function LightSource(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.tempcanvas = document.createElement('canvas');
    this.tempcontext = this.tempcanvas.getContext('2d');
    this.tempcanvas.width = lightcanvas.width;
    this.tempcanvas.height = lightcanvas.height;
    this.gradient = context.createRadialGradient(0, 0, 10, 0, 0, this.radius);
    this.gradient.addColorStop(0, 'rgba(255,220,160,1.0)');
    this.gradient.addColorStop(0.3, 'rgba(160,200,250,0.5)');
    this.gradient.addColorStop(1, 'rgba(0,0,0,0.0)');
  }

  LightSource.prototype.draw = function() {
    this.tempcontext.clearRect(0, 0, 320, 568);
    this.tempcontext.fillStyle = this.gradient;
    this.tempcontext.save();
    this.tempcontext.translate(this.x, this.y);
    solidCircle(this.tempcontext, 0, 0, this.radius);
    return this.tempcontext.restore();
  };

  return LightSource;

})();

calculateCorners = function(source, center, limit, dist, ctx) {
  var angle, bottom, ex, ex1, ey, ey1, fx, fx1, fy, fy1, left, newangle, newangle1, right, top;
  if (dist < limit) {
    left = center.left;
    right = center.right;
    top = center.top;
    bottom = center.bottom;
    angle = Math.atan2(center.y - source.y, center.x - source.x);
    ctx.strokeStyle = 'rgba(255,255,255,' + 1.0 / (dist * 0.05) + ')';
    ctx.lineWidth = 15.0 / (dist * 0.2);
    if (source.y < center.y && Math.abs(center.x - source.x) < center.width) {
      ex = left;
      ey = top;
      ex1 = right;
      ey1 = top;
      line(ctx, ex, ey, ex1, ey1);
    } else if (source.y > center.y && Math.abs(center.x - source.x) < center.width) {
      ex = left;
      ey = bottom;
      ex1 = right;
      ey1 = bottom;
      line(ctx, ex, ey, ex1, ey1);
    } else if (source.x < center.x && Math.abs(center.y - source.y) < center.height) {
      ex = left;
      ey = bottom;
      ex1 = left;
      ey1 = top;
      line(ctx, ex, ey, ex1, ey1);
    } else if (source.x > center.x && Math.abs(center.y - source.y) < center.height) {
      ex = right;
      ey = bottom;
      ex1 = right;
      ey1 = top;
      line(ctx, ex, ey, ex1, ey1);
    } else if (angle > 0 && angle < Math.PI / 2) {
      ex = left;
      ey = bottom;
      ex1 = right;
      ey1 = top;
      line(ctx, left, bottom, left, top);
      line(ctx, left, top, right, top);
    } else if (angle > Math.PI / 2 && angle < Math.PI) {
      ex = left;
      ey = top;
      ex1 = right;
      ey1 = bottom;
      line(ctx, left, top, right, top);
      line(ctx, right, top, right, bottom);
    } else if (angle > -Math.PI && angle < -Math.PI / 2) {
      ex = right;
      ey = top;
      ex1 = left;
      ey1 = bottom;
      line(ctx, right, top, right, bottom);
      line(ctx, right, bottom, left, bottom);
    } else if (angle > -Math.PI / 2 && angle < 0) {
      ex = right;
      ey = bottom;
      ex1 = left;
      ey1 = top;
      line(ctx, right, bottom, left, bottom);
      line(ctx, left, bottom, left, top);
    }
    newangle = Math.atan2(ey - source.y, ex - source.x);
    fx = source.x + Math.cos(newangle) * limit;
    fy = source.y + Math.sin(newangle) * limit;
    newangle1 = Math.atan2(ey1 - source.y, ex1 - source.x);
    fx1 = source.x + Math.cos(newangle1) * limit;
    fy1 = source.y + Math.sin(newangle1) * limit;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex1, ey1);
    ctx.lineTo(fx1, fy1);
    ctx.lineTo(fx, fy);
    ctx.fillStyle = '#000';
    return ctx.fill();
  }
};

light = function() {
  var con, dist, i, j, k, l, n, o, ref, ref1, ref2, results;
  lightcontext.clearRect(0, 0, 320, 568);
  lightcontext.globalCompositeOperation = "lighter";
  results = [];
  for (i = j = 0, ref = lights.length - 1; j <= ref; i = j += 1) {
    con = lights[i].tempcontext;
    lights[i].draw();
    dist = distance(ball.x, ball.y, player.x, player.y);
    calculateCorners(lights[0], player, 1500, dist, con);
    for (n = k = 0, ref1 = bricks.length - 1; k <= ref1; n = k += 1) {
      o = bricks[n];
      dist = distance(o.x, o.y, lights[i].x, lights[i].y);
      o.incDark(dist);
      calculateCorners(lights[i], o, lights[i].radius, distance(o.x, o.y, lights[i].x, lights[i].y), con);
    }
    for (n = l = 0, ref2 = debris.length - 1; l <= ref2; n = l += 1) {
      debris[n].incDark(distance(debris[n].x, debris[n].y, lights[i].x, lights[i].y));
    }
    results.push(lightcontext.drawImage(lights[i].tempcanvas, 0, 0));
  }
  return results;
};
