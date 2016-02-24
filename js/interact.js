var Ball, Brick, BricksManager, Debris, DebrisManager, Explosion, ExplosionsManager, ExplosiveBrick, Game, Manager, Player, draw, game, mouseDown, mouseXY, mx, my,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

game = null;

mx = 0;

my = 0;

Game = (function() {
  var ball, bricks, canvas, currentTime, debris, dt, explosions, lighting, paused, physics, player, renderer, shake, stats;

  canvas = null;

  paused = false;

  shake = 0;

  player = null;

  ball = null;

  stats = null;

  physics = null;

  lighting = null;

  bricks = null;

  debris = null;

  explosions = null;

  renderer = null;

  dt = 1.0 / 60.0;

  currentTime = Date.now();

  function Game() {
    var td;
    td = Date.now();
    canvas = document.getElementById('canvas');
    lighting = new Lighting();
    renderer = new Renderer(canvas, 600, 600);
    player = new Player();
    ball = new Ball();
    physics = new Physics(600, 600);
    bricks = new BricksManager(6);
    debris = new DebrisManager();
    explosions = new ExplosionsManager();
    lighting.initLights();
    renderer.addLights(lighting.lights);
    bricks.setup();
    stats = new Stats();
    stats.setMode(0);
    document.body.appendChild(stats.domElement);
    canvas.addEventListener("touchstart", mouseDown, false);
    canvas.addEventListener("mousemove", mouseXY, true);
    canvas.addEventListener("touchmove", mouseXY, true);
    canvas.addEventListener("mousedown", mouseDown, false);
  }

  Game.prototype.draw = function() {
    var newTime;
    stats.begin();
    newTime = Date.now();
    dt = (newTime - currentTime) / 100;
    currentTime = newTime;
    renderer.drawBackground();
    if (shake > 0) {
      canvas.style.marginLeft = Math.randomFloat(-shake, shake) + 'px';
      canvas.style.marginTop = Math.randomFloat(-shake, shake) + 'px';
      shake -= 0.5;
    }
    lighting.drawLights(renderer);
    lighting.addShadowsToLights(renderer, player, bricks.collection, debris.collection);
    lighting.draw(renderer);
    bricks.update();
    bricks.draw(renderer);
    physics.wallCollision(ball, ball.vx * dt, ball.vy * dt);
    physics.paddleCollision(ball, player, ball.vx * dt, ball.vy * dt);
    physics.bricksCollision(ball, bricks, ball.vx * dt, ball.vy * dt);
    ball.update(dt);
    ball.draw(renderer);
    lighting.lights[0].x = ball.x;
    lighting.lights[0].y = ball.y;
    player.update();
    player.draw(renderer);
    debris.update(dt);
    debris.draw(renderer);
    explosions.update();
    explosions.draw(renderer);
    document.getElementById("debug").innerHTML = "" + dt;
    return stats.end();
  };

  Game.prototype.addExplosion = function(x, y) {
    shake += 3;
    return explosions.add(new Explosion(x, y));
  };

  Game.prototype.createDebris = function(brick, source, blockSize) {
    var angle, j, n, results, vx, vy;
    angle = Math.atan2(brick.y - source.y, brick.x - source.x);
    results = [];
    for (n = j = 0; j <= 4; n = j += 1) {
      vx = Math.cos(angle) * 20 + Math.randomFloat(-5, 5);
      vy = Math.sin(angle) * 20 + Math.randomFloat(-5, 5);
      results.push(debris.add(new Debris(brick.x + Math.randomFloat(-blockSize, blockSize), brick.y + Math.randomFloat(-blockSize, blockSize), vx, vy)));
    }
    return results;
  };

  return Game;

})();

