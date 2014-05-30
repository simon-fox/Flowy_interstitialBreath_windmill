ig.module(
	'game.entities.IBwindParticle'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function(){

	IBEntityWindParticle = ig.Entity.extend({
		//physical movement parameters
		animSheet: new ig.AnimationSheet( 'media/Wind_Twirl_128x32px_8f.png', 256, 32 ),
		size: {x:256, y:32},
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
			this.addAnim( 'ripple', 0.1, [0,1,2,3,4,5,6,7] );
			this.currentAnim = this.anims.ripple;
			this.windVector = ig.game.getEntitiesByType( IBEntityWindVector )[0];

		},

		update: function(){
			if ( this.idleTimer.delta() > this.lifeTime ){
				this.kill();
				return;
			}

			//this.currentAnim.alpha = this.idleTimer.delta().map(this.lifeTime - this.fadeTime, this.lifeTime, 1, 0);

			this.anims.ripple.angle = ig.game.windRads;

			this.currentAnim.alpha = this.idleTimer.delta().map(this.lifeTime - this.fadeTime, this.lifeTime, 1, 0);

			this.vel.x =  400;
			this.vel.y =  0;
			//console.log(this.vel.x, this.vel.y);
			
			//call the parent
			this.parent();
		}

	});

});

