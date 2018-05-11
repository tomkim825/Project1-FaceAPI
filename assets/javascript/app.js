alert("Connected!");

// Checking if user has getUser Media Functionality
//******************************************************************************/

function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  
  if (hasGetUserMedia()) {
    // Good to go!
    alert('getUserMedia() is supported by your browser');
  } else {
    alert('getUserMedia() is not supported by your browser');
  }


// Capture Functionality
//******************************************************************************/
var constraints = {
    // What hardware we are wanting to access. Just doing plain vanilla default video: true; audio not necessary.
    video: true,
  };
  

  //Stores get base64 webcam capture in a global variable.
  var userImage;


  //Button to capture screenshot.
  var button = document.querySelector('#screenshot-button');
  // The screenshot gets inserted and displayed into this image tag.
  var img = document.querySelector('#screenshot-img');
  // This is the webcam video feed.
  var video = document.querySelector('#screenshot-video');
  //Canvas is what ... It's hard to explain.
  var canvas = document.createElement('canvas');


  //This is where the magic happens on click.
  button.onclick = video.onclick = function() {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      //Basically converting feed into still.
      canvas.getContext('2d').drawImage(video, 0, 0);
      //Image src becomes the Base64 data and displayed as a image.
      img.src = canvas.toDataURL('image/jpeg');
      console.log(img.src);
      userImage = img.src //To get it on the global scope.
  }
  
  function handleSuccess(stream) {
    video.srcObject = stream;
  }
  
  function handleError(error) {
    console.error('Reeeejected!', error);
  }
  
  navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

    //base64 to blob function to be able to send data through API.

    var makeblob = function (dataURL) { //Pass the stored dataURL from onclick above and store in variable at top.
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = decodeURIComponent(parts[1]);
            return new Blob([raw], { type: contentType });
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }


// Microsoft Azure - Face API starts here.
//******************************************************************************/



    function processImage() {
        // Replace <Subscription Key> with your valid subscription key.
        var subscriptionKey = "<Subscription Key>";

        // NOTE: You must use the same region in your REST call as you used to
        // obtain your subscription keys. For example, if you obtained your
        // subscription keys from westus, replace "westcentralus" in the URL
        // below with "westus".
        //
        // Free trial subscription keys are generated in the westcentralus region.
        // If you use a free trial subscription key, you shouldn't need to change 
        // this region.
        var uriBase =
            "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect";

        // Request parameters
        var params = {
            "returnFaceId": "true",
            "returnFaceLandmarks": "false",
            "returnFaceAttributes":
                "age,gender,headPose,smile,facialHair,glasses,emotion," +
                "hair,makeup,occlusion,accessories,blur,exposure,noise"
        };

        // Perform the REST API call.
        $.ajax({
            url: uriBase + "?" + $.param(params),

            // Request headers.
            beforeSend: function(xhrObj){
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
            },

            type: "POST",

            //Some extras stuff because we're not sending form data.
            processData: false,
            contentType: 'application/octet-stream',

            // Request body.
            data: makeblob(userImage),
        })

        .done(function(data) {
            // Show formatted JSON on webpage.
            $("#responseTextArea").val(JSON.stringify(data, null, 2));
        })

        .fail(function(jqXHR, textStatus, errorThrown) {
            // Display error message.
            var errorString = (errorThrown === "") ?
                "Error. " : errorThrown + " (" + jqXHR.status + "): ";
            errorString += (jqXHR.responseText === "") ?
                "" : (jQuery.parseJSON(jqXHR.responseText).message) ?
                    jQuery.parseJSON(jqXHR.responseText).message :
                        jQuery.parseJSON(jqXHR.responseText).error.message;
            alert(errorString);
        });
    };