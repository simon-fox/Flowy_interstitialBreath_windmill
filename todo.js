------------------------------
//////////////////////////////
//  FLOWY TDB RC 0.1 todo   //
//////////////////////////////

- TDB RC 0.1 feature list
-> 


***//////////////////////////////////////////////////////////////////////////////////////////***
***//////////////////////////////////////////////////////////////////////////////////////////***
***///////////////////////////////    PROTOTYPE TODO BELOW    ///////////////////////////////***
***//////////////////////////////////////////////////////////////////////////////////////////***

//////////////////////////////
// FLOWY prototype 0.2 todo //
//////////////////////////////

//- install box 2d
//- clean up legacy files from busracer

//- create basic map for staging
- CREATING BOX2D BODIES
	- create a body definition 
		- specifiy initial properties:
		- ie position, velocity
	- Use the world to create a body object
		- ig.world.CreateBody(bodyDef);
	- Create a shape representing the geometry we are simulating
	- create a fixture definition 
		- set the shape of the fixture to be the shape we created 
		- can add many fixtures to a single body

//- create mouse movable prop class
	//- using mouse joint
	//- first must search where mouse is for any BODIES
	//- if body found then attach mouse joint 


- create wind vector class
	//- on mousedown 
		//- spawn windVector triangle at click
	- on mousemove\hold
		- add to 'movement power'
		- grow vector over time (add to windVector.scale)
		//- check for mouse movement
			//- rotate entity as mouse moves 
			- keep entity as triangle along all points of rotation
	- on release
		- queryShape using windVectors coordinates
		- addimpulse to everything within shape 
		- ensure correct angle

- Possibility for SIMPLIFIED wind vector for prototyping
	//- just take the mirrored vector away from the mouse and apply that as an impulse to every entity on screen
	- find some way of making the force feel more like wind eddies (2 impulses separated by timer?)
		- multiple impulses at random times
		- impulses have random force within a threshold
		- give bunnies a bounceless state while being blown
	- Build a simple puzzle around this mechanic
		//- drawbridge puzzle
		//- blow over drawbridge
		//- make bridge
		//- fiddle with torque etc
		- why doesnt wind move bridge?
			- try bridge as separate entity
	//- find a way to tie power to time held down
		//- a multiplier?
			//- look at time held down for
			//- check if number is negative or positive
			//- take number down to 1 or -1 
			//- add/subtract according to time held down for 
	//- find something to tie the camera to

- create inhale/exhale counts and text
	//- have a breath array so users are following a sequence
	//- breaths: [{in:4,out:4},{in:4,out:5}];
	//- when spawning WindVector, spawn BreathCounter
	//- BreathCounter takes the latest in the breaths array and feeds to a timer
	//- timer.set(breaths[this.breathCount].in);
	//- then displays text near the touch origin
	//- text reads 'INHALE : [time left]'
	//- when time is out, text reads 'RELEASE'
	//- when released, text reads 'EXHALE : [time left]'
	//- power stops accumulating when time is up
	//- cannot breathe again while exhale counter is on

- top down boat
	//- gravity is (0,0)
	//- applying drag : http://stackoverflow.com/questions/12504534/how-to-enforce-a-maximum-speed-for-a-specific-body-in-libgdx-box2d/12511152
		//- can use linear & angular damping native to 2.1a
	- think about top down car in b2d - canceling angular velocity is going to be important
		- see if we can steal something from busRacer code here, but doesnt need wheels & joints
	//- same drag & release movement as side on 
		//- might need to tweak  adjustVector in windVector.js 
		//- to account for more than 4 points which is really what we get now
	- animating the boat
		- disconnect body.angle and animsheet.angle in game.js
		- every frame, look at body.angle and go to a frame on a spritesheet 
		- poss: for every angle, there is a 'bobbing' animation
			- could acheive with different spritesheet for each heading 
	- gameplay challenge ideas
		- current provides 'gates' which require a specific breath to pass
			- acheive with sensors & collision rules 
			- apply a force within the current area every step
		- collecting items 
			- collectible entities have specific collision rules
		- minigames like squid fishing 
		- currents and winds already existing to speed up things
		- after steer with accelerometer 
			- connect it to a rudder on boat
		- larger open world & waypoints

