const { Game } = require("./Game.js");

// Get DOM objects
const boardObj = document.getElementById('gameBoard');
const roundCtr = document.getElementById('roundCounter');
const scoreP1 = document.getElementById('p1Score');
const scoreP2 = document.getElementById('p2Score');
const piecesP1= document.getElementById('p1PiecesAvail');
const piecesP2 = document.getElementById('p2PiecesAvail');
const playerSwitch = document.getElementById("switch");

// Set game variables
let boardSize = 15; // amount of cells in a row or column
let totalRounds = 100; // number of rounds to render
let roundTime = 1000; // Time to pause for after each round
let startingPieceCount = 3; // Pieces that each player gets at the beginning of the game
let colorDead = "#EDEDED";
let colorP1 = "blue";
let colorP2 = "red";

let gameObj = new Game({
        boardObj,
        boardSize,
        totalRounds,
        roundTime,
        roundCtr,
	startingPieceCount,
        "colors": [
                colorDead,
                colorP1,
                colorP2
        ],
        "scoreObjs": [
                scoreP1,
                scoreP2
        ],
	"piecesObjs": [
		piecesP1,
		piecesP2,
	]
});

// Toggle cell
document.addEventListener('click', (e) => {
        let element = e.target;
        let playerId;
        if (playerSwitch == undefined)
                playerId = 1;
        else
                playerId = (playerSwitch.checked) ? 2 : 1;
        if (element.className === "cell") {
                gameObj.toggleCell(element, playerId);
        };
});

document.getElementById('submitMoveButton').addEventListener('click', (e) => {
        playerSwitch.checked = !playerSwitch.checked;
        gameObj.runRound();
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

