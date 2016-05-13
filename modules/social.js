var postMessage = require('./postmessage.js');
var cool = require('cool-ascii-faces');

function socialHandler(command) {

    if (command == "cool face") {
        coolFace();
    }
}

function coolFace() {
    var botResponse = cool();

    postMessage.post(botResponse);
}

exports.socialHandler = socialHandler;