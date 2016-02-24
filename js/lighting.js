var LightSource, Lighting;

LightSource = (function() {
  function LightSource(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  return LightSource;

})();

Lighting = (function() {
  var getShadowShape;

  function Lighting() {
    this.lights = [];
  }

  Lighting.prototype.initLights = function() {
    return this.lights.push(new LightSource(0, -1000, 100));
  };

  getShadowShape = function(source, object) {
    var angle, bottom, cornerA, cornerB, cornerC, cornerFarA, cornerFarB, dist, left, newangle, newangle1, right, top;
    dist = Math.distance(source, object);
    if (dist > source.radius) {
      return null;
    }
    left = object.left;
    right = object.right;
    top = object.top;
    bottom = object.bottom;
    angle = Math.atan2(object.y - source.y, object.x - source.x);
    cornerA = {
      x: 0,
      y: 0
    };
    cornerB = {
      x: 0,
      y: 0
    };
    cornerC = {};
    if (source.y < object.y && Math.abs(object.x - source.x) < object.width) {
      cornerA = {
        x: object.left,
        y: object.top
      };
      cornerB = {
        x: object.right,
        y: object.top
      };
    } else if (source.y > object.y && Math.abs(object.x - source.x) < object.width) {
      cornerA = {
        x: object.left,
        y: object.bottom
      };
      cornerB = {
        x: object.right,
        y: object.bottom
      };
    } else if (source.x < object.x && Math.abs(object.y - source.y) < object.height) {
      cornerA = {
        x: object.left,
        y: object.bottom
      };
      cornerB = {
        x: object.left,
        y: object.top
      };
    } else if (source.x > object.x && Math.abs(object.y - source.y) < object.height) {
      cornerA = {
        x: object.right,
        y: object.bottom
      };
      cornerB = {
        x: object.right,
        y: object.top
      };
    } else if (angle > 0 && angle < Math.PI / 2) {
      cornerA = {
        x: object.left,
        y: object.bottom
      };
      cornerB = {
        x: object.right,
        y: object.top
      };
      cornerC = {
        x: object.left,
        y: object.top
      };
    } else if (angle > Math.PI / 2 && angle < Math.PI) {
      cornerA = {
        x: object.left,
        y: object.top
      };
      cornerB = {
        x: object.right,
        y: object.bottom
      };
      cornerC = {
        x: object.right,
        y: object.top
      };
    } else if (angle > -Math.PI && angle < -Math.PI / 2) {
      cornerA = {
        x: object.right,
        y: object.top
      };
      cornerB = {
        x: object.left,
        y: object.bottom
      };
      cornerC = {
        x: object.right,
        y: object.bottom
      };
    } else if (angle > -Math.PI / 2 && angle < 0) {
      cornerA = {
        x: object.right,
        y: object.bottom
      };
      cornerB = {
        x: object.left,
        y: object.top
      };
      cornerC = {
        x: object.left,
        y: object.bottom
      };
    }
    newangle = Math.angle(cornerA, source);
    cornerFarA = {
      x: source.x + Math.cos(newangle) * source.radius,
      y: source.y + Math.sin(newangle) * source.radius
    };
    newangle1 = Math.angle(cornerB, source);
    cornerFarB = {
      x: source.x + Math.cos(newangle1) * source.radius,
      y: source.y + Math.sin(newangle1) * source.radius
    };
    return {
      dist: dist,
      cornerA: cornerA,
      cornerB: cornerB,
      cornerFarB: cornerFarB,
      cornerFarA: cornerFarA,
      cornerC: cornerC
    };
  };

  Lighting.prototype.draw = function(renderer) {
    return renderer.drawLight(this.lights);
  };

  Lighting.prototype.drawLights = function(renderer) {
    var i, j, l, ref, results;
    results = [];
    for (i = j = 0, ref = this.lights.length - 1; j <= ref; i = j += 1) {
      l = this.lights[i];
      results.push(renderer.drawLightGlow(i, l.x, l.y, l.radius));
    }
    return results;
  };

  Lighting.prototype.addShadowsToLights = function(renderer, player, bricks, debris) {
    var dist, i, j, k, n, o, ref, ref1, results, s;
    results = [];
    for (i = j = 0, ref = this.lights.length - 1; j <= ref; i = j += 1) {
      s = getShadowShape(this.lights[i], player);
      if (s !== null) {
        renderer.drawShadow(i, s.dist, s.cornerA, s.cornerB, s.cornerFarB, s.cornerFarA, s.cornerC);
      }
      for (n = k = 0, ref1 = bricks.length - 1; k <= ref1; n = k += 1) {
        o = bricks[n];
        dist = Math.distance(o, this.lights[i]);
        o.incDark(dist);
        s = getShadowShape(this.lights[i], o);
        if (s !== null) {
          renderer.drawShadow(i, s.dist, s.cornerA, s.cornerB, s.cornerFarB, s.cornerFarA, s.cornerC);
        }
      }
      results.push((function() {
        var m, ref2, results1;
        results1 = [];
        for (n = m = 0, ref2 = debris.length - 1; m <= ref2; n = m += 1) {
          results1.push(debris[n].incDark(Math.distance(debris[n], this.lights[i])));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  return Lighting;

})();
