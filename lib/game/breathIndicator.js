
/* Default values for the initialisation options */
var InitDefaults = {
    inDuration    :  2,                // duration of the IN state
    outDuration   :  3,                // duration of the OUT state
    radius        : 64,                // maximum radius of the circular component of the indicator
    colorRgb      : [ 255, 255, 255 ], // foreground elements color
    colorToFillRgb: [   0,   0,   0 ], // background circle color
    inMessage     : 'breatheIn'        // which message to show in the initial phase
};

/* Transparency values of the visual elements of the indicator */
var Alphas = {
    toFill      : 0.20, // for the background circle to be filled by the growing circle
    filling     : 0.50, // for the growing filling circle
    holdingFlash: 0.75, // the peak value of the `filling' circle during the HOLD phase alpha flash
    holdingRest : 0.50, // the bottom value reached after the hold flash
    outPing     : 0.65, // for the ping circle on transition from HOLD to OUT
    arrow       : 0.60  // for the arrow parts
};

/* The duration of each indicator animations (in seconds) */
var Timings = {
    initialGrowth : 0.25, // initial growth of the circle to fill in IN state
    inTextHiding  : 0.10, // time before starting fading away text at the end of the IN phase
    outTextShow   : 0.30, // time before the out text is shown after moving to HOLD/OUT phase
    outTextHiding : 0.60, // time before starting fading away text at the end of the OUT phase
    outTextMinimum: 1.20, // do not show the out text if for less than this duration (minus the outTextHiding)
    holdingFlash  : 0.25, // time to max flash alpha value after reaching the HOLD state
    holdingRest   : 0.50, // time from peak flash alpha to resting alpha value in HOLD state
    outPing       : 0.30, // life time of the `ping' circle on releasing the indicator
    arrowDisappear: 1.50  // the duration at the end of the OUT phase of the arrow's alpha decrease to zero
};

/* Constant size parameters */
var Dimensions = {
    pingMaxWidthCoef:  0.1, // the ping circle's width as it thickest, as a proportion of indicator radius
    textDistanceCoef:  1.8, // the distance of the in/out text from indicator center as proportion of the radius
    arrowMargin     :  1  , // the distance between the arrow components and the indicator to fill circle
    arrowMaxHeight  : 14  , // the maximum height of the arrow (from the base to the tip)
    arrowTailWidth  :  3    // with of the arrow tail trait
};

/* Auxililary functions */
var Aux = {
    /* get an 'rgba' color string from an array of three color values in the range [0, 255], and one alpha value */
    colorString: function(color, alpha) { return 'rgba(' + color.join(',') + ", " + alpha.toFixed(3) + ')'; },
    vector: {
        add   : function(a, b){ return { x: a.x + b.x, y: a.y + b.y }; },
        diff  : function(a, b){ return { x: a.x - b.x, y: a.y - b.y }; },
        times : function(a, v){ return { x: a.x * v  , y: a.y * v   }; },
        rotate: function(p, a){
            var cos = Math.cos(a);
            var sin = Math.sin(a);
            return {
                x: p.x * cos - p.y * sin,
                y: p.x * sin + p.y * cos };
        },
        //swap  : function(a   ){ return { x: a.y      , y: a.x       }; },
        length: function(a   ){ return Math.sqrt(a.x * a.x + a.y * a.y); }
    }
};

/* Definition of the visual elements composing the indicator */
var Shapes = {};

/* Elements in the IN phase */
/* - background circle to be filled */
Shapes.circleToFill = {
    type  : 'circle',
    radius: function(o){ return o._radius;         },
    color : function(o){ return o._colorToFillRgb; },
    alpha : function( ){ return Alphas.toFill;     }
};

/* - growing foreground filling circle */
Shapes.fillingCircle = {
    type  : 'circle',
    radius: function(o){
        var timeLeft = -o._timer.delta();
        var duration = o._inDuration;

        var r = o._radius * (1 - timeLeft / duration);

        o._inLastFilledRadius = r;
        return r;
    },
    color : function(o){ return o._colorRgb   ; },
    alpha : function( ){ return Alphas.filling; }
};