- Keeping touch co-ords in appmobi: http://impactjs.com/forums/help/ig-mouse-input-x-in-appmobi-emulator/page/1

- new breath ticker
	- track for ticker to travel within is an image
	- ticker 'bulb' is an image
	- width of track must be discretized into steps 
		- bulb travels within track from in to out position
		- ig.game.breaths array provides time in seconds
		- if 3 seconds and track is 100 px 
			- distance/time = 33.3 px per second - 3.3px per 10th of a second  (100 / 30 10ths of a second)
			- run a timer, every 0.1 second travel 3.3 px 
	- functionality
		- bulb is neutral if no input
			- neutral is all the way in 'out' position
		- when screen is touched
			- take time and distance, run a timer and move appropriate amount every x
			- move towards 'in' direction
		- when screen is held but in breath is complete
			- hold bulb at full 'in' position
		- when screen is released
			- same as above but in 'out' direction



//////////////////***
//zIndex sorting//***
//////////////////===
-100: fishTile
-2: waveParticle
-1: islandTile, boatShadowParticle
0: idleParticle, wakeParticle
1: wakeParticle2x2, sprayParticle
2: rockTile
3: 
4: 
5: 
6: obstacle
7: 
8: 
9: 
10-100: boatBody, boatSail, npcBoatBody, npcBoatSail
1000:  wayPoint
1001: 
1002: windSwirlParticle, windParticle
1010: windVector
10000: breatheText, EntityBreathTrack

*************************//////////////////////////////*************************
*************************// CODE SNIPPETS ********** //*************************
*************************//////////////////////////////*************************

		//from main.js init function *************************
		//initialise camera position
		var cameraEntity = this.getEntitiesByType( EntityBunny )[0];
		if( cameraEntity ) {
		    this.screen.x = (cameraEntity.pos.x + 60) - (ig.system.width/2);
		    this.screen.y = cameraEntity.pos.y - (ig.system.height/2);
		}


		//from main.js update function *************************
		//camera controls centered on entity
		var player = this.getEntitiesByType( EntityPlayer )[0];
		if( player ) {
		    this.screen.x = player.pos.x - (ig.system.width/2);
		    this.screen.y = player.pos.y - (ig.system.height/2);
		}
		////////////////////////////////////////////////////////
		//click & state functions for mouse click
		if (ig.input.pressed('mouseLeft')) {
            // set the starting point
            this.mouseLast.x = ig.input.mouse.x;
            this.mouseLast.y = ig.input.mouse.y;	
        }
        if (ig.input.state('mouseLeft')) {
        	//mouse camera controls
			this.screen.x -= ig.input.mouse.x - this.mouseLast.x;
			this.screen.y -= ig.input.mouse.y - this.mouseLast.y;
			this.mouseLast.x = ig.input.mouse.x;
			this.mouseLast.y = ig.input.mouse.y;		      
        }
        ////////////////////////////////////////////////////////
        //camera controlled by keys
		if( ig.input.state('left') ) {
		    this.screen.x -= 1;
		}
		if( ig.input.state('right') ) {
		    this.screen.x += 1;
		}
		////////////////////////////////////////////////////////
        //getting joint force in tumbleWeed.js
		if( this.timer.delta() > 5 && this.joint != null && this.joint.GetReactionForce(ig.system.tick).Length() > 8){
			console.log("joint "+this.id+" :"+this.joint.GetReactionForce(ig.system.tick).Length());
			//console.log(this.joint.GetReactionTorque());
			//ig.game.spawnEntity(EntityBrokenTumbleWeed, this.pos.x , this.pos.y );
			//this.kill();
		}


	


















