Manager = (function() {
  function Manager() {
    this.collection = [];
  }

  Manager.prototype.entityIsDead = function(entity) {
    return false;
  };

  Manager.prototype.add = function(a) {
    return this.collection.push(a);
  };

  Manager.prototype.update = function(dt) {
    var i, j, ref, results;
    results = [];
    for (i = j = 0, ref = this.collection.length - 1; j <= ref; i = j += 1) {
      results.push(this.collection[i].update(dt));
    }
    return results;
  };

  Manager.prototype.draw = function() {
    var i, j, ref, results;
    results = [];
    for (i = j = 0, ref = this.collection.length - 1; j <= ref; i = j += 1) {
      results.push(this.collection[i].draw());
    }
    return results;
  };

  Manager.prototype.cleanGarbage = function() {
    var i, j, k, ref, ref1, removers, results;
    removers = [];
    for (i = j = 0, ref = this.collection.length - 1; j <= ref; i = j += 1) {
      if (this.entityIsDead(this.collection[i])) {
        removers.push(this.collection[i]);
      }
    }
    results = [];
    for (i = k = 0, ref1 = removers.length - 1; k <= ref1; i = k += 1) {
      results.push(this.collection.splice(this.collection.indexOf(removers[i]), 1));
    }
    return results;
  };

  Manager.prototype.get = function() {
    return this.collection;
  };

  return Manager;

})();