/* Elements in the HOLD phase */
/* - full circle, displaying an alpha flash at the beginning, before an alpha decrease to a rest point */
Shapes.holdingCircle = {
    type  : 'circle',
    radius: function(o){ return o._radius  ; },
    color : function(o){ return o._colorRgb; },
    alpha : function(o){
        var time = o._timer.delta();
        var flash = { t: Timings.holdingFlash, a: Alphas.holdingFlash };
        var rest  = { t: Timings.holdingRest , a: Alphas.holdingRest  };
        var aFilling = Alphas.filling;

        return (time < flash.t) ?
                ( aFilling +  (time / flash.t) * (flash.a - aFilling) ) :
                ( (time < flash.t + rest.t) ?
                        rest.a + (1 - (time - flash.t) / rest.t) * (flash.a - rest.a) :
                        rest.a
                );
    }
};


/* Elements in the OUT phase */
/* - background circle to be filled, like in IN phase, but alpha slowly decreases to zero */
Shapes.circleToFillOut = {
    type  : 'circle',
    radius: function(o){ return o._radius        ; },
    color : function(o){ return o._colorToFillRgb; },
    alpha : function(o){ return Alphas.toFill * (-o._timer.delta()) / o._outDuration; }
};

/* - the circle filled in the IN phase, now decreasing in size, after the `ping' has occured */
Shapes.filledCircleOut = {
    type  : 'circle',
    radius: function(o){
        var time           = o._outDuration + o._timer.delta();
        var radius         = o._inLastFilledRadius;
        var totalDuration  = o._outDuration;
        var hasPing        = o.breathStrength == 1.0;
        var pingDuration   = hasPing ? Timings.outPing : 0;
        var waitingForPing = hasPing && time <= pingDuration;

        return waitingForPing ? radius : radius * (1 - (time - pingDuration) / (totalDuration - pingDuration));
    },
    color: function(o){ return o._colorRgb       ; },
    alpha: function( ){ return Alphas.holdingRest; }
};

/* - the ping circle, displayed on transition from the HOLD to the OUT phase */
Shapes.pingCircle = {
    type  : 'circle',
    radius: function(o){
        var time          = o._outDuration + o._timer.delta();
        var duration      = Timings.outPing;
        var halfWidthCoef = Dimensions.pingMaxWidthCoef / 2;
        var radius        = o._radius;

        return (time < duration) ? radius * (1 - halfWidthCoef) * time / duration : 0;
    },
    color: function(o){ return o._colorRgb   ; },
    alpha: function( ){ return Alphas.outPing; },
    width: function(o){
        var time     = o._outDuration + o._timer.delta();
        var coef     = Dimensions.pingMaxWidthCoef;
        var duration = Timings.outPing;
        var radius   = o._radius;

        return (time < duration) ? radius * coef * time / duration : 0;
    }
};

/* - the arrow head */
Shapes.arrowHeadPoly = {
    type : 'polygon',
    color: function(o){ return o._colorRgb; },
    alpha: function(o){
        var isOutState = o._state == 'OUT';
        var timeLeft   = -o._timer.delta();
        var duration   = Timings.arrowDisappear;
        var alpha      = Alphas.arrow;

        return alpha * ( (isOutState && timeLeft < duration) ? (timeLeft / duration) : 1.0 );
    },
    points: function(o){
        var v        = Aux.vector;                                    // - auxiliary vector functions
        var height   = o.breathStrength * Dimensions.arrowMaxHeight; // - arrow height
        var centre   = { x: o.pos.x, y: o.pos.y };                    // - centre of the indicator
        var radius   = o._radius;                                     // - indicator radius
        var unit     = o.directionUnit;                               // - direction unit vector
        var margin   = Dimensions.arrowMargin;                        // - margin between indicator and arrow
        var angle    = Math.PI * 3 / 4;                               // - angle between unit and tip to base vector
        var side     = Math.sqrt(2) * height;                         // - lenght of a side of the triangle

        var distance = radius + margin + height;
        var tip      = v.add(centre, v.times(unit, distance) );
        var base1    = v.add(tip, v.times(v.rotate(unit,  angle), side ));
        var base2    = v.add(tip, v.times(v.rotate(unit, -angle), side ));

        return [ tip, base1, base2 ];
    }
};

