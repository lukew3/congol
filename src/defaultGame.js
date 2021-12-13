const { Game } = require("./Game.js");
const { defConfig } = require("./config.js");

// Get DOM objects
const domObjs = {
	"gameContainer": document.getElementById("gameContainer"),
	"boardObj": document.getElementById('gameBoard'),
	"roundCtr": document.getElementById('roundCounter'),
	"scoreObjs": [
		document.getElementById('p1Score'),
		document.getElementById('p2Score')
	],
	"piecesObjs": [
		document.getElementById('p1PiecesAvail'),
		document.getElementById('p2PiecesAvail')
	],
	"playerSwitch": document.getElementById("switch")
}

let gameObj = new Game(defConfig, domObjs);

// Toggle cell
document.addEventListener('click', (e) => {
        let element = e.target;
        let playerId;
        if (domObjs.playerSwitch == undefined)
                playerId = 1;
        else
                playerId = (domObjs.playerSwitch.checked) ? 2 : 1;
        if (element.className === "cell") {
                gameObj.toggleCell(element, playerId);
        };
});

document.getElementById('submitMoveButton').addEventListener('click', (e) => {
        domObjs.playerSwitch.checked = !domObjs.playerSwitch.checked;
        gameObj.runRound();
});

document.getElementById('resetGameButton').addEventListener('click', (e) => {
	gameObj.resetBoard();
	document.getElementById('submitMoveButton').style.display = 'block';
	document.getElementById('resetGameButton').style.display = 'none';
	document.getElementById('winnerMessage').style.display = 'none';
});

// 2pPlayground Buttons
document.getElementById('startStopButton').addEventListener('click', (e) => {
        if (gameObj.isRunning()) {
                gameObj.stopGame();
                document.getElementById('startStopButton').innerHTML = "Start";
        } else {
                gameObj.runGame();
                document.getElementById('startStopButton').innerHTML = "Stop";
        }
});

document.getElementById('nextButton').addEventListener('click', (e) => {
        gameObj.runRound();
});

document.getElementById('resetButton').addEventListener('click', (e) => {
        gameObj.resetBoard();
        document.getElementById('startStopButton').innerHTML = "Start";
});

