#-------GLOBALS--------#

canvas = null
context = null
paused = false
mx = 0
dt = 0.3

debris = []
explosions = []
shake = 0;

player = null
ball = null
stats = null
physics = null
lighting = null
bricks = null

#-------CLASSES-------#

cleanGarbage = ( collection, isDead ) ->
	removers = []
	for i in [0..collection.length-1] by 1
		if( isDead( collection[i] ) )
			removers.push collection[i]

	for i in [0..removers.length-1] by 1
		collection.splice( collection.indexOf(removers[i]), 1)

	return collection


class BricksManager
	constructor: ( @blockSize ) ->
		@bricksLeft = 0
		@bricks = []
		@bricksToKill = []

	setup: () ->
		gap = @blockSize * 2 + 3

		for x in [3..18] by 1
			for y in [3..14] by 1
				if(x != 13 and x != 8 and y != 8 and y != 9)
					@bricksLeft++;
					if( Math.random() < 0.2 )
						@bricks.push new ExplosiveBrick( x * gap, y * gap, @blockSize )
					else
						@bricks.push new Brick( x * gap, y * gap, @blockSize )

	killBrick: ( brick, source, delay  ) ->
		brickObj = [];
		brickObj.source = source;
		brickObj.brick = brick;
		brickObj.delay = delay
		@bricksToKill.push brickObj
		brick.markedForDeath = true

	update: ( ) ->

		for i in [0..@bricks.length-1] by 1
			b = @bricks[i];
			b.draw( @blockSize );
			collision = physics.ballIntercept( ball, b, ball.vx*dt, ball.vy*dt );
			if(collision != null)
				if(collision.d == "left" or collision.d == "right")
					ball.x = collision.x;
					ball.vx = -ball.vx;
				if(collision.d == "top" or collision.d == "bottom")
					ball.y = collision.y;
					ball.vy = -ball.vy;


				@killBrick( b, ball, 0 )


		for i in [0..@bricksToKill.length-1] by 1
			btk = @bricksToKill[i]
			btk.delay--
			if( btk.delay <= 0 )
				@destroyBrick btk
				if btk.brick instanceof ExplosiveBrick
					b = btk.brick
					shake += 5;
					explosions.push new Explosion( b.x, b.y)
					for n in [0..@bricks.length-1] by 1
						if(n != i)
							b2 = @bricks[n];
							if( !b2.markedForDeath )
								dist = distance( b.x, b.y, b2.x, b2.y )
								if dist < 50 && random(0,1) < 0.5
									@killBrick( b2, b, Math.round( dist * 0.4) )


		@bricksToKill = cleanGarbage( @bricksToKill, ((a)->a.delay<=0) )


	destroyBrick: ( remover ) ->
		for i in [0..@bricks.length-1] by 1
			if(@bricks[i] == remover.brick)
				@bricks.splice( i, 1 )
		angle = Math.atan2( remover.brick.y - remover.source.y, remover.brick.x - remover.source.x )
		for n in [0..4] by 1
			vx = Math.cos(angle) * 20 + random(-5,5)
			vy = Math.sin(angle) * 20 + random(-5,5)
			debris.push new Debris( remover.brick.x + random(-@blockSize, @blockSize), remover.brick.y + random(-@blockSize, @blockSize), vx, vy );
		@bricksLeft--;
		# if(@bricksLeft == 0)
			# paused = true;

class Player
	constructor: () ->
		@x = 100;
		@y = 500;
		@width = 100;
		@height = 10;
		@left = @x - 50;
		@right = @x + 50;
		@top = @y - @height/2;
		@bottom = @y + @height/2;
		@vx = 0;

	draw: () ->
		@vx = mx-@x;
		@x = mx;
		context.fillStyle = 'rgba(50,50,50,1.0)'
		context.beginPath();
		context.rect( @x - @width, @y-@height/2, @width*2, @height)
		context.fill();
		@left = @x - @width;
		@right = @x + @width;

