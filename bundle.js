(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const acceptedArgs = ["boardObj", "boardSize", "totalRounds", "roundTime", "roundCtr", "colors", "scoreObjs", "startingPieceCount", "maxPieceCount", "piecesObjs", "scoreLimit"];
// Add required args? Ex: Scores, roundCtr (these aren't necessary for all modes, if somebody wanted to play without score or rounds, these would not be neccessary

class Game {
        constructor(args) {
		// Defaults that may be overwritten
		this.boardSize = 25;
		this.totalRounds = 100;
		this.roundTime = 1000;
		this.colors = ["#EDEDED", "black"];
                this.boardObj = document.getElementById("gameBoard");
		this.startingPieceCount = 4;
		this.maxPieceCount = 12;
		this.scoreLimit = 10;
		// Parse args
		Object.keys(args).forEach((key) => {
			if (acceptedArgs.includes(key)){
				this[key] = args[key];
			} else {
				console.log(`ERROR: Unknown key ${key}`);
			}
		});
		// Variables that are always set to the same thing
		this.scores = [0,0];
		this.piecesAvail = [this.startingPieceCount, this.startingPieceCount];
		this.round = 0;
                this.running = false;
		this.roundTimeouts = [];
                this.data = this.createEmptyData();
                this.initBoard();
		this.roundToggledCells = [];
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
		let width = Math.min(screen.availWidth, 500);
		this.boardWH = (width-10) - ((width-10) % this.boardSize); // 10 pixels of space between board and edge of screen
		this.cellWH = this.boardWH / this.boardSize - 2; // 2 pixels for the border
                this.boardObj.innerHTML = "";
		this.boardObj.style = `width: ${this.boardWH}px; height: ${this.boardWH}px`;
		document.getElementById("gameContainer").style = `width: ${this.boardWH}px; height: ${this.boardWH}px`;
                for (let i=0; i < Math.pow(this.boardSize, 2); i++) {
                        let newCell = document.createElement('div');
                        newCell.classList.add('cell');
                        newCell.id = `cell-${i}`;
			newCell.style = `width: ${this.cellWH}px; height: ${this.cellWH}px`
                        this.boardObj.append(newCell);
                }
		this.setPieces();
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
		this.scores = [0, 0];
		this.setScores();
		this.piecesAvail = [this.startingPieceCount, this.startingPieceCount];
		this.setPieces();
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
		this.updateScores();
		this.setScores();
		this.updatePieces();
		this.setPieces();
                this.roundCtr.innerHTML = this.round;
		//console.log(`Round ran in ${performance.now()-startTime} milliseconds`);
		if (this.scores[0] > this.scoreLimit || this.scores[1] > this.scoreLimit)
			this.endGame();
		this.roundToggledCells = [];
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
	updateScores() {
		// Outdated method
		let cellCounts = [0, 0];
		this.data.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell != 0)
					cellCounts[cell-1] += 1;
			});
		});
		let winner = (cellCounts[0] > cellCounts[1]) ? 0 : 1;
		this.scores[winner] += Math.abs(cellCounts[0] - cellCounts[1]);
		this.setScores();
	}
	setScores() {
		this.scoreObjs[0].innerHTML = this.scores[0];
		this.scoreObjs[1].innerHTML = this.scores[1];
	}
	updatePieces() {
		if (this.piecesAvail[0] < this.maxPieceCount)
			this.piecesAvail[0]++;
		if (this.piecesAvail[1] < this.maxPieceCount)
			this.piecesAvail[1]++;
	}
	setPieces() {
		//ideally, I think this should delete and append cells depending on the amount of children
		for(let p = 0; p < 2; p++) {
			this.piecesObjs[p].innerHTML = "";
			for(let i = 0; i < this.piecesAvail[p]; i++) {
				let newCell = document.createElement('div');
				newCell.classList.add('cell');
				newCell.style = `width: ${this.cellWH/2}px; height: ${this.cellWH/2}px; background-color: ${this.colors[p+1]}`
				this.piecesObjs[p].append(newCell);
			}
		}
	}
        toggleCell(cellObj, playerId) {
		//this.roundToggledCells = [];
                // Lol I don't know regex
                let num = -Number(cellObj.id.match(/\-[0-9a-z]+$/i)[0]);
                let cy = Math.floor(num/this.boardSize);
                //console.log(`${cy} ${num%this.boardSize}`);
		if (this.data[cy][num%this.boardSize] == 0 && this.piecesAvail[playerId-1] != 0) {
			// fill empty square
			this.data[cy][num%this.boardSize] = playerId;
			cellObj.style.backgroundColor = this.colors[playerId];
			this.piecesAvail[playerId-1]--;
			this.roundToggledCells.push(num);
		} else if (this.data[cy][num%this.boardSize] == playerId && this.roundToggledCells.includes(num)) {
			// empty filled square
			this.data[cy][num%this.boardSize] = 0;
			cellObj.style.backgroundColor = this.colors[0];
			this.piecesAvail[playerId-1]++;
			// remove num from roundToggledCells, not sure if this is the best way to do this
			this.roundToggledCells = this.roundToggledCells.filter((val) => {return val != num});
		}
		this.setPieces();
        }
	endGame() {
		// Should not use document.getElementById
		document.getElementById('winnerMessage').style.display = 'block';
		document.getElementById('winnerMessage').innerHTML = `Player 1 wins!`;
		document.getElementById('submitMoveButton').style.display = 'none';
		document.getElementById('resetGameButton').style.display = 'block';
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
let maxPieceCount = 12; // Most amount of pieces that a user can hold at one time
let colorDead = "#EDEDED";
let colorP1 = "blue";
let colorP2 = "red";
let scoreLimit = 100;

let gameObj = new Game({
        boardObj,
        boardSize,
        totalRounds,
        roundTime,
        roundCtr,
	startingPieceCount,
	maxPieceCount,
	scoreLimit,
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


},{"./Game.js":1}],3:[function(require,module,exports){
require("./defaultGame.js");

const defaultPage = document.getElementById('defaultGamePage');
const rulesPage = document.getElementById('rulesPage');
const newGamePage = document.getElementById('newGamePage');

const setPage = (pageId) => {
        defaultPage.style = 'display: none;';
        rulesPage.style = 'display: none;';
        newGamePage.style = 'display: none;';
        document.getElementById(pageId).style = 'display: block;';
}

if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        defaultPage.style = 'display: block;';
}

document.getElementById('navTitle').addEventListener('click', (e) => {
        setPage('defaultGamePage');
});

document.getElementById('navRules').addEventListener('click', (e) => {
        setPage('rulesPage');
});

document.getElementById('navPlay').addEventListener('click', (e) => {
        setPage('newGamePage');
});


},{"./defaultGame.js":2}]},{},[3]);
