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
    appId,
    epURL = "http://localhost:8081/",
    eventdata = [],
    actiondata = [],
    feedbackTimeout,
    loadedModel = null;
    
var init = function() {
  var iwcCallback = function(intent) {
    console.log(intent);
  };
  client = new Las2peerWidgetLibrary(epURL, iwcCallback);

  $('#load-data').on('click', function() {
    if($("#appid").val()){    
      loadData();
    }
    else{
      feedback("App ID is not defined");
    }
  });
  $('#generate-data').on('click', function() {
    generateData();
  });
  // $('#clear-data').on('click', function() {
  //   resetCurrentModel();
  // })
  // $('#store-data').on('click', function() {
  //   storeModel();
  // })
}

var useAuthentication = function(rurl){
    if(rurl.indexOf("\?") > 0){ 
      rurl += "&access_token=" + window.localStorage["access_token"];
    } else {
      rurl += "?access_token=" + window.localStorage["access_token"];
    }
    return rurl;
  }

function signinCallback(result) {
    if(result === "success"){
      memberId = oidc_userinfo.preferred_username;
        
      console.log(oidc_userinfo);
      init();
    } else {
      console.log(result);
      console.log(window.localStorage["access_token"]);
    }
    if(result === "success"){
      $("#login-text").find("h4").html("Welcome " + memberId + "!");
    } else {
      $("#login-text").find("h4").html("You are not authenticated, try to login using Open ID Learning Layers.");
    }
}

function generateData(){
  // input validation
  var relRows = $("#relation").find("tbody tr");
  console.log(relRows);

  // convert rows data to JSON
  var arr = [];
  _.forEach(relRows,function(row){
    if($(row).find("td.action").html()){
      var obj = {
        eltype : $(row).find("td.eltype").html(),
        elidname : $(row).find("td.elidname").html(),
        eventCause : $(row).find("td.eventCause").html(),
        functionName : $(row).find("td.functionName").html(),
        action : $(row).find("td.action").html()
      };
      arr.push(obj);     
    }

  });
  if(arr.length > 0){
     var link = document.createElement('a');
      link.download = "gamifier.json";
      link.href = 'data:,' + encodeURI(JSON.stringify(arr, null, 4));
      link.click();
  }
  console.log(JSON.stringify(arr));
  // data preparation
  // file generation
}

function loadData(){
  appId = $("#appid").val();
  console.log("GET JSON");
  $.when(getActionData(),getModelData()).done(function(adata,jdata){
    renderTable(adata[0].rows,jdata);
  }).fail(function(error){
    feedback("Error retrieving actions and event. " + error.responseText);
  });
}

function getActionData(){
  var endPointURL = epURL + "gamification/actions/" + appId;
  var query = "?current=1&rowCount=-1&searchPhrase=";
  return $.get(useAuthentication(endPointURL+query));
}

function renderTable(actiondata,eventdata){
    console.log("JDATA " + JSON.stringify(eventdata));
    console.log("ADATA " + JSON.stringify(actiondata));
  if(actiondata.length > 0 && eventdata.length > 0){
    eventdata = simplifyJSONdata(eventdata);


    var newRow;
     $("table#relation").find("tbody").empty();
    for(var i = 0; i < eventdata.length; i++){
      newRow = "<tr>";
      newRow += "<td class='eltype'>"+eventdata[i].eltype+"</td>";
      newRow += "<td class='elidname'>"+eventdata[i].elidname+"</td>";
      newRow += "<td class='eventCause'>"+eventdata[i].eventCause+"</td>";
      newRow += "<td class='functionName'>"+eventdata[i].functionName+"</td>";
      newRow += "<td class='action'></td>";
      newRow += "<td>";
      newRow += "<div class='dropdown'>\
      <button class='btn btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>Action\
      <span class='caret'></span></button>\
      <ul class='dropdown-menu'>";
        _.forEach(actiondata, function(data){
          newRow += "<li><a href='#'>"+ data.id+"</a></li>";
        });
      newRow += "</ul></td>";
      newRow += "<td><a class='clear'>clear</a></td>";
    }
    newRow += "<tr class=\"text-center\"><td colspan=\"7\"><a id='clearall'>clear all</a></td>";
    $("table#relation").find("tbody").append(newRow);
    tableListener();
  }
  else{
    feedback("Failed to  render table");
  }
}

function tableListener(){
  $("table#relation").find("tbody").on("click",".dropdown-menu li",function(e){
    var action = $(e.target).html();
    console.log("Action selected : " + action);
    var node = $(e.target).parent().parent().parent().parent().parent().find(".action");
    $(node).html(action);
  });
  $("table#relation").find("tbody").on("click",".clear",function(e){
    console.log("clear");
    var node = $(e.target).parent().parent().find(".action");
    console.log(node);
    $(node).html("");
  });
  $("table#relation").find("tbody").on("click","#clearall",function(e){
    console.log("clear all");
    var actionNodes = $("tbody").find(".action");
    _.forEach(actionNodes,function(node){
    console.log(node);
      $(node).html("");
    });
  });
}