class Debris
	constructor: (@x, @y, @vx, @vy) ->
		@radius = Math.random() * 4;
		@dark = 10;
		@vr = random(-0.2, 0.2)
		@angle = 0;

	incDark: ( dist ) ->
		@dark += Math.round(255 / (dist*0.1));

	draw: () ->
		@x += (@vx*dt);
		@y += (@vy*dt);
		@vx *= 0.98;
		@vy *= 0.98;
		@angle += @vr;
		@vy += 1.5;

		context.fillStyle = 'rgba(' + @dark + ',' + @dark + ',' + @dark + ',1.0)'
		context.beginPath();
		context.save();
		context.translate( @x, @y )
		context.rotate( @angle )
		context.rect( 0 - @radius, 0 - @radius, @radius*2, @radius*2)
		context.fill();
		context.restore();
		@dark = 10;

class Ball
	constructor: () ->
		@x = 200;
		@y = 400;
		@vx = 2.0;
		@vy = -20.0;
		@radius = 5;

	draw: () ->
		context.fillStyle = "white"
		@x += @vx * dt;
		@y += @vy * dt;
		solidCircle( context, @x, @y, @radius )

class Brick
	constructor:( @x, @y, blockSize ) ->
		@dark = 0;
		@left = @x-blockSize;
		@right = @x+blockSize;
		@top = @y-blockSize;
		@bottom = @y+blockSize;
		@width = blockSize;
		@height = blockSize;
		@glow = 0;
		@type = "brick"
		@markedForDeath = false

	incDark: ( dist ) ->
		@dark += Math.round(255 / (dist*0.1));

	draw: ( blockSize ) ->
		context.fillStyle = 'rgba(' + (@dark) + ',' + (@dark) + ',' + (@dark+1) + ',1.0)'
		context.beginPath();
		context.rect(@left, @top, blockSize*2, blockSize*2 )
		context.fill();
		@dark = 0;

class ExplosiveBrick extends Brick
	constructor:(@x, @y, blockSize) ->
		super(@x, @y, blockSize )
		@count = Math.random() * 3;
		@gradient = context.createRadialGradient(0,0,8, 0,0, 40);
		@gradient.addColorStop(0, 'rgba(255,220,160,0.1)');
		@gradient.addColorStop(0.4, 'rgba(200,20,20,0.05)');
		@gradient.addColorStop(1, 'rgba(0,0,0,0.0)');
		@type = "explosive"

	drawGlow : () ->
		lighting.context.fillStyle = @gradient
		lighting.context.save()
		lighting.context.translate( @x, @y )
		solidCircle(lighting.context, 0, 0, 40)
		lighting.context.restore()

	draw: ( blockSize ) ->
		@count+=0.1;
		pulse = Math.round(Math.sin(@count) * 50);

		context.strokeStyle = 'rgba(' + (200 + @dark + pulse) + ',' + (100 + @dark + pulse) + ',' + (@dark + pulse) + ',0.4)'
		context.lineWidth = 2.0;
		context.fillStyle = 'rgba(' + (100 + @dark) + ',' + (0 + @dark) + ',' + (@dark+1) + ',1.0)'
		context.beginPath();
		context.rect(@left, @top, blockSize*2, blockSize*2 )
		context.fill();
		context.stroke();
		line(context, @left+3, @top+3, @right-3, @bottom-3)
		line(context, @right-3, @top+3, @left+3, @bottom-3)
		@dark = 0;

class Explosion
	constructor: (@x, @y) ->
		@life = 0;

	draw: () ->
		@life+=2.0;
		context.lineWidth = 2.0;
		context.strokeStyle = 'rgba(255,' + (255-@life*3) + ',0,' + (1.0 - (@life*0.02)) + ')'
		context.fillStyle = 'rgba(255,' + (255-@life*3) + ',0,' + (0.5 - (@life*0.01)) + ')'
		strokedCircle( context, @x, @y, @life )
		solidCircle( context, @x, @y, @life )

