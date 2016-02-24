
game = null


mx = 0
my = 0

class Game

	canvas = null
	paused = false

	shake = 0;

	player = null
	ball = null
	stats = null
	physics = null
	lighting = null
	bricks = null
	debris = null
	explosions = null
	renderer = null

	dt = 1.0 / 60.0;
	currentTime = Date.now()

	constructor: () ->

		td = Date.now()

		canvas = document.getElementById('canvas')

		lighting = new Lighting()
		renderer = new Renderer( canvas, 400, 600 )
		player = new Player();
		ball = new Ball();
		physics = new Physics( 400, 600 );
		bricks = new BricksManager( 6 )
		debris = new DebrisManager()
		explosions = new ExplosionsManager()

		lighting.initLights()
		renderer.addLights( lighting.lights )
		bricks.setup()

		stats = new Stats();
		stats.setMode( 0 );
		document.body.appendChild( stats.domElement );

		canvas.addEventListener("touchstart", mouseDown, false)
		canvas.addEventListener("mousemove", mouseXY, true);
		canvas.addEventListener("touchmove", mouseXY, true)
		canvas.addEventListener("mousedown", mouseDown, false )

	update: () ->

		stats.begin();


		newTime = Date.now()
		dt = (newTime - currentTime) / 100
		currentTime = newTime

		renderer.drawBackground()

		# if(shake > 0)
		# 	canvas.style.marginLeft = Math.randomFloat(-shake,shake) + 'px'
		# 	canvas.style.marginTop = Math.randomFloat(-shake,shake) + 'px'
		# 	shake-=0.5;

		lighting.drawLights( renderer )
		lighting.addShadowsToLights( renderer, player, bricks.collection, debris.collection )
		lighting.draw( renderer )

		bricks.update( )
		bricks.draw( renderer )

		physics.wallCollision( ball, ball.vx * dt, ball.vy * dt )
		physics.paddleCollision( ball, player, ball.vx * dt, ball.vy * dt )
		physics.bricksCollision( ball, bricks, ball.vx * dt, ball.vy * dt )

		ball.update( dt )
		ball.draw( renderer )
		# ball.x = mx
		# ball.y = my

		lighting.lights[0].x = ball.x;
		lighting.lights[0].y = ball.y;


		player.update()
		player.draw( renderer );

		debris.update( dt )
		debris.draw( renderer )

		explosions.update()
		explosions.draw( renderer )

		stats.end();

	addExplosion: (x,y) ->
		shake += 3;
		explosions.add new Explosion(x,y)

	createDebris: (brick,source,blockSize) ->
		angle = Math.atan2( brick.y - source.y, brick.x - source.x )
		for n in [0..4] by 1
			vx = Math.cos(angle) * 20 + Math.randomFloat(-5,5)
			vy = Math.sin(angle) * 20 + Math.randomFloat(-5,5)
			debris.add new Debris( brick.x + Math.randomFloat(-blockSize, blockSize), brick.y + Math.randomFloat(-blockSize, blockSize), vx, vy );



class Manager

	constructor: ()->
		@collection = []

	entityIsDead: (entity) ->
		return false

	add: (a) ->
		@collection.push a


	update: ( dt )->
		for i in [0..@collection.length-1] by 1
			@collection[i].update( dt )

	draw: () ->
		for i in [0..@collection.length-1] by 1
			@collection[i].draw()

	cleanGarbage: () ->
		removers = []

		for i in [0..@collection.length-1] by 1
			if( @entityIsDead( @collection[i] ) )
				removers.push @collection[i]

		for i in [0..removers.length-1] by 1
			@collection.splice( @collection.indexOf(removers[i]), 1)


	get: () ->
		return @collection

