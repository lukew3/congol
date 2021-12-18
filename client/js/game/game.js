const { getRules, getGameVars, updateRules, updateGameVars } = require("./data.js");
const { local2pConfig, soloConfig } = require("./config.js");
const { domObjs, initBoard, renderBoard, renderScores, renderRound, renderPieces, renderTimers } = require("./rendering.js");

//rules and gameVars are separated so that rules can be modifiable in its entirety while gameVars cannot
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
const resetBoard = () => {
  stopGame();
  updateGameVars({"data": createEmptyData()});
  renderBoard();
  updateGameVars({"round": 0});
  renderRound();
  updateGameVars({"scores": [0, 0]});
  renderScores();
  updateGameVars({"piecesAvail": [getRules().startingPieceCount, getRules().startingPieceCount]});
  updateGameVars({"timers": [getRules().startingTime, getRules().startingTime]});
  renderPieces();
  updateGameVars({"gameOver": false});
  renderTimers();
  stopTimers();
  updateTimer();
  domObjs.playerSwitch.checked = false;
}
const stopGame = () => {
  // for each to in roundTimeouts, clear timeout
  getGameVars().roundTimeouts.forEach((id) => {
    clearTimeout(id);
  });
  updateGameVars({"running": false});
}
const runGame = () => {
  for (let r = 0; r < getRules().totalRounds; r++) {
    getGameVars().roundTimeouts.push(
      setTimeout(() => {
        runRound();
      }, r * getRules().roundTime)
    );
  }
  updateGameVars({"running": true});
}
const runRound = () => {
  let startTime = performance.now();
  let nvalues, n, dominant;
  updateGameVars({"gameVars": getGameVars().round + 1});
  let newData = createEmptyData();
  getGameVars().data.forEach((row, y) => {
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
  updateGameVars({"data": newData});
  renderBoard();
  updateScores();
  renderScores();
  updatePieces();
  renderPieces();
  renderRound();
  //console.log(`Round ran in ${performance.now()-startTime} milliseconds`);
  checkScoreLimit();
  updateGameVars({"roundToggledCells": []});
}
const checkScoreLimit = () => {
  if (getRules().scoreLimit == -1) return;
  if (getGameVars().scores[0] >= getRules().scoreLimit)
    endGame(0);
  else if (getGameVars().scores[1] >= getRules().scoreLimit)
    endGame(1);
}
const countNeighbors = (y, x) => {
  let count = [0, 0];
  let cell;
  let ymin = (y === 0) ? y : y - 1;
  let xmin = (x === 0) ? x : x - 1;
  let ymax = (y === getRules().boardSize - 1) ? y : y + 1;
  let xmax = (x === getRules().boardSize - 1) ? x : x + 1;
  for (let yc = ymin; yc < ymax + 1; yc++) {
    for (let xc = xmin; xc < xmax + 1; xc++) {
      cell = getGameVars().data[yc][xc];
      if (cell != 0)
        count[cell - 1] += 1;
    }
  }
  cell = getGameVars().data[y][x];
  if (cell != 0)
    count[cell - 1] -= 1;
  let dominant = count[0] > count[1] ? 1 : 2;
  return [count[0] + count[1], dominant];
}
const updateTimer = () => {
  //update the timer of the id of the user who is playing now
  getGameVars().timerTimeout = setTimeout(() => {
    let activePlayer = (domObjs.playerSwitch.checked) ? 1 : 0;
    let s = --gameVars.timers[activePlayer];
    domObjs.timers[activePlayer].innerHTML = `${Math.floor(s/60)}:${pad2(s%60)}`;
    checkTimerEnd();
    if (!getGameVars().gameOver)
      updateTimer();
  }, 1000); // every second
}
const stopTimers = () => {
  clearTimeout(getGameVars().timerTimeout);
}
const pad2 = (num) => {
  return (num < 10 ? '0' : '') + num;
}
const checkTimerEnd = () => {
  getGameVars().timers.forEach((s, i) => {
    if (s === 0) endGame(Math.abs(1-i));
  });
}
const updateScores = () => {
  let cellCounts = [0, 0];
  getGameVars().data.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell != 0)
        cellCounts[cell - 1] += 1;
    });
  });
  let winner = (cellCounts[0] > cellCounts[1]) ? 0 : 1;
  gameVars.scores[winner] += Math.abs(cellCounts[0] - cellCounts[1]);
  renderScores();
}
const updatePieces = () => {
  if (getRules().startingPieceCount == -1) return;
  if (getGameVars().piecesAvail[0] < getRules().maxPieceCount)
    gameVars.piecesAvail[0]++;
  if (getGameVars().piecesAvail[1] < getRules().maxPieceCount)
    gameVars.piecesAvail[1]++;
}
const toggleCell = (cellObj, playerId) => {
  //this.roundToggledCells = [];
  // Lol I don't know regex
  let num = -Number(cellObj.id.match(/\-[0-9a-z]+$/i)[0]);
  let cy = Math.floor(num / getRules().boardSize);
  //console.log(`${cy} ${num%this.boardSize}`);
  if (getGameVars().data[cy][num % getRules().boardSize] == 0 && getGameVars().piecesAvail[playerId - 1] != 0) {
    // fill empty square
    gameVars.data[cy][num % getRules().boardSize] = playerId;
    cellObj.style.backgroundColor = getRules().colors[playerId];
    gameVars.piecesAvail[playerId - 1]--;
    gameVars.roundToggledCells.push(num);
  } else if (getGameVars().data[cy][num % getRules().boardSize] == playerId && getGameVars().roundToggledCells.includes(num)) {
    // empty filled square
    gameVars.data[cy][num % getRules().boardSize] = 0;
    cellObj.style.backgroundColor = getRules().colors[0];
    gameVars.piecesAvail[playerId - 1]++;
    // remove num from roundToggledCells, not sure if this is the best way to do this
    gameVars.roundToggledCells = getGameVars().roundToggledCells.filter((val) => {
      return val != num;
    });
  }
  renderPieces();
}
const endGame = (winner) => {
  gameVars.gameOver = true;
  stopTimers();
  // Should not use document.getElementById
  document.getElementById('winnerMessage').style.display = 'block';
  // Set this to the actual winner of the game
  document.getElementById('winnerMessage').innerHTML = `Player ${winner+1} wins!`;
  document.getElementById('submitMoveButton').style.display = 'none';
  document.getElementById('resetGame2pButton').style.display = 'block';
}
const isRunning = () => {
  return getGameVars().running;
}
const setGameMode = (mode) => {
        switch(mode) {
                case 'gt_online':
			// Restrict user to only use one color
			// Should the user always have the right or left player?
			updateRules({});
                        break;
                case 'gt_local':
			// Remove player groups
			document.getElementById('underBoardLower').style.display = "flex";
			document.getElementById('p2PiecesAvail').style.display = "flex";
			document.getElementById('p1PiecesAvail').style.display = "flex";
			// Switch buttons sets
			document.getElementById('local2pButtons').style.display = 'flex';
			document.getElementById('soloButtons').style.display = 'none';
			updateRules(local2pConfig);
                        break;
		case 'gt_solo':
			// Remove player groups
			document.getElementById('underBoardLower').style.display = "none";
			document.getElementById('p2PiecesAvail').style.display = "none";
			document.getElementById('p1PiecesAvail').style.display = "none";
			// Switch buttons sets
			document.getElementById('local2pButtons').style.display = 'none';
			document.getElementById('soloButtons').style.display = 'flex';
			// Set player to player 1
			domObjs.playerSwitch.checked = false;
			// Later: Remove timer
			updateRules(soloConfig);
                        break;
                default:
                        console.log*("Game mode not recognized");
        }
};


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
  if (getRules().speciesCount === 2)
    domObjs.playerSwitch.checked = !domObjs.playerSwitch.checked;
  runRound();
});

document.getElementById('resetGame2pButton').addEventListener('click', (e) => {
	resetBoard();
	document.getElementById('submitMoveButton').style.display = 'block';
	document.getElementById('resetGame2pButton').style.display = 'none';
	document.getElementById('winnerMessage').style.display = 'none';
});
document.getElementById('resetGameButton').addEventListener('click', (e) => {
	resetBoard();
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
updateRules(initBoard());


module.exports = {
	updateRules,
	setGameMode
}
