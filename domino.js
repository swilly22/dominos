var Consts = require('./consts.js');
var Globals = require('./globals.js');
var THREE = require('three');
var Utils = require('./utils.js');
var TWEEN = require('tween');

function Domino(position, angle, color, collisionHandler, Physijs) {

	this.rotation = new THREE.Vector3(0,0,0);
	this.angle = 0;
	this.color =  color || Consts.domino_base_color;
	this.mesh;

	var block_material = Physijs.createMaterial(
		new THREE.MeshLambertMaterial(
			{color: this.color, vertexColors: THREE.FaceColors}),
			0.4, // medium friction
			0.2 // medium restitution ("bounciness")
	);

	
	var block_geometry = new THREE.CubeGeometry(Consts.block_thick, Consts.block_height,Consts.block_width);
	this.mesh = new Physijs.BoxMesh(block_geometry, block_material);
	
	this.move(position);
	if(angle) {
		this.turn(angle);
	}
	
	this.mesh.__dirtyPosition = true;
	this.position.y = 1.2 + Consts.block_height/2;
	this.mesh.position.copy(this.position);	

	this.mesh.setCcdMotionThreshold(0.1);
	this.mesh.setCcdSweptSphereRadius(0.2);

	this.mesh.addEventListener('collision', collisionHandler, false);

	// store a reference to this domino inside the mesh.
	this.mesh.domino = this;
}

Domino.prototype.move = function(position) {
	this.mesh.position.copy(position);
	this.position = position.clone()
}

Domino.prototype.turn = function(angle) {
	// this.mesh.__dirtyPosition = true;
	this.mesh.__dirtyRotation = true;
	this.mesh.rotateY(angle);
	// this.mesh.geometry.applyMatrix( new THREE.Matrix4().makeRotationY( angle ) );
	this.rotation.copy(this.mesh.rotation);
	this.angle += angle;
}

Domino.prototype.push = function(face) {
	// Get face normal, take rotation into consideration
	var mat = new THREE.Matrix4().extractRotation( this.mesh.matrixWorld );
	var normal = face.normal.clone();
	normal.applyMatrix4(mat);

	// compute force
	var f = new THREE.Vector3().copy(normal);
	
	// apply force in oposite direction.
	f.multiplyScalar(-3.5);
	this.mesh.setLinearVelocity(f);
	// domino.applyCentralImpulse(f);
}

Domino.prototype.highlight = function() {
	this.mesh.material.color.r += 0.1;
	this.mesh.material.color.g += 0.1;
	this.mesh.material.color.b += 0.1;
}

Domino.prototype.restoreColor = function() {
	this.mesh.material.color.r -= 0.1;
	this.mesh.material.color.g -= 0.1;
	this.mesh.material.color.b -= 0.1;
}

Domino.prototype.select = function() {
	this.color = Globals.selected_color.color;
	this.mesh.material.color = new THREE.Color(Globals.selected_color.color);
	this.highlight();
	this.highlight();

	// Add arrows.
	// scene.add(rightArrow);
	// scene.add(leftArrow);

	// this.mesh.add(rightArrow);
	// this.mesh.add(leftArrow);
}

Domino.prototype.deSelect = function() {
	this.restoreColor();
	this.restoreColor();

	// Remove arrows.
	// scene.remove(rightArrow);
	// scene.remove(leftArrow);

	// this.mesh.remove(rightArrow);
	// this.mesh.remove(leftArrow);
}

Domino.prototype.freez = function() {
	if(Globals.edit_mode) {
		this.mesh.setAngularVelocity(Consts.zero);
		this.mesh.setLinearVelocity(Consts.zero);
	} else {
		this.mesh.mass = 0;
	}
}

Domino.prototype.unFreez = function() {
	if(Globals.edit_mode) {
		this.mesh.setAngularVelocity(Consts.one);
		this.mesh.setLinearVelocity(Consts.one);
	} else {
		this.mesh.mass = Consts.block_width * Consts.block_height * Consts.block_thick;	
	}
}

Domino.prototype.marshal = function() {
	return { 'position':this.position, 'angle':this.angle, 'color':this.color };
}

Domino.prototype.restoreOriginalPosition = function() {
	var me = this;	
	
	this.freez();
	
	// current orientation
	var from = {posX: this.mesh.position.x, posY: this.mesh.position.y, posZ: this.mesh.position.z,
		rotX: this.mesh.rotation.x, rotY: this.mesh.rotation.y, rotZ: this.mesh.rotation.z};

	// convert roration angle to a vector.
	var xFromRotationV = new THREE.Vector2(Math.cos(this.mesh.rotation.x), Math.sin(this.mesh.rotation.x));
	var xToRotationV = new THREE.Vector2(Math.cos(this.rotation.x), Math.sin(this.rotation.x));
	var rotX = Utils.signedAngleBetween(xFromRotationV, xToRotationV);
	rotX += this.mesh.rotation.x;

	var yFromRotationV = new THREE.Vector2(Math.cos(this.mesh.rotation.y), Math.sin(this.mesh.rotation.y));
	var yToRotationV = new THREE.Vector2(Math.cos(this.rotation.y), Math.sin(this.rotation.y));
	var rotY = Utils.signedAngleBetween(yFromRotationV, yToRotationV);
	rotY += this.mesh.rotation.y;

	var zFromRotationV = new THREE.Vector2(Math.cos(this.mesh.rotation.z), Math.sin(this.mesh.rotation.z));
	var zToRotationV = new THREE.Vector2(Math.cos(this.rotation.z), Math.sin(this.rotation.z));
	var rotZ = Utils.signedAngleBetween(zFromRotationV, zToRotationV);
	rotZ += this.mesh.rotation.z;

	var to = {posX: this.position.x, posY: (Consts.block_height/2) + 0.05, posZ: this.position.z,
    rotX: rotX, rotY: rotY, rotZ: rotZ};

	var tween = new TWEEN.Tween(from)
    .to(to, 1000)
    .onUpdate(function() {
        
		me.mesh.position.setX(this.posX);
		me.mesh.position.setY(this.posY);
		me.mesh.position.setZ(this.posZ);
		
		me.mesh.rotation.x = this.rotX;
		me.mesh.rotation.y =  this.rotY;
		me.mesh.rotation.z =  this.rotZ;
		
    })
    .onComplete(function() {    	
    	me.mesh.__dirtyPosition = true;
    	me.mesh.__dirtyRotation = true;
    	me.unFreez();

		me.position.copy(me.mesh.position);
		me.rotation.copy(me.mesh.rotation);
    })
    .start();
}

module.exports = Domino;