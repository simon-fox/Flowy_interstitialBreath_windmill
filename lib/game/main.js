/* stub for when running the game by itself */
if (!window.BreathingDurations) {
	window.BreathingDurations = {
		addBreathStrength: function(strength){},
		inDuration       : function(){ return 3; },
		outDuration      : function(){ return 4; }
	};
}

ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	//JB classes
	'game.popup',
	'game.mouseManager',
	'game.settings',
	'game.resources',
	//plugins
	'plugins.box2d.game',
	//'plugins.box2d.debug',
	//levels
	'game.levels.windMill',
	//entities
	'game.entities.anchor',
	'game.entities.windMillBlade',
	//particles
	'game.entities.windParticle',
	'game.entities.windSwirlParticle',
	//UI classes
	'game.entities.windVector',
	'game.entities.breathCounter',
	'game.breathIndicator',
	'game.entities.breatheText',
	'game.entities.titleScreenBackgroundImage',
	//debug
	'impact.debug.debug'
)
.defines(function(){

MyGame = ig.Box2DGame.extend({
	font: new ig.Font( 'media/invasionFont.png' ),
	gravity: 0,
	killList: [],
	ropeSegmentCount: 0,
	breathIndicator: false,
	waveSwitch: false,
	waveCount: 1,

	init: function() {
		var MouseManager = mouseManager;
		var Resources = resources;
		var BreathIndicator = breathIndicator;


		var mm = new MouseManager();
		ig.resources = new Resources();

		//set some pointers
		this._mouseManager              = mm;

		//box2d debug
		this.debugCollisionRects = true;
		//bind keys
		//ig.input.bind( ig.KEY.UP_ARROW, 'up');
		//ig.input.bind( ig.KEY.DOWN_ARROW, 'down');
		//ig.input.bind( ig.KEY.LEFT_ARROW, 'left');
		//ig.input.bind( ig.KEY.RIGHT_ARROW, 'right');
		//ig.input.bind( ig.KEY.MOUSE1, 'mouseLeft' );
		// Load level
		this.loadLevel( LevelWindMill );
		//spawn timer for wind particles
		this.waveTimer = new ig.Timer();
		//set up breathIndicator
		this.initialiseBreathIndicator( BreathIndicator );
		//spawn backdrop
		ig.game.spawnEntity( EntityTitleScreenBackgroundImage , 0 , 0 );
	},

	loadLevel: function( level ) {        
	    this.parent( level );
	},
	
	update: function() {
		this.parent();
		this.cleanUpWindVectors();
		this.processKillList();

		/*
		//replace with events 
		if( this.breathIndicator.state == "OUT" ){
			ig.game.getEntitiesByType( EntityAnchor )[0].revoluteJoint.SetMotorSpeed( 500 );
			ig.game.spawnWindParticles();
		}
		else{
			ig.game.getEntitiesByType( EntityAnchor )[0].revoluteJoint.SetMotorSpeed( 0 );
		}
		*/

	},
	
	draw: function() {
		//draw box2d debug
		//this.debugDrawer.draw();
		/* breath indicator */
		var bi = this._breathIndicator;
		
		bi.draw();
		

		this.parent();

		
	},

	processKillList: function(){
		//loop through killList and destroy all bodies
		if( this.killList.length > 0 ){
			for( var i = 0 ; i < this.killList.length ; i++ ){
				this.killList[i].kill();
			}
			//empty killList 
			this.killList = [];
		}
	},

	cleanUpWindVectors: function(){
		var windVectorArray = ig.game.getEntitiesByType(EntityWindVector);
		if( windVectorArray.length > 1){
			windVectorArray[0].kill();
		}
	},

	spawnWindParticles: function(){
		//if it's under a certain power thresh, don't spawn
		//console.log(this.power);
		
		//get angle of wind
		this.windRads = 0;

		if( this.waveTimer.delta() <= Math.random() * 0.1 ){
			if( this.waveSwitch == false ){
				for( var i = 0 ; i < this.waveCount ; i ++ ){
					var x = ig.game.screen.x + Math.random() * 10;
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
		
	},

	initialiseBreathIndicator: function( BreathIndicator ){
		  var mm = this._mouseManager;

		  /* breath indicator */
	      var breathIndicatorX = 0;
	      var breathIndicatorY = 0;
	     
	      breathIndicatorX = ig.system.width  / 2;
	      breathIndicatorY = ig.system.height / 3;
	      
		var bi = new BreathIndicator(breathIndicatorX, breathIndicatorY);

		this._breathIndicator           = bi;
   
	      mm.events.on( 'pressed', bi.restart, bi);
	      mm.events.on('released', bi.release, bi);

	      var idb = ig.resources.images;
	      var popupImages = [idb.breatheFeedbackGood, idb.breatheFeedbackGreat, idb.breatheFeedbackPerfect];

	      var bl = [0.25, 0.50, 1.00]; //Settings.gameplay.breathLevels
	      bi.events.on('released', function(strength){
		        var index =
							(strength === bl[2]) ? 2 :
							(strength  >  bl[1]) ? 1 :
							(strength  >  bl[0]) ? 0 : null;

		        if (index != null) {
					var bX = null;
					var bY = null;

		          
					bX = breathIndicatorX;
					bY = breathIndicatorY;


					var pu = new Popup({
					image: popupImages[index],
					x    : bX + Math.floor((Math.random() - 0.5) * 140),
					y    : bY + Math.floor((Math.random() - 0.5) * 140)
					});
					pu.displayFor(0.25);

					return self._popups.push(pu);
		        }
	      });
	}


});

var c = document.createElement('canvas');
c.id = 'canvas';
document.body.appendChild(c);

// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 320, 568, 1 );

});