function simplifyJSONdata(jsondata){
  var resArray = [];
  _.forEach(jsondata, function(data){
    var resObj = {};
    for (var key in data.el.attributes) {
      if (data.el.attributes.hasOwnProperty(key)) {
        console.log("this " + JSON.stringify(data.el.attributes[key]));
        if(data.el.attributes[key].name == "type"){
          resObj.eltype = data.el.attributes[key].value.value;
        }
        if(data.el.attributes[key].name == "id"){
          resObj.elidname = data.el.attributes[key].value.value;
        }
      }
    }
    for (var key in data.event.attributes) {
      if (data.event.attributes.hasOwnProperty(key)) {
        if(data.event.attributes[key].name == "eventCause"){
          resObj.eventCause = data.event.attributes[key].value.value;
        }
        if(data.event.attributes[key].name == "id"){
          resObj.eventName = data.event.attributes[key].value.value;
        }
      }
    }
    for (var key in data.func.attributes) {
      if (data.func.attributes.hasOwnProperty(key)) {
        if(data.func.attributes[key].name == "name"){
          resObj.functionName = data.func.attributes[key].value.value;
        }
      }
    }
    resArray.push(resObj);
  });
  return resArray;
}

function processJSONdata(def,data){

  var html2event = [], event2function = [];

  console.log("E2F ");
  for (var key in data.edges) {
    if (data.edges.hasOwnProperty(key)) {
      if(data.edges[key].type == "Event to Function Call"){
        event2function.push({
          source: data.edges[key].source,
          target: data.edges[key].target
        });
         console.log(key + " -> " + JSON.stringify(data.edges[key]));
      }
     
    }
  }
  if(event2function.length > 0){

    console.log("H2E ");
    _.forEach(event2function, function(relObj) {

      for (var key in data.edges) {
        if (data.edges.hasOwnProperty(key)) {
          if(data.edges[key].type == "HTML Element to Event" && data.edges[key].target == relObj.source){
            html2event.push({
              source: data.edges[key].source,
              target: data.edges[key].target
            });
             console.log(key + " -> " + JSON.stringify(data.edges[key]));
             break;
          }
         
        }
      }
    });

    // Parse event-function pair, connect three pair
    var pairid = [];
    if(html2event.length > 0){
        _.forEach(html2event, function(h2e) {
          _.forEach(event2function, function(e2f) {
              if(h2e.target == e2f.source){
                pairid.push({
                  el: h2e.source,
                  event: h2e.target,
                  func: e2f.target
                });
                return true;
              }
          });
        });

      if(pairid.length > 0){
        // Collect node name

        // console.log("PAIRID " + JSON.stringify(pairid));
        var pairdata = [];
        _.forEach(pairid, function(id) {
          var resObj = {};
          // search element
          for (var key in data.nodes) {
            if (data.nodes.hasOwnProperty(key)) {
              // console.log("IDEL " + id.el + " " + JSON.stringify(id));
              // console.log("KEL " + key + " " + JSON.stringify(data.nodes[key]));
              if(key == id.el){
                // console.log("MATCH " + JSON.stringify(data.nodes[key]));
                resObj.el = data.nodes[key];
                break;
              }
            }
          }
          // console.log("res " + JSON.stringify(resObj));
          // search event
          for (var key in data.nodes) {
            if (data.nodes.hasOwnProperty(key)) {
              if(key == id.event){
                resObj.event = data.nodes[key];
                break;
              }
            }
          }
          // search function
          for (var key in data.nodes) {
            if (data.nodes.hasOwnProperty(key)) {
              if(key == id.func){
                resObj.func = data.nodes[key];
                break;
              }
            }
          }

          if(resObj.el && resObj.event && resObj.func){
            pairdata.push(resObj);
          }
          else{
            console.log(JSON.stringify(pairdata));
            feedback("Failed to find the nodes");
          }
        });

        if(pairdata.length > 0){
          eventdata = pairdata;
          def.resolve(eventdata);
          console.log("PAIRDATA " + JSON.stringify(pairdata));
        }
        else{
          def.reject();
        }
      }
      else{
         feedback("No Connection between HTML Element - Event - Function");
          def.reject();
      }

    }
    else{
      feedback("No HTML Element to Event Relation");
    def.reject();
    }
  }
  else{
    feedback("No Event to Function Relation");
    def.reject();
  }
  return false;
}

// deletes the current model (empties the current model of this space)
// var resetCurrentModel = function() {
//   $("#name").val("");
//   $("#version").val("");
//   getData("my:ns:model").then(function(modelUris){
//     if(modelUris.length > 0){
//       _.map(modelUris,function(uri){
//         openapp.resource.del(uri,function(){
//           loadedModel = null;
//           feedback("Model reset, please refresh browser!");
//         });
//       });
//     } else {
//       feedback("No model!");
//     }
//   });
// };



