ig.module(
	'game.entities.IBwindSwirlParticle'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){

	IBEntityWindSwirlParticle = ig.Entity.extend({
		//physical movement parameters
		animSheet: new ig.AnimationSheet( 'media/Wind_Twirl_128x64px_11f.png', 128, 64 ),
		size: {x:128, y:64},
		collides: ig.Entity.COLLIDES.NEVER,
		lifeTime: 0.5,
		fadeTime: 0.5,
		zIndex: 1002,
		maxVel: { x: 999999, y: 999999},

		init: function( x, y, settings ){
			//call the parent constructor
			this.parent( x, y, settings );
			//set a timer so we know how long to keep it around for
			this.idleTimer = new ig.Timer();
			//add animations
			this.addAnim( 'ripple', 0.1, [0,1,2,3,4,5,6,7,8,9,10] );
			this.currentAnim = this.anims.ripple;
			this.windVector = ig.game.getEntitiesByType( IBEntityWindVector )[0];

		},

		update: function(){
			if ( this.idleTimer.delta() > this.lifeTime ){
				this.kill();
				return;
			}

			this.currentAnim.alpha = this.idleTimer.delta().map(this.lifeTime - this.fadeTime, this.lifeTime, 1, 0);

			this.anims.ripple.angle = ig.game.windRads;

			this.currentAnim.alpha = this.idleTimer.delta().map(this.lifeTime - this.fadeTime, this.lifeTime, 1, 0);
			
			//call the parent
			this.parent();
		},

		reset: function( x, y, settings ) {
			//reset when resurrected from pool
	        this.parent( x, y, settings );
	        //set a timer so we know how long to keep it around for
			this.idleTimer = new ig.Timer();
			//add animations
			this.addAnim( 'ripple', 0.1, [0,1,2,3,4,5,6,7,8,9,10] );
			this.currentAnim = this.anims.ripple;
			this.windVector = ig.game.getEntitiesByType( IBEntityWindVector )[0];
    	}

	});

});

