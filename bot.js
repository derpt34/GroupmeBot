var HTTPS = require('https');
var social = require('./modules/social.js');
var poll = require('./modules/poll.js');
var commands = require('./modules/commands.js');
var trivia = require('./modules/trivia.js');
var botID = process.env.BOT_ID;
var quizInProgress = false;
var pollInProgress = false;

//Handles command processing

function respond() {
    var request = JSON.parse(this.req.chunks[0]);
    var coolFace = "/cool face";
    var startPoll = /^\/start poll/;
    var vote = /^\/vote/;
    var endPoll = "/end poll";
    var results = "/results";
    var command = "/commands";
    var startQuiz = "/start quiz";
    var endQuiz = "/end quiz";
    var score = "/score";
    var nextQuestion = "/next question";

    if (request.text) {

        if (quizInProgress) {
            switch (request.text) {
                case endQuiz:
                    quizInProgress = false;
                    trivia.triviaHandler("end", request);
                    break;
                case nextQuestion:
                    trivia.triviaHandler("next", request);
                    break;
                default:
                    trivia.triviaHandler("", request);
            }
        }
        else {
            if (request.text === startQuiz && !pollInProgress) {
                quizInProgress = true;
                trivia.triviaHandler("start", request);
            }
        }

        if (pollInProgress) {
            switch (request.text) {
                case score:
                    trivia.triviaHandler("score", request);
                    break;
                case endPoll:
                    poll.pollHandler("end", request);
                    pollInProgress = false;
                    break;
                case results:
                    poll.pollHandler("results", request);
                    break;
                default:
                    if (vote.test(request.text)) {
                        poll.pollHandler("vote", request);
                    }
            }
        }
        else {
            if (startPoll.test(request.text) && !quizInProgress) {
                poll.pollHandler("start", request);
                pollInProgress = true;
            }
        }

        if (request.text === coolFace) {
            social.socialHandler("cool face");
        }

        if (request.text === command) {
            commands.list();
        }

    }

    this.res.end();
}


exports.respond = respond;