/* - then arrow tail (fletchings) */
Shapes.arrowTailPoly = {
    type  : 'polygon',
    color : function(o){ return o._colorRgb; },
    alpha : Shapes.arrowHeadPoly.alpha,
    points: function(o){
        var v         = Aux.vector;                 // - auxiliary vector functions
        var centre    = { x: o.pos.x, y: o.pos.y }; // - centre of the indicator
        var radius    = o._radius;                  // - indicator radius
        var unit      = o.directionUnit;            // - direction unit vector
        var margin    = Dimensions.arrowMargin;     // - margin between indicator and arrow
        var height    = Dimensions.arrowMaxHeight;  // - height of the tail
        var lineWidth = Dimensions.arrowTailWidth;  // - width of the line forming the tail
        var angle     = Math.PI * 3 / 4;            // - angle between unit and tip to base vector
        var diagCoef  = Math.sqrt(2);               // - diagonal coefficient
        var side      = diagCoef * height;          // - lenght of a side of the triangle

        var distance  = radius + margin;
        var tip       = v.add(centre, v.times(unit, -distance) );
        var tipUnder  = v.add(tip, v.times(unit, -lineWidth * diagCoef));
        var base1     = v.add(tip, v.times(v.rotate(unit,  angle), side ));
        var base2     = v.add(tip, v.times(v.rotate(unit, -angle), side ));
        var unitOrtho = v.rotate(unit, Math.PI / 2);
        var base1Bis  = v.add(base1, v.times(unitOrtho, -lineWidth * diagCoef));
        var base2Bis  = v.add(base2, v.times(unitOrtho,  lineWidth * diagCoef));

        return [tip, base1, base1Bis, tipUnder, base2Bis, base2];
    }
};


/**
 * BreathIndicator class, encapsulates the display and logic of the breathing
 * indicator.
 *
 * public atttributes
 *  - breathStrength
 *    * strength of the breath taken, in the range [0, 1](available only from
 *      the end of the IN phase onwards).
 *
 *  - directionUnit
 *    * the direction vector in which the indicator is pointed. If
 *      different from 0, the length of the vector is always 1.
 *
 *  - isFailed
 *    * set to true if user did not keep pressing until the HOLD phase.
 *
 *  - events
 */
