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
    GameCore.manualToggleCell(num, playerId);
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
    GameCore.pushMove();
    GameCore.runRound();
  }
});

$('newGame2pButton').addEventListener('click', (e) => {
  GameCore.resetGame();
  Data.setGameVars({'moves': []});
  if (Data.getGameVars().mode === 'gt_online') {
    OnlineGame.requestGame(-1);
  }
	$('submitMoveButton').style.display = 'block';
	$('newGame2pButton').style.display = 'none';
	$('winnerMessage').style.display = 'none';
});

$('resetGameButton').addEventListener('click', (e) => {
	GameCore.resetGame();
  Data.setGameVars({'moves': []});
});

// 2pPlayground Buttons
$('startStopButton').addEventListener('click', (e) => {
  if (Data.getGameVars().running) {
    GameCore.stopAutoGame();
    $('startStopButton').innerHTML = "Start";
  } else {
    GameCore.runAutoGame();
    $('startStopButton').innerHTML = "Stop";
  }
});

$('nextButton').addEventListener('click', (e) => {
  GameCore.pushMove();
  GameCore.runRound();
});


// Stuff that runs on load
Data.setGameVars({"data": GameCore.createEmptyData()})
Render.initBoard();
// Handling if the game is online or not
if (window.location.pathname.substring(0, 6) === '/game/') {
  GameCore.setGameMode('gt_online');
  Data.setRules({"boardSize": 15, "speciesCount": 2});
	GameCore.resetGame();
	OnlineGame.requestGame();
} else if (window.location.pathname === '/soloGame') {
  Data.setGameVars({"inProgress": true});
  GameCore.setGameMode('gt_solo');
  GameCore.resetGame();
} else {
	Data.setGameVars({"inProgress": true})
	GameCore.setGameMode('gt_local');
}
