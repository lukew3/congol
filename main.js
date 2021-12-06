const boardSize = 25; // amount of cells in a row or column
const cellSize = 20; // size of a cell in pixels
const totalRounds = 100; // number of rounds to render
const roundTime = 1000; // Time to pause for after each round

let gameObj;

class Game {
	constructor(boardSize, cellSize, totalRounds, roundTime) {
		this.board = document.getElementById("gameBoard");
		this.boardSize = boardSize;
		this.cellSize = cellSize;
		this.totalRounds = totalRounds;
		this.roundTime = roundTime;
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
				document.getElementById(`cell-${y*this.boardSize+x}`).style.backgroundColor = cell ? "black" : "white";
			});
		});
	}
	runGame() {
		for(let r=0; r<this.totalRounds; r++) {
			setTimeout(() => {
				this.runRound();
			}, r*this.roundTime);
		}
	}
	runRound() {
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
};


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


gameObj = new Game(boardSize, cellSize, totalRounds, roundTime)

