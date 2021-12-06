const boardSize = 25; // amount of cells in a row or column
const cellSize = 20; // size of a cell in pixels
const totalRounds = 100; // number of rounds to render
const roundTime = 1000; // Time to pause for after each round

const board = document.getElementById("gameBoard");
let data = [];

const createEmptyData = () => {
	let myarr = [];
	for(let y=0; y<boardSize; y++) {
		let row = [];
		for(let x=0; x<boardSize; x++)
			row.push(false);
		myarr.push(row);
	}
	return myarr;
};

const initBoard = () => {
	board.innerHTML = "";
	for (let i=0; i < Math.pow(boardSize, 2); i++) {
		let newCell = document.createElement('div');
		newCell.classList.add('cell');
		newCell.id = `cell-${i}`;
		board.append(newCell);
	}
};

const renderBoard = () => {
	data.forEach((row, y) => {
		row.forEach((cell, x) => {
			document.getElementById(`cell-${y*boardSize+x}`).style.backgroundColor = cell ? "black" : "white";
		});
	});
};

const runGame = () => {
	for(let r=0; r<totalRounds; r++) {
                setTimeout(() => {
                        runRound();
                }, r*roundTime);
        }
};

const runRound = () => {
	let newData = createEmptyData();
	data.forEach((row, y) => {
		row.forEach((cell, x) => {
			let n = countNeighbors(y,x);
			if (cell && (n < 2 || n > 3)) {
				newData[y][x] = false;
			} else if (!cell && n === 3) {
				newData[y][x] = true;
			} else {
				newData[y][x] = cell;
			}
		});
	});
	data = newData;
	renderBoard();
	console.log("Round ran");
};

const countNeighbors = (y, x) => {
	let count = 0;
	let ymin = (y === 0) ? y : y-1;
	let xmin = (x === 0) ? x : x-1;
	let ymax = (y === boardSize-1) ? y : y+1;
	let xmax = (x === boardSize-1) ? x : x+1;
	for(let yc = ymin; yc < ymax+1; yc++) {
		for(let xc = xmin; xc < xmax+1; xc++) {
			count += data[yc][xc] ? 1 : 0;
		}
	}
	count -= data[y][x] ? 1 : 0;
	return count;
};

document.addEventListener('click', (e) => {
	let element = e.target;
	if (element.className === "cell") {
		element.style.backgroundColor = (element.style.backgroundColor === "black") ? "white" : "black"
		// Lol I don't know regex
		let num = -Number(element.id.match(/\-[0-9a-z]+$/i)[0]);
		let cy = Math.floor(num/boardSize);
		console.log(`${cy} ${num%boardSize}`);
		data[cy][num%boardSize] = data[cy][num%boardSize] ? false : true;
	};
});

document.getElementById('startButton').addEventListener('click', (e) => {
	runGame();
});

document.getElementById('nextButton').addEventListener('click', (e) => {
	runRound();
});

data = createEmptyData();
initBoard();

