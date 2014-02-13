ig.module(
	'game.entities.breathBulb'
)
.requires(
	'impact.entity'
)
.defines(function(){

	EntityBreathBulb = ig.Entity.extend({
		//physical movement parameters
		animSheet:  new ig.AnimationSheet( 'media/breathBulb_35x35.png', 35, 35 ),
		size: { x: 35, y: 35 },
		collides: ig.Entity.COLLIDES.NEVER,
		zIndex: 10002,
		travelPos: 230,
		travelDistance: 175,
		travelSpeed: 0,
		state: "NEUTRAL",
		text: null,
		spawned: false,

		init: function( x, y, settings ){
			//call the parent constructor
			this.parent( x, y, settings );
			//add animations
			this.addAnim( 'idle', 0.1 , [0] );
			this.currentAnim = this.anims.idle;

			this.travelTimer = new ig.Timer();
			this.breathTimer = new ig.Timer();

		},

		update: function(){
			//call the parent
			this.parent();
			//states set in ig.game.handleMouseInput
			switch( this.state ){
				case "NETURAL": 

				break;
				case "IN": 
					//breathTimer set in main.js
					ig.game.breathBulb.workOutTravelSpeed();
					if( ig.game.breathBulb.travelTimer.delta() >= 0.01){
						ig.game.breathBulb.travelPos -= ig.game.breathBulb.travelSpeed;
						ig.game.breathBulb.travelTimer.reset();
					}
					//spawn text
					if( this.spawned == false ){
						this.text = ig.game.spawnEntity( EntityBreatheText , ig.game.player.x , ig.game.player.y );
						this.spawned = true;
					}
				break;
				case "OUT": 
					//breathTimer set in main.js
					ig.game.breathBulb.workOutTravelSpeed();
					if( ig.game.breathBulb.travelTimer.delta() >= 0.01){
						ig.game.breathBulb.travelPos += ig.game.breathBulb.travelSpeed;
						ig.game.breathBulb.travelTimer.reset();
					}
					if( this.spawned == false ){
						this.text = ig.game.spawnEntity( EntityBreatheText , ig.game.player.x , ig.game.player.y );
						this.spawned = true;
					}
				break;
			}

			this.setPosition();
			this.constrainTravel();
			this.checkBreathTimer();			
		},

		kill: function(){
			this.parent();
		},

		workOutTravelSpeed: function(){
			//S = D / T
			//get px distance we must travel every 100th of a second. 
			var posNeg = null;
			if( this.breathTimer.delta() <= 0){ var posNeg = -1; } else{ var posNeg = 1; }
			if( this.state == "IN"){
				this.travelSpeed = ( this.travelDistance / ( posNeg * this.breathTimer.delta() ) / 100 );
			}
			else{
				this.travelSpeed = ( this.travelDistance / ( posNeg * this.breathTimer.delta() ) / 100 );
			}
			//constrain travel speed to sensible threshold
			if( this.travelSpeed >= 2 ){ this.travelSpeed = 2; }
		},

		constrainTravel: function(){
			if( this.travelPos >= 230 ){
				this.travelPos = 230;
			}
			else if( this.travelPos <= 55 ){
				this.travelPos = 55;
			}
		},

		checkBreathTimer: function(){
			//check if the breath is over or not 
			if( this.breathTimer.delta() < 0 ){
				//still going
			}
			else{
				//over
				this.state = "NEUTRAL";
				if( ig.game.windVector ){ ig.game.windVector.timer.pause(); }
				this.killText();
			}
		},

		setPosition: function(){
			this.pos.x = (ig.game.screen.x + this.travelPos ) ; 
			this.pos.y = (ig.game.screen.y + 15) ;
		},

		killText: function(){
			if( this.text != null ){ this.text.kill(); this.spawned = false; }
		}

	});

});

/* things we need: 
TIME: ig.game.breaths[n].i / ig.game.breaths[n].o
TIME in 10th's of a second: ig.game.breaths[ig.game.breathCount].i / 10 
TOTAL DISTANCE: 175 px


*/


