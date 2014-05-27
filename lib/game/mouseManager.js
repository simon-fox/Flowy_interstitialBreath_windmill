/*
 * Produces mouse events.
 *
 * methods:
 *  - ::ctor()
 *  - update()
 *
 * events:
 *  - pressed()
 *  - pressMoved(x, y)
 *  - released()
 */
var _MouseManager = function(){
	var EventManager = eventManager;

  MouseManager.displayName = 'MouseManager';

  var prototype   = MouseManager.prototype;
	var constructor = MouseManager;

  function MouseManager(){
    ig.input.bind(ig.KEY.MOUSE1, 'mouseLeft');
    this.events = new EventManager();
    this._previousState = false;
    this.pos = {
      x: null,
      y: null
    };
  }

  /* update */
  prototype.update = function(){
    /* using our own pressed() and released() equivalent, as released() is not reliable */
    var current     = ig.input.state('mouseLeft');
    var previous    = this._previousState;
    var previousPos = this.pos;

    if (current) {
      if (!previous) {
        this.events.emit('pressed');
      }

      var x = ig.input.mouse.x;
      var y = ig.input.mouse.y;
      if (x !== previousPos.x || y !== previousPos.y) {
        this.pos = {
          x: x,
          y: y
        };
        this.events.emit('pressMoved', x, y);
      }
    } else if (!current) {
      if (previous) {
        this.events.emit('released');
      }
    }
    this._previousState = current;
  };

  return MouseManager;
};

ig.module('game.mouseManager'
).requires(
	'game.eventManager'
).defines(
	function(){
  	mouseManager = _MouseManager();
	}
);

