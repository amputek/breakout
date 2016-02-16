var distance, line, random, solidCircle, strokedCircle;

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