class Physics

	constructor: () ->

	ballIntercept: (bal, rec, nx, ny) ->
		pt = null;
		if( nx < 0)
			pt = intercept( bal.x, bal.y, bal.x+nx, bal.y+ny,
							rec.right+bal.radius, rec.top - bal.radius, rec.right+bal.radius, rec.bottom+bal.radius, "right");
		else if( nx > 0)
			pt = intercept( bal.x, bal.y, bal.x+nx, bal.y+ny,
							rec.left-bal.radius, rec.top - bal.radius, rec.left-bal.radius, rec.bottom+bal.radius, "left");
		if( pt == null )
			if(ny < 0)
				pt = intercept( bal.x, bal.y, bal.x+nx, bal.y+ny,
								rec.left-bal.radius, rec.bottom+bal.radius, rec.right+bal.radius, rec.bottom+bal.radius, "bottom");
			else if(ny > 0)
				pt = intercept( bal.x, bal.y, bal.x+nx, bal.y+ny,
								rec.left-bal.radius, rec.top-bal.radius, rec.right+bal.radius, rec.top-bal.radius, "top");

		return pt;

	intercept = (x1, y1, x2, y2, x3, y3, x4, y4, d) ->
		denom = ((y4-y3) * (x2-x1)) - ((x4-x3) * (y2-y1));
		if (denom != 0)
			ua = (((x4-x3) * (y1-y3)) - ((y4-y3) * (x1-x3))) / denom;
			if ((ua >= 0) && (ua <= 1))
				ub = (((x2-x1) * (y1-y3)) - ((y2-y1) * (x1-x3))) / denom;
				if ((ub >= 0) && (ub <= 1))
					x = x1 + (ua * (x2-x1));
					y = y1 + (ua * (y2-y1));
					result = [];
					result.x = x;
					result.y = y;
					result.d = d;

					return result;
		return null;


	wallCollision: () ->
		if(ball.y < 10)
			ball.y = 10;
			ball.vy = -ball.vy

		if(ball.x > 310)
			ball.x = 310;
			ball.vx = -ball.vx

		if(ball.x < 10)
			ball.x = 10;
			ball.vx = -ball.vx



mouseXY = (e) ->
	mx = e.pageX;

mouseDown = (e) ->
	e.preventDefault();

draw = () ->

	webkitRequestAnimationFrame(draw)

	stats.begin();

	context.fillStyle = 'rgba(0,0,0,1.0)'
	context.fillRect(0,0,320,568)

	if(shake > 0)
		canvas.style.marginLeft = random(-shake,shake) + 'px'
		canvas.style.marginTop = random(-shake,shake) + 'px'
		shake--;

	lighting.light( bricks.bricks )
	context.drawImage( lighting.canvas, 0, 0)

	bricks.update( )

	physics.wallCollision();

	#----DRAW-----#
	paddleCollision = physics.ballIntercept( ball, player, ball.vx*dt, ball.vy*dt)
	if(paddleCollision != null)
		ball.y = paddleCollision.y;
		ball.vy = -ball.vy;
		ball.vx += player.vx * 0.01;

	ball.draw();
	lighting.lights[0].x = ball.x;
	lighting.lights[0].y = ball.y;
	player.draw();

	for i in [0..debris.length-1] by 1
		debris[i].draw()

	debris = cleanGarbage( debris, ((a)->a.y>568) )

	for i in [0..explosions.length-1] by 1
		explosions[i].draw()

	explosions = cleanGarbage( explosions, ((a)->a.life>50) )

	stats.end();


window.onload = ->

	#-----GLOBAL VARIABLES---------#

	levelup = document.getElementById('levelup')
	canvas = document.getElementById('canvas')
	context = canvas.getContext('2d')
	context.lineJoin = "round"

	lighting = new Lighting()

	#----GAME OBJECTS-------#

	player = new Player();
	ball = new Ball();
	physics = new Physics();
	bricks = new BricksManager( 6 )

	lighting.initLights()
	bricks.setup()

	stats = new Stats();
	stats.setMode( 0 );
	document.body.appendChild( stats.domElement );

	#--------GAMEPLAY FUNCTIONS--------#
	canvas.addEventListener("touchstart", mouseDown, false)
	canvas.addEventListener("mousemove", mouseXY, true);
	canvas.addEventListener("touchmove", mouseXY, true)
	canvas.addEventListener("mousedown", mouseDown, false )

	draw()
