function Audio() {

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var audioBuffer;

  var loadSounds = function() {
    // Domino set down table_BLASTWAVEFX_15951.mp3
    // Dominoes hit table table dull.mp3
    // Dominoes hit table table clumsy slide.mp3
    // Dominoes hit table table high.mp3

  	var request = new XMLHttpRequest();
  	
    request.open('GET', '/sounds/Dominoes hit table table clumsy slide2.mp3', true);
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