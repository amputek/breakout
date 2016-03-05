class LightSource
	constructor: (@x, @y, @radius, @lum) ->
		@count = Math.randomFloat(0,4)

class Shadow
	constructor: ( source, object, optionalLimit ) ->
		@dist = Math.distance(source,object)

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
		@lights.push new LightSource( 0, -1000, 200, 1.0)
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
		l = lum *  (1.0 - ( Math.distance(source, object) / source.radius ) );
		if(l < 0)
			l = 0
		return l



	#It's kind of useful having the highlight separated from the object. BUT it means having to pull out the object's left/top/right/bottom variables from here
	#ALSO. this method doesn't work for DEBRIS. each debris needs to be highlighted indivudally as its drawn, rather than all highlighted at the same time after

	addShadowsToLights: ( renderer, player, bricks, debris ) ->

		shadowCount = 0;

		for i in [0..@lights.length-1] by 1

			light = @lights[i]

			if( withinRange( light, player ) )
				renderer.drawShadow( i, new Shadow( light, player, 1500 ) )


			for n in [0..bricks.length-1] by 1
				brick = bricks[n]
				if( withinRange( light, brick ) )
					renderer.drawShadow( i, new Shadow( light, brick ) )
					brick.incHighlight( generateHighlight( light, brick, 30 ) )
					shadowCount++


			# if( withinRange( light, player ) )
				# renderer.drawHighlight( i, player.left, player.top, player.right, player.bottom, generateHighlight( light, player, 0.18 ) )


			# for n in [0..bricks.length-1] by 1
				# brick = bricks[n]

				# if( withinRange( light, brick ) )
					# renderer.drawHighlight( i, brick.left, brick.top, brick.right, brick.bottom, generateHighlight( light, brick, 0.18 ) )


			for n in [0..debris.length-1] by 1
				d = debris[n]
				d.incHighlight( generateHighlight( light, d, 130 ) )
				# renderer.highlightDebris( i, debris[n].x, debris[n].y, debris[n].radius, debris[n].angle, generateHighlight( light, debris[n], 0.56 ) )

		# console.log("Shaodw Count: " + shadowCount)
