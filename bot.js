var HTTPS = require('https');
var social = require('./modules/social.js');
var poll = require('./modules/poll.js');
var commands = require('./modules/commands.js');

var botID = process.env.BOT_ID;

//Handles all the routing for the various modules.

function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  var coolFace = /^\/cool face$/;
  var startPoll = /^\/start poll/;
  var vote = /^\/vote/;
  var endPoll = /^\/end poll$/;
  var results = /^\/results$/;
  var command = /^\/commands$/;

  if(request.text && coolFace.test(request.text)) {
      social.socialHandler("cool face");
  }

  if(request.text && startPoll.test(request.text)){
      poll.pollHandler("start", request);
  }

  if(request.text && endPoll.test(request.text)){
      poll.pollHandler("end", request); 
  }
  
  if(request.text && results.test(request.text)){
      poll.pollHandler("results", request);
  }
  
  if(request.text && vote.test(request.text)){
      poll.pollHandler("vote", request);
  }

  if (request.text && command.test(request.text)) {
      commands.list();
  }

  this.res.end();
}


exports.respond = respond;