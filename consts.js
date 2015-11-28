var THREE = require('three');

// domino dimensions
function consts() {
	// this.SERVER_URL = "https://domino-1129.appspot.com";
	this.SERVER_URL = "http://app.domino.roilipman.com";
	this.block_thick = 0.5;
	this.block_height = 4;
	this.block_width = 2;
	this.domino_base_color = 0x4d4d4d;
	this.table_width = 50;
	this.table_height = 50;
	this.table_length = 1
	this.left_button = 1;
	this.right_button = 3;
	this.right_key = 39;
	this.left_key = 37;
	this.c_key = 67;
	this.d_key = 68;
	this.r_key = 82;
	this.s_key = 83;
	this.zero = new THREE.Vector3(0, 0, 0);
	this.one = new THREE.Vector3(1, 1, 1);	
}

module.exports = new consts();