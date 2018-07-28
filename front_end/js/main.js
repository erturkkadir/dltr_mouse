  if (location.protocol != 'https:') {
	location.href = 'https://www.syshuman.com/ml/nomouse.html';
  }
  
  function forward_to() {
	location.href = 'https://www.syshuman.com/ml/recorder.html';
  }

 
  
  
  
  function tensor_flow() {
	  
		// Notice there is no 'import' statement. 'tf' is available on the index-page
      // because of the script tag above.

      // Define a model for linear regression.
      const model = tf.sequential();
      model.add(tf.layers.dense({units: 1, inputShape: [1]}));

      // Prepare the model for training: Specify the loss and the optimizer.
      model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

      // Generate some synthetic data for training.
      const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
      const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

      // Train the model using the data.
      model.fit(xs, ys, {epochs: 10}).then(() => {
        // Use the model to do inference on a data point the model hasn't seen before:
        // Open the browser devtools to see the output
        model.predict(tf.tensor2d([5], [1, 1])).print();
      });
  }	  
	 
 
  function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    recorder = new Recorder(input, {numChannels:1});	
	
  }

  
  function find_action(my_rec) {
	document.getElementById("log").innerHTML = "Size : " + my_rec[0].length;	
	c = 2;	
  }
  
  
  var meyda;
  var gumStream;    // Stream for getUserMedia()
  var recorder;     // Recorder Object
  var input;
  
  window.onload = function init() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	  
	var context = new AudioContext();
	
	window.source = context.createBufferSource();
	source.connect(context.destination);
	
	/*
	if !(navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia) {
		alert("No microfone");
		return;
	}
	*/
	  
	/* mic is available */  
	navigator.mediaDevices.getUserMedia({audio:true, video: false }).then(function(mediaStream) {
		
		window.source = context.createMediaStreamSource(mediaStream);
		
		meydaA = Meyda.createMeydaAnalyzer({
			"audioContext":context, // required
			"source":source, // required
			"bufferSize": 2048, // required
			"hopSize": 512, // optional
			"windowingFunction": "hamming", // optional
			"featureExtractors": ["mfcc"], // optional - A string, or an array of strings containing the names of features you wish to extract.
			"callback": cb_mfcc // optional callback in which to receive the features for each buffer
			
		})
		
		
		rec = new Recorder(window.source, {numChannels:1});			// Recording 2 channels  will double the file size
		
		document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+context.sampleRate+"   Hz";
		meydaA.start("mfcc");
	});
  };
  i=0;
  function cb_mfcc(features) {
	  
	  console.log(features);
	  i = i + 1;
	  if(i>20) meydaA.stop();
  }