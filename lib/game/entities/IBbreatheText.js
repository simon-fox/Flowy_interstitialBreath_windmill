ig.module(
	'game.entities.IBbreatheText'
)
.requires(
	'impact.entity'
)
.defines(function(){

	IBEntityBreatheText = ig.Entity.extend({
		//physical movement parameters
		animSheet: new ig.AnimationSheet( 'media/breatheBubble_146x51.png' , 146 , 51 ),
		size     : { x: 146, y: 51 },
		collides : ig.Entity.COLLIDES.NEVER,
		zIndex   : 10000,

		_fadeInOutTime: 0.6,
		_animationIds : [ 'breatheIn', 'breatheOut', 'breatheLonger' ],

		init: function( x, y, settings ){
			this.parent( x - this.size.x / 2, y - this.size.y / 2, settings );

			var selfSettings = settings.breatheText || {};

			this.addAnim( 'breatheIn'    , 0.1, [0] );
			this.addAnim( 'breatheOut'   , 0.1, [1] );
			this.addAnim( 'breatheLonger', 0.1, [0] ); // FIX change to new animation for: 'try breathing for longer'

			this.currentAnim = null;

			this._timer  = new ig.Timer();
			this._hiding = false;
		},

		showText: function(textId) {
			if (this._animationIds.indexOf(textId) === -1) {
				return false;
			}
			this._timer.set(0);
			this._hiding = false;
			this.currentAnim = this.anims[textId];
			this.currentAnim.alpha = 0;
		},

		hideText: function() {
			if (!this._hiding) {
				this._hiding = true;
				this._timer.set(0)
			}
		},

		update: function(){
			var time;
			if (this.currentAnim) {
				if (this._hiding) {
					time = this._timer.delta();
					if (time < this._fadeInOutTime) {
						this.currentAnim.alpha = (1 - (time / this._fadeInOutTime));
					} else {
						this.currentAnim.alpha = 0;
						this.currentAnim = null;
					}
				} else {
					/* not hiding */
					time = this._timer.delta();
					if (time < this._fadeInOutTime) {
						this.currentAnim.alpha = time / this._fadeInOutTime;
					} else {
						this.currentAnim.alpha = 1.0;
					}
				}
			}
		},

		kill: function(){
			this.parent();
		}

	});
});
