ig.module(
	'game.entities.titleImage'
)
.requires(
	'impact.entity'
)
.defines(function(){

	EntityTitleImage = ig.Entity.extend({
		animSheet: new ig.AnimationSheet( 'media/Logo_flowy_2_small.png', 300, 227 ),
		size: {x:300, y:227},
		collides: ig.Entity.COLLIDES.NEVER,
		zIndex: 1000,
		fadeTime: 1,
		timerReset: false,

		init: function( x, y, settings ){
			//call the parent constructor
			this.parent( x, y, settings );
			this.pos.x = 10;
			this.pos.y = 0;

			//add animations
			this.addAnim( 'idle', 0.1, [0] );
			this.currentAnim = this.anims.idle;

			//fade timer
			this.fadeTimer = new ig.Timer();
		},

		update: function(){
			//if player is holding screen, fade this out
			if( ig.game.breathIndicator != false ){
				//reset the timer once. 
				if( this.timerReset == false ){ this.fadeTimer.reset(); this.timerReset = true }
				//drop alpha as the timer climbs, but limit alpha to 0
				if( this.currentAnim.alpha <= 0.05 ){ this.currentAnim.alpha = 0 }
				else{ this.currentAnim.alpha = this.fadeTimer.delta().map(0 , this.fadeTime , 1 , 0 ); } 
			}
			//fade title back in if player isn't holding the screen
			else{
				//reset the timer once. 
				if( this.timerReset == true ){ this.fadeTimer.reset(); this.timerReset = false }
				this.currentAnim.alpha = this.fadeTimer.delta().map(0 , this.fadeTime , 0 , 1 );
			}

			//call the parent
			this.parent();
		}

	});

});