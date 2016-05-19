var postMessage = require("./postmessage.js");
var currentQuestion, questionList, scoreBoard;
var answer = "1234";
var quizInProgress = false;
var answered = false;


//Standard trivia bot that pulls questions from supplied files
//Questions are formated in the form of question*answer

function triviaHandler(command, request){
	var botResponse;
	
    //Handle the various commands
	switch(command){
		case "start":
			if(!quizInProgress){			    
				startQuiz();
			}
			else{
				botResponse = "Quiz already in progress, type /end quiz before starting a new one";
			}
			break;
		case "end":
		    quizInProgress = false;
		    botResponse = "Current quiz has ended. To see the score type /score";
            //Free up memory since we're no longer using these
		    currentQuestion = null;
		    questionList = null;
			break;
		case "score":
		    postScore();
		    break;
	    case "next":
	        pickNewQuestion();
	        break;
	    default: //If response isn't a commmand check to see if it's an answer
	        var response = request.text.toLowerCase();
			if(quizInProgress && response === answer.toLowerCase() && !answered){
			    botResponse = request.name + " has answered the question. /next question to continue."
			    answered = true;
			    calculateScore(request);
			    postScore();
			}
	}
	
	if(botResponse){
		postMessage.post(botResponse);
	}
}

function postScore() {
    if (scoreBoard.length > 0) {
        botResponse = "Trivia Score: ";
        for (var x in scoreBoard) {
            botResponse += "\n" + scoreBoard[x].name + ": " + scoreBoard[x].score;
        }

        postMessage.post(botResponse);
    }
    else {
        botResponse = "Either no quiz is in progress or no one has scored yet!"
        postMessage.post(botResponse);
    }
}

function calculateScore(request) {
    try {
        //Check to see if first point of the game
        if (!scoreBoard) { 
            scoreBoard = new Array();

            var player = {
                id: request.user_id,
                name: request.name,
                score: 1
            };

            scoreBoard.push(player);
        }
        else {
            //Checking for duplicate users
            for (var x in scoreBoard) {
                if (scoreBoard[x].id == request.user_id) {
                    scoreBoard[x].score++;
                    return;
                }
            }

            //Otherwise a new player
            var player = {
                id: request.user_id,
                name: request.name,
                score: 1
            };

            scoreBoard.push(player);
        }
    }
    catch (err) {
        postMessage.post(err.toString());
    }
}

function startQuiz(){

    try {
        loadQuestions();
        quizInProgress = true;
        postMessage.post("Trivia quiz has started!");
        pickNewQuestion();
    }
    catch (err) {
        quizInProgress = false;
        postMessage.post(err.toString());
    }
}

function loadQuestions(){
    var fs = require("fs");
    var path = require("path");
    var filepath = path.join(__dirname, "ffxivquestions.txt");
    questionList = fs.readFileSync(filepath).toString().split('\n');
}

function pickNewQuestion() {
    try{
        if (questionList.length > 0) {
            var questionNumber = Math.floor(Math.random() * (questionList.length));
            var line = questionList[questionNumber].split("*");
            question = line[0];
            answer = line[1];
            answered = false;

            //Fail safe for incorrect file format
            if (!question || !answer) {
                pickNewQuestion();
            }

            postMessage.post(question);
        }
        else {
            //Repopulate the list if for whatever reason it was unpopulated
            //I.E in the case of Heroku going to sleep
            if (quizInProgress) {
                loadQuestions();
                pickNewQuestion();
            }
        }
    }
    catch (err) {
        postMessage.post(err.toString());
    }
}

function postQuestion(){
	postMessage.post(currentQuestion);
}

exports.triviaHandler = triviaHandler;