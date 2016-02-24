class LightSource
	constructor: (@x, @y, @radius, @lum) ->
		@count = Math.randomFloat(0,4)

class Shadow
	constructor: ( source, object, optionalLimit ) ->
		@dist = Math.distance(source,object)

		left = object.left
		right = object.right
		top = object.top
		bottom = object.bottom

		angle = Math.atan2( object.y - source.y, object.x - source.x)

		@cornerA = {x: 0, y: 0}
		@cornerB = {x: 0, y: 0}
		@cornerC = {}

		if( source.y < object.y and Math.abs(object.x - source.x) < object.width)

			@cornerA = {x: object.left , y: object.top }
			@cornerB = {x: object.right, y: object.top }

		else if( source.y > object.y and Math.abs(object.x - source.x) < object.width)

			@cornerA = {x: object.left , y: object.bottom }
			@cornerB = {x: object.right, y: object.bottom }

		else if( source.x < object.x and Math.abs(object.y - source.y) < object.height)

			@cornerA = {x: object.left , y: object.bottom }
			@cornerB = {x: object.left , y: object.top }

		else if( source.x > object.x and Math.abs(object.y - source.y) < object.height)

			@cornerA = {x: object.right, y: object.bottom }
			@cornerB = {x: object.right, y: object.top }

		else if(angle > 0 and angle < Math.PI/2)

			@cornerA = {x: object.left, y: object.bottom }
			@cornerB = {x: object.right, y: object.top }
			@cornerC = {x: object.left, y: object.top }

		else if(angle > Math.PI/2 and angle < Math.PI)

			@cornerA = {x: object.left, y: object.top }
			@cornerB = {x: object.right, y: object.bottom }
			@cornerC = {x: object.right, y: object.top }

		else if(angle > -Math.PI and angle < -Math.PI/2)

			@cornerA = {x: object.right, y: object.top }
			@cornerB = {x: object.left, y: object.bottom }
			@cornerC = {x: object.right, y: object.bottom }

		else if(angle > -Math.PI/2 and angle < 0)

			@cornerA = {x: object.right, y: object.bottom }
			@cornerB = {x: object.left, y: object.top }
			@cornerC = {x: object.left, y: object.bottom }


		limit = optionalLimit or source.radius


		newangle = Math.angle( @cornerA, source )
		@cornerFarA = {x: source.x + Math.cos( newangle ) * limit, y: source.y + Math.sin( newangle ) * limit }

		newangle1 = Math.angle( @cornerB, source )
		@cornerFarB = {x: source.x + Math.cos( newangle1 ) * limit, y: source.y + Math.sin( newangle1 ) * limit }


class Lighting


	constructor: () ->
		@lights = []

	initLights: () ->
		@lights.push new LightSource( 0, -1000, 100, 1.0)
		# @lights.push new LightSource( 186, 20, 300, 1.0)
		# @lights.push new LightSource( 20,  20, 300, 1.0)

	draw: ( renderer ) ->
		renderer.drawLight( @lights )
		for i in [1..@lights.length-1] by 1
			@lights[i].count+=0.1
			@lights[i].radius = 180 + Math.sin(@lights[i].count)*50

	drawLights: ( renderer ) ->
		for i in [0..@lights.length-1] by 1
			l = @lights[i]
			renderer.drawLightGlow( i, l.x, l.y, l.radius, l.lum )

	withinRange = ( source, object ) ->
		return Math.distance( source, object ) < source.radius

	generateHighlight = ( source, object, lum ) ->
		return Math.round( lum *  (1.0 - ( Math.distance(source, object) / source.radius ) ) )

	addShadowsToLights: ( renderer, player, bricks, debris ) ->

		for i in [0..@lights.length-1] by 1

			light = @lights[i]

			if( withinRange( light, player ) )
				renderer.drawShadow( i, new Shadow( light, player, 1500 ) )

			for n in [0..bricks.length-1] by 1
				brick = bricks[n]

				if( withinRange( light, brick ) )
					brick.incHighlight( generateHighlight( light, brick, 80 ) )
					renderer.drawShadow( i, new Shadow( light, brick ) )

			for n in [0..debris.length-1] by 1
				debris[n].incHighlight( generateHighlight( light, debris[n], 50 ) )
