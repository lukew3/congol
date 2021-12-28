const Data = require('./data.js');
const Render = require('./rendering.js');
const GameCore = require('./gameCore.js');

// Event listeners
document.addEventListener('click', (e) => {
  let element = e.target;
  let playerId;
  if (Render.domObjs.playerSwitch == undefined)
    playerId = 1;
  else
    playerId = (Render.domObjs.playerSwitch.checked) ? 2 : 1;
  if (element.className === "cell") {
	  let num = -Number(element.id.match(/\-[0-9a-z]+$/i)[0]);
    GameCore.toggleCell(num, playerId);
  };
});

document.getElementById('submitMoveButton').addEventListener('click', (e) => {
  if (Data.getGameVars().mode === 'gt_online') {
    if (Data.getGameVars().playerId !== ((Render.domObjs.playerSwitch.checked) ? 1 : 0)) {
      return;
    } else {
      GameCore.sendMove();
    }
  } else {
    GameCore.runRound();
  }
});

document.getElementById('resetGame2pButton').addEventListener('click', (e) => {
	GameCore.resetBoard();
	document.getElementById('submitMoveButton').style.display = 'block';
	document.getElementById('resetGame2pButton').style.display = 'none';
	document.getElementById('winnerMessage').style.display = 'none';
});

document.getElementById('resetGameButton').addEventListener('click', (e) => {
	GameCore.resetBoard();
});

// 2pPlayground Buttons
document.getElementById('startStopButton').addEventListener('click', (e) => {
  if (Data.getGameVars().running) {
    GameCore.stopGame();
    document.getElementById('startStopButton').innerHTML = "Start";
  } else {
    GameCore.runGame();
    document.getElementById('startStopButton').innerHTML = "Stop";
  }
});

document.getElementById('nextButton').addEventListener('click', (e) => {
  GameCore.runRound();
});

/*
document.getElementById('resetButton').addEventListener('click', (e) => {
  resetBoard();
  document.getElementById('startStopButton').innerHTML = "Start";
});
*/

// Stuff that runs on load
Data.updateGameVars({"data": GameCore.createEmptyData()})
Render.initBoard();
// Handling if the game is online or not
if (window.location.pathname.substring(0, 6) === '/game/') {
  GameCore.setGameMode('gt_online');
  Data.updateRules({"boardSize": 15, "speciesCount": 2});
	GameCore.resetBoard();
	GameCore.requestGame();
} else {
	Data.updateGameVars({"inProgress": true})
	GameCore.setGameMode('gt_local');
}

module.exports = {
}
