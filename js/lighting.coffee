class LightSource
	constructor: (@x, @y, @radius) ->
		@tempcanvas = document.createElement('canvas')
		@tempcontext = @tempcanvas.getContext('2d')
		@tempcanvas.width = lightcanvas.width;
		@tempcanvas.height = lightcanvas.height;
		@gradient = context.createRadialGradient(0,0,10, 0,0, @radius);
		@gradient.addColorStop(0, 'rgba(255,220,160,1.0)');
		@gradient.addColorStop(0.3, 'rgba(160,200,250,0.5)');
		@gradient.addColorStop(1, 'rgba(0,0,0,0.0)');

	draw: () ->
		@tempcontext.clearRect(0,0,320,568);
		@tempcontext.fillStyle = @gradient;
		@tempcontext.save();
		@tempcontext.translate( @x, @y );
		solidCircle(@tempcontext, 0, 0, @radius );
		@tempcontext.restore();


calculateCorners = ( source, center, limit, dist, ctx) ->

	if( dist < limit)
		left = center.left;
		right = center.right;
		top = center.top;
		bottom = center.bottom;
		angle = Math.atan2( center.y - source.y, center.x - source.x)
		ctx.strokeStyle = 'rgba(255,255,255,' + 1.0 / (dist*0.05) + ')'
		ctx.lineWidth = 15.0 / (dist*0.2);

		#console.log( center.x, center.y, center.width )

		if( source.y < center.y and Math.abs(center.x - source.x) < center.width)
			ex = left
			ey = top
			ex1 = right
			ey1 = top
			#strokedCircle( ctx, ex,ey,10 );
			line( ctx, ex,ey,ex1,ey1)
		#	console.log( ey );
		else if( source.y > center.y and Math.abs(center.x - source.x) < center.width)
			ex = left
			ey = bottom
			ex1 = right
			ey1 = bottom
			#console.log( ey );
			line( ctx, ex,ey,ex1,ey1)
		else if( source.x < center.x and Math.abs(center.y - source.y) < center.height)
			ex = left
			ey = bottom
			ex1 = left
			ey1 = top
			line( ctx, ex,ey,ex1,ey1)
		else if( source.x > center.x and Math.abs(center.y - source.y) < center.height)
			ex = right
			ey = bottom
			ex1 = right
			ey1 = top
			line( ctx, ex,ey,ex1,ey1)
		else if(angle > 0 and angle < Math.PI/2)
			ex = left
			ey = bottom
			ex1 = right
			ey1 = top
			line( ctx, left,bottom,left,top)
			line( ctx, left,top,right,top)
		else if(angle > Math.PI/2 and angle < Math.PI)
			ex = left
			ey = top
			ex1 = right
			ey1 = bottom
			line( ctx, left,top,right,top)
			line( ctx, right,top,right,bottom)
		else if(angle > -Math.PI and angle < -Math.PI/2)
			ex = right
			ey = top
			ex1 = left
			ey1 = bottom
			line( ctx, right,top,right,bottom)
			line( ctx, right,bottom,left,bottom)
		else if(angle > -Math.PI/2 and angle < 0)
			ex = right
			ey = bottom
			ex1 = left
			ey1 = top
			line( ctx, right,bottom,left,bottom)
			line( ctx, left,bottom,left,top)

		newangle = Math.atan2( ey - source.y, ex - source.x );
		fx = source.x + Math.cos( newangle ) * limit
		fy = source.y + Math.sin( newangle ) * limit

		newangle1 = Math.atan2( ey1 - source.y, ex1 - source.x );
		fx1 = source.x + Math.cos( newangle1 ) * limit
		fy1 = source.y + Math.sin( newangle1 ) * limit

		ctx.beginPath()
		ctx.moveTo(ex, ey);
		ctx.lineTo(ex1,ey1)
		ctx.lineTo(fx1,fy1)
		ctx.lineTo(fx,fy)

		# lineargradient = ctx.createLinearGradient( center.x, center.y, (fx+fx1)/2, (fy+fy1)/2 );
		# lineargradient.addColorStop(0, 'rgba(0,0,0,0.8)');
		# lineargradient.addColorStop(1, 'rgba(0,0,0,0.0)');
		# ctx.fillStyle = lineargradient;
		ctx.fillStyle = '#000'
		ctx.fill()


light = () ->

	lightcontext.clearRect(0,0,320,568)
	lightcontext.globalCompositeOperation = "lighter"

	for i in [0..lights.length-1] by 1
		con = lights[i].tempcontext;
		lights[i].draw();

		dist = distance(ball.x,ball.y,player.x,player.y)
		calculateCorners( lights[0], player, 1500, dist, con );

		for n in [0..bricks.length-1] by 1
			o = bricks[n]
			dist = distance(o.x, o.y, lights[i].x, lights[i].y)
			o.incDark( dist );
			calculateCorners( lights[i], o, lights[i].radius, distance( o.x, o.y, lights[i].x, lights[i].y), con);

		for n in [0..debris.length-1] by 1
			debris[n].incDark( distance( debris[n].x, debris[n].y, lights[i].x, lights[i].y))

		lightcontext.drawImage( lights[i].tempcanvas, 0, 0 )

		# for i in [0..bricks.length-1] by 1
		# 	if( bricks[i] instanceof ExplosiveBrick)
		# 		bricks[i].drawGlow();
