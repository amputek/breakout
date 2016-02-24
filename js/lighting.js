var LightSource, Lighting, Shadow;

LightSource = (function() {
  function LightSource(x, y, radius, lum1) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.lum = lum1;
    this.count = Math.randomFloat(0, 4);
  }

  return LightSource;

})();

Shadow = (function() {
  function Shadow(source, object, optionalLimit) {
    var angle, bottom, left, limit, newangle, newangle1, right, top;
    this.dist = Math.distance(source, object);
    left = object.left;
    right = object.right;
    top = object.top;
    bottom = object.bottom;
    angle = Math.atan2(object.y - source.y, object.x - source.x);
    this.cornerA = {
      x: 0,
      y: 0
    };
    this.cornerB = {
      x: 0,
      y: 0
    };
    this.cornerC = {};
    if (source.y < object.y && Math.abs(object.x - source.x) < object.width) {
      this.cornerA = {
        x: object.left,
        y: object.top
      };
      this.cornerB = {
        x: object.right,
        y: object.top
      };
    } else if (source.y > object.y && Math.abs(object.x - source.x) < object.width) {
      this.cornerA = {
        x: object.left,
        y: object.bottom
      };
      this.cornerB = {
        x: object.right,
        y: object.bottom
      };
    } else if (source.x < object.x && Math.abs(object.y - source.y) < object.height) {
      this.cornerA = {
        x: object.left,
        y: object.bottom
      };
      this.cornerB = {
        x: object.left,
        y: object.top
      };
    } else if (source.x > object.x && Math.abs(object.y - source.y) < object.height) {
      this.cornerA = {
        x: object.right,
        y: object.bottom
      };
      this.cornerB = {
        x: object.right,
        y: object.top
      };
    } else if (angle > 0 && angle < Math.PI / 2) {
      this.cornerA = {
        x: object.left,
        y: object.bottom
      };
      this.cornerB = {
        x: object.right,
        y: object.top
      };
      this.cornerC = {
        x: object.left,
        y: object.top
      };
    } else if (angle > Math.PI / 2 && angle < Math.PI) {
      this.cornerA = {
        x: object.left,
        y: object.top
      };
      this.cornerB = {
        x: object.right,
        y: object.bottom
      };
      this.cornerC = {
        x: object.right,
        y: object.top
      };
    } else if (angle > -Math.PI && angle < -Math.PI / 2) {
      this.cornerA = {
        x: object.right,
        y: object.top
      };
      this.cornerB = {
        x: object.left,
        y: object.bottom
      };
      this.cornerC = {
        x: object.right,
        y: object.bottom
      };
    } else if (angle > -Math.PI / 2 && angle < 0) {
      this.cornerA = {
        x: object.right,
        y: object.bottom
      };
      this.cornerB = {
        x: object.left,
        y: object.top
      };
      this.cornerC = {
        x: object.left,
        y: object.bottom
      };
    }
    limit = optionalLimit || source.radius;
    newangle = Math.angle(this.cornerA, source);
    this.cornerFarA = {
      x: source.x + Math.cos(newangle) * limit,
      y: source.y + Math.sin(newangle) * limit
    };
    newangle1 = Math.angle(this.cornerB, source);
    this.cornerFarB = {
      x: source.x + Math.cos(newangle1) * limit,
      y: source.y + Math.sin(newangle1) * limit
    };
  }

  return Shadow;

})();

Lighting = (function() {
  var generateHighlight, withinRange;

  function Lighting() {
    this.lights = [];
  }

  Lighting.prototype.initLights = function() {
    return this.lights.push(new LightSource(0, -1000, 100, 1.0));
  };

  Lighting.prototype.draw = function(renderer) {
    var i, j, ref, results;
    renderer.drawLight(this.lights);
    results = [];
    for (i = j = 1, ref = this.lights.length - 1; j <= ref; i = j += 1) {
      this.lights[i].count += 0.1;
      results.push(this.lights[i].radius = 180 + Math.sin(this.lights[i].count) * 50);
    }
    return results;
  };

  Lighting.prototype.drawLights = function(renderer) {
    var i, j, l, ref, results;
    results = [];
    for (i = j = 0, ref = this.lights.length - 1; j <= ref; i = j += 1) {
      l = this.lights[i];
      results.push(renderer.drawLightGlow(i, l.x, l.y, l.radius, l.lum));
    }
    return results;
  };

  withinRange = function(source, object) {
    return Math.distance(source, object) < source.radius;
  };

  generateHighlight = function(source, object, lum) {
    return Math.round(lum * (1.0 - (Math.distance(source, object) / source.radius)));
  };

  Lighting.prototype.addShadowsToLights = function(renderer, player, bricks, debris) {
    var brick, i, j, k, light, n, ref, ref1, results;
    results = [];
    for (i = j = 0, ref = this.lights.length - 1; j <= ref; i = j += 1) {
      light = this.lights[i];
      if (withinRange(light, player)) {
        renderer.drawShadow(i, new Shadow(light, player, 1500));
      }
      for (n = k = 0, ref1 = bricks.length - 1; k <= ref1; n = k += 1) {
        brick = bricks[n];
        if (withinRange(light, brick)) {
          brick.incHighlight(generateHighlight(light, brick, 80));
          renderer.drawShadow(i, new Shadow(light, brick));
        }
      }
      results.push((function() {
        var m, ref2, results1;
        results1 = [];
        for (n = m = 0, ref2 = debris.length - 1; m <= ref2; n = m += 1) {
          results1.push(debris[n].incHighlight(generateHighlight(light, debris[n], 50)));
        }
        return results1;
      })());
    }
    return results;
  };

  return Lighting;

})();
