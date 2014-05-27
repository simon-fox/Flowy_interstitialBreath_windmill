ig.module(
	'game.entities.balloon_ropeSegment'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityBalloon_ropeSegment = ig.Box2DEntity.extend({
	size: {x: 5, y:30},
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "ROPESEGMENT",
	state: "ON",
	animSheet: new ig.AnimationSheet( 'media/Balloon_String_5x30px.png', 5 , 30 ),
	zIndex: 5,

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'idle' , 0.1 , [0] );
		this.currentAnim = this.anims.idle;
	},

	createBody: function() {
		//build new body definition from prototype
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		//set values
	    bodyDef.position = new Box2D.Common.Math.b2Vec2(
			(this.pos.x ) * Box2D.SCALE,
			(this.pos.y ) * Box2D.SCALE
		); 
	    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;    
	    //create body, assign to this class
	    this.body = ig.world.CreateBody(bodyDef);

	    //new fixture definition from prototype
	    var fixture = new Box2D.Dynamics.b2FixtureDef;
	    //set values
		fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();   
		//set up vertex array - array of points
		var verticesArray = [
			new Box2D.Common.Math.b2Vec2(-2.5 * Box2D.SCALE, 13 * Box2D.SCALE),
			new Box2D.Common.Math.b2Vec2(-2.5 * Box2D.SCALE, -13 * Box2D.SCALE),
			new Box2D.Common.Math.b2Vec2(2.5 * Box2D.SCALE, -13 * Box2D.SCALE),	
			new Box2D.Common.Math.b2Vec2(2.5 * Box2D.SCALE, 13 * Box2D.SCALE)	
		];

		fixture.shape.SetAsArray(verticesArray);
	    fixture.density = 1;
	    fixture.friction = 1;
	    fixture.restitution = 0;
	    fixture.userData = this;
	    //set collision categories
	    fixture.filter.categoryBits = 0x0001;
	    fixture.filter.maskBits = 0x0002;

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);   


	},

	update: function() {
		this.parent();

		//set position and angle so that the stalk is facing the center of the dandelion head
	
	}

});

});