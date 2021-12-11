const { Game } = require("./Game.js");

const boardSize = 25; // amount of cells in a row or column
const cellSize = 20; // size of a cell in pixels
const totalRounds = 100; // number of rounds to render
const roundTime = 1000; // Time to pause for after each round

const boardObj = document.getElementById('gameBoard');
const roundCtr = document.getElementById('roundCounter');
const scoreP1 = document.getElementById('p1Score');
const scoreP2 = document.getElementById('p2Score');
const playerSwitch = document.getElementById("switch");
let colorDead = "#EDEDED";
let colorP1 = "blue";
let colorP2 = "red";

let gameObj = new Game({
	boardObj,
	boardSize,
	cellSize,
	totalRounds,
	roundTime,
	roundCtr,
	"colors": [
		colorDead,
		colorP1,
		colorP2
	],
	"scores": [
		scoreP1,
		scoreP2
	]
});

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

