	ig.module(
	'game.entities.IBanchor'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

IBEntityAnchor = ig.Box2DEntity.extend({
	size: { x: 17, y: 17 },
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "ANCHOR",
	zIndex: 5,
	
	init: function( x, y, settings ) {
		this.animSheet = new ig.AnimationSheet( 'media/Centre_peg.png' , 17 , 17 );
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
	    bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;    
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

	    fixture.density = 1.0;
	    fixture.friction = 0.1;
	    fixture.restitution = 0.4;
	    fixture.filter.groupIndex = -1;
	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);


    	//spawn blade
	    this.blade = ig.game.spawnEntity( IBEntityWindMillBlade , this.pos.x , this.pos.y );
	    //make joint
	    var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
	    var bodyA = this.body;
	    var bodyB = this.blade.body;

	    jointDef.localAnchorA = new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );
	    jointDef.localAnchorB = new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );

	    jointDef.bodyA = bodyA;
	    jointDef.bodyB = bodyB;

	    jointDef.maxMotorTorque = 500;
	    jointDef.motorSpeed = 0;
	    jointDef.enableMotor = true;
	    
	    this.revoluteJoint = ig.world.CreateJoint( jointDef );
	    
		    

	},
	
	
	update: function() {

		this.parent();
	}
});

});


