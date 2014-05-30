	ig.module(
	'game.entities.IBwindMillBlade'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

IBEntityWindMillBlade = ig.Box2DEntity.extend({
	size: { x: 300, y: 300 },
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "BLADE",
	zIndex: 5,
	
	init: function( x, y, settings ) {
		this.animSheet = new ig.AnimationSheet( 'media/all_sails_300x300.png' , 300 , 300 );
		this.addAnim( 'idle' , 0.1 , [0] );
		this.currentAnim = this.anims.idle;

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
	    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;    
	    //create body, assign to this class
	    this.body = ig.world.CreateBody(bodyDef);

	    //new fixture definition from prototype
	    var fixture = new Box2D.Dynamics.b2FixtureDef;
	    //set values
		fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();   
		//set up vertex array - array of points
		fixture.shape.SetAsBox(
			this.size.x / 2 * Box2D.SCALE,
			this.size.y / 2 * Box2D.SCALE
		);
		
	    fixture.density = 0.005;
	    fixture.friction = 0.1;
	    fixture.restitution = 0;
	
	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);

	    this.body.SetAngularDamping(0.1);

	},
	
	
	update: function() {

		this.parent();
	}
});

});


