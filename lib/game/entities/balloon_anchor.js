	ig.module(
	'game.entities.balloon_anchor'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityBalloon_anchor = ig.Box2DEntity.extend({
	size: {x: 80, y:60},
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "ANCHOR",
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
	},

	createBody: function() {
		//build new body definition from prototype
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		//set values
	    bodyDef.position = new Box2D.Common.Math.b2Vec2(
			(this.pos.x + this.size.x / 2 ) * Box2D.SCALE,
			(this.pos.y + this.size.y / 2 ) * Box2D.SCALE
		); 
	    bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;    
	    //create body, assign to this class
	    this.body = ig.world.CreateBody(bodyDef);

	    //new fixture definition from prototype
	    var fixture = new Box2D.Dynamics.b2FixtureDef;
	    //set values
		fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();   
		//set up vertex array - array of points
		var verticesArray = [
			new Box2D.Common.Math.b2Vec2(-5 * Box2D.SCALE, 5 * Box2D.SCALE),
			new Box2D.Common.Math.b2Vec2(-5 * Box2D.SCALE, -5 * Box2D.SCALE),
			new Box2D.Common.Math.b2Vec2(5 * Box2D.SCALE, -5 * Box2D.SCALE),		
			new Box2D.Common.Math.b2Vec2(5 * Box2D.SCALE, 5 * Box2D.SCALE)	
		];

		fixture.shape.SetAsArray(verticesArray);
	    fixture.density = 1.0;
	    fixture.friction = 0.1;
	    fixture.restitution = 0.4;
	    fixture.filter.groupIndex = -1;
	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);

	},
	
	
	update: function() {

		this.parent();
	}
});

});


