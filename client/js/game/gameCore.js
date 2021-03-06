const Data = require("./data.js");
const Render = require("./rendering.js");
const Router = require("../router.js");
const Theme = require('../theme.js');
const { local2pConfig, soloConfig } = require("./config.js");

//rules and gameVars are separated so that rules can be modifiable in its entirety while gameVars cannot
const createEmptyData = () => {
  let myarr = [];
  for (let y = 0; y < Data.getRules().boardSize; y++) {
    let row = [];
    for (let x = 0; x < Data.getRules().boardSize; x++)
      row.push(0);
      myarr.push(row);
  }
  return myarr;
};
const clearBoard = () => {
  Data.setGameVars({
    'data': createEmptyData(),
    'round': 0,
    'scores': [0,0],
    'piecesAvail': [Data.getRules().startingPieceCount, Data.getRules().startingPieceCount]
  });
  Render.renderAll();
  Render.domObjs.playerSwitch.checked = false;
}
const resetGame = () => {
  stopAutoGame();
  let inProgress = (Data.getGameVars().mode === 'gt_online') ? false : true;
  Data.setGameVars({'data': createEmptyData(),
                    'round': 0,
                    'selectedRound': 0,
										'scores': [0, 0],
										'piecesAvail': [Data.getRules().startingPieceCount, Data.getRules().startingPieceCount],
										'timers': [Data.getRules().startingTime, Data.getRules().startingTime],
										'inProgress': inProgress,
                    'moves': []
									 });
	Render.renderAll();
  Render.renderTimers();
  stopTimers();
  if (Data.getGameVars().mode !== 'gt_online')
    updateTimer();
  Render.domObjs.playerSwitch.checked = false;
};
const stopAutoGame = () => {
  // for each to in roundTimeouts, clear timeout
  Data.getGameVars().roundTimeouts.forEach((id) => {
    clearTimeout(id);
  });
  Data.setGameVars({"running": false});
};
const runAutoGame = () => {
  for (let r = 0; r < Data.getRules().totalRounds; r++) {
    Data.getGameVars().roundTimeouts.push(
      setTimeout(() => {
        runRound();
      }, r * Data.getRules().roundTime)
    );
  }
  Data.setGameVars({"running": true});
};
const runRound = () => {
  let startTime = performance.now();
  let nvalues, n, dominant;
  Data.setGameVars({"round": Data.getGameVars().round + 1});
  let newData = createEmptyData();
  Data.getGameVars().data.forEach((row, y) => {
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
  Data.setGameVars({"data": newData});
  updateScores();
  updatePieces();
	Render.renderAll();
  //console.log(`Round ran in ${performance.now()-startTime} milliseconds`);
  checkScoreLimit();
  Data.setGameVars({"roundToggledCells": []});
	if (Data.getRules().speciesCount === 2) {
		Render.domObjs.playerSwitch.checked = !Render.domObjs.playerSwitch.checked;
	}
};
const checkScoreLimit = () => {
  if (Data.getRules().scoreLimit == -1) return;
  if (Data.getGameVars().scores[0] >= Data.getRules().scoreLimit)
    endGame(0);
  else if (Data.getGameVars().scores[1] >= Data.getRules().scoreLimit)
    endGame(1);
};
const countNeighbors = (y, x) => {
  let count = [0, 0];
  let cell;
  let ymin = (y === 0) ? y : y - 1;
  let xmin = (x === 0) ? x : x - 1;
  let ymax = (y === Data.getRules().boardSize - 1) ? y : y + 1;
  let xmax = (x === Data.getRules().boardSize - 1) ? x : x + 1;
  for (let yc = ymin; yc < ymax + 1; yc++) {
    for (let xc = xmin; xc < xmax + 1; xc++) {
      cell = Data.getGameVars().data[yc][xc];
      if (cell != 0)
        count[cell - 1] += 1;
    }
  }
  cell = Data.getGameVars().data[y][x];
  if (cell != 0)
    count[cell - 1] -= 1;
  let dominant = count[0] > count[1] ? 1 : 2;
  return [count[0] + count[1], dominant];
};
const updateTimer = () => {
  //update the timer of the id of the user who is playing now
  Data.getGameVars().timerTimeout = setTimeout(() => {
    let activePlayer = (Render.domObjs.playerSwitch.checked) ? 1 : 0;
    let gv = Data.getGameVars();
    let s = --gv.timers[activePlayer];
    Data.setGameVars(gv);
    Render.renderTimers();
    checkTimerEnd();
    if (Data.getGameVars().inProgress)
      updateTimer();
  }, 1000); // every second
};
const stopTimers = () => {
  clearTimeout(Data.getGameVars().timerTimeout);
};
const checkTimerEnd = () => {
  Data.getGameVars().timers.forEach((s, i) => {
    if (s === 0) endGame(Math.abs(1-i));
  });
};
const updateScores = () => {
  let cellCounts = [0, 0];
  Data.getGameVars().data.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell != 0)
        cellCounts[cell - 1] += 1;
    });
  });
  let winner = (cellCounts[0] > cellCounts[1]) ? 0 : 1;
  let gv = Data.getGameVars();
  gv.scores[winner] += Math.abs(cellCounts[0] - cellCounts[1]);
  Data.setGameVars(gv);
  Render.renderScores();
};
const updatePieces = () => {
  if (Data.getRules().startingPieceCount == -1) return;
  let gv = Data.getGameVars();
  if (Data.getGameVars().piecesAvail[0] < Data.getRules().maxPieceCount)
    gv.piecesAvail[0]++;
  if (Data.getGameVars().piecesAvail[1] < Data.getRules().maxPieceCount)
    gv.piecesAvail[1]++;
  Data.setGameVars(gv);
};
const manualToggleCell = (cellNum, playerId) => {
  if (!Data.getGameVars().inProgress ||
  (Data.getGameVars().round !== Data.getGameVars().selectedRound) ||
	(Data.getGameVars().mode === 'gt_online' && Data.getGameVars().playerId != playerId-1)) {
		return;
  }
  toggleCell(cellNum, playerId);
}
const toggleCell = (cellNum, playerId) => {
  //this.roundToggledCells = [];
  let cy = Math.floor(cellNum / Data.getRules().boardSize);
  //console.log(`${cy} ${num%this.boardSize}`);
  let gv = Data.getGameVars();
  if (gv.data[cy][cellNum % Data.getRules().boardSize] == 0 && gv.piecesAvail[playerId - 1] != 0) {
    // fill empty square
    gv.data[cy][cellNum % Data.getRules().boardSize] = playerId;
    $(`cell-${cellNum}`).className = `cell p${playerId}Cell`
    gv.piecesAvail[playerId - 1]--;
    gv.roundToggledCells.push(cellNum);
  } else if (Data.getGameVars().data[cy][cellNum % Data.getRules().boardSize] == playerId && Data.getGameVars().roundToggledCells.includes(cellNum)) {
    // empty filled square
    gv.data[cy][cellNum % Data.getRules().boardSize] = 0;
    $(`cell-${cellNum}`).className = 'cell';
    gv.piecesAvail[playerId - 1]++;
    // remove num from roundToggledCells, not sure if this is the best way to do this
    gv.roundToggledCells = Data.getGameVars().roundToggledCells.filter((val) => {
      return val != cellNum;
    });
  }
  Data.setGameVars(gv);
  Render.renderPieces();
};
const endGame = (winner) => {
  Data.setGameVars({'inProgress': false, 'winner': winner})
  stopTimers();
  // Should not use $
  $('winnerMessage').style.display = 'block';
  $('winnerMessage').innerHTML = `Player ${winner+1} wins!`;
  $('local2pButtons').style.display = 'none';
  $('newGame2pButton').style.display = 'block';
};

