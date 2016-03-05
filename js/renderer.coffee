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

	make = (x) ->
		if( x < 0 )
			x = 0
		if( x > 255)
			x = 255
		return Math.round(x)

	rgba = (r,g,b,a) ->
		if( a == undefined )
			a = 1.0
		return 'rgba(' + make(r) + ',' + make(g) + ',' + make(b) + ',' + a + ')'

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
			# context.globalAlpha = lights[i].lum




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

	# drawShadow: ( i, dist, a, b, fb, fa, c ) ->
	drawShadow: ( i, s ) ->

		@lightsources[i].context.strokeStyle = 'rgba(255,255,255,' + 1.0 / (s.dist*0.05) + ')'
		@lightsources[i].context.fillStyle = 'rgba(255,255,255,' + 1.0 / (s.dist*0.05) + ')'
		@lightsources[i].context.lineWidth = 15.0 / (s.dist*0.2)

		if( s.cornerC.x != undefined )
			line( @lightsources[i].context, s.cornerA.x, s.cornerA.y, s.cornerC.x, s.cornerC.y )
			line( @lightsources[i].context, s.cornerB.x, s.cornerB.y, s.cornerC.x, s.cornerC.y )
			solidCircle( @lightsources[i].context, s.cornerC.x, s.cornerC.y, @lightsources[i].context.lineWidth/2 )
		else
			line( @lightsources[i].context, s.cornerA.x, s.cornerA.y, s.cornerB.x, s.cornerB.y )


		# draw shadow

		@lightsources[i].context.fillStyle = '#000'
		@lightsources[i].context.beginPath()
		@lightsources[i].context.moveTo(s.cornerA.x, s.cornerA.y);
		if( s.cornerC != undefined )
			@lightsources[i].context.lineTo(s.cornerC.x, s.cornerC.y);
		@lightsources[i].context.lineTo(s.cornerB.x, s.cornerB.y)
		@lightsources[i].context.lineTo(s.cornerFarB.x,s.cornerFarB.y)
		@lightsources[i].context.lineTo(s.cornerFarA.x,s.cornerFarA.y)
		@lightsources[i].context.fill()

	drawBall : (x,y,r) ->
		@context.fillStyle = "white"
		solidCircle( @context, x, y, r )

	drawPaddle : ( x, y, w, h ) ->
		@context.fillStyle = 'rgba(50,50,50,1.0)'
		@context.beginPath();
		@context.rect( x - w/2, y - h/2, w, h)
		@context.fill();

	drawBrick : (type,left,top,size,highlight,count) ->
		# highlight = 10
		if(type == "brick")
			@context.fillStyle = rgba(highlight+6,highlight+6,highlight+16)
			@context.beginPath();
			@context.rect(left, top, size*2, size*2 )
			@context.fill();

		if(type == "explosive")
			p = Math.round(Math.sin(count) * 10 )
			# p = 0
			right = left+size*2
			bottom = top+size*2

			@context.strokeStyle = rgba( 10+highlight*3+p , highlight*1.5   , highlight*0.0 )
			@context.fillStyle   = rgba( 10+highlight*1.5 , highlight*0.75  , highlight*0.1 )
			@context.lineWidth = 2.0;

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

	drawDebris: ( x, y, radius, angle, highlight ) ->
		@context.fillStyle = rgba( highlight+6, highlight+6, highlight+16 )
		@context.beginPath();
		@context.save();
		@context.translate( x, y )
		@context.rotate( angle )
		@context.rect( 0 - radius, 0 - radius, radius*2, radius*2)
		@context.fill();
		@context.restore();
