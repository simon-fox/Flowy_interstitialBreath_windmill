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
	'game.entities.breathIndicator',
	'game.entities.breatheText',
	'game.entities.titleScreenBackgroundImage',
	//debug
	'impact.debug.debug'
)
.defines(function(){

MyGame = ig.Box2DGame.extend({
	font: new ig.Font( 'media/invasionFont.png' ),
	gravity: 0,
	mouseLast: {x: 0, y: 0},
	mouseOverBody: false,
	mouseOverClass: false,
	mouseJoint: false,
	breathCount: 0,
	breaths: [ {i:3 , o: 3} , {i:3 , o: 4} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3}, {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} , {i:3 , o: 3} ],
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
		// Load level
		this.loadLevel( LevelWindMill );
		//spawn timer for wind particles
		this.waveTimer = new ig.Timer();
		//set up contact listener
		this.setContactListener();
		//spawn backdrop
		ig.game.spawnEntity( EntityTitleScreenBackgroundImage , 0 , 0 );
	},

	loadLevel: function( level ) {        
	    this.parent( level );
	},
	
	update: function() {
		this.parent();
		this.handleMouseInput();
		this.cleanUpWindVectors();
		this.processKillList();
		//sort balloonsArray zIndex by yPos
		this.sortZindex();

		if( this.breathIndicator.state == "OUT" ){
			ig.game.getEntitiesByType( EntityAnchor )[0].revoluteJoint.SetMotorSpeed( 200 );
			ig.game.spawnWindParticles();
		}
		else{
			ig.game.getEntitiesByType( EntityAnchor )[0].revoluteJoint.SetMotorSpeed( 0 );
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

	handleMouseInput: function() {
		//grab mouse positions and adjust for b2d
        this.mouseX = (ig.input.mouse.x + ig.game.screen.x) * Box2D.SCALE;
    	this.mouseY = (ig.input.mouse.y + ig.game.screen.y) * Box2D.SCALE;

		//click, state & release functions for mouse click
		if (ig.input.pressed('mouseLeft') && this.breathIndicator == false ) {
			//spawn a breathIndicator
			this.breathIndicator = ig.game.spawnEntity( EntityBreathIndicator , 0 , 0 );
			//do collision detection in box2d
			//this.getBodyUnderMouse();
			
			//set the timer and state in breathIndicator 
			this.breathIndicator.state = "IN";
			this.breathIndicator.breathTimer.set( 3 ); //hardcode breath time for now

        }
        if (ig.input.state('mouseLeft')) {
        	//this.createMouseJoint();
        	if( this.breathIndicator.fullBreathTaken == true ){ 
        		this.breathIndicator.state = "HOLDING"
        	}
        }
        if (ig.input.released('mouseLeft') && this.breathIndicator != false ) {
        	//kill breathIndicator
        	this.breathIndicator.state = "OUT";
        	this.breathIndicator.killText();
			this.breathIndicator.breathTimer.set( 4 ); //hardcode breath time for now
			//this.destroyMouseJoint();
        }
        //this.updateMouseJointTarget();
	}, 

	setContactListener: function(){
		this.contactListener = new Box2D.Dynamics.b2ContactListener;
		ig.world.SetContactListener(this.contactListener);
		this.contactListener.BeginContact = function(contact){
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
			// INVESTIGATE FIXTURE A
			if ( fixtureA.m_userData != null){
				switch(fixtureA.m_userData.name){
					case 'SENSOR':
					break;
				}
			}
			// INVESTIGATE FIXTURE b
			if ( fixtureB.m_userData != null){
				switch(fixtureB.m_userData.name){
					case 'SENSOR':
					break;
				}
			}
		};

		this.contactListener.EndContact = function(contact){
			// INVESTIGATE FIXTURE A
			if ( contact.GetFixtureA().m_userData != null){
				switch(contact.GetFixtureA().m_userData.name){
				}
			}
			// INVESTIGATE FIXTURE b
			if ( contact.GetFixtureA().m_userData != null){
				switch(contact.GetFixtureA().m_userData.name){
				}
			}
		};


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
ig.main( '#canvas', MyGame, 60, 320, 568, 1 );

});
