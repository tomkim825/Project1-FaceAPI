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

// INITIALIZE GLOBAL VARIABLES
var personName ='';
var personId ='';
var personImageUrl='';
var persistedFaceId='';
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

// firebase: recall characters to create database of info to refer API data with
database.ref().orderByChild("personName").on("child_added", function(snapshot) {
    personName = snapshot.val().personName;
    personId = snapshot.val().personId;
    personImageUrl = snapshot.val().personImageUrl;
    persistedFaceId= snapshot.val().persistedFaceId;
    personImageUrl2 = snapshot.val().personImageUrl2;
    persistedFaceId2= snapshot.val().persistedFaceId2;
    personImageUrl3 = snapshot.val().personImageUrl3;
    persistedFaceId3= snapshot.val().persistedFaceId3;
    var newObject = {
        'personName': personName,
        'personId':personId,
        'personImageUrl': personImageUrl,
        'persistedFaceId' : persistedFaceId,
    };
    characterDatabase.push(newObject);
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// once API calls are done, postResult() called to update DOM
function postResults() {
    $('#resultDiv').empty();
    $('#result2Div').empty();
    $('#result3Div').empty();
    $('#result4Div').empty();
    $('#result5Div').empty();
    $('#startSceen').css('display','none');
    $('#userImageUrl').val('');
    for ( var i = 0 ; i< characterDatabase.length ; i++){
        if ( characterDatabase[i].personId === result1 ){
            var userImg = $('<img>').attr('src',userImageUrl).css('width','225px').appendTo('#resultDiv');
            var resultImg = $('<img>').attr('src',characterDatabase[i].personImageUrl).css('width','225px').appendTo('#resultDiv');
            $('#result1').css('display','none');
            $('<h2>').text(characterDatabase[i].personName).appendTo('#resultDiv');
            $('<h2>').text(Math.floor(result1Percent*100)+'%').appendTo('#resultDiv');
        };
        if ( characterDatabase[i].personId === result2 ){
            var resultImg = $('<img>').attr('src',characterDatabase[i].personImageUrl).css('width','75px').appendTo('#result2Div');
            $('<h4>').text(characterDatabase[i].personName).appendTo('#result2Div');
            $('<h4>').text(Math.floor(result2Percent*100)+'%').appendTo('#result2Div');
        };
        if ( characterDatabase[i].personId === result3 ){
            var resultImg = $('<img>').attr('src',characterDatabase[i].personImageUrl).css('width','75px').appendTo('#result3Div');
            $('<h4>').text(characterDatabase[i].personName).appendTo('#result3Div');
            $('<h4>').text(Math.floor(result3Percent*100)+'%').appendTo('#result3Div');
        };
        if ( characterDatabase[i].personId === result4 ){
            var resultImg = $('<img>').attr('src',characterDatabase[i].personImageUrl).css('width','75px').appendTo('#result4Div');
            $('<h4>').text(characterDatabase[i].personName).appendTo('#result4Div');
            $('<h4>').text(Math.floor(result4Percent*100)+'%').appendTo('#result4Div');
        };
        if ( characterDatabase[i].personId === result5 ){
            var resultImg = $('<img>').attr('src',characterDatabase[i].personImageUrl).css('width','75px').appendTo('#result5Div');
            $('<h4>').text(characterDatabase[i].personName).appendTo('#result5Div');
            $('<h4>').text(Math.floor(result5Percent*100)+'%').appendTo('#result5Div');
        };
    }
};




// click event:
$(document).on("click", '#submit', function(event) {
    event.preventDefault();
    userImageUrl = $("#userImageUrl").val().trim();
    //checks if input has a value
    if (userImageUrl === "") {alert('Please type in a url')};

    // azure API (nested api in api call)
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
            console.log(data);
            result1 = data[0].candidates[0].personId;
            result1Percent = data[0].candidates[0].confidence;
            result2 = data[0].candidates[1].personId;
            result2Percent = data[0].candidates[1].confidence;
            result3 = data[0].candidates[2].personId;
            result3Percent = data[0].candidates[2].confidence;
            result4 = data[0].candidates[3].personId;
            result4Percent = data[0].candidates[3].confidence;
            result5 = data[0].candidates[4].personId;
            result5Percent = data[0].candidates[4].confidence;
            postResults();
        })
        .fail(function() {
            alert("error");
        });
    }

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
        console.log(data[0]);
        console.log(data[0].faceId);
        userFaceId = data[0].faceId;
        identifyUser();
    })
    .fail(function() {
        alert("error");
    });
});

