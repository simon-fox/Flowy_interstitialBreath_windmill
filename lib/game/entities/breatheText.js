ig.module(
	'game.entities.breatheText'
)
.requires(
	'impact.entity'
)
.defines(function(){

	EntityBreatheText = ig.Entity.extend({
		//physical movement parameters
		animSheet: new ig.AnimationSheet( 'media/breatheBubble_146x51.png' , 146 , 51 ),
		size: {x:146, y:51},
		collides: ig.Entity.COLLIDES.NEVER,
		lifeTime: 1,
		fadeTime: 1,
		zIndex: 10000,

		init: function( x, y, settings ){
			console.log('text spawned');
			//call the parent constructor
			this.parent( x, y, settings );

			//set a timer for alpha transition
			this.idleTimer = new ig.Timer();

			//add animations
			this.addAnim( 'breatheIn', 0.1, [0] );
			this.addAnim( 'breatheOut', 0.1, [1] );
			console.log(ig.game.breathIndicator.state);
			switch( ig.game.breathIndicator.state ){
				case 'IN':
					this.currentAnim = this.anims.breatheIn;
					break;
				case 'HOLDING':
					this.currentAnim = this.anims.breatheOut;
					break;
				case 'OUT':
					this.currentAnim = this.anims.breatheOut;
					break;
			}
			this.currentAnim.alpha = 0;
			

		},

		update: function(){
			this.currentAnim.alpha = this.idleTimer.delta().map(this.lifeTime - this.fadeTime, this.lifeTime, 0, 1);
			//set pos on screen
			this.pos.x = 80;
			this.pos.y = 164;
			//call the parent
			this.parent();
		},

		kill: function(){
			this.parent();
		}

	});

});

