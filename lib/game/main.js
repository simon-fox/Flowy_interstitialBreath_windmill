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
	//plugins
	'plugins.box2d.game',
	//'plugins.box2d.debug',
	//levels
	'game.levels.IBballoonLevel',
	'game.levels.IBwindMill',
	//entities windmill
	'game.entities.IBanchor',
	'game.entities.IBwindMillBlade',
	//entities balloons
	'game.entities.IBballoon',
	'game.entities.IBballoon_anchor',
	'game.entities.IBballoon_ropeSegment',
	//particles
	'game.entities.IBwindParticle',
	'game.entities.IBwindSwirlParticle',
	//UI classes
	'game.entities.IBwindVector',
	'game.entities.IBbreathIndicator',
	'game.entities.IBbreatheText',
	'game.entities.IBbackgroundImage',
	'game.entities.IBbreathInstructionText'
	//debug
	//'impact.debug.debug'
)
.defines(function(){

IBgame = ig.Box2DGame.extend({
	gravity: 0,
	mouseLast: {x: 0, y: 0},
	mouseOverBody: false,
	mouseOverClass: false,
	mouseJoint: false,
	killList: [],
	ropeSegmentCount: 0,
	balloonsArray: [],
	breathIndicator: false,
	waveSwitch: false,
	waveCount: 1,

	init: function() {
		//box2d debug
		this.debugCollisionRects = true;

		//bind keys
		ig.input.bind( ig.KEY.UP_ARROW, 'up');
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind( ig.KEY.MOUSE1, 'mouseLeft' );
		
		//init font
		this.font = new ig.Font( 'media/invasionFont.png' );
		
		//use this variable to switch between IB's
		this.gameMode = 'windMill';
		//this.gameMode = 'balloons';

		if( this.gameMode == 'windMill' ){
			console.log('loading level windmill');
			// Load level
			this.loadLevel( IBLevelWindMill );
			//spawn timer for wind particles
			this.waveTimer = new ig.Timer();

		}
		else if( this.gameMode == 'balloons' ){
			console.log('loading level balloons');

			// Load level
			this.loadLevel( IBLevelBalloon );
			//spawn balloons & anchor etc
			ig.game.spawnEntity( IBEntityBalloon_anchor , ig.system.width/2 - 30 , ig.system.height + 200 );
			for( var i = 0 ; i < 5 ; i++ ){
				ig.game.spawnEntity( IBEntityBalloon , ig.system.width/2 , ig.system.height );
			}
		}

		//spawn backdrop
		ig.game.spawnEntity( IBEntityBackgroundImage , 0 , 0 );

		//spawn instruction text
		this.instructionText = ig.game.spawnEntity( IBEntityBreathInstructionText , ig.system.width / 2 , 100 );
		this.instructionText.showText( 'takeBreath' );
	},

	loadLevel: function( level ) {        
	    this.parent( level );
	},
	
	update: function() {
		this.parent();
		this.cleanUpWindVectors();
		this.processKillList();
		//sort balloonsArray zIndex by yPos
		this.sortZindex();

		if( this.gameMode == 'windMill' ){
			ig.game.windMillUpdate();
			ig.game.handleMouseInputWindMill();

		}
		else if( this.gameMode == 'balloons' ){
			ig.game.balloonsUpdate();
			ig.game.handleMouseInputBalloons();
		}

		

	},
	
	draw: function() {
		//draw box2d debug
		//this.debugDrawer.draw();

		this.parent();

		//get system dimensions for drawing
		//var x = ig.system.width/2,
		//y = ig.system.height/2;
		//drawing text
		//this.font.draw( "Flowy Boat" , x - 150, y - 280, ig.Font.ALIGN.LEFT );	
	},

	handleMouseInputWindMill: function() {
		//grab mouse positions and adjust for b2d
        this.mouseX = (ig.input.mouse.x + ig.game.screen.x) * Box2D.SCALE;
 		this.mouseY = (ig.input.mouse.y + ig.game.screen.y) * Box2D.SCALE;

		//click, state & release functions for mouse click

        if (ig.input.state('mouseLeft')) {
			//this.createMouseJoint();
		}


		var that = this;
		var createIndicator = function(isTryAgain){
			var indicatorFinalCallback = function(indicator){
				var strength = indicator._breathStrength;
				ig.game.breathIndicator = false;
				window.BreathingDurations.addBreathStrength(strength);

				//SUCCESFUL BREATH CODE HERE!!!
				console.log('Tobys move on code below');
				if(window.switchGame){window.switchGame('ib');}
				
        if (strength == 1.0) {
					console.log('moving on to next screen')
				}

			};

			//hide instruction text
			ig.game.instructionText.hideText();

			//Code for Matt's controller to hook onto
			var bd = window.BreathingDurations;
			that.breathIndicator =
				ig.game.spawnEntity( IBEntityBreathIndicator,
					ig.system.width / 2,
					ig.system.height / 4.4,
					{
						breathIndicator: {
							inDuration   : bd.inDuration(),
							outDuration  : bd.outDuration(),
							showArrow    : false,
							showText     : true,
							inMessage    : isTryAgain ? 'breatheLonger' : 'breatheIn',
							finalCallback: indicatorFinalCallback
						}
					}
				);
		};

		var pressed      = ig.input.state('mouseLeft');
		var hasIndicator = !!(this.breathIndicator);
		if (pressed) {
			/* mouse button pressed */
			if (!hasIndicator) {
				/* no indicator yet */
				createIndicator(false);
			} else {
				/* existing indicator */
				if (this.breathIndicator.isFailed) {
					ig.game.breathIndicator.kill();
					ig.game.breathIndicator = false;
					createIndicator(true);
				}
			}
		} else {
			/* not pressed */
			if (hasIndicator) { this.breathIndicator.mouseButtonNotPressed(); }
		}

		if (ig.input.released('mouseLeft') && this.breathIndicator != false ) {
			//play deflation animation on stored balloon BEFORE destroyMouseJoint()
			if( this.mouseOverClass != false ){
				//this.mouseOverClass.currentAnim = this.mouseOverClass.anims.deflate;
				//this.mouseOverClass.currentAnim.rewind();
			}
			//this.destroyMouseJoint();
		}
		//this.updateMouseJointTarget();
	}, 

	handleMouseInputBalloons: function() {
		//grab mouse positions and adjust for b2d
		this.mouseX = (ig.input.mouse.x + ig.game.screen.x) * Box2D.SCALE;
		this.mouseY = (ig.input.mouse.y + ig.game.screen.y) * Box2D.SCALE;

		//click, state & release functions for mouse click

        if (ig.input.state('mouseLeft')) {
			//this.createMouseJoint();
		}

		var that = this;
		var createIndicator = function(isTryAgain){
			var indicatorFinalCallback = function(indicator){
				var strength = indicator._breathStrength;
				ig.game.breathIndicator = false;
				window.BreathingDurations.addBreathStrength(strength);

				//SUCCESFUL BREATH CODE HERE!!!
				console.log('Tobys move on code below');
				if(window.switchGame){window.switchGame('ib');}

				if (strength == 1.0) {

					console.log('moving on to next screen')
				}

			};

			//hide instruction text
			ig.game.instructionText.hideText();

			//Code for Matt's controller to hook onto
			var bd = window.BreathingDurations;
			that.breathIndicator =
				ig.game.spawnEntity( IBEntityBreathIndicator,
					ig.system.width / 2,
					ig.system.height / 4.4,
					{
						breathIndicator: {
							inDuration   : bd.inDuration(),
							outDuration  : bd.outDuration(),
							showArrow    : false,
							showText     : true,
							inMessage    : isTryAgain ? 'breatheLonger' : 'breatheIn',
							finalCallback: indicatorFinalCallback
						}
					}
				);
		};

		var pressed      = ig.input.state('mouseLeft');
		var hasIndicator = !!(this.breathIndicator);
		if (pressed) {
			/* mouse button pressed */
			if (!hasIndicator) {
				/* no indicator yet */
				createIndicator(false);

				//play inflation animation on stored balloon after getBodyUnderMouse()
				var balloons = ig.game.getEntitiesByType( IBEntityBalloon );
				for( var i = 0 ; i < balloons.length ; i++ ){
					balloons[i].currentAnim = balloons[i].anims.inflate;
					balloons[i].currentAnim.rewind();
				}
					
				
			} else {
				/* existing indicator */
				if (this.breathIndicator.isFailed) {
					ig.game.breathIndicator.kill();
					ig.game.breathIndicator = false;
					createIndicator(true);
				}
			}
		} else {
			/* not pressed */
			if (hasIndicator) { this.breathIndicator.mouseButtonNotPressed(); }
		}

		if (ig.input.released('mouseLeft') && this.breathIndicator != false ) {
			//deflate ballons
			var balloons = ig.game.getEntitiesByType( IBEntityBalloon );
			for( var i = 0 ; i < balloons.length ; i++ ){
				balloons[i].currentAnim = balloons[i].anims.deflate;
				balloons[i].currentAnim.rewind();
				ig.game.releaseBalloon( balloons[i] );
			}
		
		}
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
		var windVectorArray = ig.game.getEntitiesByType(IBEntityWindVector);
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
					ig.game.spawnEntity( IBEntityWindParticle , x , y );
					if( Math.random() < 0.2 ){
						ig.game.spawnEntity( IBEntityWindSwirlParticle , x , y );
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

	sortZindex: function(){
		//sort into ascending order - lowest yPos (back of z order) at 0 
		this.balloonsArray.sort(function(o1, o2) {
			return o1.yPos - o2.yPos;
		});
		//give zIndex based on yPos, sails above boat bodies
		for( var i = 0 ; i < this.balloonsArray.length ; i++ ){
			//play button is always at the front
			if( this.balloonsArray[i].name == "PLAYBUTTON"){
				this.balloonsArray[i].zIndex = i + 20;
			}
			else { this.balloonsArray[i].zIndex = i + 10; }
		}
		//sort entities for render order
		ig.game.sortEntitiesDeferred(); 
	},

	getBodyUnderMouse: function(){
		//let's grab a body in box2d
        //Create a new bounding box
        var aabb = new Box2D.Collision.b2AABB();
        //set lower & upper bounds
        aabb.lowerBound.Set( this.mouseX - 0.01, this.mouseY - 0.01 );
        aabb.upperBound.Set( this.mouseX + 0.01, this.mouseY + 0.01 );
        //callback for the query function
        function GetBodyCallBack(fixture){
                //store body
                ig.game.mouseOverClass = fixture.GetUserData();
                ig.game.mouseOverBody = fixture.GetBody();
                console.log(fixture.GetUserData().name + " grabbed and stored");
        }
        ig.world.QueryAABB(GetBodyCallBack,aabb);
	},

	createMouseJoint: function(){
		//is there a body stored? is there a joint already?
        if(this.mouseOverBody != false && this.mouseJoint == false){
                var mouseJointDef = new Box2D.Dynamics.Joints.b2MouseJointDef;
                mouseJointDef.bodyA = ig.world.GetGroundBody();
                mouseJointDef.bodyB = this.mouseOverBody;
                mouseJointDef.maxForce = 1000;
                mouseJointDef.target.Set((ig.input.mouse.x + ig.game.screen.x)*Box2D.SCALE,(ig.input.mouse.y + ig.game.screen.y)*Box2D.SCALE);
                this.mouseJoint = ig.world.CreateJoint(mouseJointDef);
        }
	},

	destroyMouseJoint: function(){
		if(this.mouseOverBody != false){
            //clear stored body
            //happens in breathIndicator.cleanUpAfterBreathIsFinished();
        }
        if(this.mouseJoint != false){
            //destroy mouse joint
            ig.world.DestroyJoint(this.mouseJoint);
            //clear stored body
            this.mouseJoint = false;
        }
	},

	updateMouseJointTarget: function(){
		//if we have a mouse joint, keep setting the target
        if(this.mouseJoint != false){
                var target = new Box2D.Common.Math.b2Vec2((ig.input.mouse.x + ig.game.screen.x) * Box2D.SCALE , (ig.input.mouse.y + ig.game.screen.y) * Box2D.SCALE);
                this.mouseJoint.SetTarget(target);
        }
	},

	windMillUpdate: function(){
		if( ig.game.breathIndicator._state == "OUT" ){
			ig.game.getEntitiesByType( IBEntityAnchor )[0].revoluteJoint.SetMotorSpeed( 500 );
			ig.game.spawnWindParticles();
		}
		else{
			ig.game.getEntitiesByType( IBEntityAnchor )[0].revoluteJoint.SetMotorSpeed( 0 );
		}
	},

	balloonsUpdate: function(){

	},

	//release the selected balloon, possibly give it more lift?
	releaseBalloon: function( balloon ) {
			//find the rope joint to destroy
			var n = 1;
			ig.world.DestroyJoint( balloon.jointList[n] );
			//give the balloon more upward force
			//ig.game.mouseOverClass.upForce = -500;
	},

	rotate: function(pointX, pointY, rectWidth, rectHeight, angle) {
	  // convert angle to radians
	  //angle = angle * Math.PI / 180.0
	  // calculate center of rectangle
	  var centerX = rectWidth / 2.0;
	  var centerY = rectHeight / 2.0;
	  // get coordinates relative to center
	  var dx = pointX - centerX;
	  var dy = pointY - centerY;
	  // calculate angle and distance
	  var a = Math.atan2(dy, dx);
	  var dist = Math.sqrt(dx * dx + dy * dy);
	  // calculate new angle
	  var a2 = a + angle;
	  // calculate new coordinates
	  var dx2 = Math.cos(a2) * dist;
	  var dy2 = Math.sin(a2) * dist;
	  // return coordinates relative to top left corner
	  return { newX: dx2 + centerX, newY: dy2 + centerY };
	}

});

var c = document.createElement('canvas');
c.id = 'canvas';
document.body.appendChild(c);

// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', IBgame, 60, 320, 568, 1 );

});