class BricksManager extends Manager

	deadBricks = []

	constructor: ( @blockSize ) ->
		super()
		@brickCount = 0
		deadBricks = new Manager()
		deadBricks.entityIsDead = ( entity ) ->
			entity.delay <= 0

	setup: () ->
		gap = @blockSize * 2 + 3

		for x in [3..24] by 1
			for y in [3..14] by 1
				if(x % 6 != 0 && x % 6 != 1 )
					@brickCount++;
					if( Math.randomFloat(0,1) < 0.2 )
						@collection.push new ExplosiveBrick( x * gap, y * gap, @blockSize )
					else
						@collection.push new Brick( x * gap, y * gap, @blockSize )

		# for x in [3..48] by 1
		# 	for y in [3..24] by 1
		# 		if( x % 7 != 0 && x % 7 != 1 )
		# 			@brickCount++;
		# 			if( Math.randomFloat(0,1) < 0.05 )
		# 				@collection.push new ExplosiveBrick( x * gap, y * gap, @blockSize )
		# 			else
		# 				@collection.push new Brick( x * gap, y * gap, @blockSize )
		#


	draw: ( renderer ) ->
		for i in [0..@collection.length-1] by 1
			b = @collection[i]
			renderer.drawBrick( b.type, b.left, b.top, @blockSize, b.highlight, b.count )
			b.highlight = 0

	destroyBrick: ( remover ) ->
		for i in [0..@collection.length-1] by 1
			if(@collection[i] == remover.brick)
				@collection.splice( i, 1 )

		game.createDebris( remover.brick, remover.source, @blockSize )
		@brickCount--;

		if remover.brick instanceof ExplosiveBrick
			b = remover.brick
			game.addExplosion( b.x, b.y )
			for n in [0..@collection.length-1] by 1
				if(n != i)
					b2 = @collection[n];
					if( !b2.markedForDeath )
						dist = Math.distance( b, b2 )
						if dist < 50 && Math.randomFloat(0,1) < 0.5
							@markBrickForDeath( b2, b, Math.round( dist * 0.4) )


	markBrickForDeath: ( brick, source, delay  ) ->
		brickObj = [];
		brickObj.source = source;
		brickObj.brick = brick;
		brickObj.delay = delay
		deadBricks.add brickObj
		brick.markedForDeath = true

	update: () ->

		for i in [0..@collection.length-1] by 1
			b = @collection[i]
			b.update()

		for i in [0..deadBricks.collection.length-1] by 1
			btk = deadBricks.collection[i]
			btk.delay--
			if( btk.delay <= 0 )
				@destroyBrick(btk)

		deadBricks.cleanGarbage()

class ExplosionsManager extends Manager
	entityIsDead: ( entity ) ->
		return entity.life > 50

	draw: (renderer) ->
		for i in [0..@collection.length-1] by 1
			e = @collection[i]
			renderer.drawExplosion( e.x, e.y, e.life )
			e.life+=2.0;

class DebrisManager extends Manager
	entityIsDead: ( entity ) ->
		return entity.y > 1200
		# TODO: fix this

	draw: ( renderer )->
		for i in [0..@collection.length-1] by 1
			e = @collection[i]
			renderer.drawDebris( e.x, e.y, e.radius, e.angle, e.highlight )
			e.highlight = 10



class Player
	constructor: () ->
		@x = 100;
		@y = 550;
		@width = 100;
		@height = 10;
		@left = @x - 50;
		@right = @x + 50;
		@top = @y - @height/2;
		@bottom = @y + @height/2;
		@vx = 0;

	draw: ( renderer ) ->
		renderer.drawPaddle( @x, @y, @width, @height )

	update: () ->
		@vx = mx-@x;
		@x = mx;
		@left = @x - @width;
		@right = @x + @width;

class Debris
	constructor: (@x, @y, @vx, @vy) ->
		@radius = Math.randomFloat(0,4)
		@highlight = 10;
		@vr = Math.randomFloat(-222, 222)
		@angle = 0;


	incHighlight: ( h ) ->
		@highlight += h;

	update: ( dt ) ->
		@x += (@vx*dt);
		@y += (@vy*dt);
		@vx *= 0.98;
		@vy *= 0.98;
		@angle += @vr;
		@vy += 1.5;

		# pt = physics.ballIntercept( @, player, @vx*dt, @vy*dt )
		# if(pt != null)
		# 	@y = pt.y
		# 	@vy = -@vy*0.5
		# 	@vx =
		# 	@vx += player.vx * 0.5;

class Ball

	speedMod = 1.0

	constructor: () ->
		@x = 200;
		@y = 400;
		@vx = -10.0;
		@vy = -30.0;
		@radius = 5;

	update: ( dt ) ->
		@x += @vx * dt * speedMod;
		@y += @vy * dt * speedMod;

	draw: ( renderer ) ->
		renderer.drawBall( @x, @y, @radius )

	bounce: ( dir, newpos ) ->
		if( dir == "hor" )
			@vx = -@vx
			@x = newpos
		if( dir == "vert" )
			@vy = -@vy
			@y = newpos


class Brick
	constructor:( @x, @y, blockSize ) ->
		@highlight = 0;
		@left = @x-blockSize;
		@right = @x+blockSize;
		@top = @y-blockSize;
		@bottom = @y+blockSize;
		@width = blockSize;
		@height = blockSize;
		@type = "brick"
		@markedForDeath = false

	update: () ->

	incHighlight: ( h ) ->
		@highlight += h;

class ExplosiveBrick extends Brick
	constructor:(@x, @y, blockSize) ->
		super(@x, @y, blockSize )
		@count = Math.randomFloat(0,3)
		@type = "explosive"

	update: ()->
		@count+=0.1

class Explosion
	constructor: (@x, @y) ->
		@life = 0;

	update: () ->

mouseXY = (e) ->
	mx = e.pageX;
	my = e.pageY;

mouseDown = (e) ->
	e.preventDefault();

draw = () ->
	webkitRequestAnimationFrame( draw )
	game.update()


window.onload = ->
	game = new Game()
	draw()
