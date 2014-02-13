ig.module(
	'game.entities.playButtonBalloon'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity',
	'game.entities.balloon'
)
.defines(function(){

EntityPlayButtonBalloon = EntityBalloon.extend({
	name: "PLAYBUTTON",


	init: function( x, y, settings ) {
		//set a random number for stemCount
		var randNum = Math.floor( Math.random() * 16 );
		if ( randNum < 13 ) { var randNum = 13 };
		this.stemCount = randNum;

		//establish amount to add for multiplier
		this.multiplier = ig.game.ropeSegmentCount;

		//make a global var which counts stems
		ig.game.ropeSegmentCount += this.stemCount;

		//establish animSheet
		this.animSheet = new ig.AnimationSheet( 'media/BalloonL_RED_PLAY_inflate_spritesheet_170x200px_6f.png' , 170.5 , 201 );
			
		this.addAnim( 'idle' , 0.1 , [0] );
		this.addAnim( 'inflate' , 0.1 , [0,1,2,3,4,5] , true );
		this.addAnim( 'inflated' , 0.1 , [5] );
		this.addAnim( 'deflate' , 0.1 , [5,4,3,2,1,0] , true );
		this.currentAnim = this.anims.idle;
		
		//call parent
		this.parent( x, y, settings );
	},

	update: function() {
		this.parent();
	
	}

});

});