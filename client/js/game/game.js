const Data = require('./data.js');
const Render = require('./rendering.js');
const GameCore = require('./gameCore.js');
const OnlineGame = require('./onlineGame.js');
const RoundControl = require('./roundControl.js');

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

$('submitMoveButton').addEventListener('click', (e) => {
  if (Data.getGameVars().mode === 'gt_online') {
    if (Data.getGameVars().playerId !== ((Render.domObjs.playerSwitch.checked) ? 1 : 0)) {
      return;
    } else {
      OnlineGame.sendMove();
    }
  } else {
    GameCore.runRound();
  }
});

$('newGame2pButton').addEventListener('click', (e) => {
  GameCore.resetBoard();
  if (Data.getGameVars().mode === 'gt_online') {
    OnlineGame.requestGame(-1);
  }
	$('submitMoveButton').style.display = 'block';
	$('newGame2pButton').style.display = 'none';
	$('winnerMessage').style.display = 'none';
});

$('resetGameButton').addEventListener('click', (e) => {
	GameCore.resetBoard();
});

// 2pPlayground Buttons
$('startStopButton').addEventListener('click', (e) => {
  if (Data.getGameVars().running) {
    GameCore.stopGame();
    $('startStopButton').innerHTML = "Start";
  } else {
    GameCore.runGame();
    $('startStopButton').innerHTML = "Stop";
  }
});

$('nextButton').addEventListener('click', (e) => {
  GameCore.runRound();
});


// Stuff that runs on load
Data.updateGameVars({"data": GameCore.createEmptyData()})
Render.initBoard();
// Handling if the game is online or not
if (window.location.pathname.substring(0, 6) === '/game/') {
  GameCore.setGameMode('gt_online');
  Data.updateRules({"boardSize": 15, "speciesCount": 2});
	GameCore.resetBoard();
	OnlineGame.requestGame();
} else {
	Data.updateGameVars({"inProgress": true})
	GameCore.setGameMode('gt_local');
}
