const { Game } = require("./Game.js");

const boardSize = 25; // amount of cells in a row or column
const cellSize = 20; // size of a cell in pixels
const totalRounds = 100; // number of rounds to render
const roundTime = 1000; // Time to pause for after each round

let roundCtr = document.getElementById('roundCounter');
let colorDead = "#EDEDED";
let colorP1 = "blue";
let colorP2 = "red";

let gameObj = new Game({
	boardSize,
	cellSize,
	totalRounds,
	roundTime,
	roundCtr,
	colorDead,
	colorP1,
	colorP2
});

document.addEventListener('click', (e) => {
	let element = e.target;
	if (element.className === "cell") {
		if (!document.getElementById("switch").checked)
			element.style.backgroundColor = (element.style.backgroundColor === colorP1) ? "#EDEDED" : colorP1;
		else
			element.style.backgroundColor = (element.style.backgroundColor === colorP2) ? "#EDEDED" : colorP2;
		gameObj.toggleCell(element.id);
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

