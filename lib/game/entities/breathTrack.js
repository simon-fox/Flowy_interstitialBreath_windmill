ig.module(
	'game.entities.breathTrack'
)
.requires(
	'impact.entity'
)
.defines(function(){

	EntityBreathTrack = ig.Entity.extend({
		//physical movement parameters
		animSheet:  new ig.AnimationSheet( 'media/breathTrack_210x25.png', 210, 25 ),
		size: { x: 210, y: 25 },
		collides: ig.Entity.COLLIDES.NEVER,
		zIndex: 10001,

		init: function( x, y, settings ){
			//call the parent constructor
			this.parent( x, y, settings );
			//add animations
			this.addAnim( 'idle', 0.1 , [0] );
			this.currentAnim = this.anims.idle;
		},

		update: function(){
			//call the parent
			this.parent();

			this.pos.x = (ig.game.screen.x + 55 ) ; 
			this.pos.y = (ig.game.screen.y + 20) ;
		},

		kill: function(){
			//play pop animation
			this.parent();
		}

	});

});

