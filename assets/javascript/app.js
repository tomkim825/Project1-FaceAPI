  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBKX1GXX2C_DBhXESSB3xtln6W8czM-TJY",
    authDomain: "project1-marvelfaceapi.firebaseapp.com",
    databaseURL: "https://project1-marvelfaceapi.firebaseio.com",
    projectId: "project1-marvelfaceapi",
    storageBucket: "project1-marvelfaceapi.appspot.com",
    messagingSenderId: "259704712712"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  var storage = firebase.storage();

// INITIALIZE GLOBAL VARIABLES
var personName ='';
var personId ='';
var personImageUrl='';
var characterDatabase=[];
var userImageUrl;
var userFaceId;
var userResult;
var result1;
var result1Percent;
var result2;
var result2Percent;
var result3;
var result3Percent;
var result4;
var result4Percent;
var result5;
var result5Percent;

// **********************************
// Above reserved for initializing **
// **********************************
// ******************   On page open: recall characters to create
// firebase Database:   database of info called characterDatabase
// ******************   (array of objects) to refer API data with

database.ref().orderByChild("personName").on("child_added", function(snapshot) {
    // store values from firebase snapshot
    personName = snapshot.val().personName;
    personId = snapshot.val().personId;
    personImageUrl = snapshot.val().personImageUrl;
    // create object with obtained values
    var newObject = {
        'personName': personName,
        'personId':personId,
        'personImageUrl': personImageUrl,
    };
    // push the object to array for later reference
    characterDatabase.push(newObject);

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// **************************************************************
// once API calls are done, postResult() called to update DOM ***
// **************************************************************

function postResults(userImageUrl) {
    $('form').addClass('hidden');
    $('#sectionTitle').text('Result');
    
    // ****** start of reusable code block for results 2 to 5 below  ******  
    function resultDiv2to5(resultDivNum,resultNumPercent){
        var resultImg = $('<img>').attr('src',characterDatabase[i].personImageUrl).attr('class','alt-result-image').appendTo(resultDivNum);
        $('<h4>').text(characterDatabase[i].personName).appendTo(resultDivNum);
        $('<h4>').text(Math.floor(resultNumPercent*100)+'%').appendTo(resultDivNum);
    };
    // ******  end of reusable code block for results 2 to 5 below  ****** 

    for ( var i = 0 ; i< characterDatabase.length ; i++){
        if ( characterDatabase[i].personId === result1 ){
            var userImg = $('<img>').attr('src',userImageUrl).attr('class', 'user-image').appendTo('#resultDiv');
            var resultImg = $('<img>').attr('src',characterDatabase[i].personImageUrl).attr('class', 'result-image').appendTo('#resultDiv');
            $('#result1').css('display','none');
            $('<h3>').text(characterDatabase[i].personName).appendTo('#resultDiv');
            $('<h3>').text(Math.floor(result1Percent*100)+'%').appendTo('#resultDiv');
        };
        if ( characterDatabase[i].personId === result2 ){resultDiv2to5('#result2Div',result2Percent)};
        if ( characterDatabase[i].personId === result3 ){resultDiv2to5('#result3Div',result3Percent)};
        if ( characterDatabase[i].personId === result4 ){resultDiv2to5('#result4Div',result4Percent)};
        if ( characterDatabase[i].personId === result5 ){resultDiv2to5('#result5Div',result5Percent)};
        $('#reset').removeClass('hidden');
    }
};

// ***************************************************************************************
// ** callAPIs(): API calls wrapped in a function to be called after either image input **
// ***************************************************************************************
function callAPIs(userImageUrl) {
    // *******************************************************
    // identifyUSer(): 2nd API called after promise of 1st API
    // Once user image detected, this API finds superhero match
    // (coded above 1st API call to prevent error)
    // *******************************************************
    function identifyUser() {
    
        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/face/v1.0/identify",
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","10f397a3144b4015b61663d5d274889c");
            },
            type: "POST",
            // Request body
            data: JSON.stringify({
                "personGroupId": "marvel",
                "faceIds": [userFaceId],
                "maxNumOfCandidatesReturned": 5,
                "confidenceThreshold": 0.01
            }),
        })
        .done(function(data) {
            // for loop creates result 1-5 personIds and % confidence then function to post to HTML 
            for(var i=0 ; i<5 ; i++){
            eval("result" + (i+1) + " = data[0].candidates["+i+"].personId");
            eval("result" + (i+1) + "Percent = data[0].candidates["+i+"].confidence");
            };
            postResults(userImageUrl);
        })
        .fail(function(error) {
            console.log(error);
        });
    }
    // **************************************************
    //       end of identifyUser() - 2nd API call 
    // **************************************************

    // **************************************************
    // 1st API call to send image URL for face detection
    // Then userFaceId returned. identifyUser() function 
    // with 2nd API (above) called after promise  
    // **************************************************

    $.ajax({
        url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true",
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","10f397a3144b4015b61663d5d274889c");
        },
        type: "POST",
        // Request body
        data: JSON.stringify({
            "url": userImageUrl
            }),
    })
    .done(function(data) {
        userFaceId = data[0].faceId;
        // after 1st API returns userFaceId, call 2nd API to identify that userFaceId
        identifyUser();
    })
    .fail(function(error) {
        console.log(error);
    });
    // **************************************************
    //                end of 1st API call 
    // **************************************************
};
// **************************************************************************
// **                     End of function: callAPIs()                      **
// **************************************************************************

// **************************************************************
//        Input option #1: user types in url and hits submit
// **************************************************************
$(document).on("click", '#submit', function(event) {
    event.preventDefault();
    // grabs url from user input
    userImageUrl = $("#userImageUrl").val().trim();
    //call API if URL has a value
    if (userImageUrl !== ""){
        callAPIs(userImageUrl);
        $("#userImageUrl").val('');     
    }; 
});

// ***************************************************************
//          Input option #2: user selects file from device
//    file sent to FireBase storage & URL returned -> callAPIs()  
// ***************************************************************
$(document).on("click", '#upload', function(event) {
    event.preventDefault();
    // call API if file selected
    if( $('#userImageFile').val() !== ''){
        $('#uploadStatus').css('color','red').text('UPLOADING...');
        const file = $('#userImageFile').get(0).files[0];
        const task = storage.ref().child('file.jpg').put(file);
        task.then(function(snapshot) {
        callAPIs(snapshot.downloadURL);
        $('#userImageFile').val(''); 
        });
    }
});

// ***************************************************************
//                      RESET button:
//            restore page back to original state
// ***************************************************************
$(document).on("click", '#reset', function(event) {
    event.preventDefault();
    $('#reset').addClass('hidden');
    $('#resultDiv').empty();
    $('#result2Div').empty();
    $('#result3Div').empty();
    $('#result4Div').empty();
    $('#result5Div').empty();
    $('form').removeClass('hidden');
    $('#sectionTitle').text('Upload');
    $('#uploadStatus').css('color','white').text('(upload could take a moment)');
    $('#result1').css('display','inline');
    $('<img>').addClass('silhouette img-fluid').attr('id','result1').attr('src','assets/images/user-silhouette.png').css('width','225px').appendTo('#resultDiv');
});
