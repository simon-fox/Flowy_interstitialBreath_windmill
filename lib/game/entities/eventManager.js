/*
 * Provide event mechanism
 *
 * methods:
 *  - ::ctor()
 *  - on(event, handler, object)
 *  - emit(event)
 */
var _EventManager = function(){
  EventManager.displayName = 'EventManager';
  var prototype = EventManager.prototype, constructor = EventManager;

  function EventManager(){
    this._events = {};
  }

  /* on */
  prototype.on = function(e, handler, object){
    if (this._events[e] == null) {
      this._events[e] = [];
    }
    object || (object = null);
    this._events[e].push([handler, object]);
  };

  /* emit */
  prototype.emit = function(event){
    var args = Array.prototype.slice.call(arguments, 1);
    var listeners = this._events[event] || [];

    var i$, len$;
    for (i$ = 0, len$ = listeners.length; i$ < len$; ++i$) {
    	(function (a){
      	var handler = a[0];
 			 	var object  = a[1];

      	setTimeout(function(){ handler.apply(object, args); }, 0);
    	})(listeners[i$]);
    }
  };

  /* remove object */
  prototype.removeObject = function(e, object){
    var handlers = this._events[e];
    if (handlers != null) {
      this._events[e] = handlers.filter(function(a){
        return a.length === 2 && a[1] === object;
      });
    }
  };

  return EventManager;
};

ig.module('game.eventManager'
).requires(
).defines(
	function(){
		eventManager = _EventManager();
	}
);

