var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var postMessage = require('./postMessage.js')(botResponse);

var botID = process.env.BOT_ID;
var options, votes;
var pollInProgress = false;

function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  var coolFace = /^\/cool guy$/;
  var poll = /^\/start poll/;
  var vote = /^\/vote/;
  var endPoll = /^\/end poll$/;
  var results = /^\/results$/;

  if(request.text && coolFace.test(request.text)) {
    randomFace();
  }

  if(request.text && poll.test(request.text)){
        if(!pollInProgress){
            startPoll(request.text);
        }
        else{
            botResponse = "Poll already in progress, type /end poll before starting a new one.";
            postMessage(botResponse);
        }
  }

  if(request.text && endPoll.test(request.text)){
      pollInProgress = false;
      botResponse = "Current poll has ended. To see results type /results";
      postMessage(botResponse);
      
  }
  
  if(request.text && results.test(request.text)){
      postPollResults();   
  }
  
  if(request.text && vote.test(request.text)){
        if(request.text.match(/^\/vote\s[0-9]$/)){
        
            if(pollInProgress){
                castVote(request.text);
            }
            else{
                botResponse = "There is currently no poll in progress,type '/start poll option 1, option 2, ...' to start a new one.";
                postMessage(botResponse);
            }
        }
        else{
            botResponse = "Invalid selection. Please vote again.";
                postMessage(botResponse);
        }
  }

  this.res.end();
}

function startPoll(text) {
    var botResponse;
    text = text.slice(12);
    options = text.split(",");
    
    if(options.length > 10)
    {
       botResponse += "Polls cannot contain more than 10 options. Please try again.";
       postMessage(botResponse);
       return;
    }
    
    pollInProgress = true;
    
    votes = new Array(options.length);

    for(var x in options){
        votes[x] = 0;
    }

  botResponse = "Please choose:";
  
  for(var text in options){ 
      botResponse += "\n" + text +": " + options[text];
  }
  
  botResponse += "\n\nType /vote # (ex: /vote 1) to cast your vote. To close the poll use /end poll";

  postMessage(botResponse);
}

function randomFace(){
    var botResponse = cool();
    
    postMessage(botResponse);
}

function castVote(text){
    
    text = parseInt(text.slice(6));
    if(text < options.length){
        votes[text] += 1;
        postPollResults();
    }
    else{
        botResponse = text + " is an invalid option. Please vote again";
        postMessage(botResponse);
    }
    
}

function postPollResults(){
    
    var botResponse;
    
    botResponse = "Votes: ";
    
    for(var categories in votes){ 
      botResponse += "\n" +"#" + categories + " " + options[categories] +": " + votes[categories];
  }
    
    postMessage(botResponse);
}

exports.respond = respond;