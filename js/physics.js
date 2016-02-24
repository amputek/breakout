var Physics;

Physics = (function() {
  var ballIntercept, intercept, width;

  width = 320;

  function Physics(w, h) {
    width = w - 100;
  }

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

  Physics.prototype.wallCollision = function(bal, nx, ny) {
    var leftCollision, leftWall, rightCollision, rightWall, topCollision, topWall;
    topWall = {
      left: -100,
      right: 668,
      top: -50,
      bottom: 0
    };
    topCollision = ballIntercept(bal, topWall, nx, ny);
    if (topCollision) {
      bal.bounce("vert", topCollision.y);
    }
    leftWall = {
      left: -100,
      right: 0,
      top: -50,
      bottom: 1000
    };
    leftCollision = ballIntercept(bal, leftWall, nx, ny);
    if (leftCollision) {
      bal.bounce("hor", leftCollision.x);
    }
    rightWall = {
      left: width,
      right: 668,
      top: -50,
      bottom: 1000
    };
    rightCollision = ballIntercept(bal, rightWall, nx, ny);
    if (rightCollision) {
      return bal.bounce("hor", rightCollision.x);
    }
  };

  Physics.prototype.paddleCollision = function(bal, player, nx, ny) {
    var pt;
    pt = ballIntercept(bal, player, nx, ny);
    if (pt !== null) {
      bal.bounce("vert", pt.y);
      return bal.vx += player.vx * 0.5;
    }
  };

  Physics.prototype.bricksCollision = function(bal, bricks, nx, ny) {
    var brick, i, j, pt, ref;
    for (i = j = 0, ref = bricks.collection.length - 1; j <= ref; i = j += 1) {
      brick = bricks.collection[i];
      pt = ballIntercept(bal, brick, nx, ny);
      if (pt !== null) {
        if (pt.d === "left" || pt.d === "right") {
          bal.bounce("hor", pt.x);
        }
        if (pt.d === "top" || pt.d === "bottom") {
          bal.bounce("vert", pt.y);
        }
        bricks.markBrickForDeath(brick, bal, 0);
        return;
      }
    }
  };

  return Physics;

})();
