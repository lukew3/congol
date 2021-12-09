(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Game {
        constructor(boardSize, cellSize, totalRounds, roundTime, roundCtr) {
                this.board = document.getElementById("gameBoard");
                this.boardSize = boardSize;
                this.cellSize = cellSize;
                this.totalRounds = totalRounds;
                this.roundTime = roundTime;
                this.roundCtr = roundCtr;
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
                                row.push(false);
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
                this.data.forEach((row, y) => {
                        row.forEach((cell, x) => {
                                document.getElementById(`cell-${y*this.boardSize+x}`).style.backgroundColor = cell ? "black" : "#EDEDED"; // ED would usually be "white". Cell bg color might be user-customizable later
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
		this.round++;
                let newData = this.createEmptyData();
                this.data.forEach((row, y) => {
                        row.forEach((cell, x) => {
                                let n = this.countNeighbors(y,x);
                                if (cell && (n < 2 || n > 3)) {
                                        newData[y][x] = false;
                                } else if (!cell && n === 3) {
                                        newData[y][x] = true;
                                } else {
                                        newData[y][x] = cell;
                                }
                        });
                });
                this.data = newData;
                this.renderBoard();
                this.roundCtr.innerHTML = this.round;
                //console.log("Round ran");
        }
        countNeighbors(y,x) {
                let count = 0;
                let ymin = (y === 0) ? y : y-1;
                let xmin = (x === 0) ? x : x-1;
                let ymax = (y === this.boardSize-1) ? y : y+1;
                let xmax = (x === this.boardSize-1) ? x : x+1;
                for(let yc = ymin; yc < ymax+1; yc++) {
                        for(let xc = xmin; xc < xmax+1; xc++) {
                                count += this.data[yc][xc] ? 1 : 0;
                        }
                }
                count -= this.data[y][x] ? 1 : 0;
                return count;
        }
        toggleCell(cellId) {
                // Lol I don't know regex
                let num = -Number(cellId.match(/\-[0-9a-z]+$/i)[0]);
                let cy = Math.floor(num/this.boardSize);
                //console.log(`${cy} ${num%this.boardSize}`);
                this.data[cy][num%this.boardSize] = this.data[cy][num%this.boardSize] ? false : true;
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

let gameObj = new Game(boardSize, cellSize, totalRounds, roundTime, roundCtr)

document.addEventListener('click', (e) => {
	let element = e.target;
	if (element.className === "cell") {
		element.style.backgroundColor = (element.style.backgroundColor === "black") ? "#EDEDED" : "black"
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


},{"./Game.js":1}]},{},[2]);