const setGameMode = (mode) => {
	Data.setGameVars({ mode });
  if (mode === 'gt_online' || mode === 'gt_local') {
    // Remove player groups
    $('underBoardLower').style.display = "flex";
    $('p2PiecesAvail').style.display = "flex";
    $('p1PiecesAvail').style.display = "flex";
    // Switch buttons sets
    $('local2pButtons').style.display = 'flex';
    $('soloButtons').style.display = 'none';
    if (mode === 'gt_local') {
      Data.setRules(local2pConfig);
    } else {
      Data.setRules({});
    }
  } else if (mode === 'gt_solo'){
    // Remove player groups
    $('underBoardLower').style.display = "none";
    $('p2PiecesAvail').style.display = "none";
    $('p1PiecesAvail').style.display = "none";
    // Switch buttons sets
    $('local2pButtons').style.display = 'none';
    $('soloButtons').style.display = 'flex';
    // Set player to player 1
    Render.domObjs.playerSwitch.checked = false;
    // Later: Remove timer
    Data.setRules(soloConfig);
  } else {
    console.log("Game mode not recognized");
  }
};

const toggleCells = (move) => {
  let playerId = (Render.domObjs.playerSwitch.checked) ? 2 : 1;
  let tempPlayerId = Data.getGameVars().playerId;
  Data.setGameVars({"playerId": playerId-1})
  move.forEach((cellNum) => {
    toggleCell(cellNum, playerId);
  });
  Data.setGameVars({"playerId": tempPlayerId})
}

const runMove = (move) => {
  toggleCells(move);
	runRound();
};

const runMoves = (moves) => {
  let tempProgress = Data.getGameVars().inProgress;
  Data.setGameVars({'inProgress': true});
	moves.forEach((move) => {
		runMove(move);
	});
  Data.setGameVars({'inProgress': tempProgress});
};

const pushMove = (move=Data.getGameVars().roundToggledCells) => {
  moves = Data.getGameVars().moves;
  moves.push(move);
  Data.setGameVars({moves, selectedRound: moves.length});
}

module.exports = {
  toggleCell,
  manualToggleCell,
  runRound,
  clearBoard,
  resetGame,
  stopAutoGame,
  runAutoGame,
  setGameMode,
  createEmptyData,
  updateTimer,
  toggleCells,
  runMove,
  runMoves,
  pushMove,
  endGame
}
