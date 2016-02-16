#-------GLOBALS--------#

levelup = null
canvas = null
context = null
lightcanvas = null
lightcontext = null
d = null
startTime = null
paused = false
mx = 0
dt = 0.3
bricks = []
debris = []
explosions = []
delayers = []
lights = []
shake = 0;
blockSize = 6;
bricksLeft = 0;
player = null
ball = null
stats = null
physics = null


#-------CLASSES-------#


# TODO: Make this a mirror
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
		#context.strokeStyle = 'rgba(255,255,255,1.0)'
		if(paused == false)
			@x += @vx * dt;
			@y += @vy * dt;

		context.fillStyle = '#fff'
		#context.lineWidth = 2.0;
		#context.strokeStyle = 'rgba(0,0,0,1.0)'
		solidCircle( context, @x, @y, @radius )

class Brick
	constructor:( @x, @y ) ->
		@dark = 0;
		@left = @x-blockSize;
		@right = @x+blockSize;
		@top = @y-blockSize;
		@bottom = @y+blockSize;
		@width = blockSize;
		@height = blockSize;
		@glow = 0;

	incDark: ( dist ) ->
		@dark += Math.round(255 / (dist*0.1));

	draw: () ->
		context.fillStyle = 'rgba(' + (@dark) + ',' + (@dark) + ',' + (@dark+1) + ',1.0)'
		context.beginPath();
		context.rect(@left, @top, blockSize*2, blockSize*2 )
		context.fill();
		@dark = 0;

class ExplosiveBrick extends Brick
	constructor:(@x, @y) ->
		super(@x, @y)
		@count = 0;
		@gradient = context.createRadialGradient(0,0,8, 0,0, 40);
		@gradient.addColorStop(0, 'rgba(255,220,160,0.1)');
		@gradient.addColorStop(0.4, 'rgba(200,20,20,0.05)');
		@gradient.addColorStop(1, 'rgba(0,0,0,0.0)');

	drawGlow : () ->
		lightcontext.fillStyle = @gradient
		lightcontext.save()
		lightcontext.translate( @x, @y )
		solidCircle(lightcontext, 0, 0, 40)
		lightcontext.restore()

	draw: () ->
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
		context.strokeStyle = 'rgba(255,255,255,' + (1.0 - (@life*0.02)) + ')'
		strokedCircle( context, @x, @y, @life )

completeLevel = () ->
	$(levelup).css('opacity','1.0');
	$(levelup).css('left','0px');

mouseXY = (e) ->
	mx = e.pageX;

mouseDown = (e) ->
	e.preventDefault();

setupBricks = ->
	gap = blockSize * 2 + 3

	for x in [3..18] by 1
		for y in [3..14] by 1
			if(x != 13 and x != 8 and y != 8 and y != 9)
				bricksLeft++;
				if( Math.random() < 0.2 )
					bricks.push new ExplosiveBrick( x * gap, y * gap)
				else
					bricks.push new Brick( x * gap, y * gap)


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

destroyBrick = ( brick, source ) ->
	for i in [0..bricks.length-1] by 1
		if(bricks[i] == brick)
			bricks.splice( i, 1 )
	angle = Math.atan2( brick.y - source.y, brick.x - source.x )
	for n in [0..4] by 1
		vx = Math.cos(angle) * 20 + random(-5,5)
		vy = Math.sin(angle) * 20 + random(-5,5)
		debris.push new Debris( brick.x + random(-blockSize, blockSize), brick.y + random(-blockSize, blockSize), vx, vy );
	bricksLeft--;
	if(bricksLeft == 0)
		completeLevel();
		paused = true;


