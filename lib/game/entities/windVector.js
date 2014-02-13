ig.module(
	'game.entities.windVector'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
	EntityWindVector = ig.Entity.extend({
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		radius: 10,
		gravityFactor: 0,
		scale: 1.3,
		drawnOnce: false,
		name: "box2dfalse",
		power: 0,
		positionConstant: 1.0,
		hasBlown: false,
		blowing: false,
		vector: { x: 0, y: 0 },
		zIndex: 1010,
		waveSwitch: false,
		waveCount: 4,
		sortZindex: true,

		init: function( x, y, settings ){
			this.timer = new ig.Timer();
			this.blowTimer = new ig.Timer();
			this.blowTimer.pause();
			this.waveTimer = new ig.Timer();
			this.parent( x, y, settings );
		},
		
		update: function(){
			
        	if (this.blowing == true){;
        		this.blow();
        	}
        	else{
        		//accumulate power over time - power == seconds
        		this.power = this.timer.delta() * 50;
        	}

			this.parent();
		},

		blow: function(){
			//apply wind during the timer, else clean up after the wind
			if( this.blowTimer.delta() > 0 && this.blowTimer.delta() < ig.game.breaths[ig.game.breathCount].o ){
				this.spawnWindParticles();
				if(this.blowTimer.delta() > 0.3){
					this.applyWindToBodies();
				}
			}
			else if (this.blowTimer.delta() > ig.game.breaths[ig.game.breathCount].o){
				this.kill();
			}
			
			
		},

		draw: function(){
			if(this.drawnOnce == false){
				this.mouseX = ig.system.getDrawPos( this.pos.x - ig.game.screen.x );
				this.mouseY = ig.system.getDrawPos( this.pos.y - ig.game.screen.y );
				this.originX = this.mouseX;
				this.originY = this.mouseY;
				this.drawnOnce = true;
			}
			//get relative distance from new origin
			var distanceX = this.mouseX - this.originX;
			var distanceY = this.mouseY - this.originY;
			//mirror the co-ordinates
			distanceX = - 1.0 * distanceX;
			distanceY = - 1.0 * distanceY;
			//add mirrored vector to original vector
			var distanceLength = Math.sqrt(Math.pow(distanceX, 2.0) + Math.pow(distanceY, 2.0));
			//grab the unit vector
			var unitX = null;
			if (distanceLength != 0) {
				unitX = distanceX / distanceLength;
				unitY = distanceY / distanceLength;
			} else {
				unitX = 0.0;
				unitY = 0.0;
			}

			/*
			 * Colors:
			 * - originFillColor   : the fill color of the origin dot
			 * - pointerStrokeColor: the stroke color of the pointer and all the dots
			 * - pointerFillColor  : the fill color of the pointer and the dots
			 * - dropShadowColor   : the color of drop-shadows
			 */
			var originFillColor    = "rgba(255, 255, 255, 1  )"; /* white */
			var pointerStrokeColor = "rgba(255, 255, 255, 1  )"; /* white */
			var pointerFillColor   = "rgba(255, 255, 255, 1  )"; /* white */
			var dropShadowColor    = "rgba(  0,   0,   0, 0.3)"; /* translucent black */

			/* Drop shadow vector */
			var dropShadowX = -1;
			var dropShadowY =  1;

			/*
			 * Pointer furthering and scaling coefficients:
			 * - furtheringDistance       : the distance of the tip of the triangle from the origin
			 * - baseFurtheringCoefficient: the distance of the center of the
			 *   triangle's base from the origin as a proportion of 'furtheringDistance'
			 * - baseWidthCoefficent      : the proportion of 'furtheringDistance'
			 *   that is the length of the base of the pointer triangle
			 */
			var furtheringDistance        = this.power * this.positionConstant;
			var baseFurtheringCoefficient = 0.8;
			var baseWidthCoefficient      = 0.1;

			/* Dots settings:
			 * - dotDistance    : the distance between two dots
			 * - dotRaidus      : the radius of a dot
			 * - originDotRadius: the radius of the origin dot
			 */
			var dotDistance     = 15;
			var dotRadius       =  2.5;
			var originDotRadius =  4;

			/*
			 * Triangle display points:
			 *  - tip : furthest bit of the triangle
			 *  - base: center of the triangle's base
			 *  - a   : left base corner
			 *  - b   : right base corner
			 */
			var tipX = this.originX + unitX * furtheringDistance;
			var tipY = this.originY + unitY * furtheringDistance;

			var distanceFromOriginToBase = baseFurtheringCoefficient * furtheringDistance;
			var baseX = this.originX + unitX * distanceFromOriginToBase;
			var baseY = this.originY + unitY * distanceFromOriginToBase;

			var halfBaseWidth = baseWidthCoefficient * furtheringDistance;
			var aX = baseX + unitY * halfBaseWidth;
			var aY = baseY - unitX * halfBaseWidth;
			var bX = baseX - unitY * halfBaseWidth;
			var bY = baseY + unitX * halfBaseWidth;

			/* graphical context */
			var ctx = ig.system.context;

			/* save state to restore it at the end of the function*/
			ctx.save();

			/* auxiliary: draw triangle */
			drawTriangle = function(pointA, pointB, pointC, strokeColor, fillColor) {
				ctx.strokeStyle = strokeColor;
				ctx.fillStyle   = fillColor;
				ctx.beginPath();
				ctx.moveTo( pointA.x, pointA.y )
				ctx.lineTo( pointB.x, pointB.y )
				ctx.lineTo( pointC.x, pointC.y )
				ctx.closePath();
				ctx.stroke();
				ctx.fill();
			};

			/* drawing the arrow */
			/* - drop shadow */
			drawTriangle(
				{ x: tipX + dropShadowX, y: tipY  + dropShadowY},
				{ x:   aX + dropShadowX, y:   aY  + dropShadowY},
				{ x:   bX + dropShadowX, y:   bY  + dropShadowY},
				dropShadowColor,
				dropShadowColor);
			/* - actual pointer */
			drawTriangle(
				{ x: tipX, y: tipY },
				{ x:   aX, y:   aY },
				{ x:   bX, y:   bY },
				pointerStrokeColor,
				pointerFillColor);

			/* auxiliary: draw circle */
			drawCircle = function(x, y, radius, strokeColor, fillColor) {
				ctx.strokeStyle = strokeColor;
				ctx.fillStyle   = fillColor;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.arc(ig.system.getDrawPos(x), ig.system.getDrawPos(y) , radius * ig.system.scale, 0 , Math.PI * 2 );
				ctx.closePath();
				ctx.stroke();
				ctx.fill();
			};

			/* display initial origin dot */
			/* - drop shadow */
			drawCircle(
				this.originX + dropShadowX,
				this.originY + dropShadowY,
				originDotRadius,
				dropShadowColor,
				dropShadowColor);
			/* - actual dot */
			drawCircle(
				this.originX,
				this.originY,
				originDotRadius,
				pointerStrokeColor,
				originFillColor);

			/*
			 * Dot line
			 */
			var distanceFromOrigin = dotDistance;
			var dotDeltaX = unitX * dotDistance;
			var dotDeltaY = unitY * dotDistance;
			var dotX = this.originX + dotDeltaX;
			var dotY = this.originY + dotDeltaY;
			while (distanceFromOrigin < (distanceFromOriginToBase - dotRadius * 2.0)) {
				drawCircle(dotX + dropShadowX, dotY + dropShadowY, dotRadius, dropShadowColor, dropShadowColor);
				drawCircle(dotX, dotY, dotRadius, pointerStrokeColor, pointerFillColor);
				dotX += dotDeltaX;
				dotY += dotDeltaY;
				distanceFromOrigin += dotDistance;
			}

			/* restore state */
			ctx.restore();

			//store distance x & y in order to work out direction of force to apply
			this.vector = { x: unitX  , y: unitY  };
			this.particleVector = { x: unitX  , y: unitY  };

			this.parent();
		},

		adjustVector: function(){
			//adjust vector so that time held down controls power
			this.vector.x = this.vector.x * this.power;
			this.vector.y = this.vector.y * this.power;
		},

		applyWindToBodies: function(){
			//take the vector produced by mouse movement
			//apply it to every entity 
			for ( var i=0 ; i < ig.game.entities.length ; i++ ){
				var body = ig.game.entities[i].body;
				switch(ig.game.entities[i].name){
					/////////////////////////////
					case 'box2dfalse':
						//do nothing
					break;
					/////////////////////////////
					case 'BOAT':
						if( ig.game.entities[i].state == "ON" ){

						}
						else{

						}

					break;
					/////////////////////////////
					case 'SAIL':
						if( ig.game.entities[i].state == "ON" ){
							var windVector = new Box2D.Common.Math.b2Vec2( this.vector.x * 12  , this.vector.y * 12 );
							var applicationPointOnBody = new Box2D.Common.Math.b2Vec2( body.GetPosition().x , body.GetPosition().y  );
							body.ApplyForce( windVector , applicationPointOnBody );
						}
						else{

						}
					break;
					/////////////////////////////
					case 'NPCBOAT':
						if( ig.game.entities[i].state == "ON" ){

						}
						else{

						}
					break;
					/////////////////////////////
					case 'NPCSAIL':
						if( ig.game.entities[i].state == "ON" ){
							var windVector = new Box2D.Common.Math.b2Vec2( this.vector.x * 12  , this.vector.y * 12 );
							var applicationPointOnBody = new Box2D.Common.Math.b2Vec2( body.GetPosition().x , body.GetPosition().y  );
							body.ApplyForce( windVector , applicationPointOnBody );
						}
						else{

						}
					break;
				}

				
			}
		},

		spawnWindParticles: function(){
			//if it's under a certain power thresh, don't spawn
			//console.log(this.power);
			if( this.power >= 40 ){
				//get angle of wind
				this.rads = Math.atan2(this.particleVector.y,this.particleVector.x) - Math.PI;

				if( this.waveTimer.delta() <= Math.random() * 0.1 ){
					if( this.waveSwitch == false ){
						for( var i = 0 ; i < this.waveCount ; i ++ ){
							var x = ig.game.screen.x + Math.random() * 320;
							var y = ig.game.screen.y + Math.random() * 568;
							ig.game.spawnEntity( EntityWindParticle , x , y );
							if( Math.random() < 0.2 ){
								ig.game.spawnEntity( EntityWindSwirlParticle , x , y );
							}
						}
						this.waveSwitch = true;
					}
				}
				else if( this.waveTimer.delta() > Math.random() * 0.1 ){
					this.waveCount = Math.floor( Math.random() * 2 );
					this.waveTimer.reset();
					this.waveSwitch = false;
				}
			}
		}
		
	});
	
});
	
