function Audio() {

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var audioBuffer;

  var loadSounds = function() {
    var request = new XMLHttpRequest();
  	
    request.open('GET', '/sounds/domino_collision.mp3', true);
  	request.responseType = 'arraybuffer';

  	request.onload = function() {
      var audioData = request.response;
    	audioCtx.decodeAudioData(audioData, function(buffer) {
    		audioBuffer = buffer;
      	},
      function(e){"Error with decoding audio data" + e.err});
  	};

    request.send();
  }

  var  makeSource = function() {
    var source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    return source;
  };

  this.playCollisionSound = function() {
    var source = makeSource();
    source.start();
  };

  loadSounds();
}

module.exports = new Audio();