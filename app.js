'use strict';

var THREE = require('three');
var Physijs = require('physijs-browserify')(THREE);
var OrbitControls = require('three-orbit-controls')(THREE)
var dat = require('dat-gui');
var TWEEN = require('tween');

var Utils = require('./utils.js');
var Consts = require('./consts.js');
var Globals = require('./globals.js');
var Domino = require('./domino.js');
var Arrangments = require('./arrangements.js');


// Physijs.scripts.worker = './node_modules/physijs-browserify/libs/physi-worker.js';
Physijs.scripts.worker = '/js/physi-worker.js';
Physijs.scripts.ammo = 'ammo.js';


function App () {
	var self = this;
	var initEventHandling;
	var renderer;
	var scene;
	var camera;
	var controls;
	var audio = require('./audio.js');
	var gallery;
	var blocks = [];
	var activeBlocks = [];
	var intersect_plane;
	var selected_block = null;
	var intersected_block = null;
	var mouse_position = new THREE.Vector3;
	var track_mouse = false;
	var dragging = false;
	var tracking_points = [];
	var collision_history = {};

	// instantiate a loader
	var loader = new THREE.TextureLoader();
	// var arrowTexture = loader.load('images/arrow.png');

	function initScene() {
		renderer = new THREE.WebGLRenderer({ 
			// antialias: true,
			preserveDrawingBuffer: true   // required to support .toDataURL() 
		});

		renderer.setSize( window.innerWidth, window.innerHeight );
		// renderer.shadowMapEnabled = true;
		// renderer.shadowMapSoft = true;
		document.getElementById( 'viewport' ).appendChild( renderer.domElement );		
		
		scene = new Physijs.Scene({ fixedTimeStep: 1 / 60 });
		scene.setGravity(new THREE.Vector3( 0, -120, 0 ));
		scene.addEventListener('update',
			function() {				
				scene.simulate();
			}
		);
		
		camera = new THREE.PerspectiveCamera(
			35,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);
		camera.position.set( 75, 50, 0 );
		camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
		scene.add( camera );
		
		controls = new OrbitControls(camera);	
		controls.enablePan = false;

		// ambient light
		var am_light = new THREE.AmbientLight( 0x444444 );
		scene.add( am_light );

		// directional light
		var dir_light = new THREE.DirectionalLight( 0xFFFFFF );
		dir_light.position.set( 20, 30, -5 );
		dir_light.target.position.copy( scene.position );
		scene.add( dir_light );


		// Table
		var table_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( '/textures/wood.jpg' ) }),
			.9, // high friction
			.2 // low restitution
		);
		table_material.map.wrapS = table_material.map.wrapT = THREE.RepeatWrapping;
		table_material.map.repeat.set( 1, 1 );

		var table = new Physijs.BoxMesh(
			new THREE.BoxGeometry(Consts.table_width, Consts.table_length, Consts.table_height),
			table_material,
			0, // mass
			{ restitution: .2, friction: .8 }
		);

		table.position.y = -.5;
		// table.receiveShadow = true;
		scene.add( table );		

		intersect_plane = new THREE.Mesh(
			new THREE.PlaneGeometry( window.innerWidth, window.innerHeight ),
			new THREE.MeshBasicMaterial({ opacity: 0, transparent: true, wireframe: false })
		);
		intersect_plane.rotation.x = Math.PI / -2;
		scene.add( intersect_plane );

		initEventHandling();
		
		requestAnimationFrame( render );		
		scene.simulate();
		
		// addDominos(Arrangments.arrangePyramid());
		// addDominos(Arrangments.arrangeCircle());
		// addDominos(Arrangments.arrangeSpirala());
		// addDominos(Arrangments.arrangeText());
		initDatGui();
	};

	var frameCount = 0;
	function render() {
		requestAnimationFrame( render );
		TWEEN.update();	
		renderer.render( scene, camera );

		// Once every 24 frames.
		if(frameCount % 24 == 0) {
			for(var i = 0; i < activeBlocks.length; i++) {
				var block = activeBlocks[i];

				// does angle between the table and current domino
				// below Math/6?
				if( Utils.angleToTable(block) <= Math.PI/6 && block.mass !== 0 ) {
					// Freez.
					block.domino.freez();

					// remove domino from physics engine
					// domino.mass = 0;
					// activeBlocks.splice(i, 1);
				}
			}
		}
		frameCount++;
	};

	initEventHandling = (function() {
		var _vector = new THREE.Vector3;
		var handleMouseDown;
		var handleMouseMove;
		var handleMouseUp;
		
		handleMouseDown = function( evt ) {
			var ray;
			var button;
			var intersections;
			
			button = 

			_vector = Utils.screenToWorld(evt.clientX, evt.clientY, camera);
			mouse_position.copy(_vector);

			ray = new THREE.Raycaster( camera.position, _vector.sub( camera.position ).normalize() );

			var intersections = ray.intersectObjects( blocks );

			switch(evt.which) {
				case Consts.left_button:
					if ( intersections.length !== 0 ) {
						if(selected_block !== intersections[0].object.domino) {
							if(selected_block !== null) {
								selected_block.deSelect();
							}
							selected_block = intersections[0].object.domino;
							selected_block.select();

							selected_block.mesh.setAngularVelocity(Consts.zero);
							selected_block.mesh.setLinearVelocity(Consts.zero);
						}
						dragging = true;
						controls.enabled = false;
					}
					break;
				case Consts.right_button: 
					// are we on a domino?
					if ( intersections.length !== 0 ) {
						var intersected_domino = intersections[0].object.domino;
						intersected_domino.push(intersections[0].face);
					}
					else {
						var intersection = ray.intersectObject( intersect_plane );
						mouse_position.copy( intersection[0].point );
						startTracking(intersection[0].point);						
					}
					break;
			}
		};
		
		handleMouseMove = function( evt ) {
			var ray;
			var intersections;
			
			// Get mouse position in the world.
			_vector = Utils.screenToWorld(evt.clientX, evt.clientY, camera);

			mouse_position.copy(_vector);
				
			ray = new THREE.Raycaster( camera.position, _vector.sub( camera.position ).normalize() );

			// are we intersecting with any blocks?
			intersections = ray.intersectObjects( blocks );			
			if (intersections.length > 0) {
				if (intersected_block === null) {
					intersected_block = intersections[0].object;
					intersected_block.domino.highlight();
				}
				else if(intersected_block !== intersections[0].object) {
					// restore previous intersection object (if it exists) to its original color
					intersected_block.domino.restoreColor();
					intersected_block = intersections[0].object;
					intersected_block.domino.highlight();
				}
			} else {
				if(intersected_block !== null) {
					intersected_block.domino.restoreColor();
					intersected_block = null;
				}
			}

			if(dragging) {				
				intersections = ray.intersectObject( intersect_plane );
				selected_block.mesh.__dirtyPosition = true;
				selected_block.freez();
				intersections[0].point.y = Consts.block_height/2;
				selected_block.move(intersections[0].point);				
			}

			if(track_mouse) {
				intersections = ray.intersectObject( intersect_plane );
				var currentPoint = intersections[0].point;
				var lastPoint = tracking_points[tracking_points.length-1].position;	
				var distance = lastPoint.distanceTo(currentPoint);
				var sections = Math.floor(distance / (Consts.block_thick * 3));
				
				for(var i = 1; i <= sections; i++) {
					var c = lastPoint.clone();
					// c.add(currentPoint.sub(lastPoint).multiplyScalar(i/sections));
					c.x += (currentPoint.x - lastPoint.x) * i/sections;
					c.z += (currentPoint.z - lastPoint.z) * i/sections;
					tracking_points.push({position: c, color: Globals.selected_color.color});
					track();
				}
			}
		};
		
		handleMouseUp = function( evt ) {
			controls.enabled = true;

			switch(evt.which) {
				case Consts.left_button:
					dragging = false;
					if(selected_block !== null) {
						selected_block.mesh.__dirtyPosition = true;
						selected_block.unFreez();
					}
					controls.enabled = true;
					break;
				case Consts.right_button:
					stopTracking();
					break;
			}
		};
		
		return function() {
			renderer.domElement.addEventListener( 'mousedown', handleMouseDown );
			renderer.domElement.addEventListener( 'mousemove', handleMouseMove );
			renderer.domElement.addEventListener( 'mouseup', handleMouseUp );
		};
	})();

	function startTracking(startPosition) {
		track_mouse = true;
		tracking_points.push({position: startPosition, color: Globals.selected_color.color});
	}

	function track() {
		var initialHeading = new THREE.Vector3(1, 0, 0);
		var prevPiece = tracking_points[tracking_points.length-2];
		var currentPiece = tracking_points[tracking_points.length-1];

		// compute direction vector from prev piece to current piece
		var dirVector = currentPiece.position.clone().sub(prevPiece.position);

		// compute rotation angle.
		dirVector.y = dirVector.z;
		var angle = -1*Utils.signedAngleBetween(initialHeading, dirVector);
		prevPiece.angle = angle;

		addDominos([prevPiece]);
	}

	function stopTracking() {
		if(tracking_points.length > 1) {
			// Determin last block heading.
			var initialHeading = new THREE.Vector3(1, 0, 0);
			var prevPiece = tracking_points[tracking_points.length-2];
			var lastPiece = tracking_points[tracking_points.length-1];

			// compute direction vector from prev piece to last piece
			var dirVector = lastPiece.position.clone().sub(prevPiece.position);

			// compute rotation angle.
			dirVector.y = dirVector.z;
			var angle = -1*Utils.signedAngleBetween(initialHeading, dirVector);

			lastPiece.angle = angle;
		}

		track_mouse = false;
		addDominos(tracking_points.splice(tracking_points.length-1, 1));
		tracking_points = [];
	}

	function addDominos(pieces) {
		var interval = setInterval(function(){
			if(pieces.length > 0) {
				var piece = pieces.shift();
				var d = new Domino(piece.position, piece.angle, piece.color, collisionHandler, Physijs);
				scene.add( d.mesh );
				blocks.push( d.mesh );
			} else {
				clearInterval(interval);
			}
		}, 10)
	}	

	function onKeyDown(event) {
		switch(event.keyCode) {
		case Consts.left_key:
			if(selected_block !== null) {
				selected_block.turn(-Math.PI / 72);
			}			
			break;
		
		case Consts.right_key:
			if(selected_block !== null) {
				selected_block.turn(Math.PI / 72);
			}
			break;
		
		case Consts.d_key:
			if(selected_block !== null) {
				deleteDomino(selected_block);
				selected_block = null;
			}
			break;

		case Consts.c_key:
			self.clearBoard();
		
		case Consts.r_key:
			restore();
			break;

		case Consts.s_key:
			self.share();
			break;
		}		
	}	

	function deleteDomino(domino) {
		// remove domino from blocks array.
		for(var i = blocks.length-1; i >=0; i--) {
			if(blocks[i] === domino.mesh) {
				blocks.splice(i, 1);
				break;
			}
		}

		// remove domino from scene
		scene.remove(domino.mesh);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function initDatGui() {		
		var gui = new dat.GUI();
		gui.addColor(Globals.selected_color, 'color');

		var guiContainer = document.getElementById('guiContainer');
		guiContainer.appendChild(gui.domElement);
	}

	function collisionHandler(other_object, relative_velocity, relative_rotation, contact_normal) {
		// console.log('collision');
		
		// `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`			
		var keyA = this.id + '_' + other_object.id;
		var keyB = other_object.id + '_' + this.id;
		var domino = this;

		if (!collision_history[domino.id]) {
			// first collision, domino placed on table.
			collision_history[domino.id] = 1;
		} else {
			// Second collision.
			activeBlocks.push(domino);
		}

		// unique collision between pices.
		if(!collision_history[keyA] && !collision_history[keyB]) {
			// console.log('uniqe collision between '+ this.id + ' and ' + other_object.id);
			// console.log(keyA + ' first collision');
			collision_history[keyA] = true;
			collision_history[keyB] = true;
			audio.playCollisionSound();
			
		} else {
			// console.log(this.id + ' and ' + other_object.id + ' already collided');
		}
	}

	function restore() {
		if(Globals.edit_mode) {
			for(var i = blocks.length-1; i >= 0; i--) {
				var	block = blocks[i];
				block.domino.restoreOriginalPosition();
			}
		} else {
			var pieces = [];
			for(var i = blocks.length-1; i >=0; i--) {
				var domino = blocks[i].domino;
				pieces.push({'position': domino.position, 'angle': domino.angle, 'color': domino.color});
			}
			self.clearBoard();
			addDominos(pieces);
		}
	}	

	this.load = function(id) {
		var request = new XMLHttpRequest();  	
		request.open('GET', Consts.SERVER_URL+'/'+id, true);
		
		request.onload = function() {
			var data;

			// try to parse response.
			try{
				data = JSON.parse(request.response);
			} catch(e) {
				console.log(e);
				return;
			}

			self.clearBoard();

			for(var i = data.layout.length-1; i >=0; i--) {				
				data.layout[i].position = new THREE.Vector3(
					data.layout[i].position.x,
					data.layout[i].position.y,
					data.layout[i].position.z
				);
			}

			data.layout.reverse();
			addDominos(data.layout);
			Globals.edit_mode = false;
	  	};

	  	request.onerror = function(err) {
	  		console.log(err);
	  	}

		request.send();
	}

	this.clearBoard = function() {
		// remove domino from blocks array.
		for(var i = blocks.length-1; i >=0; i--) {
			var domino = blocks[i];
			// remove domino from scene
			scene.remove(domino);
		}
		blocks = [];
	};

	this.share = function() {
		controls.enabled = false;

		var data = {};

		var layout = [];

		for(var i = blocks.length-1; i >=0; i--) {
			var domino = blocks[i].domino;
			layout.push(domino.marshal());
		}

		// No dominos
		if (layout.length === 0) {
			console.log('Please place some dominos.');
			var shareLayer = document.getElementById('shareDiv');
			shareLayer.className = 'layer layer--share is-visible';

			var shareSucceeded = document.getElementById('shareSucceeded');
			shareSucceeded.style.display='none';

			var shareSucceeded = document.getElementById('shareFailed');
			shareSucceeded.style.display='block';

			return;
		}

		data.layout = layout;
		data.screenShot = Utils.takeScreenShot(renderer);

		// Send request to server.
		var request = new XMLHttpRequest();  	
		request.open('POST', Consts.SERVER_URL+'/save', true);
		
		request.onload = function() {
			var resp = JSON.parse(request.response);

			var shareLayer = document.getElementById('shareDiv');
			shareLayer.className = 'layer layer--share is-visible';

			var shareSucceeded = document.getElementById('shareSucceeded');
			shareSucceeded.style.display='block';

			var shareSucceeded = document.getElementById('shareFailed');
			shareSucceeded.style.display='none';

			var shareLinkURL = 'http://domino.roilipman.com/?l='+resp.layoutId;

			var shareLinkTxt = document.getElementById('shareLink');
			shareLinkTxt.value = shareLinkURL;

			var lnkTwitter = document.getElementById('lnkTwitter');
			lnkTwitter.onclick = function(){Utils.tweet('https://twitter.com/intent/tweet?url=' + shareLinkURL + '&text=Domino (No.'+resp.layoutNumber+')')};

			console.log(request.response);
	  	};

	  	request.onerror = function(err) {
	  		console.log(err);
	  	}

		request.send(JSON.stringify(data));
	}

	this.showHelp = function() {
		var help = document.getElementById('helpDiv');
		help.className = 'layer layer--help is-visible';
	};

	this.showGallery = function() {
		controls.enabled = false;
		gallery.showGallery();
	};

	this.hideGallery = function() {
		controls.enabled = true;
		gallery.hideGallery();
	};

	this.hideHelp = function() {
		var helpDiv = document.getElementById('helpDiv');
		helpDiv.className = 'layer layer--help';
	};

	this.hideShare = function() {
		controls.enabled = true;
		var shareDiv = document.getElementById('shareDiv');
		shareDiv.className = 'layer layer--share';
	}

	this.Init = function() {	
		initScene();

		document.addEventListener( 'keydown', onKeyDown, false);
		window.addEventListener( 'resize', onWindowResize, false );
		
		gallery = require('./gallery.js');

		var layoutId = Utils.getPageId();
		if(layoutId) {
			self.load(layoutId);		
		}
	};	
}

window.app = new App();