BricksManager = (function(superClass) {
  var deadBricks;

  extend(BricksManager, superClass);

  deadBricks = [];

  function BricksManager(blockSize1) {
    this.blockSize = blockSize1;
    BricksManager.__super__.constructor.call(this);
    this.brickCount = 0;
    deadBricks = new Manager();
    deadBricks.entityIsDead = function(entity) {
      return entity.delay <= 0;
    };
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
            this.brickCount++;
            if (Math.randomFloat(0, 1) < 0.2) {
              results1.push(this.collection.push(new ExplosiveBrick(x * gap, y * gap, this.blockSize)));
            } else {
              results1.push(this.collection.push(new Brick(x * gap, y * gap, this.blockSize)));
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

  BricksManager.prototype.draw = function(renderer) {
    var b, i, j, ref, results;
    results = [];
    for (i = j = 0, ref = this.collection.length - 1; j <= ref; i = j += 1) {
      b = this.collection[i];
      renderer.drawBrick(b.type, b.left, b.top, this.blockSize, b.dark, b.count);
      results.push(b.dark = 0);
    }
    return results;
  };

  BricksManager.prototype.destroyBrick = function(remover) {
    var b, b2, dist, i, j, k, n, ref, ref1, results;
    for (i = j = 0, ref = this.collection.length - 1; j <= ref; i = j += 1) {
      if (this.collection[i] === remover.brick) {
        this.collection.splice(i, 1);
      }
    }
    game.createDebris(remover.brick, remover.source, this.blockSize);
    this.brickCount--;
    if (remover.brick instanceof ExplosiveBrick) {
      b = remover.brick;
      game.addExplosion(b.x, b.y);
      results = [];
      for (n = k = 0, ref1 = this.collection.length - 1; k <= ref1; n = k += 1) {
        if (n !== i) {
          b2 = this.collection[n];
          if (!b2.markedForDeath) {
            dist = Math.distance(b, b2);
            if (dist < 50 && Math.randomFloat(0, 1) < 0.5) {
              results.push(this.markBrickForDeath(b2, b, Math.round(dist * 0.4)));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

  BricksManager.prototype.markBrickForDeath = function(brick, source, delay) {
    var brickObj;
    brickObj = [];
    brickObj.source = source;
    brickObj.brick = brick;
    brickObj.delay = delay;
    deadBricks.add(brickObj);
    return brick.markedForDeath = true;
  };

  BricksManager.prototype.update = function() {
    var b, btk, i, j, k, ref, ref1;
    for (i = j = 0, ref = this.collection.length - 1; j <= ref; i = j += 1) {
      b = this.collection[i];
      b.update();
    }
    for (i = k = 0, ref1 = deadBricks.collection.length - 1; k <= ref1; i = k += 1) {
      btk = deadBricks.collection[i];
      btk.delay--;
      if (btk.delay <= 0) {
        this.destroyBrick(btk);
      }
    }
    return deadBricks.cleanGarbage();
  };

  return BricksManager;

})(Manager);

ExplosionsManager = (function(superClass) {
  extend(ExplosionsManager, superClass);

  function ExplosionsManager() {
    return ExplosionsManager.__super__.constructor.apply(this, arguments);
  }

  ExplosionsManager.prototype.entityIsDead = function(entity) {
    return entity.life > 50;
  };

  ExplosionsManager.prototype.draw = function(renderer) {
    var e, i, j, ref, results;
    results = [];
    for (i = j = 0, ref = this.collection.length - 1; j <= ref; i = j += 1) {
      e = this.collection[i];
      renderer.drawExplosion(e.x, e.y, e.life);
      results.push(e.life += 2.0);
    }
    return results;
  };

  return ExplosionsManager;

})(Manager);

DebrisManager = (function(superClass) {
  extend(DebrisManager, superClass);

  function DebrisManager() {
    return DebrisManager.__super__.constructor.apply(this, arguments);
  }

  DebrisManager.prototype.entityIsDead = function(entity) {
    return entity.y > 1200;
  };

  DebrisManager.prototype.draw = function(renderer) {
    var e, i, j, ref, results;
    results = [];
    for (i = j = 0, ref = this.collection.length - 1; j <= ref; i = j += 1) {
      e = this.collection[i];
      renderer.drawDebris(e.x, e.y, e.radius, e.angle, e.dark);
      results.push(e.dark = 10);
    }
    return results;
  };

  return DebrisManager;

})(Manager);

Player = (function() {
  function Player() {
    this.x = 100;
    this.y = 550;
    this.width = 100;
    this.height = 10;
    this.left = this.x - 50;
    this.right = this.x + 50;
    this.top = this.y - this.height / 2;
    this.bottom = this.y + this.height / 2;
    this.vx = 0;
  }

  Player.prototype.draw = function(renderer) {
    return renderer.drawPaddle(this.x, this.y, this.width, this.height);
  };

  Player.prototype.update = function() {
    this.vx = mx - this.x;
    this.x = mx;
    this.left = this.x - this.width;
    return this.right = this.x + this.width;
  };

  return Player;

})();

Debris = (function() {
  function Debris(x1, y1, vx1, vy1) {
    this.x = x1;
    this.y = y1;
    this.vx = vx1;
    this.vy = vy1;
    this.radius = Math.randomFloat(0, 4);
    this.dark = 10;
    this.vr = Math.randomFloat(-222, 222);
    this.angle = 0;
  }

  Debris.prototype.incDark = function(dist) {
    return this.dark += Math.round(255 / (dist * 0.1));
  };

  Debris.prototype.update = function(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.angle += this.vr;
    return this.vy += 1.5;
  };

  return Debris;

})();

Ball = (function() {
  function Ball() {
    this.x = 200;
    this.y = 400;
    this.vx = 10.0;
    this.vy = -20.0;
    this.radius = 5;
  }

  Ball.prototype.update = function(dt) {
    this.x += this.vx * dt;
    return this.y += this.vy * dt;
  };

  Ball.prototype.draw = function(renderer) {
    return renderer.drawBall(this.x, this.y, this.radius);
  };

  Ball.prototype.bounce = function(dir, newpos) {
    if (dir === "hor") {
      this.vx = -this.vx;
      this.x = newpos;
    }
    if (dir === "vert") {
      this.vy = -this.vy;
      return this.y = newpos;
    }
  };

  return Ball;

})();

Brick = (function() {
  function Brick(x1, y1, blockSize) {
    this.x = x1;
    this.y = y1;
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

  Brick.prototype.update = function() {};

  Brick.prototype.incDark = function(dist) {
    return this.dark += Math.round(255 / (dist * 0.1));
  };

  return Brick;

})();

ExplosiveBrick = (function(superClass) {
  extend(ExplosiveBrick, superClass);

  function ExplosiveBrick(x1, y1, blockSize) {
    this.x = x1;
    this.y = y1;
    ExplosiveBrick.__super__.constructor.call(this, this.x, this.y, blockSize);
    this.count = Math.randomFloat(0, 3);
    this.type = "explosive";
  }

  ExplosiveBrick.prototype.update = function() {
    return this.count += 0.1;
  };

  return ExplosiveBrick;

})(Brick);

Explosion = (function() {
  function Explosion(x1, y1) {
    this.x = x1;
    this.y = y1;
    this.life = 0;
  }

  Explosion.prototype.update = function() {};

  return Explosion;

})();

mouseXY = function(e) {
  mx = e.pageX;
  return my = e.pageY;
};

mouseDown = function(e) {
  return e.preventDefault();
};

draw = function() {
  webkitRequestAnimationFrame(draw);
  return game.draw();
};

window.onload = function() {
  game = new Game();
  return draw();
};
