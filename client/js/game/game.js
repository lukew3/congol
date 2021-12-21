const Data = require("./data.js");
const Render = require("./rendering.js");
const { local2pConfig, soloConfig } = require("./config.js");
const socket = io();

socket.on('gameUpdate', (data) => {
	handleGameUpdate(data);
});

socket.on('setPlayerId', (playerId) => {
	console.log("setting player id: " + playerId);
	Data.updateGameVars({ playerId });
	document.getElementById(`p1Username`).innerHTML = "Anonymous";
	document.getElementById(`p2Username`).innerHTML = "Anonymous";
	if (playerId == -1) return;
	document.getElementById(`p${playerId+1}Username`).innerHTML = "Me";
})

const sendMove = () => {
	socket.emit('playerMove', {
		'data': Data.getGameVars().data,
		'piecesAvail': Data.getGameVars().piecesAvail,
		'scores': Data.getGameVars().scores
	});
}

const handleGameUpdate = (sdata) => {
	//if (Data.getGameVars().mode !== 'gt_online') return;
	Data.updateGameVars(sdata);
	Render.domObjs.playerSwitch.checked = sdata.switchPos;
	Render.renderAll();
}

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
}
const resetBoard = () => {
  stopGame();
  Data.updateGameVars({"data": createEmptyData(),
											 "round": 0,
											 "scores": [0, 0],
											 "piecesAvail": [Data.getRules().startingPieceCount, Data.getRules().startingPieceCount],
											 "timers": [Data.getRules().startingTime, Data.getRules().startingTime],
											 "gameOver": false
										 });
	Render.renderAll();
  Render.renderTimers();
  stopTimers();
  updateTimer();
  Render.domObjs.playerSwitch.checked = false;
}
const stopGame = () => {
  // for each to in roundTimeouts, clear timeout
  Data.getGameVars().roundTimeouts.forEach((id) => {
    clearTimeout(id);
  });
  Data.updateGameVars({"running": false});
}
const runGame = () => {
  for (let r = 0; r < Data.getRules().totalRounds; r++) {
    Data.getGameVars().roundTimeouts.push(
      setTimeout(() => {
        runRound();
      }, r * Data.getRules().roundTime)
    );
  }
  Data.updateGameVars({"running": true});
}
const runRound = () => {
  let startTime = performance.now();
  let nvalues, n, dominant;
  Data.updateGameVars({"round": Data.getGameVars().round + 1});
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
  Data.updateGameVars({"data": newData});
  updateScores();
  updatePieces();
	Render.renderAll();
  //console.log(`Round ran in ${performance.now()-startTime} milliseconds`);
  checkScoreLimit();
  Data.updateGameVars({"roundToggledCells": []});
	if (Data.getRules().speciesCount === 2) {
		Render.domObjs.playerSwitch.checked = !Render.domObjs.playerSwitch.checked;
	}
	if (Data.getGameVars().mode === 'gt_online')
		sendMove();
}
const checkScoreLimit = () => {
  if (Data.getRules().scoreLimit == -1) return;
  if (Data.getGameVars().scores[0] >= Data.getRules().scoreLimit)
    endGame(0);
  else if (Data.getGameVars().scores[1] >= Data.getRules().scoreLimit)
    endGame(1);
}
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
}
const updateTimer = () => {
  //update the timer of the id of the user who is playing now
  Data.getGameVars().timerTimeout = setTimeout(() => {
    let activePlayer = (Render.domObjs.playerSwitch.checked) ? 1 : 0;
    let gv = Data.getGameVars();
    let s = --gv.timers[activePlayer];
    Data.updateGameVars(gv);
    Render.domObjs.timers[activePlayer].innerHTML = `${Math.floor(s/60)}:${pad2(s%60)}`;
    checkTimerEnd();
    if (!Data.getGameVars().gameOver)
      updateTimer();
  }, 1000); // every second
}
const stopTimers = () => {
  clearTimeout(Data.getGameVars().timerTimeout);
}
const pad2 = (num) => {
  return (num < 10 ? '0' : '') + num;
}
const checkTimerEnd = () => {
  Data.getGameVars().timers.forEach((s, i) => {
    if (s === 0) endGame(Math.abs(1-i));
  });
}
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
  Data.updateGameVars(gv);
  Render.renderScores();
}
const updatePieces = () => {
  if (Data.getRules().startingPieceCount == -1) return;
  let gv = Data.getGameVars();
  if (Data.getGameVars().piecesAvail[0] < Data.getRules().maxPieceCount)
    gv.piecesAvail[0]++;
  if (Data.getGameVars().piecesAvail[1] < Data.getRules().maxPieceCount)
    gv.piecesAvail[1]++;
  Data.updateGameVars(gv);
}
const toggleCell = (cellObj, playerId) => {
	if (Data.getGameVars().mode === 'gt_online' && Data.getGameVars().playerId != playerId-1)
		return;
  //this.roundToggledCells = [];
  // Lol I don't know regex
  let num = -Number(cellObj.id.match(/\-[0-9a-z]+$/i)[0]);
  let cy = Math.floor(num / Data.getRules().boardSize);
  //console.log(`${cy} ${num%this.boardSize}`);
  let gv = Data.getGameVars();
  if (gv.data[cy][num % Data.getRules().boardSize] == 0 && gv.piecesAvail[playerId - 1] != 0) {
    // fill empty square
    gv.data[cy][num % Data.getRules().boardSize] = playerId;
    cellObj.style.backgroundColor = Data.getRules().colors[playerId];
    gv.piecesAvail[playerId - 1]--;
    gv.roundToggledCells.push(num);
  } else if (Data.getGameVars().data[cy][num % Data.getRules().boardSize] == playerId && Data.getGameVars().roundToggledCells.includes(num)) {
    // empty filled square
    gv.data[cy][num % Data.getRules().boardSize] = 0;
    cellObj.style.backgroundColor = Data.getRules().colors[0];
    gv.piecesAvail[playerId - 1]++;
    // remove num from roundToggledCells, not sure if this is the best way to do this
    gv.roundToggledCells = Data.getGameVars().roundToggledCells.filter((val) => {
      return val != num;
    });
  }
  Data.updateGameVars(gv);
  Render.renderPieces();
}
const endGame = (winner) => {
  Data.updateGameVars({"gameOver": true})
  stopTimers();
  // Should not use document.getElementById
  document.getElementById('winnerMessage').style.display = 'block';
  // Set this to the actual winner of the game
  document.getElementById('winnerMessage').innerHTML = `Player ${winner+1} wins!`;
  document.getElementById('submitMoveButton').style.display = 'none';
  document.getElementById('resetGame2pButton').style.display = 'block';
}
const isRunning = () => {
  return Data.getGameVars().running;
}
const setGameMode = (mode) => {
	Data.updateGameVars({ mode });
	switch(mode) {
  	case 'gt_online':
			// Restrict user to only use one color
			// Should the user always have the right or left player?
			Data.updateRules({});
      break;
  	case 'gt_local':
			// Remove player groups
			document.getElementById('underBoardLower').style.display = "flex";
			document.getElementById('p2PiecesAvail').style.display = "flex";
			document.getElementById('p1PiecesAvail').style.display = "flex";
			// Switch buttons sets
			document.getElementById('local2pButtons').style.display = 'flex';
			document.getElementById('soloButtons').style.display = 'none';
			Data.updateRules(local2pConfig);
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
			Render.domObjs.playerSwitch.checked = false;
			// Later: Remove timer
			Data.updateRules(soloConfig);
      break;
    default:
      console.log*("Game mode not recognized");
  }
};


// Event listeners
document.addEventListener('click', (e) => {
  let element = e.target;
  let playerId;
  if (Render.domObjs.playerSwitch == undefined)
    playerId = 1;
  else
    playerId = (Render.domObjs.playerSwitch.checked) ? 2 : 1;
  if (element.className === "cell") {
    toggleCell(element, playerId);
  };
});

document.getElementById('submitMoveButton').addEventListener('click', (e) => {
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

/*
document.getElementById('resetButton').addEventListener('click', (e) => {
  resetBoard();
  document.getElementById('startStopButton').innerHTML = "Start";
});
*/

// Stuff that runs on load
Data.updateGameVars({"data": createEmptyData()})
Render.initBoard();


module.exports = {
	setGameMode,
  resetBoard
}
