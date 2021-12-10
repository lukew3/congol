(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const acceptedArgs = ["boardSize", "cellSize", "totalRounds", "roundTime", "roundCtr", "colors", "scores"];
// Add required args? Ex: Scores, roundCtr (these aren't necessary for all modes, if somebody wanted to play without score or rounds, these would not be neccessary
// board would be, if you chose to make that an arg

class Game {
        constructor(args) {
		// Defaults that may be overwritten
		this.boardSize = 25;
		this.cellSize = 20;
		this.totalRounds = 100;
		this.roundTime = 1000;
		this.colors = ["#EDEDED", "black"];
		// Parse args
		Object.keys(args).forEach((key) => {
			if (acceptedArgs.includes(key)){
				this[key] = args[key];
			};
		});
		// Variables that are always set to the same thing
                this.board = document.getElementById("gameBoard");
		this.round = 0;
                this.running = false;
		this.roundTimeouts = [];
                this.data = this.createEmptyData();
                this.initBoard();
        }
        createEmptyData() {
                let myarr = [];
                for(let y=0; y<this.boardSize; y++) {
                        let row = [];
                        for(let x=0; x<this.boardSize; x++)
                                row.push(0);
                        myarr.push(row);
                }
                return myarr;
        }
        initBoard() {
                this.board.innerHTML = "";
                for (let i=0; i < Math.pow(this.boardSize, 2); i++) {
                        let newCell = document.createElement('div');
                        newCell.classList.add('cell');
                        newCell.id = `cell-${i}`;
                        this.board.append(newCell);
                }
        }
        renderBoard() {
		let cell, cellObj;
                this.data.forEach((row, y) => {
                        row.forEach((cell, x) => {
				cellObj = document.getElementById(`cell-${y*this.boardSize+x}`)
				cellObj.style.backgroundColor = this.colors[cell];
                        });
                });
        }
	resetBoard() {
		this.stopGame();
		this.data = this.createEmptyData();
		this.renderBoard();
		this.round = 0;
                this.roundCtr.innerHTML = 0;
	}
	stopGame() {
		// for each to in roundTimeouts, clear timeout
		this.roundTimeouts.forEach((id) => {
			clearTimeout(id);
		});
		this.running = false;
	}
        runGame() {
                for(let r=0; r<this.totalRounds; r++) {
                        this.roundTimeouts.push(
				setTimeout(() => {
                                	this.runRound();
	                        }, r*this.roundTime)
			);
                }
		this.running = true;
        }
        runRound() {
		let startTime = performance.now();
		let nvalues, n, dominant;
		this.round++;
                let newData = this.createEmptyData();
                this.data.forEach((row, y) => {
                        row.forEach((cell, x) => {
				nvalues = this.countNeighbors(y,x);
				n = nvalues[0];
				dominant = nvalues[1];
                                if (cell != 0 && (n < 2 || n > 3)) {
                                        newData[y][x] = 0;
                                } else if (cell == 0 && n === 3) {
                                        newData[y][x] = dominant;
                                } else {
                                        newData[y][x] = cell;
                                }
                        });
                });
                this.data = newData;
                this.renderBoard();
		this.setScores();
                this.roundCtr.innerHTML = this.round;
		//console.log(`Round ran in ${performance.now()-startTime} milliseconds`);
        }
        countNeighbors(y,x) {
		let count = [0,0];
		let cell;
                let ymin = (y === 0) ? y : y-1;
                let xmin = (x === 0) ? x : x-1;
                let ymax = (y === this.boardSize-1) ? y : y+1;
                let xmax = (x === this.boardSize-1) ? x : x+1;
                for(let yc = ymin; yc < ymax+1; yc++) {
                        for(let xc = xmin; xc < xmax+1; xc++) {
				cell = this.data[yc][xc];
				if (cell != 0)
					count[cell-1] += 1;
                        }
                }
		cell = this.data[y][x];
		if (cell != 0)
			count[cell-1] -= 1;
		let dominant = count[0]>count[1] ? 1 : 2;
		return [count[0]+count[1], dominant];
        }
	setScores() {
		let scores = [0,0];
		this.data.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell != 0)
					scores[cell-1] += 1;
			});
		});
		this.scores[0].innerHTML = scores[0];
		this.scores[1].innerHTML = scores[1];
	}
        toggleCell(cellId, playerId) {
                // Lol I don't know regex
                let num = -Number(cellId.match(/\-[0-9a-z]+$/i)[0]);
                let cy = Math.floor(num/this.boardSize);
                //console.log(`${cy} ${num%this.boardSize}`);
		if (this.data[cy][num%this.boardSize] == 0) {
			this.data[cy][num%this.boardSize] = playerId;
			this.scores[playerId-1].innerHTML = Number(this.scores[playerId-1].innerHTML) + 1;
		} else if (this.data[cy][num%this.boardSize] == playerId) {
			this.data[cy][num%this.boardSize] = 0;
			this.scores[playerId-1].innerHTML = Number(this.scores[playerId-1].innerHTML) - 1;
		}
        }
	isRunning() {
		return this.running;
	}
};

module.exports = {
	Game
};

},{}],2:[function(require,module,exports){
const { Game } = require("./Game.js");

const boardSize = 25; // amount of cells in a row or column
const cellSize = 20; // size of a cell in pixels
const totalRounds = 100; // number of rounds to render
const roundTime = 1000; // Time to pause for after each round

let roundCtr = document.getElementById('roundCounter');
let scoreP1 = document.getElementById('p1Score');
let scoreP2 = document.getElementById('p2Score');
let colorDead = "#EDEDED";
let colorP1 = "blue";
let colorP2 = "red";

let gameObj = new Game({
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
	let playerId = (document.getElementById("switch").checked) ? 2 : 1;
	if (element.className === "cell") {
		if (playerId == 1)
			element.style.backgroundColor = (element.style.backgroundColor === colorP1) ? "#EDEDED" : colorP1;
		else
			element.style.backgroundColor = (element.style.backgroundColor === colorP2) ? "#EDEDED" : colorP2;
		gameObj.toggleCell(element.id, playerId);
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


},{"./Game.js":1}]},{},[2]);
