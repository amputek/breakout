#-------DRAW FUNCTIONS--------#

line = (ctx, x, y, x2, y2) ->
	ctx.beginPath()
	ctx.moveTo(x,y)
	ctx.lineTo(x2,y2)
	ctx.stroke()

solidCircle = (ctx, x, y, r) ->
	ctx.beginPath()
	ctx.arc x, y, r, 0, 2*Math.PI, false
	ctx.fill()

strokedCircle = (ctx, x, y, r) ->
	ctx.beginPath()
	ctx.arc x, y, r, 0, 2*Math.PI, false
	ctx.stroke()

distance = (x1, y1, x2, y2) ->
	return Math.sqrt( Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))

random = (a, b) ->
	return (Math.random() * (b-a)) + a;
