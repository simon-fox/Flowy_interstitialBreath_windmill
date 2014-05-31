ig.module(
	'game.entities.IBbackgroundImage'
)
.requires(
	'impact.entity'
)
.defines(function(){

	IBEntityBackgroundImage = ig.Entity.extend({
		size: {x:320, y:568},
		collides: ig.Entity.COLLIDES.NEVER,
		zIndex: -100,

		init: function( x, y, settings ){
			//call the parent constructor
			this.parent( x, y, settings );
			this.pos.x = 0;
			this.pos.y = 0;

			if( ig.game.gameMode == 'windMill' ){
				console.log('setting bg for windMill');
				this.animSheet = new ig.AnimationSheet( 'media/windmillBackground_static.png', 320, 568 );
			}
			else if( ig.game.gameMode == 'balloons' ){
				console.log('setting bg for balloons');
				this.animSheet = new ig.AnimationSheet( 'media/balloonsBackground_static.png', 320, 568 );
			}


			//add animations
			this.addAnim( 'idle', 0.1, [0] );
		},

		update: function(){
			//call the parent
			this.parent();
		}

	});

});