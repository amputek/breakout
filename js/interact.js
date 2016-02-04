var distance, line, random, solidCircle, strokedCircle,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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

distance = function(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

random = function(a, b) {
  return (Math.random() * (b - a)) + a;
};

window.onload = function() {
  var Ball, Brick, Debris, Explosion, ExplosiveBrick, LightSource, Player, ball, ballIntercept, blockSize, bricks, bricksLeft, calculateCorners, canvas, completeLevel, context, d, debris, delayers, destroyBrick, draw, dt, explosions, gap, intercept, j, k, levelup, light, lightcanvas, lightcontext, lights, mouseDown, mouseXY, mx, paused, player, shake, startTime, stats, wallCollision, x, y;
  Player = (function() {
    function Player() {
      this.x = 100;
      this.y = 500;
      this.width = 100;
      this.height = 10;
      this.left = this.x - 50;
      this.right = this.x + 50;
      this.top = this.y - this.height / 2;
      this.bottom = this.y + this.height / 2;
      this.vx = 0;
    }

    Player.prototype.draw = function() {
      this.vx = mx - x;
      this.x = mx;
      context.fillStyle = 'rgba(50,50,50,1.0)';
      context.beginPath();
      context.rect(this.x - this.width, this.y - this.height / 2, this.width * 2, this.height);
      context.fill();
      this.left = this.x - this.width;
      return this.right = this.x + this.width;
    };

    return Player;

  })();
  Debris = (function() {
    function Debris(x5, y5, vx1, vy1) {
      this.x = x5;
      this.y = y5;
      this.vx = vx1;
      this.vy = vy1;
      this.radius = Math.random() * 4;
      this.dark = 10;
      this.vr = random(-0.2, 0.2);
      this.angle = 0;
    }

    Debris.prototype.incDark = function(dist) {
      return this.dark += Math.round(255 / (dist * 0.1));
    };

    Debris.prototype.draw = function() {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.angle += this.vr;
      this.vy += 1.5;
      context.fillStyle = 'rgba(' + this.dark + ',' + this.dark + ',' + this.dark + ',1.0)';
      context.beginPath();
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.rect(0 - this.radius, 0 - this.radius, this.radius * 2, this.radius * 2);
      context.fill();
      context.restore();
      return this.dark = 10;
    };

    return Debris;

  })();
  Ball = (function() {
    function Ball() {
      this.x = 200;
      this.y = 400;
      this.vx = 2.0;
      this.vy = -20.0;
      this.radius = 5;
    }

    Ball.prototype.draw = function() {
      if (paused === false) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
      }
      context.fillStyle = '#fff';
      return solidCircle(context, this.x, this.y, this.radius);
    };

    return Ball;

  })();
  Brick = (function() {
    function Brick(x5, y5) {
      this.x = x5;
      this.y = y5;
      this.dark = 0;
      this.left = this.x - blockSize;
      this.right = this.x + blockSize;
      this.top = this.y - blockSize;
      this.bottom = this.y + blockSize;
      this.width = blockSize;
      this.height = blockSize;
      this.glow = 0;
    }

    Brick.prototype.incDark = function(dist) {
      return this.dark += Math.round(255 / (dist * 0.1));
    };

    Brick.prototype.draw = function() {
      context.fillStyle = 'rgba(' + this.dark + ',' + this.dark + ',' + (this.dark + 1) + ',1.0)';
      context.beginPath();
      context.rect(this.left, this.top, blockSize * 2, blockSize * 2);
      context.fill();
      return this.dark = 0;
    };

    return Brick;

  })();
  ExplosiveBrick = (function(superClass) {
    extend(ExplosiveBrick, superClass);

    function ExplosiveBrick(x5, y5) {
      this.x = x5;
      this.y = y5;
      ExplosiveBrick.__super__.constructor.call(this, this.x, this.y);
      this.count = 0;
      this.gradient = context.createRadialGradient(0, 0, 8, 0, 0, 40);
      this.gradient.addColorStop(0, 'rgba(255,220,160,0.1)');
      this.gradient.addColorStop(0.4, 'rgba(200,20,20,0.05)');
      this.gradient.addColorStop(1, 'rgba(0,0,0,0.0)');
    }

    ExplosiveBrick.prototype.drawGlow = function() {
      lightcontext.fillStyle = this.gradient;
      lightcontext.save();
      lightcontext.translate(this.x, this.y);
      solidCircle(lightcontext, 0, 0, 40);
      return lightcontext.restore();
    };

    ExplosiveBrick.prototype.draw = function() {
      var pulse;
      this.count += 0.1;
      pulse = Math.round(Math.sin(this.count) * 50);
      context.strokeStyle = 'rgba(' + (200 + this.dark + pulse) + ',' + (100 + this.dark + pulse) + ',' + (this.dark + pulse) + ',0.4)';
      context.lineWidth = 2.0;
      context.fillStyle = 'rgba(' + (100 + this.dark) + ',' + (0 + this.dark) + ',' + (this.dark + 1) + ',1.0)';
      context.beginPath();
      context.rect(this.left, this.top, blockSize * 2, blockSize * 2);
      context.fill();
      context.stroke();
      line(context, this.left + 3, this.top + 3, this.right - 3, this.bottom - 3);
      line(context, this.right - 3, this.top + 3, this.left + 3, this.bottom - 3);
      return this.dark = 0;
    };

    return ExplosiveBrick;

  })(Brick);
  Explosion = (function() {
    function Explosion(x5, y5) {
      this.x = x5;
      this.y = y5;
      this.life = 0;
    }

    Explosion.prototype.draw = function() {
      this.life += 2.0;
      context.lineWidth = 2.0;
      context.strokeStyle = 'rgba(255,255,255,' + (1.0 - (this.life * 0.02)) + ')';
      return strokedCircle(context, this.x, this.y, this.life);
    };

    return Explosion;

  })();
  LightSource = (function() {
    function LightSource(x5, y5, radius) {
      this.x = x5;
      this.y = y5;
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
  levelup = document.getElementById('levelup');
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  context.lineJoin = "round";
  lightcanvas = document.createElement('canvas');
  lightcontext = lightcanvas.getContext('2d');
  lightcontext.lineCap = 'square';
  lightcanvas.width = 320;
  lightcanvas.height = 568;
  d = new Date();
  startTime = d.getTime();
  paused = false;
  mx = 0;
  dt = 0.3;
  bricks = [];
  debris = [];
  explosions = [];
  delayers = [];
  shake = 0;
  blockSize = 6;
  bricksLeft = 0;
  player = new Player();
  ball = new Ball();
  lights = [];
  lights.push(new LightSource(ball.x, ball.y, 100));
  gap = blockSize * 2 + 3;
  for (x = j = 3; j <= 18; x = j += 1) {
    for (y = k = 3; k <= 14; y = k += 1) {
      if (x !== 13 && x !== 8 && y !== 8 && y !== 9) {
        bricksLeft++;
        if (Math.random() < 0.1) {
          bricks.push(new ExplosiveBrick(x * gap, y * gap));
        } else {
          bricks.push(new Brick(x * gap, y * gap));
        }
      }
    }
  }
  stats = new Stats();
  stats.setMode(0);
  document.body.appendChild(stats.domElement);
  completeLevel = function() {
    $(levelup).css('opacity', '1.0');
    return $(levelup).css('left', '0px');
  };
  mouseXY = function(e) {
    return mx = e.pageX;
  };
  mouseDown = function(e) {
    return e.preventDefault();
  };
  canvas.addEventListener("touchstart", mouseDown, false);
  canvas.addEventListener("mousemove", mouseXY, true);
  canvas.addEventListener("touchmove", mouseXY, true);
  canvas.addEventListener("mousedown", mouseDown, false);
  ballIntercept = function(bal, rec, nx, ny) {
    var pt;
    pt = null;
    if (nx < 0) {
      pt = intercept(bal.x, bal.y, bal.x + nx, bal.y + ny, rec.right + bal.radius, rec.top - bal.radius, rec.right + bal.radius, rec.bottom + bal.radius, "right");
    } else if (nx > 0) {
      pt = intercept(bal.x, bal.y, bal.x + nx, bal.y + ny, rec.left - bal.radius, rec.top - bal.radius, rec.left - bal.radius, rec.bottom + bal.radius, "left");
    }
    if (pt === null) {
      if (ny < 0) {
        pt = intercept(bal.x, bal.y, bal.x + nx, bal.y + ny, rec.left - bal.radius, rec.bottom + bal.radius, rec.right + bal.radius, rec.bottom + bal.radius, "bottom");
      } else if (ny > 0) {
        pt = intercept(bal.x, bal.y, bal.x + nx, bal.y + ny, rec.left - bal.radius, rec.top - bal.radius, rec.right + bal.radius, rec.top - bal.radius, "top");
      }
    }
    return pt;
  };
  intercept = function(x1, y1, x2, y2, x3, y3, x4, y4, d) {
    var denom, result, ua, ub;
    denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
    if (denom !== 0) {
      ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
      if ((ua >= 0) && (ua <= 1)) {
        ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
        if ((ub >= 0) && (ub <= 1)) {
          x = x1 + (ua * (x2 - x1));
          y = y1 + (ua * (y2 - y1));
          result = [];
          result.x = x;
          result.y = y;
          result.d = d;
          return result;
        }
      }
    }
    return null;
  };
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
    var con, dist, i, l, m, n, o, p, ref, ref1, ref2, results;
    lightcontext.clearRect(0, 0, 320, 568);
    lightcontext.globalCompositeOperation = "lighter";
    results = [];
    for (i = l = 0, ref = lights.length - 1; l <= ref; i = l += 1) {
      con = lights[i].tempcontext;
      lights[i].draw();
      dist = distance(ball.x, ball.y, player.x, player.y);
      calculateCorners(lights[0], player, 100, dist, con);
      for (n = m = 0, ref1 = bricks.length - 1; m <= ref1; n = m += 1) {
        o = bricks[n];
        dist = distance(o.x, o.y, lights[i].x, lights[i].y);
        o.incDark(dist);
        calculateCorners(lights[i], o, lights[i].radius, distance(o.x, o.y, lights[i].x, lights[i].y), con);
      }
      for (n = p = 0, ref2 = debris.length - 1; p <= ref2; n = p += 1) {
        debris[n].incDark(distance(debris[n].x, debris[n].y, lights[i].x, lights[i].y));
      }
      results.push(lightcontext.drawImage(lights[i].tempcanvas, 0, 0));
    }
    return results;
  };
  wallCollision = function() {
    if (ball.y < 10) {
      ball.y = 10;
      ball.vy = -ball.vy;
    }
    if (ball.x > 310) {
      ball.x = 310;
      ball.vx = -ball.vx;
    }
    if (ball.x < 10) {
      ball.x = 10;
      return ball.vx = -ball.vx;
    }
  };
  destroyBrick = function(brick, source) {
    var angle, i, l, m, n, ref, vx, vy;
    for (i = l = 0, ref = bricks.length - 1; l <= ref; i = l += 1) {
      if (bricks[i] === brick) {
        bricks.splice(i, 1);
      }
    }
    angle = Math.atan2(brick.y - source.y, brick.x - source.x);
    for (n = m = 0; m <= 4; n = m += 1) {
      vx = Math.cos(angle) * 20 + random(-5, 5);
      vy = Math.sin(angle) * 20 + random(-5, 5);
      debris.push(new Debris(brick.x + random(-blockSize, blockSize), brick.y + random(-blockSize, blockSize), vx, vy));
    }
    bricksLeft--;
    if (bricksLeft === 0) {
      completeLevel();
      return paused = true;
    }
  };
  draw = function() {
    var a, b, b2, collision, dist, dremovers, i, l, m, n, p, paddle, q, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, rem, removers, s, t, u, v, w;
    stats.begin();
    context.fillStyle = 'rgba(0,0,0,1.0)';
    context.fillRect(0, 0, 320, 568);
    if (shake > 0) {
      $('canvas').css('margin-left', random(-shake, shake) + 'px');
      $('canvas').css('margin-top', random(-shake, shake) + 'px');
      shake--;
    }
    light();
    context.drawImage(lightcanvas, 0, 0);
    removers = [];
    dremovers = [];
    for (i = l = 0, ref = delayers.length - 1; l <= ref; i = l += 1) {
      delayers[i].delay--;
      if (delayers[i].delay <= 0) {
        rem = [];
        rem.source = delayers[i].source;
        rem.brick = delayers[i].brick;
        removers.push(rem);
        dremovers.push(delayers[i]);
      }
    }
    for (i = m = 0, ref1 = dremovers.length - 1; m <= ref1; i = m += 1) {
      delayers.splice(delayers.indexOf(dremovers[i]), 1);
    }
    for (i = p = 0, ref2 = bricks.length - 1; p <= ref2; i = p += 1) {
      b = bricks[i];
      b.draw();
      collision = ballIntercept(ball, b, ball.vx * dt, ball.vy * dt);
      if (collision !== null) {
        if (collision.d === "left" || collision.d === "right") {
          ball.x = collision.x;
          ball.vx = -ball.vx;
        }
        if (collision.d === "top" || collision.d === "bottom") {
          ball.y = collision.y;
          ball.vy = -ball.vy;
        }
        rem = [];
        rem.source = ball;
        rem.brick = b;
        removers.push(rem);
        if (bricks[i] instanceof ExplosiveBrick) {
          shake += 5;
          explosions.push(new Explosion(b.x, b.y));
          for (n = q = 0, ref3 = bricks.length - 1; q <= ref3; n = q += 1) {
            if (n !== i) {
              b2 = bricks[n];
              if (Math.random() < 1.0) {
                dist = distance(b.x, b.y, b2.x, b2.y);
                if (dist < 50) {
                  rem = [];
                  rem.delay = Math.round(dist * 0.4);
                  rem.source = b;
                  rem.brick = b2;
                  delayers.push(rem);
                }
              }
            }
          }
        }
      }
    }
    for (i = s = 0, ref4 = removers.length - 1; s <= ref4; i = s += 1) {
      a = removers[i].brick;
      destroyBrick(a, removers[i].source);
    }
    wallCollision();
    paddle = ballIntercept(ball, player, ball.vx * dt, ball.vy * dt);
    if (paddle !== null) {
      ball.y = paddle.y;
      ball.vy = -ball.vy;
      ball.vx += player.vx * 0.01;
    }
    ball.draw();
    lights[0].x = ball.x;
    lights[0].y = ball.y;
    player.draw();
    removers = [];
    for (i = t = 0, ref5 = debris.length - 1; t <= ref5; i = t += 1) {
      debris[i].draw();
      if (debris[i].y > 568) {
        removers.push(i);
      }
    }
    for (i = u = 0, ref6 = removers.length - 1; u <= ref6; i = u += 1) {
      debris.splice(removers[i], 1);
    }
    removers = [];
    for (i = v = 0, ref7 = explosions.length - 1; v <= ref7; i = v += 1) {
      explosions[i].draw();
      if (explosions[i].life >= 50) {
        removers.push(explosions[i]);
      }
    }
    for (i = w = 0, ref8 = removers.length - 1; w <= ref8; i = w += 1) {
      explosions.splice(explosions.indexOf(removers[i]), 1);
    }
    return stats.end();
  };
  return setInterval(draw, 1000 / 30);
};
