class LightSource
	constructor: (@x, @y, @radius) ->


class Lighting
	constructor: () ->
		@lights = []

	initLights: () ->
		@lights.push new LightSource( 0, -1000, 100)
		# @lights.push new LightSource( 0, -1000, 200)


	getShadowShape = ( source, object ) ->

		dist = Math.distance(source,object)

		if( dist > source.radius)
			return null

		left = object.left
		right = object.right
		top = object.top
		bottom = object.bottom

		angle = Math.atan2( object.y - source.y, object.x - source.x)

		cornerA = {x: 0, y: 0}
		cornerB = {x: 0, y: 0}
		cornerC = {}

		if( source.y < object.y and Math.abs(object.x - source.x) < object.width)

			cornerA = {x: object.left , y: object.top }
			cornerB = {x: object.right, y: object.top }

		else if( source.y > object.y and Math.abs(object.x - source.x) < object.width)

			cornerA = {x: object.left , y: object.bottom }
			cornerB = {x: object.right, y: object.bottom }

		else if( source.x < object.x and Math.abs(object.y - source.y) < object.height)

			cornerA = {x: object.left , y: object.bottom }
			cornerB = {x: object.left , y: object.top }

		else if( source.x > object.x and Math.abs(object.y - source.y) < object.height)

			cornerA = {x: object.right, y: object.bottom }
			cornerB = {x: object.right, y: object.top }

		else if(angle > 0 and angle < Math.PI/2)

			cornerA = {x: object.left, y: object.bottom }
			cornerB = {x: object.right, y: object.top }
			cornerC = {x: object.left, y: object.top }

		else if(angle > Math.PI/2 and angle < Math.PI)

			cornerA = {x: object.left, y: object.top }
			cornerB = {x: object.right, y: object.bottom }
			cornerC = {x: object.right, y: object.top }

		else if(angle > -Math.PI and angle < -Math.PI/2)

			cornerA = {x: object.right, y: object.top }
			cornerB = {x: object.left, y: object.bottom }
			cornerC = {x: object.right, y: object.bottom }

		else if(angle > -Math.PI/2 and angle < 0)

			cornerA = {x: object.right, y: object.bottom }
			cornerB = {x: object.left, y: object.top }
			cornerC = {x: object.left, y: object.bottom }


		newangle = Math.angle( cornerA, source )
		cornerFarA = {x: source.x + Math.cos( newangle ) * source.radius, y: source.y + Math.sin( newangle ) * source.radius }

		newangle1 = Math.angle( cornerB, source )
		cornerFarB = {x: source.x + Math.cos( newangle1 ) * source.radius, y: source.y + Math.sin( newangle1 ) * source.radius }

		return {dist:dist, cornerA:cornerA, cornerB:cornerB, cornerFarB:cornerFarB, cornerFarA:cornerFarA, cornerC:cornerC}

	draw: ( renderer ) ->
		renderer.drawLight( @lights )

	drawLights: ( renderer ) ->
		for i in [0..@lights.length-1] by 1
			l = @lights[i]
			renderer.drawLightGlow( i, l.x, l.y, l.radius, )

	addShadowsToLights: ( renderer, player, bricks, debris ) ->

		for i in [0..@lights.length-1] by 1

			s = getShadowShape( @lights[i], player )
			if( s != null)
				renderer.drawShadow( i, s.dist, s.cornerA, s.cornerB, s.cornerFarB, s.cornerFarA, s.cornerC )

			for n in [0..bricks.length-1] by 1
				o = bricks[n]
				dist = Math.distance( o, @lights[i] )
				o.incDark( dist );

				s = getShadowShape( @lights[i], o )
				if( s != null)
					renderer.drawShadow( i, s.dist, s.cornerA, s.cornerB, s.cornerFarB, s.cornerFarA, s.cornerC )


			for n in [0..debris.length-1] by 1
				debris[n].incDark( Math.distance( debris[n], @lights[i] ) )
