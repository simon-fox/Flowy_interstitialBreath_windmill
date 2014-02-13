ig.module( 'plugins.multitouch' )
.requires(
  'impact.game',
  'impact.input'
)
.defines(function() {

  var TouchPoint = function( x, y, id, state ) {
    this.x = x
    this.y = y
    this.id = id
    this.state = state
  };

  ig.Input.inject({

    touches: {},
    delayedTouchUp: [],

    // unfortunally we have to overwrite this function completly without calling this.parent()
    // the touch events provided by impact get in the way so better drop them
    // this could lead to some incompatibility, so keep that in mind when updating impact
    initMouse: function() {
      if( this.isUsingMouse ) { return; }
      this.isUsingMouse = true;

      // This works with the iOSImpact, too
      // Just remeber to copy the provided JS_TouchInput.h and JS_TouchInput.m
      if ( typeof( ios ) != 'undefined' && ios ) {
        this._touchInput = new native.TouchInput();

        this._touchInput.touchStart( this.multitouchstart.bind(this) );
        this._touchInput.touchEnd( this.multitouchend.bind(this) );
        this._touchInput.touchMove( this.multitouchmove.bind(this) );
      }
      else {
        var mouseWheelBound = this.mousewheel.bind(this);
        ig.system.canvas.addEventListener('mousewheel', mouseWheelBound, false );
        ig.system.canvas.addEventListener('DOMMouseScroll', mouseWheelBound, false );

        ig.system.canvas.addEventListener('contextmenu', this.contextmenu.bind(this), false );
        ig.system.canvas.addEventListener('mousedown', this.keydown.bind(this), false );
        ig.system.canvas.addEventListener('mouseup', this.keyup.bind(this), false );
        ig.system.canvas.addEventListener('mousemove', this.mousemove.bind(this), false );

        ig.system.canvas.addEventListener( 'touchstart', this.touchEvent.bind( this ), false );
        ig.system.canvas.addEventListener( 'touchmove', this.touchEvent.bind( this ), false );
        ig.system.canvas.addEventListener( 'touchend', this.touchEvent.bind( this ), false );
      }
    },

    // This is here for compatibility reasons.
    // You can still use the normal ig.input.state('click') or ig.input.mouse.x if you only need a single touch
    // but remember that this values could be the one of a random touch on your device

    keydown: function( e ) {
      this.parent( e );

      if ( e.type == 'mousedown' ) {
        this.touches.mouse = new TouchPoint( this.mouse.x, this.mouse.y, 'mouse', 'down' );
      }
    },

    keyup: function( e ) {
      this.parent( e );

      if ( e.type == 'mouseup' ) {
        this.touches.mouse.state = 'up';
        this.touches.mouse.x = this.mouse.x;
        this.touches.mouse.y = this.mouse.y;

        this.delayedTouchUp.push( 'mouse' );
      }
    },

    mousemove: function( e ) {
      this.parent( e );

      if ( this.state( 'click' ) && this.touches.mouse ) {
        this.touches.mouse.x = this.mouse.x;
        this.touches.mouse.y = this.mouse.y;
      }
    },

    clearPressed: function() {
      this.parent();

      for ( var i = this.delayedTouchUp.length; i--; ) {
        delete this.touches[ ig.input.delayedTouchUp[ i ] ];
      }
      
      this.delayedTouchUp = [];
    },

    touchEvent: function( e ) {
      e.stopPropagation();
      e.preventDefault();

      for ( var i = e.changedTouches.length; i--; ) {
        var t = e.changedTouches[ i ];

        this[ 'multi' + e.type ](
          (t.clientX - ig.system.canvas.offsetLeft) / ig.system.scale,
          (t.clientY - ig.system.canvas.offsetTop) / ig.system.scale,
          t.identifier
        );
      }
    },

    multitouchstart: function( x, y, id ) {
      var action = this.bindings[ ig.KEY.MOUSE1 ];
      if ( action ) {
        this.actions[action] = true;
        this.presses[action] = true;
      }

      this.touches[ id ] = new TouchPoint( x, y, id, 'down' );
    },

    multitouchmove: function( x, y, id ) {
      if ( this.touches[ id ] ) {
        this.touches[ id ].x = x;
        this.touches[ id ].y = y;
      }
    },

    multitouchend: function( x, y, id ) {
      if ( this.touches[ id ] ) {
        this.touches[ id ].state = 'up';
        this.delayedTouchUp.push( id );

        var action = this.bindings[ ig.KEY.MOUSE1 ];
        if ( action && this._isEmpty( this.touches ) ) {
          this.delayedKeyup[ action ] = true;
        }
      }
    },

    _isEmpty: function( obj ) {
      for ( var i in obj ) return false;
      return true;
    }

  });

});