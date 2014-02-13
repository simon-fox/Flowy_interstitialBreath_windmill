ig.module(
        'game.entities.breathIndicator'
)
.requires(
        'impact.entity'
)
.defines(function(){
        
        EntityBreathIndicator = ig.Entity.extend({
                checkAgainst: ig.Entity.TYPE.NONE,
                collides: ig.Entity.COLLIDES.NEVER,
                gravityFactor: 0,
                name: "box2dfalse",
                power: 0,
                zIndex: 1000,
                radius: 0,
                containingCircleRadius: 60,
                travelSpeed: 0,
                state: "NEUTRAL",
                spawned: false,
                fullBreathTaken: false,

                init: function( x, y, settings ){
                    this.timer = new ig.Timer();
                    this.travelTimer = new ig.Timer();
                    this.breathTimer = new ig.Timer();
                    //set draw pos
                    this.originX = ig.system.getDrawPos( 160 );
                    this.originY = ig.system.getDrawPos( 100 );
                    this.parent( x, y, settings );
                },
                
                update: function(){
                    //states set in ig.game.handleMouseInput
                    switch( this.state ){
                        case "NETURAL": 

                        break;
                        case "IN": 
                            ig.game.breathIndicator.workOutTravelSpeed();
                            //spawn text
                            if( this.spawned == false ){
                                this.text = ig.game.spawnEntity( EntityBreatheText , 0 , 0 );
                                this.spawned = true;
                            }
                            //every 100th of a second, manual change this.radius
                            if( ig.game.breathIndicator.travelTimer.delta() >= 0.01){
                                //check if we've reached the max size
                                if ( ig.game.breathIndicator.radius < ig.game.breathIndicator.containingCircleRadius ){
                                    ig.game.breathIndicator.radius += ig.game.breathIndicator.travelSpeed;
                                }
                                else { 
                                    ig.game.breathIndicator.radius = ig.game.breathIndicator.containingCircleRadius 
                                    this.killText();
                                    this.fullBreathTaken = true;

                                }
                                ig.game.breathIndicator.travelTimer.reset();
                            }
                        break;
                        case "HOLDING":
                            //spawn text
                            if( this.spawned == false ){
                                this.text = ig.game.spawnEntity( EntityBreatheText , 0 , 0 );
                                this.spawned = true;
                            }
                        break;
                        case "OUT": 
                            ig.game.breathIndicator.workOutTravelSpeed();
                            //spawn text
                            if( this.spawned == false ){
                                this.text = ig.game.spawnEntity( EntityBreatheText , 0 , 0 );
                                this.spawned = true;
                            }
                            //every 100th of a second, manual change this.radius
                            if( ig.game.breathIndicator.travelTimer.delta() >= 0.01){
                                //check if we've reached the min size
                                if ( ig.game.breathIndicator.radius > 0 ){
                                    ig.game.breathIndicator.radius -= ig.game.breathIndicator.travelSpeed;
                                }
                                else { 
                                    ig.game.breathIndicator.cleanUpAfterBreathIsFinished();
                                }
                                ig.game.breathIndicator.travelTimer.reset();
                            }
                        break;
                    }

                    this.parent();
                },

                draw: function(){
                    //grab the canvas
                    var ctx = ig.system.context;
                    
                    //draw the circle to be filled
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";  
                    ctx.beginPath();
                    ctx.moveTo( this.originX + this.containingCircleRadius , this.originY );
                    ctx.arc( this.originX , this.originY, this.containingCircleRadius * ig.system.scale,0, Math.PI * 2 );
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    ctx.closePath();
                    
                    //draw the circle to show accumulated power
                    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                    ctx.beginPath();
                    ctx.moveTo( this.originX , this.originY );
                    ctx.arc( this.originX , this.originY , this.radius * ig.system.scale,0, Math.PI * 2 );
                    ctx.fill();
                    ctx.closePath();
                    
                    this.parent();
                },

                killText: function(){
                    //this is called in update function here and in ig.game.handleMouseInput();
                    if( this.text != null ){ this.text.kill(); this.spawned = false; }
                },

                workOutTravelSpeed: function(){
                    //S = D / T
                    //get px distance we must travel every 100th of a second. 
                    var posNeg = null;
                    if( this.breathTimer.delta() <= 0){ var posNeg = -1; } else{ var posNeg = 1; }
                    if( this.state == "IN"){
                        this.travelSpeed = ( this.containingCircleRadius / ( posNeg * this.breathTimer.delta() ) / 100 );
                    }
                    else{
                        this.travelSpeed = ( this.containingCircleRadius / ( posNeg * this.breathTimer.delta() ) / 100 );
                    }
                    //constrain travel speed to sensible threshold
                    if( this.travelSpeed >= 2 ){ this.travelSpeed = 2; }
                },

                cleanUpAfterBreathIsFinished: function(){
                    //make sure filled circle has vanished
                    ig.game.breathIndicator.radius = 0; 
                    //kill the breathIndicator, clean up main.js pointer
                    ig.game.breathIndicator.kill();
                    ig.game.breathIndicator = false;
                    //kill the breathText
                    this.killText();
                    //release the selected balloon, possibly give it more lift?
                    if( this.fullBreathTaken == true){
                        //find the rope joint to destroy
                        var n = ig.game.mouseOverClass.jointList.length - 10;
                        ig.world.DestroyJoint( ig.game.mouseOverClass.jointList[n] );
                        //give the balloon more upward force
                        //ig.game.mouseOverClass.upForce = -500;
                        var newFilterData = new Box2D.Dynamics.b2FilterData;
                        newFilterData.maskBits = 0x0001;
                        ig.game.mouseOverClass.fixture.SetFilterData( newFilterData );
                        console.log(ig.game.mouseOverClass.fixture.GetFilterData());
                        //if the selected balloon is a menu item, respond accordingly after x seconds
                        if( ig.game.mouseOverClass.name == "PLAYBUTTON" ){
                            //move on to next screen
                            setTimeout(function(){ console.log( 'move to game screen' )}, 3000 );
                        }
                        ig.game.mouseOverBody = false;
                        ig.game.mouseOverClass = false;


                    }                    
                },

                kill: function(){
                    this.parent();
                }

        });
});