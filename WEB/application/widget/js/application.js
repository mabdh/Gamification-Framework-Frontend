/*
 * Copyright (c) 2015 Advanced Community Information Systems (ACIS) Group, Chair
 * of Computer Science 5 (Databases & Information Systems), RWTH Aachen
 * University, Germany All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * Neither the name of the ACIS Group nor the names of its contributors may be
 * used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

 // global variables
var client,
    resourceSpace = new openapp.oo.Resource(openapp.param.space()),
    feedbackTimeout,
    loadedModel = null;
    
var init = function() {
  var iwcCallback = function(intent) {
    console.log(intent);
  };
  client = new Las2peerWidgetLibrary("http://localhost:8081", iwcCallback);
  console.log("TEST");



  //checkAndRegisterUserAgent();

  $('#delete-model').on('click', function() {
    resetCurrentModel();
  })
  $('#store-model').on('click', function() {
    storeModel();
  })
  $('#load-model').on('click', function() {
    loadModel();
  })

  $('#setappbutton').on('click', function() {
    var appid = $('#setapp').val();
    console.log("setapp " + appid);
    setAppIDContext(appid);
    sendIntentRefreshAppId(appid);

  })


// Handler when the form in "Create New App" is submitted
      // App ID will be retrieved from the service and will be put on the id attribute in class maincontent
      $("form#createnewappform").submit(function(e){
        //disable the default form submission
        e.preventDefault();
        var formData = new FormData($(this)[0]);
        client.sendRequest(
          "POST",
          "gamification/applications/data",
          formData,
          false,
          {},
          function(data, type){
            console.log(data);
            var selectedAppId = $("#createnewapp_appid").val();
            
            window.localStorage["appid"] = selectedAppId;
            //$('#innerheader').before('<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>New App Created!</div>');

            $("#createnewapp").modal('toggle');

            // Notification new app created
            reloadActiveTab();
            return false;
          },
          function(error) {
            // Notification failed tó create new app
          }
        );
        return false;
      });
      
      $('#list_global_apps_table').on('click','tbody tr', function(event) {
        //$(this).addClass('active').siblings().removeClass('active');
        //Get Value in appidid
        var selectedAppId = $(this).find("td#appidid")[0].textContent;
        $('#alertglobalapp_text').text('Are you sure you want to open ' + selectedAppId +"?. You will be registered to selected application.");
        $('#alertglobalapp').find('button').attr('id',selectedAppId);
        $("#alertglobalapp").modal('toggle');
      });

      $('#alertglobalapp').find('button.btn').on('click', function(event) {

        window.localStorage["appid"] = $(this).attr('id');
        currentAppId = window.localStorage["appid"];
        //$('#innerheader').before('<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Welcome to '+currentAppId+' !</div>');
        $("#alertglobalapp").modal('toggle');
        // Implicitly store user to app
        // add member to app
        client.sendRequest("POST",
            "gamification/applications/data/"+currentAppId+"/"+memberId,
            "",
            "application/json",
            {},
            function(data,type){
              console.log(data);
              getApplicationsData();
        
            },
            function(error) {
                 // Notification failed to add member to app
              }
          );

      });

      $('#list_registered_apps_table').on('click','tbody tr', function(event) {
        //$(this).addClass('active').siblings().removeClass('active');
        //Get Value in appidid
        var selectedAppId = $(this).find("td#appidid")[0].textContent;
        $('#alertregisteredapp_text').text('Are you sure you want to open ' + selectedAppId +"?");
        $('#alertregisteredapp').find('button').attr('id',selectedAppId);
        $("#alertregisteredapp").modal('toggle');
      });

      $('#alertregisteredapp').find('button.btn').on('click', function(event) {

        window.localStorage["appid"] = $(this).attr('id');
        currentAppId = window.localStorage["appid"];
        getApplicationsData();
        
        // Notification welcome to the appid
        
        $("#alertregisteredapp").modal('toggle');
      });


}

// deletes the current model (empties the current model of this space)
var resetCurrentModel = function() {
  $("#name").val("");
  $("#version").val("");
  getData("my:ns:model").then(function(modelUris){
    if(modelUris.length > 0){
      _.map(modelUris,function(uri){
        openapp.resource.del(uri,function(){
          loadedModel = null;
          feedback("Model reset, please refresh browser!");
        });
      });
    } else {
      feedback("No model!");
    }
  });
};

// retrieves the JSON representation of this space
var storeModel = function() {
  if($("#name").val().length == 0 || $("#version").val().length == 0){
    feedback("Please choose frontend component name & version!");
    return;
  }
  if(isNaN($("#version").val())){
    feedback("Version has to be a number!");
    return;
  }
  getData("my:ns:model").then(function(modelUris){
      if(modelUris.length > 0){
        $.get(modelUris[0]+"/:representation").done(function(data){
          // add name, version and type to model
          data.attributes.label.value.value = $("#name").val();
          data.attributes.attributes[generateRandomId()] = generateAttribute("version", $("#version").val());
          data.attributes.attributes[generateRandomId()] = generateAttribute("type", "frontend-component");
          if(loadedModel === null){
            client.sendRequest("POST", "", JSON.stringify(data), "application/json", {},
            function(data, type) {
              // save currently loaded model
              loadedModel = $("#name").val();
              console.log("Model stored!");
              feedback("Model stored!");
            },
            function(error) {
              console.log(error);
              feedback(error);
            });
          }
          else{
            client.sendRequest("PUT", loadedModel, JSON.stringify(data), "application/json", {},
            function(data, type) {
              console.log("Model updated!");
              feedback("Model updated!");
            },
            function(error) {
              console.log(error);
              feedback(error);
            });            
          }
        });
      } else {
        feedback("No model!");
      }
  });
};

// loads the model from a given JSON file and sets it as the space's model
var loadModel = function() {
  if($("#name").val().length == 0){
    feedback("Please choose model name!");
    return;
  }
  // first, clean the current model
  getData("my:ns:model").then(function(modelUris){
    if(modelUris.length > 0){
      _.map(modelUris,function(uri){
        openapp.resource.del(uri);
      });
    }
    // now read in the file content
    modelName = $("#name").val();
    client.sendRequest("GET", modelName, "", "", {},
    function(data, type) {
      console.log("Model loaded!");
      resourceSpace.create({
        relation: openapp.ns.role + "data",
        type: "my:ns:model",
        representation: data,
        callback: function(){
          feedback("Model loaded, please refresh browser!");
        }
      });
    },
    function(error) {
      console.log(error);
      feedback(error);
    });

  });
};

function signinCallback(result) {
    if(result === "success"){
      memberId = oidc_userinfo.preferred_username;
        
        console.log(oidc_userinfo);
        init();

    } else {


        console.log(result);
        console.log(window.localStorage["access_token"]);

    }
}

$(document).ready(function() {
   //The user service top resource
      // var userRes = new openapp.oo.Resource(openapp.param.user());
      
      // console.log(JSON.stringify(userRes));
      // //Get metadata for the user top resource in default format, i.e. as a object, can be specificed explicitly with "properties" instead of null.
      // userRes.getMetadata(null, function(metadata) {
      // console.log(JSON.stringify(metadata));
      //     document.getElementById("content").innerText = metadata["http://purl.org/dc/terms/title"];
      // });
      init();
      
});

/******************* Helper Functions ********************/

