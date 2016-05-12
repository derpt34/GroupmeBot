var HTTPS = require('https');
var cool = require('cool-ascii-faces');

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

function postMessage(botResponse) {
  var options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = respond;