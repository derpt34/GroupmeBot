var postMessage = require("./postmessage.js");
var options, votes;
var pollInProgress = false;


//routes the various poll commands to the right place
function pollHandler(command, request) {

    var botResponse;

    switch(command) {
        case "start":
            if (!pollInProgress) {
                startPoll(request.text);
            }
            else {
                botResponse = "Poll already in progress, type /end poll before starting a new one.";
                postMessage.post(botResponse);
            }
            break;
        case "end":
            pollInProgress = false;
            botResponse = "Current poll has ended. To see results type /results";
            postMessage.post(botResponse);
            break;
        case "vote":
            if (request.text.match(/^\/vote\s[0-9]$/)) {

                if (pollInProgress) {
                    castVote(request.text);
                }
                else {
                    botResponse = "There is currently no poll in progress,type '/start poll option 1, option 2, ...' to start a new one.";
                    postMessage.post(botResponse);
                }
            }
            else {
                botResponse = "Invalid selection. Please vote again.";
                postMessage.post(botResponse);
            }
            break;
        case "results":
            postPollResults();
            break;
        default:
            postMessage.post("Poll error occured");
    }
    
}

function startPoll(text) {
    var botResponse;
    text = text.slice(12);
    options = text.split(",");

    if (options.length > 10) {
        botResponse += "Polls cannot contain more than 10 options. Please try again.";
        postMessage.post(botResponse);
        return;
    }

    pollInProgress = true;

    votes = new Array(options.length);

    for (var x in options) {
        votes[x] = 0;
    }

    botResponse = "Please choose:";

    for (var text in options) {
        botResponse += "\n" + text + ": " + options[text];
    }

    botResponse += "\n\nType /vote # (ex: /vote 1) to cast your vote. To close the poll use /end poll";

    postMessage.post(botResponse);
}

function castVote(text) {
    var botResponse;

    text = parseInt(text.slice(6));
    if (text < options.length) {
        votes[text] += 1;
        postPollResults();
    }
    else {
        botResponse = text + " is an invalid option. Please vote again";
        postMessage.post(botResponse);
    }

}

function postPollResults() {

    var botResponse;

    botResponse = "Votes: ";

    for (var categories in votes) {
        botResponse += "\n" + "#" + categories + " " + options[categories] + ": " + votes[categories];
    }

    postMessage.post(botResponse);
}

exports.pollHandler = pollHandler;