// function that retrieves the model of the current space
// var getData = function(type){
//   var spaceUri = openapp.param.space(),
//       listOfDataUris = [],
//       promises = [],
//       mainDeferred = $.Deferred(),
//       deferred = $.Deferred();

//   openapp.resource.get(spaceUri,(function(deferred){
    
//     return function(space){
//       var resourceUri, resourceObj, values;
//       for(resourceUri in space.data){
//         if(space.data.hasOwnProperty(resourceUri)){
//           resourceObj = space.data[resourceUri];
//           if(resourceObj['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] &&
//               _.isArray(resourceObj['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'])){

//             values = _.map(resourceObj['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'],function(e){
//               return e.value;
//             });

//             if(_.contains(values,"http://purl.org/role/terms/Data") && _.contains(values,type)){
//               listOfDataUris.push(resourceUri);
//             }

//           }
//         }
//       }
//       deferred.resolve();
//     };

//   })(deferred));
//   promises.push(deferred.promise());

//   $.when.apply($,promises).then(function(){
//     mainDeferred.resolve(listOfDataUris);
//   });

//   return mainDeferred.promise();
// };

// needed to add attributes to the model
var generateRandomId = function(){
  var chars = "1234567890abcdef";
  var numOfChars = chars.length;
  var i, rand;
  var id = "";
  length = 24;
  for(i = 0; i < length; i++){
      rand = Math.floor(Math.random() * numOfChars);
      id += chars[rand];
  }
  return id;
};

// generates an attribute according to the SyncMeta specification
var generateAttribute = function(name, value){
  var attribute = 
  {
    "name": name,
    "id": "modelAttributes[" + name + "]",
    "value": {
      "name": name,
      "id": "modelAttributes[" + name + "]",
      "value": value
    }
  };
  return attribute;
};

// displays a message in the status box on the screen for the time of "feedbackTimeout"
var feedback = function(msg){
    $("#status").val(msg);
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(function(){
      $("#status").val("");
    },6000);
};

