ig.module(
	'game.entities.breathCounter'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
	EntityBreathCounter = ig.Entity.extend({
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		gravityFactor: 0,
		name: "box2dfalse",
		io: "i",
		killInstant: true,
		spawned: false,

		init: function( x, y, settings ){
			//set up the timer for the inhale
			this.timer = new ig.Timer();
			this.timer.set( ig.game.breaths[ ig.game.breathCount ].i);
			this.parent( x, y, settings );
		},
		
		update: function(){		
			this.parent();
		},

		draw: function(){
			//get system dimensions for drawing
			this.x = 60,
			this.y = 20;
			if (this.io == "i"){

				//during inhalation
				if ( this.timer.delta() < 0 ){
					this.timeLeft = -1.0 * Math.round(this.timer.delta());

					//only do it once
					if( this.spawned == false ){
						this.phrase = 'breatheIn';
						this.text = ig.game.spawnEntity( EntityBreatheText , ig.game.screen.x , this.y + ig.game.screen.y );
						this.spawned = true;
					}

					ig.game.font.draw( this.timeLeft, this.x + 80 , this.y + 60 , ig.Font.ALIGN.LEFT );
				}
				else{
					this.timeLeft = 0;
					this.killInstant = false;
					this.text.kill();
					ig.game.windVector.timer.pause();
				}
			}
			else{

				if (this.killInstant == true){
					this.kill();
					this.text.kill();
				}
				//during exhalation
				if ( this.timer.delta() < 0 ){
					this.timeLeft = -1.0 * Math.round(this.timer.delta());

					//only do it once
					if( this.spawned == false ){
						this.phrase = 'breatheOut';
						this.text = ig.game.spawnEntity( EntityBreatheText , ig.game.screen.x , this.y + ig.game.screen.y );
						this.spawned = true;
					}
					ig.game.font.draw( this.timeLeft, this.x + 80 , this.y + 60 , ig.Font.ALIGN.LEFT );
				}
				else{
					this.kill();
					this.text.kill();
					ig.game.breathCount += 1;
				}

			}
			
			this.parent();
		}
		
	});
	
});
	
