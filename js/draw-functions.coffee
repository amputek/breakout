#-------DRAW FUNCTIONS--------#

Math.distance = (a,b) ->
	return Math.sqrt( Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2))

Math.angle = (a, b) ->
	return Math.atan2( a.y - b.y, a.x - b.x );

Math.randomFloat = (a, b) ->
	return (Math.random() * (b-a)) + a;
