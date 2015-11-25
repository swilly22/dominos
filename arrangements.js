function arrangePyramid() {
		var height = 10;
		var pyramid_top = new THREE.Vector3(0, 0, 1.5*block_width);
		var pieces = [];

		for (var i = 1; i <= height; i++) {
			var zOffset = i * (-0.75 * block_width);

			for (var j = 0; j < i; j++) {
				var current = new THREE.Vector3();
				current.copy(pyramid_top);
				current.x += i * (0.6*block_height);
				current.z += zOffset + (j * (1.25*block_width));

				pieces.push({position: current});
			}
		}

		addDominos(pieces);
}

function arrangeCircle() {
	var center = new THREE.Vector3(0,0,0);
	var radius = 10 * block_width;
	var picesCount = 48;

	var pieces = [];

	for(var i = 0; i < picesCount; i++) {
		var pos = new THREE.Vector3().copy(center);
		
		// var angle = -1 * degreesToRadians((360 / picesCount) * i);
		var angle = -2 * Math.PI / picesCount * i;
		var x = Math.cos(angle) * radius;
		var z = Math.sin(angle) * radius;

		pos.x += x;
		pos.z += z;
					
		angle = Math.PI/2 - angle;
		
		// createDomino(pos, angle);
		pieces.push({position: pos, angle: angle});
	}
	addDominos(pieces);
}

function arrangeSpirala() {
	var pieces = [];
	var angleDelta = 2 * Math.PI / 36;
	var radius = 10 * block_width;
	var center = new THREE.Vector3(0, 0, 0);		
	var i = 0;

	do {
		var pos = new THREE.Vector3().copy(center);
		var angle = angleDelta * i;
		var x = Math.cos(angle) * radius;
		var z = Math.sin(angle) * radius;

		pos.x += x;
		pos.z += z;
					
		angle = Math.PI/2 - angle;
		radius -= 0.15;

		pieces.push({position: pos, angle: angle});
		i++;
	} while(center.distanceTo(pos) > 1.5 * block_width);
	addDominos(pieces);
}

function arrangeText() {	
	var pos;
	var pieces = [];
	
	// Left row.
	var i = 0;
	do {
		pos = new THREE.Vector3(table_height/2 - block_width*2, 0, table_width/2 - block_width);
		pos.x -= i * block_thick * 4;

		// One out of every 4 blocks.
		if(i%5 == 2) {
			var angle = -Math.PI/4.5;
			var posA = new THREE.Vector3();
			posA.copy(pos);
			posA.z -= 0.5*block_width;
			pieces.push({position: posA, angle: angle});
			
			var j = 0;
			// for(var j = 0; j < 22; j++) {
			do{
				var posB = new THREE.Vector3();
				posB.copy(posA);
				posB.x -= 0.8 * block_height;
				posB.z -= block_height * 0.6;
				posB.z -= block_thick * 3 * j;
				var angle = Math.PI/2;
				pieces.push({position: posB, angle: angle});

				posB = new THREE.Vector3();
				posB.copy(posA);
				posB.x -= 0.1 * block_height;
				posB.z -= block_height * 0.6;
				posB.z -= block_thick * 3 * j;
				var angle = Math.PI/2;
				pieces.push({position: posB, angle: angle});
				j++;
			} while(posB.z > ((-0.5 * table_width) + (block_width * 2) + (block_height * 1.6)));
		} else {
			pieces.push({position: pos});
		}
		i++;
	// distance from edge > 2 * block_width)
	}while(pos.x > (-0.5 * table_height) + (2 * block_width));

	// make our way to the second column.
	pos = new THREE.Vector3(table_height/2 - block_width*2, 0, table_width/2 - block_width);
	pos.x -= i * block_thick * 4;
	pos.z -= 0.5*block_width;
	var angle = -Math.PI/4.5;
	pieces.push({position: pos, angle: angle});

	var posB;
	var j = 0;
	do {
		posB = new THREE.Vector3();
		posB.copy(pos);
		posB.x -= 0.1 * block_height;
		posB.z -= block_height * 0.6;
		posB.z -= block_thick * 3 * j;
		var angle = Math.PI/2;
		pieces.push({position: posB, angle: angle});
		j++;
	} while(posB.z > ((-0.5 * table_width) /*+ (block_width * 2)*/ + (block_height * 1.6)));

	var posC = new THREE.Vector3();
	posC.copy(posB);
	var angle = Math.PI/4;
	posC.z -= 0.5*block_height;
	posC.x += 0.5*block_width;
	pieces.push({position: posC, angle: angle});

	// second column
	i = 0;
	do {
	// for(var i = 0; i < 20; i++) {
		var pos = new THREE.Vector3(-table_height/2 + block_width*3, 0, -table_width/2 + block_width);
		pos.x += i * block_thick * 4;

		// One out of every 4 blocks.
		if(i%5 == 4) {
			var angle = -Math.PI/4.5;
			var posA = new THREE.Vector3();
			posA.copy(pos);
			posA.z += 0.5*block_width;
			pieces.push({position: posA, angle: angle});

			// for(var j = 0; j < 21; j++) {
			var j = 0;
			do {
				var posB = new THREE.Vector3();
				posB.copy(posA);
				posB.x += 0.6 * block_height;
				posB.z += block_height * 0.6;
				posB.z += block_thick * 3 * j;
				var angle = Math.PI/2;
				pieces.push({position: posB, angle: angle});

				posB = new THREE.Vector3();
				posB.copy(posA);
				posB.x += 0.0 * block_height;
				posB.z += block_height * 0.6;
				posB.z += block_thick * 3 * j;
				var angle = Math.PI/2;
				pieces.push({position: posB, angle});
				j++;
			}while(posB.z < (0.5 * table_width) - (2 * block_width) - (1.6 * block_height));


			// while(posB.z > ((-0.5 * table_width) + (block_width * 2) + (block_height * 0.6)));

		} else {
			pieces.push({position: pos});
			
		}
		i++;
	// distance from edge > 2 * block_width)
	}while(pos.x < (0.5 * table_height) - (2 * block_width));

	addDominos(pieces);
}