var THREE = require('three');

function Utils() {	

	function dataURItoBlob(dataURI) {
	    var binary = atob(dataURI.split(',')[1]);
	    var array = [];
	    for(var i = 0; i < binary.length; i++) {
	        array.push(binary.charCodeAt(i));
	    }
	    return array;
	    // return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
	}	

	this.equal = function (a, b, error) {
		return (Math.abs(a-b) <= error);
	};

	this.radiansToDegrees = function (radians) {
		return radians * 180 / Math.PI;
	};

	this.degreesToRadians = function (degree) {
		return (degree * Math.PI)/180;
	};

	this.angleBetween = function (a, b) {
		// console.log(radiansToDegrees(Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x)));
		var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
		if (angle < 0) {
			angle += Math.PI * 2;
		}
		return angle;
	};

	this.signedAngleBetween = function (a, b) {	
		return Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
	};

	this.angleToTable = function (domino) {
		// Get face normal, take rotation into consideration		
		var mat = new THREE.Matrix4().extractRotation( domino.matrixWorld );
		var normal = domino.geometry.faces[4].normal.clone()
		normal.applyMatrix4(mat);
		normal.normalize();

		// Project vector to table.
		var tableVector = new THREE.Vector3(normal.x, 0, normal.z);

		// Angle to table
		return normal.angleTo(tableVector);
	};

	this.screenToWorld = function (x, y, camera) {
		var v = new THREE.Vector3(
			( x / window.innerWidth ) * 2 - 1,
			-( y / window.innerHeight ) * 2 + 1,
			1
		);
			
		return v.unproject(camera);
	};

	this.drawArch = function () {
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
	};

	this.createdArrows = function () {
		var material = new THREE.MeshBasicMaterial( { map: arrowTexture, transparent: true} );		
		
		var geometry = new THREE.SphereGeometry(1.4, 16, 8, Math.PI/6, 2, 1, 1.2);		
		
		rightArrow = new THREE.Mesh(geometry, material);

		var geometry = new THREE.SphereGeometry(1.4, 16, 8, Math.PI/6 + Math.PI, 2, 1, 1.2);
		
		leftArrow = new THREE.Mesh(geometry, material);
	};

	this.drawAxes = function (size, position, rotation) {
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
	};

	this.takeScreenShot = function(renderer) {
		var dataUri = renderer.domElement.toDataURL("image/jpeg");
		// var dataUri = renderer.domElement.toDataURL("image/webp");
		var binaryImage = dataURItoBlob(dataUri);
		return binaryImage;
	};

	this.getPageId = function() {
		// search for ID in query string.
		var url = window.location.href;
		var startIdx = url.indexOf("l=");
		if(startIdx === -1) {
			return;
		}
		
		startIdx += "l=".length;

		var endIdx = (url.indexOf("&") !== -1) ? url.indexOf("&") : url.length;

		var id = url.substr(startIdx, endIdx - startIdx);
		return id;
	}

	this.tweet = function (url) {

		var windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
			width = 550,
			height = 420,
			winHeight = screen.height,
			winWidth = screen.width;

		var left = Math.round((winWidth / 2) - (width / 2));
        var top = 0;

        if (winHeight > height) {
         	top = Math.round((winHeight / 2) - (height / 2));
        }

        window.open(url, 'intent', windowOptions + ',width=' + width +
                    ',height=' + height + ',left=' + left + ',top=' + top);


        return false;
    };
}

module.exports = new Utils();