var _BreathIndicator = function(){
    var EventManager = eventManager;
    var Popup        = popup;

    C.displayName = 'BreathIndicator'
    var prototype   = C.prototype;
    var constructor = C;

    /**
     * Constructor.
     *
     * @param {number} x - indicator's x coordinate
     *
     * @param {number} y - indicator's y coordinate
     *
     * @param {Object} settings -
     *   A hash of options which defines the behaviour of this indicator via the
     *   following options (defaults value defined in InitDefaults):
     *
     *    - inDuration      {number}
     *      * The maximum duration of the IN phase
     *
     *    - outDuration     {number}
     *      * The maximum duration of the OUT phase
     *
     *    - radius          {number}
     *      * The radius of the circular portion of the indicator (in
     *        drawing coordinate)
     *
     *    - colorRgb         {Array}
     *      * An array of three integer values in the range [0, 255]
     *        defining the RGB color of all the front indicator elements
     *
     *    - colorToFillRgb   {Array}
     *      * An array of three integer values in the range [0, 255]
     *        defining the RGB color of the indicator background
     *
     *    - showArrow      {boolean}
     *      * Display indicator direction arrow
     *
     *    - showText       {boolean}
     *      * Display text associated to the indicator
     *
     *    - inMessage       {String}
     *      * The message to display during the IN phase (one of:
     *        'breatheIn', 'breatheLonger')
     */
    function C(x, y, settings){
        if (!settings) { settings = {}; }

        this.pos            = { x: x, y: y };
        this.directionUnit  = { x: 0, y: 0 };
        this.breathStrength =  0.0;
        this.events         = new EventManager();

        this._baseInDuration  = settings.inDuration     || InitDefaults.inDuration    ;
        this._baseOutDuration = settings.outDuration    || InitDefaults.outDuration   ;
        this._maxRadius       = settings.radius         || InitDefaults.radius        ;
        this._colorRgb        = settings.colorRgb       || InitDefaults.colorRgb      ;
        this._colorToFillRgb  = settings.colorToFillRgb || InitDefaults.colorToFillRgb;
        this._inMessage       = settings.inMessage      || InitDefaults.inMessage     ;
        this._showArrow       = settings.showArrow      || false; 
        this._showText        = settings.showText       || false;

        /* initialise texts */
        var xText = x;
        var yText = y > ig.system.height / 2 || (y == 0)
                ? y - this._maxRadius * Dimensions.textDistanceCoef
                : y + this._maxRadius * Dimensions.textDistanceCoef;

        this._inText = new Popup({
            image: ig.resources.images.breatheInText,
            x    : xText,
            y    : yText
        });

        this._outText = new Popup({
            image: ig.resources.images.breatheOutText,
            x    : xText,
            y    : yText
        });

        this._timer = new ig.Timer(); // - timer, countdown in IN and OUT states, stopwatch in HOLD state

        this._init();
    };

    /* public: set in/out durations */
    prototype.setDurations = function(inDuration, outDuration){
        this._baseInDuration  = inDuration;
        this._baseOutDuration = outDuration;
    }

    /* public: start/restart the indicator */
    prototype.restart = function(){
        /* start in IN state */
        this._init();
        this._enterState('IN');
    };

    /* public: called on release of the mouse button */
    prototype.release = function(){
        this._enterState('OUT');
        this.events.emit('released', this.breathStrength)
    };

    /* public: update */
    prototype.update = function(){
        var s = this._state;
        var t = this._timer.delta();
        var outText = this._outText;

        /* when in IN state */
        if (s === 'IN') {
            var inDuration    = this._inDuration;
            var timeFromStart = t + inDuration;

            /* initial growth */
            this._radius = this._maxRadius *
                (timeFromStart < Timings.initialGrowth ? timeFromStart / Timings.initialGrowth : 1.0);

            /* update breath strength */
            this.breathStrength = timeFromStart / inDuration;

            /* update direction */
            this._updateDirection();

            /* hide text near the end of the IN phase*/
            if (t > -Timings.inTextHiding) { this._inText.hide(); }

            /* go to HOLD state at the end of IN phase */
            if (t > 0) { this._enterState('HOLD'); }

        /* when in HOLD state */
        } else if (s === 'HOLD') {
            /* update direction */
            this._updateDirection();
            if (!outText.state && t > Timings.outTextShow) {
                outText.show();
            }

        /* when in OUT state */
        } else if (s === 'OUT') {

            /* hide text near the end of the OUT phase */
            if (t > -Timings.outTextHiding) {
                outText.hide();

            } else if (!outText.state
                    && t > -(this._outDuration - Timings.outTextShow)
                    && t < -Timings.outTextMinimum                  ) {
                outText.show();
            }

            /* hide the indicator at the end of OUT phase */
            if (t > 0) {
                this._state = null;
                //this.events.emit('finished');
            }
        }

        this._inText.update();
        this._outText.update();
    };

    /* public: draw the indicator */
    prototype.draw = function(ctx){
        if (!ctx) {
            ctx = ig.system.context;
        }
        var s = this._state;

        if (s) {
            if (s ===   'IN') { this._drawIn(ctx)  ; } else // draw IN phase
            if (s === 'HOLD') { this._drawHold(ctx); } else // draw HOLD phase
            if (s ===  'OUT') { this._drawOut(ctx) ; } else // draw OUT phase
                // should never happen
                throw new Error('Runtime error: unexpected breathIndicator state: ' + this._state);

            /* draw arrow */
            if (this._showArrow) { this._drawArrow(); }

            /* draw texts */
            this._inText.draw();
            this._outText.draw();
        }
    };


/* internal methods */

    /* internal: init */
    prototype._init = function(){
        this.isFailed       = false;
        this.breathStrength = 0.0;
        this._inDuration    = this._baseInDuration;
        this._outDuration   = this._baseOutDuration;
        this._state         = null;           // - indicator state, one of [ null, 'IN', 'HOLD', 'OUT' ]
        this._radius        = 0;              // - *current* max radius of the circular parts of the indicator
                                                //   (vs. _maxRadius which is all time max)
        this._inText.hide();
        this._outText.hide();
    };

    /* internal: enter state */
    prototype._enterState = function(newState){

        var state       = this._state;
        var timer       = this._timer;
        var inText      = this._inText;
        var inDuration  = this._inDuration;
        var outDuration = this._outDuration;

        /* from null to IN */
        if (!state && newState === 'IN') {
            timer.set(inDuration);
            inText.show();

        /* from IN to HOLD */
        } else if (state === 'IN' && newState === 'HOLD') {
            timer.set(0);
            this.breathStrength = 1.0;
            this.events.emit('fullBreath')

        /* from IN to OUT */
        } else if (state === 'IN' && newState === 'OUT') {
            var timeLeft = -timer.delta();
            var strength = this.breathStrength;

            inText.hide();
            timer.set(outDuration * strength);
            this._outDuration    *= strength;
            this.isFailed = true;

        /* from HOLD to OUT */
        } else if (state === 'HOLD' && newState === 'OUT') {
            timer.set(outDuration);

        // should never happen
        } else throw new Error("Invalid state transition from '" + state + "' to '" + newState + "'");

        this._state = newState;
    };

    /* internal: update direction vector */
    prototype._updateDirection = function(){
        /* auxiliary vector functions */
        var v = Aux.vector;

        var centre = {
            x: this.pos.x,
            y: this.pos.y };

        var mouse  = {
            x: ig.system.getDrawPos(ig.input.mouse.x - ig.game.screen.x),
            y: ig.system.getDrawPos(ig.input.mouse.y - ig.game.screen.y) };

        var centreToMouse = v.diff(mouse, centre);
        var ctmLength     = v.length(centreToMouse);

        this.directionUnit =
            (ctmLength !== 0) ?
                v.times(centreToMouse, -1.0 / ctmLength) :
                { x: 0, y: 0 };
    };

    /* internal: draw the circular bits during the IN phase */
    prototype._drawIn = function(ctx){
        this._drawShape(ctx, 'circleToFill' );
        this._drawShape(ctx, 'fillingCircle');
    };

    /* internal: draw the circular bits during the HOLD phase */
    prototype._drawHold = function(ctx){
        this._drawShape(ctx, 'circleToFill' );
        this._drawShape(ctx, 'holdingCircle');
    };

    /* internal: draw the circular bits during the OUT phase */
    prototype._drawOut = function(ctx){
        this._drawShape(ctx, 'circleToFillOut');
        this._drawShape(ctx, 'filledCircleOut');
        if (this.breathStrength == 1.0) {
            this._drawShape(ctx, 'pingCircle'     );
        }
    };

    /* internal: draw arrow */
    prototype._drawArrow = function(ctx){
        this._drawShape(ctx, 'arrowHeadPoly');
        this._drawShape(ctx, 'arrowTailPoly');
    };

    /* internal: draw a shape from its definition id */
    prototype._drawShape = function(ctx, shapeId){

        var definition = Shapes[shapeId];

        /* color and alpha */
        var alpha = definition.alpha(this);
        var color = definition.color(this);
        var colorString = Aux.colorString(color, alpha);

        /* optional width */
        var width = definition.width != null ? definition.width(this) : null;

        /* trace path */
        var tracePath = null;
        if (definition.type === 'circle') {
            /* circle path */
            var x      = ig.system.getDrawPos(this.pos.x);
            var y      = ig.system.getDrawPos(this.pos.y);
            var radius = definition.radius(this);

            tracePath = function(){
                ctx.moveTo(x + radius, y);
                ctx.arc(x, y, radius * ig.system.scale, 0, Math.PI * 2);
            };

        } else if (definition.type === 'polygon') {
            /* polygon path */
            var points = definition.points(this);
            if (points.length < 2) { return; }

            tracePath = function(){
                ctx.moveTo( points[0].x, points[0].y );
                for(var i = 1; i != points.length; ++i) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
            };

        } else throw new Error("Unknown shape type '" + definition.type + "'"); // should never happen

        /* if width is not null draw the shape's outline, otherwise the filled shape */
        if (width !== null) {
            /* outline */
            ctx.strokeStyle = colorString;
            ctx.lineWidth   = width;
            ctx.beginPath();
            tracePath();
            ctx.closePath();
            ctx.stroke();

        } else {
            /* filled */
            ctx.fillStyle = colorString;
            ctx.lineWidth = 0;
            ctx.beginPath();
            tracePath();
            ctx.closePath();
            ctx.fill();
        }
    };

    return C;
};

ig.module(
    'game.breathIndicator'
).requires(
    'game.eventManager',
    'game.popup'
).defines(
    function(){
        breathIndicator = _BreathIndicator();
    }
);

