// A multitouch button Entity for Impact.js
// Has 4 States: 
// * hidden - Not shown
// * idle - just sitting there
// * active - someone is pushing on it
// * deactive - shown, but not usable

// And 3 Events
// * pressedDown - activated when pressed Down
// * pressed - constantly fires when pressing
// * pressedUp - activated when button released

// Can render Text. Should explain itself.

ig.module('plugins.button')
.requires(
  'impact.entity',
  'plugins.multitouch'
)
.defines(function() {

  Button = ig.Entity.extend({
    size: { x: 64, y: 16 },
    
    text: [],
    textPos: { x: 0, y: 0 },
    textAlign: ig.Font.ALIGN.LEFT,
    
    font: null,
    
    animSheet: new ig.AnimationSheet( 'media/button.png', 64, 16 ),
    
    state: 'idle',
    
    _ids: [],
    _oldIds: [],
    
    init: function( x, y, s ) {
      this.parent( x, y, s );
      
      if ( this.animSheet ) {
        this.addAnim( 'idle', 1, [0] );
        this.addAnim( 'active', 1, [1] );
        this.addAnim( 'deactive', 1, [2] );
      }
      
      if ( this.text.length > 0 && this.font === null ) {
        this.font = ig.game.font || new ig.Font( 'media/font.png' );
      }
    },
    
    update: function() {
      if ( this.state !== 'hidden' ) {
        if ( this.state !== 'deactive' && ig.input.state( 'click' ) ) {
          this._ids = this._inButton();

          if ( this._ids ) {
            var inBefore = this._compareWithOldIds();
            
            if ( !inBefore ) {
              this.setState( 'active' );
              this.pressedDown();
              
              var num_ups = 0;
              for ( var t in ig.input.touches ) {
                if ( ig.input.touches[ t ].state == 'up' ) num_ups++;
              }
              
              if ( num_ups == this._ids.length ) {
                this.setState( 'idle' );
                this.pressedUp();
                this._ids = [];
              }
            }
            else if ( this._ids.length == 1 && ig.input.touches[ this._ids[ 0 ] ].state == 'up' ) {
              this.setState( 'idle' );
              this.pressedUp();
              this._ids = [];
            }
            else {
              this.setState( 'active' );
              this.pressed();
            }
          }
          else if ( this.state == 'active' ) {
            this.setState( 'idle' );
          }
        }
        
        this._oldIds = this._ids;
      }
    },
    
    draw: function() {
      if ( this.state !== 'hidden' ) {
        this.parent();

        for ( var i = 0; i < this.text.length; i++ ) {
          this.font.draw( 
            this.text[i], 
            this.pos.x + this.textPos.x - ig.game.screen.x, 
            this.pos.y + ((this.font.height + 2) * i) + this.textPos.y - ig.game.screen.y, 
            this.textAlign
          );
        }
      }
    },
    
    setState: function( s ) {
      this.state = s;
      
      if ( this.state !== 'hidden' ) {
        this.currentAnim = this.anims[ this.state ];
      }
    },
    
    pressedDown: function() {},
    pressed: function() {},
    pressedUp: function() {},
    
    _inButton: function() {
      var ids = [];
      
      for ( var n in ig.input.touches ) {
        var t = ig.input.touches[ n ];

        if ( t.x + ig.game.screen.x > this.pos.x && 
             t.x + ig.game.screen.x < this.pos.x + this.size.x &&
             t.y + ig.game.screen.y > this.pos.y &&  
             t.y + ig.game.screen.y < this.pos.y + this.size.y
        ) {
          ids.push( n );
        }
      }
      
      return (ids.length > 0) ? ids : false;
    },
    
    _compareWithOldIds: function() {
      for ( var i = this._ids.length; i--; ) {
        for ( var j = this._oldIds.length; j--; ) {
          if ( this._ids[ i ] == this._oldIds[ j ] ) return true;
        }
      }
      
      return false;
    }
  });

});