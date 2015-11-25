function equal(a, b, error) {
	return (Math.abs(a-b) <= error);
}

function radiansToDegrees(radians) {
	return radians * 180 / Math.PI;
}

function degreesToRadians(degree) {
	return (degree * Math.PI)/180;
}

function angleBetween(a, b) {
	// console.log(radiansToDegrees(Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x)));
	var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
	if (angle < 0) {
		angle += Math.PI * 2;
	}
	return angle;
}

function signedAngleBetween(a, b) {	
	return Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
}

function angleToTable(domino) {
	// Get face normal, take rotation into consideration		
	var mat = new THREE.Matrix4().extractRotation( domino.matrixWorld );
	var normal = domino.geometry.faces[4].normal.clone()
	normal.applyMatrix4(mat);
	normal.normalize();

	// Project vector to table.
	var tableVector = new THREE.Vector3(normal.x, 0, normal.z);

	// Angle to table
	return normal.angleTo(tableVector);
}

function screenToWorld(x, y) {
	var v = new THREE.Vector3(
		( x / window.innerWidth ) * 2 - 1,
		-( y / window.innerHeight ) * 2 + 1,
		1
	);
		
	return v.unproject(camera);
}

function playCollisionSound() {
	// var snd1  = new Audio();
	// var src1  = document.createElement("source");
	// src1.type = "audio/mpeg";
	// src1.src  = "/sounds/Dominoes hit table table clumsy slide2.mp3";
	// snd1.appendChild(src1);
	// snd1.play();
	
	// collision_sound.currentTime = 0;
	// collision_sound.play();	

	var collision_sound_clone = collision_sound.cloneNode();
	collision_sound_clone.play();
}

function drawArch() {
	var radius = block_length*3;
	var tube = block_length/2;
	var radialSegments = 7;
	var tubularSegments = 30;
	var arc = Math.PI/2;
	var geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
	// var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
	var material = new THREE.MeshBasicMaterial( { map: arrowTexture, transparent: true} );
	var torus = new THREE.Mesh( geometry, material );
	return torus;
}

function createdArrows() {
	var material = new THREE.MeshBasicMaterial( { map: arrowTexture, transparent: true} );		
	
	var geometry = new THREE.SphereGeometry(1.4, 16, 8, Math.PI/6, 2, 1, 1.2);		
	
	rightArrow = new THREE.Mesh(geometry, material);

	var geometry = new THREE.SphereGeometry(1.4, 16, 8, Math.PI/6 + Math.PI, 2, 1, 1.2);
	
	leftArrow = new THREE.Mesh(geometry, material);
}

function drawAxes(size, position, rotation) {
	size = size || 1;
    var vertices = new Float32Array( [
    0, 0, 0, size, 0, 0,
    0, 0, 0, 0, size, 0,
    0, 0, 0, 0, 0, size
    ] );
    var colors = new Float32Array( [
    1, 0, 0, 1, 0.6, 0,
    0, 1, 0, 0.6, 1, 0,
    0, 0, 1, 0, 0.6, 1
    ] );
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
    var mesh = new THREE.Line(geometry, material, THREE.LinePieces );
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    return mesh;
}