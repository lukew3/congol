const acceptedArgs = ["boardObj", "boardSize", "totalRounds", "roundTime", "roundCtr", "colors", "scoreObjs", "startingPieceCount", "piecesObjs"];
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
		this.piecesAvail[0]++;
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
                // Lol I don't know regex
                let num = -Number(cellObj.id.match(/\-[0-9a-z]+$/i)[0]);
                let cy = Math.floor(num/this.boardSize);
                //console.log(`${cy} ${num%this.boardSize}`);
		if (this.data[cy][num%this.boardSize] == 0 && this.piecesAvail[playerId-1] != 0) {
			// fill empty square
			this.data[cy][num%this.boardSize] = playerId;
			cellObj.style.backgroundColor = this.colors[playerId];
			this.piecesAvail[playerId-1]--;
		} else if (this.data[cy][num%this.boardSize] == playerId) {
			// empty filled square
			this.data[cy][num%this.boardSize] = 0;
			cellObj.style.backgroundColor = this.colors[0];
			this.piecesAvail[playerId-1]++;
		}
		this.setPieces();
        }
	isRunning() {
		return this.running;
	}
};

module.exports = {
	Game
};
