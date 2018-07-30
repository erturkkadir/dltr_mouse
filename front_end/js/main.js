  if (location.protocol != 'https:') {
	location.href = 'https://www.syshuman.com/ml/nomouse.html';
  }
  
  function forward_to() {
	location.href = 'https://www.syshuman.com/ml/recorder.html';
  }
 
 
  async function load_model() {
	  return await tf.loadModel("js_model/model.json");
  } 
  
   var treshold = 0.002;
   var maxDataLength = 60;
   var audioContext;
   var img = document.getElementById("img");
   var log = document.getElementById("log");
   var txt_rms = document.getElementById("txt_rms");
   
   //const model = load_model();
 
   window.onload = function() {
	   init();
	   load_model();
   }
   
   async function load_model() {
	    model = await tf.loadModel("js_model/model.json");
		return model;
   }
		
	  
  function init() {
	if(!navigator.mediaDevices) return false;
	var constrains = {audio:true, video: false };
	
	navigator.mediaDevices.getUserMedia(constrains).then(function(stream) {
		audioContext = new AudioContext();
		if (audioContext.sampleRate!=48000) {
			alert("works at only 48 kHz " + audioContext.sampleRate);
			return;
		}		
		input = audioContext.createMediaStreamSource(stream);
		rec = new Recorder(input, {numChannels:1});			// Recording 2 channels  will double the file size
		
		rec.record();
		tmp = setInterval(function() {
			// txt_rms.innerHTML = "Date : " + new Date();
			rec.stop();
			rec.getBuffer(data_ready);		//create the wav blob and pass it on to createDownloadLink				
			rec.clear();
			rec.record();	
			// txt_rms.innerHTML = "Date : " + new Date();
		}, 1000);
	  });
    }
	
	function data_ready(buffers) {	
		results = []	
		frst = buffers[0].slice(0, 2048);		
		rms = Meyda.extract('rms', frst);	
		txt_rms.innerHTML = "Signal rms : " + rms;
		if (rms>0.00002) {		
			log.innerHTML = "PROCESSING>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>";
			step = (buffers[0].length / 512) - 8; 	/* 47104 / 512 - 8  = 84 */
			if(step<60) return;						/* in order to match librosa settings 2048, 512 */
			if(step>60) step = 60;
			data = [];
			for (let i = 0; i < step; i++) {
				ix1 = i * 512;
				ix2 = ix1 + 2048;
				data = buffers[0].slice(ix1, ix2);				
				mfcc = Meyda.extract('mfcc', data);			
				results.push(mfcc)				
			}			
			predict(results);
		}			
	}
		
	async function predict(results) {
	    /* Now the result have size of 13x60 now we need to convert it to [1][13][60][1] tensor */
		shape = [1, 13, 60, 1];
		tmp = tf.transpose(tf.tensor2d(results, [60,13]));
		data = tmp.as4D(1, 13, 60, 1);
		
		// const model = await tf.loadModel("js_model/model.json");
			
		const prediction = model.predict(data);
		
		amax = prediction.as1D().argMax();
		log.innerHTML = "Predicted Hot Vector ['asagi', 'sag', 'sol', 'tikla', 'yukari'] : " + prediction;
		classId = (await amax.data())[0];
		
		switch(classId) {
			case 0 : src = 'images/adown.png'; break;
			case 1 : src = 'images/aright.png'; break;
			case 2 : src = 'images/aleft.png'; break;
			case 3 : src = 'images/aclick.png'; break;
			case 4 : src = 'images/aup.png'; break;
			default : src = "";
		}
		img.src = src;	
		console.log(classId);
		console.log(prediction);

	}
	