var Ball, Brick, BricksManager, Debris, Explosion, ExplosiveBrick, Physics, Player, ball, bricks, canvas, cleanGarbage, context, debris, draw, dt, explosions, lighting, mouseDown, mouseXY, mx, paused, physics, player, shake, stats,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

canvas = null;

context = null;

paused = false;

mx = 0;

dt = 0.3;

debris = [];

explosions = [];

shake = 0;

player = null;

ball = null;

stats = null;

physics = null;

lighting = null;

bricks = null;

cleanGarbage = function(collection, isDead) {
  var i, j, k, ref, ref1, removers;
  removers = [];
  for (i = j = 0, ref = collection.length - 1; j <= ref; i = j += 1) {
    if (isDead(collection[i])) {
      removers.push(collection[i]);
    }
  }
  for (i = k = 0, ref1 = removers.length - 1; k <= ref1; i = k += 1) {
    collection.splice(collection.indexOf(removers[i]), 1);
  }
  return collection;
};

BricksManager = (function() {
  function BricksManager(blockSize1) {
    this.blockSize = blockSize1;
    this.bricksLeft = 0;
    this.bricks = [];
    this.bricksToKill = [];
  }

  BricksManager.prototype.setup = function() {
    var gap, j, results, x, y;
    gap = this.blockSize * 2 + 3;
    results = [];
    for (x = j = 3; j <= 18; x = j += 1) {
      results.push((function() {
        var k, results1;
        results1 = [];
        for (y = k = 3; k <= 14; y = k += 1) {
          if (x !== 13 && x !== 8 && y !== 8 && y !== 9) {
            this.bricksLeft++;
            if (Math.random() < 0.2) {
              results1.push(this.bricks.push(new ExplosiveBrick(x * gap, y * gap, this.blockSize)));
            } else {
              results1.push(this.bricks.push(new Brick(x * gap, y * gap, this.blockSize)));
            }
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  BricksManager.prototype.killBrick = function(brick, source, delay) {
    var brickObj;
    brickObj = [];
    brickObj.source = source;
    brickObj.brick = brick;
    brickObj.delay = delay;
    this.bricksToKill.push(brickObj);
    return brick.markedForDeath = true;
  };

  BricksManager.prototype.update = function() {
    var b, b2, btk, collision, dist, i, j, k, l, n, ref, ref1, ref2;
    for (i = j = 0, ref = this.bricks.length - 1; j <= ref; i = j += 1) {
      b = this.bricks[i];
      b.draw(this.blockSize);
      collision = physics.ballIntercept(ball, b, ball.vx * dt, ball.vy * dt);
      if (collision !== null) {
        if (collision.d === "left" || collision.d === "right") {
          ball.x = collision.x;
          ball.vx = -ball.vx;
        }
        if (collision.d === "top" || collision.d === "bottom") {
          ball.y = collision.y;
          ball.vy = -ball.vy;
        }
        this.killBrick(b, ball, 0);
      }
    }
    for (i = k = 0, ref1 = this.bricksToKill.length - 1; k <= ref1; i = k += 1) {
      btk = this.bricksToKill[i];
      btk.delay--;
      if (btk.delay <= 0) {
        this.destroyBrick(btk);
        if (btk.brick instanceof ExplosiveBrick) {
          b = btk.brick;
          shake += 5;
          explosions.push(new Explosion(b.x, b.y));
          for (n = l = 0, ref2 = this.bricks.length - 1; l <= ref2; n = l += 1) {
            if (n !== i) {
              b2 = this.bricks[n];
              if (!b2.markedForDeath) {
                dist = distance(b.x, b.y, b2.x, b2.y);
                if (dist < 50 && random(0, 1) < 0.5) {
                  this.killBrick(b2, b, Math.round(dist * 0.4));
                }
              }
            }
          }
        }
      }
    }
    return this.bricksToKill = cleanGarbage(this.bricksToKill, (function(a) {
      return a.delay <= 0;
    }));
  };

  BricksManager.prototype.destroyBrick = function(remover) {
    var angle, i, j, k, n, ref, vx, vy;
    for (i = j = 0, ref = this.bricks.length - 1; j <= ref; i = j += 1) {
      if (this.bricks[i] === remover.brick) {
        this.bricks.splice(i, 1);
      }
    }
    angle = Math.atan2(remover.brick.y - remover.source.y, remover.brick.x - remover.source.x);
    for (n = k = 0; k <= 4; n = k += 1) {
      vx = Math.cos(angle) * 20 + random(-5, 5);
      vy = Math.sin(angle) * 20 + random(-5, 5);
      debris.push(new Debris(remover.brick.x + random(-this.blockSize, this.blockSize), remover.brick.y + random(-this.blockSize, this.blockSize), vx, vy));
    }
    return this.bricksLeft--;
  };

  return BricksManager;

})();

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
    this.vx = mx - this.x;
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
    context.fillStyle = "white";
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    return solidCircle(context, this.x, this.y, this.radius);
  };

  return Ball;

})();

Brick = (function() {
  function Brick(x5, y5, blockSize) {
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
    this.type = "brick";
    this.markedForDeath = false;
  }

  Brick.prototype.incDark = function(dist) {
    return this.dark += Math.round(255 / (dist * 0.1));
  };

  Brick.prototype.draw = function(blockSize) {
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

  function ExplosiveBrick(x5, y5, blockSize) {
    this.x = x5;
    this.y = y5;
    ExplosiveBrick.__super__.constructor.call(this, this.x, this.y, blockSize);
    this.count = Math.random() * 3;
    this.gradient = context.createRadialGradient(0, 0, 8, 0, 0, 40);
    this.gradient.addColorStop(0, 'rgba(255,220,160,0.1)');
    this.gradient.addColorStop(0.4, 'rgba(200,20,20,0.05)');
    this.gradient.addColorStop(1, 'rgba(0,0,0,0.0)');
    this.type = "explosive";
  }

  ExplosiveBrick.prototype.drawGlow = function() {
    lighting.context.fillStyle = this.gradient;
    lighting.context.save();
    lighting.context.translate(this.x, this.y);
    solidCircle(lighting.context, 0, 0, 40);
    return lighting.context.restore();
  };

  ExplosiveBrick.prototype.draw = function(blockSize) {
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
    context.strokeStyle = 'rgba(255,' + (255 - this.life * 3) + ',0,' + (1.0 - (this.life * 0.02)) + ')';
    context.fillStyle = 'rgba(255,' + (255 - this.life * 3) + ',0,' + (0.5 - (this.life * 0.01)) + ')';
    strokedCircle(context, this.x, this.y, this.life);
    return solidCircle(context, this.x, this.y, this.life);
  };

  return Explosion;

})();

Physics = (function() {
  var intercept;

  function Physics() {}

  Physics.prototype.ballIntercept = function(bal, rec, nx, ny) {
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
    var denom, result, ua, ub, x, y;
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

  Physics.prototype.wallCollision = function() {
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

  return Physics;

})();

mouseXY = function(e) {
  return mx = e.pageX;
};

mouseDown = function(e) {
  return e.preventDefault();
};

draw = function() {
  var i, j, k, paddleCollision, ref, ref1;
  webkitRequestAnimationFrame(draw);
  stats.begin();
  context.fillStyle = 'rgba(0,0,0,1.0)';
  context.fillRect(0, 0, 320, 568);
  if (shake > 0) {
    canvas.style.marginLeft = random(-shake, shake) + 'px';
    canvas.style.marginTop = random(-shake, shake) + 'px';
    shake--;
  }
  lighting.light(bricks.bricks);
  context.drawImage(lighting.canvas, 0, 0);
  bricks.update();
  physics.wallCollision();
  paddleCollision = physics.ballIntercept(ball, player, ball.vx * dt, ball.vy * dt);
  if (paddleCollision !== null) {
    ball.y = paddleCollision.y;
    ball.vy = -ball.vy;
    ball.vx += player.vx * 0.01;
  }
  ball.draw();
  lighting.lights[0].x = ball.x;
  lighting.lights[0].y = ball.y;
  player.draw();
  for (i = j = 0, ref = debris.length - 1; j <= ref; i = j += 1) {
    debris[i].draw();
  }
  debris = cleanGarbage(debris, (function(a) {
    return a.y > 568;
  }));
  for (i = k = 0, ref1 = explosions.length - 1; k <= ref1; i = k += 1) {
    explosions[i].draw();
  }
  explosions = cleanGarbage(explosions, (function(a) {
    return a.life > 50;
  }));
  return stats.end();
};

window.onload = function() {
  var levelup;
  levelup = document.getElementById('levelup');
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  context.lineJoin = "round";
  lighting = new Lighting();
  player = new Player();
  ball = new Ball();
  physics = new Physics();
  bricks = new BricksManager(6);
  lighting.initLights();
  bricks.setup();
  stats = new Stats();
  stats.setMode(0);
  document.body.appendChild(stats.domElement);
  canvas.addEventListener("touchstart", mouseDown, false);
  canvas.addEventListener("mousemove", mouseXY, true);
  canvas.addEventListener("touchmove", mouseXY, true);
  canvas.addEventListener("mousedown", mouseDown, false);
  return draw();
};
