
/*
 * methods:
 *  - displayFor(fullDuration)
 *  - show()
 *  - hide()
 *  - update()
 *  - draw()
 */
var _Popup = function(){
  Popup.displayName = 'Popup';
  var prototype = Popup.prototype, constructor = Popup;

  function Popup(options){
    this._image = options.image;
    this._x = options.x;
    this._y = options.y;
    this._fadeInDuration = options.fadeInDuration || 0.6;
    this._fadeOutDuration = options.fadeOutDuration || 0.3;
    this._fullDuration = null;
    this.state = null;
    this._timer = new ig.Timer();
  }

  /* display for */
  prototype.displayFor = function(fullDuration){
    if (typeof fullDuration === 'undefined') {
      fullDuration = null;
    }
    var state = this.state;
    var timer = this._timer;
    var fadeInDuration  = this._fadeInDuration;
    var fadeOutDuration = this._fadeOutDuration;

    var dt, coeff;
    if (state === null) {
      this.state = 'in';
      timer.set(fadeInDuration);
    } else if (state === 'out') {
      this.state = 'in';
      dt = -timer.delta();
      coeff = 1 - dt / fadeOutDuration;
      timer.set(fadeInDuration * coeff);
    } else if (state === 'full') {
      if (fullDuration !== null) {
        timer.set(fullDuration);
      }
    }
    this._fullDuration = fullDuration;
  };

  /* show */
  prototype.show = function(){
    this.displayFor(null);
  };

  /* hide */
  prototype.hide = function(){
    var state = this.state;
    var timer = this._timer;
    var fadeInDuration  = this._fadeInDuration;
    var fadeOutDuration = this._fadeOutDuration;
    this._fullDuration = null;

    var dt, coeff;
    if (state === 'in') {
      dt = -timer.delta();
      this.state = 'out';
      coeff = 1 - dt / fadeInDuration;
      timer.set(fadeOutDuration * coeff);
    } else if (state === 'full') {
      this.state = 'out';
      timer.set(fadeOutDuration);
    }
  };

  /* update */
  prototype.update = function(){
    var fullDuration = this._fullDuration;
    var fadeOutDuration = this._fadeOutDuration;
    var state = this.state;
    var timer = this._timer;
    var dt = timer.delta();
    if (state === 'in') {
      /* state: in */
      if (dt >= 0) {
        this.state = 'full';
        if (fullDuration !== null) {
          timer.set(fullDuration);
        }
      }

    } else if (state === 'full') {
      /* state: full */
      if (fullDuration !== null && dt >= 0) {
        this.state = 'out';
        timer.set(fadeOutDuration);
      }

    } else if (state === 'out') {
      /* state: out */
      if (dt >= 0) {
        this.state = null;
      }
    }
  };

  /* draw */
  prototype.draw = function(){
    var fullDuration = this._fullDuration;
    var fadeOutDuration = this._fadeOutDuration;
    var fadeInDuration = this._fadeInDuration;
    var state = this.state;
    var timer = this._timer;
    var dt = -timer.delta();

		var alpha, ctx, alphaSaved;
    if (state !== null) {
      alpha = state === 'in'
        ? 1 - dt / fadeInDuration
        : state === 'full'
          ? 1.0
          : state === 'out' ? dt / fadeOutDuration : void 8;
      if (alpha < 0) {
        alpha = 0;
      }
      if (alpha > 1) {
        alpha = 1;
      }
      ctx = ig.system.context;
      alphaSaved = ctx.globalAlpha;
      ctx.globalAlpha = alpha * alphaSaved;
      this._image.drawCentre(this._x, this._y);
      ctx.globalAlpha = alphaSaved;
    }
  };

  return Popup;
};

ig.module('game.popup'
).requires(
).defines(
	function(){
		popup = _Popup();
	}
);