function getApplicationsData(){
  client.sendRequest("GET",
      "gamification/applications/list/separated",
      "",
      "application/json",
      {},
      function(data,type){

        console.log(data);
        //Global apps
        $("#globalappstbody").empty();
        for(var i = 0; i < data[0].length; i++){
          var appData = data[0][i];
          var newRow = "<tr><td id='appidid'>" + appData.id + "</td>";
          newRow += "<td id='appdescid'>" + appData.description + "</td>";
        newRow += "<td id='appcommtypeid'>" + appData.commType + "</td>";
                    
          $("#list_global_apps_table tbody").append(newRow);
        }

        //User apps
        $("#registeredappstbody").empty();
        for(var i = 0; i < data[1].length; i++){
          var appData = data[1][i];
          var newRow = "<tr><td id='appidid'>" + appData.id + "</td>";
          newRow += "<td id='appdescid'>" + appData.description + "</td>";
        newRow += "<td id='appcommtypeid'>" + appData.commType + "</td>";
        newRow += "<td><button type='button' onclick='removeApplicationHandler(this)' data-dismiss='modal' data-toggle='modal' data-target='#alertremoveapp' class='btn btn-danger bdelclass'>Remove</button></td>";
        newRow += "<td><button type='button' onclick='deleteApplicationHandler(this)' data-dismiss='modal' data-toggle='modal' data-target='#alertdeleteapp' class='btn btn-danger bdelclass'>Delete</button></td>";
     
          $("#list_registered_apps_table tbody").append(newRow);
        }

      //Settings modal
      // $("#registeredappssettingstbody").empty();
      //   for(var i = 0; i < data[1].length; i++){
      //     var appData = data[1][i];
      //     var newRow = "<tr><td id='appidid' class='appidclass'>" + appData.id + "</td>";
      //     newRow += "<td id='appdescid'>" + appData.description + "</td>";
      //   newRow += "<td id='appcommtypeid'>" + appData.commType + "</td>";
      //   newRow += "<td><button type='button' onclick='removeApplicationHandler(this)' data-dismiss='modal' data-toggle='modal' data-target='#alertremoveapp' class='btn btn-danger bdelclass'>Remove</button></td>";
      //   newRow += "<td><button type='button' onclick='deleteApplicationHandler(this)' data-dismiss='modal' data-toggle='modal' data-target='#alertdeleteapp' class='btn btn-danger bdelclass'>Delete</button></td>";

      //     $("#list_registered_apps_settings_table tbody").append(newRow);
      //   }



        // Stay in Application Selection where there is no specified application selected
        currentAppId = window.localStorage["appid"];
      },
      function(error) {
            // Notification failed to get application data
      console.log(error);
       }
    );

}

var useAuthentication = function(rurl){
    if(rurl.indexOf("\?") > 0){ 
      rurl += "&access_token=" + window.localStorage["access_token"];
    } else {
      rurl += "?access_token=" + window.localStorage["access_token"];
    }
    return rurl;
  }


function checkAndRegisterUserAgent(){
  client.sendRequest("POST",
        "gamification/applications/validation",
        "",
        "application/json",
        {},
        function(data,type){
          getApplicationsData();
      },
        function(error) {
              $('#appselection').before('<div class="alert alert-danger">Error connecting web services</div>');
          }
      );
}

    
    

function removeApplicationHandler(element){
  var selectedappid = element.parentNode.parentNode.getElementsByClassName("appidclass")[0].textContent
  $('#alertremoveapp').find('button.btn').attr('id',selectedappid);
  $('#alertremoveapp_text').text('Are you sure you want to remove ' + selectedappid +"?");
}
function deleteApplicationHandler(element){
  var selectedappid = element.parentNode.parentNode.getElementsByClassName("appidclass")[0].textContent
  $('#alertdeleteapp').find('button.btn').attr('id',selectedappid);
  $('#alertdeleteapp_text').text('Are you sure you want to delete ' + selectedappid +"?");
}

function removeApplicationAlertHandler(){
  console.log('clicked');
  currentAppId = window.localStorage["appid"];
  var selectedappid = $('#alertremoveapp').find('button.btn').attr('id');
  client.sendRequest("DELETE",
      "gamification/applications/data/"+selectedappid+"/"+memberId,
      "",
      "application/json",
      {},
      function(data,type){
        // opened app is the selected app
        if(selectedappid == currentAppId){
          window.localStorage.removeItem("appid");
          getApplicationsData();
        }
        else{
          getApplicationsData();
        }
        console.log(data);
      },
      function(error) {
           // Notification failed to remove app from member
        }
    );
  
  $("#alertremoveapp").modal('toggle'); 
}


function deleteApplicationAlertHandler(){
  console.log('clicked');
  currentAppId = window.localStorage["appid"];
  var selectedappid = $('#alertdeleteapp').find('button.btn').attr('id');
  client.sendRequest("DELETE",
      "gamification/applications/data/"+selectedappid,
      "",
      "application/json",
      {},
      function(data,type){
        // opened app is the selected app
        if(selectedappid == currentAppId){
          window.localStorage.removeItem("appid");

        // Notification delete success
        }
        getApplicationsData();
        
        console.log(data);
      },
      function(error) {
            // Notification delete failed
        }
    );
  
  $("#alertdeleteapp").modal('toggle'); 
}



function reloadActiveTab(){
  //reload active tab
  var $link = $('li a[data-toggle="tab"]');
    $link.parent().removeClass('active');
    var tabLink = $link.attr('href');
    $('#applicationtab a[href="' + tabLink + '"]').tab('show');
}


function setAppIDContext(appId){
  $('#app-id-text').html(appId);
}

function sendIntentRefreshAppId(appId){
  client.sendIntent(
    "REFRESH_APPID",
    appId
  );
}