draw = () ->

	stats.begin();

	context.fillStyle = 'rgba(0,0,0,1.0)'
	context.fillRect(0,0,320,568)

	if(shake > 0)
		$('canvas').css('margin-left', random(-shake,shake) + 'px');
		$('canvas').css('margin-top', random(-shake,shake) + 'px');
		shake--;

	light();
	context.drawImage( lightcanvas, 0, 0)

	removers = [];

	dremovers = [];
	for i in [0..delayers.length-1] by 1
		delayers[i].delay--;
		if(delayers[i].delay <= 0)
			rem = [];
			rem.source = delayers[i].source;
			rem.brick = delayers[i].brick;
			removers.push( rem )
			dremovers.push( delayers[i] )


	for i in [0..dremovers.length-1] by 1
		delayers.splice( delayers.indexOf(dremovers[i]), 1)

	for i in [0..bricks.length-1] by 1
		b = bricks[i];
		b.draw();
		collision = physics.ballIntercept( ball, b, ball.vx*dt, ball.vy*dt );
		if(collision != null)
			if(collision.d == "left" or collision.d == "right")
				ball.x = collision.x;
				ball.vx = -ball.vx;
			if(collision.d == "top" or collision.d == "bottom")
				ball.y = collision.y;
				ball.vy = -ball.vy;

			rem = [];
			rem.source = ball;
			rem.brick = b;
			removers.push( rem )

			if(bricks[i] instanceof ExplosiveBrick)
				shake += 5;
				explosions.push new Explosion( b.x, b.y)
				for n in [0..bricks.length-1] by 1
					if(n != i)
						b2 = bricks[n];
						if( Math.random() < 1.0)
							dist =  distance( b.x, b.y, b2.x, b2.y)
							if( dist < 50)
								rem = [];
								rem.delay = Math.round( dist*0.4 )
								rem.source = b;
								rem.brick = b2;
								delayers.push( rem )

	for i in [0..removers.length-1] by 1
		a = removers[i].brick;
		destroyBrick( a, removers[i].source );


	physics.wallCollision();

	#----DRAW-----#
	paddleCollision = physics.ballIntercept( ball, player, ball.vx*dt, ball.vy*dt)
	if(paddleCollision != null)
		ball.y = paddleCollision.y;
		ball.vy = -ball.vy;
		ball.vx += player.vx * 0.01;

	ball.draw();
	lights[0].x = ball.x;
	lights[0].y = ball.y;
	player.draw();

	removers = [];
	for i in [0..debris.length-1] by 1
		debris[i].draw()
		if(debris[i].y > 568)
			removers.push( i )

	for i in [0..removers.length-1] by 1
		debris.splice( removers[i], 1 )

	removers = [];
	for i in [0..explosions.length-1] by 1
		explosions[i].draw()
		if(explosions[i].life >= 50)
			removers.push( explosions[i] )

	for i in [0..removers.length-1] by 1
		explosions.splice( explosions.indexOf(removers[i]), 1 )

	# d = new Date()
	# #console.log( d.getTime() - startTime );
	# time = d.getTime() - startTime;
	# secs = Math.floor(time/1000);
	# minis = time - (secs*1000);
	# $('#timer').text( secs + "." + minis )

	stats.end();


window.onload = ->

	#-----GLOBAL VARIABLES---------#

	levelup = document.getElementById('levelup')
	canvas = document.getElementById('canvas')
	context = canvas.getContext('2d')
	context.lineJoin = "round"

	lightcanvas = document.createElement('canvas')
	lightcontext = lightcanvas.getContext('2d')
	lightcontext.lineCap = 'square'
	lightcanvas.width = 320;
	lightcanvas.height = 568;

	d = new Date();
	startTime = d.getTime();

	#----GAME OBJECTS-------#

	player = new Player();
	ball = new Ball();
	physics = new Physics();

	lights.push new LightSource( ball.x, ball.y, 100 );
	# lights.push new LightSource( 60,  130, 100 )
	# lights.push new LightSource( 260, 130, 100 )

	setupBricks()


	stats = new Stats();
	stats.setMode( 0 );
	document.body.appendChild( stats.domElement );

	#--------GAMEPLAY FUNCTIONS--------#



	canvas.addEventListener("touchstart", mouseDown, false)
	canvas.addEventListener("mousemove", mouseXY, true);
	canvas.addEventListener("touchmove", mouseXY, true)
	canvas.addEventListener("mousedown", mouseDown, false )

	setInterval(draw, 1000/30)
