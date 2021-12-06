const { Game } = require("./Game.js");

const boardSize = 25; // amount of cells in a row or column
const cellSize = 20; // size of a cell in pixels
const totalRounds = 100; // number of rounds to render
const roundTime = 1000; // Time to pause for after each round

let gameObj = new Game(boardSize, cellSize, totalRounds, roundTime)

document.addEventListener('click', (e) => {
	let element = e.target;
	if (element.className === "cell") {
		element.style.backgroundColor = (element.style.backgroundColor === "black") ? "white" : "black"
		gameObj.toggleCell(element.id);
	};
});

document.getElementById('startButton').addEventListener('click', (e) => {
	gameObj.runGame();
});

document.getElementById('nextButton').addEventListener('click', (e) => {
	gameObj.runRound();
});