var getModelData = function() {
  var d = $.Deferred();
    openapp.resource.get(openapp.param.space(), (function(space){
      console.log("Space " + JSON.stringify(space));
      var resourceUri, resourceObj, values;
      var listOfDataUris = [];
      for(resourceUri in space.data){
        if(space.data.hasOwnProperty(resourceUri)){
          resourceObj = space.data[resourceUri];
          if(resourceObj['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] &&
              _.isArray(resourceObj['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'])){

            values = _.map(resourceObj['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'],function(e){
              return e.value;
            });

            if(_.contains(values,"http://purl.org/role/terms/Data") && _.contains(values,"my:ns:model")){
              listOfDataUris.push(resourceUri);
            }

          }
        }
      }
      console.log("List " + listOfDataUris);
      if(listOfDataUris.length > 0){
        
      
          $.get(listOfDataUris[0]+"/:representation").done(function(data){
                   // add name, version and type to model
           //console.log("MODEL :" + JSON.stringify(data));
           // COLLECT HTML ELEMENT - EVENTS AND EVENTS - FUNCTIONS RELATIONS
             processJSONdata(d,data);
            
         });
       }else {
         feedback("No model!");
         d.reject();
       }

    })); 
    return d.promise();
};

// retrieves the JSON representation of this space
// var storeModel = function() {
//   if($("#name").val().length == 0 || $("#version").val().length == 0){
//     feedback("Please choose frontend component name & version!");
//     return;
//   }
//   if(isNaN($("#version").val())){
//     feedback("Version has to be a number!");
//     return;
//   }
//   getData("my:ns:model").then(function(modelUris){
//       if(modelUris.length > 0){
//         $.get(modelUris[0]+"/:representation").done(function(data){
//           // add name, version and type to model
//           data.attributes.label.value.value = $("#name").val();
//           data.attributes.attributes[generateRandomId()] = generateAttribute("version", $("#version").val());
//           data.attributes.attributes[generateRandomId()] = generateAttribute("type", "frontend-component");
//           if(loadedModel === null){
//             client.sendRequest("POST", "", JSON.stringify(data), "application/json", {},
//             function(data, type) {
//               // save currently loaded model
//               loadedModel = $("#name").val();
//               console.log("Model stored!");
//               feedback("Model stored!");
//             },
//             function(error) {
//               console.log(error);
//               feedback(error);
//             });
//           }
//           else{
//             client.sendRequest("PUT", loadedModel, JSON.stringify(data), "application/json", {},
//             function(data, type) {
//               console.log("Model updated!");
//               feedback("Model updated!");
//             },
//             function(error) {
//               console.log(error);
//               feedback(error);
//             });            
//           }
//         });
//       } else {
//         feedback("No model!");
//       }
//   });
// };

// loads the model from a given JSON file and sets it as the space's model
// var loadModel = function() {
//   if($("#name").val().length == 0){
//     feedback("Please choose model name!");
//     return;
//   }
//   // first, clean the current model
//   getData("my:ns:model").then(function(modelUris){
//     if(modelUris.length > 0){
//       _.map(modelUris,function(uri){
//         openapp.resource.del(uri);
//       });
//     }
//     // now read in the file content
//     modelName = $("#name").val();
//     client.sendRequest("GET", modelName, "", "", {},
//     function(data, type) {
//       console.log("Model loaded!");
//       resourceSpace.create({
//         relation: openapp.ns.role + "data",
//         type: "my:ns:model",
//         representation: data,
//         callback: function(){
//           feedback("Model loaded, please refresh browser!");
//         }
//       });
//     },
//     function(error) {
//       console.log(error);
//       feedback(error);
//     });

//   });
// };

$(document).ready(function() {
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

// // needed to add attributes to the model
// var generateRandomId = function(){
//   var chars = "1234567890abcdef";
//   var numOfChars = chars.length;
//   var i, rand;
//   var id = "";
//   length = 24;
//   for(i = 0; i < length; i++){
//       rand = Math.floor(Math.random() * numOfChars);
//       id += chars[rand];
//   }
//   return id;
// };

// // generates an attribute according to the SyncMeta specification
// var generateAttribute = function(name, value){
//   var attribute = 
//   {
//     "name": name,
//     "id": "modelAttributes[" + name + "]",
//     "value": {
//       "name": name,
//       "id": "modelAttributes[" + name + "]",
//       "value": value
//     }
//   };
//   return attribute;
// };

// displays a message in the status box on the screen for the time of "feedbackTimeout"
feedback = function(msg){
    $("#status").val(msg);
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(function(){
      $("#status").val("");
    },6000);
};
