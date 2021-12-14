(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const defaultConfig = {
	"boardSize": 15,
	"totalRounds": 100,
	"roundTime": 1000,
	"startingPieceCount": 3,
	"maxPieceCount": 12,
	"scoreLimit": 100,
	"colors": [
		"#EDEDED",
		"blue",
		"red"
	]
}

module.exports = {
	defaultConfig
}

},{}],2:[function(require,module,exports){
require("./game.js");
require("./newGame.js");


const defaultPage = document.getElementById('defaultGamePage');
const rulesPage = document.getElementById('rulesPage');
const newGamePage = document.getElementById('newGamePage');

const setPage = (pageId) => {
	[defaultPage, rulesPage, newGamePage].forEach((pageDiv) => {
		pageDiv.style = 'display: none;';
	});
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

},{"./game.js":3,"./newGame.js":4}],3:[function(require,module,exports){
const {defaultConfig} = require("./config.js");

//rules and gameVars are separated so that rules can be modifiable in its entirety while gameVars cannot
let rules = defaultConfig;
let gameVars = {
  "scores": [0, 0],
  "piecesAvail": [rules.startingPieceCount, rules.startingPieceCount],
  "round": 0,
  "running": false,
  "roundTimeouts": [],
  "data": [],
  "roundToggledCells": [],
};
let domObjs = {
  "gameContainer": document.getElementById("gameContainer"),
  "boardObj": document.getElementById('gameBoard'),
  "roundCtr": document.getElementById('roundCounter'),
  "scoreObjs": [
      document.getElementById('p1Score'),
      document.getElementById('p2Score')
  ],
  "piecesObjs": [
      document.getElementById('p1PiecesAvail'),
      document.getElementById('p2PiecesAvail')
  ],
  "playerSwitch": document.getElementById("switch")
}

const createEmptyData = () => {
  let myarr = [];
  for (let y = 0; y < rules.boardSize; y++) {
    let row = [];
    for (let x = 0; x < rules.boardSize; x++)
      row.push(0);
      myarr.push(row);
  }
  return myarr;
}
const initBoard = () => {
  let width = Math.min(screen.availWidth, 500);
  rules.boardWH = (width - 10) - ((width - 10) % rules.boardSize); // 10 pixels of space between board and edge of screen
  rules.cellWH = rules.boardWH / rules.boardSize - 2; // 2 pixels for the border
  domObjs.boardObj.innerHTML = "";
  domObjs.boardObj.style = `width: ${rules.boardWH}px; height: ${rules.boardWH}px`;
  domObjs.gameContainer.style = `width: ${rules.boardWH}px; height: ${rules.boardWH}px`;
  for (let i = 0; i < Math.pow(rules.boardSize, 2); i++) {
    let newCell = document.createElement('div');
    newCell.classList.add('cell');
    newCell.id = `cell-${i}`;
    newCell.style = `width: ${rules.cellWH}px; height: ${rules.cellWH}px`
    domObjs.boardObj.append(newCell);
  }
  setPieces();
}
const renderBoard = () => {
  let cell, cellObj;
  gameVars.data.forEach((row, y) => {
    row.forEach((cell, x) => {
      cellObj = document.getElementById(`cell-${y*rules.boardSize+x}`);
      cellObj.style.backgroundColor = rules.colors[cell];
    });
  });
}
const resetBoard = () => {
  stopGame();
  gameVars.data = createEmptyData();
  renderBoard();
  gameVars.round = 0;
  setRound();
  gameVars.scores = [0, 0];
  setScores();
  gameVars.piecesAvail = [rules.startingPieceCount, rules.startingPieceCount];
  setPieces();
}
const stopGame = () => {
  // for each to in roundTimeouts, clear timeout
  gameVars.roundTimeouts.forEach((id) => {
    clearTimeout(id);
  });
  gameVars.running = false;
}
const runGame = () => {
  for (let r = 0; r < rules.totalRounds; r++) {
    gameVars.roundTimeouts.push(
      setTimeout(() => {
        runRound();
      }, r * rules.roundTime)
    );
  }
  gameVars.running = true;
}
const runRound = () => {
  let startTime = performance.now();
  let nvalues, n, dominant;
  gameVars.round++;
  let newData = createEmptyData();
  gameVars.data.forEach((row, y) => {
    row.forEach((cell, x) => {
      nvalues = countNeighbors(y, x);
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
  gameVars.data = newData;
  renderBoard();
  updateScores();
  setScores();
  updatePieces();
  setPieces();
  setRound();
  //console.log(`Round ran in ${performance.now()-startTime} milliseconds`);
  if (gameVars.scores[0] > rules.scoreLimit || gameVars.scores[1] > rules.scoreLimit)
    endGame();
  gameVars.roundToggledCells = [];
}
const countNeighbors = (y, x) => {
  let count = [0, 0];
  let cell;
  let ymin = (y === 0) ? y : y - 1;
  let xmin = (x === 0) ? x : x - 1;
  let ymax = (y === rules.boardSize - 1) ? y : y + 1;
  let xmax = (x === rules.boardSize - 1) ? x : x + 1;
  for (let yc = ymin; yc < ymax + 1; yc++) {
    for (let xc = xmin; xc < xmax + 1; xc++) {
      cell = gameVars.data[yc][xc];
      if (cell != 0)
        count[cell - 1] += 1;
    }
  }
  cell = gameVars.data[y][x];
  if (cell != 0)
    count[cell - 1] -= 1;
  let dominant = count[0] > count[1] ? 1 : 2;
  return [count[0] + count[1], dominant];
}
const updateScores = () => {
  let cellCounts = [0, 0];
  gameVars.data.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell != 0)
        cellCounts[cell - 1] += 1;
    });
  });
  let winner = (cellCounts[0] > cellCounts[1]) ? 0 : 1;
  gameVars.scores[winner] += Math.abs(cellCounts[0] - cellCounts[1]);
  setScores();
}
const setScores = () => {
  domObjs.scoreObjs[0].innerHTML = gameVars.scores[0];
  domObjs.scoreObjs[1].innerHTML = gameVars.scores[1];
}
const updatePieces = () => {
  if (gameVars.piecesAvail[0] < rules.maxPieceCount)
    gameVars.piecesAvail[0]++;
  if (gameVars.piecesAvail[1] < rules.maxPieceCount)
    gameVars.piecesAvail[1]++;
}
const setRound = () => {
  domObjs.roundCtr.innerHTML = gameVars.round;
}
const setPieces = () => {
  //ideally, I think this should delete and append cells depending on the amount of children
  for (let p = 0; p < 2; p++) {
    domObjs.piecesObjs[p].innerHTML = "";
    for (let i = 0; i < gameVars.piecesAvail[p]; i++) {
      let newCell = document.createElement('div');
      newCell.classList.add('cell');
      newCell.style = `width: ${rules.cellWH/2}px; height: ${rules.cellWH/2}px; background-color: ${rules.colors[p+1]}`
      domObjs.piecesObjs[p].append(newCell);
    }
  }
}
const toggleCell = (cellObj, playerId) => {
  //this.roundToggledCells = [];
  // Lol I don't know regex
  let num = -Number(cellObj.id.match(/\-[0-9a-z]+$/i)[0]);
  let cy = Math.floor(num / rules.boardSize);
  //console.log(`${cy} ${num%this.boardSize}`);
  if (gameVars.data[cy][num % rules.boardSize] == 0 && gameVars.piecesAvail[playerId - 1] != 0) {
    // fill empty square
    gameVars.data[cy][num % rules.boardSize] = playerId;
    cellObj.style.backgroundColor = rules.colors[playerId];
    gameVars.piecesAvail[playerId - 1]--;
    gameVars.roundToggledCells.push(num);
  } else if (gameVars.data[cy][num % rules.boardSize] == playerId && gameVars.roundToggledCells.includes(num)) {
    // empty filled square
    gameVars.data[cy][num % rules.boardSize] = 0;
    cellObj.style.backgroundColor = rules.colors[0];
    gameVars.piecesAvail[playerId - 1]++;
    // remove num from roundToggledCells, not sure if this is the best way to do this
    gameVars.roundToggledCells = gameVars.roundToggledCells.filter((val) => {
      return val != num;
    });
  }
  setPieces();
}
const endGame = () => {
  // Should not use document.getElementById
  document.getElementById('winnerMessage').style.display = 'block';
  // Set this to the actual winner of the game
  document.getElementById('winnerMessage').innerHTML = `Player 1 wins!`;
  document.getElementById('submitMoveButton').style.display = 'none';
  document.getElementById('resetGameButton').style.display = 'block';
}
const isRunning = () => {
  return gameVars.running;
}
const updateRules = (addedRulesObj) => {
	Object.keys(addedRulesObj).forEach((key) => {
		rules[key] = addedRulesObj[key];
	});
	initBoard();
	resetBoard();
}

// Event listeners
document.addEventListener('click', (e) => {
  let element = e.target;
  let playerId;
  if (domObjs.playerSwitch == undefined)
    playerId = 1;
  else
    playerId = (domObjs.playerSwitch.checked) ? 2 : 1;
  if (element.className === "cell") {
    toggleCell(element, playerId);
  };
});

document.getElementById('submitMoveButton').addEventListener('click', (e) => {
  domObjs.playerSwitch.checked = !domObjs.playerSwitch.checked;
  runRound();
});

document.getElementById('resetGameButton').addEventListener('click', (e) => {
	resetBoard();
	document.getElementById('submitMoveButton').style.display = 'block';
	document.getElementById('resetGameButton').style.display = 'none';
	document.getElementById('winnerMessage').style.display = 'none';
});

// 2pPlayground Buttons
document.getElementById('startStopButton').addEventListener('click', (e) => {
  if (isRunning()) {
    stopGame();
    document.getElementById('startStopButton').innerHTML = "Start";
  } else {
    runGame();
    document.getElementById('startStopButton').innerHTML = "Stop";
  }
});

document.getElementById('nextButton').addEventListener('click', (e) => {
  runRound();
});

document.getElementById('resetButton').addEventListener('click', (e) => {
  resetBoard();
  document.getElementById('startStopButton').innerHTML = "Start";
});

// Stuff that runs on load
gameVars.data = createEmptyData();
initBoard();

module.exports = {
	updateRules
}

},{"./config.js":1}],4:[function(require,module,exports){
const { updateRules } = require('./game.js');

const gtOnline = document.getElementById("gt_online");
const gtLocal = document.getElementById("gt_local");
const gtSolo = document.getElementById("gt_solo");
const bs10 = document.getElementById("bs_15");
const bs25 = document.getElementById("bs_25");
const bs50 = document.getElementById("bs_40");

let gtSelected = "gt_online";
let bsSelected = "bs_15";

const updateNewGameSelections = () => {
	[gtOnline, gtLocal, gtSolo, bs10, bs25, bs50].forEach((newGameButton) => {
		newGameButton.style.border = "none";
	});
	document.getElementById(gtSelected).style.border = "1px solid black";
	document.getElementById(bsSelected).style.border = "1px solid black";
}

document.getElementById('newGameStartButton').addEventListener('click', () => {
	// maybe use router to set the page
	document.getElementById('newGamePage').style = 'display: none;';
	document.getElementById('defaultGamePage').style = 'display: block;';
	// Find a better way to do this, this only works because the game is required before newGame.js
	// Maybe you should just make the gameObj right away and then allow it to be accessed by all
	// Actually this doesn't work at all
	//gameObj.boardSize = Number(bsSelected.splice(3, 5));
	updateRules({"boardSize": Number(bsSelected.slice(3, 5))});
});

document.addEventListener('click', (e) => {
	let element = e.target;
	if (element.id.slice(0, 3) == 'gt_') {
		gtSelected = element.id;
	} else if (element.id.slice(0, 3) == 'bs_') {
		bsSelected = element.id;
	}
	updateNewGameSelections();
});


},{"./game.js":3}]},{},[2])