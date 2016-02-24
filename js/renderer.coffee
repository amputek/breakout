class Renderer

	windowWidth = 320
	windowHeight = 568

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


	constructor: ( canvas, w, h ) ->

		windowWidth = w
		windowHeight = h

		canvas.width = w
		canvas.height = h
		canvas.style.width = w
		canvas.style.height = h

		@context = canvas.getContext('2d')

		@lightcanvas = document.createElement('canvas')
		@lightcontext = @lightcanvas.getContext('2d')
		@lightcontext.lineCap = 'square'
		@lightcanvas.width = windowWidth;
		@lightcanvas.height = windowHeight;


		@lightgradient = @lightcontext.createRadialGradient(0,0,10, 0,0, 100);
		@lightgradient.addColorStop(0, 'rgba(255,225,200,1.0)');
		@lightgradient.addColorStop(0.03, 'rgba(255,220,160,1.0)');
		@lightgradient.addColorStop(0.3, 'rgba(160,200,250,0.5)');
		@lightgradient.addColorStop(1.0, 'rgba(0,0,0,0.0)');

		@lightsources = []

	addLights: (lights) ->
		for i in [0..lights.length-1] by 1
			canvas = document.createElement('canvas')
			context = canvas.getContext('2d')
			canvas.width = windowWidth;
			canvas.height = windowHeight
			@lightsources.push( { canvas: canvas, context: context } )


	drawBackground: () ->
		@context.fillStyle = 'rgba(0,0,0,1.0)'
		@context.fillRect(0,0,windowWidth,windowHeight)


	drawLightGlow: (i,x,y,r) ->
		@lightsources[i].context.clearRect(0,0,windowWidth,windowHeight);
		@lightsources[i].context.fillStyle = @lightgradient;
		@lightsources[i].context.save();
		@lightsources[i].context.translate( x, y );
		@lightsources[i].context.scale( r / 100, r / 100 )
		solidCircle(@lightsources[i].context, 0, 0, r );
		@lightsources[i].context.restore();

	drawLight: ( lights ) ->
		@lightcontext.clearRect(0,0,windowWidth,windowHeight)
		@lightcontext.globalCompositeOperation = "lighter"
		for i in [0..lights.length-1] by 1
			@lightcontext.drawImage( @lightsources[i].canvas, 0, 0 )

		@context.drawImage( @lightcanvas, 0, 0)

	drawShadow: ( i, dist, a, b, fb, fa, c ) ->

		@lightsources[i].context.strokeStyle = 'rgba(255,255,255,' + 1.0 / (dist*0.05) + ')'
		@lightsources[i].context.fillStyle = 'rgba(255,255,255,' + 1.0 / (dist*0.05) + ')'
		@lightsources[i].context.lineWidth = 15.0 / (dist*0.2)

		if( c.x != undefined )
			line( @lightsources[i].context, a.x, a.y, c.x, c.y )
			line( @lightsources[i].context, b.x, b.y, c.x, c.y )
			solidCircle( @lightsources[i].context, c.x, c.y, @lightsources[i].context.lineWidth/2 )
		else
			line( @lightsources[i].context, a.x, a.y, b.x, b.y )


		# draw shadow

		@lightsources[i].context.fillStyle = '#000'
		@lightsources[i].context.beginPath()
		@lightsources[i].context.moveTo(a.x, a.y);
		if( c != undefined )
			@lightsources[i].context.lineTo(c.x, c.y);
		@lightsources[i].context.lineTo(b.x, b.y)
		@lightsources[i].context.lineTo(fb.x,fb.y)
		@lightsources[i].context.lineTo(fa.x,fa.y)
		@lightsources[i].context.fill()

	drawBall : (x,y,r) ->
		@context.fillStyle = "white"
		solidCircle( @context, x, y, r )

	drawPaddle : ( x, y, w, h ) ->
		@context.fillStyle = 'rgba(50,50,50,1.0)'
		@context.beginPath();
		@context.rect( x - w, y - h/2, w*2, h)
		@context.fill();

	drawBrick : (type,left,top,size,dark, count) ->
		if(type == "brick")
			@context.fillStyle = 'rgba(' + dark + ',' + (dark+5) + ',' + (dark+5) + ',1.0)'
			@context.beginPath();
			@context.rect(left, top, size*2, size*2 )
			@context.fill();

		if(type == "explosive")
			pulse = Math.round(Math.sin(count) * 50);
			right = left+size*2
			bottom = top+size*2

			@context.strokeStyle = 'rgba(' + (200 + dark + pulse) + ',' + (100 + dark + pulse) + ',' + (dark + pulse) + ',0.4)'
			@context.lineWidth = 2.0;
			@context.fillStyle = 'rgba(' + (100 + dark) + ',' + (0 + dark) + ',' + (dark+1) + ',1.0)'
			@context.beginPath();
			@context.rect(left, top, size*2, size*2 )
			@context.fill();
			@context.stroke();
			line(@context, left+3, top+3, right-3, bottom-3)
			line(@context, right-3, top+3, left+3, bottom-3)

	drawExplosion: (x,y,life) ->
		@context.lineWidth = 2.0;
		@context.strokeStyle = 'rgba(255,' + (255-life*3) + ',0,' + (1.0 - (life*0.02)) + ')'
		@context.fillStyle = 'rgba(255,' + (255-life*3) + ',0,' + (0.5 - (life*0.01)) + ')'
		strokedCircle( @context, x, y, life )
		solidCircle( @context, x, y, life )

	drawDebris: ( x, y, radius, angle, dark ) ->
		@context.fillStyle = 'rgba(' + dark + ',' + (dark+5) + ',' + (dark+5) + ',1.0)'
		@context.beginPath();
		@context.save();
		@context.translate( x, y )
		@context.rotate( angle )
		@context.rect( 0 - radius, 0 - radius, radius*2, radius*2)
		@context.fill();
		@context.restore();
